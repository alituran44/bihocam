from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ad_campaign import (
    AdCampaign,
    CampaignStatus,
    CampaignType,
    PricingModel,
    ApprovalStatus,
    PaymentStatus,
)
from app.models.ad_placement import AdPlacement
from app.models.ad_pricing import AdPricing
from app.models.ad_campaign_analytics import AdCampaignAnalytics
from app.models.teacher_earning import TeacherEarning, EarningType
from app.models.course import Course
from app.models.user import User, UserRole
from app.models.notification import NotificationType, NotificationPriority
from app.schemas.ad_campaign import AdCampaignCreate, AdCampaignUpdate
from app.services.notification_service import NotificationService


def _normalize_datetime(dt: datetime | None) -> datetime | None:
    """Convert timezone-aware datetime to UTC and make it timezone-naive."""
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


async def calculate_teacher_balance_with_pending_ads(
    teacher_id: str, db: AsyncSession
) -> tuple[Decimal, Decimal]:
    """
    Öğretmenin bakiyesini hesapla (pending ad spend'leri dahil).
    
    Returns:
        (available_balance, pending_amounts)
        - available_balance: Kullanılabilir bakiye
        - pending_amounts: Bekleyen tutarlar (withdrawals + ad_spend)
    """
    from app.models.withdrawal_request import WithdrawalRequest, WithdrawalStatus

    # Toplam kazanç (EARNING tipindeki pozitif tutarlar)
    earnings_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0)).where(
            and_(
                TeacherEarning.teacher_id == teacher_id,
                TeacherEarning.type == EarningType.EARNING,
            )
        )
    )
    total_earnings = Decimal(str(earnings_result.scalar() or 0))

    # Toplam çekim (WITHDRAWAL tipindeki negatif tutarlar)
    withdrawals_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(TeacherEarning.amount)), 0)).where(
            and_(
                TeacherEarning.teacher_id == teacher_id,
                TeacherEarning.type == EarningType.WITHDRAWAL,
            )
        )
    )
    total_withdrawals = Decimal(str(withdrawals_result.scalar() or 0))

    # Toplam düzeltme (ADJUSTMENT) - Admin tarafından eklenen/çıkarılan bakiyeler
    adjustments_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0)).where(
            and_(
                TeacherEarning.teacher_id == teacher_id,
                TeacherEarning.type == EarningType.ADJUSTMENT,
            )
        )
    )
    total_adjustments = Decimal(str(adjustments_result.scalar() or 0))

    # Toplam reklam harcaması (AD_SPEND tipindeki negatif tutarlar - onaylanmış)
    ad_spend_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(TeacherEarning.amount)), 0)).where(
            and_(
                TeacherEarning.teacher_id == teacher_id,
                TeacherEarning.type == EarningType.AD_SPEND,
            )
        )
    )
    total_ad_spend = Decimal(str(ad_spend_result.scalar() or 0))

    # Bekleyen çekim talepleri
    pending_withdrawals_result = await db.execute(
        select(func.coalesce(func.sum(WithdrawalRequest.amount), 0)).where(
            and_(
                WithdrawalRequest.teacher_id == teacher_id,
                WithdrawalRequest.status.in_(
                    [WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED]
                ),
            )
        )
    )
    pending_withdrawals = Decimal(str(pending_withdrawals_result.scalar() or 0))

    # Bekleyen reklam harcamaları (PENDING_APPROVAL durumundaki kampanyalar)
    pending_ads_result = await db.execute(
        select(func.coalesce(func.sum(AdCampaign.total_budget), 0)).where(
            and_(
                AdCampaign.teacher_id == teacher_id,
                AdCampaign.approval_status == ApprovalStatus.PENDING,
                AdCampaign.payment_status == PaymentStatus.PENDING,
            )
        )
    )
    pending_ads = Decimal(str(pending_ads_result.scalar() or 0))

    pending_amounts = pending_withdrawals + pending_ads
    # ADJUSTMENT'lar pozitif veya negatif olabilir, bu yüzden direkt toplam kazançlara eklenmeli
    available_balance = total_earnings + total_adjustments - total_withdrawals - total_ad_spend - pending_amounts

    return available_balance, pending_amounts


