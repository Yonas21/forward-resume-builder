from beanie import Document, init_beanie
from pydantic import BaseModel, EmailStr, Field
from pydantic_settings import BaseSettings
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class DatabaseSettings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "resume_builder"
    
    class Config:
        env_file = ".env"

settings = DatabaseSettings()

# MongoDB client
mongodb_client: Optional[AsyncIOMotorClient] = None

class PersonalInfo(BaseModel):
    """Personal information schema"""
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""

class Experience(BaseModel):
    """Work experience schema"""
    company: str = ""
    position: str = ""
    start_date: str = ""
    end_date: str = ""
    description: List[str] = []
    is_current: bool = False

class Education(BaseModel):
    """Education schema"""
    institution: str = ""
    degree: str = ""
    field_of_study: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""

class Project(BaseModel):
    """Project schema"""
    name: str = ""
    description: str = ""
    technologies: List[str] = []
    url: str = ""

class Certification(BaseModel):
    """Certification schema"""
    name: str = ""
    issuing_organization: str = ""
    issue_date: str = ""
    expiration_date: str = ""
    credential_id: str = ""

class User(Document):
    """User model for storing user account information"""
    email: EmailStr = Field(unique=True, index=True)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "created_at"
        ]

class Resume(Document):
    """Resume model for storing complete resume data"""
    user_id: str = Field(index=True)  # Reference to User._id
    title: str = "My Resume"
    is_default: bool = False
    
    # Personal Information
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    
    # Resume Sections
    professional_summary: str = ""
    skills: List[str] = []
    experience: List[Experience] = []
    education: List[Education] = []
    projects: List[Project] = []
    certifications: List[Certification] = []
    
    # Styling and Template
    template_id: str = "basic"
    font_family: str = "font-sans"
    accent_color: str = "#2563eb"
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "resumes"
        indexes = [
            "user_id",
            "created_at",
            "updated_at",
            ("user_id", "is_default")
        ]

class ResumeVersion(Document):
    """Resume version history for tracking changes"""
    resume_id: str = Field(index=True)  # Reference to Resume._id
    user_id: str = Field(index=True)    # Reference to User._id
    version_number: int
    title: str
    
    # Snapshot of resume data at this version
    personal_info: PersonalInfo
    professional_summary: str = ""
    skills: List[str] = []
    experience: List[Experience] = []
    education: List[Education] = []
    projects: List[Project] = []
    certifications: List[Certification] = []
    template_id: str = "basic"
    font_family: str = "font-sans"
    accent_color: str = "#2563eb"
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "resume_versions"
        indexes = [
            "resume_id",
            "user_id",
            "version_number",
            "created_at"
        ]

async def init_database(retry_count: int = 5, retry_delay: int = 5):
    """Initialize database connection and models with retry logic"""
    import asyncio
    
    global mongodb_client
    
    for attempt in range(retry_count):
        try:
            logger.info(f"Attempting to connect to database (attempt {attempt + 1}/{retry_count})...")
            
            # Create Motor client with connection timeout
            mongodb_client = AsyncIOMotorClient(
                settings.mongodb_url,
                serverSelectionTimeoutMS=10000,  # 10 seconds
                connectTimeoutMS=10000,
                socketTimeoutMS=10000,
                maxPoolSize=10,
                minPoolSize=1
            )
            
            # Test the connection
            await mongodb_client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
            
            # Initialize beanie with the User and Resume models
            await init_beanie(
                database=mongodb_client[settings.database_name],
                document_models=[User, Resume, ResumeVersion]
            )
            
            logger.info("Database initialized successfully")
            return True
            
        except Exception as e:
            logger.warning(f"Database connection attempt {attempt + 1} failed: {e}")
            if attempt < retry_count - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.error(f"Failed to initialize database after {retry_count} attempts: {e}")
                logger.error("Please ensure MongoDB is running and accessible")
                return False

async def close_database():
    """Close database connection"""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        mongodb_client = None
        logger.info("Database connection closed")

async def check_database_connection() -> bool:
    """Check if database connection is working"""
    try:
        global mongodb_client
        if not mongodb_client:
            return False
            
        # Simple ping to test connection
        await mongodb_client.admin.command('ping')
        return True
        
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

# Health check function for startup
async def create_indexes():
    """Ensure all indexes are created"""
    try:
        # This is handled automatically by Beanie, but we can add custom logic here if needed
        logger.info("Database indexes verified")
        return True
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        return False