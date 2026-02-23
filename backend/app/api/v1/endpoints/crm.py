from __future__ import annotations

import csv
from datetime import datetime, timezone
import io
import logging
import time

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from jinja2 import Template
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from starlette.responses import Response

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.crm import CrmAudience, CrmAudienceMember, CrmEmailTemplate
from app.models.email_log import EmailLog, EmailStatus
from app.models.site_settings import SiteSettings
from app.models.user import User, UserRole
from app.schemas.site_settings import (
    EmailCampaignPreviewRequest,
    EmailCampaignPreviewResponse,
    EmailCampaignRecipientPreviewItem,
    EmailCampaignSendRequest,
    EmailCampaignSendResponse,
    EmailAudienceCsvImportResponse,
    EmailCustomSegmentCreate,
    EmailCustomSegmentResponse,
    EmailCustomSegmentUpdate,
    EmailCustomTemplateCreate,
    EmailCustomTemplateResponse,
    EmailCustomTemplateUpdate,
    EmailSegmentResponse,
    EmailTemplateMeta,
    EmailTemplatePreviewRequest,
    EmailTemplatePreviewResponse,
    EmailTestRequest,
    EmailTestResponse,
)
from app.services.email_queue import enqueue_email_job
from app.services.email_templates import get_email_template_catalog, render_email_template


router = APIRouter()
logger = logging.getLogger(__name__)

EMAIL_SEGMENTS: dict[str, dict[str, str]] = {
    "all_students": {"title": "Tum Ogrenciler", "description": "Sistemdeki tum aktif ogrencilere gonderir."},
    "active_teachers": {"title": "Aktif Egitmenler", "description": "Sistemdeki aktif ogretmenlere gonderir."},
    "verified_users": {"title": "Dogrulanmis Kullanicilar", "description": "Dogrulanmis tum aktif kullanicilara gonderir."},
    "inactive_users": {"title": "Pasif Kullanicilar", "description": "Hesabi pasif olan kullanicilara gonderir."},
}


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


async def _get_or_create_settings(db: AsyncSession) -> SiteSettings:
    result = await db.execute(select(SiteSettings).order_by(SiteSettings.created_at.asc()).limit(1))
    row = result.scalar_one_or_none()
    if row:
        return row
    row = SiteSettings(general={}, smtp={}, seo={}, custom_code={})
    db.add(row)
    await db.flush()
    return row


async def _hydrate_crm_from_legacy_settings_if_needed(db: AsyncSession) -> None:
    settings_row = await _get_or_create_settings(db)
    custom_code = dict(settings_row.custom_code or {})
    changed = False

    template_id_rows = await db.execute(select(CrmEmailTemplate.id))
    existing_template_ids = set(template_id_rows.scalars().all())
    audience_id_rows = await db.execute(select(CrmAudience.id))
    existing_audience_ids = set(audience_id_rows.scalars().all())
    user_id_rows = await db.execute(select(User.id))
    existing_user_ids = set(user_id_rows.scalars().all())

    legacy_templates = custom_code.get("email_custom_templates")
    if isinstance(legacy_templates, list):
        for item in legacy_templates:
            if not isinstance(item, dict) or not item.get("id"):
                continue
            item_id = str(item.get("id"))
            if item_id in existing_template_ids:
                continue
            db.add(
                CrmEmailTemplate(
                    id=item_id,
                    name=item.get("name") or "Adsiz Sablon",
                    subject=item.get("subject") or "(Konu yok)",
                    html_body=item.get("html_body") or "<p>Icerik yok</p>",
                    plain_body=item.get("plain_body"),
                    description=item.get("description"),
                    variables_json=item.get("variables") if isinstance(item.get("variables"), list) else [],
                    created_at=datetime.fromisoformat(item["created_at"]) if item.get("created_at") else datetime.utcnow(),
                    updated_at=datetime.fromisoformat(item["updated_at"]) if item.get("updated_at") else datetime.utcnow(),
                )
            )
            changed = True

    legacy_segments = custom_code.get("email_custom_segments")
    if isinstance(legacy_segments, list):
        for item in legacy_segments:
            if not isinstance(item, dict) or not item.get("id"):
                continue
            audience_id = str(item.get("id"))
            if audience_id in existing_audience_ids:
                continue
            db.add(
                CrmAudience(
                    id=audience_id,
                    name=item.get("name") or "Adsiz Kitle",
                    description=item.get("description"),
                    created_at=datetime.fromisoformat(item["created_at"]) if item.get("created_at") else datetime.utcnow(),
                    updated_at=datetime.fromisoformat(item["updated_at"]) if item.get("updated_at") else datetime.utcnow(),
                )
            )
            raw_user_ids = item.get("user_ids")
            if isinstance(raw_user_ids, list):
                for user_id in list(dict.fromkeys(raw_user_ids)):
                    user_id_str = str(user_id)
                    if user_id_str not in existing_user_ids:
                        continue
                    db.add(CrmAudienceMember(audience_id=audience_id, user_id=user_id_str))
            changed = True

    if changed:
        await db.commit()
        logger.info("crm: hydrated legacy settings data into normalized tables")


