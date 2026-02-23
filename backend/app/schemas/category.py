"""
Category schemas for API requests and responses.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    """Base category schema"""
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    parent_id: Optional[UUID] = None
    order: int = Field(0, ge=0)


class CategoryCreate(CategoryBase):
    """Schema for creating a category"""
    pass


class CategoryUpdate(BaseModel):
    """Schema for updating a category (partial update)"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    parent_id: Optional[UUID] = None
    order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    """Schema for category response"""
    id: UUID
    slug: str
    is_active: bool
    course_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryTreeResponse(CategoryResponse):
    """Schema for hierarchical category tree response"""
    children: list["CategoryTreeResponse"] = []

    class Config:
        from_attributes = True


class CategoryDetailResponse(CategoryResponse):
    """Schema for category detail with parent and children"""
    children: list[CategoryResponse] = []
    parent: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


class CategoryDeleteRequest(BaseModel):
    """Schema for category delete request"""
    migrate_to_category_id: Optional[UUID] = None
