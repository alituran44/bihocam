from typing import Optional
from datetime import datetime
from decimal import Decimal
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.api.v1.endpoints.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.teacher_bank_account import TeacherBankAccount, BankAccountStatus
from app.models.teacher_earning import TeacherEarning, EarningType
from app.models.withdrawal_request import WithdrawalRequest, WithdrawalStatus
from app.schemas.withdrawal_request import (
    WithdrawalRequestCreate,
    WithdrawalRequestResponse,
    WithdrawalApprovalRequest,
    WithdrawalRejectionRequest,
)
from app.schemas.teacher_earning import TeacherEarningSummary
from app.services.notification_service import NotificationService
from app.models.notification import NotificationType, NotificationPriority


router = APIRouter()
admin_router = APIRouter()


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
            detail="Admin yetkisi gerekli"
        )
    return current_user


async def calculate_teacher_balance(teacher_id: str, db: AsyncSession) -> tuple[Decimal, Decimal]:
    """Öğretmenin toplam kazancını ve çekimlerini hesapla"""
    # Toplam kazanç (EARNING tipindeki pozitif tutarlar)
    earnings_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0))
        .where(
            TeacherEarning.teacher_id == teacher_id,
            TeacherEarning.type == EarningType.EARNING
        )
    )
    total_earnings = Decimal(str(earnings_result.scalar() or 0))
    
    # Toplam çekim (WITHDRAWAL tipindeki negatif tutarlar)
    withdrawals_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(TeacherEarning.amount)), 0))
        .where(
            TeacherEarning.teacher_id == teacher_id,
            TeacherEarning.type == EarningType.WITHDRAWAL
        )
    )
    total_withdrawals = Decimal(str(withdrawals_result.scalar() or 0))
    
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
    available_balance = total_earnings - total_withdrawals - total_ad_spend - pending_amounts
    
    return available_balance, pending_amounts


@router.get("/me/withdrawals", response_model=list[WithdrawalRequestResponse])
async def list_my_withdrawals(
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen kendi çekim taleplerini listeler"""
    result = await db.execute(
        select(WithdrawalRequest)
        .where(WithdrawalRequest.teacher_id == current_user.id)
        .order_by(WithdrawalRequest.requested_at.desc())
    )
    withdrawals = result.scalars().all()
    
    # Banka hesabı bilgilerini eager load et
    for w in withdrawals:
        bank_result = await db.execute(
            select(TeacherBankAccount).where(TeacherBankAccount.id == w.bank_account_id)
        )
        bank_account = bank_result.scalar_one_or_none()
        w.bank_account_info = {
            "bank_name": bank_account.bank_name if bank_account else "Bilinmiyor",
            "iban_masked": f"**** {bank_account.iban[-4:]}" if bank_account else "****",
        } if bank_account else None
    
    return [WithdrawalRequestResponse.model_validate(w) for w in withdrawals]


@router.delete("/me/withdrawals/{withdrawal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_withdrawal(
    withdrawal_id: str,
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen PENDING durumundaki çekim talebini iptal eder"""
    result = await db.execute(
        select(WithdrawalRequest).where(
            WithdrawalRequest.id == withdrawal_id,
            WithdrawalRequest.teacher_id == current_user.id
        )
    )
    withdrawal = result.scalar_one_or_none()
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Çekim talebi bulunamadı")
    
    if withdrawal.status != WithdrawalStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bu talep {withdrawal.status.value} durumunda, sadece PENDING talepler iptal edilebilir"
        )
    
    # WITHDRAWAL earning kaydını geri al (pozitif tutar ekle)
    earning = TeacherEarning(
        teacher_id=withdrawal.teacher_id,
        amount=withdrawal.amount,  # Pozitif tutar (geri ekleme)
        currency=withdrawal.currency,
        type=EarningType.ADJUSTMENT,
        description=f"Çekim talebi iptal edildi - geri ekleme: {withdrawal.amount:.2f} TL",
        withdrawal_request_id=withdrawal.id,
    )
    db.add(earning)
    
    # Çekim talebini sil
    await db.delete(withdrawal)
    
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Çekim talebi iptal edilirken bir hata oluştu: {str(e)}"
        )


