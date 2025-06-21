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
     resources={
         r"/*": {
             "origins": [ 
                 "https://html-starter-f9sl5f5qe-mridul-corazors-projects.vercel.app",
                 "https://html-starter-b7nfda735-mridul-corazors-projects.vercel.app",
                 "http://192.168.31.68:5500",
                 "http://localhost:5173", 
                 "http://127.0.0.1:5173",
                 "http://localhost:3000", 
                 "http://127.0.0.1:3000",
                 "https://www.executepartners.com",
                 "https://execute-partners-community.vercel.app"
             ],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
             
         }
     })

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
# @app.after_request
# def after_request(response):
#     origin = request.headers.get('Origin')
    
#     if origin:
#         response.headers['Access-Control-Allow-Origin'] = origin
#     else:
#         response.headers['Access-Control-Allow-Origin'] = '*'
        
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
#     response.headers.add('Access-Control-Allow-Credentials', 'true')
#     response.headers['Vary'] = 'Origin'
#     return response

@app.route("/summarize", methods=["POST", "OPTIONS"])
def summarize_article():
    try:
        if request.method == "OPTIONS":
            return '', 200
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        article_id = data.get("article_id", "").strip()
        comment_id = data.get("comment_id", "").strip()
        delete = data.get("delete", False)

        response_data = {}

        # --- Article summary logic ---
        if article_id:
            article = get_article_by_id(article_id)
            if not article:
                return jsonify({"error": f"Article with ID {article_id} not found."}), 404

            title = article.get("title", "")
            meta_desc = article.get("meta", {}).get("description", "")
            response_data["title"] = title

            # If delete=False and summary exists, return it
            if not delete and article.get("summary") and article.get("overview"):
                response_data["article_summary"] = article.get("summary")
                response_data['article_overview'] = article.get("overview", "")
                response_data["message"] = "Article summary already exists."
            else:
                # If delete=True, remove existing summary
                if delete:
                    mycol.update_one(
                        {"_id": ObjectId(article_id)},
                        {"$unset": {"summary": ""}},
                        {"$unset": {"overview": ""}}
                    )
                # Generate and save new summary
                if meta_desc:
                    summary_meta = call_gemini("summary", context_vars={"text": title + " " + meta_desc})
                    overview = call_gemini("overview", context_vars={"text": title + " " + meta_desc})
                else:
                    summary_meta = ""
                    overview = ""
                mycol.update_one(
                    {"_id": ObjectId(article_id)},
                    {"$set": {"summary": summary_meta, 
                              "overview": overview}},
                )
                response_data["article_summary"] = summary_meta
                response_data['article_overview'] = overview
                response_data["message"] = "Article summary regenerated and saved to database." if delete else "Article summary saved to database."

        # --- Comment summary logic ---
        if comment_id:
            comment_content = get_comment_content_by_id(db, comment_id)
            if not comment_content:
                response_data["comment_summary"] = ""
                response_data["comment_message"] = "Comment not found."
            else:
                # Find the article containing this comment
                article_with_comment = db.articles.find_one({"comments._id": ObjectId(comment_id)})
                if not article_with_comment:
                    response_data["comment_summary"] = ""
                    response_data["comment_message"] = "Comment's article not found."
                else:
                    # Find the comment object
                    comment_obj = next((c for c in article_with_comment["comments"] if c["_id"] == ObjectId(comment_id)), None)
                    if not comment_obj:
                        response_data["comment_summary"] = ""
                        response_data["comment_message"] = "Comment object not found."
                    else:
                        # If delete=False and summary exists, return it
                        if not delete and comment_obj.get("summary"):
                            response_data["comment_summary"] = comment_obj.get("summary")
                            response_data["comment_message"] = "Comment summary already exists."
                        else:
                            # If delete=True, remove existing summary
                            if delete:
                                db.articles.update_one(
                                    {"comments._id": ObjectId(comment_id)},
                                    {"$unset": {"comments.$.summary": ""}}
                                )
                            # Generate and save new summary
                            comment_summary = call_gemini("summary", context_vars={"text": comment_content})
                            db.articles.update_one(
                                {"comments._id": ObjectId(comment_id)},
                                {"$set": {"comments.$.summary": comment_summary}}
                            )
                            response_data["comment_summary"] = comment_summary
                            response_data["comment_message"] = "Comment summary regenerated and saved to database." if delete else "Comment summary saved to database."

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
    
@app.route("/cors-test", methods=["GET", "POST", "OPTIONS"])
def cors_test():
    return jsonify({
        "message": "CORS test successful",
        "method": request.method,
        "origin": request.headers.get('Origin', 'No Origin'),
        "headers": dict(request.headers),
        "render_deployment": True
    })
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
