import re
import logging
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Request
from sqlalchemy import select, func as sql_func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.tender import Tender, TenderBid, TenderStatus, TenderBidStatus
from app.models.user import User, UserRole
from app.models.gib_log import GibServiceType, GibActionType
from app.models.notification import NotificationType, NotificationPriority
from app.models.teacher_application import TeacherApplication
from app.services.notification_service import NotificationService
from app.services.gib_logger import log_gib_event, extract_client_network_info

logger = logging.getLogger(__name__)

# Disintermediation (Platform dışına kaçırma) Filtreleri
# 1. GSM & Telefon Kalıpları: Standart, tireli, noktalı veya harf aralıklı (örn: 0 5 3 2 ..., 0-5-3-2...)
PHONE_PATTERN = re.compile(
    r"(?:\+?90|0)?[\s.-]*5[\s.-]*(?:\d[\s.-]*){9}|"  # 05xx xxx xx xx (aralıklı, tireli, noktalı)
    r"\b[0-9]{3}[\s.-][0-9]{3}[\s.-][0-9]{4}\b|"  # 555-123-4567
    r"\b(?:sıfır\s+)?beş\s*(?:yüz|bin|\d)?|"  # Harfle numara başlatma
    r"(?:(?:t\.me|wa\.me|instagram\.com|twitter\.com|x\.com)\/[\w\d+._-]+)|"  # Direkt linkler
    r"(?:\b(?:whatsapp|wp|telegram|instagram|ig|dm|snapchat|tiktok|discord)\b\s*[:=]?\s*@?[\w\d+._-]{3,})|"  # Sosyal medya @ nickleri
    r"(?:\b(?:arayın|ara|numaram|tel|gsm|ulaşın)\b[:\s]*[\w\d+._-]{4,})",
    re.IGNORECASE
)

# 2. E-posta Kalıpları: Standart ve gizlenmiş (hoca [at] gmail [dot] com, vb.)
EMAIL_PATTERN = re.compile(
    r"[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}|"
    r"[\w.-]+\s*(?:@|\[at\]|\(at\))\s*[\w.-]+\s*(?:\.|\[dot\]|\(dot\))\s*[a-zA-Z]{2,}",
    re.IGNORECASE
)


def sanitize_proposal_text(text: str) -> Tuple[str, bool]:
    """
    Eğitmenin veya öğrencinin mesajındaki telefon numaralarını, e-postaları ve 
    harici sosyal medya bağlantılarını platform güvenliği ve KVKK gereğince maskeler.
    Dönen değer: (temizlenmis_metin, ihlal_var_mi)
    """
    if not text:
        return "", False

    cleaned = text
    has_violation = False

    if EMAIL_PATTERN.search(cleaned):
        cleaned = EMAIL_PATTERN.sub("[E-posta Güvenlik Nedeniyle Maskelenmiştir]", cleaned)
        has_violation = True

    if PHONE_PATTERN.search(cleaned):
        cleaned = PHONE_PATTERN.sub("[İletişim Bilgisi Güvenlik Nedeniyle Maskelenmiştir]", cleaned)
        has_violation = True

    return cleaned, has_violation


def _normalize_branch_text(text: str) -> str:
    """Türkçe karakterleri ve boşlukları normalleştirir."""
    if not text:
        return ""
    tr_map = {
        ord("İ"): "i", ord("I"): "i", ord("ı"): "i", ord("i"): "i",
        ord("Ğ"): "g", ord("ğ"): "g",
        ord("Ü"): "u", ord("ü"): "u",
        ord("Ş"): "s", ord("ş"): "s",
        ord("Ö"): "o", ord("ö"): "o",
        ord("Ç"): "c", ord("ç"): "c",
    }
    return text.translate(tr_map).lower().strip()


