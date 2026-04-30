from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="FutureYou – Interactive AI Portfolio",
        description="Chat with Pavni Srivastava using Groq.",
        version="1.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.cors_allow_origins] if settings.cors_allow_origins != "*" else ["*"],
        allow_credentials=settings.cors_allow_origins != "*",
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(chat_router, prefix="")
    return app


app = create_app()

