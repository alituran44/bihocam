from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.site_announcement import AnnouncementType, SiteAnnouncement
from app.models.user import User, UserRole
from app.schemas.site_announcement import (
    SiteAnnouncementCreate,
    SiteAnnouncementResponse,
    SiteAnnouncementUpdate,
)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


@router.get("/admin/announcements", response_model=list[SiteAnnouncementResponse])
async def list_announcements(
    is_active: bool | None = Query(None, description="Aktif/pasif filtresi"),
    type: AnnouncementType | None = Query(None, description="Duyuru tipi filtresi"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: Tüm duyuruları listele"""
    query = select(SiteAnnouncement)

    if is_active is not None:
        query = query.where(SiteAnnouncement.is_active == is_active)
    if type is not None:
        query = query.where(SiteAnnouncement.type == type)

    query = query.order_by(SiteAnnouncement.priority.desc(), SiteAnnouncement.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    announcements = result.scalars().all()

    return [SiteAnnouncementResponse.model_validate(ann) for ann in announcements]


@router.post("/admin/announcements", response_model=SiteAnnouncementResponse)
async def create_announcement(
    payload: SiteAnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: Yeni duyuru oluştur"""
    announcement = SiteAnnouncement(**payload.model_dump())
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)

    return SiteAnnouncementResponse.model_validate(announcement)


@router.get("/admin/announcements/{announcement_id}", response_model=SiteAnnouncementResponse)
async def get_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: Tek duyuru detayı"""
    result = await db.execute(
        select(SiteAnnouncement).where(SiteAnnouncement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()

    if not announcement:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")

    return SiteAnnouncementResponse.model_validate(announcement)


@router.put("/admin/announcements/{announcement_id}", response_model=SiteAnnouncementResponse)
async def update_announcement(
    announcement_id: str,
    payload: SiteAnnouncementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: Duyuru güncelle"""
    result = await db.execute(
        select(SiteAnnouncement).where(SiteAnnouncement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()

    if not announcement:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(announcement, key, value)

    await db.commit()
    await db.refresh(announcement)

    return SiteAnnouncementResponse.model_validate(announcement)


@router.delete("/admin/announcements/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: Duyuru sil (soft delete - is_active=False yap)"""
    result = await db.execute(
        select(SiteAnnouncement).where(SiteAnnouncement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()

    if not announcement:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")

    announcement.is_active = False
    await db.commit()

    return {"message": "Duyuru silindi"}


@router.get("/announcements/active", response_model=list[SiteAnnouncementResponse])
async def get_active_announcements(
    target_audience: str | None = Query(None, description="Hedef kitle: all, students, teachers, admins"),
    db: AsyncSession = Depends(get_db),
):
    """Public: Aktif ve tarih aralığı içindeki duyuruları döner (auth gereksiz)"""
    now = datetime.utcnow()

    query = select(SiteAnnouncement).where(
        SiteAnnouncement.is_active == True,
        or_(
            SiteAnnouncement.starts_at.is_(None),
            SiteAnnouncement.starts_at <= now,
        ),
        or_(
            SiteAnnouncement.expires_at.is_(None),
            SiteAnnouncement.expires_at >= now,
        ),
    )

    if target_audience:
        query = query.where(
            or_(
                SiteAnnouncement.target_audience == target_audience,
                SiteAnnouncement.target_audience == "all",
            )
        )

    query = query.order_by(SiteAnnouncement.priority.desc(), SiteAnnouncement.created_at.desc())

    result = await db.execute(query)
    announcements = result.scalars().all()

    return [SiteAnnouncementResponse.model_validate(ann) for ann in announcements]
