from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator
from app.models.withdrawal_request import WithdrawalStatus


class WithdrawalRequestCreate(BaseModel):
    """Çekim talebi oluşturma request"""
    bank_account_id: str = Field(..., description="Banka hesabı ID")
    amount: Decimal = Field(..., gt=0, description="Çekim tutarı (pozitif)")

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Decimal):
        if v <= 0:
            raise ValueError("Çekim tutarı pozitif olmalıdır")
        # Minimum çekim tutarı kontrolü (500 TL)
        if v < 500:
            raise ValueError("Minimum çekim tutarı 500 TL'dir")
        return v


class WithdrawalRequestResponse(BaseModel):
    """Çekim talebi response"""
    id: str
    teacher_id: str
    bank_account_id: str
    bank_account_info: Optional[dict] = None  # Banka hesabı özet bilgisi
    amount: Decimal
    currency: str
    status: WithdrawalStatus
    admin_note: Optional[str] = None
    requested_at: datetime
    processed_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WithdrawalApprovalRequest(BaseModel):
    """Admin çekim onaylama request"""
    admin_note: Optional[str] = Field(None, max_length=1000)


class WithdrawalRejectionRequest(BaseModel):
    """Admin çekim reddetme request"""
    admin_note: str = Field(..., min_length=10, max_length=1000, description="Red sebebi (zorunlu)")
