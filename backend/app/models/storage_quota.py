"""
Storage Quota Model (EP10-BE-14)

Kullanıcı bazlı depolama kotası yönetimi.
"""

from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class StorageQuota(Base):
    """
    Kullanıcı bazlı depolama kotası
    
    - Her kullanıcı için bir quota kaydı
    - Aylık reset döngüsü (opsiyonel)
    - Admin tarafından yönetilebilir
    """
    __tablename__ = "storage_quotas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Quota bilgileri
    quota_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)  # Toplam kota (bytes)
    used_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)  # Kullanılan alan (bytes)
    
    # Reset döngüsü (opsiyonel)
    reset_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)  # Sonraki reset tarihi
    reset_period_days: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Reset periyodu (gün)
    
    # Admin yönetimi
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"))  # Default'tan farklı mı?
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Admin notları
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="storage_quota")

    @property
    def available_bytes(self) -> int:
        """Kalan kullanılabilir alan (bytes)"""
        return max(0, self.quota_bytes - self.used_bytes)
    
    @property
    def usage_percentage(self) -> float:
        """Kullanım yüzdesi (0-100)"""
        if self.quota_bytes == 0:
            return 0.0
        return min(100.0, (self.used_bytes / self.quota_bytes) * 100)
    
    @property
    def is_exceeded(self) -> bool:
        """Kota aşıldı mı?"""
        return self.used_bytes > self.quota_bytes
    
    def can_upload(self, file_size_bytes: int) -> bool:
        """Bu dosya boyutu için upload yapılabilir mi?"""
        return (self.used_bytes + file_size_bytes) <= self.quota_bytes
