import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.models.user import User, UserRole
from app.models.tender import Tender, TenderBid, TenderStatus, TenderBidStatus
from app.schemas.tender import (
    TenderCreate,
    TenderUpdate,
    TenderOut,
    TenderBidCreate,
    TenderBidOut,
    TenderAcceptOut,
)
from app.services.tender_service import (
    create_tender,
    submit_tender_bid,
    accept_tender_bid,
    update_tender,
    delete_tender,
    build_whatsapp_direct_link,
)

logger = logging.getLogger(__name__)

router = APIRouter()


def _format_tender_out(tender: Tender, current_user_id: Optional[str] = None, is_admin: bool = False) -> dict:
    """Tender modelini güvenli ve zenginleştirilmiş çıktı dict'ine çevirir."""
    bids_out = []
    accepted_bid_out = None

    is_owner = current_user_id is not None and str(tender.student_id) == str(current_user_id)

    if tender.bids:
        for b in tender.bids:
            is_own_bid = current_user_id is not None and str(b.teacher_id) == str(current_user_id)
            # Güvenlik & Gizlilik Kuralı:
            # Sadece Admin, ilanı açan Öğrenci veya teklifi veren Eğitmenin kendisi teklif detayını görebilir.
            if not (is_admin or is_owner or is_own_bid):
                continue

            bid_dict = {
                "id": b.id,
                "tender_id": b.tender_id,
                "teacher_id": b.teacher_id,
                "teacher_name": b.teacher.full_name if b.teacher else "Eğitmen",
                "teacher_avatar": b.teacher.avatar_url if b.teacher else None,
                "teacher_title": getattr(b.teacher, "title", None) or getattr(b.teacher, "headline", None) or "Uzman Eğitmen",
                "teacher_rating": 4.9,
                "teacher_reviews_count": 12,
                "offered_price": b.offered_price,
                "currency": b.currency,
                "proposal_letter": b.proposal_letter,
                "status": b.status,
                "client_ip": b.client_ip if is_admin else None,
                "client_port": b.client_port if is_admin else None,
                "created_at": b.created_at,
            }
            bids_out.append(bid_dict)
            if tender.accepted_bid_id == b.id:
                accepted_bid_out = bid_dict

    return {
        "id": tender.id,
        "student_id": tender.student_id,
        "student_name": tender.student.full_name if tender.student else "Öğrenci",
        "student_avatar": tender.student.avatar_url if tender.student else None,
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
        "client_ip": tender.client_ip if is_admin else None,
        "client_port": tender.client_port if is_admin else None,
        "expires_at": tender.expires_at,
        "created_at": tender.created_at,
        "updated_at": tender.updated_at,
        "bids": bids_out,
        "accepted_bid": accepted_bid_out,
    }


