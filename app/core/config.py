# app/core/config.py
import os
import secrets
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ePrompt Backend API"
    API_V1_STR: str = "/api/v1"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001

    # Database
    DATABASE_URL: str = "sqlite:///./temp_database.db"

    # JWT
    SECRET_KEY: str = "temp-secret-key-placeholder-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI APIs
    OPENAI_API_KEY: str = "temp-openai-key-placeholder"
    ANTHROPIC_API_KEY: str = "temp-anthropic-key-placeholder"
    GEMINI_API_KEY: str = "temp-gemini-key-placeholder"
    COHERE_API_KEY: str = "temp-cohere-key-placeholder"

    # Supabase
    SUPABASE_URL: str = "https://temp-supabase-url.supabase.co"
    SUPABASE_KEY: str = "temp-supabase-key-placeholder"

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Generate a random secret key if still using the default placeholder
        if self.SECRET_KEY == "temp-secret-key-placeholder-change-in-production":
            self.SECRET_KEY = secrets.token_urlsafe(32)

settings = Settings()
