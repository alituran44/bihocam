from typing import Optional
from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.teacher_earning import TeacherEarning, EarningType
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.teacher_earning import (
    TeacherEarningResponse,
    TeacherEarningSummary,
    TeacherSaleItem,
    TeacherSalesSummary,
    BalanceAdjustmentCreate,
)


router = APIRouter()


def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    """Sadece öğretmen erişebilir"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için öğretmen yetkisi gerekli"
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Sadece admin erişebilir"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    return current_user


@router.get("/me/earnings", response_model=list[TeacherEarningResponse])
async def list_my_earnings(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    type_filter: Optional[EarningType] = Query(None, description="Tip filtresi"),
    from_date: Optional[datetime] = Query(None, description="Başlangıç tarihi"),
    to_date: Optional[datetime] = Query(None, description="Bitiş tarihi"),
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen kazanç hareketlerini listeler"""
    query = select(TeacherEarning).where(TeacherEarning.teacher_id == current_user.id)
    
    if type_filter:
        query = query.where(TeacherEarning.type == type_filter)
    if from_date:
        query = query.where(TeacherEarning.created_at >= from_date)
    if to_date:
        query = query.where(TeacherEarning.created_at <= to_date)
    
    query = query.order_by(TeacherEarning.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    earnings = result.scalars().all()
    
    return [TeacherEarningResponse.model_validate(e) for e in earnings]


@router.get("/me/sales", response_model=list[TeacherSaleItem])
async def list_my_sales(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(TeacherEarning, Order, OrderItem, User)
        .join(Order, TeacherEarning.order_id == Order.id)
        .join(OrderItem, and_(OrderItem.order_id == Order.id, OrderItem.course_id == TeacherEarning.course_id))
        .options(selectinload(OrderItem.course))  # Eager load Course relationship
        .join(User, User.id == Order.user_id)
        .where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.EARNING,
        )
    )

    if from_date:
        query = query.where(TeacherEarning.created_at >= from_date)
    if to_date:
        query = query.where(TeacherEarning.created_at <= to_date)

    query = query.order_by(TeacherEarning.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    return [
        TeacherSaleItem(
            order_id=str(order.id),
            order_number=order.order_number,
            created_at=earning.created_at,
            course_id=str(order_item.course_id),
            course_title=order_item.course.title if order_item.course else "Kurs",
            student_id=str(student.id),
            student_name=student.full_name,
            student_email=student.email,
            gross_amount=order_item.final_price,
            commission_amount=order_item.platform_commission,
            net_earning=earning.amount,
            status=order.status.value if hasattr(order.status, "value") else str(order.status),
        )
        for earning, order, order_item, student in rows
    ]


@router.get("/me/sales/summary", response_model=TeacherSalesSummary)
async def get_my_sales_summary(
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    total_sales_count_result = await db.execute(
        select(func.count(TeacherEarning.id)).where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.EARNING,
        )
    )
    total_sales_count = int(total_sales_count_result.scalar() or 0)

    total_revenue_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0)).where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.EARNING,
        )
    )
    total_revenue = Decimal(str(total_revenue_result.scalar() or 0))

    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month_revenue_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0)).where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.EARNING,
            TeacherEarning.created_at >= month_start,
        )
    )
    this_month_revenue = Decimal(str(this_month_revenue_result.scalar() or 0))

    average_order_amount = (
        (total_revenue / Decimal(total_sales_count)) if total_sales_count > 0 else Decimal("0")
    )

    return TeacherSalesSummary(
        total_sales_count=total_sales_count,
        total_revenue=total_revenue,
        this_month_revenue=this_month_revenue,
        average_order_amount=average_order_amount,
        currency="TRY",
    )


