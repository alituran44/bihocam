import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, String, Integer, ForeignKey, Boolean, Text, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class QuizQuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"  # Çoktan seçmeli
    TRUE_FALSE = "true_false"  # Doğru/Yanlış
    SHORT_ANSWER = "short_answer"  # Kısa cevap


class QuizAttemptStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    lesson_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("lessons.id"), nullable=False, unique=True)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Settings
    passing_score: Mapped[int] = mapped_column(Integer, default=70)  # Geçme notu (0-100)
    time_limit_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Zaman limiti (dakika)
    max_attempts: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Maksimum deneme sayısı
    shuffle_questions: Mapped[bool] = mapped_column(Boolean, default=False)
    show_correct_answers: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    lesson = relationship("Lesson", back_populates="quiz")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan", order_by="QuizQuestion.order")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    quiz_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("quizzes.id"), nullable=False, index=True)
    
    question_type: Mapped[QuizQuestionType] = mapped_column(String(50), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Options for multiple choice (JSON format: {"A": "Option 1", "B": "Option 2", ...})
    options: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Correct answer(s) - JSON format for multiple correct answers
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)  # "A" or "true" or "answer text"
    
    # Points
    points: Mapped[int] = mapped_column(Integer, default=1)
    
    # Order
    order: Mapped[int] = mapped_column(Integer, default=0)
    
    # Explanation shown after answer
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
    attempt_answers = relationship("QuizAttemptAnswer", back_populates="question", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    quiz_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("quizzes.id"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    
    status: Mapped[QuizAttemptStatus] = mapped_column(String(50), default=QuizAttemptStatus.IN_PROGRESS)
    
    # Scoring
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    correct_answers: Mapped[int] = mapped_column(Integer, default=0)
    score_percentage: Mapped[int] = mapped_column(Integer, default=0)  # 0-100
    points_earned: Mapped[int] = mapped_column(Integer, default=0)
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    
    # Time tracking
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    time_taken_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    quiz = relationship("Quiz", back_populates="attempts")
    user = relationship("User", back_populates="quiz_attempts")
    answers = relationship("QuizAttemptAnswer", back_populates="attempt", cascade="all, delete-orphan")


class QuizAttemptAnswer(Base):
    __tablename__ = "quiz_attempt_answers"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    attempt_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("quiz_attempts.id"), nullable=False, index=True)
    question_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("quiz_questions.id"), nullable=False)
    
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    points_earned: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    answered_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    attempt = relationship("QuizAttempt", back_populates="answers")
    question = relationship("QuizQuestion", back_populates="attempt_answers")
