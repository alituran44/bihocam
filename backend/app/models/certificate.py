"""Certificate and CertificateTemplate models for course completion certificates."""
import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TemplateType(str, enum.Enum):
    """Certificate template types."""
    DEFAULT = "default"
    PREMIUM = "premium"
    MODERN = "modern"
    ELEGANT = "elegant"


class CertificateTemplate(Base):
    """Certificate template model for customizable certificate designs."""
    __tablename__ = "certificate_templates"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Template design
    template_type: Mapped[TemplateType] = mapped_column(
        Enum(TemplateType), default=TemplateType.DEFAULT, nullable=False
    )
    background_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    logo_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    signature_image: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Template configuration (JSON)
    # Example: {
    #   "font_family": "Arial",
    #   "font_size_title": 32,
    #   "font_size_body": 18,
    #   "primary_color": "#0d9488",
    #   "secondary_color": "#14b8a6",
    #   "text_align": "center",
    #   "show_qr_code": true,
    #   "show_logo": true,
    #   "show_signature": true
    # }
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Ownership
    created_by_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False
    )
    is_system_template: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Usage scope
    course_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("courses.id"), nullable=True
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])
    course = relationship("Course", foreign_keys=[course_id])
    certificates = relationship("Certificate", back_populates="template")

    __table_args__ = (
        Index("idx_cert_template_created_by", "created_by_id"),
        Index("idx_cert_template_course", "course_id"),
        Index("idx_cert_template_active", "is_active"),
    )


class Certificate(Base):
    """Certificate model for course completion certificates."""
    __tablename__ = "certificates"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4())
    )  # Also serves as verification code
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False
    )
    course_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("courses.id"), nullable=False
    )
    enrollment_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("enrollments.id"), nullable=False, unique=True
    )

    # Certificate details
    certificate_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Course completion info
    completion_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    total_lessons: Mapped[int] = mapped_column(Integer, nullable=False)
    completed_lessons: Mapped[int] = mapped_column(Integer, nullable=False)
    completion_percentage: Mapped[int] = mapped_column(Integer, nullable=False)

    # Certificate template reference
    template_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("certificate_templates.id"), nullable=True
    )

    # PDF generation
    pdf_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    pdf_generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # QR code for verification
    qr_code_data: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Revocation (cancellation)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_by_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=True
    )
    revocation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="certificates")
    course = relationship("Course")
    enrollment = relationship("Enrollment", back_populates="certificate", uselist=False)
    template = relationship("CertificateTemplate", back_populates="certificates")
    revoked_by = relationship("User", foreign_keys=[revoked_by_id])

    # Indexes
    __table_args__ = (
        Index("idx_certificate_user", "user_id"),
        Index("idx_certificate_course", "course_id"),
        Index("idx_certificate_number", "certificate_number"),
        Index("idx_certificate_issued", "issued_at"),
        Index("idx_certificate_enrollment", "enrollment_id"),
    )
