from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator, HttpUrl

from app.models.ad_campaign import (
    CampaignStatus,
    CampaignType,
    PricingModel,
    ApprovalStatus,
    PaymentStatus,
)


class AdCampaignBase(BaseModel):
    """Temel kampanya alanları"""

    name: str = Field(..., min_length=1, max_length=255)
    campaign_type: CampaignType
    placement_id: str
    course_id: str | None = None  # Optional: banner_ad için gerekli değil

    # Banner ad fields
    banner_image_url: str | None = Field(None, max_length=500)
    banner_link_url: str | None = Field(None, max_length=500)
    banner_alt_text: str | None = Field(None, max_length=255)

    # Date range
    start_date: datetime
    end_date: datetime

    # Budget
    daily_budget: Decimal | None = Field(None, gt=0)
    total_budget: Decimal = Field(..., gt=0)

    # Pricing (calculated from placement pricing)
    pricing_model: PricingModel = PricingModel.FIXED_DAILY

    # Targeting
    target_categories: list[str] | None = None
    target_tags: list[str] | None = None
    is_targeted: bool = False

    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, v: datetime, info) -> datetime:
        if v is not None and info.data.get("start_date") is not None:
            if v <= info.data["start_date"]:
                raise ValueError("end_date must be after start_date")
        return v

    @field_validator("daily_budget")
    @classmethod
    def validate_daily_budget(cls, v: Decimal | None, info) -> Decimal | None:
        if v is not None and info.data.get("total_budget") is not None:
            total = info.data["total_budget"]
            if v > total:
                raise ValueError("daily_budget cannot exceed total_budget")
        return v

    @field_validator("course_id")
    @classmethod
    def validate_course_id(cls, v: str | None, info) -> str | None:
        """course_id sadece featured_course ve course_promotion için zorunlu"""
        campaign_type = info.data.get("campaign_type")
        if campaign_type in [CampaignType.FEATURED_COURSE, CampaignType.COURSE_PROMOTION]:
            if not v or not v.strip():
                raise ValueError("course_id is required for featured_course and course_promotion campaign types")
        return v

    @field_validator("banner_image_url", "banner_link_url")
    @classmethod
    def validate_banner_fields(cls, v: str | None, info) -> str | None:
        """Banner alanları sadece banner_ad için zorunlu"""
        campaign_type = info.data.get("campaign_type")
        field_name = info.field_name
        
        if campaign_type == CampaignType.BANNER_AD:
            if not v or not v.strip():
                raise ValueError(f"{field_name} is required for banner_ad campaign type")
        
        # URL validation
        if v is not None and v:
            if not (v.startswith("http://") or v.startswith("https://")):
                raise ValueError("URL must start with http:// or https://")
        return v


class AdCampaignCreate(AdCampaignBase):
    """Kampanya oluşturma için schema"""

    payment_method: str = "balance"  # balance veya credit_card


class AdCampaignUpdate(BaseModel):
    """Kampanya güncelleme için schema (tüm alanlar optional)"""

    name: str | None = Field(None, min_length=1, max_length=255)
    campaign_type: CampaignType | None = None
    placement_id: str | None = None
    course_id: str | None = None

    # Banner ad fields
    banner_image_url: str | None = Field(None, max_length=500)
    banner_link_url: str | None = Field(None, max_length=500)
    banner_alt_text: str | None = Field(None, max_length=255)

    # Date range
    start_date: datetime | None = None
    end_date: datetime | None = None

    # Budget
    daily_budget: Decimal | None = Field(None, gt=0)
    total_budget: Decimal | None = Field(None, gt=0)

    # Pricing
    pricing_model: PricingModel | None = None

    # Targeting
    target_categories: list[str] | None = None
    target_tags: list[str] | None = None
    is_targeted: bool | None = None

    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, v: datetime | None, info) -> datetime | None:
        if v is not None:
            starts_at = info.data.get("start_date")
            if starts_at is not None and v <= starts_at:
                raise ValueError("end_date must be after start_date")
        return v


class AdCampaignResponse(AdCampaignBase):
    """Kampanya response schema (full details)"""

    id: str
    teacher_id: str
    status: CampaignStatus
    approval_status: ApprovalStatus
    payment_status: PaymentStatus
    price_per_day: Decimal
    price_per_impression: Decimal | None
    price_per_click: Decimal | None
    spent_amount: Decimal
    impressions: int
    clicks: int
    conversions: int
    ctr: Decimal
    approved_by_id: str | None
    approved_at: datetime | None
    rejection_reason: str | None
    payment_transaction_id: str | None
    created_at: datetime
    updated_at: datetime

    payment_iframe_url: str | None = None
    payment_token: str | None = None

    # Relationships (optional, loaded with selectinload)
    teacher: dict | None = None  # User summary
    course: dict | None = None  # Course summary
    placement: dict | None = None  # Placement summary

    class Config:
        from_attributes = True


class AdCampaignListResponse(BaseModel):
    """Kampanya liste response schema (kısaltılmış)"""

    id: str
    name: str
    campaign_type: CampaignType
    status: CampaignStatus
    approval_status: ApprovalStatus
    placement_id: str
    course_id: str | None
    start_date: datetime
    end_date: datetime
    total_budget: Decimal
    spent_amount: Decimal
    impressions: int
    clicks: int
    ctr: Decimal
    created_at: datetime
    updated_at: datetime

    # Relationships (optional)
    placement: dict | None = None
    course: dict | None = None

    class Config:
        from_attributes = True


class AdCampaignAnalyticsResponse(BaseModel):
    """Kampanya analitik response schema"""

    campaign_id: str
    date_from: datetime
    date_to: datetime
    total_impressions: int
    total_clicks: int
    total_conversions: int
    total_spent: Decimal
    average_ctr: Decimal
    average_conversion_rate: Decimal
    average_cpc: Decimal
    average_cpm: Decimal
    daily_analytics: list[dict]  # Günlük breakdown

    class Config:
        from_attributes = True
