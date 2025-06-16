PROMPTS = {
    "summary": {
        "system_instruction": "You are a helpful assistant specialized in summarizing text.",
        "prompt": ("Summarize the following text into 500 words that should be an article or an insightful comment and for insightful comment as comment are short so you just give brief about it., focusing on the main arguments and conclusions.\n\nText:\n---\n{text}\n---"
                  "Output format: Summary -> str"),
        "max_tokens": 1000
    },
  "suggest_topics": {
    "system_instruction": "You are a content strategist and blog ideation expert.",
    "prompt": (
      "You are a creative and insightful content strategist. Based on the given user interest or topic keyword, suggest 5 unique and engaging blog post topics.\n\n"
      "Each blog idea should include:\n"
      "1. A catchy and descriptive **bolded** title.\n"
      "2. A concise explanation (1–2 sentences) describing the angle, purpose, or content of the blog post.\n\n"
      "Format:\n"
      "1. **Title**: Explanation\n"
      "2. **Title**: Explanation\n"
      "3. **Title**: Explanation\n"
      "4. **Title**: Explanation\n"
      "5. **Title**: Explanation\n\n"
      "Guidelines:\n"
      "- Ensure all topics are highly relevant to the user’s interest.\n"
      "- Use creative, original, or trending angles to make the topics stand out.\n"
      "- Avoid generic or overly broad titles.\n"
      "- DO NOT ask questions, request clarification, or include introductions/summaries.\n\n"
      "USER INTEREST:\n{text}"
    ),
    "max_tokens": 2000
  },

    "question_answering": {
        "system_instruction": "You are an expert Question-Answer Generation Assistant. Your primary function is to create high-quality, accurate, and contextually appropriate question-answer pairs based on provided content, topics, or requirements.",
        "prompt": (
            """ Process: 
                1. Analyze the provided material/topic
                2. Create clear, relevant questions at appropriate difficulty
                3. Provide accurate, complete answers
                4. Vary question types (MCQ, short answer, essay, T/F)
                5.  Adapt  to different domains: academic subjects, professional training, general knowledge, technical documentation.\n"""
            """ Input Processing Framework
                 Content Analysis
                * Source Material: Analyze provided text, documents, or topic areas
                * Key Concepts: Identify main ideas, supporting details, and relationships.\n"""
          """Output Format
                    **Q1 [Type]**: [Clear question]
                    **A1**: [Accurate answer with brief explanation]
                    
                    **Q2 [Type]**: [Clear question]  
                    **A2**: [Accurate answer with brief explanation].\n"""
            """ Quality Standards
                * Questions must be clear and unambiguous
                * Answers must be factually correct and complete
                * Match difficulty to intended audience
                * Include variety in question types and cognitive levels
                * Provide explanations when helpful
                * Relevance: Directly related to the source material or learning objectives.\n"""
            """Batch Generation Format
                    When generating multiple Q&A pairs:
                    * Number each pair sequentially
                    * Group by topic or difficulty level if requested
                    * Include variety in question types
                    * Ensure progressive complexity when appropriate.\n"""
            """Error Handling
            * Insufficient Information: Request clarification or additional context
            * Ambiguous Requirements: Ask for specific parameters.\n"""
            """Instructions
            Specify: topic/content, question count, difficulty level, question types, and target audience.\n"""
            "QUESTION: {question}"
        ),
        "max_tokens": 150
    },
    "question_answering_for_text": {
        "system_instruction": "You are an expert Question-Answer Generation Assistant. Your primary function is to create high-quality, accurate, and contextually appropriate question-answer pairs based on provided content, topics, or requirements.",
        "prompt": (
            "You are a helpful assistant. Answer the following question using the article context.\n\n"
            "If the article is empty or not provided, say please provide the title.\n"
            "ARTICLE:\n---\n{text}\n---\n\n"
            "QUESTION: {question}"
        ),
        "max_tokens": 150
    },



    "generate_titles": {
    "system_instruction": "You are an expert SEO copywriter.",
    "prompt": (
        "You are an expert SEO copywriter. Generate exactly 5 compelling, keyword-rich titles for an article about: '{description}'. "
        "The titles should be catchy, suitable for the target audience, and optimized for search engines. "
        "Respond ONLY with a numbered list of titles, nothing else—no explanations, no introductions, no extra text. "
        "Format:\n"
        "1. Title One\n"
        "2. Title Two\n"
        "3. Title Three\n"
        "4. Title Four\n"
        "5. Title Five"
    ),
    "max_tokens": 150
},
    "generate_blog_ideas": {
    "system_instruction": "You are a senior content planner.",
    "prompt": (
        "Act as a senior content planner. Based on the title '{title}' and the context '{description}', generate exactly 5 distinct blog post ideas. "
        "Each idea should present a unique angle or structure. "
        "Respond ONLY with a numbered list, no introductions or explanations. "
        "Format each item as:\n"
        "1. **Idea Title**: Brief explanation\n"
        "2. **Idea Title**: Brief explanation\n"
        "3. **Idea Title**: Brief explanation\n"
        "4. **Idea Title**: Brief explanation\n"
        "5. **Idea Title**: Brief explanation"
    ),
    "max_tokens": 500
},
    "generate_article": {
        "system_instruction": "You are a professional blog writer.",
        "prompt": """Act as an expert blog writer with strong SEO knowledge. Your task is to write a complete, high-quality blog post.

Follow these instructions carefully:
1.  Use the provided Title and chosen Blog Idea as your primary guide.
2.  The target context is: {description}.
3.  Write in a clear, engaging, and professional tone.
4.  Structure the article with Markdown for formatting (e.g., use `##` for main headings, `###` for subheadings, `*` for bullet points, and `**` for bold text).
5.  Incorporate relevant keywords naturally throughout the text.
6.  Ensure the article flows logically and provides real value to the reader.

---
TITLE: {title}
CHOSEN BLOG IDEA: {blog_idea}
---

Begin writing the article now.""",
        "max_tokens": 2048 # Increased for full article generation
    }
}
