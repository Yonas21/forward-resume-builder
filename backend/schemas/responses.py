"""
Response schemas for API endpoints.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class BaseResponse(BaseModel):
    """Base response model."""
    success: bool = True
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response model."""
    success: bool = False
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    field_errors: Optional[Dict[str, str]] = None


class UserResponse(BaseModel):
    """User data response model."""
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response model."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ResumeListItem(BaseModel):
    """Resume list item model."""
    id: str
    title: str
    is_default: bool
    template_id: str
    created_at: datetime
    updated_at: datetime


class ResumeListResponse(BaseModel):
    """Resume list response model."""
    resumes: List[ResumeListItem]
    total_count: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_previous: bool


class ResumeResponse(BaseModel):
    """Full resume response model."""
    id: str
    title: str
    is_default: bool
    personal_info: Dict[str, Any]
    professional_summary: str
    skills: List[str]
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    certifications: List[Dict[str, Any]]
    template_id: str
    font_family: str
    accent_color: str
    created_at: datetime
    updated_at: datetime


class ResumeVersionResponse(BaseModel):
    """Resume version response model."""
    id: str
    version_number: int
    title: str
    created_at: datetime


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    database: str
    timestamp: datetime
    error: Optional[str] = None


class SuccessResponse(BaseModel):
    """Generic success response."""
    message: str
    data: Optional[Dict[str, Any]] = None


class OptimizedResumeResponse(BaseModel):
    """Optimized resume response model (AI operations)."""
    personal_info: Dict[str, Any]
    professional_summary: str
    skills: List[Dict[str, Any]]  # Keep as Skill objects for AI operations
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    certifications: List[Dict[str, Any]]