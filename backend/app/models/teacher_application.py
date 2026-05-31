import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, String, ForeignKey, func, Text, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TeacherApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class TeacherApplication(Base):
    """Eğitmen başvuru kayıtları (Harmanlanmış Form)"""
    __tablename__ = "teacher_applications"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    
    # 1. Kişisel Bilgiler
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    birth_date: Mapped[str] = mapped_column(String(20), nullable=False)  # Doğum Tarihi (YYYY-MM-DD)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)  # Cinsiyet: Kadın, Erkek
    
    # 2. Eğitim & Branş Bilgileri (Harmanlanmış çoklu seçimler)
    branches: Mapped[list[str]] = mapped_column(JSON, nullable=False)  # Branşlar: ["Matematik", "Fizik", ...]
    levels: Mapped[list[str]] = mapped_column(JSON, nullable=False)    # Kademeler: ["İlkokul", "Lise", ...]
    experience_years: Mapped[int] = mapped_column(Integer, nullable=False)  # Deneyim Yılı
    bio: Mapped[str] = mapped_column(Text, nullable=False)  # Kendinizi Tanıtınız (Biyografi)
    
    # 3. Diğer Bilgiler
    heard_from: Mapped[str] = mapped_column(String(100), nullable=False)  # Bizi Nereden Duydunuz
    
    # 4. Gerekli Evrak Yüklemeleri (Storage key / Path)
    cv_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Özgeçmiş (CV)
    graduation_cert_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Mezuniyet Belgesi
    criminal_record_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Adli Sicil Belgesi
    
    # Status ve Notlar
    status: Mapped[TeacherApplicationStatus] = mapped_column(
        Enum(TeacherApplicationStatus, values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        default=TeacherApplicationStatus.PENDING,
        nullable=False,
        index=True
    )
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
