from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator, model_validator

from app.models.course import CourseStatus, LessonType


class LessonBase(BaseModel):
    title: str
    description: str | None = None
    lesson_type: LessonType = LessonType.VIDEO
    video_url: str | None = None
    duration_seconds: int | None = None
    order: int = 0
    is_preview: bool = False


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    """Ders güncelleme şeması"""
    title: str | None = None
    description: str | None = None
    lesson_type: LessonType | None = None
    is_preview: bool | None = None
    video_url: str | None = None
    duration_seconds: int | None = None
    content_text: str | None = None
    live_lesson_url: str | None = None
    live_lesson_at: datetime | None = None
    order: int | None = None


class LessonReorderRequest(BaseModel):
    """Ders sıralama şeması"""
    lesson_ids: list[str]  # Sıralı lesson ID listesi


class LiveLessonCreate(BaseModel):
    """Canlı ders oluşturma şeması"""
    title: str
    description: str | None = None
    live_lesson_url: str
    live_lesson_at: datetime
    is_preview: bool = False
    notify_students: bool = True  # Tüm kayıtlı öğrencilere otomatik bildirim gönder


class LiveLessonRescheduleRequest(BaseModel):
    """Canlı ders yeniden zamanlama şeması"""
    live_lesson_url: str | None = None
    live_lesson_at: datetime
    notify_students: bool = True  # Öğrencilere delta notification gönder


class LessonResponse(LessonBase):
    """
    Ders response şeması (EP10-BE-07)
    
    SECURITY: content_path internal storage path, client'a content_url döndürülür
    PRODUCT: can_access ve requires_enrollment frontend koşullu render için
    NULL SEMANTICS:
    - content_url: null = içerik yok, "" = boş string (geçersiz)
    - can_access: true = erişim var, false = erişim yok
    - requires_enrollment: true = kayıt gerekli, false = preview veya sahip/admin
    """
    id: str
    course_id: str
    
    # Content URLs (StorageService'den alınan erişim URL'leri)
    content_url: str | None = None  # İçerik erişim URL'i (content_path yerine)
    content_path: str | None = None  # DEPRECATED: Internal storage key (backward compatibility için tutuluyor)
    thumbnail_url: str | None = None  # Thumbnail erişim URL'i
    live_lesson_recording_url: str | None = None  # Canlı ders kaydı erişim URL'i
    
    # Content metadata
    original_filename: str | None = None  # Orijinal dosya adı (null = dosya yok)
    file_size_bytes: int | None = None  # Dosya boyutu (bytes, null = bilinmiyor)
    mime_type: str | None = None  # MIME type (null = bilinmiyor)
    content_text: str | None = None  # TEXT tipi için rich text içerik (null = boş, "" = boş string)
    
    # Live lesson fields
    live_lesson_url: str | None = None  # Zoom/Meet/Teams linki (null = canlı ders değil)
    live_lesson_at: datetime | None = None  # Canlı ders tarihi/saati (null = zamanlanmamış)
    is_live_lesson_ended: bool = False  # Canlı ders sona erdi mi
    
    # Access control (frontend için)
    can_access: bool = False  # Kullanıcı bu derse erişebilir mi (preview/enrolled/owner/admin)
    requires_enrollment: bool = True  # Bu ders için kayıt gerekli mi (preview değilse true)
    
    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    title: str
    description: str | None = None
    price: Decimal = Decimal("0")
    discount_price: Decimal | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    is_org_only: bool = False

    # P1-04: Fiyat validasyonu — negatif fiyat engellenir
    @field_validator("price")
    @classmethod
    def validate_price(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("Fiyat negatif olamaz")
        return v

    @field_validator("discount_price")
    @classmethod
    def validate_discount_price(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v < 0:
            raise ValueError("İndirimli fiyat negatif olamaz")
        return v

    @model_validator(mode="after")
    def validate_discount_not_exceeds_price(self) -> "CourseBase":
        if self.discount_price is not None and self.price is not None:
            if self.discount_price > self.price:
                raise ValueError("İndirimli fiyat normal fiyattan büyük olamaz")
        return self


class CourseCreate(CourseBase):
    slug: str
    category_id: str | None = None  # Deprecated: use category_ids instead
    category_ids: Optional[list[UUID]] = None
    organization_id: str | None = None


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: Decimal | None = None
    discount_price: Decimal | None = None
    status: str | None = None  # Changed from CourseStatus enum to string
    is_featured: bool | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    category_ids: Optional[list[UUID]] = None

    # P1-04: Fiyat validasyonu — güncelleme sırasında da kontrol
    @field_validator("price")
    @classmethod
    def validate_price(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v < 0:
            raise ValueError("Fiyat negatif olamaz")
        return v

    @field_validator("discount_price")
    @classmethod
    def validate_discount_price(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v < 0:
            raise ValueError("İndirimli fiyat negatif olamaz")
        return v


class TeacherInfo(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    expertise_tags: Optional[list[str]] = None
    social_links: Optional[dict] = None
    avatar_url: Optional[str] = None
    live_class_price: Optional[float] = None
    live_class_discount_price: Optional[float] = None
    live_class_link: Optional[str] = None
    promo_images: Optional[list[str]] = None
    promo_video: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryInfo(BaseModel):
    """Category info for course response"""
    id: UUID
    name: str
    slug: str
    color: str | None = None

    class Config:
        from_attributes = True


class CourseResponse(CourseBase):
    id: str
    slug: str
    thumbnail_path: str | None = None
    status: str  # Changed from CourseStatus enum to string
    is_featured: bool
    teacher_id: str
    teacher: TeacherInfo | None = None
    category_id: str | None = None  # Deprecated: use categories instead
    categories: list[CategoryInfo] = []
    organization_id: str | None = None
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None = None
    lessons: list[LessonResponse] = []

    @field_validator("thumbnail_path")
    @classmethod
    def get_thumbnail_url(cls, v: str | None) -> str | None:
        if v:
            if v.startswith("http://") or v.startswith("https://") or v.startswith("/api/v1/media"):
                return v
            filename = v.split("/")[-1]
            return f"http://127.0.0.1:8000/api/v1/media/thumbnails/{filename}"
        return v

    class Config:
        from_attributes = True
