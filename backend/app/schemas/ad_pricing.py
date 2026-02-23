from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

from app.models.ad_campaign import PricingModel


class AdPricingBase(BaseModel):
    """Temel pricing alanları"""

    placement_id: str
    pricing_model: PricingModel

    # Pricing amounts (model'e göre hangisi kullanılacaksa)
    price_per_day: Decimal | None = Field(None, gt=0)
    price_per_impression: Decimal | None = Field(None, gt=0)
    price_per_click: Decimal | None = Field(None, gt=0)

    # Budget constraints
    min_daily_budget: Decimal | None = Field(None, gt=0)
    max_daily_budget: Decimal | None = Field(None, gt=0)

    # Campaign duration constraints
    min_campaign_duration_days: int = Field(default=1, gt=0)
    max_campaign_duration_days: int | None = Field(None, gt=0)

    # Discount
    discount_percentage: Decimal = Field(default=Decimal("0.00"), ge=0, le=100)

    # Status
    is_active: bool = True

    # Effective dates
    effective_from: datetime
    effective_until: datetime | None = None

    @field_validator("effective_until")
    @classmethod
    def validate_date_range(cls, v: datetime | None, info) -> datetime | None:
        if v is not None and info.data.get("effective_from") is not None:
            if v <= info.data["effective_from"]:
                raise ValueError("effective_until must be after effective_from")
        return v

    @field_validator("price_per_day", "price_per_impression", "price_per_click")
    @classmethod
    def validate_pricing_model(cls, v: Decimal | None, info) -> Decimal | None:
        pricing_model = info.data.get("pricing_model")
        if pricing_model == PricingModel.FIXED_DAILY:
            if v is None and info.field_name == "price_per_day":
                raise ValueError("price_per_day is required for FIXED_DAILY pricing model")
        elif pricing_model == PricingModel.PER_IMPRESSION:
            if v is None and info.field_name == "price_per_impression":
                raise ValueError("price_per_impression is required for PER_IMPRESSION pricing model")
        elif pricing_model == PricingModel.PER_CLICK:
            if v is None and info.field_name == "price_per_click":
                raise ValueError("price_per_click is required for PER_CLICK pricing model")
        return v

    @field_validator("max_daily_budget")
    @classmethod
    def validate_max_daily_budget(cls, v: Decimal | None, info) -> Decimal | None:
        if v is not None and info.data.get("min_daily_budget") is not None:
            min_budget = info.data["min_daily_budget"]
            if v < min_budget:
                raise ValueError("max_daily_budget must be >= min_daily_budget")
        return v

    @field_validator("max_campaign_duration_days")
    @classmethod
    def validate_max_duration(cls, v: int | None, info) -> int | None:
        if v is not None and info.data.get("min_campaign_duration_days") is not None:
            min_duration = info.data["min_campaign_duration_days"]
            if v < min_duration:
                raise ValueError("max_campaign_duration_days must be >= min_campaign_duration_days")
        return v


class AdPricingCreate(AdPricingBase):
    """Pricing oluşturma için schema"""

    pass


class AdPricingUpdate(BaseModel):
    """Pricing güncelleme için schema"""

    placement_id: str | None = None
    pricing_model: PricingModel | None = None
    price_per_day: Decimal | None = Field(None, gt=0)
    price_per_impression: Decimal | None = Field(None, gt=0)
    price_per_click: Decimal | None = Field(None, gt=0)
    min_daily_budget: Decimal | None = Field(None, gt=0)
    max_daily_budget: Decimal | None = Field(None, gt=0)
    min_campaign_duration_days: int | None = Field(None, gt=0)
    max_campaign_duration_days: int | None = Field(None, gt=0)
    discount_percentage: Decimal | None = Field(None, ge=0, le=100)
    is_active: bool | None = None
    effective_from: datetime | None = None
    effective_until: datetime | None = None


class AdPricingResponse(AdPricingBase):
    """Pricing response schema"""

    id: str
    created_by_id: str
    updated_by_id: str | None
    created_at: datetime
    updated_at: datetime

    # Relationships (optional)
    placement: dict | None = None

    class Config:
        from_attributes = True


class AdPricingListResponse(BaseModel):
    """Pricing liste response schema"""

    id: str
    placement_id: str
    pricing_model: PricingModel
    price_per_day: Decimal | None
    price_per_impression: Decimal | None
    price_per_click: Decimal | None
    is_active: bool
    effective_from: datetime
    effective_until: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CampaignCostCalculationResponse(BaseModel):
    """Kampanya maliyeti hesaplama response"""

    calculated_cost: Decimal
    breakdown: dict  # Detaylı breakdown (günlük, toplam, vb.)
    pricing_info: dict  # Kullanılan pricing bilgisi
