import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, String, ForeignKey, Integer, Text, Boolean, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CourseReview(Base):
    """Kurs yorumları ve değerlendirmeleri"""
    __tablename__ = "course_reviews"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="unique_user_course_review"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    course_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("courses.id"), nullable=False, index=True)
    enrollment_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("enrollments.id"), nullable=True)
    
    # Rating (1-5 stars)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5 arası
    
    # Review content
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Status
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)  # Admin onayı için (default: False - yeni yorumlar onay bekler)
    is_helpful_count: Mapped[int] = mapped_column(Integer, default=0)  # Faydalı bulundu sayısı
    
    # Moderation fields
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)  # Onaylanma tarihi
    approved_by_admin_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)  # Onaylayan admin
    moderation_note: Mapped[str | None] = mapped_column(Text, nullable=True)  # Moderasyon notu (red sebebi vb.)
    
    # Teacher reply fields
    teacher_reply: Mapped[str | None] = mapped_column(Text, nullable=True)  # Eğitmen cevabı
    teacher_reply_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)  # Cevap tarihi
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="course_reviews", foreign_keys=[user_id])
    course = relationship("Course", back_populates="reviews")
    enrollment = relationship("Enrollment")
    approved_by_admin = relationship("User", foreign_keys=[approved_by_admin_id])