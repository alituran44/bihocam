import enum
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import DateTime, Enum, String, Numeric, ForeignKey, Text, Integer, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"  # Ödeme bekleniyor
    PAID = "paid"  # Ödendi
    FAILED = "failed"  # Ödeme başarısız
    REFUNDED = "refunded"  # İade edildi
    CANCELLED = "cancelled"  # İptal edildi


class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "credit_card"
    EFT = "eft"
    MANUAL = "manual"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # Human-readable order number
    
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    
    # Pricing
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)  # Toplam kurs fiyatları
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0"))  # Kupon indirimi
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)  # Final amount
    
    # Status
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.PENDING)
    payment_method: Mapped[PaymentMethod | None] = mapped_column(Enum(PaymentMethod), nullable=True)
    
    # Payment gateway info
    payment_gateway_transaction_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payment_gateway_response: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON response
    
    # Notes
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    # P2-08: cascade eklendi — order silinince orphan CouponUsage kalmaz
    coupon_usage = relationship("CouponUsage", back_populates="order", uselist=False, cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("orders.id"), nullable=False, index=True)
    course_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("courses.id"), nullable=False)
    
    # Pricing at time of purchase
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    final_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # Commission calculation
    platform_commission_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.35"))  # Default 35%
    platform_commission: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    teacher_earnings: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="order_items")
    course = relationship("Course", back_populates="order_items")


class Enrollment(Base):
    """Kurs kayıtları - Öğrencinin hangi kurslara kayıtlı olduğu"""
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="unique_user_course_enrollment"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    course_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("courses.id"), nullable=False, index=True)
    order_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("orders.id"), nullable=True)
    
    # Progress tracking
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0)  # 0-100
    last_accessed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # Timestamps
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    order = relationship("Order")
    lesson_progress = relationship("LessonProgress", back_populates="enrollment", cascade="all, delete-orphan")
    certificate = relationship("Certificate", back_populates="enrollment", uselist=False, cascade="all, delete-orphan")