import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, String, Float, Boolean, Text, Integer, JSON, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class GibServiceType(str, enum.Enum):
    LIVE_CLASS = "LIVE_CLASS"
    COURSE = "COURSE"
    EDUCATION_PROGRAM = "EDUCATION_PROGRAM"
    LIVE_RESERVATION = "LIVE_RESERVATION"


class GibActionType(str, enum.Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    PUBLISH = "PUBLISH"
    PURCHASE = "PURCHASE"
    CANCEL = "CANCEL"


class GibAuditLog(Base):
    """
    VUK 538 ve 595 sayili tebligler (213 sayili VUK Mukerrer Madde 257) uyarinca
    internet ortaminda yayinlanan canli ders, kurs ve egitim ilanlari ile satislarin
    GIB BTRANS sistemine bildirilmesi amaciyla tutulan degistirilemez (tamper-proof) denetim kayitlari.
    """
    __tablename__ = "gib_audit_logs"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    
    # Hizmet / Ilan Bilgileri
    service_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # LIVE_CLASS, COURSE, EDUCATION_PROGRAM
    action: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # CREATE, UPDATE, PUBLISH, PURCHASE, CANCEL
    item_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # Kurs ID veya Canli Ders ID
    item_reference_no: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # Ornek: KRS-2026-001, RES-7E53098D
    item_title: Mapped[str] = mapped_column(String(500), nullable=False)
    item_category: Mapped[str | None] = mapped_column(String(200), nullable=True)
    item_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Mali & Fiyat Bilgileri
    gross_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # Brut Tutar
    commission_rate: Mapped[float] = mapped_column(Float, default=0.20, nullable=False)  # Platform Komisyon Orani (%20 veya %35)
    commission_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # Platform Komisyonu TL
    teacher_net_earnings: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # Egitmen Net Hakedisi TL
    currency: Mapped[str] = mapped_column(String(10), default="TRY", nullable=False)

    # Hizmeti Veren Egitmen (Mukellef) Bilgileri
    teacher_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    teacher_name: Mapped[str] = mapped_column(String(255), nullable=False)
    teacher_tc_vkn: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    teacher_company_type: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Bireysel (Sahis) veya Kurumsal (Ltd/AS)
    teacher_company_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    teacher_tax_office: Mapped[str | None] = mapped_column(String(150), nullable=True)
    teacher_city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    teacher_district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    teacher_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    teacher_iban: Mapped[str | None] = mapped_column(String(50), nullable=True)
    teacher_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    teacher_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Hizmeti Alan Ogrenci / Alici (Satis durumunda)
    buyer_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    buyer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    buyer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payment_gateway_ref: Mapped[str | None] = mapped_column(String(100), nullable=True)  # PayTR referans no

    # 5651 & VUK Mukerrer 257 Teknik Iz Kayitlari (IP, Port, Zaman Damgasi)
    client_ip: Mapped[str] = mapped_column(String(50), default="127.0.0.1", nullable=False)
    client_port: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # GIB BTRANS Uyum Denetimi
    is_compliant: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    missing_fields: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)  # Eksik alanlar listesi

    # Zaman Damgasi (ISO 8601 saniyesine kadar kayit)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False, index=True)

    # Iliskiler
    teacher = relationship("User", foreign_keys=[teacher_id])
