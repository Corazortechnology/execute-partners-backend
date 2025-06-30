from config import model
from prompts import PROMPTS
import time
def call_gemini(prompt_key, context_vars=None, max_tok=None, retries=3, backoff_factor=2):
    """
    Calls the Gemini API with a structured prompt and handles rate limits.
    """
    attempt = 0
    while attempt < retries:
        try:
            if prompt_key not in PROMPTS:
                return f"⚠️ Error: Prompt key '{prompt_key}' not found."

            prompt_config = PROMPTS[prompt_key]
            prompt_template = prompt_config["prompt"]
            final_prompt = prompt_template.format(**context_vars) if context_vars else prompt_template
            max_output_tokens = max_tok if max_tok is not None else prompt_config["max_tokens"]

            response = model.generate_content(
                final_prompt,
                generation_config={"max_output_tokens": max_output_tokens}
            )
            return response.text.strip()
        except Exception as e:
            # Check for rate limit error (adjust this condition to match your API's error)
            if "rate limit" in str(e).lower():
                wait_time = backoff_factor ** attempt
                time.sleep(wait_time)
                attempt += 1
            else:
                return f"⚠️ An error occurred with the AI: {e}"
    return "⚠️ Rate limit exceeded. Please try again later."
