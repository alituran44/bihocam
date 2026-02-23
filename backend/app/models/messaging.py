import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    BigInteger,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ConversationType(str, enum.Enum):
    STUDENT_TEACHER = "student_teacher"
    ADMIN_TEACHER = "admin_teacher"
    ADMIN_STUDENT = "admin_student"


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )

    # Participants (generic - supports student<->teacher, admin<->teacher, admin<->student)
    participant1_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True
    )
    participant2_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True
    )
    participant1_role: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # student, teacher, admin
    participant2_role: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # student, teacher, admin

    # Related course (optional - mesajlaşma specific course için olabilir)
    # Sadece student<->teacher konuşmalarında dolu
    course_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("courses.id"), nullable=True, index=True
    )

    # Conversation metadata
    subject: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # Konu başlığı (optional)
    conversation_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # student_teacher, admin_teacher, admin_student

    # Last message tracking (for sorting)
    last_message_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_message_preview: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # İlk 100 karakter

    # Read status per participant
    last_read_at_participant1: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_read_at_participant2: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    unread_count_participant1: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    unread_count_participant2: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    # Conversation status per participant
    is_archived_participant1: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    is_archived_participant2: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    is_closed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )  # Kapatılan konuşma (yeni mesaj gönderilemez)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    participant1 = relationship("User", foreign_keys=[participant1_id])
    participant2 = relationship("User", foreign_keys=[participant2_id])
    course = relationship("Course")
    messages = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan"
    )

    # Indexes and constraints
    __table_args__ = (
        Index("idx_conversation_participant1", "participant1_id"),
        Index("idx_conversation_participant2", "participant2_id"),
        Index("idx_conversation_type", "conversation_type"),
        Index("idx_conversation_last_message", "last_message_at"),
        # Unique constraint: aynı iki kişi arasında aynı course için sadece bir konuşma
        # NULL course_id için de unique olmalı (admin konuşmaları için)
        UniqueConstraint(
            "participant1_id", "participant2_id", "course_id", name="uq_conversation_participants"
        ),
        # Check constraint: participant1 ve participant2 farklı olmalı
        CheckConstraint("participant1_id != participant2_id", name="ck_different_participants"),
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )
    conversation_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("conversations.id"), nullable=False, index=True
    )

    # Sender
    sender_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True
    )
    sender_role: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # student, teacher, admin

    # Message content
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Attachments (optional - basit dosya paylaşımı için)
    attachment_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    attachment_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    attachment_size: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    # Read status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Soft delete
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Content moderation flags
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    flag_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    moderated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    moderated_by_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=True
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    moderator = relationship("User", foreign_keys=[moderated_by_id])

    # Indexes
    __table_args__ = (
        Index("idx_message_conversation", "conversation_id"),
        Index("idx_message_sender", "sender_id"),
        Index("idx_message_created", "created_at"),
        Index("idx_message_flagged", "is_flagged"),
    )


class UserBlock(Base):
    __tablename__ = "user_blocks"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )
    blocker_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True
    )
    blocked_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True
    )
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Optional reason
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    blocker = relationship("User", foreign_keys=[blocker_id])
    blocked = relationship("User", foreign_keys=[blocked_id])

    # Unique constraint: aynı kişi iki kez engellenemez
    __table_args__ = (
        UniqueConstraint("blocker_id", "blocked_id", name="uq_user_block"),
        CheckConstraint("blocker_id != blocked_id", name="ck_block_different_users"),
        Index("idx_user_block_blocker", "blocker_id"),
        Index("idx_user_block_blocked", "blocked_id"),
    )


class MessageReport(Base):
    __tablename__ = "message_reports"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )
    message_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("messages.id"), nullable=False, index=True
    )
    reporter_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True
    )
    reason: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # spam, harassment, inappropriate, other
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    message = relationship("Message")
    reporter = relationship("User", foreign_keys=[reporter_id])

    __table_args__ = (
        UniqueConstraint("message_id", "reporter_id", name="uq_message_report"),
        Index("idx_message_report_message", "message_id"),
        Index("idx_message_report_reporter", "reporter_id"),
    )
