"""
P2-03: Redis cache utility
Basit key-value cache — SiteSettings, kategoriler, featured courses gibi
sık okunan ama nadir değişen veriler için.
"""
import json
import logging
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis | None:
    """Lazy-init Redis connection. Bağlantı kurulamazsa None döner."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    try:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=2,
        )
        await _redis_client.ping()
        logger.info("Redis cache connected")
        return _redis_client
    except Exception as e:
        logger.warning(f"Redis bağlantısı kurulamadı, cache devre dışı: {e}")
        _redis_client = None
        return None


async def cache_get(key: str) -> Any | None:
    """Cache'den değer oku. Redis yoksa veya key yoksa None."""
    r = await get_redis()
    if not r:
        return None
    try:
        value = await r.get(key)
        if value is not None:
            return json.loads(value)
    except Exception as e:
        logger.debug(f"Cache read error for '{key}': {e}")
    return None


async def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> bool:
    """Cache'e değer yaz. Default TTL 5 dakika."""
    r = await get_redis()
    if not r:
        return False
    try:
        await r.setex(key, ttl_seconds, json.dumps(value, default=str))
        return True
    except Exception as e:
        logger.debug(f"Cache write error for '{key}': {e}")
        return False


async def cache_delete(key: str) -> bool:
    """Cache'den key sil (invalidation)."""
    r = await get_redis()
    if not r:
        return False
    try:
        await r.delete(key)
        return True
    except Exception as e:
        logger.debug(f"Cache delete error for '{key}': {e}")
        return False


async def cache_delete_pattern(pattern: str) -> int:
    """Pattern'e uyan tüm key'leri sil. Örnek: 'categories:*'"""
    r = await get_redis()
    if not r:
        return 0
    try:
        keys = []
        async for key in r.scan_iter(match=pattern, count=100):
            keys.append(key)
        if keys:
            await r.delete(*keys)
        return len(keys)
    except Exception as e:
        logger.debug(f"Cache pattern delete error for '{pattern}': {e}")
        return 0


# Cache key sabitleri
CACHE_SITE_SETTINGS = "site_settings"
CACHE_CATEGORIES = "categories:all"
CACHE_FEATURED_COURSES = "courses:featured"
