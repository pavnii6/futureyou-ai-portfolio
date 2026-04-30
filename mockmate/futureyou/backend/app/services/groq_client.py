from __future__ import annotations

import asyncio
from functools import lru_cache

from groq import Groq

from app.core.config import get_settings


@lru_cache(maxsize=1)
def get_groq_client() -> Groq:
    settings = get_settings()
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set in the environment.")
    return Groq(api_key=settings.groq_api_key)


async def generate_chat_response(messages: list[dict[str, str]]) -> str:
    settings = get_settings()
    client = get_groq_client()

    def _run_completion() -> str:
        response = client.chat.completions.create(
            model=settings.groq_chat_model,
            messages=messages,
            temperature=settings.temperature,
        )
        content = response.choices[0].message.content if response.choices else None
        if not content:
            raise RuntimeError("Model returned empty content.")
        return content

    return await asyncio.to_thread(_run_completion)

