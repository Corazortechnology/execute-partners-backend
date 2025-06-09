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
        # Clean and parse the response
        text = response.text.strip().replace("```json", "").replace("```", "").strip()
        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            result = {"error": "Invalid JSON format", "raw": text}
        except Exception as e:
            result = {"error": str(e), "raw": text}
        result["safe"] = (
            all(result.get(label, 0) < 0.5 for label in ['toxic', 'severe_toxic', 'obscene', 'insult', 'identity_hate'])
        )
        return result