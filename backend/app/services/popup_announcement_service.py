from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.popup_announcement import PopupAnnouncement, PopupType
from app.models.user import UserRole
from app.schemas.popup_announcement import (
    PopupAnnouncementCreate,
    PopupAnnouncementUpdate,
)


def _normalize_datetime(dt: datetime | None) -> datetime | None:
    """Convert timezone-aware datetime to UTC and make it timezone-naive."""
    if dt is None:
        return None
    if dt.tzinfo is not None:
        # Convert to UTC and remove timezone info
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


async def create_popup_announcement(
    db: AsyncSession,
    popup_data: PopupAnnouncementCreate,
    admin_id: str,
) -> PopupAnnouncement:
    """Yeni pop-up duyurusu oluştur."""
    # Normalize datetime fields (convert to UTC and make timezone-naive)
    popup_dict = popup_data.model_dump()
    popup_dict["starts_at"] = _normalize_datetime(popup_dict.get("starts_at"))
    popup_dict["expires_at"] = _normalize_datetime(popup_dict.get("expires_at"))
    
    # Date validation
    if popup_dict["starts_at"] and popup_dict["expires_at"]:
        if popup_dict["expires_at"] <= popup_dict["starts_at"]:
            raise ValueError("expires_at must be after starts_at")

    popup = PopupAnnouncement(
        **popup_dict,
        created_by_id=admin_id,
    )
    db.add(popup)
    await db.commit()
    await db.refresh(popup)
    return popup


async def update_popup_announcement(
    db: AsyncSession,
    popup_id: str,
    popup_data: PopupAnnouncementUpdate,
    admin_id: str,
) -> PopupAnnouncement:
    """Pop-up duyurusunu güncelle."""
    result = await db.execute(
        select(PopupAnnouncement).where(PopupAnnouncement.id == popup_id)
    )
    popup = result.scalar_one_or_none()
    if not popup:
        raise ValueError("Popup announcement not found")

    # Normalize datetime fields (convert to UTC and make timezone-naive)
    update_dict = popup_data.model_dump(exclude_unset=True)
    if "starts_at" in update_dict:
        update_dict["starts_at"] = _normalize_datetime(update_dict["starts_at"])
    if "expires_at" in update_dict:
        update_dict["expires_at"] = _normalize_datetime(update_dict["expires_at"])
    
    # Date validation
    starts_at = update_dict.get("starts_at", popup.starts_at)
    expires_at = update_dict.get("expires_at", popup.expires_at)
    
    if expires_at and starts_at:
        if expires_at <= starts_at:
            raise ValueError("expires_at must be after starts_at")

    for key, value in update_dict.items():
        setattr(popup, key, value)

    await db.commit()
    await db.refresh(popup)
    return popup


async def delete_popup_announcement(
    db: AsyncSession,
    popup_id: str,
    admin_id: str,
) -> bool:
    """Pop-up duyurusunu sil."""
    result = await db.execute(
        select(PopupAnnouncement).where(PopupAnnouncement.id == popup_id)
    )
    popup = result.scalar_one_or_none()
    if not popup:
        raise ValueError("Popup announcement not found")

    await db.delete(popup)
    await db.commit()
    return True


async def get_active_popups(
    db: AsyncSession,
    target_audience: str | None = None,
) -> list[PopupAnnouncement]:
    """Aktif pop-up'ları getir (tarih kontrolü, priority sorting)."""
    # Use UTC timezone-naive datetime for comparison
    now = datetime.utcnow()

    conditions = [
        PopupAnnouncement.is_active == True,
        or_(
            PopupAnnouncement.starts_at.is_(None),
            PopupAnnouncement.starts_at <= now,
        ),
        or_(
            PopupAnnouncement.expires_at.is_(None),
            PopupAnnouncement.expires_at >= now,
        ),
    ]

    if target_audience:
        conditions.append(
            or_(
                PopupAnnouncement.target_audience == "all",
                PopupAnnouncement.target_audience == target_audience,
            )
        )

    result = await db.execute(
        select(PopupAnnouncement)
        .where(and_(*conditions))
        .order_by(PopupAnnouncement.priority.desc(), PopupAnnouncement.created_at.desc())
    )
    return list(result.scalars().all())


async def get_popup_for_user(
    db: AsyncSession,
    user_role: UserRole | None = None,
    dismissed_popup_ids: list[str] | None = None,
) -> PopupAnnouncement | None:
    """Kullanıcı için gösterilecek pop-up'ı getir."""
    # Map user role to target audience
    target_audience = None
    if user_role:
        if user_role == UserRole.STUDENT:
            target_audience = "students"
        elif user_role == UserRole.TEACHER:
            target_audience = "teachers"
        elif user_role in (UserRole.ADMIN, UserRole.STAFF):
            target_audience = "admins"

    # Get active popups
    active_popups = await get_active_popups(db, target_audience)

    # Filter dismissed popups
    if dismissed_popup_ids:
        active_popups = [
            p for p in active_popups if p.id not in dismissed_popup_ids
        ]

    # Return highest priority popup (first in list due to sorting)
    return active_popups[0] if active_popups else None
