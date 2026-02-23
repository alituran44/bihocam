from datetime import datetime
import re
import unicodedata

from pydantic import BaseModel, field_validator, model_validator


def generate_slug(text: str) -> str:
    """Text'ten SEO-friendly slug üret"""
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    text = text.strip("-")
    return text


class BlogCategoryBase(BaseModel):
    """Temel kategori alanları"""
    name: str
    slug: str | None = None
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    parent_id: str | None = None
    order: int = 0
    is_active: bool = True
    seo_meta_title: str | None = None
    seo_meta_description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Name must be 100 characters or less")
        return v

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str | None) -> str | None:
        if v and not re.match(r"^#[0-9A-Fa-f]{6}$", v):
            raise ValueError("Color must be a valid hex color code (e.g., #FF0000)")
        return v

    @model_validator(mode="after")
    def generate_slug_if_missing(self):
        """Slug yoksa name'den otomatik üret"""
        if not self.slug and self.name:
            self.slug = generate_slug(self.name)
        return self


class BlogCategoryCreate(BlogCategoryBase):
    """Kategori oluşturma şeması"""
    pass


class BlogCategoryUpdate(BaseModel):
    """Kategori güncelleme şeması"""
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    parent_id: str | None = None
    order: int | None = None
    is_active: bool | None = None
    seo_meta_title: str | None = None
    seo_meta_description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is not None:
            if len(v) < 2:
                raise ValueError("Name must be at least 2 characters")
            if len(v) > 100:
                raise ValueError("Name must be 100 characters or less")
        return v

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str | None) -> str | None:
        if v and not re.match(r"^#[0-9A-Fa-f]{6}$", v):
            raise ValueError("Color must be a valid hex color code (e.g., #FF0000)")
        return v


class BlogCategoryResponse(BlogCategoryBase):
    """Kategori response şeması"""
    id: str
    parent: "BlogCategoryResponse | None" = None
    children: list["BlogCategoryResponse"] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Forward reference için
BlogCategoryResponse.model_rebuild()
