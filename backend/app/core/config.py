"""
Application configuration.

Reads settings from environment variables (with sane local defaults) so the
same codebase works locally, in Docker, and in CI without code changes.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "Typeform Clone API"
    ENV: str = "development"
    DEBUG: bool = True

    # --- Database ---
    DATABASE_URL: str = "sqlite:///./typeform_clone.db"

    # --- CORS ---
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # --- Public form base URL (used to build shareable links) ---
    PUBLIC_BASE_URL: str = "http://localhost:3000/f"

    # --- Auth / JWT ---
    # NOTE: override JWT_SECRET_KEY via env var in any non-local environment.
    JWT_SECRET_KEY: str = "dev-only-insecure-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    RESET_TOKEN_EXPIRE_MINUTES: int = 30
    # Cookie holding the refresh token. httpOnly, same-site — safe because the
    # frontend proxies all /api/* calls through the Next.js rewrite, so
    # browser and API share an origin (no cross-site cookie issues).
    REFRESH_TOKEN_COOKIE_NAME: str = "refresh_token"
    COOKIE_SECURE: bool = False  # set True behind HTTPS in production

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