async def notify_teachers_for_new_tender(db: AsyncSession, tender: Tender, student: User) -> int:
    """
    Öğrenci ders talebi açtığında branş bazında kayıt yapan veya uzmanlığı bulunan
    öğretmenlere anında sistem içi bildirim iletir.
    """
    try:
        # 1. Aktif tüm öğretmenleri getir
        stmt = select(User).where(
            User.role == UserRole.TEACHER,
            User.is_active == True,
            User.id != student.id
        )
        res = await db.execute(stmt)
        teachers = res.scalars().all()
        if not teachers:
            return 0

        # 2. Talebin branş terimleri ve tokenleri
        subject_norm = _normalize_branch_text(tender.subject)
        category_norm = _normalize_branch_text(tender.category_name or "")
        title_norm = _normalize_branch_text(tender.title or "")
        
        all_tender_text = f"{subject_norm} {category_norm} {title_norm}"
        tender_tokens = {w for w in re.split(r"[\s,./\-+]+", all_tender_text) if len(w) >= 3}

        # 3. Öğretmenlerin başvuru branşlarını da haritaya al
        teacher_ids = [t.id for t in teachers]
        app_stmt = select(TeacherApplication).where(TeacherApplication.user_id.in_(teacher_ids))
        app_res = await db.execute(app_stmt)
        apps_by_user = {app.user_id: app.branches for app in app_res.scalars().all() if app.branches}

        matched_teacher_ids = []

        for teacher in teachers:
            teacher_branches: list[str] = []
            if teacher.expertise_tags and isinstance(teacher.expertise_tags, list):
                teacher_branches.extend(teacher.expertise_tags)
            if teacher.id in apps_by_user and isinstance(apps_by_user[teacher.id], list):
                teacher_branches.extend(apps_by_user[teacher.id])
            if getattr(teacher, "headline", None):
                teacher_branches.append(teacher.headline)

            is_match = False
            for branch in teacher_branches:
                b_norm = _normalize_branch_text(str(branch))
                if not b_norm:
                    continue
                # Doğrudan alt metin veya içerilme kontrolü
                if b_norm in subject_norm or subject_norm in b_norm:
                    is_match = True
                    break
                # Kelime kökü/token kesişimi
                branch_tokens = {w for w in re.split(r"[\s,./\-+]+", b_norm) if len(w) >= 3}
                if tender_tokens.intersection(branch_tokens):
                    is_match = True
                    break

            if is_match:
                matched_teacher_ids.append(teacher.id)

        # Eğer branş bazında eşleşen öğretmen bulunamazsa, sistemdeki tüm aktif öğretmenler haberdar olsun (havuzu boş bırakmamak için)
        target_teacher_ids = matched_teacher_ids if matched_teacher_ids else [t.id for t in teachers]

        if target_teacher_ids:
            notification_service = NotificationService(db)
            min_b = f"{tender.min_budget:,.0f}" if tender.min_budget else "0"
            max_b = f"{tender.max_budget:,.0f}" if tender.max_budget else "0"
            budget_str = f"{min_b} - {max_b} {tender.currency}"

            await notification_service.send_notification(
                user_ids=target_teacher_ids,
                notification_type=NotificationType.NEW_TENDER_FOR_BRANCH,
                title="🔔 Branşınıza Uygun Yeni Özel Ders Talebi!",
                message=f"{student.full_name}, '{tender.subject}' branşında yeni bir özel ders talebi açtı. Bütçe: {budget_str}. Hemen inceleyin ve ilk teklifi siz verin!",
                data={
                    "tender_id": tender.id,
                    "subject": tender.subject,
                    "student_name": student.full_name,
                    "mode": tender.mode,
                    "city": tender.city,
                },
                priority=NotificationPriority.HIGH,
                action_url="/dashboard/teacher/tenders",
                action_label="Talebi İncele & Teklif Ver",
                sender_id=student.id,
            )
            logger.info(f"Tender {tender.id} icin {len(target_teacher_ids)} ogretmene brans bildirimi iletildi.")
            return len(target_teacher_ids)
        return 0
    except Exception as e:
        logger.warning(f"Ogretmen brans bildirimi gonderilirken hata olustu: {e}")
        return 0


