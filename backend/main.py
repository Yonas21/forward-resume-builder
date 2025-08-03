from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from models import ParseResumeRequest, OptimizeResumeRequest, GenerateResumeRequest
from openai_service import openai_service
from file_parser import file_parser
import os

app = FastAPI()

# CORS settings
origins = [
    "http://localhost",
    "http://localhost:3000",  # React app
    "http://localhost:5173",  # Vite dev server
    "http://localhost:5174",  # Alternative Vite port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    file_content = await file.read()
    resume_text = file_parser.parse_file(file.filename, file_content)
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="Failed to parse the uploaded file")
    
    structured_resume = await openai_service.parse_resume(resume_text)
    return structured_resume

@app.post("/optimize-resume")
async def optimize_resume(request: OptimizeResumeRequest):
    optimized_resume = await openai_service.optimize_resume_for_job(request.resume, request.job_description)
    return optimized_resume

@app.post("/generate-resume")
async def generate_resume(request: GenerateResumeRequest):
    generated_resume = await openai_service.generate_resume_from_job(request.job_description, request.user_background)
    return generated_resume

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))