async def calculate_campaign_cost(
    start_date: datetime,
    end_date: datetime,
    pricing: AdPricing,
    pricing_model: PricingModel,
) -> Decimal:
    """
    Kampanya maliyetini hesapla.
    
    Args:
        start_date: Kampanya başlangıç tarihi
        end_date: Kampanya bitiş tarihi
        pricing: AdPricing objesi
        pricing_model: Fiyatlandırma modeli
    
    Returns:
        Hesaplanan toplam maliyet
    """
    # Normalize dates
    start = _normalize_datetime(start_date)
    end = _normalize_datetime(end_date)

    if start >= end:
        raise ValueError("end_date must be after start_date")

    # Calculate days
    days = (end - start).days + 1  # Inclusive

    if pricing_model == PricingModel.FIXED_DAILY:
        if pricing.price_per_day is None:
            raise ValueError("price_per_day is required for FIXED_DAILY pricing model")
        cost = pricing.price_per_day * Decimal(str(days))
    elif pricing_model == PricingModel.PER_IMPRESSION:
        # Estimate based on average impressions per day (optional, can be improved)
        # For now, return 0 as it will be calculated based on actual impressions
        cost = Decimal("0.00")
    elif pricing_model == PricingModel.PER_CLICK:
        # Estimate based on average clicks per day (optional, can be improved)
        # For now, return 0 as it will be calculated based on actual clicks
        cost = Decimal("0.00")
    elif pricing_model == PricingModel.HYBRID:
        # Combination of fixed daily + per impression/click
        if pricing.price_per_day is None:
            raise ValueError("price_per_day is required for HYBRID pricing model")
        cost = pricing.price_per_day * Decimal(str(days))
    else:
        raise ValueError(f"Unknown pricing model: {pricing_model}")

    # Apply discount
    if pricing.discount_percentage and pricing.discount_percentage > 0:
        discount = cost * (pricing.discount_percentage / Decimal("100.00"))
        cost = cost - discount

    return cost


