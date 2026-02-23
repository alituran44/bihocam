from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, field_validator, model_validator

from app.models.coupon import CouponType, CouponTriggerType


class CouponBase(BaseModel):
    code: str
    description: str | None = None
    coupon_type: CouponType
    discount_value: Decimal
    max_discount: Decimal | None = None
    trigger_type: CouponTriggerType = CouponTriggerType.MANUAL
    min_cart_value: Decimal | None = None
    category_id: str | None = None
    # Site-wide campaign fields
    is_auto_apply: bool = False
    auto_apply_priority: int = 0
    campaign_name: str | None = None
    campaign_description: str | None = None
    target_course_ids: list[str] | None = None  # Empty list or None = all courses
    usage_limit: int | None = None
    usage_limit_per_user: int | None = 1
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True
    
    @field_validator("auto_apply_priority")
    @classmethod
    def validate_priority(cls, v: int) -> int:
        if v < 0:
            raise ValueError("auto_apply_priority must be >= 0")
        return v
    
    @field_validator("campaign_name")
    @classmethod
    def validate_campaign_name(cls, v: str | None) -> str | None:
        if v and len(v) > 255:
            raise ValueError("campaign_name must be <= 255 characters")
        return v
    
    @field_validator("target_course_ids")
    @classmethod
    def validate_target_course_ids(cls, v: list[str] | None) -> list[str] | None:
        if v is not None:
            # Convert empty list to None (means all courses)
            if len(v) == 0:
                return None
            # Validate UUID format
            from uuid import UUID as UUIDType
            for course_id in v:
                try:
                    UUIDType(course_id)
                except ValueError:
                    raise ValueError(f"Invalid UUID format: {course_id}")
        return v
    
    @model_validator(mode="after")
    def validate_site_wide_constraints(self) -> "CouponBase":
        # If is_auto_apply is True, trigger_type must be SITE_WIDE
        if self.is_auto_apply and self.trigger_type != CouponTriggerType.SITE_WIDE:
            raise ValueError("is_auto_apply can only be True when trigger_type is 'site_wide'")
        
        # If trigger_type is SITE_WIDE, category_id must be None
        if self.trigger_type == CouponTriggerType.SITE_WIDE and self.category_id is not None:
            raise ValueError("category_id must be None when trigger_type is 'site_wide'")
        
        return self


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    description: str | None = None
    coupon_type: CouponType | None = None
    discount_value: Decimal | None = None
    max_discount: Decimal | None = None
    trigger_type: CouponTriggerType | None = None
    min_cart_value: Decimal | None = None
    category_id: str | None = None
    # Site-wide campaign fields
    is_auto_apply: bool | None = None
    auto_apply_priority: int | None = None
    campaign_name: str | None = None
    campaign_description: str | None = None
    target_course_ids: list[str] | None = None
    usage_limit: int | None = None
    usage_limit_per_user: int | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    is_active: bool | None = None
    
    @field_validator("auto_apply_priority")
    @classmethod
    def validate_priority(cls, v: int | None) -> int | None:
        if v is not None and v < 0:
            raise ValueError("auto_apply_priority must be >= 0")
        return v
    
    @field_validator("campaign_name")
    @classmethod
    def validate_campaign_name(cls, v: str | None) -> str | None:
        if v and len(v) > 255:
            raise ValueError("campaign_name must be <= 255 characters")
        return v
    
    @field_validator("target_course_ids")
    @classmethod
    def validate_target_course_ids(cls, v: list[str] | None) -> list[str] | None:
        if v is not None:
            # Convert empty list to None (means all courses)
            if len(v) == 0:
                return None
            # Validate UUID format
            from uuid import UUID as UUIDType
            for course_id in v:
                try:
                    UUIDType(course_id)
                except ValueError:
                    raise ValueError(f"Invalid UUID format: {course_id}")
        return v
    
    @model_validator(mode="after")
    def validate_site_wide_constraints(self) -> "CouponUpdate":
        # If is_auto_apply is True, trigger_type must be SITE_WIDE (if both are provided)
        if self.is_auto_apply is True and self.trigger_type is not None:
            if self.trigger_type != CouponTriggerType.SITE_WIDE:
                raise ValueError("is_auto_apply can only be True when trigger_type is 'site_wide'")
        
        # If trigger_type is SITE_WIDE, category_id must be None (if provided)
        if self.trigger_type == CouponTriggerType.SITE_WIDE and self.category_id is not None:
            raise ValueError("category_id must be None when trigger_type is 'site_wide'")
        
        return self


class CouponResponse(CouponBase):
    id: str
    used_count: int
    created_by_id: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CouponValidateRequest(BaseModel):
    code: str
    cart_total: Decimal  # Sepet toplam tutarı


class CouponValidateResponse(BaseModel):
    valid: bool
    discount_amount: Decimal
    coupon_id: str
    coupon_code: str
