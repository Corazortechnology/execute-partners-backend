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
        if request.method == "OPTIONS":
            return '', 200
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
        bot_result = get_bot_response(user_message, text, writer_module)

        # Unpack result
        response_text = bot_result.get("text", "")
        tokens_used = bot_result.get("token_usage", {
            "input_tokens": 0, "output_tokens": 0, "total_tokens": 0
        })

        if writer_module.stage == "idle" and "Here is your complete article" in response_text:
            del SESSIONS[session_id]
            logging.info(f"Session closed after article generation: {session_id}")

        return jsonify({
            "session_id": session_id,
            "response": response_text,
            "tokens_used": tokens_used
        })

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
        if request.method == "OPTIONS":
            return '', 200
        data = await request.get_json()
        article_id = data.get("article_id", "")
        comment_id = data.get("comment_id", "")

        article = await get_article_by_id(article_id)
        comment = await get_comment_content_by_id(comment_id)

        title = article.get("title", "") if article else ""
        meta_desc = article.get("meta", {}).get("description", "") if article else ""

        total_tokens_used = {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}

        summary_meta = None
        if meta_desc:
            summary_meta_res = call_gemini("summary", context_vars={"text": title + meta_desc})
            summary_meta = summary_meta_res["text"]
            for k in total_tokens_used:
                total_tokens_used[k] += summary_meta_res["token_usage"].get(k, 0)

        if comment:
            comment_summary_res = call_gemini("summary", context_vars={"text": comment})
            comment_summary = comment_summary_res["text"]
            for k in total_tokens_used:
                total_tokens_used[k] += comment_summary_res["token_usage"].get(k, 0)

            response = {
                "title": title,
                "article_summary": summary_meta,
                "comment_summary": comment_summary,
                "tokens_used": total_tokens_used
            }
        else:
            response = {
                "title": title,
                "summary": summary_meta,
                "tokens_used": total_tokens_used
            }

        return jsonify(response)

    except Exception as e:
        logging.error(f"Error in /summarize: {e}")
        return jsonify({"error": "Internal server error"}), 500


# === Main Runner ===
if __name__ == "__main__":
    import asyncio
    app.run(host="0.0.0.0", port=8000, debug=True)
