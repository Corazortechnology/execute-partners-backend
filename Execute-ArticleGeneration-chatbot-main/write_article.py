from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from llm_service import call_gemini,close_conversation
from pydantic import BaseModel
import logging
app = FastAPI()
logging.basicConfig(level=logging.INFO)
origins = [ 
                 "https://html-starter-f9sl5f5qe-mridul-corazors-projects.vercel.app",
                 "https://html-starter-b7nfda735-mridul-corazors-projects.vercel.app",
                 "http://192.168.31.68:5500",
                 "http://localhost:5173", 
                 "http://127.0.0.1:5173",
                 "http://localhost:3000", 
                 "http://127.0.0.1:3000",
                 "https://www.executepartners.com",
                 "https://execute-partners-community.vercel.app"
             ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class UserInput(BaseModel):
    message: str
    session_id: str
class PostArticle(BaseModel):
    article:str
    session_id: str

@app.post("/generate_article")
async def generate_article(user_input: UserInput):
    """
    Endpoint to generate an article based on user input.
    """
    if user_input.message.lower() == "exit":
        return {"message": "Exiting the conversation."}
    if user_input.message.lower() == "reset":
        logging.info(f"Resetting conversation for session {user_input.session_id}")
        close_conversation(user_input.session_id)
        return {"message": "Conversation reset."}
    logging.info(f"Received message: {user_input.message} for session {user_input.session_id}")
    response = call_gemini(user_input.session_id, "generate_article", context_vars={"userInput": user_input.message})
    logging.info(f"Response from Gemini: {response}")
    return {"response": response}
  
@app.post("/post_article")
async def post_article(postarticle: PostArticle):
    if not postarticle.article:
        return {"error": "Article content is required."}
    response = call_gemini(postarticle.session_id,"post_article", context_vars={"GeneratedArticle": postarticle.article})
    response = response.replace("```json", "").replace("```", "").strip()
    response = json.loads(response)
    logging.info(f"Response from Gemini for post_article: {response}")
    print(f"Response from Gemini for post_article: {response}")
    return JSONResponse(content={"response": response})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0",port=4000)

