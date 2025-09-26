import streamlit as st
import torch
from transformers import BertTokenizer, BertForSequenceClassification
import numpy as np
import pandas as pd
import plotly.express as px
from io import BytesIO
from datetime import datetime
from captum.attr import IntegratedGradients
import matplotlib.pyplot as plt
import matplotlib
import praw
import subprocess
import json

matplotlib.use('Agg')

st.set_page_config(
    page_title="BERT Sentiment Analysis",
    layout="wide",
    initial_sidebar_state="expanded",
)

label_dict = {0: 'Negative', 1: 'Neutral', 2: 'Positive', 3: 'Irrelevant'}

REDDIT_CLIENT_ID = "rCH0lxtLd8gqBP-P1TpZZg"
REDDIT_CLIENT_SECRET = "8GFwdyeCA26YTuqb4eNNsaSrVVjjRQ"
REDDIT_USER_AGENT = "fyp_sentiment_app by u/No_Drama5439"

if 'history' not in st.session_state:
    st.session_state.history = []

@st.cache_resource
def load_model_and_tokenizer(model_path='sentiment-model'):
    tokenizer = BertTokenizer.from_pretrained(model_path, use_fast=True)
    model = BertForSequenceClassification.from_pretrained(
        model_path,
        trust_remote_code=False,
    )
    model.eval()
    return tokenizer, model

def predict_sentiment(text, tokenizer, model, device):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=128)
    inputs = {key: val.to(device) for key, val in inputs.items()}
    model.to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=1).cpu().numpy()[0]
        predicted_class = np.argmax(probabilities)
        predicted_label = label_dict[predicted_class]
    return predicted_label, probabilities

def plot_probabilities(probabilities):
    fig = px.bar(
        x=list(label_dict.values()),
        y=probabilities,
        labels={'x': 'Sentiment', 'y': 'Probability'},
        title='Prediction Confidence',
        color=probabilities,
        color_continuous_scale='Blues'
    )
    fig.update_layout(yaxis=dict(range=[0, 1]), showlegend=False)
    return fig

def plot_sentiment_pie(sentiment_counts):
    labels = list(sentiment_counts.keys())
    values = list(sentiment_counts.values())
    fig = px.pie(
        names=labels,
        values=values,
        title="Sentiment Distribution (%)",
        color_discrete_sequence=px.colors.sequential.RdBu
    )
    return fig

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

def fetch_twitter_posts(query, limit=30):
    tweets = []
    cmd = f'snscrape --jsonl --max-results {limit} twitter-search "{query}"'
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
        for line in result.stdout.splitlines():
            tweet = json.loads(line)
            tweets.append(tweet['content'])
    except Exception as e:
        print("Snscrape error:", e)
    return tweets

