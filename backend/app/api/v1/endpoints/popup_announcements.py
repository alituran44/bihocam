"""Popup announcement management endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.models.popup_announcement import PopupAnnouncement, PopupType
from app.models.user import User, UserRole
from app.schemas.popup_announcement import (
    PopupAnnouncementCreate,
    PopupAnnouncementUpdate,
    PopupAnnouncementResponse,
    PopupAnnouncementListResponse,
)
from app.services.popup_announcement_service import (
    create_popup_announcement,
    update_popup_announcement,
    delete_popup_announcement,
    get_active_popups,
    get_popup_for_user,
)

router = APIRouter()


# ==================== Admin Endpoints ====================

@router.post(
    "/admin/popups",
    response_model=PopupAnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_popup(
    popup_data: PopupAnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Yeni pop-up oluştur (Admin only)."""
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create popups"
        )

    try:
        popup = await create_popup_announcement(db, popup_data, current_user.id)
        return popup
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/admin/popups",
    response_model=List[PopupAnnouncementListResponse],
)
async def list_popups(
    is_active: Optional[bool] = Query(None),
    popup_type: Optional[PopupType] = Query(None),
    target_audience: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pop-up'ları listele (Admin only)."""
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to list popups"
        )

    from sqlalchemy import select, and_

    conditions = []
    if is_active is not None:
        conditions.append(PopupAnnouncement.is_active == is_active)
    if popup_type:
        conditions.append(PopupAnnouncement.popup_type == popup_type)
    if target_audience:
        conditions.append(PopupAnnouncement.target_audience == target_audience)

    query = select(PopupAnnouncement)
    if conditions:
        query = query.where(and_(*conditions))
    query = query.order_by(
        PopupAnnouncement.priority.desc(),
        PopupAnnouncement.created_at.desc()
    ).offset(skip).limit(limit)

    result = await db.execute(query)
    popups = result.scalars().all()
    return popups


@router.get(
    "/admin/popups/{popup_id}",
    response_model=PopupAnnouncementResponse,
)
async def get_popup(
    popup_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pop-up detayı (Admin only)."""
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view popup details"
        )

    from sqlalchemy import select

    result = await db.execute(
        select(PopupAnnouncement).where(PopupAnnouncement.id == popup_id)
    )
    popup = result.scalar_one_or_none()
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup announcement not found"
        )
    return popup


@router.put(
    "/admin/popups/{popup_id}",
    response_model=PopupAnnouncementResponse,
)
async def update_popup(
    popup_id: str,
    popup_data: PopupAnnouncementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pop-up güncelle (Admin only)."""
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update popups"
        )

    try:
        popup = await update_popup_announcement(db, popup_id, popup_data, current_user.id)
        return popup
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete(
    "/admin/popups/{popup_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_popup(
    popup_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pop-up sil (Admin only)."""
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete popups"
        )

    try:
        await delete_popup_announcement(db, popup_id, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post(
    "/admin/popups/{popup_id}/activate",
    response_model=PopupAnnouncementResponse,
)
async def activate_popup(
    popup_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pop-up'ı aktif et (Admin only)."""
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to activate popups"
        )

    popup = await update_popup_announcement(
        db,
        popup_id,
        PopupAnnouncementUpdate(is_active=True),
        current_user.id,
    )
    return popup


@router.post(
    "/admin/popups/{popup_id}/deactivate",
    response_model=PopupAnnouncementResponse,
)
async def deactivate_popup(
    popup_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pop-up'ı deaktif et (Admin only)."""
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to deactivate popups"
        )

    popup = await update_popup_announcement(
        db,
        popup_id,
        PopupAnnouncementUpdate(is_active=False),
        current_user.id,
    )
    return popup


# ==================== Public Endpoint ====================

@router.get(
    "/public/popups/active",
    response_model=Optional[PopupAnnouncementResponse],
)
async def get_active_popup(
    target_audience: Optional[str] = Query(None),
    dismissed_ids: Optional[str] = Query(None),  # Comma-separated popup IDs
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Aktif pop-up'ı getir (Public)."""
    # Auto-detect user role if authenticated
    user_role = None
    if current_user:
        user_role = current_user.role

    # Parse dismissed IDs
    dismissed_popup_ids = None
    if dismissed_ids:
        dismissed_popup_ids = [id.strip() for id in dismissed_ids.split(",") if id.strip()]

    popup = await get_popup_for_user(db, user_role, dismissed_popup_ids)
    return popup
