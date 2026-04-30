from __future__ import annotations

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.core.config import get_settings
from app.services.rag import get_rag_engine

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Build/load the FAISS index once on startup.
    rag_engine = get_rag_engine()
    try:
        await rag_engine.init()
    except Exception as exc:
        # Keep API booting for public demos even if upstream embedding calls fail.
        logger.exception("RAG initialization failed; continuing in degraded mode: %s", exc)
    yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="FutureYou – Interactive AI Portfolio",
        description="Chat with Future Me (2030) using LangChain RAG + FAISS.",
        version="1.0.0",
        lifespan=lifespan,
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

