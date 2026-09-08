import io
import csv
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
import xml.etree.ElementTree as ET

from sqlalchemy import select, and_, or_, extract
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User, UserRole
from app.models.course import Course
from app.models.order import Order, OrderItem, OrderStatus
from app.models.live_class import LiveClassReservation
from app.models.teacher_bank_account import TeacherBankAccount, BankAccountStatus


def validate_gib_compliance(tax_info: Optional[dict], bank_account_iban: Optional[str] = None) -> tuple[bool, List[str]]:
    """
    VUK 538 ve 595 sayili tebligler uyarinca GIB BTRANS bildirim zorunlu alan kontrolu.
    Geriye (is_compliant, missing_fields) doner.
    """
    missing = []
    if not tax_info:
        missing.extend(["TCKN veya VKN", "Yasal Fatura/Ikametgah Adresi", "Il / Sehir", "Ilce"])
        return False, missing

    tc_kimlik = str(tax_info.get("tc_kimlik") or tax_info.get("tc_kimlik_no") or "").strip()
    address = str(tax_info.get("address") or tax_info.get("billing_address") or "").strip()
    city = str(tax_info.get("city") or "").strip()
    district = str(tax_info.get("district") or "").strip()

    if not tc_kimlik:
        missing.append("TCKN / VKN")
    elif len(tc_kimlik) not in (10, 11):
        missing.append("Gecersiz TCKN/VKN (10 veya 11 hane olmali)")

    if not address:
        missing.append("Yasal Fatura/Ikametgah Adresi")
    if not city:
        missing.append("Il / Sehir")
    if not district:
        missing.append("Ilce")

    iban = bank_account_iban or tax_info.get("iban")
    if not iban:
        missing.append("Odeme IBAN Bilgisi")

    return len(missing) == 0, missing


