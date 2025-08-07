"""
Request schemas for API endpoints.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any

from utils.validators import validate_password


class UserSignupRequest(BaseModel):
    """User signup request model."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    
    @validator('password')
    def validate_password_field(cls, v):
        return validate_password(v)


class UserLoginRequest(BaseModel):
    """User login request model."""
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    """Password reset request model."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation model."""
    token: str
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def validate_new_password_field(cls, v):
        return validate_password(v)


class ResumeCreateRequest(BaseModel):
    """Create resume request model."""
    title: str = Field(..., min_length=1, max_length=255)


class ResumeUpdateRequest(BaseModel):
    """Update resume request model."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    personal_info: Optional[Dict[str, Any]] = None
    professional_summary: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    template_id: Optional[str] = None
    font_family: Optional[str] = None
    accent_color: Optional[str] = None


class JobDescription(BaseModel):
    """Job description model for resume generation."""
    title: str
    company: str
    description: str
    requirements: List[str]


class GenerateResumeRequest(BaseModel):
    """Generate resume from job description request."""
    job_description: JobDescription
    user_background: Optional[str] = None


class OptimizeResumeRequest(BaseModel):
    """Optimize resume for job request."""
    resume: Dict[str, Any]
    job_description: JobDescription


class ParseResumeRequest(BaseModel):
    """Parse uploaded resume request."""
    file_content: str
    file_name: str
    file_type: str