import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    String,
    Text,
    Integer,
    ForeignKey,
    Boolean,
    DateTime,
    func,
    Index,
    Table,
    Column,
    JSON,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Many-to-Many association tables
blog_post_categories = Table(
    "blog_post_categories",
    Base.metadata,
    Column("post_id", UUID(as_uuid=False), ForeignKey("blog_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", UUID(as_uuid=False), ForeignKey("blog_categories.id", ondelete="CASCADE"), primary_key=True),
    Index("idx_blog_post_category", "post_id", "category_id"),
)

blog_post_tags = Table(
    "blog_post_tags",
    Base.metadata,
    Column("post_id", UUID(as_uuid=False), ForeignKey("blog_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=False), ForeignKey("blog_tags.id", ondelete="CASCADE"), primary_key=True),
    Index("idx_blog_post_tag", "post_id", "tag_id"),
)


class BlogPostStatus(str, enum.Enum):
    """Blog post yayın durumu"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"  # Admin onayı bekliyor
    PUBLISHED = "published"
    ARCHIVED = "archived"


class BlogPost(Base):
    """Blog yazıları modeli"""
    __tablename__ = "blog_posts"
    __table_args__ = (
        Index("idx_blog_post_slug", "slug"),
        Index("idx_blog_post_author", "author_id"),
        Index("idx_blog_post_status", "status"),
        Index("idx_blog_post_published_at", "published_at"),
        Index("idx_blog_post_created_at_desc", "created_at", postgresql_ops={"created_at": "DESC"}),
        CheckConstraint("view_count >= 0", name="check_view_count_positive"),
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    
    # Content
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)  # Rich text HTML
    featured_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Author
    author_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    
    # Status & Publishing
    status: Mapped[BlogPostStatus] = mapped_column(String(20), default=BlogPostStatus.DRAFT, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Features
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    allow_comments: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # SEO Fields
    seo_meta_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_meta_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    seo_meta_keywords: Mapped[str | None] = mapped_column(String(500), nullable=True)
    seo_og_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_og_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    seo_og_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    seo_twitter_card: Mapped[str | None] = mapped_column(String(50), nullable=True)
    seo_canonical_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    seo_schema_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    author = relationship("User", foreign_keys=[author_id], back_populates="blog_posts")
    categories = relationship("BlogCategory", secondary=blog_post_categories, back_populates="posts")
    tags = relationship("BlogTag", secondary=blog_post_tags, back_populates="posts")