def main():
    tokenizer, model = load_model_and_tokenizer()
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    st.markdown("""
        <style>
            .main-title { font-size: 32px; font-weight: bold; margin-bottom: 1rem; }
            .section-header { font-size: 22px; font-weight: 600; margin-top: 2rem; }
        </style>
    """, unsafe_allow_html=True)

    st.markdown("<div class='main-title'>BERT-Based Sentiment Analysis</div>", unsafe_allow_html=True)

    st.sidebar.title("Menu")
    app_mode = st.sidebar.selectbox("Choose mode", ["Single Prediction", "Batch Prediction", "Reddit Search", "Twitter Search", "About"])

    if app_mode == "Single Prediction":
        st.markdown("<div class='section-header'>Single Text Analysis</div>", unsafe_allow_html=True)
        user_input = st.text_area("Input text:", height=150)

        if st.button("Analyze"):
            if user_input.strip():
                with st.spinner("Processing..."):
                    prediction, probs = predict_sentiment(user_input, tokenizer, model, device)
                    st.write(f"**Predicted Sentiment:** {prediction}")
                    fig = plot_probabilities(probs)
                    st.plotly_chart(fig, use_container_width=True)
            else:
                st.warning("Please enter some text.")

    elif app_mode == "Batch Prediction":
        st.markdown("<div class='section-header'>Batch Text Analysis</div>", unsafe_allow_html=True)
        uploaded_file = st.file_uploader("Upload CSV file:", type=["csv"])

        if uploaded_file is not None:
            df_input = pd.read_csv(uploaded_file)
            if 'content' in df_input.columns:
                if st.button("Analyze Batch"):
                    with st.spinner("Analyzing..."):
                        predictions = [predict_sentiment(text, tokenizer, model, device)[0] for text in df_input['content'].astype(str)]
                        df_input['Sentiment'] = predictions
                        st.dataframe(df_input)
            else:
                st.error("CSV must contain a 'content' column.")

    elif app_mode == "Reddit Search":
        st.markdown("<div class='section-header'>Reddit Post Analysis</div>", unsafe_allow_html=True)
        query = st.text_input("Search topic (e.g., Imran Khan):", "")
        limit = st.slider("Number of posts to fetch", 10, 100, 30)

        if st.button("Fetch & Analyze"):
            if query.strip():
                with st.spinner("Fetching Reddit posts..."):
                    reddit_posts = fetch_reddit_posts(query, limit=limit)
                    if reddit_posts:
                        st.write(f"Found {len(reddit_posts)} posts.")
                        results = []
                        sentiment_counts = {'Positive': 0, 'Negative': 0, 'Neutral': 0, 'Irrelevant': 0}

                        for post in reddit_posts:
                            sentiment, _ = predict_sentiment(post['title'], tokenizer, model, device)
                            results.append({**post, 'sentiment': sentiment})
                            sentiment_counts[sentiment] += 1

                        st.write(pd.DataFrame.from_dict(sentiment_counts, orient='index', columns=['Count']))

                        pie_chart = plot_sentiment_pie(sentiment_counts)
                        st.plotly_chart(pie_chart, use_container_width=True)

                        st.markdown("<div class='section-header'>Analyzed Posts</div>", unsafe_allow_html=True)
                        st.dataframe(pd.DataFrame(results)[['title', 'sentiment', 'score']].sort_values(by='score', ascending=False))

                        st.markdown("<div class='section-header'>Top 3 Most Upvoted Posts</div>", unsafe_allow_html=True)
                        top_3 = sorted(results, key=lambda x: x['score'], reverse=True)[:3]
                        for post in top_3:
                            st.write(f"**Score:** {post['score']}")
                            st.write(f"**Sentiment:** {post['sentiment']}")
                            st.write(post['title'])
                            st.markdown(f"[View Post]({post['url']})")
                            st.markdown("---")
                    else:
                        st.info("No posts found.")
            else:
                st.warning("Enter a keyword to search.")

    elif app_mode == "Twitter Search":
        st.markdown("<div class='section-header'>Twitter Post Analysis</div>", unsafe_allow_html=True)
        query = st.text_input("Search topic (e.g., Imran Khan):", "")
        limit = st.slider("Number of tweets to fetch", 10, 100, 30)

        if st.button("Fetch & Analyze Tweets"):
            if query.strip():
                with st.spinner("Fetching Tweets..."):
                    tweets = fetch_twitter_posts(query, limit=limit)
                    if tweets:
                        results = []
                        sentiment_counts = {'Positive': 0, 'Negative': 0, 'Neutral': 0, 'Irrelevant': 0}

                        for tweet in tweets:
                            sentiment, _ = predict_sentiment(tweet, tokenizer, model, device)
                            results.append({"tweet": tweet, "sentiment": sentiment})
                            sentiment_counts[sentiment] += 1

                        st.write(pd.DataFrame.from_dict(sentiment_counts, orient='index', columns=['Count']))

                        pie_chart = plot_sentiment_pie(sentiment_counts)
                        st.plotly_chart(pie_chart, use_container_width=True)

                        st.markdown("<div class='section-header'>Analyzed Tweets</div>", unsafe_allow_html=True)
                        st.dataframe(pd.DataFrame(results))
                    else:
                        st.info("No tweets found.")
            else:
                st.warning("Enter a keyword to search.")

    elif app_mode == "About":
        st.markdown("<div class='section-header'>About</div>", unsafe_allow_html=True)
        st.markdown("""
        This web application uses a fine-tuned BERT model to classify text sentiment as Positive, Negative, Neutral, or Irrelevant.
        It supports custom text input, CSV batch uploads, and real-time Reddit and Twitter topic analysis.
        """)

if __name__ == "__main__":
    main()
