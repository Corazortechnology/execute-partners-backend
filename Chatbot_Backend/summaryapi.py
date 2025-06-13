from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from llm_service import call_gemini
from dotenv import load_dotenv
import os
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")
# MongoDB setup (adjust URI and db/collection names as needed)
client = MongoClient(MONGO_URI,tlsAllowInvalidCertificates=True)
db = client[DATABASE_NAME]
mycol = db[COLLECTION_NAME]


def get_article_by_id(article_id):
    try:
        print(ObjectId(article_id))
        article = mycol.find_one({"_id": ObjectId(article_id)})
        return article
    except Exception:
        return None
def get_comment_content_by_id(db, comment_id):
    if not isinstance(comment_id, ObjectId):
        try:
            comment_id = ObjectId(comment_id)
        except Exception as e:
            print(f"Invalid comment_id: {e}")
            return None

    article = db.articles.find_one({
        "comments._id": comment_id
    }, {
        "comments.$": 1
    })

    if article and "comments" in article and article["comments"]:
        return article["comments"][0]["content"]
    return None

@app.route("/summarize", methods=["POST","OPTIONS"])
def summarize_article():
    data = request.get_json()
    article_id = data.get("article_id","")
    comment_id = data.get("comment_id","")
    
    article = get_article_by_id(article_id)
    comment = get_comment_content_by_id(db,comment_id)

    # Fetch title and meta description safely
    if article is not None:
        title = article.get("title", "")
        meta_desc = article.get("meta", {}).get("description", "")
    else:
        title = ""
        meta_desc = ""

    summary_meta = call_gemini("summary", context_vars={"text": title + meta_desc}) if meta_desc else ""

    if comment is not None:
        comment_summary = call_gemini("summary", context_vars={"text": comment})
        response = {
            "title": title,
            "article_summary": summary_meta,
            "comment_summary": comment_summary
        }
    else:
        response = {
            "title": title,
            "summary": summary_meta,
        }
    return jsonify(response)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
