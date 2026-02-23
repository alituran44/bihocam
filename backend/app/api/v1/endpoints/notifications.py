from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.notification import NotificationPriority, NotificationType, Notification
from app.models.user import User, UserRole
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.schemas.notification import (
    NotificationCreate,
    NotificationListResponse,
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate,
    NotificationResponse,
    UnreadCountResponse,
)
from app.services.notification_service import NotificationService


router = APIRouter()


def get_service(db: AsyncSession = Depends(get_db)) -> NotificationService:
    return NotificationService(db)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Admin yetkisi kontrolü"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


@router.get("/", response_model=NotificationListResponse)
async def list_notifications(
    skip: int = 0,
    limit: int = 20,
    is_read: Optional[bool] = Query(None),
    notification_type: Optional[NotificationType] = Query(None),
    priority: Optional[NotificationPriority] = Query(None),
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_service),
):
    notifications, total, unread_count = await service.list_notifications_for_user(
        current_user.id,
        skip=skip,
        limit=limit,
        is_read=is_read,
        notification_type=notification_type,
        priority=priority,
    )

    items: list[NotificationResponse] = []
    for n in notifications:
        items.append(
            NotificationResponse(
                id=n.id,
                user_id=n.user_id,
                sender_id=n.sender_id,
                sender_name=n.sender.full_name if n.sender else None,
                notification_type=n.notification_type,
                title=n.title,
                message=n.message,
                data=n.data,
                is_read=n.is_read,
                read_at=n.read_at,
                priority=n.priority,
                action_url=n.action_url,
                action_label=n.action_label,
                created_at=n.created_at,
            )
        )

    return NotificationListResponse(notifications=items, total=total, unread_count=unread_count)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_service),
):
    notification = await service.mark_as_read(current_user.id, notification_id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bildirim bulunamadı")

    return NotificationResponse(
        id=notification.id,
        user_id=notification.user_id,
        sender_id=notification.sender_id,
        sender_name=notification.sender.full_name if notification.sender else None,
        notification_type=notification.notification_type,
        title=notification.title,
        message=notification.message,
        data=notification.data,
        is_read=notification.is_read,
        read_at=notification.read_at,
        priority=notification.priority,
        action_url=notification.action_url,
        action_label=notification.action_label,
        created_at=notification.created_at,
    )


@router.put("/read-all", response_model=int)
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_service),
):
    count = await service.mark_all_as_read(current_user.id)

    # Değişiklikleri kalıcı hale getir (aksi halde sadece flush olur ve unread sayısı değişmez)
    await service.db.commit()

    return count


@router.get("/unread-count", response_model=UnreadCountResponse)
async def unread_count(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_service),
):
    counts = await service.get_unread_count(current_user.id)
    total = sum(counts.values())
    return UnreadCountResponse(total=total, by_priority=counts)


@router.get("/preferences", response_model=NotificationPreferencesResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_service),
):
    prefs = await service.get_preferences(current_user.id)
    return NotificationPreferencesResponse(
        email_enabled=prefs.email_enabled,
        push_enabled=prefs.push_enabled,
        in_app_enabled=prefs.in_app_enabled,
        preferences=prefs.preferences or {},
        quiet_hours_start=prefs.quiet_hours_start,
        quiet_hours_end=prefs.quiet_hours_end,
    )


@router.put("/preferences", response_model=NotificationPreferencesResponse)
async def update_preferences(
    body: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_service),
):
    prefs = await service.update_preferences(
        current_user.id,
        preferences=body.preferences,
        email_enabled=body.email_enabled,
        push_enabled=body.push_enabled,
        in_app_enabled=body.in_app_enabled,
        quiet_hours_start=body.quiet_hours_start,
        quiet_hours_end=body.quiet_hours_end,
    )
    return NotificationPreferencesResponse(
        email_enabled=prefs.email_enabled,
        push_enabled=prefs.push_enabled,
        in_app_enabled=prefs.in_app_enabled,
        preferences=prefs.preferences or {},
        quiet_hours_start=prefs.quiet_hours_start,
        quiet_hours_end=prefs.quiet_hours_end,
    )


