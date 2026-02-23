from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.teacher_bank_account import TeacherBankAccount, BankAccountStatus
from app.schemas.teacher_bank_account import (
    BankAccountCreate,
    BankAccountUpdate,
    BankAccountResponse,
    BankAccountAdminResponse,
)
from app.services.notification_service import NotificationService
from app.models.notification import NotificationType, NotificationPriority


router = APIRouter()
admin_router = APIRouter()


def get_notification_service(db: AsyncSession = Depends(get_db)) -> NotificationService:
    return NotificationService(db)


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


def mask_iban(iban: str) -> str:
    """IBAN'ı maskele - sadece son 4 hane görünür"""
    if len(iban) < 4:
        return "****"
    return f"{iban[:2]} **** **** **** {iban[-4:]}"


@router.get("/me/bank-accounts", response_model=list[BankAccountResponse])
async def list_my_bank_accounts(
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen kendi banka hesaplarını listeler (maskelenmiş IBAN)"""
    result = await db.execute(
        select(TeacherBankAccount)
        .where(TeacherBankAccount.teacher_id == current_user.id)
        .order_by(TeacherBankAccount.is_default.desc(), TeacherBankAccount.created_at.desc())
    )
    accounts = result.scalars().all()
    
    return [
        BankAccountResponse(
            id=acc.id,
            bank_name=acc.bank_name,
            iban_masked=mask_iban(acc.iban),
            account_holder_name=acc.account_holder_name,
            is_default=acc.is_default,
            status=acc.status,
            review_note=acc.review_note,
            created_at=acc.created_at,
            approved_at=acc.approved_at,
            rejected_at=acc.rejected_at,
        )
        for acc in accounts
    ]


@router.post("/me/bank-accounts", response_model=BankAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_bank_account(
    account_data: BankAccountCreate,
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen yeni banka hesabı ekler (status: PENDING)"""
    # Max 3 hesap kontrolü
    count_result = await db.execute(
        select(func.count(TeacherBankAccount.id))
        .where(TeacherBankAccount.teacher_id == current_user.id)
    )
    account_count = count_result.scalar() or 0
    if account_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="En fazla 3 banka hesabı ekleyebilirsiniz"
        )
    
    # IBAN unique kontrolü
    existing_result = await db.execute(
        select(TeacherBankAccount).where(TeacherBankAccount.iban == account_data.iban)
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu IBAN zaten kullanılıyor"
        )
    
    # Eğer default olarak işaretleniyorsa, diğer hesapları default'tan çıkar
    if account_data.is_default:
        await db.execute(
            select(TeacherBankAccount)
            .where(
                TeacherBankAccount.teacher_id == current_user.id,
                TeacherBankAccount.is_default == True
            )
        )
        existing_defaults = await db.execute(
            select(TeacherBankAccount)
            .where(
                TeacherBankAccount.teacher_id == current_user.id,
                TeacherBankAccount.is_default == True
            )
        )
        for acc in existing_defaults.scalars().all():
            acc.is_default = False
    
    # Yeni hesap oluştur
    new_account = TeacherBankAccount(
        teacher_id=current_user.id,
        bank_name=account_data.bank_name,
        iban=account_data.iban,
        account_holder_name=account_data.account_holder_name,
        is_default=account_data.is_default,
        status=BankAccountStatus.PENDING,
    )
    
    db.add(new_account)
    try:
        await db.commit()
        await db.refresh(new_account)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hesap eklenirken bir hata oluştu: {str(e)}"
        )
    
    return BankAccountResponse(
        id=new_account.id,
        bank_name=new_account.bank_name,
        iban_masked=mask_iban(new_account.iban),
        account_holder_name=new_account.account_holder_name,
        is_default=new_account.is_default,
        status=new_account.status,
        review_note=new_account.review_note,
        created_at=new_account.created_at,
        approved_at=new_account.approved_at,
        rejected_at=new_account.rejected_at,
    )


