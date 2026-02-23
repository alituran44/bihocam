"""
Audit Service (EP10-BE-18)

İçerik yönetimi operasyonları için audit logging servisi.
"""

from typing import Any, Optional
from fastapi import Request

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content_audit_log import ContentAuditLog, ContentAuditAction, ContentResourceType


async def log_content_action(
    db: AsyncSession,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    user_id: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> ContentAuditLog:
    """
    İçerik yönetimi action'ını audit log'a kaydet
    
    Args:
        db: Database session
        action: Action type (upload, delete, update, etc.)
        resource_type: Resource type (lesson, course, document, etc.)
        resource_id: Resource ID (optional)
        user_id: User ID (optional)
        metadata: Ek metadata (JSON)
        ip_address: IP address (optional)
        user_agent: User agent (optional)
    
    Returns:
        ContentAuditLog: Oluşturulan audit log kaydı
    """
    audit_log = ContentAuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata_json=metadata,  # metadata_json is the Python attribute name
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    db.add(audit_log)
    await db.commit()
    await db.refresh(audit_log)
    
    return audit_log


async def log_upload(
    db: AsyncSession,
    resource_type: str,
    resource_id: str,
    user_id: str,
    file_size: int,
    file_type: str,
    storage_key: str,
    request: Optional[Request] = None,
) -> ContentAuditLog:
    """Upload action'ını logla"""
    metadata = {
        "file_size": file_size,
        "file_type": file_type,
        "storage_key": storage_key,
    }
    
    ip_address = None
    user_agent = None
    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
    
    return await log_content_action(
        db=db,
        action=ContentAuditAction.UPLOAD,
        resource_type=resource_type,
        resource_id=resource_id,
        user_id=user_id,
        metadata=metadata,
        ip_address=ip_address,
        user_agent=user_agent,
    )


async def log_delete(
    db: AsyncSession,
    resource_type: str,
    resource_id: str,
    user_id: str,
    storage_key: Optional[str] = None,
    request: Optional[Request] = None,
) -> ContentAuditLog:
    """Delete action'ını logla"""
    metadata = {}
    if storage_key:
        metadata["storage_key"] = storage_key
    
    ip_address = None
    user_agent = None
    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
    
    return await log_content_action(
        db=db,
        action=ContentAuditAction.DELETE,
        resource_type=resource_type,
        resource_id=resource_id,
        user_id=user_id,
        metadata=metadata,
        ip_address=ip_address,
        user_agent=user_agent,
    )


async def log_security_event(
    db: AsyncSession,
    action: str,
    resource_type: str,
    user_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
    request: Optional[Request] = None,
) -> ContentAuditLog:
    """Güvenlik olayını logla (quota aşımı, unauthorized access, etc.)"""
    ip_address = None
    user_agent = None
    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
    
    return await log_content_action(
        db=db,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        user_id=user_id,
        metadata=metadata,
        ip_address=ip_address,
        user_agent=user_agent,
    )