@router.post("/", response_model=list[NotificationResponse])
async def create_notifications(
    body: NotificationCreate,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_service),
):
    """
    Admin/Teacher/Organization için bildirim oluşturma endpoint'i.
    Şimdilik:
    - Eğer user_ids doluysa sadece onlara,
    - Eğer role doluysa o roldeki tüm kullanıcılara gönderir.
    """
    if current_user.role not in {UserRole.ADMIN, UserRole.STAFF, UserRole.ORGANIZATION, UserRole.TEACHER}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yetkisiz işlem")

    user_ids: list[str] = body.user_ids or []

    # Role bazlı gönderim
    if body.role:
        try:
            role_enum = UserRole(body.role)
        except ValueError:
            raise HTTPException(status_code=400, detail="Geçersiz rol")

        await service.send_to_role(
            role=role_enum,
            notification_type=body.notification_type,
            title=body.title,
            message=body.message,
            data=body.data,
            priority=body.priority,
            delivery_channels=body.delivery_channels,
            action_url=body.action_url,
            action_label=body.action_label,
            sender_id=current_user.id,
        )
        # Değişiklikler DB'ye yazılsın
        await service.db.commit()

        # Role bazlı gönderimde tek tek response dönmek yerine boş liste dönebiliriz,
        # FE için yeterli olan "kaç kişiye gitti" bilgisi ayrı endpoint'te verilebilir.
        return []

    if not user_ids:
        raise HTTPException(status_code=400, detail="user_ids veya role alanlarından biri dolu olmalı")

    notifications = await service.send_notification(
        user_ids=user_ids,
        notification_type=body.notification_type,
        title=body.title,
        message=body.message,
        data=body.data,
        priority=body.priority,
        delivery_channels=body.delivery_channels,
        action_url=body.action_url,
        action_label=body.action_label,
        sender_id=current_user.id,
    )

    # Değişiklikler DB'ye yazılsın
    await service.db.commit()

    items: list[NotificationResponse] = []
    for n in notifications:
        items.append(
            NotificationResponse(
                id=n.id,
                user_id=n.user_id,
                sender_id=n.sender_id,
                sender_name=current_user.full_name if n.sender_id else None,
                notification_type=n.notification_type,
                title=n.title,
                message=n.message,
                data=n.data,
                is_read=n.is_read,
                read_at=n.read_at,
                priority=n.priority,
                action_url=n.action_url,
                action_label=n.action_label,
                created_at=n.created_at,
            )
        )

    return items


@router.get("/admin/all", response_model=list[NotificationResponse])
async def get_all_notifications_admin(
    skip: int = 0,
    limit: int = 50,
    notification_type: Optional[NotificationType] = Query(None),
    priority: Optional[NotificationPriority] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin için tüm bildirimleri getir (tüm kullanıcılar için)"""
    query = select(Notification).options(
        selectinload(Notification.sender)
    ).order_by(Notification.created_at.desc())
    
    if notification_type:
        query = query.where(Notification.notification_type == notification_type)
    if priority:
        query = query.where(Notification.priority == priority)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    items: list[NotificationResponse] = []
    for n in notifications:
        items.append(
            NotificationResponse(
                id=n.id,
                user_id=n.user_id,
                sender_id=n.sender_id,
                sender_name=n.sender.full_name if n.sender else "Sistem",
                notification_type=n.notification_type,
                title=n.title,
                message=n.message,
                data=n.data,
                is_read=n.is_read,
                read_at=n.read_at.isoformat() if n.read_at else None,
                delivery_channels=n.delivery_channels or ["in_app"],
                priority=n.priority,
                expires_at=n.expires_at.isoformat() if n.expires_at else None,
                action_url=n.action_url,
                action_label=n.action_label,
                created_at=n.created_at.isoformat(),
                updated_at=n.updated_at.isoformat(),
            )
        )
    
    return items

