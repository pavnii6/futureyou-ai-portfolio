from __future__ import annotations

import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central configuration loaded from environment variables.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Groq
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")

    # App
    cors_allow_origins: str = os.getenv("CORS_ALLOW_ORIGINS", "*")
    port: int = int(os.getenv("PORT", "8000"))

    # Production safety (public link)
    rate_limit_window_seconds: int = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
    rate_limit_max_requests: int = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "20"))

    # Cloudflare Turnstile (optional)
    turnstile_secret_key: str = os.getenv("TURNSTILE_SECRET_KEY", "")
    turnstile_required: bool = os.getenv("TURNSTILE_REQUIRED", "0") in ("1", "true", "True", "yes", "YES")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

