import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, String, Boolean, ForeignKey, func, Index, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class MediaType(str, enum.Enum):
    VIDEO = "video"
    IMAGE = "image"
    TEXT = "text"

class SocialPost(Base):
    __tablename__ = "social_posts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    media_type: Mapped[MediaType] = mapped_column(Enum(MediaType, values_callable=lambda e: [x.value for x in e]), default=MediaType.TEXT, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="social_posts")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    saves = relationship("SavedPost", back_populates="post", cascade="all, delete-orphan")

class PostLike(Base):
    __tablename__ = "post_likes"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("social_posts.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User")
    post = relationship("SocialPost", back_populates="likes")
    
    __table_args__ = (
        Index("ix_post_likes_user_post", "user_id", "post_id", unique=True),
    )

class SavedPost(Base):
    __tablename__ = "saved_posts"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("social_posts.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="saved_posts")
    post = relationship("SocialPost", back_populates="saves")
    
    __table_args__ = (
        Index("ix_saved_posts_user_post", "user_id", "post_id", unique=True),
    )

class UserFollow(Base):
    __tablename__ = "user_follows"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    follower_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    following_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    following = relationship("User", foreign_keys=[following_id], back_populates="followers")

    __table_args__ = (
        Index("ix_user_follows_follower_following", "follower_id", "following_id", unique=True),
    )
