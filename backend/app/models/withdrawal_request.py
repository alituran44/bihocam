import enum
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import DateTime, Enum, String, ForeignKey, func, Text, Numeric, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WithdrawalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    PAID = "paid"


class WithdrawalRequest(Base):
    """Öğretmen çekim talepleri"""
    __tablename__ = "withdrawal_requests"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    teacher_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    bank_account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("teacher_bank_accounts.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    
    # Tutar
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="TRY", nullable=False)
    
    # Status
    status: Mapped[WithdrawalStatus] = mapped_column(
        Enum(WithdrawalStatus, values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        default=WithdrawalStatus.PENDING,
        nullable=False,
        index=True
    )
    
    # Admin notu (red durumunda zorunlu)
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timestamps
    requested_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False, index=True)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="withdrawal_requests")
    bank_account = relationship("TeacherBankAccount", foreign_keys=[bank_account_id], back_populates="withdrawal_requests")
    earnings = relationship("TeacherEarning", foreign_keys="TeacherEarning.withdrawal_request_id", back_populates="withdrawal_request")
