# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from pymongo import MongoClient
# from bson import ObjectId
# from llm_service import call_gemini
# from dotenv import load_dotenv
# import os
# from datetime import timedelta
# app = Flask(__name__)
# # CORS(app, 
# #      supports_credentials=True,
# #      origins="*",
# #      allow_headers=["Content-Type", "Authorization"],
# #      methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
# #      max_age=timedelta(days=1))
# CORS(app, 
#      supports_credentials=True,
#      resources={r"/*": {"origins": "*"}},
#      allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
#      methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#      expose_headers=["Content-Type", "Authorization"])

# load_dotenv()

# MONGO_URI = os.getenv("MONGO_URI")
# DATABASE_NAME = os.getenv("DATABASE_NAME")
# COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# # MongoDB setup
# client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)
# db = client[DATABASE_NAME]
# mycol = db[COLLECTION_NAME]

# def get_article_by_id(article_id):
#     try:
#         print(ObjectId(article_id))
#         article = mycol.find_one({"_id": ObjectId(article_id)})
#         return article
#     except Exception as e:
#         print(f"Error fetching article: {e}")
#         return None

# def get_comment_content_by_id(db, comment_id):
#     if not isinstance(comment_id, ObjectId):
#         try:
#             comment_id = ObjectId(comment_id)
#         except Exception as e:
#             print(f"Invalid comment_id: {e}")
#             return None
    
#     article = db.articles.find_one({
#         "comments._id": comment_id
#     }, {
#         "comments.$": 1
#     })
    
#     if article and "comments" in article and article["comments"]:
#         return article["comments"][0]["content"]
#     return None

# # Add explicit OPTIONS handler for preflight requests
# @app.before_request
# def handle_preflight():
#     if request.method == "OPTIONS":
#         response = jsonify({})
#         response.headers.add("Access-Control-Allow-Origin", "*")
#         response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization,X-Requested-With")
#         response.headers.add('Access-Control-Allow-Methods', "GET,POST,PUT,DELETE,OPTIONS")
#         response.headers.add('Access-Control-Allow-Credentials', "true")
#         return response

# @app.route("/summarize", methods=["POST","OPTIONS"])
# def summarize_article():
#     if request.method == "OPTIONS":
#         return '',200
#     data = request.get_json()
#     article_id = data.get("article_id","")
#     comment_id = data.get("comment_id","")
    
    
#     article = get_article_by_id(article_id)
#     comment = get_comment_content_by_id(db,comment_id)
   

#     # Fetch title and meta description
#     # Summarize meta description
#     if article is None:
#         summary_meta= ""
#     else:
#         title = article.get("title", "")
#         meta_desc = article.get("meta", {}).get("description", "")
#         summary_meta = call_gemini("summary", context_vars={"text":title+meta_desc}) if meta_desc else ""
#     if comment is not None:
#         comment_summary = call_gemini("summary",context_vars={"text":comment})
#         response={"title":title,"article_summary":summary_meta,"comment_summary":comment_summary}
#     response = {
#         "title": title,
#         "summary": summary_meta,
#     }
#     return jsonify(response)

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=8001, debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from llm_service import call_gemini
from dotenv import load_dotenv
import os
from datetime import timedelta

app = Flask(__name__)

# Enhanced CORS configuration
CORS(app, 
     supports_credentials=True,
     resources={r"/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     expose_headers=["Content-Type", "Authorization"])

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# MongoDB setup
client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)
db = client[DATABASE_NAME]
mycol = db[COLLECTION_NAME]

def get_article_by_id(article_id):
    try:
        if not article_id:
            return None
        print(f"Fetching article with ID: {article_id}")
        article = mycol.find_one({"_id": ObjectId(article_id)})
        return article
    except Exception as e:
        print(f"Error fetching article: {e}")
        return None

def get_comment_content_by_id(db, comment_id):
    try:
        if not comment_id:
            return None
            
        if not isinstance(comment_id, ObjectId):
            comment_id = ObjectId(comment_id)
        
        print(f"Fetching comment with ID: {comment_id}")
        article = db.articles.find_one({
            "comments._id": comment_id
        }, {
            "comments.$": 1
        })
        
        if article and "comments" in article and article["comments"]:
            return article["comments"][0]["content"]
        return None
    except Exception as e:
        print(f"Error fetching comment: {e}")
        return None

# Remove duplicate OPTIONS handling - let flask-cors handle it
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route("/summarize", methods=["POST", "OPTIONS"])
def summarize_article():
    try:
        # Handle OPTIONS request
        if request.method == "OPTIONS":
            response = jsonify({})
            return response, 200
        
        # Get and validate JSON data
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        article_id = data.get("article_id", "").strip()
        comment_id = data.get("comment_id", "").strip()
        
        print(f"Processing request - Article ID: {article_id}, Comment ID: {comment_id}")
        
        # Initialize response data
        response_data = {}
        
        # Process article if article_id is provided
        if article_id:
            article = get_article_by_id(article_id)
            if article:
                title = article.get("title", "")
                response_data["title"] = title
                
                meta_desc = article.get("meta", {}).get("description", "")
                if meta_desc:
                    print("Calling Gemini for article summary...")
                    summary_meta = call_gemini("summary", context_vars={"text": title + " " + meta_desc})
                    response_data["article_summary"] = summary_meta
                else:
                    response_data["article_summary"] = ""
            else:
                response_data["title"] = ""
                response_data["article_summary"] = ""
        
        # Process comment if comment_id is provided
        if comment_id:
            comment_content = get_comment_content_by_id(db, comment_id)
            if comment_content:
                print("Calling Gemini for comment summary...")
                comment_summary = call_gemini("summary", context_vars={"text": comment_content})
                response_data["comment_summary"] = comment_summary
            else:
                response_data["comment_summary"] = ""
        
        # Ensure we always have a title field
        if "title" not in response_data:
            response_data["title"] = ""
        
        # Legacy compatibility - add 'summary' field if only article was processed
        if "article_summary" in response_data and "comment_summary" not in response_data:
            response_data["summary"] = response_data["article_summary"]
        
        print(f"Returning response: {response_data}")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Error in summarize_article: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# Health check endpoint
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "Summary API is running"}), 200

# Test endpoint to check database connection
@app.route("/test-db", methods=["GET"])
def test_db():
    try:
        # Test MongoDB connection
        collections = db.list_collection_names()
        return jsonify({
            "status": "success", 
            "database": DATABASE_NAME,
            "collections": collections
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
