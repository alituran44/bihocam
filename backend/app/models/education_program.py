from datetime import datetime
from uuid import uuid4
from sqlalchemy import String, Integer, Float, Boolean, Text, DateTime, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EducationProgram(Base):
    """Eğitim Programları ve Zengin İçerikleri (Müfredat, SSS, Kazanımlar, Yorumlar)"""
    __tablename__ = "education_programs"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    gradient: Mapped[str] = mapped_column(String(255), nullable=False, default="from-gray-900 to-gray-700")
    
    price: Mapped[int] = mapped_column(Integer, nullable=False)  # kuruş cinsinden (örn: 6499500)
    original_price: Mapped[int] = mapped_column(Integer, nullable=True)  # kuruş cinsinden (örn: 8999500)
    
    rating: Mapped[float] = mapped_column(Float, default=4.9, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    students: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    hours: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lessons: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    badge: Mapped[str] = mapped_column(String(100), nullable=True)
    
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Yeni eklenen premium alanlar
    subtitle: Mapped[str] = mapped_column(String(255), nullable=True)
    short_description: Mapped[str] = mapped_column(Text, nullable=True)
    curriculum_intro: Mapped[str] = mapped_column(Text, nullable=True)
    kontenjan: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    start_date: Mapped[str] = mapped_column(String(100), nullable=True)
    
    # Zengin İçerik JSON Alanları
    what_you_learn: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    curriculum: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    faqs: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    reviews: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

