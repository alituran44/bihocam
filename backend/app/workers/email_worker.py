from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any

from sqlalchemy import select

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.email_log import EmailLog, EmailStatus
from app.services.email_queue import dequeue_email_job, enqueue_email_job, move_due_delayed_jobs, queue_health
from app.services.email_service import EmailService
from app.services.email_templates import render_email_template

BACKOFF_SECONDS = [60, 300, 900]


async def _process_job(job: dict[str, Any]) -> None:
    log_id = job.get("email_log_id")
    if not log_id:
        return

    async with AsyncSessionLocal() as db:
        log = await db.get(EmailLog, log_id)
        if not log:
            lookup_retry = int(job.get("lookup_retry") or 0)
            if lookup_retry < 5:
                await enqueue_email_job(
                    {"email_log_id": log_id, "lookup_retry": lookup_retry + 1},
                    delay_seconds=2,
                )
            return

        payload = log.payload or {}

        to_email = payload.get("to_email") or log.to_email
        subject = payload.get("subject") or log.subject
        template_name = payload.get("template_name") or log.template_name
        context = payload.get("context") or {}
        plain_body = payload.get("plain_body")
        html_body = payload.get("html_body")

        try:
            service = await EmailService.from_db(db)

            # NOT: CRM kampanyaları için template_name="custom_template" sadece
            # bir işaretçi; gerçek HTML/Plain body payload içinde geliyor.
            # Bu durumda filesystem'den Jinja template yüklemeye çalışmıyoruz.
            if template_name and template_name != "custom_template":
                rendered = await render_email_template(
                    db,
                    template_name,
                    subject=subject,
                    context=context,
                    plain_body=plain_body,
                )
                html_body = rendered.html_body
                plain_body = rendered.plain_body

            if not html_body:
                html_body = f"<p>{subject}</p>"

            await service.send_email(
                to=to_email,
                subject=subject,
                html_body=html_body,
                plain_body=plain_body,
            )

            log.status = EmailStatus.SENT
            log.sent_at = datetime.utcnow()
            log.last_error = None
            log.attempt_count = int(log.attempt_count or 0) + 1
            await db.commit()
        except Exception as exc:
            attempts = int(log.attempt_count or 0) + 1
            log.attempt_count = attempts
            log.last_error = str(exc)

            if attempts >= settings.EMAIL_RETRY_MAX_ATTEMPTS:
                log.status = EmailStatus.FAILED
                await db.commit()
                return

            delay = BACKOFF_SECONDS[min(attempts - 1, len(BACKOFF_SECONDS) - 1)]
            log.status = EmailStatus.RETRYING
            await db.commit()

            await enqueue_email_job({"email_log_id": log.id}, delay_seconds=delay)


async def run_worker_loop() -> None:
    sleep_seconds = max(1.0, 60.0 / max(1, settings.EMAIL_RATE_LIMIT_PER_MINUTE))

    while True:
        await move_due_delayed_jobs(limit=200)
        job = await dequeue_email_job(timeout=5)
        if job:
            await _process_job(job)
            await asyncio.sleep(sleep_seconds)
        else:
            await asyncio.sleep(0.5)


async def healthcheck() -> dict[str, int | bool]:
    return await queue_health()


if __name__ == "__main__":
    asyncio.run(run_worker_loop())

