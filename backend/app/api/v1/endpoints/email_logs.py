from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.email_log import EmailLog, EmailStatus
from app.models.user import User, UserRole
from app.schemas.email_log import EmailLogListResponse, EmailLogResponse, EmailLogRetryResponse
from app.services.email_queue import enqueue_email_job, queue_health


router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


@router.get("", response_model=EmailLogListResponse)
@router.get("/", response_model=EmailLogListResponse)
async def list_email_logs(
    skip: int = 0,
    limit: int = 20,
    status: EmailStatus | None = Query(default=None),
    email: str | None = Query(default=None),
    from_date: datetime | None = Query(default=None),
    to_date: datetime | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    stmt = select(EmailLog)

    if status is not None:
        stmt = stmt.where(EmailLog.status == status)
    if email:
        stmt = stmt.where(EmailLog.to_email.ilike(f"%{email}%"))
    if from_date is not None:
        stmt = stmt.where(EmailLog.created_at >= from_date)
    if to_date is not None:
        stmt = stmt.where(EmailLog.created_at <= to_date)

    total_result = await db.execute(select(func.count()).select_from(stmt.subquery()))
    total = int(total_result.scalar() or 0)

    paged = stmt.order_by(EmailLog.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(paged)
    logs = result.scalars().all()

    stats_result = await db.execute(
        select(EmailLog.status, func.count(EmailLog.id)).group_by(EmailLog.status)
    )
    stats = {"total": total, "sent": 0, "failed": 0, "pending": 0, "retrying": 0}
    for row_status, count in stats_result.all():
        stats[row_status.value] = int(count or 0)

    return EmailLogListResponse(
        items=[EmailLogResponse.model_validate(item) for item in logs],
        total=total,
        skip=skip,
        limit=limit,
        stats=stats,
    )


@router.post("/{email_log_id}/retry", response_model=EmailLogRetryResponse)
async def retry_email_log(
    email_log_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    log = await db.get(EmailLog, email_log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Email log kaydı bulunamadı")

    if log.status == EmailStatus.SENT:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten gönderilmiş")

    log.status = EmailStatus.RETRYING
    await db.commit()

    await enqueue_email_job({"email_log_id": log.id}, delay_seconds=0)

    return EmailLogRetryResponse(
        success=True,
        message="E-posta yeniden kuyruğa alındı",
        email_log_id=log.id,
    )


@router.get("/worker-health")
async def email_worker_health(
    current_user: User = Depends(require_admin),
):
    return await queue_health()