async def create_tender(
    db: AsyncSession,
    student: User,
    data_dict: dict,
    request: Optional[Request] = None
) -> Tender:
    """
    Öğrenci için yeni bir özel ders talebi oluşturur.
    5651 ve GİB teknik izlerini (IP, Port) kaydeder.
    İlgili branştaki öğretmenlere anında bildirim iletir.
    """
    client_ip, client_port, _ = extract_client_network_info(request)

    # İlan açıklamasını da filtrele
    cleaned_desc, _ = sanitize_proposal_text(data_dict.get("description", ""))

    min_b = data_dict.get("min_budget")
    max_b = data_dict.get("max_budget")
    if min_b is not None and min_b < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Minimum bütçe negatif olamaz.")
    if max_b is not None and max_b < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Maksimum bütçe negatif olamaz.")
    if min_b is not None and max_b is not None and min_b > max_b:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Minimum bütçe maksimum bütçeden büyük olamaz.")

    tender = Tender(
        student_id=student.id,
        title=data_dict["title"].strip(),
        subject=data_dict["subject"].strip(),
        category_name=data_dict.get("category_name"),
        description=cleaned_desc.strip(),
        mode=data_dict.get("mode", "ONLINE"),
        city=data_dict.get("city"),
        district=data_dict.get("district"),
        target_date_info=data_dict.get("target_date_info"),
        min_budget=data_dict.get("min_budget"),
        max_budget=data_dict.get("max_budget"),
        currency=data_dict.get("currency", "TRY"),
        status=TenderStatus.OPEN.value,
        bids_count=0,
        version=1,
        client_ip=client_ip,
        client_port=client_port,
        expires_at=datetime.utcnow() + timedelta(days=7),
    )
    
    db.add(tender)
    await db.commit()
    await db.refresh(tender)

    # GİB BTRANS kütüğüne asenkron log kaydı (Özel Ders İlanı / Talebi)
    try:
        await log_gib_event(
            db=db,
            service_type=GibServiceType.TENDER.value,
            action=GibActionType.CREATE.value,
            item_id=tender.id,
            item_reference_no=f"TLP-{tender.id[:8].upper()}",
            item_title=f"{tender.subject}: {tender.title}",
            teacher=student,  # İlanı açan aktör
            gross_amount=float(tender.max_budget or tender.min_budget or 0.0),
            item_category=tender.category_name,
            request=request
        )
    except Exception as e:
        logger.warning(f"GIB log olusturulamadi (Tender {tender.id}): {e}")

    # Branş bazında öğretmenlere bildirim iletimi
    try:
        await notify_teachers_for_new_tender(db=db, tender=tender, student=student)
    except Exception as e:
        logger.warning(f"Ogretmenlere talep bildirimi gonderilemedi: {e}")

    return tender


