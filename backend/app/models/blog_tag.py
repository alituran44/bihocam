from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, Text, Integer, DateTime, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.blog_post import blog_post_tags


class BlogTag(Base):
    """Blog etiketleri modeli"""
    __tablename__ = "blog_tags"
    __table_args__ = (
        Index("idx_blog_tag_name", "name"),
        Index("idx_blog_tag_slug", "slug"),
        Index("idx_blog_tag_usage_count_desc", "usage_count", postgresql_ops={"usage_count": "DESC"}),
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    
    # Basic Info
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Usage Tracking
    usage_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    posts = relationship("BlogPost", secondary=blog_post_tags, back_populates="tags")
