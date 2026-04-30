from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request

from app.core.safety import get_client_ip, get_rate_limiter, verify_turnstile
from app.models.chat import ChatRequest, ChatResponse
from app.services.groq_client import generate_response

router = APIRouter()
logger = logging.getLogger(__name__)
FALLBACK_ERROR = "Something went wrong. Please try again."


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: Optional[ChatRequest],
    request: Request,
    x_turnstile_token: Optional[str] = Header(default=None, alias="X-Turnstile-Token"),
) -> ChatResponse:
    logger.info("Incoming /chat request")
    try:
        if req is None or not req.message or not req.message.strip():
            logger.warning("Invalid /chat request payload")
            return ChatResponse(success=False, error="Invalid request body: 'message' is required.")

        client_ip = get_client_ip(request)
        logger.info("Client IP detected: %s", client_ip)

        # Public-link protections
        get_rate_limiter().check(client_ip)
        await verify_turnstile(x_turnstile_token or "", remoteip=client_ip)

        content = await generate_response(req.message.strip())
        return ChatResponse(success=True, reply=content)
    except HTTPException:
        # Preserve FastAPI HTTP errors for correct status handling.
        raise
    except RuntimeError as exc:
        logger.exception("Chat runtime error: %s", exc)
        if "GROQ_API_KEY" in str(exc):
            return ChatResponse(success=False, error="Server configuration error: GROQ_API_KEY is missing.")
        return ChatResponse(success=False, error=FALLBACK_ERROR)
    except Exception as exc:
        logger.exception("Unhandled /chat error: %s", exc)
        return ChatResponse(success=False, error=FALLBACK_ERROR)