async def get_active_pricing_for_placement(
    db: AsyncSession, placement_id: str, date: datetime | None = None
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


async def create_ad_campaign(
    db: AsyncSession,
    campaign_data: AdCampaignCreate,
    teacher_id: str,
) -> AdCampaign:
    """
    Yeni reklam kampanyası oluştur.
    
    Args:
        db: Database session
        campaign_data: Kampanya verisi
        teacher_id: Teacher ID
    
    Returns:
        Oluşturulan AdCampaign objesi
    
    Raises:
        ValueError: Validation hatası
    """
    # Normalize dates
    start_date = _normalize_datetime(campaign_data.start_date)
    end_date = _normalize_datetime(campaign_data.end_date)

    # Validate date range
    if end_date <= start_date:
        raise ValueError("end_date must be after start_date")

    # Check if start_date is in the future
    now = datetime.utcnow()
    if start_date < now:
        raise ValueError("start_date must be in the future")

    # Load placement
    placement_result = await db.execute(
        select(AdPlacement).where(AdPlacement.id == campaign_data.placement_id)
    )
    placement = placement_result.scalar_one_or_none()
    if not placement:
        raise ValueError("Placement not found")
    if not placement.is_active:
        raise ValueError("Placement is not active")

    # Load course (sadece featured_course ve course_promotion için gerekli)
    course = None
    if campaign_data.course_id:
        course_result = await db.execute(
            select(Course).where(
                and_(Course.id == campaign_data.course_id, Course.teacher_id == teacher_id)
            )
        )
        course = course_result.scalar_one_or_none()
        if not course:
            raise ValueError("Course not found or not owned by teacher")
    elif campaign_data.campaign_type in [CampaignType.FEATURED_COURSE, CampaignType.COURSE_PROMOTION]:
        raise ValueError("course_id is required for featured_course and course_promotion campaign types")

    # Get active pricing for placement
    pricing = await get_active_pricing_for_placement(
        db, placement.id, start_date
    )
    if not pricing:
        raise ValueError("No active pricing found for placement")

    # Calculate campaign cost
    calculated_cost = await calculate_campaign_cost(
        start_date, end_date, pricing, campaign_data.pricing_model
    )

    # Validate budget
    if campaign_data.total_budget < calculated_cost:
        raise ValueError(
            f"total_budget ({campaign_data.total_budget}) must be >= calculated cost ({calculated_cost})"
        )

    # Check teacher balance & create transaction only for balance payment
    payment_method = getattr(campaign_data, "payment_method", "balance")
    if payment_method == "balance":
        available_balance, pending_amounts = (
            await calculate_teacher_balance_with_pending_ads(teacher_id, db)
        )
        if available_balance < campaign_data.total_budget:
            raise ValueError(
                f"Insufficient balance. Available: {available_balance:.2f} TRY, Required: {campaign_data.total_budget:.2f} TRY"
            )

    # Create campaign
    campaign = AdCampaign(
        teacher_id=teacher_id,
        course_id=campaign_data.course_id if campaign_data.course_id else None,
        placement_id=campaign_data.placement_id,
        name=campaign_data.name,
        campaign_type=campaign_data.campaign_type,
        banner_image_url=campaign_data.banner_image_url,
        banner_link_url=campaign_data.banner_link_url,
        banner_alt_text=campaign_data.banner_alt_text,
        start_date=start_date,
        end_date=end_date,
        daily_budget=campaign_data.daily_budget,
        total_budget=campaign_data.total_budget,
        pricing_model=campaign_data.pricing_model,
        price_per_day=pricing.price_per_day or Decimal("0.00"),
        price_per_impression=pricing.price_per_impression,
        price_per_click=pricing.price_per_click,
        target_categories=campaign_data.target_categories,
        target_tags=campaign_data.target_tags,
        is_targeted=campaign_data.is_targeted,
        status=CampaignStatus.PENDING_APPROVAL,
        approval_status=ApprovalStatus.PENDING,
        payment_status=PaymentStatus.PENDING,
    )

    db.add(campaign)
    await db.flush()

    # Create pending TeacherEarning record only for balance payment
    if payment_method == "balance":
        earning = TeacherEarning(
            teacher_id=teacher_id,
            amount=-campaign_data.total_budget,  # Negatif tutar
            currency="TRY",
            type=EarningType.AD_SPEND,
            description=f"Reklam kampanyası: {campaign_data.name} (Beklemede)",
            ad_campaign_id=campaign.id,
            reference_id=campaign.id,
        )
        db.add(earning)

    await db.commit()
    await db.refresh(campaign)

    return campaign


async def update_ad_campaign(
    db: AsyncSession,
    campaign_id: str,
    campaign_data: AdCampaignUpdate,
    teacher_id: str,
    user_role: UserRole,
) -> AdCampaign:
    """
    Reklam kampanyasını güncelle.
    
    Args:
        db: Database session
        campaign_id: Kampanya ID
        campaign_data: Güncelleme verisi
        teacher_id: Teacher ID (author kontrolü için)
        user_role: User role (admin override için)
    
    Returns:
        Güncellenmiş AdCampaign objesi
    
    Raises:
        ValueError: Validation hatası
    """
    # Load campaign
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise ValueError("Campaign not found")

    # Author kontrolü (admin override)
    if user_role not in [UserRole.ADMIN, UserRole.STAFF]:
        if campaign.teacher_id != teacher_id:
            raise ValueError("Not authorized to update this campaign")

    # Status kontrolü (ACTIVE kampanyalar sınırlı güncellenebilir)
    if campaign.status == CampaignStatus.ACTIVE:
        # Sadece belirli alanlar güncellenebilir (targeting, daily_budget, vb.)
        allowed_fields = {
            "target_categories",
            "target_tags",
            "is_targeted",
            "daily_budget",
        }
        update_dict = campaign_data.model_dump(exclude_unset=True)
        for key in update_dict:
            if key not in allowed_fields:
                raise ValueError(
                    f"Cannot update {key} for ACTIVE campaign. Only {allowed_fields} can be updated."
                )

    # Update fields
    update_dict = campaign_data.model_dump(exclude_unset=True)

    # Handle date updates
    if "start_date" in update_dict:
        update_dict["start_date"] = _normalize_datetime(update_dict["start_date"])
    if "end_date" in update_dict:
        update_dict["end_date"] = _normalize_datetime(update_dict["end_date"])

    # Recalculate pricing if dates changed
    if "start_date" in update_dict or "end_date" in update_dict:
        start_date = update_dict.get("start_date", campaign.start_date)
        end_date = update_dict.get("end_date", campaign.end_date)

        if end_date <= start_date:
            raise ValueError("end_date must be after start_date")

        # Get active pricing
        pricing = await get_active_pricing_for_placement(
            db, campaign.placement_id, start_date
        )
        if pricing:
            calculated_cost = await calculate_campaign_cost(
                start_date, end_date, pricing, campaign.pricing_model
            )
            # Update pricing fields
            update_dict["price_per_day"] = pricing.price_per_day or Decimal("0.00")
            update_dict["price_per_impression"] = pricing.price_per_impression
            update_dict["price_per_click"] = pricing.price_per_click

    # Budget kontrolü (if budget increased)
    if "total_budget" in update_dict:
        new_budget = update_dict["total_budget"]
        if new_budget > campaign.total_budget:
            # Check balance for increased amount
            available_balance, _ = (
                await calculate_teacher_balance_with_pending_ads(teacher_id, db)
            )
            increase = new_budget - campaign.total_budget
            if available_balance < increase:
                raise ValueError(
                    f"Insufficient balance for budget increase. Available: {available_balance:.2f} TRY, Required: {increase:.2f} TRY"
                )

    # Update campaign
    for key, value in update_dict.items():
        setattr(campaign, key, value)

    await db.commit()
    await db.refresh(campaign)

    return campaign


async def delete_ad_campaign(
    db: AsyncSession,
    campaign_id: str,
    teacher_id: str,
    user_role: UserRole,
) -> bool:
    """
    Reklam kampanyasını sil.
    
    Args:
        db: Database session
        campaign_id: Kampanya ID
        teacher_id: Teacher ID (author kontrolü için)
        user_role: User role (admin override için)
    
    Returns:
        True if deleted
    
    Raises:
        ValueError: Validation hatası
    """
    # Load campaign
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise ValueError("Campaign not found")

    # Author kontrolü (admin override)
    if user_role not in [UserRole.ADMIN, UserRole.STAFF]:
        if campaign.teacher_id != teacher_id:
            raise ValueError("Not authorized to delete this campaign")

    # Status kontrolü (ACTIVE kampanyalar silinemez)
    if campaign.status == CampaignStatus.ACTIVE:
        raise ValueError("Cannot delete ACTIVE campaign. Pause it first.")

    # Refund işlemi (if paid)
    if campaign.payment_status == PaymentStatus.PAID:
        # Create refund TeacherEarning record
        refund_earning = TeacherEarning(
            teacher_id=campaign.teacher_id,
            amount=campaign.total_budget,  # Pozitif (refund)
            currency="TRY",
            type=EarningType.ADJUSTMENT,
            description=f"Reklam kampanyası iptali: {campaign.name} (İade)",
            ad_campaign_id=campaign.id,
            reference_id=campaign.id,
        )
        db.add(refund_earning)

        # Update payment status
        campaign.payment_status = PaymentStatus.REFUNDED

    # Delete pending TeacherEarning record (if exists)
    if campaign.approval_status == ApprovalStatus.PENDING:
        earning_result = await db.execute(
            select(TeacherEarning).where(
                and_(
                    TeacherEarning.ad_campaign_id == campaign_id,
                    TeacherEarning.type == EarningType.AD_SPEND,
                )
            )
        )
        pending_earning = earning_result.scalar_one_or_none()
        if pending_earning:
            await db.delete(pending_earning)

    # Delete campaign
    await db.delete(campaign)
    await db.commit()

    return True


async def approve_ad_campaign(
    db: AsyncSession,
    campaign_id: str,
    admin_id: str,
    notes: str | None = None,
) -> AdCampaign:
    """
    Reklam kampanyasını onayla.
    
    Args:
        db: Database session
        campaign_id: Kampanya ID
        admin_id: Admin ID
        notes: Onay notları (opsiyonel)
    
    Returns:
        Onaylanmış AdCampaign objesi
    
    Raises:
        ValueError: Validation hatası
    """
    # Load campaign
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise ValueError("Campaign not found")

    if campaign.approval_status != ApprovalStatus.PENDING:
        raise ValueError(f"Campaign is not in PENDING status. Current: {campaign.approval_status}")

    # Check balance again (in case it changed)
    available_balance, _ = await calculate_teacher_balance_with_pending_ads(
        campaign.teacher_id, db
    )
    if available_balance < campaign.total_budget:
        raise ValueError(
            f"Insufficient balance. Available: {available_balance:.2f} TRY, Required: {campaign.total_budget:.2f} TRY"
        )

    # Update approval status
    campaign.approval_status = ApprovalStatus.APPROVED
    campaign.approved_by_id = admin_id
    campaign.approved_at = datetime.utcnow()

    # Update payment status (payment will be processed)
    campaign.payment_status = PaymentStatus.PAID

    # Update status (if start_date <= today, activate immediately)
    now = datetime.utcnow()
    # Normalize start_date for comparison (in case it's timezone-aware)
    start_date_normalized = _normalize_datetime(campaign.start_date) if campaign.start_date else None
    end_date_normalized = _normalize_datetime(campaign.end_date) if campaign.end_date else None
    
    # Determine campaign status based on dates
    if start_date_normalized and end_date_normalized:
        # If start_date has passed or is today, and end_date hasn't passed, activate immediately
        if start_date_normalized <= now and end_date_normalized >= now:
            campaign.status = CampaignStatus.ACTIVE
        # If start_date is in the future, keep as PENDING_APPROVAL (will be activated by scheduled job)
        elif start_date_normalized > now:
            campaign.status = CampaignStatus.PENDING_APPROVAL
        # If end_date has passed, mark as COMPLETED
        else:
            campaign.status = CampaignStatus.COMPLETED
    else:
        # If dates are missing, default to PENDING_APPROVAL
        campaign.status = CampaignStatus.PENDING_APPROVAL

    # Update TeacherEarning record (confirm the pending earning)
    earning_result = await db.execute(
        select(TeacherEarning).where(
            and_(
                TeacherEarning.ad_campaign_id == campaign_id,
                TeacherEarning.type == EarningType.AD_SPEND,
            )
        )
    )
    earning = earning_result.scalar_one_or_none()
    if earning:
        earning.description = f"Reklam kampanyası: {campaign.name} (Onaylandı)"

    await db.commit()
    
    # Double-check: Immediately activate this campaign if start_date has passed
    # This is a safety check in case the first activation logic didn't work
    # We need to re-query to get the fresh campaign object after commit
    result_check = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign_check = result_check.scalar_one_or_none()
    
    if campaign_check:
        now_check = datetime.utcnow()
        start_date_check = _normalize_datetime(campaign_check.start_date) if campaign_check.start_date else None
        end_date_check = _normalize_datetime(campaign_check.end_date) if campaign_check.end_date else None
        
        # Debug logging
        print(f"DEBUG approve_ad_campaign: campaign_id={campaign_id}, status={campaign_check.status}, approval_status={campaign_check.approval_status}")
        print(f"DEBUG approve_ad_campaign: start_date={start_date_check}, end_date={end_date_check}, now={now_check}")
        
        if (campaign_check.approval_status == ApprovalStatus.APPROVED and 
            campaign_check.status == CampaignStatus.PENDING_APPROVAL and
            start_date_check and end_date_check and
            start_date_check <= now_check and 
            end_date_check >= now_check):
            print(f"DEBUG approve_ad_campaign: Activating campaign {campaign_id}")
            campaign_check.status = CampaignStatus.ACTIVE
            await db.commit()
            await db.refresh(campaign_check)
            campaign = campaign_check
        else:
            print(f"DEBUG approve_ad_campaign: Not activating - status={campaign_check.status}, start_date_check <= now_check={start_date_check <= now_check if start_date_check else None}, end_date_check >= now_check={end_date_check >= now_check if end_date_check else None}")
            await db.refresh(campaign_check)
            campaign = campaign_check

    # Send notification to teacher
    try:
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            user_ids=[campaign.teacher_id],
            notification_type=NotificationType.AD_CAMPAIGN_APPROVED,
            title="Reklam Kampanyanız Onaylandı",
            message=f'"{campaign.name}" kampanyanız onaylandı ve aktif edildi.',
            priority=NotificationPriority.MEDIUM,
        )
    except Exception:
        pass  # Don't fail if notification fails

    return campaign


