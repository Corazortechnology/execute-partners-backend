from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
load_dotenv()
# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI,tlsAllowInvalidCertificates=True)
db = client["execute-partners-database"]
articles_collection = db["articles"]

# Helper to compute engagement score
def compute_engagement(article, weight_likes=1, weight_comments=2, weight_shares=3):
    likes_count = len(article.get("likes", []))
    comments_count = len(article.get("comments", []))
    shares_count = article.get("claps", 0)  # Treat 'claps' as shares if needed
    views_count = article.get("views", 0)
    if views_count > 0:
         engagement_score = (
        weight_likes * likes_count +
        weight_comments * comments_count +
        weight_shares * shares_count +
        4 * views_count
    )
    else:
        engagement_score = (
            weight_likes * likes_count +
            weight_comments * comments_count +
            weight_shares * shares_count
        )
    return engagement_score

# Trending articles route
@app.route("/trending", methods=["GET"])
def get_trending_articles():
    try:
        # Optional: Get weights and number of articles from query parameters
        weight_likes = int(request.args.get("weight_likes", 1))
        weight_comments = int(request.args.get("weight_comments", 2))
        weight_shares = int(request.args.get("weight_shares", 3))
        top_n = int(request.args.get("top_n", 5))

        # Fetch all published articles
        articles = list(articles_collection.find({"isPublished": True}))

        # Add engagement score to each article
        for article in articles:
            article["engagement_score"] = compute_engagement(
                article, weight_likes, weight_comments, weight_shares
            )

        # Sort articles by engagement score
        sorted_articles = sorted(
            articles, key=lambda x: x["engagement_score"], reverse=True
        )

        # Format response
        result = [
            {
                "title": a["title"],
                "slug": a.get("slug"),
                "engagement_score": a["engagement_score"],
                "likes": len(a.get("likes", [])),
                "comments": len(a.get("comments", [])),
                "shares": a.get("claps", 0),
                "views": a.get("views", None)  # Optional
            }
            for a in sorted_articles[:top_n]
        ]

        return jsonify({"trending": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Main
if __name__ == "__main__":
    app.run(host="0.0.0.0",port=8000)
