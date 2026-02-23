import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, Text, Integer, ForeignKey, Boolean, DateTime, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.blog_post import blog_post_categories


class BlogCategory(Base):
    """Blog kategorileri modeli"""
    __tablename__ = "blog_categories"
    __table_args__ = (
        Index("idx_blog_category_slug", "slug"),
        Index("idx_blog_category_parent", "parent_id"),
        Index("idx_blog_category_order", "order"),
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    
    # Basic Info
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)  # Hex color code
    
    # Hierarchy
    parent_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("blog_categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # SEO
    seo_meta_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_meta_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    parent = relationship("BlogCategory", remote_side=[id], back_populates="children")
    children = relationship("BlogCategory", back_populates="parent")
    posts = relationship("BlogPost", secondary=blog_post_categories, back_populates="categories")