async def reject_ad_campaign(
    db: AsyncSession,
    campaign_id: str,
    admin_id: str,
    reason: str,
) -> AdCampaign:
    """
    Reklam kampanyasını reddet.
    
    Args:
        db: Database session
        campaign_id: Kampanya ID
        admin_id: Admin ID
        reason: Red sebebi
    
    Returns:
        Reddedilmiş AdCampaign objesi
    
    Raises:
        ValueError: Validation hatası
    """
    # Load campaign
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise ValueError("Campaign not found")

    if campaign.approval_status != ApprovalStatus.PENDING:
        raise ValueError(f"Campaign is not in PENDING status. Current: {campaign.approval_status}")

    # Update approval status
    campaign.approval_status = ApprovalStatus.REJECTED
    campaign.status = CampaignStatus.REJECTED
    campaign.rejection_reason = reason

    # Refund (delete pending TeacherEarning record)
    earning_result = await db.execute(
        select(TeacherEarning).where(
            and_(
                TeacherEarning.ad_campaign_id == campaign_id,
                TeacherEarning.type == EarningType.AD_SPEND,
            )
        )
    )
    pending_earning = earning_result.scalar_one_or_none()
    if pending_earning:
        await db.delete(pending_earning)

    await db.commit()
    await db.refresh(campaign)

    # Send notification to teacher
    try:
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            user_ids=[campaign.teacher_id],
            notification_type=NotificationType.AD_CAMPAIGN_REJECTED,
            title="Reklam Kampanyanız Reddedildi",
            message=f'"{campaign.name}" kampanyanız reddedildi. Sebep: {reason}',
            priority=NotificationPriority.MEDIUM,
        )
    except Exception:
        pass  # Don't fail if notification fails

    return campaign


