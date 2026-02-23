from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SiteGeneralSettings(BaseModel):
    site_title: str | None = None
    site_url: str | None = None
    meta_description: str | None = None
    meta_keywords: str | None = None
    site_author: str | None = None
    footer_text: str | None = None
    logo_url: str | None = None
    favicon_url: str | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None


class SitePlatformSettings(BaseModel):
    platform_commission_rate: float | None = Field(default=None, ge=0.0, le=1.0)  # 0.0-1.0 arası (örn: 0.35 = %35)
    currency: str | None = Field(default="TRY")
    tax_rate: float | None = Field(default=None, ge=0.0, le=1.0)  # Opsiyonel, 0.0-1.0 arası
    maintenance_mode: bool | None = Field(default=False)
    maintenance_message: str | None = None
    maintenance_estimated_end: datetime | None = None


class SiteSMTPSettings(BaseModel):
    host: str | None = None
    port: int | None = Field(default=None, ge=1, le=65535)
    username: str | None = None
    password_encrypted: str | None = None
    use_tls: bool | None = None
    use_ssl: bool | None = None
    from_email: str | None = None


class SiteSettingsResponse(BaseModel):
    general: dict[str, Any] | None = None
    smtp: dict[str, Any] | None = None
    platform: dict[str, Any] | None = None
    seo: dict[str, Any] | None = None
    custom_code: dict[str, Any] | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class SiteSettingsUpdate(BaseModel):
    general: dict[str, Any] | None = None
    smtp: dict[str, Any] | None = None
    platform: dict[str, Any] | None = None
    seo: dict[str, Any] | None = None
    custom_code: dict[str, Any] | None = None


class PublicSettingsResponse(BaseModel):
    """Public endpoint için sadece güvenli bilgiler"""
    site_title: str | None = None
    logo_url: str | None = None
    favicon_url: str | None = None
    footer_text: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    meta_description: str | None = None
    meta_keywords: str | None = None
    seo: dict[str, Any] | None = None  # SEO kodları (public, tracking için)
    custom_code: dict[str, Any] | None = None  # Custom kodlar (public, sayfaya inject için)
    platform: dict[str, Any] | None = None  # Platform ayarları (maintenance mode için)


class EmailTestRequest(BaseModel):
    to_email: str
    subject: str | None = None
    template_name: str | None = None
    context: dict[str, Any] | None = None


class EmailTemplatePreviewRequest(BaseModel):
    template_name: str
    subject: str | None = None
    context: dict[str, Any] | None = None


class EmailTemplatePreviewResponse(BaseModel):
    template_name: str
    subject: str
    html_body: str
    plain_body: str | None = None


class EmailTemplateMeta(BaseModel):
    template_name: str
    title: str
    description: str
    default_subject: str
    variables: list[str]


class EmailTestResponse(BaseModel):
    success: bool
    message: str


class EmailCustomTemplateBase(BaseModel):
    name: str
    subject: str
    html_body: str
    plain_body: str | None = None
    description: str | None = None
    variables: list[str] = []


class EmailCustomTemplateCreate(EmailCustomTemplateBase):
    pass


class EmailCustomTemplateUpdate(BaseModel):
    name: str | None = None
    subject: str | None = None
    html_body: str | None = None
    plain_body: str | None = None
    description: str | None = None
    variables: list[str] | None = None


class EmailCustomTemplateResponse(EmailCustomTemplateBase):
    id: str
    created_at: datetime
    updated_at: datetime


class EmailCampaignSendRequest(BaseModel):
    template_id: str | None = None
    subject: str | None = None
    html_body: str | None = None
    plain_body: str | None = None
    segment_key: str | None = None
    custom_segment_id: str | None = None
    role: str | None = None
    user_ids: list[str] | None = None
    context: dict[str, Any] | None = None
    schedule_at: datetime | None = None


class EmailCampaignSendResponse(BaseModel):
    success: bool
    queued_count: int
    message: str
    scheduled_for: datetime | None = None


class EmailSegmentResponse(BaseModel):
    key: str
    title: str
    description: str


class EmailCustomSegmentCreate(BaseModel):
    name: str
    description: str | None = None
    user_ids: list[str]


class EmailCustomSegmentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    user_ids: list[str] | None = None


class EmailCustomSegmentResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    user_ids: list[str]
    created_at: datetime
    updated_at: datetime


class EmailCampaignRecipientPreviewItem(BaseModel):
    id: str
    full_name: str | None = None
    email: str
    role: str | None = None


class EmailCampaignPreviewRequest(BaseModel):
    segment_key: str | None = None
    custom_segment_id: str | None = None
    role: str | None = None
    user_ids: list[str] | None = None
    sample_limit: int = Field(default=5, ge=0, le=20)


class EmailCampaignPreviewResponse(BaseModel):
    total_recipients: int
    sample_recipients: list[EmailCampaignRecipientPreviewItem]
    role_breakdown: dict[str, int] = {}


class EmailAudienceCsvImportResponse(BaseModel):
    success: bool
    message: str
    segment: EmailCustomSegmentResponse

