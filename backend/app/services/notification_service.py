from __future__ import annotations

from collections import defaultdict
from datetime import datetime
from typing import Iterable, Optional, Sequence

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.email_log import EmailLog, EmailStatus
from app.models.notification import (
    Notification,
    NotificationPreferences,
    NotificationPriority,
    NotificationType,
)
from app.models.user import User, UserRole
from app.services.email_queue import enqueue_email_job


TEMPLATE_MAP: dict[NotificationType, str] = {
    NotificationType.ORDER_CONFIRMED: "order_confirmation.html",
    NotificationType.PASSWORD_RESET: "password_reset.html",
    NotificationType.COURSE_APPROVED: "review_approved.html",
    NotificationType.COURSE_REJECTED: "review_rejected.html",
    NotificationType.PAYMENT_SUCCESS: "order_confirmation.html",
}


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_or_create_preferences(self, user_id: str) -> NotificationPreferences:
        result = await self.db.execute(
            select(NotificationPreferences).where(NotificationPreferences.user_id == user_id)
        )
        prefs = result.scalar_one_or_none()
        if prefs:
            return prefs

        prefs = NotificationPreferences(user_id=user_id)
        self.db.add(prefs)
        await self.db.flush()
        return prefs

    async def _should_send_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        channel: str,
    ) -> bool:
        prefs = await self._get_or_create_preferences(user_id)

        if channel == "email" and not prefs.email_enabled:
            return False
        if channel == "push" and not prefs.push_enabled:
            return False
        if channel == "in_app" and not prefs.in_app_enabled:
            return False

        if prefs.preferences:
            channel_pref = prefs.preferences.get(notification_type.value)
            if isinstance(channel_pref, list) and channel not in channel_pref:
                return False

        return True

    async def _resolve_recipients_by_role(
        self,
        role: UserRole,
        organization_id: Optional[str] = None,
    ) -> list[User]:
        stmt: Select[tuple[User]] = select(User).where(User.role == role, User.is_active.is_(True))
        if organization_id:
            stmt = stmt.where(User.organization_id == organization_id)

        result = await self.db.execute(stmt)
        return list(result.scalars().unique())

    async def send_notification(
        self,
        user_ids: Sequence[str],
        notification_type: NotificationType,
        title: str,
        message: str,
        *,
        data: Optional[dict] = None,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        delivery_channels: Optional[Sequence[str]] = None,
        action_url: Optional[str] = None,
        action_label: Optional[str] = None,
        sender_id: Optional[str] = None,
    ) -> list[Notification]:
        if delivery_channels is None:
            delivery_channels = ["in_app"]

        normalized_channels = set(delivery_channels)
        if "both" in normalized_channels:
            normalized_channels.update({"in_app", "email"})
            normalized_channels.remove("both")

        user_stmt = (
            select(User)
            .where(User.id.in_(list(user_ids)), User.is_active.is_(True))
            .options(selectinload(User.notification_preferences))
        )
        user_result = await self.db.execute(user_stmt)
        users = {u.id: u for u in user_result.scalars().unique()}

        notifications: list[Notification] = []
        created_email_logs: list[EmailLog] = []

        for uid in user_ids:
            user = users.get(uid)
            if not user:
                continue

            notification: Notification | None = None

            if "in_app" in normalized_channels:
                should_send_in_app = await self._should_send_notification(
                    uid, notification_type, "in_app"
                )
                if should_send_in_app:
                    notification = Notification(
                        user_id=uid,
                        sender_id=sender_id,
                        notification_type=notification_type,
                        title=title,
                        message=message,
                        data=data or {},
                        delivery_channels=list(normalized_channels),
                        priority=priority,
                        action_url=action_url,
                        action_label=action_label,
                    )
                    self.db.add(notification)
                    notifications.append(notification)

            if "email" in normalized_channels:
                should_send_email = await self._should_send_notification(uid, notification_type, "email")
                user_email_enabled = bool(getattr(user, "email_notifications_enabled", True))
                if should_send_email and user_email_enabled and bool(user.email):
                    template_name = TEMPLATE_MAP.get(notification_type)
                    payload = {
                        "to_email": user.email,
                        "subject": title,
                        "template_name": template_name,
                        "context": {
                            "user_name": user.full_name,
                            "teacher_name": user.full_name,
                            "title": title,
                            "message": message,
                            "notification_type": notification_type.value,
                            "action_url": action_url,
                            "action_label": action_label,
                            **(data or {}),
                        },
                    }

                    email_log = EmailLog(
                        notification_id=notification.id if notification else None,
                        to_email=user.email,
                        subject=title,
                        template_name=template_name,
                        status=EmailStatus.PENDING,
                        attempt_count=0,
                        payload=payload,
                    )
                    self.db.add(email_log)
                    created_email_logs.append(email_log)

        if notifications or created_email_logs:
            await self.db.flush()

        for log in created_email_logs:
            await enqueue_email_job({"email_log_id": log.id})

        return notifications

    async def send_to_role(
        self,
        role: UserRole,
        notification_type: NotificationType,
        title: str,
        message: str,
        *,
        organization_id: Optional[str] = None,
        data: Optional[dict] = None,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        delivery_channels: Optional[Sequence[str]] = None,
        action_url: Optional[str] = None,
        action_label: Optional[str] = None,
        sender_id: Optional[str] = None,
    ) -> int:
        recipients = await self._resolve_recipients_by_role(role, organization_id=organization_id)
        if not recipients:
            return 0

        await self.send_notification(
            [u.id for u in recipients],
            notification_type=notification_type,
            title=title,
            message=message,
            data=data,
            priority=priority,
            delivery_channels=delivery_channels,
            action_url=action_url,
            action_label=action_label,
            sender_id=sender_id,
        )

        return len(recipients)

    async def list_notifications_for_user(
        self,
        user_id: str,
        *,
        skip: int = 0,
        limit: int = 20,
        is_read: Optional[bool] = None,
        notification_type: Optional[NotificationType] = None,
        priority: Optional[NotificationPriority] = None,
    ):
        stmt: Select[tuple[Notification]] = select(Notification).where(
            Notification.user_id == user_id
        )

        stmt = stmt.options(selectinload(Notification.sender))
        stmt = stmt.order_by(Notification.created_at.desc())

        if is_read is not None:
            stmt = stmt.where(Notification.is_read.is_(is_read))
        if notification_type is not None:
            stmt = stmt.where(Notification.notification_type == notification_type)
        if priority is not None:
            stmt = stmt.where(Notification.priority == priority)

        total_result = await self.db.execute(
            select(func.count()).select_from(stmt.subquery())
        )
        total = int(total_result.scalar() or 0)

        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        notifications = list(result.scalars().unique())

        unread_result = await self.db.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == user_id, Notification.is_read.is_(False)
            )
        )
        unread_count = int(unread_result.scalar() or 0)

        return notifications, total, unread_count

    async def mark_as_read(self, user_id: str, notification_id: str) -> Optional[Notification]:
        result = await self.db.execute(
            select(Notification).where(
                Notification.id == notification_id, Notification.user_id == user_id
            )
        )
        notification = result.scalar_one_or_none()
        if not notification:
            return None

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            await self.db.flush()

        return notification

    async def mark_all_as_read(self, user_id: str) -> int:
        result = await self.db.execute(
            select(Notification).where(
                Notification.user_id == user_id, Notification.is_read.is_(False)
            )
        )
        to_mark = list(result.scalars().unique())
        for n in to_mark:
            n.is_read = True
            n.read_at = datetime.utcnow()

        if to_mark:
            await self.db.flush()

        return len(to_mark)

    async def get_unread_count(self, user_id: str) -> dict[NotificationPriority, int]:
        result = await self.db.execute(
            select(Notification.priority, func.count(Notification.id))
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .group_by(Notification.priority)
        )
        rows: Iterable[tuple[NotificationPriority, int]] = result.all()
        counts: dict[NotificationPriority, int] = defaultdict(int)
        for prio, count in rows:
            counts[prio] = int(count or 0)
        return counts

    async def get_preferences(self, user_id: str) -> NotificationPreferences:
        return await self._get_or_create_preferences(user_id)

    async def update_preferences(
        self,
        user_id: str,
        *,
        preferences: Optional[dict] = None,
        email_enabled: Optional[bool] = None,
        push_enabled: Optional[bool] = None,
        in_app_enabled: Optional[bool] = None,
        quiet_hours_start: Optional[str] = None,
        quiet_hours_end: Optional[str] = None,
    ) -> NotificationPreferences:
        prefs = await self._get_or_create_preferences(user_id)

        if preferences is not None:
            prefs.preferences = preferences
        if email_enabled is not None:
            prefs.email_enabled = email_enabled
        if push_enabled is not None:
            prefs.push_enabled = push_enabled
        if in_app_enabled is not None:
            prefs.in_app_enabled = in_app_enabled
        if quiet_hours_start is not None:
            prefs.quiet_hours_start = quiet_hours_start
        if quiet_hours_end is not None:
            prefs.quiet_hours_end = quiet_hours_end

        await self.db.flush()
        return prefs

