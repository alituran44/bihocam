import enum
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import DateTime, Enum, String, ForeignKey, func, Text, Numeric, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EarningType(str, enum.Enum):
    EARNING = "earning"  # Kurs satışından kazanç
    WITHDRAWAL = "withdrawal"  # Çekim (negatif)
    ADJUSTMENT = "adjustment"  # Düzeltme (refund, komisyon düzeltmesi vb.)
    COMMISSION = "commission"  # Platform komisyonu (negatif)
    AD_SPEND = "ad_spend"  # Reklam harcaması (negatif)


class TeacherEarning(Base):
    """Öğretmen kazanç hareketleri - immutable transaction log"""
    __tablename__ = "teacher_earnings"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    teacher_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    # İlişkili kayıtlar (opsiyonel)
    course_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    order_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    withdrawal_request_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("withdrawal_requests.id", ondelete="SET NULL"), nullable=True, index=True
    )
    ad_campaign_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("ad_campaigns.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    # Tutar bilgileri
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)  # Pozitif veya negatif olabilir
    currency: Mapped[str] = mapped_column(String(3), default="TRY", nullable=False)  # TRY, USD, EUR vb.
    
    # Komisyon bilgileri (opsiyonel)
    gross_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)  # Komisyon öncesi
    commission_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)  # Komisyon oranı (%)
    commission_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)  # Kesilen komisyon
    
    # Transaction type
    type: Mapped[EarningType] = mapped_column(
        Enum(EarningType, values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=False,
        index=True
    )
    
    # Açıklama
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Reference ID (harici sistemlerle entegrasyon için)
    reference_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False, index=True)
    
    # Relationships
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="earnings")
    course = relationship("Course", foreign_keys=[course_id])
    order = relationship("Order", foreign_keys=[order_id])
    withdrawal_request = relationship("WithdrawalRequest", foreign_keys=[withdrawal_request_id], back_populates="earnings")
    ad_campaign = relationship("AdCampaign", foreign_keys=[ad_campaign_id])