def _template_to_response(template: CrmEmailTemplate) -> EmailCustomTemplateResponse:
    return EmailCustomTemplateResponse(
        id=template.id,
        name=template.name,
        subject=template.subject,
        html_body=template.html_body,
        plain_body=template.plain_body,
        description=template.description,
        variables=list(template.variables_json or []),
        created_at=template.created_at,
        updated_at=template.updated_at,
    )


def _segment_to_response(audience: CrmAudience) -> EmailCustomSegmentResponse:
    return EmailCustomSegmentResponse(
        id=audience.id,
        name=audience.name,
        description=audience.description,
        user_ids=[member.user_id for member in audience.members],
        created_at=audience.created_at,
        updated_at=audience.updated_at,
    )


async def _get_audience_or_404(db: AsyncSession, segment_id: str) -> CrmAudience:
    result = await db.execute(
        select(CrmAudience).options(selectinload(CrmAudience.members)).where(CrmAudience.id == segment_id)
    )
    audience = result.scalar_one_or_none()
    if not audience:
        raise HTTPException(status_code=404, detail="Segment bulunamadi")
    return audience


async def _get_audience_users(db: AsyncSession, audience: CrmAudience) -> list[User]:
    user_ids = [member.user_id for member in audience.members]
    if not user_ids:
        return []
    result = await db.execute(select(User).where(User.id.in_(user_ids)))
    users = result.scalars().all()
    user_map = {user.id: user for user in users}
    return [user_map[user_id] for user_id in user_ids if user_id in user_map]


async def _validate_user_ids_exist(db: AsyncSession, user_ids: list[str]) -> list[str]:
    deduped = list(dict.fromkeys(user_ids))
    result = await db.execute(select(User.id).where(User.id.in_(deduped)))
    existing = set(result.scalars().all())
    valid_ids = [user_id for user_id in deduped if user_id in existing]
    if not valid_ids:
        raise HTTPException(status_code=400, detail="Gecerli user bulunamadi")
    return valid_ids


def _build_users_query_from_targeting(
    *,
    segment_key: str | None = None,
    custom_segment_user_ids: list[str] | None = None,
    role: str | None = None,
    user_ids: list[str] | None = None,
):
    users_query = select(User)
    if segment_key:
        if segment_key not in EMAIL_SEGMENTS:
            raise HTTPException(status_code=400, detail="Gecersiz segment")
        if segment_key == "all_students":
            return users_query.where(User.is_active.is_(True), User.role == UserRole.STUDENT)
        if segment_key == "active_teachers":
            return users_query.where(User.is_active.is_(True), User.role == UserRole.TEACHER)
        if segment_key == "verified_users":
            return users_query.where(User.is_active.is_(True), User.is_verified.is_(True))
        if segment_key == "inactive_users":
            return users_query.where(User.is_active.is_(False))
    if custom_segment_user_ids is not None:
        if not custom_segment_user_ids:
            raise HTTPException(status_code=400, detail="Segmentte gecerli user bulunamadi")
        return users_query.where(User.id.in_(custom_segment_user_ids))
    if role:
        try:
            role_enum = UserRole(role)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Gecersiz rol") from exc
        return users_query.where(User.is_active.is_(True), User.role == role_enum)
    if user_ids:
        return users_query.where(User.id.in_(user_ids))
    raise HTTPException(
        status_code=400,
        detail="segment_key veya custom_segment_id veya role veya user_ids alanlarindan biri gerekli",
    )


@router.get("/system-templates", response_model=list[EmailTemplateMeta])
async def list_system_templates(current_user: User = Depends(require_admin)):
    return [EmailTemplateMeta(**item) for item in get_email_template_catalog()]


