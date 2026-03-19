"""
PayTR ödeme entegrasyonu şemaları
"""
from pydantic import BaseModel


class CheckoutResponse(BaseModel):
    """POST /payments/checkout response — frontend'e iFrame token döner."""
    order_id: str
    order_number: str
    iframe_token: str
    iframe_url: str
    total: str  # Gösterim için (örn: "99.90")


class CheckoutErrorResponse(BaseModel):
    detail: str
    paytr_reason: str | None = None


class PaymentCallbackData(BaseModel):
    """PayTR'den gelen callback POST verileri (form-encoded)."""
    merchant_oid: str
    status: str  # "success" veya "failed"
    total_amount: str
    hash: str
    failed_reason_code: str | None = None
    failed_reason_msg: str | None = None
    test_mode: str | None = None
    payment_type: str | None = None  # "card" veya "eft"
    currency: str | None = None
    payment_amount: str | None = None


class PaymentStatusResponse(BaseModel):
    """GET /payments/status response."""
    order_id: str
    order_number: str
    status: str
    payment_amount: str | None = None
    payment_date: str | None = None
    currency: str | None = None