async def submit_tender_bid(
    db: AsyncSession,
    tender_id: str,
    teacher: User,
    offered_price: float,
    proposal_letter: str,
    request: Optional[Request] = None
) -> TenderBid:
    """
    Eğitmenin bir özel ders talebine teklif vermesi.
    Maksimum 4 teklif kotası ve Anti-Disintermediation filtresi uygulanır.
    """
    client_ip, client_port, _ = extract_client_network_info(request)

    # 1. Talep kontrolü
    tender_stmt = (
        select(Tender)
        .options(selectinload(Tender.student))
        .where(Tender.id == tender_id)
    )
    tender_res = await db.execute(tender_stmt)
    tender = tender_res.scalar_one_or_none()

    if not tender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Özel ders talebi bulunamadı.")

    if tender.status not in [TenderStatus.OPEN.value, TenderStatus.BIDDING.value]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu ders talebi yeni tekliflere kapalıdır.")

    if tender.student_id == teacher.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Kendi ders talebinize teklif veremezsiniz.")

    # 2. Teklif kotası: En fazla 4 teklif alınabilir (Dönüşüm hızı için)
    if tender.bids_count >= 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu ders talebi maksimum teklif kotasına (4 teklif) ulaşmıştır. İlginiz için teşekkürler."
        )

    # 3. Eğitmenin daha önce teklif verip vermediği kontrolü
    existing_stmt = select(TenderBid).where(
        and_(TenderBid.tender_id == tender_id, TenderBid.teacher_id == teacher.id)
    )
    existing_res = await db.execute(existing_stmt)
    if existing_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu ders talebine zaten bir teklif verdiniz.")

    # 4. İletişim bilgisi sızıntı filtresi
    cleaned_proposal, _ = sanitize_proposal_text(proposal_letter)

    # 5. Teklifi kaydet
    bid = TenderBid(
        tender_id=tender_id,
        teacher_id=teacher.id,
        offered_price=offered_price,
        currency="TRY",
        proposal_letter=cleaned_proposal,
        status=TenderBidStatus.PENDING.value,
        client_ip=client_ip,
        client_port=client_port,
    )
    db.add(bid)

    # Talep durumunu BIDDING yap ve sayaç artır
    tender.status = TenderStatus.BIDDING.value
    tender.bids_count += 1
    
    await db.commit()
    await db.refresh(bid)

    # GİB BTRANS kütüğüne Teklif Olayı logla
    try:
        await log_gib_event(
            db=db,
            service_type=GibServiceType.TENDER_BID.value,
            action=GibActionType.BID.value,
            item_id=bid.id,
            item_reference_no=f"TKF-{bid.id[:8].upper()}",
            item_title=f"Teklif: {tender.subject} ({offered_price:.2f} TL)",
            teacher=teacher,
            gross_amount=offered_price,
            commission_rate=0.20,
            commission_amount=offered_price * 0.20,
            teacher_net_earnings=offered_price * 0.80,
            buyer=tender.student,
            request=request
        )
    except Exception as e:
        logger.warning(f"GIB log olusturulamadi (Bid {bid.id}): {e}")

    # Öğrenciye teklif bildirimi gönder
    try:
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            user_ids=[tender.student_id],
            notification_type=NotificationType.TENDER_BID_RECEIVED,
            title="💬 Ders Talebinize Yeni Teklif Geldi!",
            message=f"{teacher.full_name}, '{tender.subject}' talebiniz için saatlik {offered_price:,.0f} {bid.currency} teklif verdi. İnceleyebilirsiniz.",
            data={"tender_id": tender.id, "bid_id": bid.id},
            priority=NotificationPriority.HIGH,
            action_url="/dashboard/student/tenders",
            action_label="Teklifi İncele",
            sender_id=teacher.id,
        )
    except Exception as e:
        logger.warning(f"Ogrenciye teklif bildirimi gonderilemedi: {e}")

    return bid