@router.put("/me/bank-accounts/{account_id}", response_model=BankAccountResponse)
async def update_bank_account(
    account_id: str,
    account_data: BankAccountUpdate,
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen banka hesabını günceller. Onaylı/reddedilmiş hesap güncellenirse tekrar PENDING olur."""
    result = await db.execute(
        select(TeacherBankAccount).where(
            TeacherBankAccount.id == account_id,
            TeacherBankAccount.teacher_id == current_user.id,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Banka hesabı bulunamadı")

    if account_data.iban and account_data.iban != account.iban:
        existing_result = await db.execute(
            select(TeacherBankAccount).where(TeacherBankAccount.iban == account_data.iban)
        )
        if existing_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu IBAN zaten kullanılıyor",
            )

    if account_data.is_default is True:
        existing_defaults = await db.execute(
            select(TeacherBankAccount).where(
                TeacherBankAccount.teacher_id == current_user.id,
                TeacherBankAccount.id != account_id,
                TeacherBankAccount.is_default == True,
            )
        )
        for acc in existing_defaults.scalars().all():
            acc.is_default = False

    sensitive_changed = False
    if account_data.bank_name is not None and account_data.bank_name != account.bank_name:
        account.bank_name = account_data.bank_name
        sensitive_changed = True
    if account_data.iban is not None and account_data.iban != account.iban:
        account.iban = account_data.iban
        sensitive_changed = True
    if (
        account_data.account_holder_name is not None
        and account_data.account_holder_name != account.account_holder_name
    ):
        account.account_holder_name = account_data.account_holder_name
        sensitive_changed = True
    if account_data.is_default is not None:
        account.is_default = account_data.is_default

    if sensitive_changed and account.status in [BankAccountStatus.APPROVED, BankAccountStatus.REJECTED]:
        account.status = BankAccountStatus.PENDING
        account.approved_at = None
        account.rejected_at = None
        account.review_note = None

    try:
        await db.commit()
        await db.refresh(account)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hesap güncellenirken bir hata oluştu: {str(e)}",
        )

    return BankAccountResponse(
        id=account.id,
        bank_name=account.bank_name,
        iban_masked=mask_iban(account.iban),
        account_holder_name=account.account_holder_name,
        is_default=account.is_default,
        status=account.status,
        review_note=account.review_note,
        created_at=account.created_at,
        approved_at=account.approved_at,
        rejected_at=account.rejected_at,
    )


@router.delete("/me/bank-accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bank_account(
    account_id: str,
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen banka hesabını siler (sadece PENDING veya REJECTED)"""
    result = await db.execute(
        select(TeacherBankAccount).where(
            TeacherBankAccount.id == account_id,
            TeacherBankAccount.teacher_id == current_user.id
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Banka hesabı bulunamadı")
    
    # Sadece PENDING veya REJECTED hesaplar silinebilir
    if account.status == BankAccountStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Onaylanmış hesap silinemez"
        )
    
    # Eğer default hesap siliniyorsa, başka bir hesabı default yap
    if account.is_default:
        other_accounts_result = await db.execute(
            select(TeacherBankAccount)
            .where(
                TeacherBankAccount.teacher_id == current_user.id,
                TeacherBankAccount.id != account_id
            )
            .limit(1)
        )
        other_account = other_accounts_result.scalar_one_or_none()
        if other_account:
            other_account.is_default = True
    
    await db.delete(account)
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hesap silinirken bir hata oluştu: {str(e)}"
        )


@router.post("/me/bank-accounts/{account_id}/set-default", response_model=BankAccountResponse)
async def set_default_bank_account(
    account_id: str,
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen varsayılan banka hesabını ayarlar"""
    result = await db.execute(
        select(TeacherBankAccount).where(
            TeacherBankAccount.id == account_id,
            TeacherBankAccount.teacher_id == current_user.id
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Banka hesabı bulunamadı")
    
    # Diğer hesapları default'tan çıkar
    other_accounts_result = await db.execute(
        select(TeacherBankAccount)
        .where(
            TeacherBankAccount.teacher_id == current_user.id,
            TeacherBankAccount.id != account_id,
            TeacherBankAccount.is_default == True
        )
    )
    for acc in other_accounts_result.scalars().all():
        acc.is_default = False
    
    account.is_default = True
    
    try:
        await db.commit()
        await db.refresh(account)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hesap güncellenirken bir hata oluştu: {str(e)}"
        )
    
    return BankAccountResponse(
        id=account.id,
        bank_name=account.bank_name,
        iban_masked=mask_iban(account.iban),
        account_holder_name=account.account_holder_name,
        is_default=account.is_default,
        status=account.status,
        review_note=account.review_note,
        created_at=account.created_at,
        approved_at=account.approved_at,
        rejected_at=account.rejected_at,
    )


# ========== ADMIN ENDPOINTS ==========

@admin_router.get("/bank-accounts", response_model=list[BankAccountAdminResponse])
async def list_all_bank_accounts_admin(
    status_filter: Optional[BankAccountStatus] = Query(None, description="Status filtresi"),
    teacher_id: Optional[str] = Query(None, description="Öğretmen ID filtresi"),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin tüm banka hesaplarını listeler"""
    query = select(TeacherBankAccount)
    conditions = []

    if status_filter:
        conditions.append(TeacherBankAccount.status == status_filter)
    if teacher_id:
        conditions.append(TeacherBankAccount.teacher_id == teacher_id)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(TeacherBankAccount.created_at.desc())

    result = await db.execute(query)
    accounts = result.scalars().all()

    return [
        BankAccountAdminResponse.model_validate(acc)
        for acc in accounts
    ]


@admin_router.post("/{teacher_id}/bank-accounts", response_model=BankAccountAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_bank_account_for_teacher_admin(
    teacher_id: str,
    account_data: BankAccountCreate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Admin bir öğretmen için banka hesabı oluşturur"""
    # Öğretmenin var olduğunu kontrol et
    teacher_result = await db.execute(
        select(User).where(User.id == teacher_id, User.role == UserRole.TEACHER)
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Öğretmen bulunamadı")
    
    # Max 3 hesap limiti
    count_result = await db.execute(
        select(func.count(TeacherBankAccount.id))
        .where(TeacherBankAccount.teacher_id == teacher_id)
    )
    account_count = count_result.scalar_one()
    if account_count >= 3:
        raise HTTPException(status_code=400, detail="En fazla 3 banka hesabı eklenebilir.")
    
    # IBAN unique kontrolü
    existing_iban = await db.execute(
        select(TeacherBankAccount)
        .where(TeacherBankAccount.iban == account_data.iban)
    )
    if existing_iban.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Bu IBAN zaten sistemde kayıtlı.")
    
    new_account = TeacherBankAccount(
        teacher_id=teacher_id,
        bank_name=account_data.bank_name,
        iban=account_data.iban,
        account_holder_name=account_data.account_holder_name,
        is_default=False,
        status=BankAccountStatus.PENDING,
    )
    
    # Eğer hiç hesabı yoksa, bu hesabı varsayılan yap
    if account_count == 0:
        new_account.is_default = True
    
    db.add(new_account)
    try:
        await db.commit()
        await db.refresh(new_account)
        
        # Öğretmene bildirim gönder
        await notification_service.send_notification(
            user_ids=[teacher_id],
            notification_type=NotificationType.BANK_ACCOUNT_PENDING,
            title="Yeni Banka Hesabı Eklendi",
            message=f"Admin tarafından sizin için yeni bir banka hesabı eklendi ve onay bekliyor.",
            action_url="/dashboard/teacher/bank-accounts",
            action_label="Hesapları Görüntüle",
            priority=NotificationPriority.MEDIUM,
            delivery_channels=["in_app", "email"],
        )
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Banka hesabı eklenirken bir hata oluştu.")
    
    return BankAccountAdminResponse.model_validate(new_account)


@admin_router.get(
    "/bank-accounts-legacy-disabled",
    response_model=list[BankAccountAdminResponse],
    include_in_schema=False,
)
async def list_all_bank_accounts_admin_legacy_disabled(
    status_filter: Optional[BankAccountStatus] = Query(None, description="Status filtresi"),
    teacher_id: Optional[str] = Query(None, description="Öğretmen ID filtresi"),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin tüm banka hesaplarını listeler"""
    query = select(TeacherBankAccount)
    conditions = []
    
    if status_filter:
        conditions.append(TeacherBankAccount.status == status_filter)
    if teacher_id:
        conditions.append(TeacherBankAccount.teacher_id == teacher_id)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.order_by(TeacherBankAccount.created_at.desc())
    
    result = await db.execute(query)
    accounts = result.scalars().all()
    
    return [
        BankAccountAdminResponse.model_validate(acc)
        for acc in accounts
    ]


@admin_router.post("/bank-accounts/{account_id}/approve", response_model=BankAccountAdminResponse)
async def approve_bank_account(
    account_id: str,
    review_note: Optional[str] = None,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Admin banka hesabını onaylar"""
    result = await db.execute(
        select(TeacherBankAccount).where(TeacherBankAccount.id == account_id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Banka hesabı bulunamadı")
    
    if account.status != BankAccountStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bu hesap {account.status.value} durumunda, sadece PENDING hesaplar onaylanabilir"
        )
    
    account.status = BankAccountStatus.APPROVED
    account.approved_at = datetime.utcnow()
    if review_note:
        account.review_note = review_note
    
    try:
        await db.commit()
        await db.refresh(account)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hesap onaylanırken bir hata oluştu: {str(e)}"
        )
    
    # Öğretmene bildirim gönder (account zaten commit edildi, hata olsa bile etkilemez)
    try:
        await notification_service.send_notification(
            user_ids=[account.teacher_id],
            notification_type=NotificationType.BANK_ACCOUNT_APPROVED,
            title="Banka Hesabınız Onaylandı",
            message=f"{account.bank_name} bankasındaki hesabınız onaylandı. Artık çekim talebi oluşturabilirsiniz.",
            action_url="/dashboard/teacher/bank-accounts",
            action_label="Hesapları Görüntüle",
            priority=NotificationPriority.MEDIUM,
            delivery_channels=["in_app", "email"],
        )
    except Exception as e:
        print(f"Warning: Bank account approval notification failed: {str(e)}")
        # Notification hatası account'u etkilemez, sadece log'la
    
    return BankAccountAdminResponse.model_validate(account)


@admin_router.post("/bank-accounts/{account_id}/reject", response_model=BankAccountAdminResponse)
async def reject_bank_account(
    account_id: str,
    review_note: str,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Admin banka hesabını reddeder (review_note zorunlu)"""
    if not review_note or len(review_note.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Red sebebi en az 10 karakter olmalıdır"
        )
    
    result = await db.execute(
        select(TeacherBankAccount).where(TeacherBankAccount.id == account_id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Banka hesabı bulunamadı")
    
    if account.status != BankAccountStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bu hesap {account.status.value} durumunda, sadece PENDING hesaplar reddedilebilir"
        )
    
    account.status = BankAccountStatus.REJECTED
    account.rejected_at = datetime.utcnow()
    account.review_note = review_note
    
    try:
        await db.commit()
        await db.refresh(account)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hesap reddedilirken bir hata oluştu: {str(e)}"
        )
    
    # Öğretmene bildirim gönder (account zaten commit edildi, hata olsa bile etkilemez)
    try:
        await notification_service.send_notification(
            user_ids=[account.teacher_id],
            notification_type=NotificationType.BANK_ACCOUNT_REJECTED,
            title="Banka Hesabınız Reddedildi",
            message=f"{account.bank_name} bankasındaki hesabınız reddedildi. Sebep: {review_note}",
            action_url="/dashboard/teacher/bank-accounts",
            action_label="Hesapları Görüntüle",
            priority=NotificationPriority.HIGH,
            delivery_channels=["in_app", "email"],
        )
    except Exception as e:
        print(f"Warning: Bank account rejection notification failed: {str(e)}")
        # Notification hatası account'u etkilemez, sadece log'la
    
    return BankAccountAdminResponse.model_validate(account)
