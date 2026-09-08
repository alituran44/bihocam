import io
import csv
from datetime import datetime
from typing import Optional, List, Dict, Any
import xml.etree.ElementTree as ET

from fastapi import APIRouter, Depends, HTTPException, status, Response, Query, Request
from sqlalchemy import select, and_, or_, extract, func as sql_func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.gib_log import GibAuditLog, GibServiceType, GibActionType
from app.services.gib_logger import sync_existing_records_to_gib_logs

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Sadece Admin kullanicilar erisebilir"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu islem icin admin yetkisi gereklidir."
        )
    return current_user


@router.get("/logs")
async def list_gib_audit_logs(
    year: Optional[int] = Query(None, description="Yil filtresi (Orn: 2026)"),
    month: Optional[int] = Query(None, description="Ay filtresi (1-12)"),
    service_type: Optional[str] = Query(None, description="Hizmet turu (LIVE_CLASS, COURSE, EDUCATION_PROGRAM)"),
    action: Optional[str] = Query(None, description="Islem turu (CREATE, PUBLISH, PURCHASE, CANCEL)"),
    is_compliant: Optional[bool] = Query(None, description="GIB uyumluluk durumu (True: Hazir, False: Eksik bilgi)"),
    search: Optional[str] = Query(None, description="Egitmen, TCKN/VKN, baslik veya referans no ara"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    VUK 538 ve 595 sayili tebligler kapsaminda tutulan GIB BTRANS denetim kutuklerini listeler.
    """
    stmt = select(GibAuditLog)

    conditions = []
    if isinstance(year, int):
        conditions.append(extract("year", GibAuditLog.created_at) == year)
    if isinstance(month, int):
        conditions.append(extract("month", GibAuditLog.created_at) == month)
    if isinstance(service_type, str) and service_type.strip():
        conditions.append(GibAuditLog.service_type == service_type.strip())
    if isinstance(action, str) and action.strip():
        conditions.append(GibAuditLog.action == action.strip())
    if isinstance(is_compliant, bool):
        conditions.append(GibAuditLog.is_compliant == is_compliant)
    if isinstance(search, str) and search.strip():
        term = f"%{search.strip()}%"
        conditions.append(
            or_(
                GibAuditLog.item_reference_no.ilike(term),
                GibAuditLog.item_title.ilike(term),
                GibAuditLog.teacher_name.ilike(term),
                GibAuditLog.teacher_tc_vkn.ilike(term),
                GibAuditLog.buyer_name.ilike(term),
                GibAuditLog.client_ip.ilike(term),
            )
        )

    if conditions:
        stmt = stmt.where(and_(*conditions))

    # Toplam kayit sayisi
    count_stmt = select(sql_func.count(GibAuditLog.id))
    if conditions:
        count_stmt = count_stmt.where(and_(*conditions))
    total_count = (await db.execute(count_stmt)).scalar() or 0

    # Sayfalama ve siralama (En yeni en ustte)
    stmt = stmt.order_by(GibAuditLog.created_at.desc()).offset(skip).limit(limit)
    res = await db.execute(stmt)
    logs = res.scalars().all()

    # KPI Ozeti hesapla
    summary_stmt = select(
        sql_func.count(GibAuditLog.id).label("total_items"),
        sql_func.sum(GibAuditLog.gross_amount).label("total_gross"),
        sql_func.sum(GibAuditLog.commission_amount).label("total_comm"),
        sql_func.sum(GibAuditLog.teacher_net_earnings).label("total_net"),
    )
    if conditions:
        summary_stmt = summary_stmt.where(and_(*conditions))
    sum_res = (await db.execute(summary_stmt)).one_or_none()

    total_gross = float(sum_res.total_gross or 0.0) if sum_res else 0.0
    total_comm = float(sum_res.total_comm or 0.0) if sum_res else 0.0
    total_net = float(sum_res.total_net or 0.0) if sum_res else 0.0

    compliant_stmt = select(sql_func.count(GibAuditLog.id)).where(GibAuditLog.is_compliant == True)
    if conditions:
        compliant_stmt = compliant_stmt.where(and_(*conditions))
    compliant_count = (await db.execute(compliant_stmt)).scalar() or 0
    non_compliant_count = total_count - compliant_count

    return {
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "summary": {
            "total_items": total_count,
            "total_gross_amount": round(total_gross, 2),
            "total_commission_amount": round(total_comm, 2),
            "total_teacher_net_amount": round(total_net, 2),
            "compliant_count": compliant_count,
            "non_compliant_count": non_compliant_count,
            "compliance_rate_percent": round((compliant_count / total_count * 100) if total_count > 0 else 100, 1),
        },
        "logs": [
            {
                "id": l.id,
                "service_type": l.service_type,
                "action": l.action,
                "item_id": l.item_id,
                "item_reference_no": l.item_reference_no,
                "item_title": l.item_title,
                "item_category": l.item_category,
                "item_url": l.item_url,
                "gross_amount": l.gross_amount,
                "commission_rate": l.commission_rate,
                "commission_amount": l.commission_amount,
                "teacher_net_earnings": l.teacher_net_earnings,
                "currency": l.currency,
                "teacher_id": l.teacher_id,
                "teacher_name": l.teacher_name,
                "teacher_tc_vkn": l.teacher_tc_vkn,
                "teacher_company_type": l.teacher_company_type,
                "teacher_company_title": l.teacher_company_title,
                "teacher_tax_office": l.teacher_tax_office,
                "teacher_city": l.teacher_city,
                "teacher_district": l.teacher_district,
                "teacher_address": l.teacher_address,
                "teacher_iban": l.teacher_iban,
                "teacher_phone": l.teacher_phone,
                "teacher_email": l.teacher_email,
                "buyer_id": l.buyer_id,
                "buyer_name": l.buyer_name,
                "buyer_email": l.buyer_email,
                "payment_gateway_ref": l.payment_gateway_ref,
                "client_ip": l.client_ip,
                "client_port": l.client_port,
                "user_agent": l.user_agent,
                "is_compliant": l.is_compliant,
                "missing_fields": l.missing_fields or [],
                "created_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S") if l.created_at else "",
            }
            for l in logs
        ],
    }


@router.post("/sync")
async def trigger_gib_sync(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Sistemdeki yeni canli dersleri ve yayinlanan kurslari GIB denetim kutugune senkronize eder.
    """
    added = await sync_existing_records_to_gib_logs(db)
    return {
        "success": True,
        "synced_count": added,
        "message": f"{added} yeni kayit GIB BTRANS denetim kutugune islendi.",
    }


@router.get("/export-csv")
async def export_gib_audit_csv(
    year: Optional[int] = None,
    month: Optional[int] = None,
    service_type: Optional[str] = None,
    is_compliant: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    538 & 595 VUK Tebliglerine tam uyumlu, Excel'de dogrudan acilabilen UTF-8 BOM CSV dosyasini indirir.
    """
    stmt = select(GibAuditLog)
    conditions = []
    if isinstance(year, int):
        conditions.append(extract("year", GibAuditLog.created_at) == year)
    if isinstance(month, int):
        conditions.append(extract("month", GibAuditLog.created_at) == month)
    if isinstance(service_type, str) and service_type.strip():
        conditions.append(GibAuditLog.service_type == service_type.strip())
    if isinstance(is_compliant, bool):
        conditions.append(GibAuditLog.is_compliant == is_compliant)

    if conditions:
        stmt = stmt.where(and_(*conditions))
    stmt = stmt.order_by(GibAuditLog.created_at.desc())

    res = await db.execute(stmt)
    logs = res.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output, delimiter=";", quoting=csv.QUOTE_MINIMAL)

    headers = [
        "SIRA_NO",
        "HIZMET_TURU",
        "ISLEM_HAREKETI",
        "ILAN_REFERANS_NO",
        "ILAN_HIZMET_BASLIGI",
        "KATEGORI",
        "WEB_BAGLANTISI",
        "ZAMAN_DAMGASI_ISO8601",
        "MUKELLEF_AD_SOYAD",
        "TCKN_VEYA_VKN",
        "MUKELLEF_TIPI",
        "SIRKET_TICARI_UNVANI",
        "VERGI_DAIRESI",
        "IL",
        "ILCE",
        "YASAL_IKAMETGAH_TEBLIGAT_ADRESI",
        "MUKELLEF_IBAN",
        "MUKELLEF_TELEFON",
        "MUKELLEF_EPOSTA",
        "ALICI_AD_SOYAD",
        "ALICI_EPOSTA",
        "BRUT_HIZMET_BEDELI_TL",
        "KOMISYON_ORANI",
        "PLATFORM_KOMISYON_TUTARI_TL",
        "EGITMEN_NET_HAKEDIS_TL",
        "ODEME_REFERANS_NO",
        "ISTEMCI_GERCEK_IP_ADRESI",
        "ISTEMCI_PORT_NUMARASI",
        "GIB_BTRANS_UYUMLULUK_DURUMU",
        "EKSIK_MUKELLEF_BILGILERI",
    ]
    writer.writerow(headers)

    for idx, l in enumerate(logs, 1):
        status_label = "BILDIRIME HAZIR" if l.is_compliant else "BILGI EKSIK (CEZA RISKI)"
        missing_str = ", ".join(l.missing_fields) if l.missing_fields else "-"

        row = [
            idx,
            l.service_type,
            l.action,
            l.item_reference_no,
            l.item_title,
            l.item_category or "-",
            l.item_url or "-",
            l.created_at.strftime("%Y-%m-%d %H:%M:%S") if l.created_at else "-",
            l.teacher_name,
            l.teacher_tc_vkn or "-",
            l.teacher_company_type or "-",
            l.teacher_company_title or "-",
            l.teacher_tax_office or "-",
            l.teacher_city or "-",
            l.teacher_district or "-",
            l.teacher_address or "-",
            l.teacher_iban or "-",
            l.teacher_phone or "-",
            l.teacher_email or "-",
            l.buyer_name or "-",
            l.buyer_email or "-",
            f"{l.gross_amount:.2f}",
            f"%{int(l.commission_rate * 100)}",
            f"{l.commission_amount:.2f}",
            f"{l.teacher_net_earnings:.2f}",
            l.payment_gateway_ref or "-",
            l.client_ip or "127.0.0.1",
            l.client_port or 443,
            status_label,
            missing_str,
        ]
        writer.writerow(row)

    csv_text = output.getvalue()
    suffix = f"{year or 'HEPSI'}_{month or 'TUM'}"
    filename = f"GIB_BTRANS_ILAN_IHALE_DENETIM_{suffix}.csv"

    return Response(
        content=csv_text.encode("utf-8-sig"),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )


@router.get("/export-xml")
async def export_gib_audit_xml(
    year: Optional[int] = None,
    month: Optional[int] = None,
    service_type: Optional[str] = None,
    is_compliant: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Gelir Idaresi BTRANS resmi XML semasina uygun bildirim paketini indirir.
    """
    stmt = select(GibAuditLog)
    conditions = []
    if isinstance(year, int):
        conditions.append(extract("year", GibAuditLog.created_at) == year)
    if isinstance(month, int):
        conditions.append(extract("month", GibAuditLog.created_at) == month)
    if isinstance(service_type, str) and service_type.strip():
        conditions.append(GibAuditLog.service_type == service_type.strip())
    if isinstance(is_compliant, bool):
        conditions.append(GibAuditLog.is_compliant == is_compliant)

    if conditions:
        stmt = stmt.where(and_(*conditions))
    stmt = stmt.order_by(GibAuditLog.created_at.desc())

    res = await db.execute(stmt)
    logs = res.scalars().all()

    root = ET.Element("BTRANS_BILDIRIM")
    root.set("versiyon", "2.1")
    root.set("mevzuat", "VUK_538_595_MUKERRER_257")

    header = ET.SubElement(root, "BILDIRIM_BASLIK")
    ET.SubElement(header, "ARACI_HIZMET_SAGLAYICI").text = "BiHocam Egitim Teknolojileri ve Pazaryeri A.S."
    ET.SubElement(header, "PLATFORM_DOMAIN").text = "bihocam.com"
    ET.SubElement(header, "ARACI_VKN").text = "1234567890"
    period = ET.SubElement(header, "BILDIRIM_DONEMI")
    ET.SubElement(period, "YIL").text = str(year or datetime.now().year)
    ET.SubElement(period, "AY").text = str(month or datetime.now().month)

    total_gross = sum(l.gross_amount for l in logs)
    total_comm = sum(l.commission_amount for l in logs)
    total_net = sum(l.teacher_net_earnings for l in logs)
    compliant_count = sum(1 for l in logs if l.is_compliant)

    summary = ET.SubElement(header, "DONEM_OZETI")
    ET.SubElement(summary, "TOPLAM_ILAN_HIZMET_ADEDI").text = str(len(logs))
    ET.SubElement(summary, "TOPLAM_BRUT_CIRO_TL").text = f"{total_gross:.2f}"
    ET.SubElement(summary, "TOPLAM_ARACI_KOMISYON_TL").text = f"{total_comm:.2f}"
    ET.SubElement(summary, "TOPLAM_MUKELLEF_NET_ODEME_TL").text = f"{total_net:.2f}"
    ET.SubElement(summary, "UYUMLU_KAYIT_SAYISI").text = str(compliant_count)
    ET.SubElement(summary, "EKSIK_KAYIT_SAYISI").text = str(len(logs) - compliant_count)

    items_el = ET.SubElement(root, "ILAN_VE_HIZMET_KAYITLARI")
    for idx, l in enumerate(logs, 1):
        item_node = ET.SubElement(items_el, "KAYIT")
        item_node.set("sira_no", str(idx))
        item_node.set("referans_no", l.item_reference_no)

        # 1. Ilan Bilgileri
        ilan = ET.SubElement(item_node, "ILAN_BILGILERI")
        ET.SubElement(ilan, "HIZMET_TURU").text = l.service_type
        ET.SubElement(ilan, "HAREKET").text = l.action
        ET.SubElement(ilan, "BASLIK").text = l.item_title
        ET.SubElement(ilan, "KATEGORI").text = l.item_category or "Egitim"
        ET.SubElement(ilan, "WEB_URL").text = l.item_url or ""
        ET.SubElement(ilan, "ZAMAN_DAMGASI").text = l.created_at.isoformat() if l.created_at else ""

        # 2. Mukellef Bilgileri
        m_node = ET.SubElement(item_node, "MUKELLEF_HIZMET_SAGLAYICI")
        ET.SubElement(m_node, "AD_SOYAD").text = l.teacher_name
        ET.SubElement(m_node, "TCKN_VKN").text = l.teacher_tc_vkn or ""
        ET.SubElement(m_node, "MUKELLEF_TIPI").text = l.teacher_company_type or "Bireysel (Sahis)"
        ET.SubElement(m_node, "TICARI_UNVAN").text = l.teacher_company_title or ""
        ET.SubElement(m_node, "VERGI_DAIRESI").text = l.teacher_tax_office or ""
        ET.SubElement(m_node, "IL").text = l.teacher_city or ""
        ET.SubElement(m_node, "ILCE").text = l.teacher_district or ""
        ET.SubElement(m_node, "TEBLIGAT_ADRESI").text = l.teacher_address or ""
        ET.SubElement(m_node, "IBAN").text = l.teacher_iban or ""
        ET.SubElement(m_node, "TELEFON").text = l.teacher_phone or ""
        ET.SubElement(m_node, "EPOSTA").text = l.teacher_email or ""

        # 3. Alici / Ogrenci Bilgileri (Varsa)
        if l.buyer_name:
            b_node = ET.SubElement(item_node, "HIZMET_ALAN_MUSTERI")
            ET.SubElement(b_node, "AD_SOYAD").text = l.buyer_name
            ET.SubElement(b_node, "EPOSTA").text = l.buyer_email or ""

        # 4. Mali Bilgiler
        f_node = ET.SubElement(item_node, "MALI_BILGILER")
        ET.SubElement(f_node, "BRUT_TUTAR", para_birimi="TRY").text = f"{l.gross_amount:.2f}"
        ET.SubElement(f_node, "KOMISYON_TUTARI", para_birimi="TRY").text = f"{l.commission_amount:.2f}"
        ET.SubElement(f_node, "MUKELLEF_NET_TUTAR", para_birimi="TRY").text = f"{l.teacher_net_earnings:.2f}"
        ET.SubElement(f_node, "ODEME_ARACI_REF").text = l.payment_gateway_ref or ""

        # 5. 5651 & VUK 257 Teknik Iz Kayitlari
        tech = ET.SubElement(item_node, "TEKNIK_IZ_KAYDI")
        ET.SubElement(tech, "ISTEMCI_IP").text = l.client_ip
        ET.SubElement(tech, "ISTEMCI_PORT").text = str(l.client_port or 443)
        ET.SubElement(tech, "USER_AGENT").text = l.user_agent or ""

        # 6. Uyum Durumu
        ET.SubElement(item_node, "BTRANS_DURUMU").text = "HAZIR" if l.is_compliant else "BILGI_EKSIK"

    xml_text = ET.tostring(root, encoding="utf-8", xml_declaration=True).decode("utf-8")
    suffix = f"{year or 'HEPSI'}_{month or 'TUM'}"
    filename = f"GIB_BTRANS_ILAN_IHALE_BILDIRIM_{suffix}.xml"

    return Response(
        content=xml_text.encode("utf-8"),
        media_type="application/xml",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )
