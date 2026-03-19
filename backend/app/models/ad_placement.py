from __future__ import annotations

import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
    Index,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PlacementType(str, enum.Enum):
    """Reklam yerleşim tipi"""
    BANNER = "banner"
    FEATURED_COURSE = "featured_course"
    SIDEBAR = "sidebar"
    INLINE = "inline"
    POPUP = "popup"


class AdPlacement(Base):
    """
    Reklam yerleşimleri için model.
    
    Admin tarafından yönetilir. Nerede reklam gösterileceğini tanımlar.
    """

    __tablename__ = "ad_placements"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )  # Unique kod (örn: "homepage_banner")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    placement_type: Mapped[PlacementType] = mapped_column(
        Enum(PlacementType, values_callable=lambda e: [x.value for x in e]), nullable=False
    )
    location: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )  # "homepage", "category_page", "course_page", vb.

    width: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)
    max_ads: Mapped[int] = mapped_column(
        Integer, default=1, nullable=False
    )  # Aynı anda kaç reklam gösterilebilir

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, index=True
    )
    priority: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False, index=True
    )  # Yüksek öncelik önce gösterilir

    targeting_options: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True
    )  # Hedefleme seçenekleri (kategori, etiket, vb.)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    campaigns: Mapped[list["AdCampaign"]] = relationship(
        "AdCampaign", back_populates="placement", cascade="all, delete-orphan"
    )
    pricing: Mapped[list["AdPricing"]] = relationship(
        "AdPricing", back_populates="placement", cascade="all, delete-orphan"
    )

    # Indexes
    __table_args__ = (
        Index("idx_placement_code", "code", unique=True),
        Index("idx_placement_type_location", "placement_type", "location"),
        CheckConstraint("width > 0", name="check_placement_width_positive"),
        CheckConstraint("height > 0", name="check_placement_height_positive"),
        CheckConstraint("max_ads > 0", name="check_placement_max_ads_positive"),
    )