async def pause_ad_campaign(
    db: AsyncSession,
    campaign_id: str,
    teacher_id: str,
) -> AdCampaign:
    """
    Reklam kampanyasını duraklat.
    
    Args:
        db: Database session
        campaign_id: Kampanya ID
        teacher_id: Teacher ID (author kontrolü için)
    
    Returns:
        Duraklatılmış AdCampaign objesi
    """
    # Load campaign
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise ValueError("Campaign not found")

    if campaign.teacher_id != teacher_id:
        raise ValueError("Not authorized to pause this campaign")

    if campaign.status != CampaignStatus.ACTIVE:
        raise ValueError(f"Cannot pause campaign in {campaign.status} status")

    campaign.status = CampaignStatus.PAUSED
    await db.commit()
    await db.refresh(campaign)

    return campaign


async def resume_ad_campaign(
    db: AsyncSession,
    campaign_id: str,
    teacher_id: str,
) -> AdCampaign:
    """
    Reklam kampanyasını devam ettir.
    
    Args:
        db: Database session
        campaign_id: Kampanya ID
        teacher_id: Teacher ID (author kontrolü için)
    
    Returns:
        Devam eden AdCampaign objesi
    """
    # Load campaign
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise ValueError("Campaign not found")

    if campaign.teacher_id != teacher_id:
        raise ValueError("Not authorized to resume this campaign")

    if campaign.status != CampaignStatus.PAUSED:
        raise ValueError(f"Cannot resume campaign in {campaign.status} status")

    # Check if campaign is still within date range
    now = datetime.utcnow()
    if now > campaign.end_date:
        raise ValueError("Campaign has expired")
    if now < campaign.start_date:
        raise ValueError("Campaign has not started yet")

    campaign.status = CampaignStatus.ACTIVE
    await db.commit()
    await db.refresh(campaign)

    return campaign


