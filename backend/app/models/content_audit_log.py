"""
Content Audit Log Model (EP10-BE-18)

İçerik yönetimi operasyonları için audit logging.
"""

from datetime import datetime
from uuid import uuid4
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Index, Integer, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ContentAuditAction(str):
    """Audit log action types"""
    UPLOAD = "upload"
    DELETE = "delete"
    UPDATE = "update"
    CONVERT = "convert"
    QUOTA_UPDATE = "quota_update"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    QUOTA_EXCEEDED = "quota_exceeded"
    MIME_MISMATCH = "mime_mismatch"


class ContentResourceType(str):
    """Resource types for audit logs"""
    LESSON = "lesson"
    COURSE = "course"
    DOCUMENT = "document"
    VIDEO = "video"
    THUMBNAIL = "thumbnail"
    AVATAR = "avatar"


class ContentAuditLog(Base):
    """
    İçerik yönetimi audit log kayıtları
    
    - Tüm upload/delete/update operasyonları loglanır
    - Güvenlik olayları (quota aşımı, unauthorized access) loglanır
    - Admin quota değişiklikleri loglanır
    """
    __tablename__ = "content_audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True, index=True)
    
    # Action ve resource bilgileri
    action: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # upload, delete, update, etc.
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # lesson, course, document, etc.
    resource_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    
    # Metadata (JSON) - ek bilgiler
    # Note: 'metadata' is reserved in SQLAlchemy, using 'metadata_json' as column name
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSON, nullable=True)
    
    # Request bilgileri
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)  # IPv4 veya IPv6
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    
    # Indexes for common queries
    __table_args__ = (
        Index("idx_audit_user_action", "user_id", "action"),
        Index("idx_audit_resource", "resource_type", "resource_id"),
        Index("idx_audit_created", "created_at"),
    )
