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
    func,
    Index,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.ad_campaign import PricingModel


class AdPricing(Base):
    """
    Reklam fiyatlandırması için model.
    
    Admin tarafından yönetilir. Her placement için farklı fiyatlandırma modelleri olabilir.
    """

    __tablename__ = "ad_pricing"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )

    placement_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("ad_placements.id"), nullable=False, index=True
    )

    pricing_model: Mapped[PricingModel] = mapped_column(
        Enum(PricingModel, values_callable=lambda e: [x.value for x in e]), nullable=False, index=True
    )

    # Pricing amounts (model'e göre hangisi kullanılacaksa)
    price_per_day: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )  # Günlük sabit fiyat (FIXED_DAILY için)
    price_per_impression: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 4), nullable=True
    )  # Görüntülenme başına fiyat (PER_IMPRESSION için)
    price_per_click: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )  # Tıklama başına fiyat (PER_CLICK için)

    # Budget constraints
    min_daily_budget: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )  # Minimum günlük bütçe
    max_daily_budget: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )  # Maksimum günlük bütçe

    # Campaign duration constraints
    min_campaign_duration_days: Mapped[int] = mapped_column(
        Integer, default=1, nullable=False
    )  # Minimum kampanya süresi (gün)
    max_campaign_duration_days: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )  # Maksimum kampanya süresi (gün)

    # Discount
    discount_percentage: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), default=Decimal("0.00"), nullable=False
    )  # İndirim yüzdesi (opsiyonel)

    # Status
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, index=True
    )

    # Effective dates
    effective_from: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True
    )  # Geçerlilik başlangıç tarihi
    effective_until: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, index=True
    )  # Geçerlilik bitiş tarihi

    # Audit
    created_by_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False
    )
    updated_by_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    placement: Mapped["AdPlacement"] = relationship(
        "AdPlacement", foreign_keys=[placement_id], back_populates="pricing"
    )
    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])
    updated_by: Mapped["User | None"] = relationship(
        "User", foreign_keys=[updated_by_id]
    )

    # Indexes
    __table_args__ = (
        Index("idx_pricing_placement", "placement_id", "is_active"),
        Index("idx_pricing_model", "pricing_model"),
        Index("idx_pricing_dates", "effective_from", "effective_until"),
        CheckConstraint(
            "price_per_day IS NULL OR price_per_day > 0",
            name="check_pricing_price_per_day_positive",
        ),
        CheckConstraint(
            "price_per_impression IS NULL OR price_per_impression > 0",
            name="check_pricing_price_per_impression_positive",
        ),
        CheckConstraint(
            "price_per_click IS NULL OR price_per_click > 0",
            name="check_pricing_price_per_click_positive",
        ),
        CheckConstraint(
            "effective_until IS NULL OR effective_until > effective_from",
            name="check_pricing_date_range",
        ),
        CheckConstraint(
            "min_campaign_duration_days > 0",
            name="check_pricing_min_duration_positive",
        ),
        CheckConstraint(
            "max_campaign_duration_days IS NULL OR max_campaign_duration_days > 0",
            name="check_pricing_max_duration_positive",
        ),
        CheckConstraint(
            "discount_percentage >= 0 AND discount_percentage <= 100",
            name="check_pricing_discount_range",
        ),
    )
