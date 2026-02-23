"""Ad pricing admin endpoints."""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.ad_pricing import AdPricing
from app.models.ad_campaign import PricingModel
from app.schemas.ad_pricing import (
    AdPricingCreate,
    AdPricingUpdate,
    AdPricingResponse,
    AdPricingListResponse,
    CampaignCostCalculationResponse,
)
from app.services.ad_pricing_service import (
    create_ad_pricing,
    update_ad_pricing,
    get_pricing_history,
    calculate_campaign_cost_for_pricing,
)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Admin yetkisi kontrolü"""
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    return current_user


# ==================== Admin Endpoints ====================

@router.post(
    "/admin/ads/pricing",
    response_model=AdPricingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_pricing(
    pricing_data: AdPricingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yeni fiyatlandırma oluştur (Admin)."""
    try:
        pricing = await create_ad_pricing(db, pricing_data, current_user.id)
        return AdPricingResponse.model_validate(pricing)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/admin/ads/pricing",
    response_model=List[AdPricingListResponse],
)
async def list_pricing(
    placement_id: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    pricing_model: Optional[PricingModel] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Fiyatlandırmaları listele (Admin)."""
    conditions = []

    if placement_id:
        conditions.append(AdPricing.placement_id == placement_id)
    if is_active is not None:
        conditions.append(AdPricing.is_active == is_active)
    if pricing_model:
        conditions.append(AdPricing.pricing_model == pricing_model)

    result = await db.execute(
        select(AdPricing)
        .where(and_(*conditions) if conditions else True)
        .order_by(AdPricing.effective_from.desc())
        .offset(skip)
        .limit(limit)
    )
    pricing_list = result.scalars().all()

    return [AdPricingListResponse.model_validate(p) for p in pricing_list]


@router.get(
    "/admin/ads/pricing/{pricing_id}",
    response_model=AdPricingResponse,
)
async def get_pricing(
    pricing_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Fiyatlandırma detayı (Admin)."""
    result = await db.execute(
        select(AdPricing).where(AdPricing.id == pricing_id)
    )
    pricing = result.scalar_one_or_none()
    if not pricing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing not found"
        )

    return AdPricingResponse.model_validate(pricing)


@router.put(
    "/admin/ads/pricing/{pricing_id}",
    response_model=AdPricingResponse,
)
async def update_pricing(
    pricing_id: str,
    pricing_data: AdPricingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Fiyatlandırma güncelle (Admin)."""
    try:
        pricing = await update_ad_pricing(db, pricing_id, pricing_data, current_user.id)
        return AdPricingResponse.model_validate(pricing)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete(
    "/admin/ads/pricing/{pricing_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_pricing(
    pricing_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Fiyatlandırma sil (Admin)."""
    result = await db.execute(
        select(AdPricing).where(AdPricing.id == pricing_id)
    )
    pricing = result.scalar_one_or_none()
    if not pricing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing not found"
        )

    await db.delete(pricing)
    await db.commit()


@router.get(
    "/admin/ads/pricing/placement/{placement_id}",
    response_model=List[AdPricingListResponse],
)
async def get_placement_pricing_history(
    placement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yerleşim fiyatlandırma geçmişi (Admin)."""
    pricing_history = await get_pricing_history(db, placement_id)
    return [AdPricingListResponse.model_validate(p) for p in pricing_history]


@router.post(
    "/admin/ads/pricing/calculate",
    response_model=CampaignCostCalculationResponse,
)
async def calculate_campaign_cost_preview(
    placement_id: str,
    start_date: datetime,
    end_date: datetime,
    pricing_model: PricingModel,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kampanya maliyeti hesapla (preview, Admin)."""
    try:
        calculated_cost, breakdown = await calculate_campaign_cost_for_pricing(
            start_date, end_date, placement_id, pricing_model, db
        )

        # Get pricing info
        from app.services.ad_pricing_service import get_active_pricing_for_placement
        pricing = await get_active_pricing_for_placement(db, placement_id, start_date)
        if not pricing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active pricing found for placement"
            )

        pricing_info = {
            "id": pricing.id,
            "pricing_model": pricing.pricing_model.value,
            "price_per_day": float(pricing.price_per_day) if pricing.price_per_day else None,
            "price_per_impression": float(pricing.price_per_impression) if pricing.price_per_impression else None,
            "price_per_click": float(pricing.price_per_click) if pricing.price_per_click else None,
            "discount_percentage": float(pricing.discount_percentage),
        }

        return CampaignCostCalculationResponse(
            calculated_cost=calculated_cost,
            breakdown=breakdown,
            pricing_info=pricing_info,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
