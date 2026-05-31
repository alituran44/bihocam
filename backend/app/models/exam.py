from datetime import datetime
from uuid import uuid4
from sqlalchemy import DateTime, ForeignKey, String, Integer, Text, Boolean, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Exam(Base):
    """Kurslar altındaki testler (Sınavlar)"""
    __tablename__ = "exams"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    course_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Ders bölüm adı (serbest metin)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon: Mapped[str | None] = mapped_column(String(50), default="graduation-cap")
    
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60)  # Toplam süre (dakika)
    max_attempts: Mapped[int] = mapped_column(Integer, default=3)       # Maksimum deneme hakkı
    passing_grade: Mapped[int] = mapped_column(Integer, default=70)     # Geçme notu (0-100)
    validity_days: Mapped[int] = mapped_column(Integer, default=365)    # Geçerlilik süresi (gün)

    randomize_questions: Mapped[bool] = mapped_column(Boolean, default=True)
    include_certificate: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    course = relationship("Course", foreign_keys=[course_id])
    questions = relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan")
    attempts = relationship("ExamAttempt", back_populates="exam", cascade="all, delete-orphan")


class ExamQuestion(Base):
    """Sınav soruları"""
    __tablename__ = "exam_questions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    exam_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    
    question_type: Mapped[str] = mapped_column(String(50), default="multiple_choice")  # multiple_choice, true_false, text
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list | None] = mapped_column(JSON, nullable=True)  # Çoktan seçmeli seçenekler: ["A", "B", "C", "D"]
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)  # Doğru cevap (seçenek endeksi veya metin)
    
    points: Mapped[int] = mapped_column(Integer, default=10)            # Soru puanı
    order: Mapped[int] = mapped_column(Integer, default=0)              # Sıralama
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True) # Doğru cevap açıklaması

    # Relationships
    exam = relationship("Exam", back_populates="questions")


class ExamAttempt(Base):
    """Öğrencilerin sınav denemeleri ve sonuçları"""
    __tablename__ = "exam_attempts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    exam_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress, completed, review
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)       # Sınav notu (0-100)
    is_passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    time_taken_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationships
    exam = relationship("Exam", back_populates="attempts")
    user = relationship("User", foreign_keys=[user_id])
    answers = relationship("ExamAttemptAnswer", back_populates="attempt", cascade="all, delete-orphan")


class ExamAttemptAnswer(Base):
    """Öğrencinin denemedeki tekil soru cevapları"""
    __tablename__ = "exam_attempt_answers"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    attempt_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("exam_questions.id", ondelete="CASCADE"), nullable=False, index=True)

    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    points_earned: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    attempt = relationship("ExamAttempt", back_populates="answers")
    question = relationship("ExamQuestion", foreign_keys=[question_id])
