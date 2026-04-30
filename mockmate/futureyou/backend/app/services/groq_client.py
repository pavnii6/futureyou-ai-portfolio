from __future__ import annotations

import asyncio
from functools import lru_cache
import logging

from groq import Groq

from app.core.config import get_settings
from app.services.context_loader import get_relevant_context

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_groq_client() -> Groq:
    settings = get_settings()
    api_key = settings.groq_api_key
    logger.info("GROQ_API_KEY configured: %s", bool(api_key))
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set in the environment.")
    return Groq(api_key=api_key)


async def generate_response(prompt: str, mode: str = "interview") -> str:
    client = get_groq_client()
    
    # Load portfolio context
    portfolio_context = get_relevant_context(prompt)

    # Define system prompts based on mode
    system_prompts = {
        "interview": (
            "You are Pavni Srivastava's AI portfolio assistant in Interview Mode. "
            "Answer recruiter questions with crisp, concise responses (3-5 sentences maximum). "
            "Pack maximum information into minimum words. Be direct and confident.\n\n"
            "IMPORTANT RULES:\n"
            "- Keep responses SHORT and CRISP (3-5 sentences)\n"
            "- Base answers ONLY on the portfolio context provided below\n"
            "- Write in clean prose without asterisks, markdown, or formatting\n"
            "- No bullet points or lists - use natural sentences\n"
            "- Speak in first person as Pavni Srivastava\n"
            "- Get to the point immediately - no fluff\n\n"
            f"PORTFOLIO CONTEXT:\n{portfolio_context}"
        ),
        "vision": (
            "You are Pavni Srivastava's AI portfolio assistant in Vision Mode. "
            "Share the 2030 vision in crisp, inspiring language (3-5 sentences maximum). "
            "Be ambitious but concise.\n\n"
            "IMPORTANT RULES:\n"
            "- Keep responses SHORT and CRISP (3-5 sentences)\n"
            "- Base vision on the portfolio context provided below\n"
            "- Write in clean prose without asterisks, markdown, or formatting\n"
            "- No bullet points or lists - use natural sentences\n"
            "- Speak in first person as Pavni Srivastava\n"
            "- Be inspiring but get to the point quickly\n\n"
            f"PORTFOLIO CONTEXT:\n{portfolio_context}"
        ),
    }

    system_content = system_prompts.get(mode, system_prompts["interview"])

    def _run_completion() -> str:
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=300,
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

