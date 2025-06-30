# from config import model
# from prompts import PROMPTS

# def call_gemini(prompt_key, context_vars=None, max_tok=None):
#     """
#     Calls the Gemini API with a structured prompt.

#     Args:
#         prompt_key (str): The key for the desired prompt in the PROMPTS dictionary.
#         context_vars (dict, optional): Variables to format the prompt string. Defaults to None.
#         max_tok (int, optional): Overrides the default max_output_tokens. Defaults to None.

#     Returns:
#         str: The generated text from the model or an error message.
#     """
#     try:
#         if prompt_key not in PROMPTS:
#             return f"⚠️ Error: Prompt key '{prompt_key}' not found."

#         prompt_config = PROMPTS[prompt_key]
#         prompt_template = prompt_config["prompt"]
        
#         # Format the prompt with context variables if provided
#         final_prompt = prompt_template.format(**context_vars) if context_vars else prompt_template

#         # Determine max tokens
#         max_output_tokens = max_tok if max_tok is not None else prompt_config["max_tokens"]

#         # Generate content
#         response = model.generate_content(
#             final_prompt,
#             generation_config={"max_output_tokens": max_output_tokens}
#         )
#         return response.text.strip()

#     except Exception as e:
#         return f"⚠️ An error occurred with the Gemini API: {e}"


from config import model
from prompts import PROMPTS

class Conversation:
    """
    Represents a single conversation with its own history.
    """
    def __init__(self, conversation_id, max_history=5):
        self.conversation_id = conversation_id
        self.history = []
        self.max_history = max_history

    def add_message(self, role, content):
        """Adds a message to the conversation history."""
        self.history.append({"role": role, "content": content})
        if len(self.history) > self.max_history * 2:  # *2 to account for user and model turn
            self.history = self.history[2:]  # Remove the oldest user and model turn

    def get_history_as_string(self):
        """Returns the conversation history as a single string, formatted for the prompt."""
        history_string = ""
        for message in self.history:
            history_string += f"{message['role']}: {message['content']}\n"
        return history_string

    def clear_history(self):
        """Clears the conversation history."""
        self.history = []


# Global dictionary to store active conversations
conversations = {}  # Key: conversation_id, Value: Conversation object


def call_gemini(conversation_id, prompt_key, context_vars=None, max_tok=None, use_history=True):
    try:
        if prompt_key not in PROMPTS:
            return f"⚠️ Error: Prompt key '{prompt_key}' not found."

        # Get or create the conversation object
        if conversation_id not in conversations:
            conversations[conversation_id] = Conversation(conversation_id)
        conversation = conversations[conversation_id]

        prompt_config = PROMPTS[prompt_key]
        prompt_template = prompt_config["prompt"]

        # Incorporate conversation history if requested
        if use_history:
            history_string = conversation.get_history_as_string()
            if context_vars is None:
                context_vars = {}
            context_vars["history"] = history_string
        else:
            if context_vars is None:
                context_vars = {}
            if "history" not in context_vars:
                context_vars["history"] = ""

        # Format the prompt with all context variables (including history)
        final_prompt = prompt_template.format(**context_vars)

        # Determine max tokens
        max_output_tokens = max_tok if max_tok is not None else prompt_config["max_tokens"]

        # Generate content
        response = model.generate_content(
            final_prompt,
            generation_config={"max_output_tokens": max_output_tokens}
        )
        response_text = response.text.strip()

        # Update conversation history
        user_input = context_vars.get("userInput") if context_vars and "userInput" in context_vars else ""
        conversation.add_message("user", user_input)
        conversation.add_message("model", response_text)

        return response_text

    except Exception as e:
        return f"⚠️ An error occurred with the Gemini API: {e}"
def close_conversation(conversation_id):
    """
    Closes a conversation and clears its history.

    Args:
        conversation_id (str): The ID of the conversation to close.
    """
    if conversation_id in conversations:
        conversations[conversation_id].clear_history()
        del conversations[conversation_id]
        print(f"Conversation {conversation_id} closed and history cleared.")
    else:
        print(f"Conversation {conversation_id} not found.")
