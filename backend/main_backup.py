from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, validator
from pydantic_settings import BaseSettings
from models import ParseResumeRequest, OptimizeResumeRequest, GenerateResumeRequest
from openai_service import openai_service
from file_parser import file_parser
from database import init_database, check_database_connection, User
from db_service import UserService, ResumeService
import os
import re
from typing import List, Optional, Dict
import bcrypt
from datetime import datetime, timedelta
import jwt
import logging

# --- Settings Management ---
class Settings(BaseSettings):
    SECRET_KEY: str = "your-default-secret-key"  # A default for development, but should be overridden
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    openai_api_key: str = "your-openai-api-key"
    openai_model: str = "gpt-3.5-turbo"
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "resume_builder"

    class Config:
        env_file = ".env"

settings = Settings()


app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    logger.info("Starting application...")
    success = await init_database()
    if not success:
        logger.error("Failed to initialize database")
        raise RuntimeError("Database initialization failed")
    logger.info("Application started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    logger.info("Shutting down application...")
    from database import close_database
    await close_database()
    logger.info("Application shutdown complete")

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

# --- Pydantic Models for Authentication ---
class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v
        
    @validator('email')
    def validate_email(cls, v):
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, str(v)):
            raise ValueError('Invalid email format')
        return v

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    created_at: datetime
    is_active: bool

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserInDB(BaseModel):
    id: int
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    hashed_password: str
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# OAuth2 settings
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Function to create access token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Function to verify JWT token
def verify_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        token_data = TokenData(email=email)
        return token_data
    except jwt.PyJWTError:
        return None

# Dependency to get current user
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token)
    if token_data is None or token_data.email is None:
        raise credentials_exception
        
    user = await UserService.get_user_by_email(token_data.email)
    if user is None:
        raise credentials_exception
        
    return user

# Signup endpoint
@app.post("/auth/signup", response_model=AuthResponse)
async def signup(user_data: UserSignupRequest):
    logger.info(f"Signup request received for user: {user_data.email}")
    
    try:
        # Create new user using UserService
        user = await UserService.create_user(
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        
        # Generate access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, 
            expires_delta=access_token_expires
        )
        
        # Create response with user data (excluding password)
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            created_at=user.created_at,
            is_active=user.is_active
        )
        
        logger.info(f"User {user.email} signed up successfully")
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except ValueError as e:
        logger.error(f"Validation error during signup for {user_data.email}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error signing up user {user_data.email}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Login endpoint
@app.post("/auth/login", response_model=AuthResponse)
async def login(login_data: UserLoginRequest):
    logger.info(f"Login request received for user: {login_data.email}")
    try:
        # Find user by email
        user = await UserService.get_user_by_email(login_data.email)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        # Verify password
        if not UserService.verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        # Generate access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, 
            expires_delta=access_token_expires
        )
        
        # Create response with user data (excluding password)
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            created_at=user.created_at,
            is_active=user.is_active
        )
        
        logger.info(f"User {user.email} logged in successfully")
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login for {login_data.email}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Get current user profile
@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )

# Logout endpoint (for token blacklisting in a real implementation)
@app.post("/auth/logout")
async def logout(current_user: UserInDB = Depends(get_current_user)):
    # In a real implementation, you would blacklist the token
    # For now, we'll just return a success message
    logger.info(f"User {current_user.email} logged out")
    return {"message": "Successfully logged out"}