@router.get("/me/earnings/summary", response_model=TeacherEarningSummary)
async def get_my_earnings_summary(
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen kazanç özetini görüntüler"""
    # Toplam kazanç (EARNING tipindeki pozitif tutarlar)
    earnings_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0))
        .where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.EARNING
        )
    )
    total_earnings = Decimal(str(earnings_result.scalar() or 0))
    
    # Toplam çekim (WITHDRAWAL tipindeki negatif tutarlar - mutlak değer)
    withdrawals_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(TeacherEarning.amount)), 0))
        .where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.WITHDRAWAL
        )
    )
    total_withdrawals = Decimal(str(withdrawals_result.scalar() or 0))
    
    # Toplam düzeltme (ADJUSTMENT)
    adjustments_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0))
        .where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.ADJUSTMENT
        )
    )
    total_adjustments = Decimal(str(adjustments_result.scalar() or 0))
    
    # Toplam reklam harcaması (AD_SPEND tipindeki negatif tutarlar - onaylanmış)
    ad_spend_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(TeacherEarning.amount)), 0))
        .where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.AD_SPEND
        )
    )
    total_ad_spend = Decimal(str(ad_spend_result.scalar() or 0))
    
    # Bekleyen çekim talepleri
    from app.models.withdrawal_request import WithdrawalRequest, WithdrawalStatus
    pending_result = await db.execute(
        select(func.coalesce(func.sum(WithdrawalRequest.amount), 0))
        .where(
            WithdrawalRequest.teacher_id == current_user.id,
            WithdrawalRequest.status.in_([WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED])
        )
    )
    pending_withdrawals = Decimal(str(pending_result.scalar() or 0))
    
    # Bekleyen reklam harcamaları (PENDING_APPROVAL durumundaki kampanyalar)
    from app.models.ad_campaign import AdCampaign, ApprovalStatus, PaymentStatus
    pending_ads_result = await db.execute(
        select(func.coalesce(func.sum(AdCampaign.total_budget), 0))
        .where(
            and_(
                AdCampaign.teacher_id == current_user.id,
                AdCampaign.approval_status == ApprovalStatus.PENDING,
                AdCampaign.payment_status == PaymentStatus.PENDING,
            )
        )
    )
    pending_ads = Decimal(str(pending_ads_result.scalar() or 0))
    
    pending_amounts = pending_withdrawals + pending_ads
    # ADJUSTMENT'lar pozitif veya negatif olabilir, bu yüzden direkt toplam kazançlara eklenmeli
    available_balance = total_earnings + total_adjustments - total_withdrawals - total_ad_spend - pending_amounts
    
    return TeacherEarningSummary(
        total_earnings=total_earnings,
        total_withdrawals=total_withdrawals,
        total_adjustments=total_adjustments,
        available_balance=available_balance,
        pending_withdrawals=pending_withdrawals,
        currency="TRY",
    )


# ========== ADMIN ENDPOINTS ==========

@router.get("/admin/teachers/{teacher_id}/earnings", response_model=list[TeacherEarningResponse])
async def list_teacher_earnings_admin(
    teacher_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    type_filter: Optional[EarningType] = Query(None, description="Tip filtresi"),
    from_date: Optional[datetime] = Query(None, description="Başlangıç tarihi"),
    to_date: Optional[datetime] = Query(None, description="Bitiş tarihi"),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin belirli bir öğretmenin kazanç hareketlerini listeler"""
    # Öğretmenin var olduğunu kontrol et
    from app.models.user import User as UserModel
    teacher_result = await db.execute(
        select(UserModel).where(UserModel.id == teacher_id, UserModel.role == UserRole.TEACHER)
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Öğretmen bulunamadı")
    
    query = select(TeacherEarning).where(TeacherEarning.teacher_id == teacher_id)
    
    if type_filter:
        query = query.where(TeacherEarning.type == type_filter)
    if from_date:
        query = query.where(TeacherEarning.created_at >= from_date)
    if to_date:
        query = query.where(TeacherEarning.created_at <= to_date)
    
    query = query.order_by(TeacherEarning.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    earnings = result.scalars().all()
    
    return [TeacherEarningResponse.model_validate(e) for e in earnings]


@router.get("/admin/teachers/{teacher_id}/earnings/summary", response_model=TeacherEarningSummary)
async def get_teacher_earnings_summary_admin(
    teacher_id: str,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin belirli bir öğretmenin kazanç özetini görüntüler"""
    # Öğretmenin var olduğunu kontrol et
    from app.models.user import User as UserModel
    teacher_result = await db.execute(
        select(UserModel).where(UserModel.id == teacher_id, UserModel.role == UserRole.TEACHER)
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Öğretmen bulunamadı")
    
    # Toplam kazanç (EARNING tipindeki pozitif tutarlar)
    earnings_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0))
        .where(
            TeacherEarning.teacher_id == teacher_id,
            TeacherEarning.type == EarningType.EARNING
        )
    )
    total_earnings = Decimal(str(earnings_result.scalar() or 0))
    
    # Toplam çekim (WITHDRAWAL tipindeki negatif tutarlar - mutlak değer)
    withdrawals_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(TeacherEarning.amount)), 0))
        .where(
            TeacherEarning.teacher_id == teacher_id,
            TeacherEarning.type == EarningType.WITHDRAWAL
        )
    )
    total_withdrawals = Decimal(str(withdrawals_result.scalar() or 0))
    
    # Toplam düzeltme (ADJUSTMENT)
    adjustments_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0))
        .where(
            TeacherEarning.teacher_id == teacher_id,
            TeacherEarning.type == EarningType.ADJUSTMENT
        )
    )
    total_adjustments = Decimal(str(adjustments_result.scalar() or 0))
    
    # Toplam reklam harcaması (AD_SPEND tipindeki negatif tutarlar - onaylanmış)
    ad_spend_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(TeacherEarning.amount)), 0))
        .where(
            TeacherEarning.teacher_id == teacher_id,
            TeacherEarning.type == EarningType.AD_SPEND
        )
    )
    total_ad_spend = Decimal(str(ad_spend_result.scalar() or 0))
    
    # Bekleyen çekim talepleri
    from app.models.withdrawal_request import WithdrawalRequest, WithdrawalStatus
    pending_result = await db.execute(
        select(func.coalesce(func.sum(WithdrawalRequest.amount), 0))
        .where(
            WithdrawalRequest.teacher_id == teacher_id,
            WithdrawalRequest.status.in_([WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED])
        )
    )
    pending_withdrawals = Decimal(str(pending_result.scalar() or 0))
    
    # Bekleyen reklam harcamaları (PENDING_APPROVAL durumundaki kampanyalar)
    from app.models.ad_campaign import AdCampaign, ApprovalStatus, PaymentStatus
    pending_ads_result = await db.execute(
        select(func.coalesce(func.sum(AdCampaign.total_budget), 0))
        .where(
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
    
    return TeacherEarningSummary(
        total_earnings=total_earnings,
        total_withdrawals=total_withdrawals,
        total_adjustments=total_adjustments,
        available_balance=available_balance,
        pending_withdrawals=pending_withdrawals,
        currency="TRY",
    )


@router.post("/admin/users/{user_id}/balance/adjust", response_model=TeacherEarningResponse, status_code=status.HTTP_201_CREATED)
async def adjust_user_balance(
    user_id: str,
    adjustment: BalanceAdjustmentCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin kullanıcı bakiyesini düzeltir (ekler veya çıkarır)"""
    from app.models.user import User as UserModel
    from uuid import uuid4
    
    # Kullanıcının var olduğunu kontrol et
    user_result = await db.execute(
        select(UserModel).where(UserModel.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Sadece öğretmenler için bakiye düzeltmesi yapılabilir
    if user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bakiye düzeltmesi sadece öğretmenler için yapılabilir"
        )
    
    # TeacherEarning kaydı oluştur (ADJUSTMENT tipinde)
    earning = TeacherEarning(
        id=str(uuid4()),
        teacher_id=user_id,
        amount=adjustment.amount,
        currency=adjustment.currency,
        type=EarningType.ADJUSTMENT,
        description=f"Admin düzeltmesi: {adjustment.description} (Admin: {current_user.full_name})",
    )
    
    db.add(earning)
    await db.commit()
    await db.refresh(earning)
    
    return TeacherEarningResponse.model_validate(earning)
