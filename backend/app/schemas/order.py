from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.order import OrderStatus, PaymentMethod
from app.schemas.course import CourseResponse


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    course_id: str
    course: CourseResponse
    price: Decimal
    discount_price: Decimal | None = None
    final_price: Decimal
    platform_commission_rate: Decimal
    platform_commission: Decimal
    teacher_earnings: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    notes: str | None = None
    payment_method: PaymentMethod | None = None
    coupon_code: str | None = None
    discount_amount: Decimal | None = None


class OrderCreate(OrderBase):
    pass


class OrderResponse(OrderBase):
    id: str
    order_number: str
    user_id: str
    subtotal: Decimal
    discount_amount: Decimal
    total: Decimal
    status: OrderStatus
    payment_gateway_transaction_id: str | None = None
    order_items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime
    paid_at: datetime | None = None

    class Config:
        from_attributes = True


class OrderUserSummary(BaseModel):
    id: str
    full_name: str
    email: str
    avatar_url: str | None = None

    class Config:
        from_attributes = True


class OrderTimelineEntry(BaseModel):
    status: str
    at: datetime
    note: str | None = None


class OrderAdminResponse(OrderResponse):
    user: OrderUserSummary | None = None
    coupon_code: str | None = None
    timeline: list[OrderTimelineEntry] = []


class OrderRefundRequest(BaseModel):
    amount: Decimal | None = None
    reason: str | None = None
