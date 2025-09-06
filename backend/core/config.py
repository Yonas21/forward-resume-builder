"""
Core configuration settings for the Resume Builder application.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    app_name: str = "Resume Builder API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database
    mongodb_url: str
    database_name: str
    
    # Redis Cache
    redis_url: str = "redis://localhost:6379/0"
    redis_password: str = ""
    redis_cache_ttl: int = 3600  # 1 hour default
    redis_user_cache_ttl: int = 1800  # 30 minutes for user data
    redis_ai_cache_ttl: int = 7200  # 2 hours for AI responses
    
    # OpenAI
    openai_api_key: str
    openai_model: str = "gpt-3.5-turbo"

    # OpenRouter
    open_router_key: str
    open_router_model: str = "openai/gpt-oss-20b:free"

    # Groq
    groq_api_key: str
    groq_model: str = "llama3-8b-8192"

    # Gemini
    gemini_api_key: str
    gemini_model: str = "gemini-1.5-flash"

    # Google OAuth2
    google_client_id: str
    google_client_secret: str
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://forward-resume-builder.web.app",  # Firebase frontend
        "https://forward-resume-builder.vercel.app",  # Vercel frontend
    ]
    
    # Logging
    log_level: str = "INFO"
    
    # Development Settings
    echo_sql: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        

# Global settings instance
settings = Settings()
