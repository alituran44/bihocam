from typing import Optional
from datetime import datetime, timedelta
import secrets
import string

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token, create_password_reset_token
from app.db.session import get_db
from app.models.notification import NotificationType, NotificationPriority
from app.models.user import User, UserRole
from app.schemas.user import (
    UserResponse, UserUpdate, UserListItem, UserListResponse,
    PasswordResetRequest, PasswordResetResponse
)
from app.services.notification_service import NotificationService
from app.services.quota_service import (
    get_quota_usage,
    update_quota,
    QuotaExceededError,
)
from app.models.storage_quota import StorageQuota
from pydantic import BaseModel

router = APIRouter()


# Quota Schemas
class StorageQuotaUpdate(BaseModel):
    quota_mb: int
    notes: Optional[str] = None


class StorageQuotaResponse(BaseModel):
    quota_bytes: int
    used_bytes: int
    available_bytes: int
    usage_percentage: float
    is_exceeded: bool
    reset_at: Optional[str] = None


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


@router.get("", response_model=UserListResponse)
@router.get("/", response_model=UserListResponse)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = Query(None, description="Rol filtresi: student, teacher, admin, staff, organization"),
    q: Optional[str] = Query(None, description="Ad, soyad veya email içinde arama"),
    status: Optional[str] = Query(None, description="Durum filtresi: active, inactive"),
    created_from: Optional[datetime] = Query(None, description="Başlangıç tarihi (ISO format)"),
    created_to: Optional[datetime] = Query(None, description="Bitiş tarihi (ISO format)"),
    sort_by: Optional[str] = Query("created_at", description="Sıralama: created_at, full_name, last_login_at"),
    sort_order: Optional[str] = Query("desc", description="Sıralama yönü: asc, desc"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Admin için kullanıcı listesi endpoint'i.
    Pagination, filtreleme ve sıralama desteği ile.
    """
    # Base query
    stmt = select(User)
    count_stmt = select(func.count()).select_from(User)
    
    # Filtreler
    conditions = []
    
    if role:
        conditions.append(User.role == role)
    
    if q:
        search_pattern = f"%{q}%"
        conditions.append(
            or_(
                User.full_name.ilike(search_pattern),
                User.email.ilike(search_pattern)
            )
        )
    
    if status:
        if status == "active":
            conditions.append(User.is_active == True)
        elif status == "inactive":
            conditions.append(User.is_active == False)
    
    if created_from:
        conditions.append(User.created_at >= created_from)
    
    if created_to:
        conditions.append(User.created_at <= created_to)
    
    if conditions:
        stmt = stmt.where(and_(*conditions))
        count_stmt = count_stmt.where(and_(*conditions))
    
    # Sıralama
    sort_column = User.created_at  # default
    if sort_by == "full_name":
        sort_column = User.full_name
    elif sort_by == "last_login_at":
        # last_login_at henüz model'de yok, şimdilik created_at kullan
        sort_column = User.created_at
    elif sort_by == "created_at":
        sort_column = User.created_at
    
    if sort_order == "asc":
        stmt = stmt.order_by(sort_column.asc())
    else:
        stmt = stmt.order_by(sort_column.desc())
    
    # Pagination
    stmt = stmt.offset(skip).limit(limit)
    
    # Toplam sayıyı al
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0
    
    # Kullanıcıları getir
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    # UserListItem'e dönüştür
    items = [
        UserListItem(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_login_at=getattr(user, "last_login_at", None),  # Migration sonrası çalışacak
            phone=getattr(user, "phone", None),  # Migration sonrası çalışacak
        )
        for user in users
    ]
    
    return UserListResponse(
        total=total,
        items=items,
        skip=skip,
        limit=limit
    )


@router.get("/storage-quotas", response_model=dict)
async def list_storage_quotas(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Tüm kullanıcıların depolama kotası listesi (Admin)"""
    from sqlalchemy.orm import selectinload
    from app.models.storage_quota import StorageQuota
    
    result = await db.execute(
        select(StorageQuota)
        .options(selectinload(StorageQuota.user))
        .offset(skip)
        .limit(limit)
        .order_by(StorageQuota.used_bytes.desc())
    )
    quotas = result.scalars().all()
    
    total_result = await db.execute(select(func.count(StorageQuota.id)))
    total = total_result.scalar_one()
    
    quota_list = []
    for quota in quotas:
        quota_list.append({
            "user_id": quota.user_id,
            "user_email": quota.user.email if quota.user else None,
            "user_full_name": quota.user.full_name if quota.user else None,
            "quota_bytes": quota.quota_bytes,
            "used_bytes": quota.used_bytes,
            "available_bytes": quota.available_bytes,
            "usage_percentage": round(quota.usage_percentage, 2),
            "is_exceeded": quota.is_exceeded,
            "is_custom": quota.is_custom,
            "reset_at": quota.reset_at.isoformat() if quota.reset_at else None,
        })
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "quotas": quota_list,
    }


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_in: UserUpdate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin tarafından kullanıcı güncelleme endpoint'i.
    Güvenlik kontrolleri:
    - Admin kendi rolünü düşüremez
    - Email unique kontrolü
    - Son admin'in rolü düşürülemez
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    update_data = user_in.model_dump(exclude_unset=True)
    
    # Email değişikliği kontrolü
    if "email" in update_data and update_data["email"] != user.email:
        # Email unique kontrolü
        existing_user = await db.execute(
            select(User).where(User.email == update_data["email"])
        )
        if existing_user.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Bu email adresi zaten kullanılıyor"
            )
    
    # Rol değişikliği güvenlik kontrolleri
    if "role" in update_data and update_data["role"] != user.role:
        # Admin kendi rolünü düşüremez
        if user_id == current_admin.id:
            raise HTTPException(
                status_code=400,
                detail="Kendi rolünüzü değiştiremezsiniz"
            )
        
        # Eğer admin rolü düşürülüyorsa, sistemde en az 1 admin kalmalı
        if user.role == UserRole.ADMIN and update_data["role"] != UserRole.ADMIN:
            admin_count_result = await db.execute(
                select(func.count(User.id)).where(User.role == UserRole.ADMIN)
            )
            admin_count = admin_count_result.scalar() or 0
            
            if admin_count <= 1:
                raise HTTPException(
                    status_code=400,
                    detail="Sistemde en az bir admin kalmalıdır"
                )
        
        # Teacher rolü düşürülürken yayında kurs kontrolü (ileride eklenecek)
        # Şimdilik sadece uyarı log'u
    
    # Güncelleme
    for field, value in update_data.items():
        setattr(user, field, value)
    
    try:
        await db.commit()
        await db.refresh(user)
        return user
    except Exception as e:
        await db.rollback()
        import logging
        logging.getLogger(__name__).error(f"Error updating user: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Kullanıcı güncellenirken bir hata oluştu."
        )


