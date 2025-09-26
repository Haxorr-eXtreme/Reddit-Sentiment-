from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import torch
from transformers import BertTokenizer, BertForSequenceClassification
import numpy as np
import praw
import subprocess
import json
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import quote
from datetime import datetime, timedelta
import base64

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load model and tokenizer
model_path = 'sentiment-model'
tokenizer = BertTokenizer.from_pretrained(model_path, use_fast=True)
model = BertForSequenceClassification.from_pretrained(
    model_path,
    trust_remote_code=False,
)
model.eval()

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Label dictionary
label_dict = {0: 'Negative', 1: 'Neutral', 2: 'Positive', 3: 'Irrelevant'}

# Reddit credentials
REDDIT_CLIENT_ID = "rCH0lxtLd8gqBP-P1TpZZg"
REDDIT_CLIENT_SECRET = "8GFwdyeCA26YTuqb4eNNsaSrVVjjRQ"
REDDIT_USER_AGENT = "fyp_sentiment_app by u/No_Drama5439"

class TextInput(BaseModel):
    text: str

def predict_sentiment(text):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=128)
    inputs = {key: val.to(device) for key, val in inputs.items()}
    model.to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=1).cpu().numpy()[0]
        predicted_class = np.argmax(probabilities)
    return predicted_class, probabilities.tolist()

def fetch_reddit_posts(query, limit=30, subreddit='pakistan'):
    reddit = praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT
    )
    posts = []
    for post in reddit.subreddit(subreddit).search(query, sort='top', limit=limit):
        posts.append({
            'title': post.title,
            'score': post.score,
            'url': post.url
        })
    return posts

def get_twitter_bearer_token():
    # Twitter API v2 credentials
    client_id = "YOUR_CLIENT_ID"  # You'll need to replace this
    client_secret = "YOUR_CLIENT_SECRET"  # You'll need to replace this
    
    # Encode credentials
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    
    # Get bearer token
    auth_url = "https://api.twitter.com/oauth2/token"
    auth_headers = {
        "Authorization": f"Basic {credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    auth_data = {"grant_type": "client_credentials"}
    
    try:
        response = requests.post(auth_url, headers=auth_headers, data=auth_data)
        if response.status_code == 200:
            return response.json()["access_token"]
    except Exception as e:
        print(f"Error getting bearer token: {str(e)}")
        return None

def fetch_twitter_posts(query, limit=30):
    bearer_token = get_twitter_bearer_token()
    if not bearer_token:
        raise HTTPException(
            status_code=500,
            detail="Failed to authenticate with Twitter API"
        )
    
    # Search tweets using Twitter API v2
    search_url = "https://api.twitter.com/2/tweets/search/recent"
    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "Content-Type": "application/json"
    }
    
    # Set up parameters for the search
    params = {
        "query": query,
        "max_results": min(limit, 100),  # Twitter API v2 has a max of 100 tweets per request
        "tweet.fields": "created_at,lang",
        "lang": "en"  # Only English tweets
    }
    
    try:
        response = requests.get(search_url, headers=headers, params=params)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Twitter API error: {response.text}"
            )
        
        data = response.json()
        if "data" not in data:
            return []
            
        tweets = []
        for tweet in data["data"]:
            if "text" in tweet:
                tweets.append(tweet["text"])
                if len(tweets) >= limit:
                    break
                    
        return tweets
        
    except Exception as e:
        print(f"Error fetching tweets: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch tweets from Twitter API"
        )

@app.post("/predict")
async def analyze_sentiment(input_data: TextInput):
    try:
        sentiment, probabilities = predict_sentiment(input_data.text)
        return {
            "sentiment": int(sentiment),
            "probabilities": probabilities
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reddit/{query}")
async def analyze_reddit(query: str, limit: int = 30):
    try:
        posts = fetch_reddit_posts(query, limit=limit)
        results = []
        for post in posts:
            sentiment, probabilities = predict_sentiment(post['title'])
            results.append({
                **post,
                'sentiment': int(sentiment)
            })
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/twitter/{query}")
async def analyze_twitter(query: str, limit: int = 30):
    try:
        tweets = fetch_twitter_posts(query, limit=limit)
        if not tweets:
            raise HTTPException(
                status_code=404,
                detail="No tweets found for the given query"
            )
            
        results = []
        for tweet in tweets:
            sentiment, probabilities = predict_sentiment(tweet)
            results.append({
                'text': tweet,
                'sentiment': int(sentiment),
                'probabilities': probabilities
            })
        return {"results": results}
    except Exception as e:
        print(f"Twitter analysis error: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze tweets. Please try again later."
        )

@app.post("/batch")
async def analyze_batch(file: UploadFile = File(...)):
    try:
        # Read the CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        if 'text' not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain a 'text' column")
        
        results = []
        for text in df['text']:
            sentiment, probabilities = predict_sentiment(str(text))
            results.append({
                'text': text,
                'sentiment': int(sentiment)
            })
        
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Sentiment Analysis API is running"}
