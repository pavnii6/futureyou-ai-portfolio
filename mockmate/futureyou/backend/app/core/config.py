from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central configuration loaded from environment variables.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # OpenAI
    openai_api_key: str = ""
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    # RAG inputs
    data_dir: str = os.getenv("RAG_DATA_DIR", str(Path(__file__).resolve().parents[3] / "data"))
    vectorstore_dir: str = os.getenv(
        "VECTORSTORE_DIR",
        str(Path(__file__).resolve().parents[3] / "vectorstore"),
    )

    # Retrieval / chunking
    chunk_size: int = int(os.getenv("RAG_CHUNK_SIZE", "900"))
    chunk_overlap: int = int(os.getenv("RAG_CHUNK_OVERLAP", "150"))
    top_k: int = int(os.getenv("RAG_TOP_K", "6"))

    # Prompt / generation
    temperature: float = float(os.getenv("OPENAI_TEMPERATURE", "0.6"))
    max_history_messages: int = int(os.getenv("MAX_HISTORY_MESSAGES", "12"))

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

