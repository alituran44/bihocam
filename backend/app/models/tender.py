import enum
from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import DateTime, String, Float, Boolean, Text, Integer, ForeignKey, func, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TenderStatus(str, enum.Enum):
    OPEN = "OPEN"
    BIDDING = "BIDDING"
    ACCEPTED = "ACCEPTED"
    PAID = "PAID"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class TenderBidStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class TenderMode(str, enum.Enum):
    ONLINE = "ONLINE"
    FACE_TO_FACE = "FACE_TO_FACE"
    HYBRID = "HYBRID"


class Tender(Base):
    """
    Öğrencilerin özel ders / eğitim talebi (İhale) modeli.
    VUK 538/595 ve 5651 gereğince ilan IP, Port ve zaman damgası kütüğüyle saklanır.
    """
    __tablename__ = "tenders"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    student_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Talep Temel Bilgileri
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    subject: Mapped[str] = mapped_column(String(150), nullable=False, index=True)  # Örn: LGS Matematik
    category_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    mode: Mapped[str] = mapped_column(String(30), default=TenderMode.ONLINE.value, nullable=False)
    
    # Lokasyon ve Zaman Tercihi
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_date_info: Mapped[str | None] = mapped_column(String(150), nullable=True)  # "Hemen Başlasın", "Hafta Sonu"
    
    # Bütçe
    min_budget: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_budget: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="TRY", nullable=False)
    
    # Durum & Süreç
    status: Mapped[str] = mapped_column(String(30), default=TenderStatus.OPEN.value, nullable=False, index=True)
    accepted_bid_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bids_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Optimistic Locking: Eşzamanlı çift kabulü önlemek için versiyon sayacı
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    # 5651 Teknik İz (İlan Açan İstemci)
    client_ip: Mapped[str] = mapped_column(String(50), default="127.0.0.1", nullable=False)
    client_port: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Zaman ve Süre Aşımı
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        default=lambda: datetime.utcnow() + timedelta(days=7),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # İlişkiler
    student = relationship("User", foreign_keys=[student_id])
    bids = relationship("TenderBid", back_populates="tender", cascade="all, delete-orphan", order_by="TenderBid.created_at.desc()")


class TenderBid(Base):
    """
    Eğitmenlerin açılan ihalelere verdiği teklif modeli.
    Anti-Disintermediation (telefon sansürü) ve 5651 teknik izleriyle saklanır.
    """
    __tablename__ = "tender_bids"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tender_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    teacher_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Teklif Tutar ve Açıklama
    offered_price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="TRY", nullable=False)
    proposal_letter: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Durum
    status: Mapped[str] = mapped_column(String(30), default=TenderBidStatus.PENDING.value, nullable=False, index=True)
    
    # 5651 Teknik İz (Teklif Veren Eğitmen)
    client_ip: Mapped[str] = mapped_column(String(50), default="127.0.0.1", nullable=False)
    client_port: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # İlişkiler
    tender = relationship("Tender", back_populates="bids")
    teacher = relationship("User", foreign_keys=[teacher_id])

    __table_args__ = (
        UniqueConstraint("tender_id", "teacher_id", name="uq_tender_teacher_bid"),
    )
