from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.schemas.course import CourseResponse
from app.schemas.coupon import CouponResponse


class CartItemBase(BaseModel):
    course_id: str


class CartItemCreate(CartItemBase):
    pass


class CartItemResponse(CartItemBase):
    id: str
    user_id: str
    price_at_add: Decimal
    course: CourseResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CartWithCampaignResponse(BaseModel):
    """Cart response with site-wide campaign information"""
    cart_items: list[CartItemResponse]
    subtotal: Decimal
    discount_amount: Decimal
    total: Decimal
    applied_campaign: CouponResponse | None = None
    applicable_course_ids: list[str] = []
    campaign_applicable_to: list[str] = []  # Alias for applicable_course_ids
