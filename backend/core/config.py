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
    environment: str = "production"  # development, staging, production
    
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
    
    # CORS - Environment specific origins
    allowed_origins: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://forward-resume-builder.web.app",  # Firebase frontend
        "https://forward-resume-builder.vercel.app",  # Vercel frontend
    ]
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins based on environment."""
        if self.environment == "development":
            return [
                "http://localhost",
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000",
            ]
        else:
            return [
                "https://forward-resume-builder.web.app",
                "https://forward-resume-builder.vercel.app",
                "https://forward-resume-builder-production.up.railway.app",
            ]
    
    # Logging
    log_level: str = "INFO"
    
    @property
    def effective_log_level(self) -> str:
        """Get effective log level based on environment."""
        if self.environment == "development":
            return "DEBUG"
        elif self.environment == "staging":
            return "INFO"
        else:
            return "WARNING"
    
    # Development Settings
    echo_sql: bool = False
    
    @property
    def should_echo_sql(self) -> bool:
        """Determine if SQL should be echoed based on environment."""
        return self.environment == "development" and self.echo_sql
    
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment == "development"
    
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"
    
    def is_staging(self) -> bool:
        """Check if running in staging environment."""
        return self.environment == "staging"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        env_prefix = ""  # No prefix for environment variables
        

# Global settings instance
settings = Settings()

# Log configuration on startup
if settings.is_development():
    print(f"🚀 Starting in DEVELOPMENT mode")
    print(f"📊 Log level --------------------: {settings.effective_log_level}")
    print(f"🌐 CORS origins: {settings.cors_origins}")
elif settings.is_staging():
    print(f"🧪 Starting in STAGING mode")
    print(f"📊 Log level --------------------: {settings.effective_log_level}")
else:
    print(f"🏭 Starting in PRODUCTION mode")
    print(f"📊 Log level --------------------: {settings.effective_log_level}")
