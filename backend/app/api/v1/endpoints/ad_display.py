"""Public ad display endpoints."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user_optional
from app.db.session import get_db
from app.models.user import User
from app.models.ad_campaign import AdCampaign, CampaignStatus, ApprovalStatus, CampaignType
from app.models.ad_placement import AdPlacement
from app.models.course import Course
from app.services.ad_campaign_service import (
    get_active_campaigns_for_placement,
    increment_impression,
    increment_click,
)

router = APIRouter()


def format_thumbnail_path(v: str | None) -> str | None:
    if v:
        if v.startswith("http://") or v.startswith("https://") or v.startswith("/api/v1/media"):
            return v
        filename = v.split("/")[-1]
        return f"http://127.0.0.1:8000/api/v1/media/thumbnails/{filename}"
    return v


# ==================== Public Endpoints ====================

@router.get(
    "/public/ads/placement/{placement_code}",
    response_model=List[dict],
)
async def get_ads_for_placement(
    placement_code: str,
    category_id: Optional[str] = Query(None),
    limit: int = Query(1, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Yerleşim için aktif reklamları getir (Public).
    
    Args:
        placement_code: Placement kodu (örn: "homepage_banner")
        category_id: Kategori ID (targeting için, opsiyonel)
        limit: Maksimum reklam sayısı
        db: Database session
        current_user: Optional user (for targeting)
    
    Returns:
        Aktif reklamlar listesi
    """
    # Load placement
    placement_result = await db.execute(
        select(AdPlacement).where(AdPlacement.code == placement_code)
    )
    placement = placement_result.scalar_one_or_none()
    if not placement or not placement.is_active:
        return []

    # Get active campaigns
    campaigns = await get_active_campaigns_for_placement(
        db, placement.id, category_id, limit
    )

    if not campaigns:
        # Debug: Log why no campaigns found (only for inline_courses to help debugging)
        if placement_code == "inline_courses":
            from app.models.ad_campaign import AdCampaign, CampaignStatus, ApprovalStatus
            from datetime import datetime
            now = datetime.utcnow()
            # Check all campaigns for this placement
            all_campaigns_result = await db.execute(
                select(AdCampaign).where(AdCampaign.placement_id == placement.id)
            )
            all_campaigns = all_campaigns_result.scalars().all()
            # This is just for debugging - in production you might want to remove this
            import logging
            logger = logging.getLogger(__name__)
            if all_campaigns:
                logger.info(f"inline_courses: Found {len(all_campaigns)} total campaigns, but none are active")
                for c in all_campaigns:
                    logger.info(f"  - {c.name}: status={c.status.value}, approval={c.approval_status.value}, "
                              f"dates={c.start_date} to {c.end_date}, budget={c.spent_amount}/{c.total_budget}")
        return []

    # Build response
    ads = []
    for campaign in campaigns:
        # Skip banner_ad campaigns without banner_image_url
        if campaign.campaign_type == CampaignType.BANNER_AD and not campaign.banner_image_url:
            continue
        
        # Skip course_promotion/featured_course campaigns without course_id
        if campaign.campaign_type in [CampaignType.FEATURED_COURSE, CampaignType.COURSE_PROMOTION] and not campaign.course_id:
            continue
        
        ad_dict = {
            "campaign_id": campaign.id,
            "campaign_type": campaign.campaign_type.value,
            "banner_image_url": campaign.banner_image_url,
            "banner_link_url": campaign.banner_link_url,
            "banner_alt_text": campaign.banner_alt_text,
            "course_id": campaign.course_id if campaign.campaign_type in [CampaignType.FEATURED_COURSE, CampaignType.COURSE_PROMOTION] else None,
        }

        # Load course info for featured courses and course promotions
        if campaign.campaign_type in [CampaignType.FEATURED_COURSE, CampaignType.COURSE_PROMOTION]:
            course_result = await db.execute(
                select(Course)
                .where(Course.id == campaign.course_id)
                .options(selectinload(Course.teacher), selectinload(Course.lessons))
            )
            course = course_result.scalar_one_or_none()
            if course:
                # Get lesson count
                lesson_count = len(course.lessons) if course.lessons else 0
                
                # Truncate description if too long
                description = course.description
                if description and len(description) > 200:
                    description = description[:200] + "..."
                
                ad_dict["course"] = {
                    "id": course.id,
                    "title": course.title,
                    "slug": course.slug,
                    "description": description,
                    "thumbnail_path": format_thumbnail_path(course.thumbnail_path),
                    "price": float(course.price),
                    "discount_price": float(course.discount_price) if course.discount_price else None,
                    "teacher": {
                        "id": course.teacher.id if course.teacher else None,
                        "full_name": course.teacher.full_name if course.teacher else None,
                    } if course.teacher else None,
                    "lesson_count": lesson_count,
                }
            else:
                # Course not found, skip this campaign
                continue

        ads.append(ad_dict)

        # Track impression (async, don't wait)
        try:
            await increment_impression(db, campaign.id)
        except Exception:
            pass  # Don't fail if tracking fails

    return ads


