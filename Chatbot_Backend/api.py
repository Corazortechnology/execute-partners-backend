from quart import Quart, request, jsonify
from quart_cors import cors
import logging
import os
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

from chatbot_logic import ArticleWriterModule, get_bot_response
from llm_service import call_gemini

# === Configuration ===
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# === App Initialization ===
app = Quart(__name__)
app = cors(app, allow_origin=[
    "http://localhost:5173",
    "https://www.executepartners.com",
    "http://192.168.31.68:5500"
], allow_credentials=True)

# === Logger Setup ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
)

# === Database Setup ===
client = AsyncIOMotorClient(MONGO_URI, tlsAllowInvalidCertificates=True)
db = client[DATABASE_NAME]
mycol = db[COLLECTION_NAME]

# === In-memory session management ===
SESSIONS = {}

# === Routes ===

@app.route("/")
async def root():
    return jsonify({"message": "Welcome to the Unified Gemini Chatbot + Summary API."})


@app.route("/chat", methods=["POST", "OPTIONS"])
async def chat_with_bot():
    try:
        data = await request.get_json()
        session_id = data.get("session_id")
        user_message = data.get("message")
        text = data.get("text", "")

        if not session_id or not user_message:
            return jsonify({"detail": "session_id and message are required."}), 400

        if session_id not in SESSIONS:
            SESSIONS[session_id] = ArticleWriterModule()
            logging.info(f"New session created: {session_id}")

        writer_module = SESSIONS[session_id]
        bot_reply = get_bot_response(user_message, text, writer_module)

        if writer_module.stage == "idle" and "Here is your complete article" in bot_reply:
            del SESSIONS[session_id]
            logging.info(f"Session closed after article generation: {session_id}")

        return jsonify({"session_id": session_id, "response": bot_reply})

    except Exception as e:
        logging.error(f"Error in /chat: {e}")
        return jsonify({"error": "Internal server error"}), 500


async def get_article_by_id(article_id):
    try:
        article = await mycol.find_one({"_id": ObjectId(article_id)})
        return article
    except Exception as e:
        logging.error(f"Error fetching article: {e}")
        return None


async def get_comment_content_by_id(comment_id):
    try:
        if not isinstance(comment_id, ObjectId):
            comment_id = ObjectId(comment_id)
    except Exception as e:
        logging.error(f"Invalid comment_id: {e}")
        return None

    try:
        article = await db.articles.find_one(
            {"comments._id": comment_id},
            {"comments.$": 1}
        )
        if article and "comments" in article and article["comments"]:
            return article["comments"][0]["content"]
    except Exception as e:
        logging.error(f"Error fetching comment: {e}")
    return None


@app.route("/summarize", methods=["POST", "OPTIONS"])
async def summarize_article():
    try:
        data = await request.get_json()
        article_id = data.get("article_id", "")
        comment_id = data.get("comment_id", "")

        article = await get_article_by_id(article_id)
        comment = await get_comment_content_by_id(comment_id)

        title = article.get("title", "") if article else ""
        meta_desc = article.get("meta", {}).get("description", "") if article else ""

        summary_meta = call_gemini("summary", context_vars={"text": title + meta_desc}) if meta_desc else ""

        if comment:
            comment_summary = call_gemini("summary", context_vars={"text": comment})
            response = {
                "title": title,
                "article_summary": summary_meta,
                "comment_summary": comment_summary
            }
        else:
            response = {
                "title": title,
                "summary": summary_meta
            }

        return jsonify(response)

    except Exception as e:
        logging.error(f"Error in /summarize: {e}")
        return jsonify({"error": "Internal server error"}), 500


# === Main Runner ===
if __name__ == "__main__":
    import asyncio
    app.run(host="0.0.0.0", port=8000, debug=True)
