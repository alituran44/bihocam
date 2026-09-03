"""
Komisyon hesaplama servisi
Platform her satıştan site settings'ten komisyon oranı alır.
P2-03: Redis cache ile SiteSettings sorguları optimize edildi.
"""
from decimal import Decimal

from app.core.config import settings
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.site_settings import SiteSettings


async def _get_site_settings_platform(db: AsyncSession) -> dict | None:
    """Site settings platform dict'ini cache'li olarak döndürür."""
    from app.core.cache import cache_get, cache_set, CACHE_SITE_SETTINGS

    # Cache'den dene
    cached = await cache_get(CACHE_SITE_SETTINGS)
    if cached is not None:
        return cached

    # DB'den çek
    result = await db.execute(select(SiteSettings).order_by(SiteSettings.created_at.asc()).limit(1))
    row = result.scalar_one_or_none()
    platform_data = row.platform if row and row.platform else {}

    # Cache'e yaz (5 dk TTL)
    await cache_set(CACHE_SITE_SETTINGS, platform_data, ttl_seconds=300)
    return platform_data


async def get_platform_commission_rate(db: AsyncSession) -> Decimal:
    """Site settings'ten platform komisyon oranını alır (cache'li)."""
    platform_data = await _get_site_settings_platform(db)
    if platform_data:
        rate = platform_data.get("platform_commission_rate")
        if rate is not None:
            r = Decimal(str(rate))
            if r > 1:
                r = r / Decimal("100")
            return r
    r = Decimal(str(settings.PLATFORM_COMMISSION_RATE))
    if r > 1:
        r = r / Decimal("100")
    return r


async def get_platform_currency(db: AsyncSession) -> str:
    """Site settings'ten platform para birimini alır (cache'li)."""
    platform_data = await _get_site_settings_platform(db)
    if platform_data:
        currency = platform_data.get("currency")
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
    
    # Yüzde olarak verilmişse (örn: 35 veya %35), 0.35 oranına normalize et
    if commission_rate > 1:
        commission_rate = commission_rate / Decimal("100")
    
    platform_commission = (course_price * commission_rate).quantize(Decimal("0.01"))
    teacher_earnings = (course_price - platform_commission).quantize(Decimal("0.01"))
    
    return platform_commission, teacher_earnings

