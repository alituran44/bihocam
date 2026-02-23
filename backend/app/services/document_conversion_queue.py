"""
Document Conversion Queue (EP10-BE-12)

Redis-based queue for document conversion tasks.
Similar to email_queue.py pattern.
"""

from __future__ import annotations

import json
import time
from typing import Any

import redis.asyncio as redis

from app.core.config import settings


QUEUE_KEY = "document_conversion:queue"
DELAYED_QUEUE_KEY = f"{QUEUE_KEY}:delayed"


def _redis_client() -> redis.Redis:
    return redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)


async def enqueue_conversion_job(job: dict[str, Any], delay_seconds: int = 0) -> str:
    """
    Document conversion job'u kuyruğa ekle
    
    Returns:
        str: Job ID
    """
    client = _redis_client()
    job_id = job.get("job_id") or f"conv_{int(time.time())}_{uuid4().hex[:8]}"
    job["job_id"] = job_id
    payload = json.dumps(job, ensure_ascii=False)

    if delay_seconds > 0:
        due_at = int(time.time()) + delay_seconds
        await client.zadd(DELAYED_QUEUE_KEY, {payload: due_at})
    else:
        await client.rpush(QUEUE_KEY, payload)

    return job_id


async def dequeue_conversion_job(timeout: int = 5) -> dict[str, Any] | None:
    """Document conversion job'u kuyruktan al"""
    client = _redis_client()
    item = await client.blpop(QUEUE_KEY, timeout=timeout)
    if not item:
        return None

    _, payload = item
    try:
        return json.loads(payload)
    except json.JSONDecodeError:
        return None


async def move_due_delayed_jobs(limit: int = 100) -> int:
    """Gecikmiş job'ları ana kuyruğa taşı"""
    client = _redis_client()
    now_ts = int(time.time())
    payloads = await client.zrangebyscore(DELAYED_QUEUE_KEY, min=0, max=now_ts, start=0, num=limit)
    if not payloads:
        return 0

    moved = 0
    for payload in payloads:
        removed = await client.zrem(DELAYED_QUEUE_KEY, payload)
        if removed:
            await client.rpush(QUEUE_KEY, payload)
            moved += 1

    return moved


async def get_job_status(job_id: str) -> dict[str, Any] | None:
    """Job durumunu kontrol et"""
    client = _redis_client()
    status_key = f"document_conversion:status:{job_id}"
    status_json = await client.get(status_key)
    if not status_json:
        return None
    
    try:
        return json.loads(status_json)
    except json.JSONDecodeError:
        return None


async def set_job_status(job_id: str, status: dict[str, Any], ttl: int = 86400) -> None:
    """Job durumunu kaydet (24 saat TTL)"""
    client = _redis_client()
    status_key = f"document_conversion:status:{job_id}"
    await client.setex(status_key, ttl, json.dumps(status, ensure_ascii=False))


async def queue_health() -> dict[str, int | bool]:
    """Queue health check"""
    client = _redis_client()
    pong = await client.ping()
    queued = await client.llen(QUEUE_KEY)
    delayed = await client.zcard(DELAYED_QUEUE_KEY)
    return {"ok": bool(pong), "queued": int(queued), "delayed": int(delayed)}
