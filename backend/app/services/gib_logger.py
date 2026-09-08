import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import Request
from sqlalchemy import select, func as sql_func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.gib_log import GibAuditLog, GibServiceType, GibActionType
from app.models.user import User
from app.models.course import Course
from app.models.order import Order, OrderItem, OrderStatus
from app.models.live_class import LiveClassReservation
from app.services.gib_service import validate_gib_compliance

logger = logging.getLogger(__name__)


def extract_client_network_info(request: Optional[Request] = None) -> tuple[str, int, str]:
    """
    5651 ve VUK Mukerrer 257 kapsaminda istemcinin gercek IP adresi, portu ve User-Agent bilgisini cikarir.
    """
    if not request:
        return "127.0.0.1", 443, "System/Cron-Sync"

    # Gercek IP (Reverse proxy / Cloudflare / Nginx arkasi)
    client_ip = (
        request.headers.get("cf-connecting-ip")
        or request.headers.get("x-real-ip")
        or (request.headers.get("x-forwarded-for").split(",")[0].strip() if request.headers.get("x-forwarded-for") else None)
        or (request.client.host if request.client else "127.0.0.1")
    )

    client_port = request.client.port if request.client else 443
    user_agent = request.headers.get("user-agent", "Unknown")[:500]

    return client_ip, client_port, user_agent


async def log_gib_event(
    db: AsyncSession,
    service_type: str,
    action: str,
    item_id: str,
    item_reference_no: str,
    item_title: str,
    teacher: User,
    gross_amount: float = 0.0,
    commission_rate: float = 0.20,
    commission_amount: float = 0.0,
    teacher_net_earnings: float = 0.0,
    item_category: Optional[str] = None,
    item_url: Optional[str] = None,
    buyer: Optional[User] = None,
    payment_gateway_ref: Optional[str] = None,
    request: Optional[Request] = None,
) -> GibAuditLog:
    """
    GIB BTRANS denetim kutugune yeni bir olay kaydeder.
    """
    client_ip, client_port, user_agent = extract_client_network_info(request)

    teacher_tax = teacher.tax_info or {}
    
    # Egitmenin varsayilan IBAN'ini bul
    teacher_iban = None
    if teacher.bank_accounts:
        for b in teacher.bank_accounts:
            if b.is_default or not teacher_iban:
                teacher_iban = b.iban
    if not teacher_iban:
        teacher_iban = teacher_tax.get("iban")

    # Mevzuat uyumluluk kontrolu
    is_compliant, missing = validate_gib_compliance(teacher_tax, teacher_iban)

    # Otomatik komisyon hesaplama (eger verilmemisse)
    if commission_amount <= 0 and gross_amount > 0:
        commission_amount = round(gross_amount * commission_rate, 2)
    if teacher_net_earnings <= 0 and gross_amount > 0:
        teacher_net_earnings = round(gross_amount - commission_amount, 2)

    log_entry = GibAuditLog(
        service_type=service_type,
        action=action,
        item_id=str(item_id),
        item_reference_no=item_reference_no,
        item_title=item_title,
        item_category=item_category,
        item_url=item_url,
        gross_amount=gross_amount,
        commission_rate=commission_rate,
        commission_amount=commission_amount,
        teacher_net_earnings=teacher_net_earnings,
        currency="TRY",
        teacher_id=teacher.id,
        teacher_name=teacher.full_name,
        teacher_tc_vkn=teacher_tax.get("tc_kimlik") or teacher_tax.get("tc_kimlik_no") or None,
        teacher_company_type=teacher_tax.get("company_type") or "Bireysel (Sahis)",
        teacher_company_title=teacher_tax.get("company_title") or None,
        teacher_tax_office=teacher_tax.get("tax_office") or None,
        teacher_city=teacher_tax.get("city") or None,
        teacher_district=teacher_tax.get("district") or None,
        teacher_address=teacher_tax.get("address") or teacher_tax.get("billing_address") or None,
        teacher_iban=teacher_iban,
        teacher_phone=teacher.phone,
        teacher_email=teacher.email,
        buyer_id=buyer.id if buyer else None,
        buyer_name=buyer.full_name if buyer else None,
        buyer_email=buyer.email if buyer else None,
        payment_gateway_ref=payment_gateway_ref,
        client_ip=client_ip,
        client_port=client_port,
        user_agent=user_agent,
        is_compliant=is_compliant,
        missing_fields=missing,
    )

    db.add(log_entry)
    try:
        await db.flush()
    except Exception as e:
        logger.error(f"GIB Audit Log kaydedilemedi: {e}")

    return log_entry


