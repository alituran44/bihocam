from __future__ import annotations

import enum
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
    Index,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PopupType(str, enum.Enum):
    """Pop-up tipi"""
    INFO = "info"
    PROMOTION = "promotion"
    ANNOUNCEMENT = "announcement"
    WARNING = "warning"


class PopupAnnouncement(Base):
    """
    Pop-up duyuruları için model.
    
    Landing page'de gösterilecek pop-up'lar. Admin tarafından yönetilir,
    kullanıcılar kapatabilir veya "tekrar gösterme" seçeneği ile gizleyebilir.
    """

    __tablename__ = "popup_announcements"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    popup_type: Mapped[PopupType] = mapped_column(
        Enum(PopupType), nullable=False, default=PopupType.INFO
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)

    target_audience: Mapped[str] = mapped_column(
        String(50), nullable=False, default="all", index=True
    )  # "all", "students", "teachers", "admins"
    priority: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False, index=True
    )  # Yüksek öncelik önce gösterilir

    is_dismissible: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )  # Kapatılabilir mi?
    show_once_per_user: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )  # Kullanıcı başına bir kez göster
    dismiss_duration_days: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )  # Kaç gün gizli kalacak (localStorage için)

    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    button_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    button_link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    button_link_target: Mapped[str] = mapped_column(
        String(20), nullable=False, default="_self"
    )  # "_self", "_blank"

    width: Mapped[int] = mapped_column(Integer, default=500, nullable=False)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)  # null = auto
    position: Mapped[str] = mapped_column(
        String(20), nullable=False, default="center"
    )  # "center", "top", "bottom"
    overlay_opacity: Mapped[Decimal] = mapped_column(
        Numeric(3, 2), default=Decimal("0.5"), nullable=False
    )  # 0-1 arası

    created_by_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])

    # Indexes
    __table_args__ = (
        Index("idx_popup_active_dates", "is_active", "starts_at", "expires_at"),
        Index("idx_popup_priority", "priority", postgresql_ops={"priority": "DESC"}),
        CheckConstraint("width > 0", name="check_popup_width_positive"),
        CheckConstraint("height IS NULL OR height > 0", name="check_popup_height_positive"),
        CheckConstraint(
            "overlay_opacity >= 0 AND overlay_opacity <= 1",
            name="check_popup_overlay_opacity_range",
        ),
        CheckConstraint(
            "expires_at IS NULL OR starts_at IS NULL OR expires_at > starts_at",
            name="check_popup_date_range",
        ),
    )
