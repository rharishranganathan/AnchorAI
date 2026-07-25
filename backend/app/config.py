from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    GEMINI_API_KEY: str
    DATABASE_URL: str = "postgresql://anchorai_user:anchorai_pass@localhost:5432/anchorai_db"
    CORS_ORIGINS: str = "http://localhost:3000"
    APP_ENV: str = "development"

    model_config = SettingsConfigDict(env_file=".env")

@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()