# Password reset request endpoint
@app.post("/auth/reset-password")
async def request_password_reset(reset_request: PasswordResetRequest):
    logger.info(f"Password reset request for user: {reset_request.email}")
    
    try:
        # Check if user exists
        user = get_user_by_email(reset_request.email)
        if not user:
            # Don't reveal if user exists or not for security
            return {"message": "If the email exists in our system, you will receive a password reset link"}
        
        # Create a password reset token (expires in 1 hour)
        reset_token_expires = timedelta(hours=1)
        reset_token = create_access_token(
            data={"sub": user.email, "type": "password_reset"}, 
            expires_delta=reset_token_expires
        )
        
        # TODO: Send email with reset token
        # For now, we'll just log it (in production, send actual email)
        logger.info(f"Password reset token for {user.email}: {reset_token}")
        
        return {"message": "If the email exists in our system, you will receive a password reset link"}
        
    except Exception as e:
        logger.error(f"Error during password reset request for {reset_request.email}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Password reset confirmation endpoint
@app.post("/auth/reset-password/confirm")
async def confirm_password_reset(reset_confirm: PasswordResetConfirm):
    logger.info("Password reset confirmation attempt")
    
    try:
        # Verify the reset token
        try:
            payload = jwt.decode(reset_confirm.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            if email is None or token_type != "password_reset":
                raise HTTPException(status_code=400, detail="Invalid reset token")
                
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=400, detail="Reset token has expired")
        except jwt.PyJWTError:
            raise HTTPException(status_code=400, detail="Invalid reset token")
        
        # Find user
        user = get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=400, detail="Invalid reset token")
        
        # Update user's password
        new_hashed_password = get_password_hash(reset_confirm.new_password)
        user.hashed_password = new_hashed_password.decode('utf-8')
        
        logger.info(f"Password reset successful for user: {user.email}")
        
        return {"message": "Password has been reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during password reset confirmation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

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

# Resume Management Endpoints

@app.post("/resumes")
async def create_resume(
    title: str = "My Resume",
    current_user: User = Depends(get_current_user)
):
    """Create a new resume for the current user"""
    try:
        resume = await ResumeService.create_resume(
            user_id=str(current_user.id),
            title=title
        )
        return {
            "id": str(resume.id),
            "title": resume.title,
            "created_at": resume.created_at,
            "updated_at": resume.updated_at
        }
    except Exception as e:
        logger.error(f"Error creating resume for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Error creating resume")

@app.get("/resumes")
async def get_user_resumes(current_user: User = Depends(get_current_user)):
    """Get all resumes for the current user"""
    try:
        resumes = await ResumeService.get_user_resumes(str(current_user.id))
        return [
            {
                "id": str(resume.id),
                "title": resume.title,
                "is_default": resume.is_default,
                "created_at": resume.created_at,
                "updated_at": resume.updated_at,
                "template_id": resume.template_id
            }
            for resume in resumes
        ]
    except Exception as e:
        logger.error(f"Error fetching resumes for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching resumes")

@app.get("/resumes/{resume_id}")
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific resume by ID"""
    try:
        resume = await ResumeService.get_resume_by_id(resume_id, str(current_user.id))
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return {
            "id": str(resume.id),
            "title": resume.title,
            "is_default": resume.is_default,
            "personal_info": resume.personal_info.dict(),
            "professional_summary": resume.professional_summary,
            "skills": resume.skills,
            "experience": [exp.dict() for exp in resume.experience],
            "education": [edu.dict() for edu in resume.education],
            "projects": [proj.dict() for proj in resume.projects],
            "certifications": [cert.dict() for cert in resume.certifications],
            "template_id": resume.template_id,
            "font_family": resume.font_family,
            "accent_color": resume.accent_color,
            "created_at": resume.created_at,
            "updated_at": resume.updated_at
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching resume")

@app.put("/resumes/{resume_id}")
async def update_resume(
    resume_id: str,
    updates: dict,
    current_user: User = Depends(get_current_user)
):
    """Update a resume"""
    try:
        resume = await ResumeService.update_resume(
            resume_id=resume_id,
            user_id=str(current_user.id),
            updates=updates
        )
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return {"message": "Resume updated successfully", "updated_at": resume.updated_at}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating resume")

@app.delete("/resumes/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a resume"""
    try:
        success = await ResumeService.delete_resume(resume_id, str(current_user.id))
        if not success:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return {"message": "Resume deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting resume")

@app.post("/resumes/{resume_id}/set-default")
async def set_default_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user)
):
    """Set a resume as the user's default"""
    try:
        success = await ResumeService.set_default_resume(resume_id, str(current_user.id))
        if not success:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return {"message": "Default resume set successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting default resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Error setting default resume")

# Resume Version Management

@app.get("/resumes/{resume_id}/versions")
async def get_resume_versions(
    resume_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all versions of a resume"""
    try:
        versions = await ResumeService.get_resume_versions(resume_id, str(current_user.id))
        return [
            {
                "id": str(version.id),
                "version_number": version.version_number,
                "title": version.title,
                "created_at": version.created_at
            }
            for version in versions
        ]
    except Exception as e:
        logger.error(f"Error fetching resume versions for {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching resume versions")

@app.post("/resumes/{resume_id}/versions/{version_id}/restore")
async def restore_resume_version(
    resume_id: str,
    version_id: str,
    current_user: User = Depends(get_current_user)
):
    """Restore a resume to a specific version"""
    try:
        success = await ResumeService.restore_resume_version(
            resume_id, version_id, str(current_user.id)
        )
        if not success:
            raise HTTPException(status_code=404, detail="Resume or version not found")
        
        return {"message": "Resume restored successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restoring resume version {version_id}: {e}")
        raise HTTPException(status_code=500, detail="Error restoring resume version")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        db_healthy = await check_database_connection()
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "database": "connected" if db_healthy else "disconnected",
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
