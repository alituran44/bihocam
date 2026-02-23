import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, Text, Integer, ForeignKey, Boolean, func, Index, Table, Column, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Many-to-Many association table for Course-Category relationship
course_categories = Table(
    "course_categories",
    Base.metadata,
    Column("course_id", UUID(as_uuid=False), ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", UUID(as_uuid=False), ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
    Index("idx_course_category", "course_id", "category_id"),
)


class Category(Base):
    """Kategori modeli - Kursları kategorilere ayırmak için"""
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)  # Emoji veya icon class
    color: Mapped[str | None] = mapped_column(String(7), nullable=True, default="#0d9488")  # Hex color, default teal
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    
    # Hiyerarşik yapı (alt kategoriler)
    parent_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), 
        ForeignKey("categories.id", ondelete="SET NULL"), 
        nullable=True,
        index=True
    )
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # Sıralama
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    parent: Mapped["Category | None"] = relationship(
        "Category",
        remote_side=[id],
        back_populates="children",
        foreign_keys=[parent_id]
    )
    children: Mapped[list["Category"]] = relationship(
        "Category",
        back_populates="parent",
        foreign_keys=[parent_id],
        cascade="all, delete-orphan"
    )
    courses: Mapped[list["Course"]] = relationship(
        "Course",
        secondary="course_categories",
        back_populates="categories"
    )
