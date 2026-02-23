from __future__ import annotations

import json
import time
from typing import Any

import redis.asyncio as redis

from app.core.config import settings


QUEUE_KEY = settings.EMAIL_QUEUE_KEY
DELAYED_QUEUE_KEY = f"{QUEUE_KEY}:delayed"


def _redis_client() -> redis.Redis:
    return redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)


async def enqueue_email_job(job: dict[str, Any], delay_seconds: int = 0) -> None:
    client = _redis_client()
    payload = json.dumps(job, ensure_ascii=False)

    if delay_seconds > 0:
        due_at = int(time.time()) + delay_seconds
        await client.zadd(DELAYED_QUEUE_KEY, {payload: due_at})
    else:
        await client.rpush(QUEUE_KEY, payload)


async def dequeue_email_job(timeout: int = 5) -> dict[str, Any] | None:
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


async def queue_health() -> dict[str, int | bool]:
    client = _redis_client()
    pong = await client.ping()
    queued = await client.llen(QUEUE_KEY)
    delayed = await client.zcard(DELAYED_QUEUE_KEY)
    return {"ok": bool(pong), "queued": int(queued), "delayed": int(delayed)}

