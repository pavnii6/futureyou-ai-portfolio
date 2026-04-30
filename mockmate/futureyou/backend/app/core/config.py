from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central configuration loaded from environment variables.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Groq
    groq_api_key: str = ""
    # App
    cors_allow_origins: str = "*"
    port: int = 8000

    # Production safety (public link)
    rate_limit_window_seconds: int = 60
    rate_limit_max_requests: int = 20

    # Cloudflare Turnstile (optional)
    turnstile_secret_key: str = ""
    turnstile_required: bool = False


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