@router.post("/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: str,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Kullanıcı hesabını deaktif et (soft disable).
    Kullanıcı giriş yapamaz ama veriler korunur.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Admin kendi hesabını deaktif edemez
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Kendi hesabınızı deaktif edemezsiniz"
        )
    
    # Son admin deaktif edilemez
    if user.role == UserRole.ADMIN:
        admin_count_result = await db.execute(
            select(func.count(User.id)).where(
                and_(User.role == UserRole.ADMIN, User.is_active == True)
            )
        )
        admin_count = admin_count_result.scalar() or 0
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Sistemde en az bir aktif admin kalmalıdır"
            )
    
    user.is_active = False
    
    try:
        await db.commit()
        await db.refresh(user)
        return user
    except Exception as e:
        await db.rollback()
        import logging
        logging.getLogger(__name__).error(f"Error deactivating user: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Hesap deaktif edilirken bir hata oluştu."
        )


@router.post("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: str,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Deaktif edilmiş kullanıcı hesabını tekrar aktif et.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    user.is_active = True
    
    try:
        await db.commit()
        await db.refresh(user)
        return user
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Hesap aktif edilirken bir hata oluştu: {str(e)}"
        )


@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: str,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Kullanıcı hesabını sil (GDPR-friendly soft delete).
    Kişisel veriler anonimleştirilir, finansal ve kurs kayıtları korunur.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Admin kendi hesabını silemez
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Kendi hesabınızı silemezsiniz"
        )
    
    # Son admin silinemez
    if user.role == UserRole.ADMIN:
        admin_count_result = await db.execute(
            select(func.count(User.id)).where(
                and_(User.role == UserRole.ADMIN, User.is_active == True)
            )
        )
        admin_count = admin_count_result.scalar() or 0
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Sistemde en az bir aktif admin kalmalıdır"
            )
    
    # GDPR-friendly anonimleştirme
    # Email ve isim gibi PII alanları maskele
    random_suffix = secrets.token_hex(4)
    user.email = f"deleted_{random_suffix}@deleted.local"
    user.full_name = f"Anonim Kullanıcı {random_suffix}"
    user.is_active = False
    # Not: hashed_password korunur (güvenlik için)
    # Not: İlişkiler (courses, orders, enrollments vb.) korunur
    
    try:
        await db.commit()
        return {
            "message": "Kullanıcı hesabı silindi (anonimleştirildi)",
            "user_id": user_id
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Hesap silinirken bir hata oluştu: {str(e)}"
        )


def generate_temporary_password(length: int = 12) -> str:
    """Güvenli geçici şifre üret"""
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(characters) for _ in range(length))