@router.post("/system-templates/preview", response_model=EmailTemplatePreviewResponse)
async def preview_system_template(
    body: EmailTemplatePreviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rendered = await render_email_template(
        db,
        body.template_name,
        subject=body.subject,
        context=body.context or {"user_name": current_user.full_name, "teacher_name": current_user.full_name},
    )
    return EmailTemplatePreviewResponse(
        template_name=body.template_name,
        subject=rendered.subject,
        html_body=rendered.html_body,
        plain_body=rendered.plain_body,
    )


@router.post("/system-templates/test", response_model=EmailTestResponse)
async def send_system_template_test(
    body: EmailTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rendered = await render_email_template(
        db,
        body.template_name or "welcome",
        subject=body.subject or "CRM Template Test",
        context=body.context or {"user_name": current_user.full_name, "teacher_name": current_user.full_name},
    )
    email_log = EmailLog(
        to_email=body.to_email,
        subject=rendered.subject,
        template_name=body.template_name,
        status=EmailStatus.PENDING,
        attempt_count=0,
        payload={
            "to_email": body.to_email,
            "subject": rendered.subject,
            "html_body": rendered.html_body,
            "plain_body": rendered.plain_body,
            "context": body.context or {},
            "template_name": body.template_name,
        },
    )
    db.add(email_log)
    await db.flush()
    await enqueue_email_job({"email_log_id": email_log.id})
    await db.commit()
    return EmailTestResponse(success=True, message="Test e-postasi kuyruga alindi")


@router.get("/templates", response_model=list[EmailCustomTemplateResponse])
async def list_custom_email_templates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    result = await db.execute(select(CrmEmailTemplate).order_by(CrmEmailTemplate.created_at.desc()))
    return [_template_to_response(item) for item in result.scalars().all()]


@router.post("/templates", response_model=EmailCustomTemplateResponse)
async def create_custom_email_template(
    payload: EmailCustomTemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    item = CrmEmailTemplate(
        name=payload.name,
        subject=payload.subject,
        html_body=payload.html_body,
        plain_body=payload.plain_body,
        description=payload.description,
        variables_json=payload.variables,
        created_by=current_user.id,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _template_to_response(item)


@router.put("/templates/{template_id}", response_model=EmailCustomTemplateResponse)
async def update_custom_email_template(
    template_id: str,
    payload: EmailCustomTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    result = await db.execute(select(CrmEmailTemplate).where(CrmEmailTemplate.id == template_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Ozel sablon bulunamadi")
    if payload.name is not None:
        target.name = payload.name
    if payload.subject is not None:
        target.subject = payload.subject
    if payload.html_body is not None:
        target.html_body = payload.html_body
    if payload.plain_body is not None:
        target.plain_body = payload.plain_body
    if payload.description is not None:
        target.description = payload.description
    if payload.variables is not None:
        target.variables_json = payload.variables
    await db.commit()
    await db.refresh(target)
    return _template_to_response(target)


@router.delete("/templates/{template_id}", response_model=EmailTestResponse)
async def delete_custom_email_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    result = await db.execute(select(CrmEmailTemplate).where(CrmEmailTemplate.id == template_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Ozel sablon bulunamadi")
    await db.delete(target)
    await db.commit()
    return EmailTestResponse(success=True, message="Ozel sablon silindi")


@router.get("/campaigns/segments", response_model=list[EmailSegmentResponse])
async def list_email_campaign_segments(current_user: User = Depends(require_admin)):
    return [EmailSegmentResponse(key=k, title=v["title"], description=v["description"]) for k, v in EMAIL_SEGMENTS.items()]


@router.get("/audiences", response_model=list[EmailCustomSegmentResponse])
async def list_custom_email_segments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    result = await db.execute(select(CrmAudience).options(selectinload(CrmAudience.members)).order_by(CrmAudience.created_at.desc()))
    return [_segment_to_response(segment) for segment in result.scalars().all()]


@router.post("/audiences", response_model=EmailCustomSegmentResponse)
async def create_custom_email_segment(
    payload: EmailCustomSegmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if not payload.user_ids:
        raise HTTPException(status_code=400, detail="user_ids bos olamaz")
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    deduped_user_ids = await _validate_user_ids_exist(db, payload.user_ids)
    audience = CrmAudience(name=payload.name, description=payload.description, created_by=current_user.id)
    db.add(audience)
    await db.flush()
    for user_id in deduped_user_ids:
        db.add(CrmAudienceMember(audience_id=audience.id, user_id=user_id))
    await db.commit()
    audience = await _get_audience_or_404(db, audience.id)
    return _segment_to_response(audience)


@router.put("/audiences/{segment_id}", response_model=EmailCustomSegmentResponse)
async def update_custom_email_segment(
    segment_id: str,
    payload: EmailCustomSegmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if payload.name is None and payload.description is None and payload.user_ids is None:
        raise HTTPException(status_code=400, detail="Guncellenecek en az bir alan gerekli")
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    target = await _get_audience_or_404(db, segment_id)
    if payload.name is not None:
        target.name = payload.name
    if payload.description is not None:
        target.description = payload.description
    if payload.user_ids is not None:
        if not payload.user_ids:
            raise HTTPException(status_code=400, detail="user_ids bos olamaz")
        deduped_user_ids = await _validate_user_ids_exist(db, payload.user_ids)
        await db.execute(delete(CrmAudienceMember).where(CrmAudienceMember.audience_id == target.id))
        for user_id in deduped_user_ids:
            db.add(CrmAudienceMember(audience_id=target.id, user_id=user_id))
    await db.commit()
    target = await _get_audience_or_404(db, target.id)
    return _segment_to_response(target)


@router.delete("/audiences/{segment_id}", response_model=EmailTestResponse)
async def delete_custom_email_segment(
    segment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    target = await _get_audience_or_404(db, segment_id)
    await db.delete(target)
    await db.commit()
    return EmailTestResponse(success=True, message="Segment silindi")


@router.get("/audiences/{segment_id}/export-csv")
async def export_audience_csv(
    segment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    audience = await _get_audience_or_404(db, segment_id)
    users = await _get_audience_users(db, audience)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["user_id", "full_name", "email", "role"])
    for user in users:
        writer.writerow([user.id, user.full_name or "", user.email or "", user.role.value if user.role else ""])

    filename = f"crm-audience-{audience.name.lower().replace(' ', '-')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/audiences/{segment_id}/import-csv", response_model=EmailAudienceCsvImportResponse)
async def import_audience_csv(
    segment_id: str,
    file: UploadFile = File(...),
    mode: str = Query(default="merge", pattern="^(merge|replace)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    audience = await _get_audience_or_404(db, segment_id)

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="CSV dosyasi bos")

    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV UTF-8 olmali") from exc

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV baslik satiri bulunamadi")

    has_user_id = "user_id" in reader.fieldnames
    has_email = "email" in reader.fieldnames
    if not has_user_id and not has_email:
        raise HTTPException(status_code=400, detail="CSV'de user_id veya email kolonu olmali")

    requested_user_ids: list[str] = []
    requested_emails: list[str] = []
    for row in reader:
        if has_user_id and row.get("user_id"):
            requested_user_ids.append(str(row["user_id"]).strip())
        elif has_email and row.get("email"):
            requested_emails.append(str(row["email"]).strip().lower())

    deduped_user_ids = list(dict.fromkeys([item for item in requested_user_ids if item]))
    deduped_emails = list(dict.fromkeys([item for item in requested_emails if item]))

    found_ids: set[str] = set()
    if deduped_user_ids:
        result = await db.execute(select(User.id).where(User.id.in_(deduped_user_ids)))
        found_ids.update(result.scalars().all())
    if deduped_emails:
        result = await db.execute(select(User.id).where(User.email.in_(deduped_emails)))
        found_ids.update(result.scalars().all())

    if not found_ids:
        raise HTTPException(status_code=400, detail="CSV'den eslesen gecerli kullanici bulunamadi")

    if mode == "replace":
        target_ids = list(found_ids)
    else:
        existing_ids = {member.user_id for member in audience.members}
        target_ids = list(existing_ids.union(found_ids))

    await db.execute(delete(CrmAudienceMember).where(CrmAudienceMember.audience_id == audience.id))
    for user_id in target_ids:
        db.add(CrmAudienceMember(audience_id=audience.id, user_id=user_id))

    await db.commit()
    audience = await _get_audience_or_404(db, audience.id)
    return EmailAudienceCsvImportResponse(
        success=True,
        message=f"{len(found_ids)} kullanici CSV'den eklendi ({mode})",
        segment=_segment_to_response(audience),
    )


@router.post("/campaigns/send", response_model=EmailCampaignSendResponse)
async def send_email_campaign(
    body: EmailCampaignSendRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    template: CrmEmailTemplate | None = None
    if body.template_id:
        result = await db.execute(select(CrmEmailTemplate).where(CrmEmailTemplate.id == body.template_id))
        template = result.scalar_one_or_none()
    subject_template = body.subject or (template.subject if template else None)
    html_template = body.html_body or (template.html_body if template else None)
    plain_template = body.plain_body or (template.plain_body if template else None)
    if not subject_template or not html_template:
        raise HTTPException(status_code=400, detail="subject ve html_body zorunludur")

    custom_segment_user_ids: list[str] | None = None
    if body.custom_segment_id:
        audience = await _get_audience_or_404(db, body.custom_segment_id)
        custom_segment_user_ids = [member.user_id for member in audience.members]

    users_query = _build_users_query_from_targeting(
        segment_key=body.segment_key,
        custom_segment_user_ids=custom_segment_user_ids,
        role=body.role,
        user_ids=body.user_ids,
    )
    users_result = await db.execute(users_query)
    users = [u for u in users_result.scalars().all() if u.email]
    if not users:
        return EmailCampaignSendResponse(
            success=True,
            queued_count=0,
            message="Uygun alici bulunamadi",
            scheduled_for=body.schedule_at,
        )

    scheduled_for: datetime | None = None
    delay_seconds = 0
    if body.schedule_at is not None:
        schedule_at = body.schedule_at
        if schedule_at.tzinfo is not None:
            schedule_at = schedule_at.astimezone(timezone.utc).replace(tzinfo=None)
        scheduled_for = schedule_at
        delay_seconds = max(0, int((schedule_at - datetime.utcnow()).total_seconds()))

    queued_count = 0
    for user in users:
        merged_context = {
            "user_id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value if user.role else None,
            **(body.context or {}),
        }
        subject = Template(subject_template).render(**merged_context)
        html_body = Template(html_template).render(**merged_context)
        plain_body = Template(plain_template).render(**merged_context) if plain_template else None
        email_log = EmailLog(
            to_email=user.email,
            subject=subject,
            template_name="custom_template",
            status=EmailStatus.PENDING,
            attempt_count=0,
            payload={
                "to_email": user.email,
                "subject": subject,
                "html_body": html_body,
                "plain_body": plain_body,
                "context": merged_context,
                "template_id": body.template_id,
                "segment_key": body.segment_key,
            },
        )
        db.add(email_log)
        await db.flush()
        await enqueue_email_job({"email_log_id": email_log.id}, delay_seconds=delay_seconds)
        queued_count += 1
    await db.commit()
    message = f"{queued_count} e-posta kuyruga alindi"
    if scheduled_for is not None:
        message = f"{queued_count} e-posta planlandi"
    return EmailCampaignSendResponse(
        success=True,
        queued_count=queued_count,
        message=message,
        scheduled_for=scheduled_for,
    )


@router.post("/campaigns/preview-recipients", response_model=EmailCampaignPreviewResponse)
async def preview_email_campaign_recipients(
    body: EmailCampaignPreviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await _hydrate_crm_from_legacy_settings_if_needed(db)
    custom_segment_user_ids: list[str] | None = None
    if body.custom_segment_id:
        audience = await _get_audience_or_404(db, body.custom_segment_id)
        custom_segment_user_ids = [member.user_id for member in audience.members]
    users_query = _build_users_query_from_targeting(
        segment_key=body.segment_key,
        custom_segment_user_ids=custom_segment_user_ids,
        role=body.role,
        user_ids=body.user_ids,
    )
    users_result = await db.execute(users_query)
    users = [u for u in users_result.scalars().all() if u.email]
    role_breakdown: dict[str, int] = {}
    for user in users:
        role_key = user.role.value if user.role else "unknown"
        role_breakdown[role_key] = role_breakdown.get(role_key, 0) + 1
    sample_items = [
        EmailCampaignRecipientPreviewItem(
            id=str(user.id),
            full_name=user.full_name,
            email=user.email,
            role=user.role.value if user.role else None,
        )
        for user in users[: body.sample_limit]
    ]
    return EmailCampaignPreviewResponse(
        total_recipients=len(users),
        sample_recipients=sample_items,
        role_breakdown=role_breakdown,
    )
