from __future__ import annotations

import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Deque, Dict, Optional

import httpx
from fastapi import HTTPException, Request

from app.core.config import get_settings


def get_client_ip(request: Request) -> str:
    """
    Best-effort client IP extraction.
    - If behind a proxy/CDN, X-Forwarded-For will exist.
    - Otherwise, fall back to request.client.host.
    """

    xff = request.headers.get("x-forwarded-for")
    if xff:
        # Standard format: "client, proxy1, proxy2"
        return xff.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


@dataclass
class RateLimitConfig:
    window_seconds: int
    max_requests: int


class InMemoryRateLimiter:
    def __init__(self, config: RateLimitConfig) -> None:
        self._config = config
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = time.time()
        window_start = now - self._config.window_seconds
        q = self._hits[key]

        while q and q[0] < window_start:
            q.popleft()

        if len(q) >= self._config.max_requests:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again in {self._config.window_seconds}s.",
            )

        q.append(now)


_rate_limiter: Optional[InMemoryRateLimiter] = None


def get_rate_limiter() -> InMemoryRateLimiter:
    global _rate_limiter
    if _rate_limiter is None:
        s = get_settings()
        _rate_limiter = InMemoryRateLimiter(
            RateLimitConfig(
                window_seconds=s.rate_limit_window_seconds,
                max_requests=s.rate_limit_max_requests,
            )
        )
    return _rate_limiter


async def verify_turnstile(token: str, *, remoteip: Optional[str] = None) -> None:
    """
    If TURNSTILE_REQUIRED=1 and TURNSTILE_SECRET_KEY is set, this enforces verification.
    If TURNSTILE_REQUIRED=0, it becomes a no-op even if token is missing.
    """

    s = get_settings()
    if not s.turnstile_required:
        return

    if not s.turnstile_secret_key:
        raise HTTPException(status_code=500, detail="Turnstile is required but TURNSTILE_SECRET_KEY is not set.")

    if not token:
        raise HTTPException(status_code=400, detail="Missing Turnstile token.")

    payload = {"secret": s.turnstile_secret_key, "response": token}
    if remoteip and remoteip != "unknown":
        payload["remoteip"] = remoteip

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", data=payload)
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Turnstile verification failed: {e}")

    if not data.get("success"):
        raise HTTPException(status_code=403, detail="Turnstile verification rejected.")

