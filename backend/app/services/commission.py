"""
Komisyon hesaplama servisi
Platform her satıştan site settings'ten komisyon oranı alır
"""
from decimal import Decimal

from app.core.config import settings
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.site_settings import SiteSettings


async def get_platform_commission_rate(db: AsyncSession) -> Decimal:
    """
    Site settings'ten platform komisyon oranını alır
    """
    result = await db.execute(select(SiteSettings).order_by(SiteSettings.created_at.asc()).limit(1))
    row = result.scalar_one_or_none()
    if row and row.platform:
        rate = row.platform.get("platform_commission_rate")
        if rate is not None:
            return Decimal(str(rate))
    # Fallback to config
    return Decimal(str(settings.PLATFORM_COMMISSION_RATE))


async def get_platform_currency(db: AsyncSession) -> str:
    """
    Site settings'ten platform para birimini alır
    """
    result = await db.execute(select(SiteSettings).order_by(SiteSettings.created_at.asc()).limit(1))
    row = result.scalar_one_or_none()
    if row and row.platform:
        currency = row.platform.get("currency")
        if currency:
            return str(currency)
    return "TRY"


def calculate_commission(course_price: Decimal, commission_rate: Decimal | None = None) -> tuple[Decimal, Decimal]:
    """
    Komisyon hesaplar ve eğitmen kazancını döndürür
    
    Args:
        course_price: Kurs fiyatı
        commission_rate: Komisyon oranı (None ise settings'den alınır, default %35)
    
    Returns:
        (platform_commission, teacher_earnings) tuple
    """
    if commission_rate is None:
        commission_rate = Decimal(str(settings.PLATFORM_COMMISSION_RATE))
    
    platform_commission = course_price * commission_rate
    teacher_earnings = course_price - platform_commission
    
    return platform_commission, teacher_earnings
