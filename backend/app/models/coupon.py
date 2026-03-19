import enum
import json
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import DateTime, Enum, String, Numeric, Integer, ForeignKey, Boolean, func, Text, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CouponType(str, enum.Enum):
    PERCENTAGE = "percentage"  # Yüzde indirim
    FIXED = "fixed"  # Sabit tutar indirimi


class CouponTriggerType(str, enum.Enum):
    FIRST_PURCHASE = "first_purchase"  # İlk alışveriş
    CART_VALUE = "cart_value"  # Sepet tutarı
    CATEGORY = "category"  # Kategori bazlı
    MANUAL = "manual"  # Manuel kullanım
    SITE_WIDE = "site_wide"  # Site geneli kampanya


class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Discount details
    coupon_type: Mapped[CouponType] = mapped_column(
        Enum(CouponType, values_callable=lambda e: [x.value for x in e]), nullable=False
    )
    discount_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)  # Percentage or fixed amount
    max_discount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)  # Max discount for percentage

    # Trigger conditions
    trigger_type: Mapped[CouponTriggerType] = mapped_column(
        Enum(CouponTriggerType, values_callable=lambda e: [x.value for x in e]), default=CouponTriggerType.MANUAL
    )
    min_cart_value: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)  # For cart_value trigger
    category_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)  # For category trigger
    
    # Site-wide campaign fields
    is_auto_apply: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)  # Otomatik uygulanacak mı
    auto_apply_priority: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # Otomatik uygulama önceliği
    campaign_name: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Kampanya adı
    campaign_description: Mapped[str | None] = mapped_column(Text, nullable=True)  # Kampanya açıklaması
    target_course_ids: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)  # Hedef kurs ID'leri (null = tüm kurslar)
    
    # Usage limits
    usage_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Global limit
    usage_limit_per_user: Mapped[int | None] = mapped_column(Integer, nullable=True, default=1)  # Per user limit
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Validity
    valid_from: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    valid_until: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Created by
    created_by_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])
    usages = relationship("CouponUsage", back_populates="coupon", cascade="all, delete-orphan")
    
    # Indexes for site-wide queries
    __table_args__ = (
        Index("idx_coupon_auto_apply_trigger", "is_auto_apply", "trigger_type"),
        Index("idx_coupon_auto_apply_priority", "auto_apply_priority"),
        Index("idx_coupon_target_courses", "target_course_ids", postgresql_using="gin"),
        CheckConstraint(
            "(is_auto_apply = false) OR (trigger_type = 'site_wide')",
            name="check_auto_apply_site_wide"
        ),
        CheckConstraint(
            "auto_apply_priority >= 0",
            name="check_auto_apply_priority_non_negative"
        ),
    )


class CouponUsage(Base):
    __tablename__ = "coupon_usages"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    coupon_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("coupons.id"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    order_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("orders.id"), nullable=True)
    
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # Timestamps
    used_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    coupon = relationship("Coupon", back_populates="usages")
    user = relationship("User", back_populates="coupon_usages")
    order = relationship("Order", back_populates="coupon_usage")
