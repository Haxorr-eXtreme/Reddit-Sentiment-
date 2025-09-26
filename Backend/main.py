from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import BertTokenizer, BertForSequenceClassification
import pandas as pd
import praw
import snscrape.modules.twitter as sntwitter
from typing import List, Optional
import json
import numpy as np
import os
from pathlib import Path

app = FastAPI(title="Sentiment Analysis API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model setup
MODEL_PATH = Path(__file__).parent.parent / 'sentiment-model'
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Global variables for model and tokenizer
model = None
tokenizer = None

def load_model():
    global model, tokenizer
    try:
        if not MODEL_PATH.exists():
            raise Exception(f"Model directory not found at {MODEL_PATH}")
            
        tokenizer = BertTokenizer.from_pretrained(str(MODEL_PATH), use_fast=True)
        model = BertForSequenceClassification.from_pretrained(
            str(MODEL_PATH),
            trust_remote_code=False,
        )
        model.eval()
        model.to(device)
        print(f"Model loaded successfully on device: {device}")
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

# Load model on startup
@app.on_event("startup")
async def startup_event():
    load_model()

# Reddit API configuration
reddit = praw.Reddit(
    client_id="rCH0lxtLd8gqBP-P1TpZZg",
    client_secret="8GFwdyeCA26YTuqb4eNNsaSrVVjjRQ",
    user_agent="fyp_sentiment_app by u/No_Drama5439"
)

class TextRequest(BaseModel):
    text: str

@app.get("/")
async def root():
    return {
        "message": "Sentiment Analysis API is running",
        "model_status": "loaded" if model is not None else "not loaded",
        "device": str(device),
        "endpoints": {
            "/predict": "POST - Analyze sentiment of text",
            "/reddit/{query}": "GET - Analyze Reddit posts",
            "/docs": "GET - API documentation"
        }
    }

@app.post("/predict")
async def predict_sentiment(request: TextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        inputs = tokenizer(request.text, return_tensors='pt', truncation=True, padding=True, max_length=128)
        inputs = {key: val.to(device) for key, val in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1).cpu().numpy()[0]
            predicted_class = np.argmax(probabilities)
            
        return {
            "sentiment": int(predicted_class),
            "probabilities": probabilities.tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-batch")
async def analyze_batch(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(contents))
        
        if 'text' not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain a 'text' column")
        
        results = []
        for text in df['text']:
            sentiment, probabilities = predict_sentiment(TextRequest(text=str(text)))
            results.append({
                "text": text,
                "sentiment": sentiment,
                "probabilities": probabilities
            })
        
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reddit/{query}")
async def analyze_reddit(query: str, limit: int = 30):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        posts = []
        print(f"Searching Reddit for query: {query}")  # Debug log
        
        # Search across all subreddits
        subreddit = reddit.subreddit("all")
        search_results = subreddit.search(query, sort='relevance', limit=limit)
        
        for post in search_results:
            try:
                print(f"Processing post: {post.title[:50]}...")  # Debug log
                sentiment_result = await predict_sentiment(TextRequest(text=post.title))
                
                posts.append({
                    "title": post.title,
                    "url": post.url,
                    "score": post.score,
                    "subreddit": str(post.subreddit),
                    "sentiment": sentiment_result["sentiment"],
                    "probabilities": sentiment_result["probabilities"]
                })
            except Exception as post_error:
                print(f"Error processing post: {str(post_error)}")
                continue
        
        if not posts:
            print(f"No posts found for query: {query}")  # Debug log
            return {"results": [], "message": f"No Reddit posts found for: {query}"}
            
        print(f"Successfully analyzed {len(posts)} posts")  # Debug log
        return {"results": posts}
    except Exception as e:
        error_msg = str(e)
        print(f"Reddit API error: {error_msg}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to analyze Reddit posts",
                "message": error_msg,
                "query": query
            }
        )

@app.get("/api/twitter/{query}")
async def analyze_twitter(query: str, limit: int = 30):
    try:
        tweets = []
        scraper = sntwitter.TwitterSearchScraper(query)
        
        for i, tweet in enumerate(scraper.get_items()):
            if i >= limit:
                break
                
            sentiment, probabilities = predict_sentiment(TextRequest(text=tweet.content))
            tweets.append({
                "text": tweet.content,
                "sentiment": sentiment,
                "probabilities": probabilities
            })
        
        return {"results": tweets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://localhost:8000")
    uvicorn.run(app, host="localhost", port=8000, log_level="info")