async def accept_tender_bid(
    db: AsyncSession,
    tender_id: str,
    bid_id: str,
    student: User,
    request: Optional[Request] = None
) -> Tuple[Tender, TenderBid]:
    """
    Öğrencinin bir teklifi kabul etmesi.
    Optimistic Locking (`version` kontrolü) ile eşzamanlı çift kabul önlenir.
    Kabul edilen teklif dışındaki diğer teklifler otomatik REJECTED yapılır.
    """
    # 1. Talebi çek
    tender_stmt = (
        select(Tender)
        .options(selectinload(Tender.bids).selectinload(TenderBid.teacher))
        .where(Tender.id == tender_id)
    )
    tender_res = await db.execute(tender_stmt)
    tender = tender_res.scalar_one_or_none()

    if not tender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Özel ders talebi bulunamadı.")

    if tender.student_id != student.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu talep size ait değil.")

    if tender.status not in [TenderStatus.OPEN.value, TenderStatus.BIDDING.value]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu ders talebi için daha önce bir teklif seçilmiş veya işlem tamamlanmış.")

    # 2. Seçilen teklifi bul
    selected_bid: Optional[TenderBid] = None
    for b in tender.bids:
        if b.id == bid_id:
            selected_bid = b
            break

    if not selected_bid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seçilen teklif bu talepte bulunamadı.")

    # 3. Optimistic Lock kontrolü ile durumu güncelle
    current_ver = tender.version
    update_stmt = (
        update(Tender)
        .where(Tender.id == tender_id, Tender.version == current_ver)
        .values(
            status=TenderStatus.ACCEPTED.value,
            accepted_bid_id=selected_bid.id,
            version=current_ver + 1
        )
    )
    result = await db.execute(update_stmt)
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="İşlem çakışması algılandı. Bu talep üzerinde eşzamanlı başka bir işlem yapılmış olabilir. Lütfen sayfayı yenileyin."
        )

    # 4. Seçilen teklifi ACCEPTED yap, diğerlerini REJECTED yap
    selected_bid.status = TenderBidStatus.ACCEPTED.value
    for b in tender.bids:
        if b.id != bid_id and b.status == TenderBidStatus.PENDING.value:
            b.status = TenderBidStatus.REJECTED.value

    await db.commit()
    await db.refresh(tender)
    await db.refresh(selected_bid)

    # GİB BTRANS kütüğüne Kabul Olayı logla
    try:
        await log_gib_event(
            db=db,
            service_type=GibServiceType.TENDER.value,
            action=GibActionType.ACCEPT.value,
            item_id=tender.id,
            item_reference_no=f"TLP-{tender.id[:8].upper()}",
            item_title=f"Kabul Edildi: {tender.subject} -> {selected_bid.teacher.full_name}",
            teacher=selected_bid.teacher,
            gross_amount=selected_bid.offered_price,
            commission_rate=0.20,
            commission_amount=selected_bid.offered_price * 0.20,
            teacher_net_earnings=selected_bid.offered_price * 0.80,
            buyer=student,
            request=request
        )
    except Exception as e:
        logger.warning(f"GIB log olusturulamadi (Accept {tender.id}): {e}")

    # Eğitmene teklif kabul bildirimi gönder
    try:
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            user_ids=[selected_bid.teacher_id],
            notification_type=NotificationType.TENDER_BID_ACCEPTED,
            title="🎉 Özel Ders Teklifiniz Kabul Edildi!",
            message=f"{student.full_name}, '{tender.subject}' talebine verdiğiniz saatlik {selected_bid.offered_price:,.0f} {selected_bid.currency} teklifinizi kabul etti. Öğrenciyle hemen iletişime geçebilirsiniz.",
            data={"tender_id": tender.id, "bid_id": selected_bid.id},
            priority=NotificationPriority.URGENT,
            action_url="/dashboard/teacher/tenders",
            action_label="Detayları Gör",
            sender_id=student.id,
        )
    except Exception as e:
        logger.warning(f"Egitmene kabul bildirimi gonderilemedi: {e}")

    return tender, selected_bid