@router.post("/me/withdrawals", response_model=WithdrawalRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_withdrawal_request(
    withdrawal_data: WithdrawalRequestCreate,
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen yeni çekim talebi oluşturur"""
    # Öğretmen aktif ve doğrulanmış mı?
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deaktif hesap için çekim talebi oluşturulamaz"
        )
    
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email doğrulanmamış hesap için çekim talebi oluşturulamaz"
        )
    
    # Banka hesabı kontrolü
    existing_active_result = await db.execute(
        select(WithdrawalRequest).where(
            WithdrawalRequest.teacher_id == current_user.id,
            WithdrawalRequest.status.in_([WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED]),
        )
    )
    if existing_active_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bekleyen/onayli bir cekim talebiniz zaten var. Once mevcut talebin tamamlanmasini bekleyin.",
        )

    bank_result = await db.execute(
        select(TeacherBankAccount).where(
            TeacherBankAccount.id == withdrawal_data.bank_account_id,
            TeacherBankAccount.teacher_id == current_user.id
        )
    )
    bank_account = bank_result.scalar_one_or_none()
    if not bank_account:
        raise HTTPException(status_code=404, detail="Banka hesabı bulunamadı")
    
    if bank_account.status != BankAccountStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sadece onaylanmış banka hesapları için çekim talebi oluşturulabilir"
        )
    
    # Minimum tutar kontrolü (500 TL)
    MIN_WITHDRAWAL_AMOUNT = Decimal("500.00")
    if withdrawal_data.amount < MIN_WITHDRAWAL_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum çekim tutarı {MIN_WITHDRAWAL_AMOUNT} TL'dir"
        )
    
    # Bakiye kontrolü
    available_balance, pending_withdrawals = await calculate_teacher_balance(current_user.id, db)
    
    if withdrawal_data.amount > available_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Yetersiz bakiye. Çekilebilir bakiye: {available_balance:.2f} TL"
        )
    
    # Yeni çekim talebi oluştur
    new_withdrawal = WithdrawalRequest(
        teacher_id=current_user.id,
        bank_account_id=withdrawal_data.bank_account_id,
        amount=withdrawal_data.amount,
        currency="TRY",
        status=WithdrawalStatus.PENDING,
    )
    
    db.add(new_withdrawal)
    
    # WITHDRAWAL tipinde earning kaydı oluştur (negatif)
    earning = TeacherEarning(
        teacher_id=current_user.id,
        amount=-withdrawal_data.amount,  # Negatif tutar
        currency="TRY",
        type=EarningType.WITHDRAWAL,
        description=f"Çekim talebi: {withdrawal_data.amount:.2f} TL",
        withdrawal_request_id=new_withdrawal.id,
    )
    db.add(earning)
    
    try:
        await db.commit()
        await db.refresh(new_withdrawal)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Çekim talebi oluşturulurken bir hata oluştu: {str(e)}"
        )
    
    # Notification gönder
    try:
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            user_ids=[current_user.id],
            notification_type=NotificationType.WITHDRAWAL_REQUEST_CREATED,
            title="Çekim Talebi Oluşturuldu",
            message=f"{withdrawal_data.amount:.2f} TL tutarında çekim talebiniz oluşturuldu. Onay bekleniyor.",
            action_url="/dashboard/teacher/withdrawals",
            action_label="Talepleri Görüntüle",
            priority=NotificationPriority.MEDIUM,
            delivery_channels=["in_app"],
        )
        await db.flush()
    except Exception as e:
        # Notification hatası kritik değil
        print(f"Warning: Withdrawal notification failed: {str(e)}")
    
    # Banka hesabı bilgisini ekle
    new_withdrawal.bank_account_info = {
        "bank_name": bank_account.bank_name,
        "iban_masked": f"**** {bank_account.iban[-4:]}",
    }
    
    return WithdrawalRequestResponse.model_validate(new_withdrawal)


@router.get("/me/balance", response_model=TeacherEarningSummary)
async def get_my_balance(
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen kazanç özetini görüntüler"""
    # Toplam kazanç
    earnings_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0))
        .where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.EARNING
        )
    )
    total_earnings = Decimal(str(earnings_result.scalar() or 0))
    
    # Toplam çekim
    withdrawals_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(TeacherEarning.amount)), 0))
        .where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.WITHDRAWAL
        )
    )
    total_withdrawals = Decimal(str(withdrawals_result.scalar() or 0))
    
    # Toplam düzeltme
    adjustments_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0))
        .where(
            TeacherEarning.teacher_id == current_user.id,
            TeacherEarning.type == EarningType.ADJUSTMENT
        )
    )
    total_adjustments = Decimal(str(adjustments_result.scalar() or 0))
    
    # Bekleyen çekim talepleri
    pending_result = await db.execute(
        select(func.coalesce(func.sum(WithdrawalRequest.amount), 0))
        .where(
            WithdrawalRequest.teacher_id == current_user.id,
            WithdrawalRequest.status.in_([WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED])
        )
    )
    pending_withdrawals = Decimal(str(pending_result.scalar() or 0))
    
    available_balance = total_earnings - total_withdrawals - pending_withdrawals
    
    return TeacherEarningSummary(
        total_earnings=total_earnings,
        total_withdrawals=total_withdrawals,
        total_adjustments=total_adjustments,
        available_balance=available_balance,
        pending_withdrawals=pending_withdrawals,
        currency="TRY",
    )