@router.post("/{user_id}/reset-password", response_model=PasswordResetResponse)
async def reset_user_password(
    user_id: str,
    reset_request: PasswordResetRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin tarafından kullanıcı şifresi sıfırlama endpoint'i.
    İki mod:
    1. Magic link: Email ile gönderilecek şifre sıfırlama linki
    2. Temporary password: Geçici şifre oluştur ve göster
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Deaktif kullanıcı için uyarı (ama yine de reset yapılabilir)
    if not user.is_active:
        # Not: Deaktif kullanıcı için de reset yapılabilir, ama uyarı verelim
        pass
    
    # Email doğrulanmamış kullanıcı için uyarı (magic link modunda)
    if reset_request.mode == "magic_link" and not user.is_verified:
        # Not: Yine de gönderebiliriz, ama frontend'de uyarı gösterilmeli
        pass
    
    if reset_request.mode == "magic_link":
        # Magic link oluştur (24 saat geçerli)
        # JWT token ile password reset token oluştur
        reset_token = create_password_reset_token(
            subject=user.id,
            expires_delta=timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
        )
        
        # Frontend URL'i config'den al
        magic_link = f"{settings.FRONTEND_URL}/auth/reset-password?token={reset_token}"
        
        # Notification service ile email gönderimi
        try:
            notification_service = NotificationService(db)
            await notification_service.send_notification(
                user_ids=[user.id],
                notification_type=NotificationType.PASSWORD_RESET,
                title="Şifre Sıfırlama Talebi",
                message=f"Merhaba {user.full_name},\n\nŞifre sıfırlama talebiniz alındı. Aşağıdaki linke tıklayarak şifrenizi sıfırlayabilirsiniz:\n\n{magic_link}\n\nBu link {settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS} saat geçerlidir.\n\nEğer bu talebi siz yapmadıysanız, lütfen bu e-postayı görmezden gelin.",
                priority=NotificationPriority.HIGH,
                delivery_channels=["email", "in_app"],
                action_url=magic_link,
                action_label="Şifremi Sıfırla",
                sender_id=current_admin.id,
            )
            await db.flush()  # Notification'ı kaydet
        except Exception as e:
            # Notification gönderimi başarısız olsa bile link'i döndür
            # Log'a yazılabilir ama kullanıcıya hata dönülmez
            print(f"Warning: Password reset notification failed for user {user.id}: {str(e)}")
        
        return PasswordResetResponse(
            message="Şifre sıfırlama linki oluşturuldu. Kullanıcıya email gönderildi.",
            magic_link=magic_link,
            temporary_password=None
        )
    
    elif reset_request.mode == "temporary_password":
        # Geçici şifre oluştur
        if reset_request.temporary_password:
            # Admin özel şifre belirlemiş
            temp_password = reset_request.temporary_password
            # Şifre güçlülük kontrolü (min 8 karakter)
            if len(temp_password) < 8:
                raise HTTPException(
                    status_code=400,
                    detail="Geçici şifre en az 8 karakter olmalıdır"
                )
        else:
            # Otomatik güvenli şifre üret
            temp_password = generate_temporary_password()
        
        # Şifreyi hash'le ve kaydet
        user.hashed_password = get_password_hash(temp_password)
        
        try:
            await db.commit()
            await db.refresh(user)
            
            return PasswordResetResponse(
                message="Geçici şifre oluşturuldu. Bu şifre sadece bir kez gösterilecektir.",
                magic_link=None,
                temporary_password=temp_password  # Sadece bu response'da gösterilir
            )
        except Exception as e:
            await db.rollback()
            import logging
            logging.getLogger(__name__).error(f"Error resetting password: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail="Şifre sıfırlanırken bir hata oluştu."
            )
    
    else:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz mod. 'magic_link' veya 'temporary_password' olmalıdır."
        )


# ============================================================================
# Storage Quota Endpoints (EP10-BE-14)
# ============================================================================

class StorageQuotaUpdate(BaseModel):
    quota_mb: int
    notes: Optional[str] = None


class StorageQuotaResponse(BaseModel):
    quota_bytes: int
    used_bytes: int
    available_bytes: int
    usage_percentage: float
    is_exceeded: bool
    reset_at: Optional[str] = None


@router.get("/{user_id}/storage-quota", response_model=StorageQuotaResponse)
async def get_user_storage_quota(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Kullanıcı depolama kotası bilgisi (Admin)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    usage = await get_quota_usage(db, user_id)
    return StorageQuotaResponse(**usage)


@router.put("/{user_id}/storage-quota", response_model=StorageQuotaResponse)
async def update_user_storage_quota(
    user_id: str,
    quota_update: StorageQuotaUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Kullanıcı depolama kotası güncelleme (Admin) - EP10-BE-18: Audit logging"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    quota_bytes = quota_update.quota_mb * 1024 * 1024
    
    try:
        await update_quota(db, user_id, quota_bytes, quota_update.notes)
        usage = await get_quota_usage(db, user_id)
        
        # EP10-BE-18: Audit logging
        from app.services.audit_service import log_security_event
        from app.models.content_audit_log import ContentAuditAction, ContentResourceType
        await log_security_event(
            db, ContentAuditAction.QUOTA_UPDATE, ContentResourceType.COURSE,
            user_id=current_admin.id, resource_id=user_id,
            metadata={
                "target_user_id": user_id,
                "quota_mb": quota_update.quota_mb,
                "quota_bytes": quota_bytes,
                "notes": quota_update.notes,
            },
            request=request,
        )
        
        return StorageQuotaResponse(**usage)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

