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
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CampaignStatus(str, enum.Enum):
    """Kampanya durumu"""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class CampaignType(str, enum.Enum):
    """Kampanya tipi"""
    FEATURED_COURSE = "featured_course"
    COURSE_PROMOTION = "course_promotion"
    BANNER_AD = "banner_ad"


class PricingModel(str, enum.Enum):
    """Fiyatlandırma modeli"""
    FIXED_DAILY = "fixed_daily"
    PER_IMPRESSION = "per_impression"
    PER_CLICK = "per_click"
    HYBRID = "hybrid"


class ApprovalStatus(str, enum.Enum):
    """Onay durumu"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class PaymentStatus(str, enum.Enum):
    """Ödeme durumu"""
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"


class AdCampaign(Base):
    """
    Reklam kampanyaları için model.
    
    Eğitmenler kurslarını öne çıkarmak için kampanya oluşturur.
    Admin onayından sonra aktif olur.
    """

    __tablename__ = "ad_campaigns"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )

    teacher_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True
    )
    course_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    placement_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("ad_placements.id"), nullable=False, index=True
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[CampaignStatus] = mapped_column(
        Enum(CampaignStatus, values_callable=lambda e: [x.value for x in e]), nullable=False, default=CampaignStatus.DRAFT, index=True
    )
    campaign_type: Mapped[CampaignType] = mapped_column(
        Enum(CampaignType, values_callable=lambda e: [x.value for x in e]), nullable=False
    )

    # Banner ad fields
    banner_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    banner_link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    banner_alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Date range
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)

    # Budget
    daily_budget: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )  # Günlük bütçe (opsiyonel)
    total_budget: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False
    )  # Toplam bütçe
    spent_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0.00"), nullable=False
    )  # Harcanan tutar

    # Pricing (placement pricing'den alınır, kampanya oluşturulurken hesaplanır)
    price_per_day: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False
    )  # Günlük fiyat
    price_per_impression: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 4), nullable=True
    )  # Görüntülenme başına fiyat (opsiyonel)
    price_per_click: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )  # Tıklama başına fiyat (opsiyonel)
    pricing_model: Mapped[PricingModel] = mapped_column(
        Enum(PricingModel, values_callable=lambda e: [x.value for x in e]), nullable=False, default=PricingModel.FIXED_DAILY
    )

    # Targeting
    target_categories: Mapped[list[str] | None] = mapped_column(
        JSONB, nullable=True
    )  # Hedef kategoriler (opsiyonel)
    target_tags: Mapped[list[str] | None] = mapped_column(
        JSONB, nullable=True
    )  # Hedef etiketler (opsiyonel)
    is_targeted: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )  # Hedefleme aktif mi

    # Approval
    approval_status: Mapped[ApprovalStatus] = mapped_column(
        Enum(ApprovalStatus, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=ApprovalStatus.PENDING,
        index=True,
    )
    approved_by_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Payment
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=PaymentStatus.PENDING,
        index=True,
    )
    payment_transaction_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    # Analytics
    impressions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    conversions: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )  # Dönüşüm sayısı (kayıt, satın alma)
    ctr: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), default=Decimal("0.00"), nullable=False
    )  # Click-through rate (%)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    teacher: Mapped["User"] = relationship("User", foreign_keys=[teacher_id])
    course: Mapped["Course"] = relationship("Course", foreign_keys=[course_id])
    placement: Mapped["AdPlacement"] = relationship(
        "AdPlacement", foreign_keys=[placement_id], back_populates="campaigns"
    )
    approved_by: Mapped["User | None"] = relationship(
        "User", foreign_keys=[approved_by_id]
    )
    analytics: Mapped[list["AdCampaignAnalytics"]] = relationship(
        "AdCampaignAnalytics",
        back_populates="campaign",
        cascade="all, delete-orphan",
    )

    # Indexes
    __table_args__ = (
        Index("idx_campaign_status", "status"),
        Index("idx_campaign_approval", "approval_status"),
        Index("idx_campaign_dates", "start_date", "end_date"),
        Index("idx_campaign_teacher", "teacher_id", "status"),
        Index("idx_campaign_placement", "placement_id", "status"),
        CheckConstraint("end_date > start_date", name="check_campaign_date_range"),
        CheckConstraint("spent_amount <= total_budget", name="check_campaign_budget"),
        CheckConstraint("total_budget > 0", name="check_campaign_total_budget_positive"),
    )