async def update_tender(
    db: AsyncSession,
    tender_id: str,
    user: User,
    data_dict: dict,
) -> Tender:
    """
    Öğrencinin kendi açtığı özel ders talebini güncellemesi.
    Kabul edilmiş veya tamamlanmış talepler değiştirilemez.
    """
    stmt = (
        select(Tender)
        .options(selectinload(Tender.student), selectinload(Tender.bids))
        .where(Tender.id == tender_id)
    )
    res = await db.execute(stmt)
    tender = res.scalar_one_or_none()

    if not tender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Özel ders talebi bulunamadı.")

    if tender.student_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu talebi düzenleme yetkiniz yok.")

    if tender.status in [TenderStatus.ACCEPTED.value, TenderStatus.PAID.value, TenderStatus.COMPLETED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teklifi kabul edilmiş veya tamamlanmış ders talepleri düzenlenemez."
        )

    if "title" in data_dict and data_dict["title"]:
        tender.title = data_dict["title"].strip()
    if "subject" in data_dict and data_dict["subject"]:
        tender.subject = data_dict["subject"].strip()
    if "category_name" in data_dict:
        tender.category_name = data_dict["category_name"]
    if "description" in data_dict and data_dict["description"]:
        cleaned_desc, _ = sanitize_proposal_text(data_dict["description"])
        tender.description = cleaned_desc.strip()
    if "mode" in data_dict and data_dict["mode"]:
        tender.mode = data_dict["mode"]
    if "city" in data_dict:
        tender.city = data_dict["city"]
    if "district" in data_dict:
        tender.district = data_dict["district"]
    if "target_date_info" in data_dict:
        tender.target_date_info = data_dict["target_date_info"]

    # Bütçe doğrulamaları
    new_min = data_dict["min_budget"] if "min_budget" in data_dict else tender.min_budget
    new_max = data_dict["max_budget"] if "max_budget" in data_dict else tender.max_budget
    if "min_budget" in data_dict and data_dict["min_budget"] is not None and data_dict["min_budget"] < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Minimum bütçe negatif olamaz.")
    if "max_budget" in data_dict and data_dict["max_budget"] is not None and data_dict["max_budget"] < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Maksimum bütçe negatif olamaz.")
    if new_min is not None and new_max is not None and new_min > new_max:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Minimum bütçe maksimum bütçeden büyük olamaz.")

    if "min_budget" in data_dict:
        tender.min_budget = data_dict["min_budget"]
    if "max_budget" in data_dict:
        tender.max_budget = data_dict["max_budget"]
    if "currency" in data_dict and data_dict["currency"]:
        tender.currency = data_dict["currency"]

    tender.version += 1
    await db.commit()
    await db.refresh(tender)
    return tender


async def delete_tender(
    db: AsyncSession,
    tender_id: str,
    user: User,
) -> bool:
    """
    Öğrencinin kendi açtığı özel ders talebini silmesi.
    Kabul edilmiş veya tamamlanmış talepler silinemez (yalnızca iptal edilebilir).
    """
    stmt = (
        select(Tender)
        .options(selectinload(Tender.bids))
        .where(Tender.id == tender_id)
    )
    res = await db.execute(stmt)
    tender = res.scalar_one_or_none()

    if not tender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Özel ders talebi bulunamadı.")

    if tender.student_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu talebi silme yetkiniz yok.")

    if tender.status in [TenderStatus.ACCEPTED.value, TenderStatus.PAID.value, TenderStatus.COMPLETED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teklifi kabul edilmiş veya tamamlanmış talepler silinemez. Dilerseniz iptal edebilirsiniz."
        )

    await db.delete(tender)
    await db.commit()
    return True


def build_whatsapp_direct_link(phone: Optional[str], subject: str, student_name: str) -> Optional[str]:
    """
    Ödeme/kabul sonrası iki tarafın anında iletişim kurması için güvenli WhatsApp yönlendirme linki üretir.
    """
    if not phone:
        return None

    clean_phone = re.sub(r"\D", "", phone)
    if clean_phone.startswith("0"):
        clean_phone = "90" + clean_phone[1:]
    elif not clean_phone.startswith("90") and len(clean_phone) == 10:
        clean_phone = "90" + clean_phone

    msg = f"Merhaba, BiHocam üzerinden '{subject}' özel ders talebiniz kabul edildi! Tanışmak ve ders planlamasını yapmak için yazıyorum. ({student_name})"
    import urllib.parse
    encoded_msg = urllib.parse.quote(msg)
    return f"https://wa.me/{clean_phone}?text={encoded_msg}"