# ========== ADMIN ENDPOINTS ==========

@admin_router.get("/withdrawals", response_model=list[WithdrawalRequestResponse])
async def list_all_withdrawals_admin(
    status_filter: Optional[WithdrawalStatus] = Query(None, description="Status filtresi"),
    teacher_id: Optional[str] = Query(None, description="Öğretmen ID filtresi"),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin tüm çekim taleplerini listeler"""
    query = select(WithdrawalRequest)
    conditions = []
    
    if status_filter:
        conditions.append(WithdrawalRequest.status == status_filter)
    if teacher_id:
        conditions.append(WithdrawalRequest.teacher_id == teacher_id)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.order_by(WithdrawalRequest.requested_at.desc())
    
    result = await db.execute(query)
    withdrawals = result.scalars().all()
    
    # Banka hesabı bilgilerini ekle
    for w in withdrawals:
        bank_result = await db.execute(
            select(TeacherBankAccount).where(TeacherBankAccount.id == w.bank_account_id)
        )
        bank_account = bank_result.scalar_one_or_none()
        w.bank_account_info = {
            "bank_name": bank_account.bank_name if bank_account else "Bilinmiyor",
            "iban": bank_account.iban if bank_account else "****",  # Admin için tam IBAN
        } if bank_account else None
    
    return [WithdrawalRequestResponse.model_validate(w) for w in withdrawals]


@admin_router.post("/withdrawals/{withdrawal_id}/approve", response_model=WithdrawalRequestResponse)
async def approve_withdrawal(
    withdrawal_id: str,
    approval_data: Optional[WithdrawalApprovalRequest] = None,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin çekim talebini onaylar"""
    # P1-07: FOR UPDATE ile row lock — concurrent approval race condition önlenir
    result = await db.execute(
        select(WithdrawalRequest)
        .where(WithdrawalRequest.id == withdrawal_id)
        .with_for_update()
    )
    withdrawal = result.scalar_one_or_none()
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Çekim talebi bulunamadı")
    
    if withdrawal.status != WithdrawalStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bu talep {withdrawal.status.value} durumunda, sadece PENDING talepler onaylanabilir"
        )
    
    withdrawal.status = WithdrawalStatus.APPROVED
    withdrawal.processed_at = datetime.utcnow()
    if approval_data and approval_data.admin_note:
        withdrawal.admin_note = approval_data.admin_note
    
    try:
        await db.commit()
        await db.refresh(withdrawal)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Çekim talebi onaylanırken bir hata oluştu: {str(e)}"
        )
    
    # Notification gönder
    try:
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            user_ids=[withdrawal.teacher_id],
            notification_type=NotificationType.WITHDRAWAL_APPROVED,
            title="Çekim Talebiniz Onaylandı",
            message=f"{withdrawal.amount:.2f} TL tutarında çekim talebiniz onaylandı. Ödeme hazırlanıyor.",
            action_url="/dashboard/teacher/withdrawals",
            action_label="Talepleri Görüntüle",
            priority=NotificationPriority.MEDIUM,
            delivery_channels=["in_app", "email"],
        )
        await db.flush()
    except Exception as e:
        print(f"Warning: Withdrawal approval notification failed: {str(e)}")
    
    # Banka hesabı bilgisini ekle
    bank_result = await db.execute(
        select(TeacherBankAccount).where(TeacherBankAccount.id == withdrawal.bank_account_id)
    )
    bank_account = bank_result.scalar_one_or_none()
    withdrawal.bank_account_info = {
        "bank_name": bank_account.bank_name if bank_account else "Bilinmiyor",
        "iban": bank_account.iban if bank_account else "****",
    } if bank_account else None
    
    return WithdrawalRequestResponse.model_validate(withdrawal)