async def get_active_campaigns_for_placement(
    db: AsyncSession,
    placement_id: str,
    category_id: str | None = None,
    limit: int = 1,
) -> list[AdCampaign]:
    """
    Placement için aktif kampanyaları getir.
    
    Args:
        db: Database session
        placement_id: Placement ID
        category_id: Kategori ID (targeting için, opsiyonel)
        limit: Maksimum kampanya sayısı
    
    Returns:
        Aktif kampanyalar listesi (priority, created_at sıralı)
    """
    now = datetime.utcnow()

    conditions = [
        AdCampaign.placement_id == placement_id,
        AdCampaign.status == CampaignStatus.ACTIVE,
        AdCampaign.approval_status == ApprovalStatus.APPROVED,
        AdCampaign.start_date <= now,
        AdCampaign.end_date >= now,
        AdCampaign.spent_amount < AdCampaign.total_budget,  # Budget not exhausted
    ]

    # Targeting kontrolü (if category_id provided)
    if category_id and category_id:
        # Check if campaign targets this category
        # This is a simplified check - you may need to adjust based on your targeting logic
        conditions.append(
            or_(
                AdCampaign.is_targeted == False,  # Not targeted = all categories
                AdCampaign.target_categories.contains([category_id]),  # Contains category
            )
        )

    result = await db.execute(
        select(AdCampaign)
        .where(and_(*conditions))
        .order_by(AdCampaign.created_at.desc())  # Priority can be added later
        .limit(limit)
    )
    return list(result.scalars().all())