async def sync_existing_records_to_gib_logs(db: AsyncSession) -> int:
    """
    Mevcut yayindaki kurslari, satilan siparisleri ve canli dersleri
    GIB denetim tablosuna gecmis kayit olarak aktarir (eger onceden eklenmemisse).
    """
    added_count = 0

    # 1. Mevcut yayindaki kurslari ekle
    courses_stmt = (
        select(Course)
        .options(selectinload(Course.teacher).selectinload(User.bank_accounts))
    )
    courses_res = await db.execute(courses_stmt)
    courses = courses_res.scalars().all()

    for c in courses:
        if not c.teacher:
            continue

        ref_no = f"KRS-{c.id[:8].upper()}"
        # Onceden loglanmis mi kontrol et
        exists = await db.execute(select(GibAuditLog.id).where(GibAuditLog.item_reference_no == ref_no))
        if exists.scalar():
            continue

        teacher = c.teacher
        tax = teacher.tax_info or {}
        iban = None
        if teacher.bank_accounts:
            for b in teacher.bank_accounts:
                if b.is_default or not iban:
                    iban = b.iban
        if not iban:
            iban = tax.get("iban")

        is_compliant, missing = validate_gib_compliance(tax, iban)
        gross = float(c.discount_price if c.discount_price and c.discount_price > 0 else (c.price or 0))
        comm = round(gross * 0.35, 2)
        net = round(gross - comm, 2)

        s_type = "EDUCATION_PROGRAM" if "program" in (c.title or "").lower() else "COURSE"

        log_item = GibAuditLog(
            service_type=s_type,
            action="PUBLISH",
            item_id=str(c.id),
            item_reference_no=ref_no,
            item_title=c.title or "Kurs",
            item_category="Online Egitim",
            item_url=f"/courses/{c.slug}" if hasattr(c, "slug") and c.slug else f"/courses/{c.id}",
            gross_amount=gross,
            commission_rate=0.35,
            commission_amount=comm,
            teacher_net_earnings=net,
            currency="TRY",
            teacher_id=teacher.id,
            teacher_name=teacher.full_name,
            teacher_tc_vkn=tax.get("tc_kimlik") or tax.get("tc_kimlik_no") or None,
            teacher_company_type=tax.get("company_type") or "Bireysel (Sahis)",
            teacher_company_title=tax.get("company_title") or None,
            teacher_tax_office=tax.get("tax_office") or None,
            teacher_city=tax.get("city") or None,
            teacher_district=tax.get("district") or None,
            teacher_address=tax.get("address") or tax.get("billing_address") or None,
            teacher_iban=iban,
            teacher_phone=teacher.phone,
            teacher_email=teacher.email,
            client_ip="127.0.0.1",
            client_port=443,
            user_agent="BiHocam-System/Platform-Init",
            is_compliant=is_compliant,
            missing_fields=missing,
            created_at=c.created_at or datetime.now(),
        )
        db.add(log_item)
        added_count += 1

    # 2. Canli ders rezervasyonlarini ekle
    res_stmt = (
        select(LiveClassReservation)
        .options(
            selectinload(LiveClassReservation.teacher).selectinload(User.bank_accounts),
            selectinload(LiveClassReservation.student),
        )
    )
    res_res = await db.execute(res_stmt)
    reservations = res_res.scalars().all()

    for r in reservations:
        if not r.teacher:
            continue

        ref_no = f"RES-{r.id[:8].upper()}"
        exists = await db.execute(select(GibAuditLog.id).where(GibAuditLog.item_reference_no == ref_no))
        if exists.scalar():
            continue

        teacher = r.teacher
        tax = teacher.tax_info or {}
        iban = None
        if teacher.bank_accounts:
            for b in teacher.bank_accounts:
                if b.is_default or not iban:
                    iban = b.iban
        if not iban:
            iban = tax.get("iban")

        is_compliant, missing = validate_gib_compliance(tax, iban)
        gross = float(r.discount_price if r.discount_price and r.discount_price > 0 else r.price)
        comm = round(gross * 0.20, 2)
        net = round(gross - comm, 2)

        lesson_label = "Online Canli Ders" if r.lesson_type == "online" else "Yuz Yuze Birebir Ders"

        log_item = GibAuditLog(
            service_type="LIVE_CLASS",
            action="CREATE" if r.status == "pending" else "PURCHASE",
            item_id=str(r.id),
            item_reference_no=ref_no,
            item_title=f"Birebir {lesson_label} ({r.date} {r.start_time})",
            item_category="Canli Ders",
            item_url=f"/teachers/{teacher.id}",
            gross_amount=gross,
            commission_rate=0.20,
            commission_amount=comm,
            teacher_net_earnings=net,
            currency="TRY",
            teacher_id=teacher.id,
            teacher_name=teacher.full_name,
            teacher_tc_vkn=tax.get("tc_kimlik") or tax.get("tc_kimlik_no") or None,
            teacher_company_type=tax.get("company_type") or "Bireysel (Sahis)",
            teacher_company_title=tax.get("company_title") or None,
            teacher_tax_office=tax.get("tax_office") or None,
            teacher_city=tax.get("city") or None,
            teacher_district=tax.get("district") or None,
            teacher_address=tax.get("address") or tax.get("billing_address") or None,
            teacher_iban=iban,
            teacher_phone=teacher.phone,
            teacher_email=teacher.email,
            buyer_id=r.student_id,
            buyer_name=r.student.full_name if r.student else None,
            buyer_email=r.student.email if r.student else None,
            payment_gateway_ref=f"PAYTR-LIVE-{r.id[:10]}",
            client_ip="127.0.0.1",
            client_port=443,
            user_agent="BiHocam-System/Sync",
            is_compliant=is_compliant,
            missing_fields=missing,
            created_at=r.created_at or datetime.now(),
        )
        db.add(log_item)
        added_count += 1

    # 3. Odenmis siparisleri ekle
    order_stmt = (
        select(Order)
        .options(
            selectinload(Order.user),
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.teacher).selectinload(User.bank_accounts),
        )
        .where(Order.status == OrderStatus.PAID)
    )
    order_res = await db.execute(order_stmt)
    orders = order_res.scalars().all()

    for o in orders:
        for oi in o.order_items:
            ref_no = f"ORD-{o.order_number}-{oi.id[:6].upper()}"
            exists = await db.execute(select(GibAuditLog.id).where(GibAuditLog.item_reference_no == ref_no))
            if exists.scalar():
                continue

            teacher = oi.course.teacher if oi.course else None
            if not teacher:
                continue

            tax = teacher.tax_info or {}
            iban = None
            if teacher.bank_accounts:
                for b in teacher.bank_accounts:
                    if b.is_default or not iban:
                        iban = b.iban
            if not iban:
                iban = tax.get("iban")

            is_compliant, missing = validate_gib_compliance(tax, iban)
            gross = float(oi.final_price or oi.price or 0)
            comm = float(oi.platform_commission or round(gross * 0.35, 2))
            net = float(oi.teacher_earnings or round(gross - comm, 2))

            if comm <= 0 or net < 0:
                comm = round(gross * 0.35, 2)
                net = round(gross - comm, 2)

            log_item = GibAuditLog(
                service_type="COURSE",
                action="PURCHASE",
                item_id=str(oi.id),
                item_reference_no=ref_no,
                item_title=oi.course.title if oi.course else "Video Kurs",
                item_category="Online Egitim",
                item_url=f"/courses/{oi.course_id}",
                gross_amount=gross,
                commission_rate=0.35,
                commission_amount=comm,
                teacher_net_earnings=net,
                currency="TRY",
                teacher_id=teacher.id,
                teacher_name=teacher.full_name,
                teacher_tc_vkn=tax.get("tc_kimlik") or tax.get("tc_kimlik_no") or None,
                teacher_company_type=tax.get("company_type") or "Bireysel (Sahis)",
                teacher_company_title=tax.get("company_title") or None,
                teacher_tax_office=tax.get("tax_office") or None,
                teacher_city=tax.get("city") or None,
                teacher_district=tax.get("district") or None,
                teacher_address=tax.get("address") or tax.get("billing_address") or None,
                teacher_iban=iban,
                teacher_phone=teacher.phone,
                teacher_email=teacher.email,
                buyer_id=o.user_id,
                buyer_name=o.user.full_name if o.user else None,
                buyer_email=o.user.email if o.user else None,
                payment_gateway_ref=o.payment_gateway_transaction_id or o.order_number,
                client_ip="127.0.0.1",
                client_port=443,
                user_agent="BiHocam-System/Order-Sync",
                is_compliant=is_compliant,
                missing_fields=missing,
                created_at=o.paid_at or o.created_at or datetime.now(),
            )
            db.add(log_item)
            added_count += 1

    if added_count > 0:
        await db.commit()

    return added_count
