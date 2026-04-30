from __future__ import annotations

from typing import Literal, List, Optional

from pydantic import BaseModel, Field


Mode = Literal["interview", "vision"]


class ChatHistoryItem(BaseModel):
    role: Literal["user", "assistant"] = Field(..., description="Message role")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    mode: Mode = Field("interview", description="Persona mode")
    history: List[ChatHistoryItem] = Field(default_factory=list, description="Prior conversation (optional)")


class ChatResponse(BaseModel):
    success: bool
    reply: Optional[str] = None
    error: Optional[str] = None

