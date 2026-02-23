from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SiteSettings(Base):
    """
    Global site ayarları.

    Şimdilik sadece SMTP/email kısmını aktif kullanacağız (NOTIF-V2).
    Diğer alanlar (SEO, custom_code) EP9 kapsamında genişletilecek.
    """

    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Genel ayarlar (ileride doldurulacak)
    general: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # SMTP / Email ayarları (NOTIF-V2 için kritik)
    # Örnek yapı:
    # {
    #   "host": "...",
    #   "port": 587,
    #   "username": "...",
    #   "password_encrypted": "...",
    #   "use_tls": true
    # }
    smtp: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Platform & Finansal ayarlar
    # {
    #   "platform_commission_rate": 0.35,  # %35 komisyon
    #   "currency": "TRY",
    #   "tax_rate": 0.20,  # %20 KDV (opsiyonel)
    #   "maintenance_mode": false
    # }
    platform: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Diğer ayarlar (SEO, custom_code)
    seo: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    custom_code: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

