from __future__ import annotations

import asyncio
from functools import lru_cache
import logging

from groq import Groq

from app.core.config import get_settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_groq_client() -> Groq:
    settings = get_settings()
    api_key = settings.groq_api_key
    logger.info("GROQ_API_KEY configured: %s", bool(api_key))
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set in the environment.")
    return Groq(api_key=api_key)


async def generate_response(prompt: str) -> str:
    client = get_groq_client()

    def _run_completion() -> str:
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a confident, smart AI portfolio persona answering "
                            "interview-style questions clearly and professionally. "
                            "Keep responses concise and focused - aim for 2-3 paragraphs maximum."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=500,
            )
            content = response.choices[0].message.content if response.choices else None
            if not content:
                raise RuntimeError("Model returned empty content.")
            logger.info("Groq response received (chars=%d)", len(content))
            return content
        except Exception as exc:
            logger.exception("Groq API call failed: %s", exc)
            raise

    return await asyncio.to_thread(_run_completion)

