from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from app.models.teacher_bank_account import BankAccountStatus
from app.utils.iban_validator import validate_iban_checksum


class BankAccountCreate(BaseModel):
    """Banka hesabı oluşturma request"""
    bank_name: str = Field(..., min_length=2, max_length=100)
    iban: str = Field(..., min_length=15, max_length=34)
    account_holder_name: str = Field(..., min_length=2, max_length=150)
    is_default: bool = False

    @field_validator("iban")
    @classmethod
    def validate_iban(cls, v: str):
        # IBAN format kontrolü - boşlukları temizle
        iban_clean = v.replace(" ", "").upper()
        # TR için kontrol (TR + 24 hane = 26 karakter)
        if iban_clean.startswith("TR") and len(iban_clean) != 26:
            raise ValueError("TR IBAN 26 karakter olmalıdır (TR + 24 hane)")
        # Genel IBAN kontrolü (min 15, max 34 karakter)
        if len(iban_clean) < 15 or len(iban_clean) > 34:
            raise ValueError("IBAN 15-34 karakter arasında olmalıdır")
        # IBAN checksum validation
        if not validate_iban_checksum(iban_clean):
            raise ValueError("Geçersiz IBAN - checksum kontrolü başarısız")
        return iban_clean


class BankAccountUpdate(BaseModel):
    """Banka hesabÄ± gÃ¼ncelleme request"""
    bank_name: Optional[str] = Field(None, min_length=2, max_length=100)
    iban: Optional[str] = Field(None, min_length=15, max_length=34)
    account_holder_name: Optional[str] = Field(None, min_length=2, max_length=150)
    is_default: Optional[bool] = None

    @field_validator("iban")
    @classmethod
    def validate_iban(cls, v: Optional[str]):
        if v is None:
            return v
        iban_clean = v.replace(" ", "").upper()
        if iban_clean.startswith("TR") and len(iban_clean) != 26:
            raise ValueError("TR IBAN 26 karakter olmalÄ±dÄ±r (TR + 24 hane)")
        if len(iban_clean) < 15 or len(iban_clean) > 34:
            raise ValueError("IBAN 15-34 karakter arasÄ±nda olmalÄ±dÄ±r")
        if not validate_iban_checksum(iban_clean):
            raise ValueError("GeÃ§ersiz IBAN - checksum kontrolÃ¼ baÅŸarÄ±sÄ±z")
        return iban_clean


class BankAccountResponse(BaseModel):
    """Banka hesabı response (maskelenmiş IBAN)"""
    id: str
    bank_name: str
    iban_masked: str  # Sadece son 4 hane görünür
    account_holder_name: str
    is_default: bool
    status: BankAccountStatus
    review_note: Optional[str] = None
    created_at: datetime
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @classmethod
    def mask_iban(cls, iban: str) -> str:
        """IBAN'ı maskele - sadece son 4 hane görünür"""
        if len(iban) < 4:
            return "****"
        return f"{iban[:2]} **** **** **** {iban[-4:]}"


class BankAccountAdminResponse(BaseModel):
    """Admin için banka hesabı response (tam IBAN)"""
    id: str
    teacher_id: str
    bank_name: str
    iban: str  # Admin için tam IBAN
    account_holder_name: str
    is_default: bool
    status: BankAccountStatus
    review_note: Optional[str] = None
    created_at: datetime
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None

    class Config:
        from_attributes = True
