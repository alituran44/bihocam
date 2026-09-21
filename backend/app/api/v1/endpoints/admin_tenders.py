import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, or_, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User, UserRole
from app.models.tender import Tender, TenderBid, TenderStatus, TenderBidStatus
from app.schemas.tender import (
    TenderOut,
    TenderBidOut,
    TenderStats,
)
from app.services.tender_service import build_whatsapp_direct_link

logger = logging.getLogger(__name__)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için Admin yetkisi gereklidir."
        )
    return current_user


@router.get("/stats", response_model=TenderStats)
async def get_tender_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Özel Ders Talep Masası KPI İstatistikleri.
    """
    total_tenders = await db.scalar(select(func.count(Tender.id))) or 0
    open_tenders = await db.scalar(select(func.count(Tender.id)).where(Tender.status == TenderStatus.OPEN.value)) or 0
    bidding_tenders = await db.scalar(select(func.count(Tender.id)).where(Tender.status == TenderStatus.BIDDING.value)) or 0
    accepted_tenders = await db.scalar(select(func.count(Tender.id)).where(Tender.status == TenderStatus.ACCEPTED.value)) or 0
    paid_tenders = await db.scalar(select(func.count(Tender.id)).where(Tender.status == TenderStatus.PAID.value)) or 0
    total_bids = await db.scalar(select(func.count(TenderBid.id))) or 0

    return {
        "total_tenders": total_tenders,
        "open_tenders": open_tenders,
        "bidding_tenders": bidding_tenders,
        "accepted_tenders": accepted_tenders,
        "paid_tenders": paid_tenders,
        "total_bids": total_bids,
    }


@router.get("", response_model=dict)
async def list_admin_tenders(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    mode: Optional[str] = None,
    city: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin için tüm özel ders taleplerini sayfalanmış ve filtreli olarak listeler.
    """
    stmt = (
        select(Tender)
        .options(
            selectinload(Tender.student),
            selectinload(Tender.bids).selectinload(TenderBid.teacher)
        )
    )

    if status_filter and status_filter != "ALL":
        stmt = stmt.where(Tender.status == status_filter)
    if mode:
        stmt = stmt.where(Tender.mode == mode)
    if city:
        stmt = stmt.where(Tender.city.ilike(f"%{city}%"))
    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Tender.title.ilike(search_pattern),
                Tender.subject.ilike(search_pattern),
                Tender.description.ilike(search_pattern),
            )
        )

    # Toplam sayım
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_count = await db.scalar(count_stmt) or 0

    # Sıralama ve sayfalama
    offset = (page - 1) * limit
    stmt = stmt.order_by(desc(Tender.created_at)).limit(limit).offset(offset)
    result = await db.execute(stmt)
    tenders = result.scalars().all()

    items = []
    for t in tenders:
        bids_out = []
        for b in t.bids:
            bids_out.append({
                "id": b.id,
                "tender_id": b.tender_id,
                "teacher_id": b.teacher_id,
                "teacher_name": b.teacher.full_name if b.teacher else "Eğitmen",
                "teacher_email": b.teacher.email if b.teacher else None,
                "teacher_phone": b.teacher.phone if b.teacher else None,
                "offered_price": b.offered_price,
                "currency": b.currency,
                "proposal_letter": b.proposal_letter,
                "status": b.status,
                "client_ip": b.client_ip,
                "client_port": b.client_port,
                "created_at": b.created_at,
            })

        items.append({
            "id": t.id,
            "student_id": t.student_id,
            "student_name": t.student.full_name if t.student else "Öğrenci",
            "student_email": t.student.email if t.student else None,
            "student_phone": t.student.phone if t.student else None,
            "title": t.title,
            "subject": t.subject,
            "category_name": t.category_name,
            "description": t.description,
            "mode": t.mode,
            "city": t.city,
            "district": t.district,
            "target_date_info": t.target_date_info,
            "min_budget": t.min_budget,
            "max_budget": t.max_budget,
            "currency": t.currency,
            "status": t.status,
            "accepted_bid_id": t.accepted_bid_id,
            "bids_count": t.bids_count,
            "version": t.version,
            "client_ip": t.client_ip,
            "client_port": t.client_port,
            "expires_at": t.expires_at,
            "created_at": t.created_at,
            "updated_at": t.updated_at,
            "bids": bids_out,
        })

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit,
    }


