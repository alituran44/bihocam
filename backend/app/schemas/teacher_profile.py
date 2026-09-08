from typing import Optional
from pydantic import BaseModel, EmailStr, HttpUrl, field_validator, Field
from datetime import datetime
from app.utils.validation import sanitize_html, validate_social_url


class SocialLinks(BaseModel):
    """Sosyal medya linkleri"""
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    instagram: Optional[str] = None
    website: Optional[str] = None

    @field_validator("linkedin", "twitter", "instagram", "website", mode="before")
    @classmethod
    def validate_url(cls, v):
        if v is None or v == "":
            return None
        # Basit URL kontrolü - http/https ile başlamalı
        if isinstance(v, str) and not v.startswith(("http://", "https://")):
            raise ValueError("URL http:// veya https:// ile başlamalıdır")
        return v


class TeacherProfileUpdate(BaseModel):
    """Öğretmen profil güncelleme request schema"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = Field(None, max_length=2000)  # Max 2000 karakter biyografi
    expertise_tags: Optional[list[str]] = Field(None, max_length=20)  # Max 20 tag
    social_links: Optional[SocialLinks] = None
    avatar_url: Optional[str] = Field(None, max_length=500)
    live_class_price: Optional[float] = Field(None, ge=0.0)
    live_class_discount_price: Optional[float] = Field(None, ge=0.0)
    face_to_face_price: Optional[float] = Field(None, ge=0.0)
    live_class_link: Optional[str] = Field(None, max_length=500)
    promo_images: Optional[list[str]] = None
    promo_video: Optional[str] = Field(None, max_length=500)
    tax_info: Optional[dict] = None

    @field_validator("bio")
    @classmethod
    def validate_bio(cls, v):
        if v is None:
            return None
        # XSS sanitization - HTML tag'leri escape et
        return sanitize_html(v)

    @field_validator("expertise_tags")
    @classmethod
    def validate_tags(cls, v):
        if v is None:
            return None
        # Duplicate tag'leri temizle ve boş string'leri filtrele
        unique_tags = list(dict.fromkeys([tag.strip() for tag in v if tag.strip()]))
        if len(unique_tags) > 20:
            raise ValueError("En fazla 20 uzmanlık alanı eklenebilir")
        # Her tag max 50 karakter
        for tag in unique_tags:
            if len(tag) > 50:
                raise ValueError(f"Uzmanlık alanı en fazla 50 karakter olabilir: {tag}")
        return unique_tags

    @field_validator("social_links")
    @classmethod
    def validate_social_links(cls, v):
        if v is None:
            return None
        # Validate each social link URL
        if v.linkedin and not validate_social_url(v.linkedin, "linkedin"):
            raise ValueError("Geçersiz LinkedIn URL. Sadece linkedin.com domain'i kabul edilir.")
        if v.twitter and not validate_social_url(v.twitter, "twitter"):
            raise ValueError("Geçersiz Twitter URL. Sadece twitter.com veya x.com domain'i kabul edilir.")
        if v.instagram and not validate_social_url(v.instagram, "instagram"):
            raise ValueError("Geçersiz Instagram URL. Sadece instagram.com domain'i kabul edilir.")
        if v.website and not validate_social_url(v.website, "website"):
            raise ValueError("Geçersiz website URL.")
        return v


class TeacherProfileResponse(BaseModel):
    """Öğretmen profil response schema"""
    id: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    bio: Optional[str] = None
    expertise_tags: Optional[list[str]] = None
    social_links: Optional[SocialLinks] = None
    avatar_url: Optional[str] = None
    live_class_price: Optional[float] = None
    live_class_discount_price: Optional[float] = None
    face_to_face_price: Optional[float] = None
    live_class_link: Optional[str] = None
    promo_images: Optional[list[str]] = None
    promo_video: Optional[str] = None
    tax_info: Optional[dict] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
