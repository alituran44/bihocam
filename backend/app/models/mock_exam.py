from datetime import datetime
from uuid import uuid4
from sqlalchemy import DateTime, ForeignKey, String, Integer, Text, Boolean, JSON, Float, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MockExam(Base):
    """Deneme sınavları (LGS, YKS vb. PDF tabanlı optik formlu sınavlar)"""
    __tablename__ = "mock_exams"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    exam_type: Mapped[str] = mapped_column(String(50), nullable=False)  # LGS, YKS
    pdf_path: Mapped[str] = mapped_column(String(512), nullable=False)  # Sınav PDF yolu
    duration_minutes: Mapped[int] = mapped_column(Integer, default=120)  # Sınav süresi
    number_of_options: Mapped[int] = mapped_column(Integer, default=4)  # LGS: 4, YKS: 5
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # New scheduling & assignment fields
    start_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    course_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("courses.id", ondelete="CASCADE"), nullable=True, index=True)
    student_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])
    course = relationship("Course", foreign_keys=[course_id])
    student = relationship("User", foreign_keys=[student_id])
    questions = relationship("MockExamQuestion", back_populates="mock_exam", cascade="all, delete-orphan")
    attempts = relationship("MockExamAttempt", back_populates="mock_exam", cascade="all, delete-orphan")


class MockExamQuestion(Base):
    """Deneme sınavı cevap anahtarı (Soru bazlı ders adı ve doğru cevap)"""
    __tablename__ = "mock_exam_questions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    mock_exam_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("mock_exams.id", ondelete="CASCADE"), nullable=False, index=True)
    
    question_number: Mapped[int] = mapped_column(Integer, nullable=False)
    subject_name: Mapped[str] = mapped_column(String(100), nullable=False)  # Türkçe, Matematik vb.
    correct_answer: Mapped[str | None] = mapped_column(String(10), nullable=True)  # A, B, C, D, E (isteğe bağlı)
    points: Mapped[float] = mapped_column(Float, default=1.0)  # Soru puanı

    # Relationships
    mock_exam = relationship("MockExam", back_populates="questions")


class MockExamAttempt(Base):
    """Öğrencilerin deneme sınavı çözme denemeleri ve sonuçları"""
    __tablename__ = "mock_exam_attempts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    mock_exam_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("mock_exams.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress, completed
    total_correct: Mapped[int] = mapped_column(Integer, default=0)
    total_wrong: Mapped[int] = mapped_column(Integer, default=0)
    total_empty: Mapped[int] = mapped_column(Integer, default=0)
    total_net: Mapped[float] = mapped_column(Float, default=0.0)
    score: Mapped[float] = mapped_column(Float, default=0.0)  # Toplam net / yüzde skor

    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    mock_exam = relationship("MockExam", back_populates="attempts")
    student = relationship("User", foreign_keys=[student_id])
    answers = relationship("MockExamStudentAnswer", back_populates="attempt", cascade="all, delete-orphan")


class MockExamStudentAnswer(Base):
    """Öğrencinin deneme sınavındaki tekil soru işaretlemeleri (Optik form girdileri)"""
    __tablename__ = "mock_exam_student_answers"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    attempt_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("mock_exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_number: Mapped[int] = mapped_column(Integer, nullable=False)
    
    selected_answer: Mapped[str | None] = mapped_column(String(10), nullable=True)  # A, B, C, D, E or Null
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    # Relationships
    attempt = relationship("MockExamAttempt", back_populates="answers")