@router.get("/{id}", response_model=dict)
async def get_admin_tender_detail(
    id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Belirli bir ders talebinin 5651 teknik logları, tüm teklifleri ve öğrenci/öğretmen iletişim detayları.
    """
    stmt = (
        select(Tender)
        .options(
            selectinload(Tender.student),
            selectinload(Tender.bids).selectinload(TenderBid.teacher)
        )
        .where(Tender.id == id)
    )
    result = await db.execute(stmt)
    tender = result.scalar_one_or_none()

    if not tender:
        raise HTTPException(status_code=404, detail="Özel ders talebi bulunamadı.")

    bids_out = []
    for b in tender.bids:
        wa_link = build_whatsapp_direct_link(
            b.teacher.phone if b.teacher else None,
            tender.subject,
            tender.student.full_name if tender.student else "Öğrenci"
        )
        bids_out.append({
            "id": b.id,
            "tender_id": b.tender_id,
            "teacher_id": b.teacher_id,
            "teacher_name": b.teacher.full_name if b.teacher else "Eğitmen",
            "teacher_email": b.teacher.email if b.teacher else None,
            "teacher_phone": b.teacher.phone if b.teacher else None,
            "teacher_tc_vkn": b.teacher.tax_info.get("tc_kimlik") if (b.teacher and b.teacher.tax_info) else None,
            "offered_price": b.offered_price,
            "currency": b.currency,
            "proposal_letter": b.proposal_letter,
            "status": b.status,
            "client_ip": b.client_ip,
            "client_port": b.client_port,
            "created_at": b.created_at,
            "whatsapp_link": wa_link,
        })

    student_wa = build_whatsapp_direct_link(
        tender.student.phone if tender.student else None,
        tender.subject,
        "BiHocam Destek Ekibi"
    )

    return {
        "id": tender.id,
        "student_id": tender.student_id,
        "student_name": tender.student.full_name if tender.student else "Öğrenci",
        "student_email": tender.student.email if tender.student else None,
        "student_phone": tender.student.phone if tender.student else None,
        "student_whatsapp": student_wa,
        "title": tender.title,
        "subject": tender.subject,
        "category_name": tender.category_name,
        "description": tender.description,
        "mode": tender.mode,
        "city": tender.city,
        "district": tender.district,
        "target_date_info": tender.target_date_info,
        "min_budget": tender.min_budget,
        "max_budget": tender.max_budget,
        "currency": tender.currency,
        "status": tender.status,
        "accepted_bid_id": tender.accepted_bid_id,
        "bids_count": tender.bids_count,
        "version": tender.version,
        "client_ip": tender.client_ip,
        "client_port": tender.client_port,
        "expires_at": tender.expires_at,
        "created_at": tender.created_at,
        "updated_at": tender.updated_at,
        "bids": bids_out,
    }


@router.post("/{id}/status")
async def update_tender_status_admin(
    id: str,
    new_status: str = Query(..., description="OPEN, BIDDING, ACCEPTED, PAID, COMPLETED, CANCELLED"),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin müdahalesiyle ders talebi durumunu güncelleme.
    """
    stmt = select(Tender).where(Tender.id == id)
    res = await db.execute(stmt)
    tender = res.scalar_one_or_none()

    if not tender:
        raise HTTPException(status_code=404, detail="Özel ders talebi bulunamadı.")

    tender.status = new_status
    await db.commit()

    return {"success": True, "message": f"Ders talebi durumu '{new_status}' olarak güncellendi."}
