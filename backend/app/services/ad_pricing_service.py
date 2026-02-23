from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ad_pricing import AdPricing
from app.models.ad_placement import AdPlacement
from app.models.ad_campaign import PricingModel
from app.schemas.ad_pricing import AdPricingCreate, AdPricingUpdate
from app.services.ad_campaign_service import calculate_campaign_cost


def _normalize_datetime(dt: datetime | None) -> datetime | None:
    """Convert timezone-aware datetime to UTC and make it timezone-naive."""
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


async def create_ad_pricing(
    db: AsyncSession,
    pricing_data: AdPricingCreate,
    admin_id: str,
) -> AdPricing:
    """
    Yeni fiyatlandırma oluştur.
    
    Args:
        db: Database session
        pricing_data: Pricing verisi
        admin_id: Admin ID
    
    Returns:
        Oluşturulan AdPricing objesi
    
    Raises:
        ValueError: Validation hatası
    """
    # Check placement exists
    placement_result = await db.execute(
        select(AdPlacement).where(AdPlacement.id == pricing_data.placement_id)
    )
    placement = placement_result.scalar_one_or_none()
    if not placement:
        raise ValueError("Placement not found")

    # Normalize dates
    effective_from = _normalize_datetime(pricing_data.effective_from)
    effective_until = _normalize_datetime(pricing_data.effective_until)

    # Validate pricing model
    if pricing_data.pricing_model == PricingModel.FIXED_DAILY:
        if pricing_data.price_per_day is None:
            raise ValueError("price_per_day is required for FIXED_DAILY pricing model")
    elif pricing_data.pricing_model == PricingModel.PER_IMPRESSION:
        if pricing_data.price_per_impression is None:
            raise ValueError("price_per_impression is required for PER_IMPRESSION pricing model")
    elif pricing_data.pricing_model == PricingModel.PER_CLICK:
        if pricing_data.price_per_click is None:
            raise ValueError("price_per_click is required for PER_CLICK pricing model")

    # Deactivate old pricing (if needed)
    # This is optional - you may want to keep multiple active pricing records
    # For now, we'll allow multiple active pricing records

    pricing = AdPricing(
        **pricing_data.model_dump(),
        effective_from=effective_from,
        effective_until=effective_until,
        created_by_id=admin_id,
    )
    db.add(pricing)
    await db.commit()
    await db.refresh(pricing)

    return pricing


async def update_ad_pricing(
    db: AsyncSession,
    pricing_id: str,
    pricing_data: AdPricingUpdate,
    admin_id: str,
) -> AdPricing:
    """
    Fiyatlandırmayı güncelle.
    
    Args:
        db: Database session
        pricing_id: Pricing ID
        pricing_data: Güncelleme verisi
        admin_id: Admin ID
    
    Returns:
        Güncellenmiş AdPricing objesi
    """
    result = await db.execute(
        select(AdPricing).where(AdPricing.id == pricing_id)
    )
    pricing = result.scalar_one_or_none()
    if not pricing:
        raise ValueError("Pricing not found")

    # Update fields
    update_dict = pricing_data.model_dump(exclude_unset=True)

    # Normalize dates
    if "effective_from" in update_dict:
        update_dict["effective_from"] = _normalize_datetime(update_dict["effective_from"])
    if "effective_until" in update_dict:
        update_dict["effective_until"] = _normalize_datetime(update_dict["effective_until"])

    update_dict["updated_by_id"] = admin_id

    for key, value in update_dict.items():
        setattr(pricing, key, value)

    await db.commit()
    await db.refresh(pricing)

    return pricing


async def get_active_pricing_for_placement(
    db: AsyncSession,
    placement_id: str,
    date: datetime | None = None,
) -> AdPricing | None:
    """
    Placement için aktif pricing'i getir.
    
    Args:
        db: Database session
        placement_id: Placement ID
        date: Tarih (None ise şu anki tarih)
    
    Returns:
        Aktif AdPricing objesi veya None
    """
    if date is None:
        date = datetime.utcnow()
    date = _normalize_datetime(date)

    result = await db.execute(
        select(AdPricing)
        .where(
            and_(
                AdPricing.placement_id == placement_id,
                AdPricing.is_active == True,
                AdPricing.effective_from <= date,
                or_(
                    AdPricing.effective_until.is_(None),
                    AdPricing.effective_until >= date,
                ),
            )
        )
        .order_by(AdPricing.effective_from.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def calculate_campaign_cost_for_pricing(
    start_date: datetime,
    end_date: datetime,
    placement_id: str,
    pricing_model: PricingModel,
    db: AsyncSession,
) -> tuple[Decimal, dict]:
    """
    Kampanya maliyetini hesapla (pricing'den).
    
    Args:
        start_date: Kampanya başlangıç tarihi
        end_date: Kampanya bitiş tarihi
        placement_id: Placement ID
        pricing_model: Fiyatlandırma modeli
        db: Database session
    
    Returns:
        (calculated_cost, breakdown_dict)
    """
    # Get active pricing
    pricing = await get_active_pricing_for_placement(db, placement_id, start_date)
    if not pricing:
        raise ValueError("No active pricing found for placement")

    # Calculate cost
    calculated_cost = await calculate_campaign_cost(
        start_date, end_date, pricing, pricing_model
    )

    # Build breakdown
    days = (end_date - start_date).days + 1
    breakdown = {
        "pricing_model": pricing_model.value,
        "days": days,
        "price_per_day": float(pricing.price_per_day) if pricing.price_per_day else None,
        "price_per_impression": float(pricing.price_per_impression) if pricing.price_per_impression else None,
        "price_per_click": float(pricing.price_per_click) if pricing.price_per_click else None,
        "discount_percentage": float(pricing.discount_percentage),
        "calculated_cost": float(calculated_cost),
    }

    return calculated_cost, breakdown


async def get_pricing_history(
    db: AsyncSession,
    placement_id: str,
) -> list[AdPricing]:
    """
    Fiyat geçmişi getir.
    
    Args:
        db: Database session
        placement_id: Placement ID
    
    Returns:
        Fiyat geçmişi listesi (tarih sıralı)
    """
    result = await db.execute(
        select(AdPricing)
        .where(AdPricing.placement_id == placement_id)
        .order_by(AdPricing.effective_from.desc())
    )
    return list(result.scalars().all())
