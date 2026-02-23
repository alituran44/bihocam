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


class BlogTagBase(BaseModel):
    """Temel etiket alanları"""
    name: str
    slug: str | None = None
    description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 50:
            raise ValueError("Name must be 50 characters or less")
        return v

    @model_validator(mode="after")
    def generate_slug_if_missing(self):
        """Slug yoksa name'den otomatik üret"""
        if not self.slug and self.name:
            self.slug = generate_slug(self.name)
        return self


class BlogTagCreate(BlogTagBase):
    """Etiket oluşturma şeması"""
    pass


class BlogTagUpdate(BaseModel):
    """Etiket güncelleme şeması"""
    name: str | None = None
    slug: str | None = None
    description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is not None:
            if len(v) < 2:
                raise ValueError("Name must be at least 2 characters")
            if len(v) > 50:
                raise ValueError("Name must be 50 characters or less")
        return v


class BlogTagResponse(BlogTagBase):
    """Etiket response şeması"""
    id: str
    usage_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
