"""
Storage Quota Service (EP10-BE-14)

Kullanıcı bazlı depolama kotası yönetimi servisi.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.storage_quota import StorageQuota
from app.models.user import User


class QuotaExceededError(Exception):
    """Kota aşıldı hatası"""
    pass


async def get_or_create_quota(
    db: AsyncSession,
    user_id: str,
) -> StorageQuota:
    """
    Kullanıcı için quota kaydını getir veya oluştur
    
    Args:
        db: Database session
        user_id: Kullanıcı ID
    
    Returns:
        StorageQuota: Quota kaydı
    """
    result = await db.execute(
        select(StorageQuota).where(StorageQuota.user_id == user_id)
    )
    quota = result.scalar_one_or_none()
    
    if not quota:
        # Default quota ile oluştur
        default_quota_bytes = settings.DEFAULT_STORAGE_QUOTA_MB * 1024 * 1024
        reset_at = None
        if settings.QUOTA_RESET_PERIOD_DAYS > 0:
            reset_at = datetime.now(timezone.utc) + timedelta(days=settings.QUOTA_RESET_PERIOD_DAYS)
        
        quota = StorageQuota(
            user_id=user_id,
            quota_bytes=default_quota_bytes,
            used_bytes=0,
            reset_at=reset_at,
            reset_period_days=settings.QUOTA_RESET_PERIOD_DAYS if settings.QUOTA_RESET_PERIOD_DAYS > 0 else None,
        )
        db.add(quota)
        await db.commit()
        await db.refresh(quota)
    
    return quota


async def check_quota(
    db: AsyncSession,
    user_id: str,
    file_size_bytes: int,
) -> bool:
    """
    Quota kontrolü - bu dosya boyutu için upload yapılabilir mi?
    
    Args:
        db: Database session
        user_id: Kullanıcı ID
        file_size_bytes: Dosya boyutu (bytes)
    
    Returns:
        bool: Upload yapılabilir mi?
    
    Raises:
        QuotaExceededError: Kota aşıldı
    """
    quota = await get_or_create_quota(db, user_id)
    
    if not quota.can_upload(file_size_bytes):
        raise QuotaExceededError(
            f"Depolama kotası aşıldı. "
            f"Kullanılabilir: {quota.available_bytes / (1024 * 1024):.2f} MB, "
            f"Gereken: {file_size_bytes / (1024 * 1024):.2f} MB"
        )
    
    return True


async def reserve_quota(
    db: AsyncSession,
    user_id: str,
    file_size_bytes: int,
) -> StorageQuota:
    """
    Quota rezervasyonu - dosya yükleme öncesi
    
    Args:
        db: Database session
        user_id: Kullanıcı ID
        file_size_bytes: Dosya boyutu (bytes)
    
    Returns:
        StorageQuota: Güncellenmiş quota kaydı
    
    Raises:
        QuotaExceededError: Kota aşıldı
    """
    quota = await get_or_create_quota(db, user_id)
    
    # Quota kontrolü
    if not quota.can_upload(file_size_bytes):
        raise QuotaExceededError(
            f"Depolama kotası aşıldı. "
            f"Kullanılabilir: {quota.available_bytes / (1024 * 1024):.2f} MB, "
            f"Gereken: {file_size_bytes / (1024 * 1024):.2f} MB"
        )
    
    # Quota'yı güncelle
    quota.used_bytes += file_size_bytes
    await db.commit()
    await db.refresh(quota)
    
    return quota


async def release_quota(
    db: AsyncSession,
    user_id: str,
    file_size_bytes: int,
) -> StorageQuota:
    """
    Quota serbest bırakma - dosya silme sonrası
    
    Args:
        db: Database session
        user_id: Kullanıcı ID
        file_size_bytes: Serbest bırakılacak alan (bytes)
    
    Returns:
        StorageQuota: Güncellenmiş quota kaydı
    """
    quota = await get_or_create_quota(db, user_id)
    
    # Quota'yı güncelle (negatif olamaz)
    quota.used_bytes = max(0, quota.used_bytes - file_size_bytes)
    await db.commit()
    await db.refresh(quota)
    
    return quota


async def get_quota_usage(
    db: AsyncSession,
    user_id: str,
) -> dict[str, any]:
    """
    Quota kullanım bilgisi
    
    Args:
        db: Database session
        user_id: Kullanıcı ID
    
    Returns:
        dict: {
            "quota_bytes": int,
            "used_bytes": int,
            "available_bytes": int,
            "usage_percentage": float,
            "is_exceeded": bool,
            "reset_at": str | None,
        }
    """
    quota = await get_or_create_quota(db, user_id)
    
    return {
        "quota_bytes": quota.quota_bytes,
        "used_bytes": quota.used_bytes,
        "available_bytes": quota.available_bytes,
        "usage_percentage": round(quota.usage_percentage, 2),
        "is_exceeded": quota.is_exceeded,
        "reset_at": quota.reset_at.isoformat() if quota.reset_at else None,
    }


async def update_quota(
    db: AsyncSession,
    user_id: str,
    quota_bytes: int,
    notes: Optional[str] = None,
) -> StorageQuota:
    """
    Admin tarafından quota güncelleme
    
    Args:
        db: Database session
        user_id: Kullanıcı ID
        quota_bytes: Yeni quota (bytes)
        notes: Admin notları
    
    Returns:
        StorageQuota: Güncellenmiş quota kaydı
    """
    # Max quota kontrolü
    max_quota_bytes = settings.MAX_STORAGE_QUOTA_MB * 1024 * 1024
    if quota_bytes > max_quota_bytes:
        raise ValueError(f"Quota maksimum {settings.MAX_STORAGE_QUOTA_MB} MB olabilir")
    
    quota = await get_or_create_quota(db, user_id)
    
    # Quota güncelle
    quota.quota_bytes = quota_bytes
    quota.is_custom = True
    if notes:
        quota.notes = notes
    
    await db.commit()
    await db.refresh(quota)
    
    return quota


async def reset_quota_if_due(
    db: AsyncSession,
    user_id: str,
) -> Optional[StorageQuota]:
    """
    Quota reset döngüsü kontrolü ve reset (eğer zamanı geldiyse)
    
    Args:
        db: Database session
        user_id: Kullanıcı ID
    
    Returns:
        StorageQuota | None: Reset edildiyse güncellenmiş quota, yoksa None
    """
    quota = await get_or_create_quota(db, user_id)
    
    # Reset kontrolü
    if quota.reset_at and quota.reset_period_days:
        now = datetime.now(timezone.utc)
        if now >= quota.reset_at:
            # Reset yap
            quota.used_bytes = 0
            quota.reset_at = now + timedelta(days=quota.reset_period_days)
            await db.commit()
            await db.refresh(quota)
            return quota
    
    return None