@admin_router.post("/withdrawals/{withdrawal_id}/mark-paid", response_model=WithdrawalRequestResponse)
async def mark_withdrawal_paid(
    withdrawal_id: str,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin çekim talebini ödendi olarak işaretler"""
    result = await db.execute(
        select(WithdrawalRequest)
        .where(WithdrawalRequest.id == withdrawal_id)
        .with_for_update()
    )
    withdrawal = result.scalar_one_or_none()
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Çekim talebi bulunamadı")

    if withdrawal.status != WithdrawalStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bu talep {withdrawal.status.value} durumunda, sadece APPROVED talepler ödendi olarak işaretlenebilir"
        )
    
    # PayTR Platform Transfer API ile öğretmene ödeme
    bank_result = await db.execute(
        select(TeacherBankAccount).where(TeacherBankAccount.id == withdrawal.bank_account_id)
    )
    bank_account = bank_result.scalar_one_or_none()
    if not bank_account:
        raise HTTPException(status_code=400, detail="Banka hesabı bulunamadı")

    from app.core.paytr import create_platform_transfer, _amount_to_int
    from app.core.config import settings
    from app.models.order import Order, OrderStatus

    # PAYTR_MERCHANT_ID yapılandırılmışsa PayTR Transfer API'sini çağır
    if settings.PAYTR_MERCHANT_ID and bank_account.iban:
        clean_id = withdrawal.id.replace("-", "").replace("_", "")
        trans_id = f"wd{clean_id[:20]}"
        submerchant_amount = _amount_to_int(withdrawal.amount)
        total_amount = submerchant_amount

        # Öğretmenin kazancına ait gerçek ödenmiş bir sipariş varsa merchant_oid olarak kullan
        order_res = await db.execute(
            select(Order.order_number)
            .join(TeacherEarning, TeacherEarning.order_id == Order.id)
            .where(TeacherEarning.teacher_id == withdrawal.teacher_id, Order.status == OrderStatus.PAID)
            .order_by(TeacherEarning.created_at.desc())
            .limit(1)
        )
        matched_order_number = order_res.scalar_one_or_none()
        merchant_oid = matched_order_number or f"wd{clean_id[:20]}"

        # Öğretmen adı: User tablosundan
        teacher_result = await db.execute(
            select(User).where(User.id == withdrawal.teacher_id)
        )
        teacher = teacher_result.scalar_one_or_none()
        transfer_name = teacher.full_name if teacher else "Öğretmen"

        transfer_result = await create_platform_transfer(
            merchant_oid=merchant_oid,
            trans_id=trans_id,
            submerchant_amount=submerchant_amount,
            total_amount=total_amount,
            transfer_name=transfer_name,
            transfer_iban=bank_account.iban.replace(" ", "").strip(),
        )

        if transfer_result.get("status") != "success":
            err_msg = transfer_result.get("err_msg", "Bilinmeyen hata")
            logger.warning(f"PayTR Platform Transfer not completed: {transfer_result}")
            if settings.PAYTR_TEST_MODE == 1:
                withdrawal.notes = f"[TEST MODU] PayTR Transfer: {err_msg}"
            else:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"PayTR transfer hatası: {err_msg}"
                )

    withdrawal.status = WithdrawalStatus.PAID
    withdrawal.paid_at = datetime.utcnow()

    try:
        await db.commit()
        await db.refresh(withdrawal)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Çekim talebi güncellenirken bir hata oluştu: {str(e)}"
        )

    # Notification gönder
    try:
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            user_ids=[withdrawal.teacher_id],
            notification_type=NotificationType.WITHDRAWAL_PAID,
            title="Çekim Talebiniz Ödendi",
            message=f"{withdrawal.amount:.2f} TL tutarında çekim talebiniz ödendi. Para hesabınıza geçmiştir.",
            action_url="/dashboard/teacher/withdrawals",
            action_label="Talepleri Görüntüle",
            priority=NotificationPriority.HIGH,
            delivery_channels=["in_app", "email"],
        )
        await db.flush()
    except Exception as e:
        print(f"Warning: Withdrawal paid notification failed: {str(e)}")
    
    # Banka hesabı bilgisini ekle
    bank_result = await db.execute(
        select(TeacherBankAccount).where(TeacherBankAccount.id == withdrawal.bank_account_id)
    )
    bank_account = bank_result.scalar_one_or_none()
    withdrawal.bank_account_info = {
        "bank_name": bank_account.bank_name if bank_account else "Bilinmiyor",
        "iban": bank_account.iban if bank_account else "****",
    } if bank_account else None
    
    return WithdrawalRequestResponse.model_validate(withdrawal)


@admin_router.post("/withdrawals/{withdrawal_id}/reject", response_model=WithdrawalRequestResponse)
async def reject_withdrawal(
    withdrawal_id: str,
    rejection_data: WithdrawalRejectionRequest,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin çekim talebini reddeder (admin_note zorunlu)"""
    result = await db.execute(
        select(WithdrawalRequest)
        .where(WithdrawalRequest.id == withdrawal_id)
        .with_for_update()
    )
    withdrawal = result.scalar_one_or_none()
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Çekim talebi bulunamadı")

    if withdrawal.status not in [WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bu talep {withdrawal.status.value} durumunda, sadece PENDING veya APPROVED talepler reddedilebilir"
        )
    
    withdrawal.status = WithdrawalStatus.REJECTED
    withdrawal.processed_at = datetime.utcnow()
    withdrawal.admin_note = rejection_data.admin_note
    
    # WITHDRAWAL earning kaydını geri al (pozitif tutar ekle)
    earning = TeacherEarning(
        teacher_id=withdrawal.teacher_id,
        amount=withdrawal.amount,  # Pozitif tutar (geri ekleme)
        currency=withdrawal.currency,
        type=EarningType.ADJUSTMENT,
        description=f"Çekim talebi reddedildi - geri ekleme: {withdrawal.amount:.2f} TL",
        withdrawal_request_id=withdrawal.id,
    )
    db.add(earning)
    
    try:
        await db.commit()
        await db.refresh(withdrawal)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Çekim talebi reddedilirken bir hata oluştu: {str(e)}"
        )
    
    # Notification gönder
    try:
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            user_ids=[withdrawal.teacher_id],
            notification_type=NotificationType.WITHDRAWAL_REJECTED,
            title="Çekim Talebiniz Reddedildi",
            message=f"{withdrawal.amount:.2f} TL tutarında çekim talebiniz reddedildi. Sebep: {rejection_data.admin_note}",
            action_url="/dashboard/teacher/withdrawals",
            action_label="Talepleri Görüntüle",
            priority=NotificationPriority.HIGH,
            delivery_channels=["in_app", "email"],
        )
        await db.flush()
    except Exception as e:
        print(f"Warning: Withdrawal rejection notification failed: {str(e)}")
    
    # Banka hesabı bilgisini ekle
    bank_result = await db.execute(
        select(TeacherBankAccount).where(TeacherBankAccount.id == withdrawal.bank_account_id)
    )
    bank_account = bank_result.scalar_one_or_none()
    withdrawal.bank_account_info = {
        "bank_name": bank_account.bank_name if bank_account else "Bilinmiyor",
        "iban": bank_account.iban if bank_account else "****",
    } if bank_account else None
    
    return WithdrawalRequestResponse.model_validate(withdrawal)
