"""Ad placement admin endpoints."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.ad_placement import AdPlacement, PlacementType
from app.schemas.ad_placement import (
    AdPlacementCreate,
    AdPlacementUpdate,
    AdPlacementResponse,
    AdPlacementListResponse,
)
from app.services.ad_placement_service import (
    create_ad_placement,
    update_ad_placement,
    delete_ad_placement,
    get_active_placements,
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
    "/admin/ads/placements",
    response_model=AdPlacementResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_placement(
    placement_data: AdPlacementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yeni yerleşim oluştur (Admin)."""
    try:
        placement = await create_ad_placement(db, placement_data, current_user.id)
        return AdPlacementResponse.model_validate(placement)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/admin/ads/placements",
    response_model=List[AdPlacementListResponse],
)
async def list_placements(
    is_active: Optional[bool] = Query(None),
    placement_type: Optional[PlacementType] = Query(None),
    location: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yerleşimleri listele (Admin)."""
    conditions = []

    if is_active is not None:
        conditions.append(AdPlacement.is_active == is_active)
    if placement_type:
        conditions.append(AdPlacement.placement_type == placement_type)
    if location:
        conditions.append(AdPlacement.location == location)

    result = await db.execute(
        select(AdPlacement)
        .where(and_(*conditions) if conditions else True)
        .order_by(AdPlacement.priority.desc(), AdPlacement.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    placements = result.scalars().all()

    return [AdPlacementListResponse.model_validate(p) for p in placements]


@router.get(
    "/admin/ads/placements/{placement_id}",
    response_model=AdPlacementResponse,
)
async def get_placement(
    placement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yerleşim detayı (Admin)."""
    from app.services.ad_placement_service import get_placement_with_pricing

    placement = await get_placement_with_pricing(db, placement_id)

    # Count active campaigns
    from app.models.ad_campaign import AdCampaign, CampaignStatus
    campaigns_result = await db.execute(
        select(AdCampaign).where(
            and_(
                AdCampaign.placement_id == placement_id,
                AdCampaign.status == CampaignStatus.ACTIVE,
            )
        )
    )
    active_campaigns_count = len(list(campaigns_result.scalars().all()))

    placement_dict = AdPlacementResponse.model_validate(placement)
    placement_dict.active_campaigns_count = active_campaigns_count

    return placement_dict


@router.put(
    "/admin/ads/placements/{placement_id}",
    response_model=AdPlacementResponse,
)
async def update_placement(
    placement_id: str,
    placement_data: AdPlacementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yerleşim güncelle (Admin)."""
    try:
        placement = await update_ad_placement(db, placement_id, placement_data, current_user.id)
        return AdPlacementResponse.model_validate(placement)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete(
    "/admin/ads/placements/{placement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_placement(
    placement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yerleşim sil (Admin)."""
    try:
        await delete_ad_placement(db, placement_id, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
