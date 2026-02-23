from __future__ import annotations

import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AnnouncementType(str, enum.Enum):
    """Duyuru tipi"""
    INFO = "info"
    WARNING = "warning"
    MAINTENANCE = "maintenance"


class SiteAnnouncement(Base):
    """
    Site genelinde gösterilecek duyurular/notlar.
    
    Frontend'de header/dashboard'da aktif ve tarih aralığı içinde kalan
    duyurular gösterilir.
    """

    __tablename__ = "site_announcements"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[AnnouncementType] = mapped_column(
        Enum(AnnouncementType), nullable=False, default=AnnouncementType.INFO
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Önerilen ek alanlar (audit notlarından)
    target_audience: Mapped[str | None] = mapped_column(
        String(50), nullable=True, default="all"
    )  # "all", "students", "teachers", "admins"
    priority: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )  # Birden fazla aktif duyuru varsa sıralama (0 = en düşük)
    is_dismissible: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )  # Kullanıcı kapatabilir mi?

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
