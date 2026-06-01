"""Ad campaign endpoints for teachers."""
from typing import List, Optional
from datetime import datetime
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.ad_campaign import AdCampaign, CampaignStatus
from app.models.ad_placement import AdPlacement
from app.models.course import Course
from app.schemas.ad_campaign import (
    AdCampaignCreate,
    AdCampaignUpdate,
    AdCampaignResponse,
    AdCampaignListResponse,
    AdCampaignAnalyticsResponse,
)
from app.schemas.ad_placement import AdPlacementResponse
from app.schemas.ad_pricing import AdPricingResponse, CampaignCostCalculationResponse
from app.services.ad_campaign_service import (
    create_ad_campaign,
    update_ad_campaign,
    delete_ad_campaign,
    pause_ad_campaign,
    resume_ad_campaign,
    get_active_campaigns_for_placement,
    calculate_campaign_cost,
    calculate_teacher_balance_with_pending_ads,
)
from app.core.config import settings
from app.core.paytr import get_iframe_token, _build_user_basket, _amount_to_int, PAYTR_IFRAME_BASE
from app.api.v1.endpoints.payments import _get_client_ip
from app.services.ad_placement_service import get_active_placements, get_placement_with_pricing
from app.services.ad_pricing_service import (
    get_active_pricing_for_placement,
    calculate_campaign_cost_for_pricing,
)

router = APIRouter()


def _build_campaign_response(campaign: AdCampaign) -> dict:
    """SQLAlchemy campaign objesini response dictionary'sine çevir."""
    data = {
        "id": campaign.id,
        "teacher_id": campaign.teacher_id,
        "course_id": campaign.course_id,
        "placement_id": campaign.placement_id,
        "name": campaign.name,
        "campaign_type": campaign.campaign_type,
        "status": campaign.status,
        "approval_status": campaign.approval_status,
        "payment_status": campaign.payment_status,
        "banner_image_url": campaign.banner_image_url,
        "banner_link_url": campaign.banner_link_url,
        "banner_alt_text": campaign.banner_alt_text,
        "start_date": campaign.start_date,
        "end_date": campaign.end_date,
        "daily_budget": campaign.daily_budget,
        "total_budget": campaign.total_budget,
        "spent_amount": campaign.spent_amount,
        "pricing_model": campaign.pricing_model,
        "price_per_day": campaign.price_per_day,
        "price_per_impression": campaign.price_per_impression,
        "price_per_click": campaign.price_per_click,
        "target_categories": campaign.target_categories,
        "target_tags": campaign.target_tags,
        "is_targeted": campaign.is_targeted,
        "impressions": campaign.impressions,
        "clicks": campaign.clicks,
        "conversions": campaign.conversions,
        "ctr": campaign.ctr,
        "approved_by_id": campaign.approved_by_id,
        "approved_at": campaign.approved_at,
        "rejection_reason": campaign.rejection_reason,
        "payment_transaction_id": campaign.payment_transaction_id,
        "created_at": campaign.created_at,
        "updated_at": campaign.updated_at,
    }
    
    # Relationships to dict
    if campaign.teacher:
        data["teacher"] = {
            "id": campaign.teacher.id,
            "email": campaign.teacher.email,
            "full_name": campaign.teacher.full_name,
        }
    else:
        data["teacher"] = None
    
    if campaign.course:
        data["course"] = {
            "id": campaign.course.id,
            "title": campaign.course.title,
            "slug": campaign.course.slug,
        }
    else:
        data["course"] = None
    
    if campaign.placement:
        data["placement"] = {
            "id": campaign.placement.id,
            "name": campaign.placement.name,
            "code": campaign.placement.code,
            "placement_type": campaign.placement.placement_type,
        }
    else:
        data["placement"] = None
    
    return data


