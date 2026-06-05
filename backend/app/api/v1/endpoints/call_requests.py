import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User, UserRole
from app.db.session import get_db
from app.models.call_request import CallRequest, CallRequestStatus
from app.schemas.call_request import CallRequestCreate, CallRequestResponse, CallRequestUpdateStatus

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user

router = APIRouter()

@router.post("", response_model=CallRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_call_request(
    request_in: CallRequestCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Create a new call request (Public)"""
    new_request = CallRequest(
        id=str(uuid.uuid4()),
        name=request_in.name,
        phone=request_in.phone,
        status=CallRequestStatus.PENDING
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    return new_request

@router.get("", response_model=list[CallRequestResponse])
async def get_call_requests(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
) -> Any:
    """List all call requests (Admin only)"""
    result = await db.execute(
        select(CallRequest).order_by(CallRequest.created_at.desc())
    )
    return result.scalars().all()

@router.patch("/{request_id}", response_model=CallRequestResponse)
async def update_call_request_status(
    request_id: str,
    status_update: CallRequestUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
) -> Any:
    """Update status of a call request (Admin only)"""
    result = await db.execute(select(CallRequest).where(CallRequest.id == request_id))
    call_request = result.scalar_one_or_none()
    
    if not call_request:
        raise HTTPException(status_code=404, detail="Call request not found")
        
    call_request.status = status_update.status
    await db.commit()
    await db.refresh(call_request)
    return call_request
