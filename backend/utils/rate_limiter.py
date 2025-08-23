"""
Simple in-memory rate limiting utilities.

NOTE: This is per-process and ephemeral. For production, use Redis.
"""
from __future__ import annotations

import time
from typing import Dict, Callable, Optional

from fastapi import Request, HTTPException


class SlidingWindowCounter:
    """Naive sliding-window counter using timestamp buckets (per second)."""

    def __init__(self) -> None:
        # key -> { timestamp_second: count }
        self._store: Dict[str, Dict[int, int]] = {}

    def increment_and_check(self, key: str, limit: int, window_seconds: int) -> bool:
        now = int(time.time())
        window_start = now - window_seconds + 1

        buckets = self._store.setdefault(key, {})
        # Remove old buckets
        for ts in list(buckets.keys()):
            if ts < window_start:
                del buckets[ts]

        # Increment current bucket
        buckets[now] = buckets.get(now, 0) + 1

        # Sum within window
        total = sum(count for ts, count in buckets.items() if ts >= window_start)
        return total <= limit


_counter = SlidingWindowCounter()


def rate_limit_ip(limit: int, window_seconds: int) -> Callable[[Request], None]:
    """Dependency to rate limit by client IP."""

    def dependency(request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        key = f"ip:{client_ip}:{request.url.path}"
        allowed = _counter.increment_and_check(key, limit, window_seconds)
        if not allowed:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

    return dependency


def rate_limit_user(limit: int, window_seconds: int) -> Callable[[Request], None]:
    """Dependency to rate limit by authenticated user (requires auth earlier in dependency order)."""

    def dependency(request: Request) -> None:
        user_id: Optional[str] = getattr(request.state, "user_id", None)
        # Fallback to IP if user not available
        fallback = request.client.host if request.client else "unknown"
        key = f"user:{user_id or fallback}:{request.url.path}"
        allowed = _counter.increment_and_check(key, limit, window_seconds)
        if not allowed:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

    return dependency
