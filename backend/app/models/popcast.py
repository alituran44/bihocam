import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, String, Boolean, ForeignKey, func, Index, Text, Enum, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class PopcastStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class Popcast(Base):
    """Popcast modeli - Öğretmenlerin ses kayıtları"""
    __tablename__ = "popcasts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    audio_url: Mapped[str] = mapped_column(String(500), nullable=False)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    duration: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)  # saniye cinsinden
    status: Mapped[PopcastStatus] = mapped_column(
        Enum(PopcastStatus, values_callable=lambda e: [x.value for x in e]),
        default=PopcastStatus.PENDING_REVIEW,
        nullable=False,
        index=True
    )
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    teacher_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    teacher = relationship("User", back_populates="popcasts")
    favorites = relationship("UserPopcastFavorite", back_populates="popcast", cascade="all, delete-orphan")

class UserPopcastFavorite(Base):
    """Kullanıcı Popcast Favori modeli (many-to-many favori eşleşmesi)"""
    __tablename__ = "popcast_favorites"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    popcast_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("popcasts.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="favorite_popcasts")
    popcast = relationship("Popcast", back_populates="favorites")

    __table_args__ = (
        Index("ix_popcast_favorites_user_popcast", "user_id", "popcast_id", unique=True),
    )
