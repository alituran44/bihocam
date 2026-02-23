import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, String, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.course import CourseStatus


class ModerationActionType(str, enum.Enum):
    """Moderasyon işlem tipleri"""
    SUBMIT_FOR_REVIEW = "submit_for_review"  # Öğretmen onaya gönderdi
    APPROVE = "approve"  # Admin onayladı
    REJECT = "reject"  # Admin reddetti
    EDIT = "edit"  # Admin düzenledi
    RESUBMIT = "resubmit"  # Öğretmen tekrar gönderdi
    ARCHIVE = "archive"  # Arşivlendi
    UNARCHIVE = "unarchive"  # Arşivden çıkarıldı


class CourseReviewHistory(Base):
    """Kurs moderasyon geçmişi / log tablosu"""
    __tablename__ = "course_review_history"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )
    
    # İlişkiler
    course_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    actor_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )  # İşlemi yapan kullanıcı (admin veya öğretmen)
    
    # Durum değişiklikleri
    # PostgreSQL enum'u case-sensitive sorunları nedeniyle string olarak saklıyoruz
    # Migration ile enum'dan VARCHAR'a çevrildi
    old_status: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )
    new_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="draft"
    )
    
    # İşlem bilgileri
    # PostgreSQL enum'u case-sensitive sorunları nedeniyle string olarak saklıyoruz
    action_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)  # Admin notu veya açıklaması
    
    # Değişiklik detayları (opsiyonel - JSON formatında alan bazlı diff)
    changes_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Güvenlik / Audit
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)  # IPv6 desteği için
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_system_generated: Mapped[bool] = mapped_column(default=False)  # Otomatik işlemler için
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), index=True
    )
    
    # Relationships
    course = relationship("Course", back_populates="review_history")
    actor = relationship("User", foreign_keys=[actor_id])
