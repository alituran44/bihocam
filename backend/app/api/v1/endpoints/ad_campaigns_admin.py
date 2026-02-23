"""Ad campaign admin endpoints."""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.api.v1.endpoints.ad_campaigns import (
    _build_campaign_response,
    _build_campaign_list_response,
)
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.ad_campaign import AdCampaign, CampaignStatus, ApprovalStatus
from app.schemas.ad_campaign import (
    AdCampaignResponse,
    AdCampaignListResponse,
)
from app.services.ad_campaign_service import (
    approve_ad_campaign,
    reject_ad_campaign,
    update_ad_campaign,
    delete_ad_campaign,
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

@router.get(
    "/admin/ads/campaigns",
    response_model=List[AdCampaignResponse],
)
async def list_all_campaigns(
    status_filter: Optional[CampaignStatus] = Query(None, alias="status"),
    teacher_id: Optional[str] = Query(None),
    placement_id: Optional[str] = Query(None),
    approval_status: Optional[ApprovalStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Tüm kampanyaları listele (Admin)."""
    conditions = []

    if status_filter:
        conditions.append(AdCampaign.status == status_filter)
    if teacher_id:
        conditions.append(AdCampaign.teacher_id == teacher_id)
    if placement_id:
        conditions.append(AdCampaign.placement_id == placement_id)
    if approval_status:
        conditions.append(AdCampaign.approval_status == approval_status)

    result = await db.execute(
        select(AdCampaign)
        .where(and_(*conditions) if conditions else True)
        .options(
            selectinload(AdCampaign.teacher),
            selectinload(AdCampaign.course),
            selectinload(AdCampaign.placement),
            selectinload(AdCampaign.approved_by),
        )
        .order_by(AdCampaign.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    campaigns = result.scalars().all()

    return [AdCampaignResponse.model_validate(_build_campaign_response(c)) for c in campaigns]


@router.get(
    "/admin/ads/campaigns/stats",
    response_model=dict,
)
async def get_campaign_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kampanya istatistikleri (Admin)."""
    from sqlalchemy import func
    from decimal import Decimal

    # Total campaigns
    total_result = await db.execute(
        select(func.count(AdCampaign.id))
    )
    total_campaigns = total_result.scalar() or 0

    # Active campaigns
    active_result = await db.execute(
        select(func.count(AdCampaign.id))
        .where(AdCampaign.status == CampaignStatus.ACTIVE)
    )
    active_campaigns = active_result.scalar() or 0

    # Pending approval
    pending_result = await db.execute(
        select(func.count(AdCampaign.id))
        .where(AdCampaign.approval_status == ApprovalStatus.PENDING)
    )
    pending_approval = pending_result.scalar() or 0

    # Total revenue (spent_amount from all campaigns)
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(AdCampaign.spent_amount), 0))
    )
    total_revenue = Decimal(str(revenue_result.scalar() or 0))

    # Total budget (total_budget from all campaigns)
    budget_result = await db.execute(
        select(func.coalesce(func.sum(AdCampaign.total_budget), 0))
    )
    total_budget = Decimal(str(budget_result.scalar() or 0))

    return {
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "pending_approval": pending_approval,
        "total_revenue": float(total_revenue),
        "total_budget": float(total_budget),
        "currency": "TRY",
    }


@router.get(
    "/admin/ads/campaigns/{campaign_id}",
    response_model=AdCampaignResponse,
)
async def get_campaign_admin(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kampanya detayı (Admin)."""
    result = await db.execute(
        select(AdCampaign)
        .where(AdCampaign.id == campaign_id)
        .options(
            selectinload(AdCampaign.teacher),
            selectinload(AdCampaign.course),
            selectinload(AdCampaign.placement),
            selectinload(AdCampaign.approved_by),
        )
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )

    response_data = _build_campaign_response(campaign)
    return AdCampaignResponse.model_validate(response_data)


@router.post(
    "/admin/ads/campaigns/{campaign_id}/approve",
    response_model=AdCampaignResponse,
)
async def approve_campaign(
    campaign_id: str,
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kampanyayı onayla (Admin)."""
    try:
        campaign = await approve_ad_campaign(db, campaign_id, current_user.id, notes)
        await db.refresh(campaign, ["teacher", "course", "placement", "approved_by"])
        response_data = _build_campaign_response(campaign)
        return AdCampaignResponse.model_validate(response_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/admin/ads/campaigns/{campaign_id}/reject",
    response_model=AdCampaignResponse,
)
async def reject_campaign(
    campaign_id: str,
    reason: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kampanyayı reddet (Admin)."""
    try:
        campaign = await reject_ad_campaign(db, campaign_id, current_user.id, reason)
        await db.refresh(campaign, ["teacher", "course", "placement", "approved_by"])
        response_data = _build_campaign_response(campaign)
        return AdCampaignResponse.model_validate(response_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put(
    "/admin/ads/campaigns/{campaign_id}",
    response_model=AdCampaignResponse,
)
async def update_campaign_admin(
    campaign_id: str,
    campaign_data: dict,  # AdCampaignUpdate, but using dict for flexibility
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kampanya güncelle (Admin override)."""
    from app.schemas.ad_campaign import AdCampaignUpdate

    try:
        update_data = AdCampaignUpdate(**campaign_data)
        campaign = await update_ad_campaign(
            db, campaign_id, update_data, current_user.id, current_user.role
        )
        await db.refresh(campaign, ["teacher", "course", "placement"])
        response_data = _build_campaign_response(campaign)
        return AdCampaignResponse.model_validate(response_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete(
    "/admin/ads/campaigns/{campaign_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_campaign_admin(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kampanya sil (Admin)."""
    try:
        await delete_ad_campaign(db, campaign_id, current_user.id, current_user.role)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
