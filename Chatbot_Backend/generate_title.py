from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llm_service import call_gemini

app = FastAPI()
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
class TitleRequest(BaseModel):
    category:str

@app.post("/generate_title")
async def generate_title(request: TitleRequest):
    prompt_key = "category_title_generation"
    context_vars = {"category": request.category}
    
    # Call the Gemini API with the structured prompt
    generated_title = call_gemini(prompt_key, context_vars=context_vars,max_tok=2000)
    
    return {"title": generated_title}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
