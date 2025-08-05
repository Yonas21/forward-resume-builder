from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from models import ParseResumeRequest, OptimizeResumeRequest, GenerateResumeRequest, User, CreateUser
from openai_service import openai_service
from file_parser import file_parser
import os
from typing import List
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import bcrypt
from datetime import datetime, timedelta
import jwt
import logging

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Password hashing

# OAuth2 settings
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dummy user database (replace with a real database in production)
users = []

# Helper function to verify password
def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Helper function to hash password
def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Secret key for JWT
SECRET_KEY = "your-secret-key"  # Replace with a strong, randomly generated key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Function to create access token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Signup endpoint
@app.post("/signup", response_model=User)
async def signup(user: CreateUser):
    logger.info(f"Signup request received for user: {user.email}")
    try:
        hashed_password = get_password_hash(user.hashed_password)
        user = User(id=len(users) + 1, email=user.email, hashed_password=hashed_password.decode('utf-8'))
        users.append(user)
        logger.info(f"User {user.email} signed up successfully")
        return user
    except Exception as e:
        logger.error(f"Error signing up user {user.email}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Login endpoint
@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = next((user for user in users if user.email == form_data.username), None)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    file_content = await file.read()
    resume_text = file_parser.parse_file(file.filename, file_content)
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="Failed to parse the uploaded file")
    
    # Pre-process the resume text to extract structured information
    pre_processed_data = file_parser.pre_process_resume(resume_text)
    
    # Use OpenAI to enhance the pre-processed data
    structured_resume = await openai_service.parse_resume(
        resume_text, 
        pre_processed_hints=pre_processed_data
    )
    
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
