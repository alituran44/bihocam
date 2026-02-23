from datetime import datetime
from typing import Optional
import re
import unicodedata

from pydantic import BaseModel, field_validator, model_validator

from app.models.blog_post import BlogPostStatus


def generate_slug(text: str) -> str:
    """Title'dan SEO-friendly slug üret"""
    # Türkçe karakterleri ASCII'ye çevir
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    
    # Küçük harfe çevir
    text = text.lower()
    
    # Özel karakterleri temizle, boşlukları tire ile değiştir
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    
    # Başta ve sonda tire varsa kaldır
    text = text.strip("-")
    
    return text


class BlogPostSEO(BaseModel):
    """SEO ayarları nested schema"""
    meta_title: str | None = None
    meta_description: str | None = None
    meta_keywords: str | None = None
    og_title: str | None = None
    og_description: str | None = None
    og_image_url: str | None = None
    twitter_card: str | None = None
    canonical_url: str | None = None
    schema_json: dict | None = None

    @field_validator("meta_title")
    @classmethod
    def validate_meta_title(cls, v: str | None) -> str | None:
        if v and len(v) > 60:
            raise ValueError("Meta title must be 60 characters or less")
        return v

    @field_validator("meta_description")
    @classmethod
    def validate_meta_description(cls, v: str | None) -> str | None:
        if v and len(v) > 160:
            raise ValueError("Meta description must be 160 characters or less")
        return v


class BlogPostBase(BaseModel):
    """Temel blog post alanları"""
    title: str
    slug: str | None = None
    excerpt: str | None = None
    content: str
    featured_image_url: str | None = None
    status: BlogPostStatus = BlogPostStatus.DRAFT
    published_at: datetime | None = None
    is_featured: bool = False
    is_pinned: bool = False
    allow_comments: bool = True
    category_ids: list[str] = []
    tag_ids: list[str] = []
    
    # SEO fields
    seo_meta_title: str | None = None
    seo_meta_description: str | None = None
    seo_meta_keywords: str | None = None
    seo_og_title: str | None = None
    seo_og_description: str | None = None
    seo_og_image_url: str | None = None
    seo_twitter_card: str | None = None
    seo_canonical_url: str | None = None
    seo_schema_json: dict | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")
        if len(v) > 255:
            raise ValueError("Title must be 255 characters or less")
        return v

    @field_validator("excerpt")
    @classmethod
    def validate_excerpt(cls, v: str | None) -> str | None:
        if v and len(v) > 500:
            raise ValueError("Excerpt must be 500 characters or less")
        return v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        if len(v) < 100:
            raise ValueError("Content must be at least 100 characters")
        return v

    @model_validator(mode="after")
    def generate_slug_if_missing(self):
        """Slug yoksa title'dan otomatik üret"""
        if not self.slug and self.title:
            self.slug = generate_slug(self.title)
        return self


class BlogPostCreate(BlogPostBase):
    """Blog post oluşturma şeması"""
    # author_id otomatik olarak current_user'den alınacak
    pass


class BlogPostUpdate(BaseModel):
    """Blog post güncelleme şeması (tüm alanlar optional)"""
    title: str | None = None
    slug: str | None = None
    excerpt: str | None = None
    content: str | None = None
    featured_image_url: str | None = None
    status: BlogPostStatus | None = None
    published_at: datetime | None = None
    is_featured: bool | None = None
    is_pinned: bool | None = None
    allow_comments: bool | None = None
    category_ids: list[str] | None = None
    tag_ids: list[str] | None = None
    
    # SEO fields
    seo_meta_title: str | None = None
    seo_meta_description: str | None = None
    seo_meta_keywords: str | None = None
    seo_og_title: str | None = None
    seo_og_description: str | None = None
    seo_og_image_url: str | None = None
    seo_twitter_card: str | None = None
    seo_canonical_url: str | None = None
    seo_schema_json: dict | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str | None) -> str | None:
        if v is not None:
            if len(v) < 3:
                raise ValueError("Title must be at least 3 characters")
            if len(v) > 255:
                raise ValueError("Title must be 255 characters or less")
        return v

    @field_validator("excerpt")
    @classmethod
    def validate_excerpt(cls, v: str | None) -> str | None:
        if v and len(v) > 500:
            raise ValueError("Excerpt must be 500 characters or less")
        return v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str | None) -> str | None:
        if v is not None and len(v) < 100:
            raise ValueError("Content must be at least 100 characters")
        return v


class AuthorInfo(BaseModel):
    """Yazar bilgileri (nested)"""
    id: str
    full_name: str
    avatar_url: str | None = None
    bio: str | None = None

    class Config:
        from_attributes = True


class CategoryInfo(BaseModel):
    """Kategori bilgileri (nested)"""
    id: str
    name: str
    slug: str
    color: str | None = None

    class Config:
        from_attributes = True


class TagInfo(BaseModel):
    """Etiket bilgileri (nested)"""
    id: str
    name: str
    slug: str

    class Config:
        from_attributes = True


class BlogPostResponse(BlogPostBase):
    """Blog post response şeması (full details)"""
    id: str
    author_id: str
    view_count: int
    author: AuthorInfo
    categories: list[CategoryInfo] = []
    tags: list[TagInfo] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlogPostListResponse(BaseModel):
    """Blog post liste response şeması (kısaltılmış)"""
    id: str
    title: str
    slug: str
    excerpt: str | None
    featured_image_url: str | None
    author_id: str
    author: AuthorInfo
    status: BlogPostStatus
    published_at: datetime | None
    view_count: int
    is_featured: bool
    is_pinned: bool
    categories: list[CategoryInfo] = []
    tags: list[TagInfo] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
