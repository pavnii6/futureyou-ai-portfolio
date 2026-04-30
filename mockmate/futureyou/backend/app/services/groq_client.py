from __future__ import annotations

import asyncio
import os
from functools import lru_cache

from groq import Groq

@lru_cache(maxsize=1)
def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set in the environment.")
    return Groq(api_key=api_key)


async def generate_response(prompt: str) -> str:
    client = get_groq_client()

    def _run_completion() -> str:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a confident, smart AI portfolio persona answering "
                        "interview-style questions clearly and professionally."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        )
        content = response.choices[0].message.content if response.choices else None
        if not content:
            raise RuntimeError("Model returned empty content.")
        return content

    return await asyncio.to_thread(_run_completion)

