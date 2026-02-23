"""
Ad campaign scheduled jobs and background tasks.

Bu modül reklam kampanyaları için scheduled jobs ve background tasks içerir.
Celery veya FastAPI BackgroundTasks ile kullanılabilir.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ad_campaign_service import (
    check_and_complete_campaigns,
    check_and_activate_campaigns,
    update_campaign_analytics,
)


async def activate_scheduled_campaigns(db: AsyncSession) -> list:
    """
    Scheduled job: start_date gelen kampanyaları ACTIVE yap.
    
    Her saat çalıştırılmalı.
    
    Args:
        db: Database session
    
    Returns:
        Aktif edilen kampanyalar listesi
    """
    return await check_and_activate_campaigns(db)


async def complete_expired_campaigns(db: AsyncSession) -> list:
    """
    Scheduled job: end_date geçen kampanyaları COMPLETED yap.
    
    Her saat çalıştırılmalı.
    
    Args:
        db: Database session
    
    Returns:
        Tamamlanan kampanyalar listesi
    """
    return await check_and_complete_campaigns(db)


async def pause_over_budget_campaigns(db: AsyncSession) -> list:
    """
    Scheduled job: Bütçe biten kampanyaları PAUSED yap.
    
    Her saat çalıştırılmalı.
    
    Args:
        db: Database session
    
    Returns:
        Duraklatılan kampanyalar listesi
    """
    from app.models.ad_campaign import AdCampaign, CampaignStatus
    from sqlalchemy import select, and_

    now = datetime.utcnow()

    # Find over-budget campaigns
    result = await db.execute(
        select(AdCampaign).where(
            and_(
                AdCampaign.status == CampaignStatus.ACTIVE,
                AdCampaign.spent_amount >= AdCampaign.total_budget,
            )
        )
    )
    campaigns = list(result.scalars().all())

    for campaign in campaigns:
        campaign.status = CampaignStatus.PAUSED

    if campaigns:
        await db.commit()

    return campaigns


async def update_daily_analytics(db: AsyncSession) -> None:
    """
    Scheduled job: Günlük analytics özetlerini oluştur.
    
    Her gün 00:00'da çalıştırılmalı.
    
    Args:
        db: Database session
    """
    from app.models.ad_campaign import AdCampaign, CampaignStatus, ApprovalStatus
    from app.models.ad_campaign_analytics import AdCampaignAnalytics
    from sqlalchemy import select, and_, func
    from decimal import Decimal

    yesterday = datetime.utcnow().date()

    # Get all active campaigns
    result = await db.execute(
        select(AdCampaign).where(
            and_(
                AdCampaign.status == CampaignStatus.ACTIVE,
                AdCampaign.approval_status == ApprovalStatus.APPROVED,
            )
        )
    )
    campaigns = result.scalars().all()

    for campaign in campaigns:
        # Check if analytics record exists for yesterday
        analytics_result = await db.execute(
            select(AdCampaignAnalytics).where(
                and_(
                    AdCampaignAnalytics.campaign_id == campaign.id,
                    AdCampaignAnalytics.date == yesterday,
                )
            )
        )
        analytics = analytics_result.scalar_one_or_none()

        if not analytics:
            # Create new analytics record
            analytics = AdCampaignAnalytics(
                campaign_id=campaign.id,
                date=yesterday,
                impressions=0,
                clicks=0,
                conversions=0,
                spent_amount=Decimal("0.00"),
                ctr=Decimal("0.00"),
                conversion_rate=Decimal("0.00"),
                cpc=Decimal("0.00"),
                cpm=Decimal("0.00"),
            )
            db.add(analytics)

    await db.commit()


# Background tasks (for async processing)

async def process_impression_tracking(
    campaign_id: str,
    db: AsyncSession,
) -> None:
    """
    Background task: Impression tracking işlemi.
    
    Args:
        campaign_id: Kampanya ID
        db: Database session
    """
    from app.services.ad_campaign_service import increment_impression

    try:
        await increment_impression(db, campaign_id)
    except Exception:
        pass  # Don't fail if tracking fails


async def process_click_tracking(
    campaign_id: str,
    db: AsyncSession,
) -> None:
    """
    Background task: Click tracking işlemi.
    
    Args:
        campaign_id: Kampanya ID
        db: Database session
    """
    from app.services.ad_campaign_service import increment_click

    try:
        await increment_click(db, campaign_id)
    except Exception:
        pass  # Don't fail if tracking fails


async def update_campaign_metrics_task(
    campaign_id: str,
    db: AsyncSession,
) -> None:
    """
    Background task: Kampanya metriklerini güncelle.
    
    Args:
        campaign_id: Kampanya ID
        db: Database session
    """
    try:
        await update_campaign_analytics(db, campaign_id)
    except Exception:
        pass  # Don't fail if update fails
