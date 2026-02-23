import enum
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import DateTime, Enum, String, Text, Numeric, Integer, ForeignKey, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator

from app.db.base import Base


class CourseStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"  # Öğretmen onaya gönderdi
    REJECTED = "rejected"  # Admin reddetti
    PUBLISHED = "published"
    ARCHIVED = "archived"


class LessonType(str, enum.Enum):
    VIDEO = "video"  # Video dersi (mp4, webm, mov, avi, ogg)
    PDF = "pdf"  # PDF doküman
    DOCUMENT = "document"  # DOCX/DOC dosyası
    PRESENTATION = "presentation"  # PPTX/PPT sunum
    QUIZ = "quiz"  # Quiz/sınav
    LIVE_LESSON = "live_lesson"  # Canlı ders (henüz yapılmamış/kayıt yüklenecek)
    TEXT = "text"  # Metin/Rich Text içerik (content_text alanında saklanacak)


class CaseInsensitiveLessonType(TypeDecorator):
    """Case-insensitive LessonType enum decorator for database compatibility"""
    impl = String(50)
    cache_ok = True
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, LessonType):
            return value.value
        # Case-insensitive: convert to lowercase
        return str(value).lower()
    
    def process_result_value(self, value, dialect):
        if value is None:
            return None
        # Case-insensitive lookup - veritabanından gelen değer (PDF, pdf, Pdf) hepsini handle et
        if isinstance(value, LessonType):
            return value
        value_str = str(value)
        value_lower = value_str.lower()
        # Enum value'ları ile eşleştir
        for lesson_type in LessonType:
            if lesson_type.value.lower() == value_lower:
                return lesson_type
        # Fallback: try direct match
        try:
            return LessonType(value_lower)
        except ValueError:
            # If still not found, return the first enum value as fallback
            return LessonType.VIDEO
    
    def load_dialect_impl(self, dialect):
        # PostgreSQL için enum kullan (artık tüm değerler küçük harf)
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(Enum(LessonType, native_enum=True, values_callable=lambda x: [e.value for e in x]))
        return dialect.type_descriptor(String(50))


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Media (local paths for now)
    thumbnail_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Pricing
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    discount_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    # Status
    # PostgreSQL enum'u case-sensitive, bu yüzden enum'ları string olarak saklıyoruz
    # Migration gerektirir ama şimdilik string olarak kullanıyoruz
    status: Mapped[str] = mapped_column(
        String(50),
        default="draft"
    )
    
    @property
    def status_enum(self) -> CourseStatus:
        """Status'u CourseStatus enum'una dönüştür"""
        try:
            return CourseStatus(self.status)
        except ValueError:
            return CourseStatus.DRAFT
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)

    # SEO
    meta_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relations
    teacher_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)

    # Organization specific (for private courses)
    organization_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    is_org_only: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    teacher = relationship("User", back_populates="courses", foreign_keys=[teacher_id])
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="course", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    reviews = relationship("CourseReview", back_populates="course", cascade="all, delete-orphan")
    categories = relationship("Category", secondary="course_categories", back_populates="courses")
    review_history = relationship("CourseReviewHistory", back_populates="course", cascade="all, delete-orphan", order_by="CourseReviewHistory.created_at.desc()")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Content
    lesson_type: Mapped[LessonType] = mapped_column(
        CaseInsensitiveLessonType(),
        default=LessonType.VIDEO,
        index=True
    )
    content_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Storage key (videos/filename.mp4)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # YouTube/Vimeo URL
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Yeni içerik alanları (EPIC-10)
    content_text: Mapped[str | None] = mapped_column(Text, nullable=True)  # TEXT tipi için rich text içerik
    original_filename: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Orijinal dosya adı
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Dosya boyutu (byte)
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)  # MIME tipi (application/pdf, vb.)
    thumbnail_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # İçerik önizleme thumbnail'i
    
    # Canlı ders alanları
    live_lesson_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Zoom/Meet/Teams linki
    live_lesson_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)  # Canlı ders tarihi/saati (timezone-aware)
    live_lesson_recording_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Kayıt dosya yolu (storage key)
    is_live_lesson_ended: Mapped[bool] = mapped_column(Boolean, default=False)  # Canlı ders sona erdi mi

    # Ordering
    order: Mapped[int] = mapped_column(Integer, default=0)

    # Access
    is_preview: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relations
    course_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("courses.id"), nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    course = relationship("Course", back_populates="lessons")
    quiz = relationship("Quiz", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    progress = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")