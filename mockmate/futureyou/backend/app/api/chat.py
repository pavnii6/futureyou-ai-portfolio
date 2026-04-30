from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Header, Request

from app.core.safety import get_client_ip, get_rate_limiter, verify_turnstile
from app.models.chat import ChatRequest, ChatResponse
from app.services.groq_client import generate_response

router = APIRouter()
FALLBACK_RESPONSE = (
    "I am running in demo fallback mode because the Groq API is unavailable right now. "
    "You can still explore the UI and demo scenarios, and once a valid GROQ_API_KEY is configured, "
    "full AI responses will resume automatically."
)


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    request: Request,
    x_turnstile_token: Optional[str] = Header(default=None, alias="X-Turnstile-Token"),
) -> ChatResponse:
    client_ip = get_client_ip(request)

    # Public-link protections
    get_rate_limiter().check(client_ip)
    await verify_turnstile(x_turnstile_token or "", remoteip=client_ip)

    try:
        content = await generate_response(req.message)
        return ChatResponse(response=content)
    except Exception:
        return ChatResponse(response=FALLBACK_RESPONSE)

