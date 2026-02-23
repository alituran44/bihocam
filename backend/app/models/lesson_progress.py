import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, String, ForeignKey, Integer, Boolean, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LessonProgress(Base):
    """Ders ilerleme takibi - Kullanıcının hangi dersleri izlediği ve ne kadar izlediği"""
    __tablename__ = "lesson_progress"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="unique_user_lesson_progress"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    lesson_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("lessons.id"), nullable=False, index=True)
    enrollment_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("enrollments.id"), nullable=False, index=True)
    
    # Progress tracking
    watched_seconds: Mapped[int] = mapped_column(Integer, default=0)  # İzlenen saniye
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)  # Ders tamamlandı mı
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # Timestamps
    first_accessed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    last_accessed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress")
    enrollment = relationship("Enrollment", back_populates="lesson_progress")
