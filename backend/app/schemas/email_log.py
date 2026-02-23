from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.models.email_log import EmailStatus


class EmailLogResponse(BaseModel):
    id: str
    notification_id: str | None = None
    to_email: str
    subject: str
    template_name: str | None = None
    status: EmailStatus
    attempt_count: int
    last_error: str | None = None
    sent_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class EmailLogListResponse(BaseModel):
    items: list[EmailLogResponse]
    total: int
    skip: int
    limit: int
    stats: dict[str, int]


class EmailLogRetryResponse(BaseModel):
    success: bool
    message: str
    email_log_id: str

