import re
from llm_service import call_gemini

class ArticleWriterModule:
    def __init__(self):
        self.stage = "idle"
        self.context = {}

    def reset(self):
        self.stage = "idle"
        self.context = {}

    def handle(self, user_msg: str):
        msg_lower = user_msg.strip().lower()

        if self.stage == "idle":
            if "write" in msg_lower or "new article" in msg_lower:
                self.stage = "awaiting_context"
                return {
                    "text": "Great! Let's write an article. First, please tell me: 1. What industry or topic is this for? 2. Who is the target audience?",
                    "token_usage": {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}
                }
            return None

        elif self.stage == "awaiting_context":
            self.context["description"] = user_msg
            self.stage = "generating_titles"
            return self._generate_titles()

        elif self.stage == "awaiting_title_choice":
            self.context["chosen_title"] = user_msg
            self.context["title"] = user_msg
            self.stage = "generating_blog_ideas"
            return self._generate_blog_ideas()

        elif self.stage == "awaiting_blog_choice":
            self.context["chosen_blog"] = user_msg
            self.context["blog_idea"] = user_msg
            self.stage = "generating_final_article"
            return self._generate_article()

        return None

    def _generate_titles(self):
        result = call_gemini("generate_titles", context_vars={"description": self.context["description"]})
        self.context["titles"] = result["text"]
        self.stage = "awaiting_title_choice"
        return {
            "text": f"Here are 5 title options. Please copy and paste the one you'd like to use:\n\n{result['text']}",
            "token_usage": result["token_usage"]
        }

    def _generate_blog_ideas(self):
        result = call_gemini("generate_blog_ideas", context_vars=self.context)
        self.context["ideas"] = result["text"]
        self.stage = "awaiting_blog_choice"
        return {
            "text": f"Excellent. Now, here are 5 blog ideas based on that title. Please pick one to develop:\n\n{result['text']}",
            "token_usage": result["token_usage"]
        }

    def _generate_article(self):
        context_vars = {
            "title": self.context.get("title", ""),
            "blog_idea": self.context.get("blog_idea", ""),
            "description": self.context.get("description", "")
        }
        result = call_gemini("generate_article", context_vars=context_vars)
        self.reset()
        return {
            "text": f"**Here is your complete article:**\n\n---\n\n{result['text']}",
            "token_usage": result["token_usage"]
        }

def detect_intent(msg: str):
    msg_lower = msg.lower()
    if "summary" in msg_lower or "summarize" in msg_lower: return "summary"
    if "topic" in msg_lower or "suggest" in msg_lower: return "topic"
    return "qa"

def get_bot_response(user_msg: str, text: str, writer_module: ArticleWriterModule) -> dict:
    if re.match(r"^\s*(hi|hello|hey)\b.*", user_msg.lower()):
        return {
            "text": "Hi there! How can I help you today? You can ask me to summarize the article, suggest new topics, ask a question about it, or write a new article.",
            "token_usage": {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}
        }

    module_response = writer_module.handle(user_msg)
    if module_response:
        return module_response

    intent = detect_intent(user_msg)

    if intent == "summary":
        return call_gemini("summary", context_vars={"text": text})
    elif intent == "topic":
        return call_gemini("suggest_topics", context_vars={"text": user_msg})
    else:
        clean_text = text.strip() if text else ""
        if not clean_text:
            return call_gemini("question_answering", context_vars={"question": user_msg})
        else:
            return call_gemini("question_answering_for_text", context_vars={"text": clean_text, "question": user_msg})