async def fetch_gib_transactions(
    db: AsyncSession,
    year: Optional[int] = None,
    month: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Belirtilen donem (yil/ay) icin tum video kurs siparislerini ve canli ders rezervasyonlarini ceker,
    GIB BTRANS formatina donusturur ve uyumluluk denetimi yapar.
    """
    # 1. Video Kurs ve Egitim Programi Siparisleri (PAID)
    order_stmt = (
        select(Order)
        .options(
            selectinload(Order.user),
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.teacher).selectinload(User.bank_accounts)
        )
        .where(Order.status == OrderStatus.PAID)
    )

    if year is not None:
        order_stmt = order_stmt.where(extract("year", Order.paid_at).isnot(None))
        order_stmt = order_stmt.where(extract("year", Order.paid_at) == year)
    if month is not None:
        order_stmt = order_stmt.where(extract("month", Order.paid_at) == month)

    order_stmt = order_stmt.order_by(Order.paid_at.desc())
    order_result = await db.execute(order_stmt)
    orders = order_result.scalars().all()

    # 2. Canli Ders Rezervasyonlari (approved, completed, paid)
    res_stmt = (
        select(LiveClassReservation)
        .options(
            selectinload(LiveClassReservation.teacher).selectinload(User.bank_accounts),
            selectinload(LiveClassReservation.student)
        )
        .where(LiveClassReservation.status.in_(["approved", "completed", "paid"]))
    )

    if year is not None:
        res_stmt = res_stmt.where(LiveClassReservation.date.startswith(f"{year:04d}"))
    if month is not None and year is not None:
        res_stmt = res_stmt.where(LiveClassReservation.date.startswith(f"{year:04d}-{month:02d}"))

    res_stmt = res_stmt.order_by(LiveClassReservation.date.desc())
    res_result = await db.execute(res_stmt)
    reservations = res_result.scalars().all()

    transactions = []
    teachers_map: Dict[str, Dict[str, Any]] = {}

    # 1. Kurs satislarini isle
    for order in orders:
        paid_date = order.paid_at.strftime("%Y-%m-%d %H:%M:%S") if order.paid_at else (
            order.created_at.strftime("%Y-%m-%d %H:%M:%S") if order.created_at else ""
        )
        buyer_name = order.user.full_name if order.user else "Bilinmeyen Ogrenci"
        buyer_email = order.user.email if order.user else ""

        for item in order.order_items:
            teacher = item.course.teacher if item.course else None
            teacher_id = teacher.id if teacher else "unknown"
            teacher_name = teacher.full_name if teacher else "Sistem / Belirtilmemis"
            teacher_tax_info = (teacher.tax_info if teacher else None) or {}

            # Default IBAN
            default_iban = None
            if teacher and teacher.bank_accounts:
                for b in teacher.bank_accounts:
                    if b.is_default or not default_iban:
                        default_iban = b.iban

            if not default_iban:
                default_iban = teacher_tax_info.get("iban")

            # Compliance check
            is_compliant, missing = validate_gib_compliance(teacher_tax_info, default_iban)

            gross = float(item.final_price or item.price or 0)
            commission = float(item.platform_commission or 0)
            net = float(item.teacher_earnings or 0)

            # Eger komisyon hesaplanmamis veya negatif cikmissa duzelt
            if commission <= 0 or net < 0:
                commission = round(gross * 0.35, 2)
                net = round(gross - commission, 2)

            t_type = "video_kurs"
            t_type_label = "Video Kurs"
            if item.course and "program" in (item.course.title or "").lower():
                t_type = "egitim_programi"
                t_type_label = "Egitim Programi"

            tx = {
                "id": item.id,
                "transaction_id": order.order_number,
                "type": t_type,
                "type_label": t_type_label,
                "date": paid_date,
                "gross_amount": gross,
                "commission_amount": commission,
                "net_amount": net,
                "item_title": item.course.title if item.course else "Video Kurs",
                "payment_ref": order.payment_gateway_transaction_id or order.order_number,
                "teacher": {
                    "id": teacher_id,
                    "full_name": teacher_name,
                    "email": teacher.email if teacher else "",
                    "phone": teacher.phone if teacher else "",
                    "tc_kimlik": teacher_tax_info.get("tc_kimlik") or teacher_tax_info.get("tc_kimlik_no") or "",
                    "tax_office": teacher_tax_info.get("tax_office") or "",
                    "company_type": teacher_tax_info.get("company_type") or "Bireysel (Sahis)",
                    "company_title": teacher_tax_info.get("company_title") or "",
                    "city": teacher_tax_info.get("city") or "",
                    "district": teacher_tax_info.get("district") or "",
                    "address": teacher_tax_info.get("address") or teacher_tax_info.get("billing_address") or "",
                    "iban": default_iban or "",
                },
                "buyer": {
                    "id": order.user_id,
                    "full_name": buyer_name,
                    "email": buyer_email,
                },
                "is_compliant": is_compliant,
                "missing_fields": missing,
            }
            transactions.append(tx)

            # Egitmen bazli ozet guncelle
            if teacher_id not in teachers_map:
                teachers_map[teacher_id] = {
                    "id": teacher_id,
                    "full_name": teacher_name,
                    "tc_kimlik": teacher_tax_info.get("tc_kimlik") or teacher_tax_info.get("tc_kimlik_no") or "",
                    "tax_office": teacher_tax_info.get("tax_office") or "",
                    "city": teacher_tax_info.get("city") or "",
                    "district": teacher_tax_info.get("district") or "",
                    "address": teacher_tax_info.get("address") or teacher_tax_info.get("billing_address") or "",
                    "iban": default_iban or "",
                    "is_compliant": is_compliant,
                    "missing_fields": missing,
                    "total_transactions": 0,
                    "total_gross": 0.0,
                    "total_commission": 0.0,
                    "total_net": 0.0,
                }
            teachers_map[teacher_id]["total_transactions"] += 1
            teachers_map[teacher_id]["total_gross"] += gross
            teachers_map[teacher_id]["total_commission"] += commission
            teachers_map[teacher_id]["total_net"] += net

    # 2. Canli ders rezervasyonlarini isle
    for res in reservations:
        teacher = res.teacher
        teacher_id = teacher.id if teacher else "unknown"
        teacher_name = teacher.full_name if teacher else "Bilinmeyen Egitmen"
        teacher_tax_info = (teacher.tax_info if teacher else None) or {}

        default_iban = None
        if teacher and teacher.bank_accounts:
            for b in teacher.bank_accounts:
                if b.is_default or not default_iban:
                    default_iban = b.iban
        if not default_iban:
            default_iban = teacher_tax_info.get("iban")

        is_compliant, missing = validate_gib_compliance(teacher_tax_info, default_iban)

        gross = float(res.discount_price if res.discount_price and res.discount_price > 0 else res.price)
        commission = round(gross * 0.20, 2)  # Canli derslerde %20 platform komisyonu
        net = round(gross - commission, 2)

        buyer_name = res.student.full_name if res.student else "Bilinmeyen Ogrenci"
        buyer_email = res.student.email if res.student else ""
        date_str = f"{res.date} {res.start_time}:00"

        lesson_type_label = "Online Canli Ders" if res.lesson_type == "online" else "Yuz Yuze Birebir Ders"

        tx = {
            "id": res.id,
            "transaction_id": f"RES-{res.id[:8].upper()}",
            "type": "canli_ders",
            "type_label": f"Canli Ders ({lesson_type_label})",
            "date": date_str,
            "gross_amount": gross,
            "commission_amount": commission,
            "net_amount": net,
            "item_title": f"Birebir {lesson_type_label} - {res.date} {res.start_time}",
            "payment_ref": f"PAYTR-LIVE-{res.id[:10]}",
            "teacher": {
                "id": teacher_id,
                "full_name": teacher_name,
                "email": teacher.email if teacher else "",
                "phone": teacher.phone if teacher else "",
                "tc_kimlik": teacher_tax_info.get("tc_kimlik") or teacher_tax_info.get("tc_kimlik_no") or "",
                "tax_office": teacher_tax_info.get("tax_office") or "",
                "company_type": teacher_tax_info.get("company_type") or "Bireysel (Sahis)",
                "company_title": teacher_tax_info.get("company_title") or "",
                "city": teacher_tax_info.get("city") or "",
                "district": teacher_tax_info.get("district") or "",
                "address": teacher_tax_info.get("address") or teacher_tax_info.get("billing_address") or "",
                "iban": default_iban or "",
            },
            "buyer": {
                "id": res.student_id,
                "full_name": buyer_name,
                "email": buyer_email,
            },
            "is_compliant": is_compliant,
            "missing_fields": missing,
        }
        transactions.append(tx)

        if teacher_id not in teachers_map:
            teachers_map[teacher_id] = {
                "id": teacher_id,
                "full_name": teacher_name,
                "tc_kimlik": teacher_tax_info.get("tc_kimlik") or teacher_tax_info.get("tc_kimlik_no") or "",
                "tax_office": teacher_tax_info.get("tax_office") or "",
                "city": teacher_tax_info.get("city") or "",
                "district": teacher_tax_info.get("district") or "",
                "address": teacher_tax_info.get("address") or teacher_tax_info.get("billing_address") or "",
                "iban": default_iban or "",
                "is_compliant": is_compliant,
                "missing_fields": missing,
                "total_transactions": 0,
                "total_gross": 0.0,
                "total_commission": 0.0,
                "total_net": 0.0,
            }
        teachers_map[teacher_id]["total_transactions"] += 1
        teachers_map[teacher_id]["total_gross"] += gross
        teachers_map[teacher_id]["total_commission"] += commission
        teachers_map[teacher_id]["total_net"] += net

    # Tarihe gore azalan sirala
    transactions.sort(key=lambda x: x["date"], reverse=True)

    # Ozet metrikler
    total_count = len(transactions)
    total_gross = round(sum(t["gross_amount"] for t in transactions), 2)
    total_commission = round(sum(t["commission_amount"] for t in transactions), 2)
    total_net = round(sum(t["net_amount"] for t in transactions), 2)
    compliant_count = sum(1 for t in transactions if t["is_compliant"])
    non_compliant_count = total_count - compliant_count

    # Eksik vergi bilgisi olan egitmenler listesi
    teachers_with_missing_info = [t for t in teachers_map.values() if not t["is_compliant"]]

    return {
        "period": {
            "year": year,
            "month": month,
            "month_name": get_turkish_month_name(month) if month else "Tum Yil",
        },
        "summary": {
            "total_transactions": total_count,
            "total_gross_amount": total_gross,
            "total_commission_amount": total_commission,
            "total_teacher_earnings": total_net,
            "compliant_transactions_count": compliant_count,
            "non_compliant_transactions_count": non_compliant_count,
            "compliance_rate_percent": round((compliant_count / total_count * 100) if total_count > 0 else 100, 1),
        },
        "transactions": transactions,
        "teachers_summary": list(teachers_map.values()),
        "teachers_with_missing_info": teachers_with_missing_info,
    }


def get_turkish_month_name(month: Optional[int]) -> str:
    if not month or month < 1 or month > 12:
        return ""
    months = [
        "Ocak", "Subat", "Mart", "Nisan", "Mayis", "Haziran",
        "Temmuz", "Agustos", "Eylul", "Ekim", "Kasim", "Aralik"
    ]
    return months[month - 1]


def generate_gib_csv(report_data: Dict[str, Any]) -> str:
    """
    VUK 538/595 tebliglerine tam uyumlu CSV raporu uretir.
    Excel Turkce karakter uyumu icin utf-8-sig ile encode edilecek string ciktisi uretir.
    Noktali virgul (;) ayirici kullanilir.
    """
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";", quoting=csv.QUOTE_MINIMAL)

    headers = [
        "SIRA_NO",
        "ISLEM_TURU",
        "ISLEM_TARIHI",
        "SIPARIS_VEYA_REZERVASYON_NO",
        "EGITMEN_AD_SOYAD",
        "EGITMEN_TCKN_VKN",
        "EGITMEN_VERGI_DAIRESI",
        "EGITMEN_SIRKET_UNVANI",
        "EGITMEN_IL",
        "EGITMEN_ILCE",
        "EGITMEN_YASAL_ADRES",
        "EGITMEN_IBAN",
        "ALICI_AD_SOYAD",
        "ALICI_EPOSTA",
        "EGITIM_CANLI_DERS_BASLIGI",
        "BRUT_SATIS_TUTARI_TL",
        "PLATFORM_KOMISYON_TUTARI_TL",
        "EGITMEN_NET_HAKEDIS_TL",
        "ODEME_REFERANS_KODU",
        "GIB_BTRANS_DURUMU",
        "EKSIK_BILGILER",
    ]
    writer.writerow(headers)

    for idx, tx in enumerate(report_data["transactions"], 1):
        teacher = tx["teacher"]
        buyer = tx["buyer"]
        status_label = "BILDIRIME HAZIR" if tx["is_compliant"] else "BILGI EKSIK (DUZELTILMELI)"
        missing_str = ", ".join(tx["missing_fields"]) if tx["missing_fields"] else "-"

        row = [
            idx,
            tx["type_label"],
            tx["date"],
            tx["transaction_id"],
            teacher["full_name"],
            teacher["tc_kimlik"] or "-",
            teacher["tax_office"] or "-",
            teacher["company_title"] or "-",
            teacher["city"] or "-",
            teacher["district"] or "-",
            teacher["address"] or "-",
            teacher["iban"] or "-",
            buyer["full_name"],
            buyer["email"],
            tx["item_title"],
            f"{tx['gross_amount']:.2f}",
            f"{tx['commission_amount']:.2f}",
            f"{tx['net_amount']:.2f}",
            tx["payment_ref"] or "-",
            status_label,
            missing_str,
        ]
        writer.writerow(row)

    return output.getvalue()


def generate_gib_xml(report_data: Dict[str, Any]) -> str:
    root = ET.Element("BTRANS_BILDIRIM")
    root.set("versiyon", "1.0")
    root.set("mevzuat", "VUK_538_595")

    header = ET.SubElement(root, "BILDIRIM_BASLIK")
    ET.SubElement(header, "ARACI_HIZMET_SAGLAYICI").text = "BiHocam Egitim Teknolojileri A.S."
    ET.SubElement(header, "ARACI_VKN").text = "1234567890"
    period_el = ET.SubElement(header, "DONEM")
    ET.SubElement(period_el, "YIL").text = str(report_data["period"]["year"] or datetime.now().year)
    ET.SubElement(period_el, "AY").text = str(report_data["period"]["month"] or datetime.now().month)

    summary = ET.SubElement(header, "OZET_TOPLAMLAR")
    ET.SubElement(summary, "TOPLAM_ISLEM_ADEDI").text = str(report_data["summary"]["total_transactions"])
    ET.SubElement(summary, "TOPLAM_BRUT_CIRO").text = f"{report_data['summary']['total_gross_amount']:.2f}"
    ET.SubElement(summary, "TOPLAM_KOMISYON").text = f"{report_data['summary']['total_commission_amount']:.2f}"
    ET.SubElement(summary, "TOPLAM_HAKEDIS").text = f"{report_data['summary']['total_teacher_earnings']:.2f}"
    ET.SubElement(summary, "HAZIR_ISLEM_SAYISI").text = str(report_data["summary"]["compliant_transactions_count"])
    ET.SubElement(summary, "EKSIK_ISLEM_SAYISI").text = str(report_data["summary"]["non_compliant_transactions_count"])

    txs_el = ET.SubElement(root, "ISLEMLER")
    for idx, tx in enumerate(report_data["transactions"], 1):
        tx_node = ET.SubElement(txs_el, "ISLEM")
        tx_node.set("sira_no", str(idx))
        tx_node.set("referans_no", str(tx["transaction_id"]))

        ET.SubElement(tx_node, "ISLEM_TURU").text = str(tx["type"])
        ET.SubElement(tx_node, "ISLEM_TARIHI").text = str(tx["date"])
        ET.SubElement(tx_node, "HIZMET_BASLIGI").text = str(tx["item_title"])

        t_node = ET.SubElement(tx_node, "HIZMET_SAGLAYICI_EGITMEN")
        ET.SubElement(t_node, "AD_SOYAD").text = str(tx["teacher"]["full_name"])
        ET.SubElement(t_node, "TCKN_VKN").text = str(tx["teacher"]["tc_kimlik"] or "")
        ET.SubElement(t_node, "VERGI_DAIRESI").text = str(tx["teacher"]["tax_office"] or "")
        ET.SubElement(t_node, "IL").text = str(tx["teacher"]["city"] or "")
        ET.SubElement(t_node, "ILCE").text = str(tx["teacher"]["district"] or "")
        ET.SubElement(t_node, "ADRES").text = str(tx["teacher"]["address"] or "")
        ET.SubElement(t_node, "IBAN").text = str(tx["teacher"]["iban"] or "")

        b_node = ET.SubElement(tx_node, "HIZMET_ALAN_OGRENCI")
        ET.SubElement(b_node, "AD_SOYAD").text = str(tx["buyer"]["full_name"])
        ET.SubElement(b_node, "EPOSTA").text = str(tx["buyer"]["email"])

        f_node = ET.SubElement(tx_node, "FINANSAL_BILGILER")
        ET.SubElement(f_node, "BRUT_TUTAR", para_birimi="TRY").text = f"{tx['gross_amount']:.2f}"
        ET.SubElement(f_node, "KOMISYON_TUTARI", para_birimi="TRY").text = f"{tx['commission_amount']:.2f}"
        ET.SubElement(f_node, "HAKEDIS_TUTARI", para_birimi="TRY").text = f"{tx['net_amount']:.2f}"
        ET.SubElement(f_node, "ODEME_ARACI_REF").text = str(tx["payment_ref"] or "")

        ET.SubElement(tx_node, "UYUMLULUK_DURUMU").text = "HAZIR" if tx["is_compliant"] else "EKSIK_BILGI"

    return ET.tostring(root, encoding="utf-8", xml_declaration=True).decode("utf-8")
