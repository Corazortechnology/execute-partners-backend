import google.generativeai as genai
from dotenv import load_dotenv
import os
import json

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

class ArticleClassifier:
    def __init__(self, article):
        self.article = article

    def classify(self):
        prompt = f"""You are an AI assistant. Your task is to classify the article on labels: toxic, severe_toxic, obscene, threat, insult, identity_hate.
Output Format (JSON only, no explanation):
{{
  "toxic": float,
  "severe_toxic": float,
  "obscene": float,
  "threat": float,
  "insult": float,
  "identity_hate": float
}}
ONLY output the JSON object. Do NOT include any explanation, thoughts, or extra text.
Given article: {self.article}
"""

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)

        # Extract raw model response and clean up
        text = response.text.strip().replace("```json", "").replace("```", "").strip()
        
        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            result = {"error": "Invalid JSON format", "raw": text}
        except Exception as e:
            result = {"error": str(e), "raw": text}
        
        # Determine safety based on score thresholds
        result["safe"] = all(
            result.get(label, 0) < 0.5 
            for label in ["toxic", "severe_toxic", "obscene", "insult", "identity_hate"]
        )

        # Add token usage (from Gemini metadata)
        usage = getattr(response, "usage_metadata", None)
        if usage:
            result["token_usage"] = {
                "input_tokens": usage.prompt_token_count,
                "output_tokens": usage.candidates_token_count,
                "total_tokens": usage.total_token_count
            }
        else:
            result["token_usage"] = {
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0
            }

        return result