async def increment_impression(
    db: AsyncSession,
    campaign_id: str,
) -> int:
    """
    Kampanya görüntülenme sayısını artır.
    
    Args:
        db: Database session
        campaign_id: Kampanya ID
    
    Returns:
        Yeni görüntülenme sayısı
    """
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        return 0

    campaign.impressions += 1

    # Update daily analytics
    today = datetime.utcnow().date()
    analytics_result = await db.execute(
        select(AdCampaignAnalytics).where(
            and_(
                AdCampaignAnalytics.campaign_id == campaign_id,
                AdCampaignAnalytics.date == today,
            )
        )
    )
    analytics = analytics_result.scalar_one_or_none()
    if not analytics:
        analytics = AdCampaignAnalytics(
            campaign_id=campaign_id,
            date=today,
            impressions=1,
        )
        db.add(analytics)
    else:
        analytics.impressions += 1

    await db.commit()
    await db.refresh(campaign)

    # Update CTR
    if campaign.impressions > 0:
        campaign.ctr = (Decimal(str(campaign.clicks)) / Decimal(str(campaign.impressions))) * Decimal("100.00")

    await db.commit()

    return campaign.impressions


async def increment_click(
    db: AsyncSession,
    campaign_id: str,
) -> int:
    """
    Kampanya tıklama sayısını artır.
    
    Args:
        db: Database session
        campaign_id: Kampanya ID
    
    Returns:
        Yeni tıklama sayısı
    """
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        return 0

    campaign.clicks += 1

    # Update daily analytics
    today = datetime.utcnow().date()
    analytics_result = await db.execute(
        select(AdCampaignAnalytics).where(
            and_(
                AdCampaignAnalytics.campaign_id == campaign_id,
                AdCampaignAnalytics.date == today,
            )
        )
    )
    analytics = analytics_result.scalar_one_or_none()
    if not analytics:
        analytics = AdCampaignAnalytics(
            campaign_id=campaign_id,
            date=today,
            clicks=1,
        )
        db.add(analytics)
    else:
        analytics.clicks += 1

    await db.commit()
    await db.refresh(campaign)

    # Update CTR
    if campaign.impressions > 0:
        campaign.ctr = (Decimal(str(campaign.clicks)) / Decimal(str(campaign.impressions))) * Decimal("100.00")

    await db.commit()

    return campaign.clicks


async def increment_conversion(
    db: AsyncSession,
    campaign_id: str,
) -> int:
    """
    Kampanya dönüşüm sayısını artır.
    
    Args:
        db: Database session
        campaign_id: Kampanya ID
    
    Returns:
        Yeni dönüşüm sayısı
    """
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        return 0

    campaign.conversions += 1

    # Update daily analytics
    today = datetime.utcnow().date()
    analytics_result = await db.execute(
        select(AdCampaignAnalytics).where(
            and_(
                AdCampaignAnalytics.campaign_id == campaign_id,
                AdCampaignAnalytics.date == today,
            )
        )
    )
    analytics = analytics_result.scalar_one_or_none()
    if not analytics:
        analytics = AdCampaignAnalytics(
            campaign_id=campaign_id,
            date=today,
            conversions=1,
        )
        db.add(analytics)
    else:
        analytics.conversions += 1

    await db.commit()
    await db.refresh(campaign)

    return campaign.conversions