def _build_campaign_list_response(campaign: AdCampaign) -> dict:
    """SQLAlchemy campaign objesini list response dictionary'sine çevir."""
    data = {
        "id": campaign.id,
        "name": campaign.name,
        "campaign_type": campaign.campaign_type,
        "status": campaign.status,
        "approval_status": campaign.approval_status,
        "placement_id": campaign.placement_id,
        "course_id": campaign.course_id,
        "start_date": campaign.start_date,
        "end_date": campaign.end_date,
        "total_budget": campaign.total_budget,
        "spent_amount": campaign.spent_amount,
        "impressions": campaign.impressions,
        "clicks": campaign.clicks,
        "ctr": campaign.ctr,
        "created_at": campaign.created_at,
        "updated_at": campaign.updated_at,
    }
    
    # Relationships to dict
    if campaign.placement:
        data["placement"] = {
            "id": campaign.placement.id,
            "name": campaign.placement.name,
            "code": campaign.placement.code,
            "placement_type": campaign.placement.placement_type,
        }
    else:
        data["placement"] = None
    
    if campaign.course:
        data["course"] = {
            "id": campaign.course.id,
            "title": campaign.course.title,
            "slug": campaign.course.slug,
        }
    else:
        data["course"] = None
    
    return data


def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    """Teacher yetkisi kontrolü"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için öğretmen yetkisi gerekli"
        )
    return current_user


# ==================== Teacher Endpoints ====================

@router.post(
    "/ads/campaigns",
    response_model=AdCampaignResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_campaign(
    campaign_data: AdCampaignCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Yeni reklam kampanyası oluştur (Teacher)."""
    try:
        # Log incoming data for debugging
        logging.info(f"Creating campaign for teacher {current_user.id}: {campaign_data.model_dump()}")
        
        campaign = await create_ad_campaign(db, campaign_data, current_user.id)
        
        # Load relationships for response
        await db.refresh(campaign, ["teacher", "course", "placement"])
        
        # Build response dict
        response_data = _build_campaign_response(campaign)
        
        # If payment method is credit card, generate PayTR token
        if getattr(campaign_data, "payment_method", "balance") == "credit_card":
            # 1. Build basket
            basket_items = [
                {"name": f"Reklam Kampanyası: {campaign.name}", "price": campaign.total_budget, "quantity": 1}
            ]
            user_basket = _build_user_basket(basket_items)
            
            # 2. Get IP
            client_ip = _get_client_ip(request)
            
            # 3. Call PayTR
            paytr_result = await get_iframe_token(
                user_ip=client_ip,
                merchant_oid=f"AD-{campaign.id}",
                email=current_user.email,
                payment_amount=_amount_to_int(campaign.total_budget),
                user_basket=user_basket,
                user_name=current_user.full_name or "Eğitmen",
                user_phone=getattr(current_user, "phone", None) or "05000000000",
                user_address="Türkiye",
                merchant_ok_url=f"{settings.FRONTEND_URL}/dashboard/teacher/ads?payment=success",
                merchant_fail_url=f"{settings.FRONTEND_URL}/dashboard/teacher/ads?payment=fail",
            )
            
            if paytr_result.get("status") == "success":
                response_data["payment_token"] = paytr_result["token"]
                response_data["payment_iframe_url"] = f"{PAYTR_IFRAME_BASE}/{paytr_result['token']}"
            else:
                logging.error(f"PayTR token failed for ad campaign {campaign.id}: {paytr_result}")
                
        return AdCampaignResponse.model_validate(response_data)
    except ValueError as e:
        logging.error(f"ValueError in create_campaign: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except ValidationError as e:
        logging.error(f"ValidationError in create_campaign: {e.errors()}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Validation error", "errors": e.errors()}
        )
    except Exception as e:
        logging.error(f"Unexpected error in create_campaign: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.get(
    "/ads/campaigns",
    response_model=List[AdCampaignListResponse],
)
async def list_my_campaigns(
    status_filter: Optional[CampaignStatus] = Query(None, alias="status"),
    placement_id: Optional[str] = Query(None),
    course_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Kampanyaları listele (Teacher'ın kendi kampanyaları)."""
    conditions = [AdCampaign.teacher_id == current_user.id]

    if status_filter:
        conditions.append(AdCampaign.status == status_filter)
    if placement_id:
        conditions.append(AdCampaign.placement_id == placement_id)
    if course_id:
        conditions.append(AdCampaign.course_id == course_id)

    result = await db.execute(
        select(AdCampaign)
        .where(and_(*conditions))
        .options(
            selectinload(AdCampaign.placement),
            selectinload(AdCampaign.course),
        )
        .order_by(AdCampaign.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    campaigns = result.scalars().all()

    return [AdCampaignListResponse.model_validate(_build_campaign_list_response(c)) for c in campaigns]


@router.get(
    "/ads/campaigns/{campaign_id}",
    response_model=AdCampaignResponse,
)
async def get_campaign(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Kampanya detayı (Teacher'ın kendi kampanyası)."""
    result = await db.execute(
        select(AdCampaign)
        .where(
            and_(
                AdCampaign.id == campaign_id,
                AdCampaign.teacher_id == current_user.id,
            )
        )
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


@router.put(
    "/ads/campaigns/{campaign_id}",
    response_model=AdCampaignResponse,
)
async def update_campaign(
    campaign_id: str,
    campaign_data: AdCampaignUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Kampanya güncelle (Teacher'ın kendi kampanyası)."""
    try:
        campaign = await update_ad_campaign(
            db, campaign_id, campaign_data, current_user.id, current_user.role
        )
        
        # Load relationships for response
        await db.refresh(campaign, ["teacher", "course", "placement"])
        
        response_data = _build_campaign_response(campaign)
        return AdCampaignResponse.model_validate(response_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete(
    "/ads/campaigns/{campaign_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_campaign(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Kampanya sil (Teacher'ın kendi kampanyası)."""
    try:
        await delete_ad_campaign(db, campaign_id, current_user.id, current_user.role)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post(
    "/ads/campaigns/{campaign_id}/pause",
    response_model=AdCampaignResponse,
)
async def pause_campaign(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Kampanyayı duraklat (Teacher)."""
    try:
        campaign = await pause_ad_campaign(db, campaign_id, current_user.id)
        await db.refresh(campaign, ["teacher", "course", "placement"])
        response_data = _build_campaign_response(campaign)
        return AdCampaignResponse.model_validate(response_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/ads/campaigns/{campaign_id}/resume",
    response_model=AdCampaignResponse,
)
async def resume_campaign(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Kampanyayı devam ettir (Teacher)."""
    try:
        campaign = await resume_ad_campaign(db, campaign_id, current_user.id)
        await db.refresh(campaign, ["teacher", "course", "placement"])
        response_data = _build_campaign_response(campaign)
        return AdCampaignResponse.model_validate(response_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/ads/campaigns/{campaign_id}/analytics",
    response_model=AdCampaignAnalyticsResponse,
)
async def get_campaign_analytics(
    campaign_id: str,
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    group_by: str = Query("day", pattern="^(day|week|month)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Kampanya analitikleri (Teacher'ın kendi kampanyası)."""
    from app.models.ad_campaign_analytics import AdCampaignAnalytics
    from sqlalchemy import func as sql_func
    from decimal import Decimal

    # Verify ownership
    result = await db.execute(
        select(AdCampaign).where(
            and_(
                AdCampaign.id == campaign_id,
                AdCampaign.teacher_id == current_user.id,
            )
        )
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )

    # Set default date range
    if not date_from:
        date_from = campaign.start_date
    if not date_to:
        date_to = campaign.end_date

    # Get analytics
    analytics_result = await db.execute(
        select(AdCampaignAnalytics)
        .where(
            and_(
                AdCampaignAnalytics.campaign_id == campaign_id,
                AdCampaignAnalytics.date >= date_from.date(),
                AdCampaignAnalytics.date <= date_to.date(),
            )
        )
        .order_by(AdCampaignAnalytics.date.asc())
    )
    analytics_list = list(analytics_result.scalars().all())

    # Calculate totals
    total_impressions = sum(a.impressions for a in analytics_list)
    total_clicks = sum(a.clicks for a in analytics_list)
    total_conversions = sum(a.conversions for a in analytics_list)
    total_spent = sum(a.spent_amount for a in analytics_list)

    # Calculate averages
    avg_ctr = (
        (Decimal(str(total_clicks)) / Decimal(str(total_impressions)) * Decimal("100.00"))
        if total_impressions > 0
        else Decimal("0.00")
    )
    avg_conversion_rate = (
        (Decimal(str(total_conversions)) / Decimal(str(total_clicks)) * Decimal("100.00"))
        if total_clicks > 0
        else Decimal("0.00")
    )
    avg_cpc = (
        (total_spent / Decimal(str(total_clicks)))
        if total_clicks > 0
        else Decimal("0.00")
    )
    avg_cpm = (
        (total_spent / Decimal(str(total_impressions)) * Decimal("1000.00"))
        if total_impressions > 0
        else Decimal("0.00")
    )

    # Build daily breakdown
    daily_analytics = [
        {
            "date": a.date.isoformat(),
            "impressions": a.impressions,
            "clicks": a.clicks,
            "conversions": a.conversions,
            "spent_amount": float(a.spent_amount),
            "ctr": float(a.ctr),
            "conversion_rate": float(a.conversion_rate),
            "cpc": float(a.cpc),
            "cpm": float(a.cpm),
        }
        for a in analytics_list
    ]

    return AdCampaignAnalyticsResponse(
        campaign_id=campaign_id,
        date_from=date_from,
        date_to=date_to,
        total_impressions=total_impressions,
        total_clicks=total_clicks,
        total_conversions=total_conversions,
        total_spent=total_spent,
        average_ctr=avg_ctr,
        average_conversion_rate=avg_conversion_rate,
        average_cpc=avg_cpc,
        average_cpm=avg_cpm,
        daily_analytics=daily_analytics,
    )


@router.get(
    "/ads/placements",
    response_model=List[AdPlacementResponse],
)
async def list_placements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Aktif yerleşimleri listele (Teacher)."""
    placements = await get_active_placements(db)

    # Load pricing info for each placement (all active pricing models)
    from app.services.ad_pricing_service import get_pricing_history
    result_list = []
    for placement in placements:
        # Get all active pricing models for this placement
        all_pricing = await get_pricing_history(db, placement.id)
        active_pricing = [p for p in all_pricing if p.is_active]
        
        # Build pricing summary with all models
        pricing_summary = {}
        for p in active_pricing:
            if p.pricing_model.value == "fixed_daily" and p.price_per_day:
                pricing_summary["fixed_daily"] = float(p.price_per_day)
            elif p.pricing_model.value == "per_impression" and p.price_per_impression:
                pricing_summary["per_impression"] = float(p.price_per_impression)
            elif p.pricing_model.value == "per_click" and p.price_per_click:
                pricing_summary["per_click"] = float(p.price_per_click)
        
        placement_dict = {
            "id": placement.id,
            "name": placement.name,
            "code": placement.code,
            "description": placement.description,
            "placement_type": placement.placement_type,
            "location": placement.location,
            "width": placement.width,
            "height": placement.height,
            "max_ads": placement.max_ads,
            "is_active": placement.is_active,
            "priority": placement.priority,
            "targeting_options": placement.targeting_options,
            "created_at": placement.created_at,
            "updated_at": placement.updated_at,
            "pricing": pricing_summary if pricing_summary else None,
            "active_campaigns_count": None,  # Can be calculated if needed
        }
        result_list.append(placement_dict)

    return result_list


@router.get(
    "/ads/placements/{placement_id}/pricing",
    response_model=CampaignCostCalculationResponse,
)
async def get_placement_pricing(
    placement_id: str,
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Yerleşim fiyatlandırması ve kampanya maliyeti hesaplama (Teacher)."""
    from app.models.ad_campaign import PricingModel

    # Get active pricing
    pricing = await get_active_pricing_for_placement(db, placement_id, start_date)
    if not pricing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active pricing found for placement"
        )

    # Calculate cost
    calculated_cost, breakdown = await calculate_campaign_cost_for_pricing(
        start_date, end_date, placement_id, pricing.pricing_model, db
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


@router.get(
    "/ads/balance",
    response_model=dict,
)
async def get_my_balance_for_ads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Reklam için bakiye bilgisi (Teacher)."""
    available_balance, pending_amounts = (
        await calculate_teacher_balance_with_pending_ads(current_user.id, db)
    )

    return {
        "available_balance": float(available_balance),
        "pending_amounts": float(pending_amounts),
        "currency": "TRY",
    }
