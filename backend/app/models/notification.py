import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class NotificationType(str, enum.Enum):
    # Hoca -> Öğrenci
    COURSE_UPDATE = "course_update"
    NEW_LESSON = "new_lesson"
    COURSE_ANNOUNCEMENT = "course_announcement"

    # Kurum -> Öğrenci
    ORG_ANNOUNCEMENT = "org_announcement"
    ORG_COURSE_UPDATE = "org_course_update"

    # Admin -> Öğretmen
    ADMIN_TO_TEACHER = "admin_to_teacher"

    # Admin -> Herkes
    SYSTEM_ANNOUNCEMENT = "system_announcement"
    MAINTENANCE = "maintenance"

    # Canlı Ders (ileride)
    LIVE_LESSON_REMINDER = "live_lesson_reminder"
    LIVE_LESSON_STARTING = "live_lesson_starting"
    LIVE_LESSON_CANCELLED = "live_lesson_cancelled"

    # Sipariş/Ödeme
    ORDER_CONFIRMED = "order_confirmed"
    PAYMENT_SUCCESS = "payment_success"
    CERTIFICATE_EARNED = "certificate_earned"

    # Kurs onay akışı (EPIC-3 entegrasyon)
    COURSE_SUBMITTED = "course_submitted"
    COURSE_APPROVED = "course_approved"
    COURSE_REJECTED = "course_rejected"
    COURSE_RESUBMITTED = "course_resubmitted"

    # Şifre sıfırlama (EPIC-4 entegrasyon)
    PASSWORD_RESET = "password_reset"
    
    # Banka hesabı yönetimi (EPIC-5 entegrasyon)
    BANK_ACCOUNT_PENDING = "bank_account_pending"
    BANK_ACCOUNT_APPROVED = "bank_account_approved"
    BANK_ACCOUNT_REJECTED = "bank_account_rejected"
    
    # Çekim talepleri (EPIC-5 entegrasyon)
    WITHDRAWAL_REQUEST_CREATED = "withdrawal_request_created"
    WITHDRAWAL_APPROVED = "withdrawal_approved"
    WITHDRAWAL_REJECTED = "withdrawal_rejected"
    WITHDRAWAL_PAID = "withdrawal_paid"
    
    # Yorum moderasyonu (EPIC-7 entegrasyon)
    REVIEW_APPROVED = "review_approved"
    REVIEW_REJECTED = "review_rejected"
    TEACHER_REPLY = "teacher_reply"  # Eğitmen yorum cevabı
    
    # Reklam kampanyaları (EPIC-ADS entegrasyon)
    AD_CAMPAIGN_APPROVED = "ad_campaign_approved"
    AD_CAMPAIGN_REJECTED = "ad_campaign_rejected"
    
    # Mesajlaşma sistemi (EPIC-12 entegrasyon)
    NEW_MESSAGE = "new_message"


class NotificationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )

    # Alıcı
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True
    )

    # Opsiyonel gönderen (admin / teacher / system)
    sender_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=True
    )

    # Enum'ları veritabanında *value* (küçük harf) ile sakla, name (BÜYÜK HARF) ile değil
    notification_type: Mapped[NotificationType] = mapped_column(
        Enum(
            NotificationType,
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    # Ek metadata: {"course_id": "...", "lesson_id": "...", ...}
    data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # ["in_app", "email", "push"]
    delivery_channels: Mapped[list[str] | None] = mapped_column(JSON, default=["in_app"])

    priority: Mapped[NotificationPriority] = mapped_column(
        Enum(
            NotificationPriority,
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        default=NotificationPriority.MEDIUM,
        nullable=False,
    )

    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    action_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    action_label: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    user = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="notifications",
    )
    sender = relationship(
        "User",
        foreign_keys=[sender_id],
    )


class NotificationPreferences(Base):
    __tablename__ = "notification_preferences"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True,
    )

    # {notification_type: [channels]}
    preferences: Mapped[dict | None] = mapped_column(JSON, default={})

    email_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    push_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    in_app_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    quiet_hours_start: Mapped[str | None] = mapped_column(String(5), nullable=True)
    quiet_hours_end: Mapped[str | None] = mapped_column(String(5), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user = relationship(
        "User",
        back_populates="notification_preferences",
    )

