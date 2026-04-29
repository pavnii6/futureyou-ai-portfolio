from __future__ import annotations

from typing import List, Tuple, Optional

from fastapi import APIRouter, HTTPException, Header, Request

from app.core.config import get_settings
from app.core.safety import get_client_ip, get_rate_limiter, verify_turnstile
from app.models.chat import ChatHistoryItem, ChatRequest, ChatResponse, Mode
from app.services.openai_client import get_llm
from app.services.prompting import build_conversation_messages, build_system_prompt
from app.services.rag import get_rag_engine

router = APIRouter()


def _format_context(chunks: List[Tuple[str, dict]]) -> str:
    # Provide numbered snippets so the model can reference them clearly.
    lines: List[str] = []
    for i, (text, meta) in enumerate(chunks, start=1):
        source = meta.get("source", "unknown")
        # Keep it readable and compact.
        cleaned = " ".join(text.split())
        lines.append(f"[{i}] source={source}\n{cleaned}")
    return "\n\n".join(lines)


def _trim_history(history: List[ChatHistoryItem], max_messages: int) -> List[ChatHistoryItem]:
    if len(history) <= max_messages:
        return history
    return history[-max_messages:]


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    request: Request,
    x_turnstile_token: Optional[str] = Header(default=None, alias="X-Turnstile-Token"),
) -> ChatResponse:
    settings = get_settings()
    client_ip = get_client_ip(request)

    # Public-link protections
    get_rate_limiter().check(client_ip)
    await verify_turnstile(x_turnstile_token or "", remoteip=client_ip)

    rag_engine = get_rag_engine()
    llm = get_llm()

    try:
        retrieved = await rag_engine.retrieve(req.message, k=settings.top_k)
        context = _format_context(retrieved)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG retrieval failed: {e}")

    system_prompt = build_system_prompt(context, req.mode)  # includes persona + mode rules

    history = _trim_history(req.history or [], settings.max_history_messages)

    messages = build_conversation_messages(
        system_prompt=system_prompt,
        history=history,
        user_message=req.message,
    )

    try:
        result = await llm.ainvoke(messages)
        content = getattr(result, "content", None)
        if not content:
            raise RuntimeError("Model returned empty content.")
        return ChatResponse(response=str(content))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {e}")

