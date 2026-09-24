import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Constellation Intelligence Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Neo4j Graph Database
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "constellation_secure_2026"
    
    # SQLite
    SQLITE_DB_PATH: str = str(BASE_DIR / "constellation.db")
    
    # Evidence Store
    EVIDENCE_STORE_DIR: str = str(BASE_DIR / "evidence_store")
    
    # Auth & JWT
    JWT_SECRET_KEY: str = "constellation_production_jwt_secret_key_adithya_2026_secured"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # HMAC Audit Ledger - Canonical key
    HMAC_SECRET_KEY: str = "constellation_tamper_evident_hmac_secret_chain_key_2026"
    
    # Autonomous Sweep
    SWEEP_INTERVAL_HOURS: int = 12

    # LLM (NVIDIA NIM)
    NVIDIA_API_KEY: str = ""
    NVIDIA_API_KEY_2: str = ""
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL: str = "nvidia/nemotron-3.5-lightning-30b-a3b"

    # Google Gemini LLM (OpenAI-compatible)
    GEMINI_API_KEY: str = ""
    GEMINI_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_PROJECT_ID: str = ""
    DATABASE_URL: str = ""

    # Cloud Hosting & Deployment
    NETLIFY_AUTH_TOKEN: str = ""
    NETLIFY_SITE_USER: str = ""
    NETLIFY_SITE_ID: str = ""
    VERCEL_TOKEN: str = ""
    GITHUB_TOKEN: str = ""
    GITHUB_USERNAME: str = ""
    
    # Ingestion / NER
    SPACY_MODEL: str = "en_core_web_sm"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        extra="ignore"
    )

settings = Settings()

# Ensure evidence storage dir exists
Path(settings.EVIDENCE_STORE_DIR).mkdir(parents=True, exist_ok=True)
