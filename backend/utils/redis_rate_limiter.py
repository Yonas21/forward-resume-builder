"""
Redis-backed rate limiter with IP+user keys and backoff for auth routes.

Requires REDIS_URL env var in production. Fallback to memory if unavailable.
"""
from __future__ import annotations

import os
import time
import math
from typing import Optional

from fastapi import Request, HTTPException

try:
    import redis
except Exception:  # pragma: no cover - redis optional
    redis = None  # type: ignore


class RedisRateLimiter:
    def __init__(self, url: Optional[str]) -> None:
        self.client = redis.from_url(url) if (redis and url) else None

    def allow(self, key: str, limit: int, window_seconds: int) -> bool:
        if not self.client:
            return True  # if no redis, allow (caller should have memory fallback)
        now = int(time.time())
        pipe = self.client.pipeline()
        bucket_key = f"rate:{key}:{now // window_seconds}"
        # increment, set expiry, and read
        pipe.incr(bucket_key, 1)
        pipe.expire(bucket_key, window_seconds + 1)
        pipe.get(bucket_key)
        _, _, current = pipe.execute()
        current_int = int(current or 0)
        return current_int <= limit

    def backoff(self, key: str, failure_count: int) -> int:
        # exponential backoff seconds
        return min(300, int(math.pow(2, min(8, failure_count))))


redis_rate_limiter = RedisRateLimiter(os.getenv("REDIS_URL"))
