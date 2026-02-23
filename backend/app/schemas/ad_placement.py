from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.models.ad_placement import PlacementType


class AdPlacementBase(BaseModel):
    """Temel placement alanları"""

    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=50, pattern="^[a-z0-9_]+$")
    description: str | None = None
    placement_type: PlacementType
    location: str = Field(..., min_length=1, max_length=100)
    width: int = Field(..., gt=0)
    height: int = Field(..., gt=0)
    max_ads: int = Field(default=1, gt=0)
    is_active: bool = True
    priority: int = Field(default=0, ge=0)
    targeting_options: dict | None = None

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        # Lowercase, alphanumeric + underscore only
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("code must contain only lowercase letters, numbers, underscores, and hyphens")
        return v.lower()


class AdPlacementCreate(AdPlacementBase):
    """Placement oluşturma için schema"""

    pass


class AdPlacementUpdate(BaseModel):
    """Placement güncelleme için schema"""

    name: str | None = Field(None, min_length=1, max_length=100)
    code: str | None = Field(None, min_length=1, max_length=50, pattern="^[a-z0-9_]+$")
    description: str | None = None
    placement_type: PlacementType | None = None
    location: str | None = Field(None, min_length=1, max_length=100)
    width: int | None = Field(None, gt=0)
    height: int | None = Field(None, gt=0)
    max_ads: int | None = Field(None, gt=0)
    is_active: bool | None = None
    priority: int | None = Field(None, ge=0)
    targeting_options: dict | None = None


class AdPlacementResponse(AdPlacementBase):
    """Placement response schema"""

    id: str
    created_at: datetime
    updated_at: datetime

    # Relationships (optional)
    pricing: dict | None = None  # Active pricing info (dict with pricing_model keys)
    active_campaigns_count: int | None = None

    class Config:
        from_attributes = True


class AdPlacementListResponse(BaseModel):
    """Placement liste response schema"""

    id: str
    name: str
    code: str
    placement_type: PlacementType
    location: str
    width: int
    height: int
    max_ads: int
    is_active: bool
    priority: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
