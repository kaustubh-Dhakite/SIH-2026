"""Configuration settings for the application"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "Sovereign AI Workbench"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/sih_sovereign"
    
    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL_MAIN: str = "qwen2.5:0.5b"   # Fastest model for agent loop
    OLLAMA_MODEL_CODE: str = "qwen2.5:7b"      # Full model for complex tasks
    OLLAMA_MODEL_VISION: str = "llava:7b"
    OLLAMA_MODEL_EMBEDDINGS: str = "nomic-embed-text"
    
    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "documents"
    
    # Storage
    UPLOAD_DIR: str = "/app/uploads"
    MAX_FILE_SIZE_MB: int = 100
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