@router.post("", response_model=TenderOut, status_code=status.HTTP_201_CREATED)
async def create_new_tender(
    tender_in: TenderCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Öğrenci yeni bir özel ders talebi açar.
    VUK 538/595 ve 5651 kapsamındaki IP ve Port teknik izleri kaydedilir.
    """
    tender = await create_tender(
        db=db,
        student=current_user,
        data_dict=tender_in.model_dump(),
        request=request
    )
    # İlişkili student kaydıyla birlikte dön
    stmt = (
        select(Tender)
        .options(selectinload(Tender.student), selectinload(Tender.bids))
        .where(Tender.id == tender.id)
    )
    res = await db.execute(stmt)
    full_tender = res.scalar_one()
    is_admin = current_user.role == UserRole.ADMIN
    return _format_tender_out(full_tender, current_user.id, is_admin=is_admin)


@router.get("/public", response_model=List[TenderOut])
async def list_public_tenders(
    subject: Optional[str] = None,
    mode: Optional[str] = None,
    city: Optional[str] = None,
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Eğitmenlerin inceleyip teklif verebileceği açık özel ders talepleri havuzu.
    """
    stmt = (
        select(Tender)
        .options(
            selectinload(Tender.student),
            selectinload(Tender.bids).selectinload(TenderBid.teacher)
        )
        .where(
            Tender.status.in_([TenderStatus.OPEN.value, TenderStatus.BIDDING.value]),
            or_(Tender.min_budget == None, Tender.min_budget >= 0)
        )
    )

    if subject:
        stmt = stmt.where(Tender.subject.ilike(f"%{subject}%"))
    if mode:
        stmt = stmt.where(Tender.mode == mode)
    if city:
        stmt = stmt.where(Tender.city.ilike(f"%{city}%"))

    stmt = stmt.order_by(desc(Tender.created_at)).limit(limit).offset(offset)
    result = await db.execute(stmt)
    tenders = result.scalars().all()

    user_id = current_user.id if current_user else None
    is_admin = current_user.role == UserRole.ADMIN if current_user else False
    return [_format_tender_out(t, user_id, is_admin=is_admin) for t in tenders]


@router.get("/my", response_model=List[TenderOut])
async def get_my_tenders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Giriş yapan öğrencinin kendi açtığı özel ders talepleri ve gelen tüm teklifler.
    """
    stmt = (
        select(Tender)
        .options(
            selectinload(Tender.student),
            selectinload(Tender.bids).selectinload(TenderBid.teacher)
        )
        .where(Tender.student_id == current_user.id)
        .order_by(desc(Tender.created_at))
    )
    result = await db.execute(stmt)
    tenders = result.scalars().all()
    is_admin = current_user.role == UserRole.ADMIN
    return [_format_tender_out(t, current_user.id, is_admin=is_admin) for t in tenders]


@router.get("/my-bids", response_model=List[TenderBidOut])
async def get_my_bids(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Giriş yapan eğitmenin verdiği tüm özel ders teklifleri ve durumları.
    """
    stmt = (
        select(TenderBid)
        .options(selectinload(TenderBid.teacher), selectinload(TenderBid.tender))
        .where(TenderBid.teacher_id == current_user.id)
        .order_by(desc(TenderBid.created_at))
    )
    result = await db.execute(stmt)
    bids = result.scalars().all()

    is_admin = current_user.role == UserRole.ADMIN
    out = []
    for b in bids:
        out.append({
            "id": b.id,
            "tender_id": b.tender_id,
            "teacher_id": b.teacher_id,
            "teacher_name": b.teacher.full_name if b.teacher else "Eğitmen",
            "teacher_avatar": b.teacher.avatar_url if b.teacher else None,
            "teacher_title": b.teacher.title if b.teacher else "Uzman Eğitmen",
            "offered_price": b.offered_price,
            "currency": b.currency,
            "proposal_letter": b.proposal_letter,
            "status": b.status,
            "client_ip": b.client_ip if is_admin else None,
            "client_port": b.client_port if is_admin else None,
            "created_at": b.created_at,
        })
    return out


@router.get("/{id}", response_model=TenderOut)
async def get_tender_detail(
    id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Belirli bir özel ders talebinin detayını çeker.
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

    user_id = current_user.id if current_user else None
    is_admin = current_user.role == UserRole.ADMIN if current_user else False
    return _format_tender_out(tender, user_id, is_admin=is_admin)


@router.post("/{id}/bids", response_model=TenderBidOut, status_code=status.HTTP_201_CREATED)
async def submit_bid(
    id: str,
    bid_in: TenderBidCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Eğitmen açık bir talebe teklif verir.
    İletişim bilgileri otomatik filtrelenir ve GİB teknik izleri kaydedilir.
    """
    bid = await submit_tender_bid(
        db=db,
        tender_id=id,
        teacher=current_user,
        offered_price=bid_in.offered_price,
        proposal_letter=bid_in.proposal_letter,
        request=request
    )

    is_admin = current_user.role == UserRole.ADMIN
    return {
        "id": bid.id,
        "tender_id": bid.tender_id,
        "teacher_id": bid.teacher_id,
        "teacher_name": current_user.full_name,
        "teacher_avatar": current_user.avatar_url,
        "teacher_title": getattr(current_user, "title", None) or getattr(current_user, "headline", None) or "Uzman Eğitmen",
        "offered_price": bid.offered_price,
        "currency": bid.currency,
        "proposal_letter": bid.proposal_letter,
        "status": bid.status,
        "client_ip": bid.client_ip if is_admin else None,
        "client_port": bid.client_port if is_admin else None,
        "created_at": bid.created_at,
    }


@router.post("/{id}/accept/{bid_id}", response_model=TenderAcceptOut)
async def accept_bid(
    id: str,
    bid_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Öğrenci bir teklifi kabul eder (Optimistic Lock ile güvenli geçiş).
    Kabul sonrasında doğrudan eğitmenin WhatsApp iletişim bağlantısı sunulur.
    """
    tender, selected_bid = await accept_tender_bid(
        db=db,
        tender_id=id,
        bid_id=bid_id,
        student=current_user,
        request=request
    )

    teacher = selected_bid.teacher
    wa_link = build_whatsapp_direct_link(
        phone=teacher.phone,
        subject=tender.subject,
        student_name=current_user.full_name
    )

    return {
        "success": True,
        "message": "Teklif başarıyla kabul edildi! Eğitmeninizle doğrudan iletişime geçebilirsiniz.",
        "tender_id": tender.id,
        "accepted_bid_id": selected_bid.id,
        "teacher_id": teacher.id,
        "teacher_name": teacher.full_name,
        "teacher_phone": teacher.phone,
        "teacher_whatsapp_link": wa_link,
    }


@router.post("/{id}/cancel")
async def cancel_tender(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Öğrencinin kendi talebini iptal etmesi.
    """
    stmt = select(Tender).where(Tender.id == id)
    res = await db.execute(stmt)
    tender = res.scalar_one_or_none()

    if not tender:
        raise HTTPException(status_code=404, detail="Özel ders talebi bulunamadı.")

    if tender.student_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu talebi iptal etme yetkiniz yok.")

    tender.status = TenderStatus.CANCELLED.value
    await db.commit()

    return {"success": True, "message": "Ders talebi iptal edildi."}


@router.put("/{id}", response_model=TenderOut)
async def update_existing_tender(
    id: str,
    tender_in: TenderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Öğrencinin kendi açtığı ders talebini düzenlemesi.
    """
    tender = await update_tender(
        db=db,
        tender_id=id,
        user=current_user,
        data_dict=tender_in.model_dump(exclude_unset=True),
    )
    stmt = (
        select(Tender)
        .options(selectinload(Tender.student), selectinload(Tender.bids).selectinload(TenderBid.teacher))
        .where(Tender.id == tender.id)
    )
    res = await db.execute(stmt)
    full_tender = res.scalar_one()
    is_admin = current_user.role == UserRole.ADMIN
    return _format_tender_out(full_tender, current_user.id, is_admin=is_admin)


@router.delete("/{id}")
async def delete_existing_tender(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Öğrencinin kendi açtığı ders talebini tamamen silmesi.
    """
    await delete_tender(
        db=db,
        tender_id=id,
        user=current_user,
    )
    return {"success": True, "message": "Özel ders talebi başarıyla silindi."}
