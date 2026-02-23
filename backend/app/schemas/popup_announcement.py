from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator, HttpUrl

from app.models.popup_announcement import PopupType


class PopupAnnouncementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    popup_type: PopupType = PopupType.INFO
    is_active: bool = True
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    target_audience: str = Field(
        default="all", pattern="^(all|students|teachers|admins)$"
    )
    priority: int = Field(default=0, ge=0)
    is_dismissible: bool = True
    show_once_per_user: bool = False
    dismiss_duration_days: int | None = Field(None, ge=0)
    image_url: str | None = Field(None, max_length=500)
    button_text: str | None = Field(None, max_length=100)
    button_link_url: str | None = Field(None, max_length=500)
    button_link_target: str = Field(default="_self", pattern="^(_self|_blank)$")
    width: int = Field(default=500, gt=0)
    height: int | None = Field(None, gt=0)
    position: str = Field(default="center", pattern="^(center|top|bottom|top_left|top_right|bottom_left|bottom_right)$")
    overlay_opacity: Decimal = Field(default=Decimal("0.5"), ge=0, le=1)

    @field_validator("expires_at")
    @classmethod
    def validate_date_range(cls, v: datetime | None, info) -> datetime | None:
        if v is not None and info.data.get("starts_at") is not None:
            if v <= info.data["starts_at"]:
                raise ValueError("expires_at must be after starts_at")
        return v


class PopupAnnouncementCreate(PopupAnnouncementBase):
    pass


class PopupAnnouncementUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    message: str | None = Field(None, min_length=1)
    popup_type: PopupType | None = None
    is_active: bool | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    target_audience: str | None = Field(None, pattern="^(all|students|teachers|admins)$")
    priority: int | None = Field(None, ge=0)
    is_dismissible: bool | None = None
    show_once_per_user: bool | None = None
    dismiss_duration_days: int | None = Field(None, ge=0)
    image_url: str | None = Field(None, max_length=500)
    button_text: str | None = Field(None, max_length=100)
    button_link_url: str | None = Field(None, max_length=500)
    button_link_target: str | None = Field(None, pattern="^(_self|_blank)$")
    width: int | None = Field(None, gt=0)
    height: int | None = Field(None, gt=0)
    position: str | None = Field(None, pattern="^(center|top|bottom|top_left|top_right|bottom_left|bottom_right)$")
    overlay_opacity: Decimal | None = Field(None, ge=0, le=1)

    @field_validator("expires_at")
    @classmethod
    def validate_date_range(cls, v: datetime | None, info) -> datetime | None:
        if v is not None:
            starts_at = info.data.get("starts_at")
            if starts_at is not None and v <= starts_at:
                raise ValueError("expires_at must be after starts_at")
        return v


class PopupAnnouncementResponse(PopupAnnouncementBase):
    id: str
    created_by_id: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PopupAnnouncementListResponse(BaseModel):
    id: str
    title: str
    popup_type: PopupType
    is_active: bool
    starts_at: datetime | None
    expires_at: datetime | None
    target_audience: str
    priority: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
