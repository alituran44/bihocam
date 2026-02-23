from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from app.models.notification import NotificationPriority, NotificationType


class NotificationBase(BaseModel):
    notification_type: NotificationType
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    priority: NotificationPriority = NotificationPriority.MEDIUM
    action_url: Optional[str] = None
    action_label: Optional[str] = None


class NotificationCreate(NotificationBase):
    user_ids: Optional[List[str]] = None  # spesifik kullanıcılar
    role: Optional[str] = None  # belirli role sahip kullanıcılar (admin scope'u)
    organization_id: Optional[str] = None
    delivery_channels: List[str] = ["in_app"]


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    sender_id: Optional[str] = None
    sender_name: Optional[str] = None
    notification_type: NotificationType
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    is_read: bool
    read_at: Optional[datetime] = None
    priority: NotificationPriority
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int


class NotificationPreferencesUpdate(BaseModel):
    preferences: Optional[Dict[str, List[str]]] = None  # {type: [channels]}
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = None  # "HH:MM"
    quiet_hours_end: Optional[str] = None


class NotificationPreferencesResponse(BaseModel):
    email_enabled: bool
    push_enabled: bool
    in_app_enabled: bool
    preferences: Dict[str, List[str]]
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

    class Config:
        from_attributes = True


class UnreadCountResponse(BaseModel):
    total: int
    by_priority: Dict[NotificationPriority, int]

