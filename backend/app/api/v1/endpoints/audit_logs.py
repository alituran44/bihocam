"""
Audit Logs Endpoints (EP10-BE-18)

İçerik yönetimi audit log'ları için admin endpoint'leri.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.content_audit_log import ContentAuditLog
from pydantic import BaseModel


router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Admin yetkisi kontrolü"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


class AuditLogResponse(BaseModel):
    id: str
    user_id: str | None
    action: str
    resource_type: str
    resource_id: str | None
    metadata: dict | None  # API response'da metadata olarak döner (metadata_json'dan map edilir)
    ip_address: str | None
    user_agent: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        """ORM objesinden response oluştur (metadata_json -> metadata mapping)"""
        data = {
            "id": obj.id,
            "user_id": obj.user_id,
            "action": obj.action,
            "resource_type": obj.resource_type,
            "resource_id": obj.resource_id,
            "metadata": obj.metadata_json,  # metadata_json -> metadata
            "ip_address": obj.ip_address,
            "user_agent": obj.user_agent,
            "created_at": obj.created_at,
        }
        return cls(**data)


@router.get("/admin/audit-logs", response_model=dict)
async def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    action: Optional[str] = Query(None, description="Action filtresi"),
    resource_type: Optional[str] = Query(None, description="Resource type filtresi"),
    user_id: Optional[str] = Query(None, description="User ID filtresi"),
    created_from: Optional[datetime] = Query(None, description="Başlangıç tarihi"),
    created_to: Optional[datetime] = Query(None, description="Bitiş tarihi"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Audit log listesi (Admin)
    
    Filtreleme ve sayfalama desteği ile.
    """
    # Base query
    stmt = select(ContentAuditLog)
    count_stmt = select(func.count()).select_from(ContentAuditLog)
    
    # Filtreler
    conditions = []
    
    if action:
        conditions.append(ContentAuditLog.action == action)
    
    if resource_type:
        conditions.append(ContentAuditLog.resource_type == resource_type)
    
    if user_id:
        conditions.append(ContentAuditLog.user_id == user_id)
    
    if created_from:
        conditions.append(ContentAuditLog.created_at >= created_from)
    
    if created_to:
        conditions.append(ContentAuditLog.created_at <= created_to)
    
    if conditions:
        stmt = stmt.where(and_(*conditions))
        count_stmt = count_stmt.where(and_(*conditions))
    
    # Sıralama (en yeni önce)
    stmt = stmt.order_by(ContentAuditLog.created_at.desc())
    
    # Pagination
    stmt = stmt.offset(skip).limit(limit)
    
    # Execute
    result = await db.execute(stmt)
    logs = result.scalars().all()
    
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "logs": [AuditLogResponse.from_orm(log) for log in logs],
    }


@router.get("/admin/storage-metrics", response_model=dict)
async def get_storage_metrics(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Storage kullanım metrikleri (real-time) - EP10-BE-18
    
    - Toplam depolama kullanımı
    - Tip bazlı kırılım
    - Son 24 saat upload aktivitesi
    - Quota kullanım istatistikleri
    """
    from app.models.course import Lesson, LessonType
    from app.models.storage_quota import StorageQuota
    from sqlalchemy import func as sql_func
    
    # Toplam dosya boyutu (tip bazlı)
    content_stats_result = await db.execute(
        select(
            Lesson.lesson_type,
            sql_func.count(Lesson.id).label("count"),
            sql_func.coalesce(sql_func.sum(Lesson.file_size_bytes), 0).label("total_size_bytes")
        )
        .where(Lesson.content_path.isnot(None) | Lesson.live_lesson_recording_path.isnot(None))
        .group_by(Lesson.lesson_type)
    )
    content_stats = content_stats_result.all()
    
    type_breakdown = {}
    total_file_size_bytes = 0
    total_content_items = 0
    
    for stat in content_stats:
        if stat.lesson_type:
            type_breakdown[stat.lesson_type.value] = {
                "count": stat.count,
                "total_size_bytes": stat.total_size_bytes,
            }
            total_file_size_bytes += stat.total_size_bytes
            total_content_items += stat.count
    
    # Son 24 saat upload aktivitesi
    from datetime import timedelta, timezone
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    
    recent_uploads_result = await db.execute(
        select(sql_func.count(ContentAuditLog.id))
        .where(
            ContentAuditLog.action == "upload",
            ContentAuditLog.created_at >= twenty_four_hours_ago
        )
    )
    recent_uploads_count = recent_uploads_result.scalar_one() or 0
    
    # Quota kullanım istatistikleri
    # usage_percentage bir property olduğu için SQL'de hesaplamalıyız: (used_bytes / quota_bytes * 100)
    # BigInteger değerler için Float kullanmalıyız (Numeric precision overflow olabilir)
    from sqlalchemy import case
    from sqlalchemy import Float
    
    quota_stats_result = await db.execute(
        select(
            sql_func.count(StorageQuota.id).label("total_users"),
            sql_func.sum(StorageQuota.quota_bytes).label("total_quota_bytes"),
            sql_func.sum(StorageQuota.used_bytes).label("total_used_bytes"),
            sql_func.avg(
                case(
                    (StorageQuota.quota_bytes > 0, 
                     (StorageQuota.used_bytes.cast(Float) / StorageQuota.quota_bytes.cast(Float)) * 100),
                    else_=0
                )
            ).label("avg_usage_percentage")
        )
    )
    quota_stats = quota_stats_result.one()
    
    return {
        "total_content_items": total_content_items,
        "total_file_size_bytes": total_file_size_bytes,
        "type_breakdown": type_breakdown,
        "recent_uploads_24h": recent_uploads_count,
        "quota_stats": {
            "total_users": quota_stats.total_users or 0,
            "total_quota_bytes": quota_stats.total_quota_bytes or 0,
            "total_used_bytes": quota_stats.total_used_bytes or 0,
            "avg_usage_percentage": round(quota_stats.avg_usage_percentage or 0, 2),
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/admin/storage-quotas", response_model=dict)
async def list_storage_quotas(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Tüm kullanıcıların depolama kotası listesi (Admin)"""
    from sqlalchemy.orm import selectinload
    from app.models.storage_quota import StorageQuota
    from sqlalchemy import func
    
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