async def update_campaign_analytics(
    db: AsyncSession,
    campaign_id: str,
) -> AdCampaign:
    """
    Kampanya analitiklerini güncelle (CTR, conversion rate, CPC, CPM).
    
    Args:
        db: Database session
        campaign_id: Kampanya ID
    
    Returns:
        Güncellenmiş AdCampaign objesi
    """
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise ValueError("Campaign not found")

    # Calculate CTR
    if campaign.impressions > 0:
        campaign.ctr = (Decimal(str(campaign.clicks)) / Decimal(str(campaign.impressions))) * Decimal("100.00")
    else:
        campaign.ctr = Decimal("0.00")

    # Calculate conversion rate
    if campaign.clicks > 0:
        conversion_rate = (Decimal(str(campaign.conversions)) / Decimal(str(campaign.clicks))) * Decimal("100.00")
    else:
        conversion_rate = Decimal("0.00")

    # Calculate CPC (Cost Per Click)
    if campaign.clicks > 0 and campaign.spent_amount > 0:
        cpc = campaign.spent_amount / Decimal(str(campaign.clicks))
    else:
        cpc = Decimal("0.00")

    # Calculate CPM (Cost Per Mille - 1000 impressions)
    if campaign.impressions > 0 and campaign.spent_amount > 0:
        cpm = (campaign.spent_amount / Decimal(str(campaign.impressions))) * Decimal("1000.00")
    else:
        cpm = Decimal("0.00")

    # Update daily analytics records
    analytics_result = await db.execute(
        select(AdCampaignAnalytics).where(AdCampaignAnalytics.campaign_id == campaign_id)
    )
    analytics_list = analytics_result.scalars().all()

    for analytics in analytics_list:
        # Update CTR
        if analytics.impressions > 0:
            analytics.ctr = (Decimal(str(analytics.clicks)) / Decimal(str(analytics.impressions))) * Decimal("100.00")
        else:
            analytics.ctr = Decimal("0.00")

        # Update conversion rate
        if analytics.clicks > 0:
            analytics.conversion_rate = (Decimal(str(analytics.conversions)) / Decimal(str(analytics.clicks))) * Decimal("100.00")
        else:
            analytics.conversion_rate = Decimal("0.00")

        # Update CPC
        if analytics.clicks > 0 and analytics.spent_amount > 0:
            analytics.cpc = analytics.spent_amount / Decimal(str(analytics.clicks))
        else:
            analytics.cpc = Decimal("0.00")

        # Update CPM
        if analytics.impressions > 0 and analytics.spent_amount > 0:
            analytics.cpm = (analytics.spent_amount / Decimal(str(analytics.impressions))) * Decimal("1000.00")
        else:
            analytics.cpm = Decimal("0.00")

    await db.commit()
    await db.refresh(campaign)

    return campaign


async def check_and_complete_campaigns(
    db: AsyncSession,
) -> list[AdCampaign]:
    """
    Scheduled job: end_date geçen kampanyaları COMPLETED yap.
    Bütçe biten kampanyaları PAUSED yap.
    
    Returns:
        Güncellenmiş kampanyalar listesi
    """
    now = datetime.utcnow()

    # Find expired campaigns
    expired_result = await db.execute(
        select(AdCampaign).where(
            and_(
                AdCampaign.status == CampaignStatus.ACTIVE,
                AdCampaign.end_date < now,
            )
        )
    )
    expired_campaigns = list(expired_result.scalars().all())

    for campaign in expired_campaigns:
        campaign.status = CampaignStatus.COMPLETED

    # Find over-budget campaigns
    over_budget_result = await db.execute(
        select(AdCampaign).where(
            and_(
                AdCampaign.status == CampaignStatus.ACTIVE,
                AdCampaign.spent_amount >= AdCampaign.total_budget,
            )
        )
    )
    over_budget_campaigns = list(over_budget_result.scalars().all())

    for campaign in over_budget_campaigns:
        campaign.status = CampaignStatus.PAUSED

    if expired_campaigns or over_budget_campaigns:
        await db.commit()

    return expired_campaigns + over_budget_campaigns


async def check_and_activate_campaigns(
    db: AsyncSession,
) -> list[AdCampaign]:
    """
    Scheduled job: start_date gelen kampanyaları ACTIVE yap.
    
    Returns:
        Aktif edilen kampanyalar listesi
    """
    now = datetime.utcnow()

    # Find campaigns that should be activated
    result = await db.execute(
        select(AdCampaign).where(
            and_(
                AdCampaign.approval_status == ApprovalStatus.APPROVED,
                AdCampaign.status == CampaignStatus.PENDING_APPROVAL,
                AdCampaign.start_date <= now,
                AdCampaign.end_date >= now,
            )
        )
    )
    campaigns = list(result.scalars().all())

    for campaign in campaigns:
        campaign.status = CampaignStatus.ACTIVE

    if campaigns:
        await db.commit()

    return campaigns
