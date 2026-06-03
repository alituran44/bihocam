from datetime import datetime
from uuid import uuid4
from sqlalchemy import DateTime, ForeignKey, String, Integer, Text, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Homework(Base):
    """Eğitmenler tarafından kurs öğrencilerine verilen ödevler"""
    __tablename__ = "homeworks"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    teacher_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    lesson_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # İsteğe bağlı ek kaynak dosya
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_assigned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    teacher = relationship("User", foreign_keys=[teacher_id])
    course = relationship("Course", foreign_keys=[course_id])
    student = relationship("User", foreign_keys=[student_id])
    submissions = relationship("HomeworkSubmission", back_populates="homework", cascade="all, delete-orphan")


class HomeworkSubmission(Base):
    """Öğrencilerin teslim ettikleri ödev cevapları"""
    __tablename__ = "homework_submissions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    homework_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("homeworks.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    submission_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Öğrencinin yüklediği dosya
    
    grade: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 0-100 puanı
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)   # Eğitmen geribildirimi
    
    submitted_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    graded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    homework = relationship("Homework", back_populates="submissions")
    student = relationship("User", foreign_keys=[student_id])
