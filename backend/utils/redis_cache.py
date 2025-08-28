"""
Redis cache utilities for the Resume Builder application.
"""
import json
import logging
from typing import Any, Optional, Union
from datetime import datetime, date
import redis.asyncio as redis
from core.config import settings

logger = logging.getLogger(__name__)

class RedisCache:
    """Redis cache client with async operations."""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self._connection_pool = None
    
    async def connect(self):
        """Initialize Redis connection."""
        try:
            if settings.redis_password:
                self.redis_client = redis.Redis.from_url(
                    settings.redis_url,
                    password=settings.redis_password,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True
                )
            else:
                self.redis_client = redis.Redis.from_url(
                    settings.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True
                )
            
            # Test connection
            await self.redis_client.ping()
            logger.info("Redis cache connected successfully")
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    async def disconnect(self):
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Redis cache disconnected")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.redis_client:
            return None
        
        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return None
    
    def _serialize_value(self, value: Any) -> str:
        """Serialize value to JSON with proper handling of complex objects."""
        def custom_serializer(obj):
            if hasattr(obj, 'dict'):
                # Handle Pydantic models
                return obj.dict()
            elif hasattr(obj, '__dict__'):
                # Handle regular objects
                return obj.__dict__
            elif isinstance(obj, (datetime, date)):
                # Handle datetime objects
                return obj.isoformat()
            elif hasattr(obj, 'isoformat'):
                # Handle other date-like objects
                return obj.isoformat()
            else:
                # Fallback to string representation
                return str(obj)
        
        try:
            return json.dumps(value, default=custom_serializer, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error serializing value for cache: {e}")
            # Fallback to string representation
            return json.dumps(str(value), ensure_ascii=False)

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL."""
        if not self.redis_client:
            return False
        
        try:
            ttl = ttl or settings.redis_cache_ttl
            serialized_value = self._serialize_value(value)
            await self.redis_client.setex(key, ttl, serialized_value)
            return True
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self.redis_client:
            return False
        
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        if not self.redis_client:
            return False
        
        try:
            return bool(await self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Error checking cache key {key}: {e}")
            return False
    
    async def expire(self, key: str, ttl: int) -> bool:
        """Set expiration time for key."""
        if not self.redis_client:
            return False
        
        try:
            return bool(await self.redis_client.expire(key, ttl))
        except Exception as e:
            logger.error(f"Error setting expiration for key {key}: {e}")
            return False
    
    async def clear_user_cache(self, user_id: str):
        """Clear all cache entries for a specific user."""
        if not self.redis_client:
            return
        
        try:
            pattern = f"user:{user_id}:*"
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
                logger.info(f"Cleared {len(keys)} cache entries for user {user_id}")
        except Exception as e:
            logger.error(f"Error clearing user cache for {user_id}: {e}")
    
    async def clear_all_cache(self):
        """Clear all cache entries."""
        if not self.redis_client:
            return
        
        try:
            await self.redis_client.flushdb()
            logger.info("Cleared all cache entries")
        except Exception as e:
            logger.error(f"Error clearing all cache: {e}")
    
    async def clear_pattern(self, pattern: str):
        """Clear cache entries matching a pattern."""
        if not self.redis_client:
            return
        
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
                logger.info(f"Cleared {len(keys)} cache entries matching pattern: {pattern}")
        except Exception as e:
            logger.error(f"Error clearing cache pattern {pattern}: {e}")

# Global cache instance
cache = RedisCache()

# Cache decorators
def cache_result(ttl: Optional[int] = None, key_prefix: str = ""):
    """Decorator to cache function results."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # Try to get from cache
            cached_result = await cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {cache_key}")
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache.set(cache_key, result, ttl)
            logger.debug(f"Cached result for {cache_key}")
            
            return result
        return wrapper
    return decorator

def cache_user_data(ttl: Optional[int] = None):
    """Decorator to cache user-specific data."""
    return cache_result(ttl or settings.redis_user_cache_ttl, "user_data")

def cache_ai_response(ttl: Optional[int] = None):
    """Decorator to cache AI service responses."""
    return cache_result(ttl or settings.redis_ai_cache_ttl, "ai_response")
