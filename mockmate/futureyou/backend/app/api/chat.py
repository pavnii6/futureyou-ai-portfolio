from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Header, Request
from fastapi import HTTPException

from app.core.safety import get_client_ip, get_rate_limiter, verify_turnstile
from app.models.chat import ChatRequest, ChatResponse
from app.services.groq_client import generate_response

router = APIRouter()
logger = logging.getLogger(__name__)

FALLBACK_RESPONSE = "Something went wrong. Please try again."


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    request: Request,
    x_turnstile_token: Optional[str] = Header(default=None, alias="X-Turnstile-Token"),
) -> ChatResponse:
    try:
        client_ip = get_client_ip(request)

        # Public-link protections
        get_rate_limiter().check(client_ip)
        await verify_turnstile(x_turnstile_token or "", remoteip=client_ip)

        content = await generate_response(req.message)
        return ChatResponse(response=content)
    except HTTPException:
        # Preserve FastAPI HTTP errors for correct status handling.
        raise
    except RuntimeError as exc:
        logger.exception("Chat runtime error: %s", exc)
        if "GROQ_API_KEY" in str(exc):
            return ChatResponse(response="Configuration error: GROQ_API_KEY is missing on the server.")
        return ChatResponse(response=FALLBACK_RESPONSE)
    except Exception as exc:
        logger.exception("Unhandled /chat error: %s", exc)
        return ChatResponse(response=FALLBACK_RESPONSE)
