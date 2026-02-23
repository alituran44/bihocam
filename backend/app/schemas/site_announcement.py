from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.site_announcement import AnnouncementType


class SiteAnnouncementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    type: AnnouncementType = AnnouncementType.INFO
    is_active: bool = True
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    target_audience: str | None = Field(default="all", pattern="^(all|students|teachers|admins)$")
    priority: int = Field(default=0, ge=0)
    is_dismissible: bool = True


class SiteAnnouncementCreate(SiteAnnouncementBase):
    pass


class SiteAnnouncementUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    message: str | None = Field(None, min_length=1)
    type: AnnouncementType | None = None
    is_active: bool | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    target_audience: str | None = Field(None, pattern="^(all|students|teachers|admins)$")
    priority: int | None = Field(None, ge=0)
    is_dismissible: bool | None = None


class SiteAnnouncementResponse(SiteAnnouncementBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
