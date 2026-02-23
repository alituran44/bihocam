from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.email_log import EmailLog, EmailStatus
from app.models.site_settings import SiteSettings
from app.models.user import User, UserRole
from app.schemas.site_settings import (
    EmailTestRequest,
    EmailTestResponse,
    PublicSettingsResponse,
    SiteSettingsResponse,
    SiteSettingsUpdate,
)
from app.services.email_queue import enqueue_email_job
from app.services.email_templates import render_email_template


router = APIRouter()
logger = logging.getLogger(__name__)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


async def _get_or_create_settings(db: AsyncSession) -> SiteSettings:
    result = await db.execute(select(SiteSettings).order_by(SiteSettings.created_at.asc()).limit(1))
    row = result.scalar_one_or_none()
    if row:
        logger.warning("site_settings: using existing row id=%s", row.id)
        return row

    row = SiteSettings(general={}, smtp={}, platform={}, seo={}, custom_code={})
    db.add(row)
    await db.flush()
    logger.warning("site_settings: created new row id=%s", row.id)
    return row


def _mask_smtp(smtp: dict | None) -> dict:
    data = dict(smtp or {})
    if data.get("password_encrypted"):
        data["password_encrypted"] = "********"
    return data


@router.get("/", response_model=SiteSettingsResponse)
async def get_site_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    row = await _get_or_create_settings(db)
    return SiteSettingsResponse(
        general=row.general or {},
        smtp=_mask_smtp(row.smtp),
        platform=row.platform or {},
        seo=row.seo or {},
        custom_code=row.custom_code or {},
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.put("/", response_model=SiteSettingsResponse)
async def update_site_settings(
    payload: SiteSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    row = await _get_or_create_settings(db)

    if payload.general is not None:
        row.general = payload.general

    if payload.smtp is not None:
        existing = dict(row.smtp or {})
        incoming = dict(payload.smtp)

        incoming_password = incoming.get("password_encrypted")
        if incoming_password == "********":
            incoming["password_encrypted"] = existing.get("password_encrypted")

        row.smtp = {**existing, **incoming}

    if payload.seo is not None:
        row.seo = payload.seo

    if payload.platform is not None:
        # maintenance_estimated_end string olarak gelebilir, datetime'a çevir
        platform_data = dict(payload.platform)
        if "maintenance_estimated_end" in platform_data and platform_data["maintenance_estimated_end"]:
            from datetime import datetime
            est_end = platform_data["maintenance_estimated_end"]
            if isinstance(est_end, str):
                try:
                    # ISO format string'den datetime'a çevir
                    platform_data["maintenance_estimated_end"] = datetime.fromisoformat(est_end.replace("Z", "+00:00"))
                except (ValueError, AttributeError):
                    # Parse edilemezse None yap
                    platform_data["maintenance_estimated_end"] = None
            elif not isinstance(est_end, datetime):
                platform_data["maintenance_estimated_end"] = None
        row.platform = platform_data

    if payload.custom_code is not None:
        row.custom_code = payload.custom_code

    await db.commit()
    await db.refresh(row)

    return SiteSettingsResponse(
        general=row.general or {},
        smtp=_mask_smtp(row.smtp),
        platform=row.platform or {},
        seo=row.seo or {},
        custom_code=row.custom_code or {},
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.post("/email-test", response_model=EmailTestResponse)
async def send_test_email(
    body: EmailTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    try:
        template_name = body.template_name
        subject = body.subject or "BiHocam SMTP Test"
        html_body = "<p>Bu bir test e-postasidir. SMTP baglantisi basarili.</p>"
        plain_body = "Bu bir test e-postasidir. SMTP baglantisi basarili."
        context_payload = body.context or {"user_name": current_user.full_name, "teacher_name": current_user.full_name}

        if body.template_name:
            rendered = await render_email_template(
                db,
                body.template_name,
                subject=body.subject or "BiHocam Test E-postasi",
                context=context_payload,
            )
            subject = rendered.subject
            html_body = rendered.html_body
            plain_body = rendered.plain_body

        email_log = EmailLog(
            to_email=body.to_email,
            subject=subject,
            template_name=template_name,
            status=EmailStatus.PENDING,
            attempt_count=0,
            payload={
                "to_email": body.to_email,
                "subject": subject,
                "html_body": html_body,
                "plain_body": plain_body,
                "context": context_payload,
                "template_name": template_name,
            },
        )
        db.add(email_log)
        await db.flush()
        await enqueue_email_job({"email_log_id": email_log.id})
        await db.commit()

        return EmailTestResponse(success=True, message="Test e-postasi kuyruga alindi")
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Test e-postasi gonderilemedi: {exc}") from exc


@router.get("/public", response_model=PublicSettingsResponse)
async def get_public_settings(
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint - sadece güvenli bilgileri döner (auth gereksiz)"""
    row = await _get_or_create_settings(db)
    general = row.general or {}
    
    return PublicSettingsResponse(
        site_title=general.get("site_title"),
        logo_url=general.get("logo_url"),
        favicon_url=general.get("favicon_url"),
        footer_text=general.get("footer_text"),
        contact_email=general.get("contact_email"),
        contact_phone=general.get("contact_phone"),
        meta_description=general.get("meta_description"),
        meta_keywords=general.get("meta_keywords"),
        seo=row.seo or {},  # SEO kodları public (tracking için)
        custom_code=row.custom_code or {},  # Custom kodlar public (sayfaya inject için)
        platform=row.platform or {},  # Platform ayarları (maintenance mode için)
    )
