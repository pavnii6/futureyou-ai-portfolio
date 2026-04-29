from __future__ import annotations

from functools import lru_cache

from langchain_openai import ChatOpenAI

from app.core.config import get_settings


@lru_cache(maxsize=1)
def get_llm() -> ChatOpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        # LangChain will also fail, but keep the error message clearer.
        raise RuntimeError("OPENAI_API_KEY is not set in the environment.")

    # ChatOpenAI reads OPENAI_API_KEY from env automatically.
    return ChatOpenAI(
        model=settings.openai_chat_model,
        temperature=settings.temperature,
        max_tokens=900,
    )