@router.post(
    "/public/ads/click/{campaign_id}",
    response_model=dict,
)
async def track_ad_click(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Reklam tıklaması kaydet (Public).
    
    Args:
        campaign_id: Kampanya ID
        db: Database session
    
    Returns:
        Success response
    """
    # Verify campaign exists and is active
    result = await db.execute(
        select(AdCampaign).where(
            and_(
                AdCampaign.id == campaign_id,
                AdCampaign.status == CampaignStatus.ACTIVE,
                AdCampaign.approval_status == ApprovalStatus.APPROVED,
            )
        )
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found or not active"
        )

    # Track click (async, don't wait)
    try:
        await increment_click(db, campaign_id)
    except Exception:
        pass  # Don't fail if tracking fails

    return {"success": True}


@router.get(
    "/public/ads/featured-courses",
    response_model=List[dict],
)
async def get_featured_courses_public(
    limit: int = Query(6, ge=1, le=20),
    category_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Öne çıkan kurslar (Public).
    
    Args:
        limit: Maksimum kurs sayısı
        category_id: Kategori ID (targeting için, opsiyonel)
        db: Database session
        current_user: Optional user (for targeting)
    
    Returns:
        Öne çıkan kurslar listesi
    """
    # Get featured course campaigns
    from app.models.ad_placement import PlacementType

    # Find featured_course placement
    placement_result = await db.execute(
        select(AdPlacement).where(
            and_(
                AdPlacement.placement_type == PlacementType.FEATURED_COURSE,
                AdPlacement.is_active == True,
            )
        )
        .limit(1)
    )
    placement = placement_result.scalar_one_or_none()
    if not placement:
        return []

    # Get active campaigns
    campaigns = await get_active_campaigns_for_placement(
        db, placement.id, category_id, limit
    )

    if not campaigns:
        return []

    # Load course details
    courses = []
    for campaign in campaigns:
        if campaign.campaign_type in [CampaignType.FEATURED_COURSE, CampaignType.COURSE_PROMOTION]:
            course_result = await db.execute(
                select(Course)
                .where(Course.id == campaign.course_id)
                .options(selectinload(Course.teacher))
            )
            course = course_result.scalar_one_or_none()
            if course:
                courses.append({
                    "id": course.id,
                    "title": course.title,
                    "slug": course.slug,
                    "thumbnail_path": format_thumbnail_path(course.thumbnail_path),
                    "price": float(course.price),
                    "discount_price": float(course.discount_price) if course.discount_price else None,
                    "teacher": {
                        "id": course.teacher.id if course.teacher else None,
                        "full_name": course.teacher.full_name if course.teacher else None,
                    } if course.teacher else None,
                    "campaign_id": campaign.id,
                })

                # Track impression
                try:
                    await increment_impression(db, campaign.id)
                except Exception:
                    pass

    return courses


@router.get(
    "/public/ads/placement-info/{placement_code}",
    response_model=dict,
)
async def get_placement_info(
    placement_code: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Yerleşim bilgilerini getir (Public - placeholder için).
    
    Args:
        placement_code: Placement kodu (örn: "homepage_banner")
        db: Database session
    
    Returns:
        Placement bilgileri (name, width, height, pricing summary)
    """
    # Load placement
    result = await db.execute(
        select(AdPlacement).where(
            and_(
                AdPlacement.code == placement_code,
                AdPlacement.is_active == True,
            )
        )
    )
    placement = result.scalar_one_or_none()
    
    if not placement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Placement not found"
        )
    
    # Get pricing summary (all active pricing models)
    from app.services.ad_pricing_service import get_pricing_history
    all_pricing = await get_pricing_history(db, placement.id)
    active_pricing = [p for p in all_pricing if p.is_active]
    
    # Build pricing summary
    pricing_summary = {}
    for p in active_pricing:
        if p.pricing_model.value == "fixed_daily" and p.price_per_day:
            pricing_summary["fixed_daily"] = float(p.price_per_day)
        elif p.pricing_model.value == "per_impression" and p.price_per_impression:
            pricing_summary["per_impression"] = float(p.price_per_impression)
        elif p.pricing_model.value == "per_click" and p.price_per_click:
            pricing_summary["per_click"] = float(p.price_per_click)
    
    return {
        "id": placement.id,
        "name": placement.name,
        "code": placement.code,
        "placement_type": placement.placement_type.value,
        "width": placement.width,
        "height": placement.height,
        "pricing": pricing_summary if pricing_summary else None,
    }
