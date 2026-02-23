import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, String, Boolean, ForeignKey, func, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BankAccountStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class TeacherBankAccount(Base):
    __tablename__ = "teacher_bank_accounts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    teacher_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    # Bank account details
    bank_name: Mapped[str] = mapped_column(String(100), nullable=False)
    iban: Mapped[str] = mapped_column(String(34), nullable=False, unique=True, index=True)  # TR için TR + 24 hane
    account_holder_name: Mapped[str] = mapped_column(String(150), nullable=False)
    
    # Status and flags
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    status: Mapped[BankAccountStatus] = mapped_column(
        Enum(BankAccountStatus, values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        default=BankAccountStatus.PENDING,
        nullable=False,
        index=True
    )
    
    # Review information
    review_note: Mapped[str | None] = mapped_column(Text, nullable=True)  # Admin notu (red durumunda zorunlu)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    rejected_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="bank_accounts")
    withdrawal_requests = relationship(
        "WithdrawalRequest",
        foreign_keys="WithdrawalRequest.bank_account_id",
        back_populates="bank_account",
        cascade="all, delete-orphan",
    )
