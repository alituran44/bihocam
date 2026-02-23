from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    func,
    Index,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AdCampaignAnalytics(Base):
    """
    Reklam kampanyası analitikleri için model.
    
    Günlük/haftalık/aylık özetler için kullanılır.
    """

    __tablename__ = "ad_campaign_analytics"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )

    campaign_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("ad_campaigns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)  # Tarih (günlük özet için)

    # Metrics
    impressions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    conversions: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )  # Dönüşüm sayısı
    spent_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0.00"), nullable=False
    )  # Harcanan tutar

    # Calculated metrics
    ctr: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), default=Decimal("0.00"), nullable=False
    )  # Click-through rate (%)
    conversion_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), default=Decimal("0.00"), nullable=False
    )  # Dönüşüm oranı (%)
    cpc: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0.00"), nullable=False
    )  # Cost per click
    cpm: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0.00"), nullable=False
    )  # Cost per mille (1000 impression)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    campaign: Mapped["AdCampaign"] = relationship(
        "AdCampaign", foreign_keys=[campaign_id], back_populates="analytics"
    )

    # Indexes
    __table_args__ = (
        UniqueConstraint("campaign_id", "date", name="uq_campaign_analytics_date"),
        Index("idx_analytics_campaign_date", "campaign_id", "date"),
    )
