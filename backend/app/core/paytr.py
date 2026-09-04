"""
PayTR iFrame API Entegrasyon Servisi

Tüm PayTR API çağrıları bu modülden geçer:
- iFrame token alma
- Callback hash doğrulama
- İade işlemi
- Durum sorgulama
- Platform transfer talebi (pazaryeri — öğretmene ödeme)
"""
import base64
import hashlib
import hmac
import json
import logging
from decimal import Decimal
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

PAYTR_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token"
PAYTR_REFUND_URL = "https://www.paytr.com/odeme/iade"
PAYTR_STATUS_URL = "https://www.paytr.com/odeme/durum-sorgu"
PAYTR_TRANSFER_URL = "https://www.paytr.com/odeme/platform/transfer"
PAYTR_IFRAME_BASE = "https://www.paytr.com/odeme/guvenli"


def _paytr_token(hash_str: str) -> str:
    """
    PayTR HMAC-SHA256 token hesapla.
    hash_str ZATEN merchant_salt içermeli.
    Formül: base64(hmac(merchant_key, hash_str, sha256))
    """
    signature = hmac.new(
        settings.PAYTR_MERCHANT_KEY.encode("utf-8"),
        hash_str.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return base64.b64encode(signature).decode("utf-8")


def _amount_to_int(amount: Decimal) -> int:
    """Decimal tutarı PayTR formatına çevir (100 ile çarp). 9.99 → 999"""
    return int(amount * 100)


def _build_user_basket(items: list[dict]) -> str:
    """
    Sepet içeriğini PayTR formatına çevir.
    items: [{"name": "Kurs Adı", "price": Decimal("99.90"), "quantity": 1}, ...]
    Return: base64 encoded JSON string
    """
    basket = []
    for item in items:
        basket.append([
            str(item["name"]),
            f"{item['price']:.2f}",
            int(item.get("quantity", 1)),
        ])
    basket_json = json.dumps(basket, ensure_ascii=False)
    return base64.b64encode(basket_json.encode("utf-8")).decode("utf-8")


def generate_iframe_token_hash(
    user_ip: str,
    merchant_oid: str,
    email: str,
    payment_amount: int,
    user_basket: str,
    no_installment: int | None = None,
    max_installment: int | None = None,
    currency: str | None = None,
    test_mode: int | None = None,
) -> str:
    """
    iFrame API token hash'i hesaplar.
    Sıralama: merchant_id + user_ip + merchant_oid + email + payment_amount
              + user_basket + no_installment + max_installment + currency + test_mode
    """
    if no_installment is None:
        no_installment = settings.PAYTR_NO_INSTALLMENT
    if max_installment is None:
        max_installment = settings.PAYTR_MAX_INSTALLMENT
    if currency is None:
        currency = settings.PAYTR_CURRENCY
    if test_mode is None:
        test_mode = settings.PAYTR_TEST_MODE

    hash_str = (
        f"{settings.PAYTR_MERCHANT_ID}{user_ip}{merchant_oid}{email}"
        f"{payment_amount}{user_basket}{no_installment}{max_installment}"
        f"{currency}{test_mode}"
    )

    # Salt sona eklenir
    full_str = hash_str + settings.PAYTR_MERCHANT_SALT
    token = _paytr_token(full_str)
    logger.info(f"PayTR TOKEN generated for {merchant_oid}")
    return token


async def get_iframe_token(
    user_ip: str,
    merchant_oid: str,
    email: str,
    payment_amount: int,
    user_basket: str,
    user_name: str = "Müşteri",
    user_address: str = "Türkiye",
    user_phone: str = "05000000000",
    merchant_ok_url: str | None = None,
    merchant_fail_url: str | None = None,
) -> dict[str, Any]:
    """
    PayTR'den iFrame token alır.
    Başarılıysa {"status": "success", "token": "..."} döner.
    """
    if not settings.PAYTR_MERCHANT_ID or settings.PAYTR_MERCHANT_ID == "MOCK":
        logger.warning(f"PayTR credentials not configured. Returning mock token for order {merchant_oid}")
        return {
            "status": "success",
            "token": f"mock_token_{merchant_oid}"
        }

    if merchant_ok_url is None:
        merchant_ok_url = f"{settings.FRONTEND_URL}/payment/success"
    if merchant_fail_url is None:
        merchant_fail_url = f"{settings.FRONTEND_URL}/payment/fail"

    no_installment = settings.PAYTR_NO_INSTALLMENT
    max_installment = settings.PAYTR_MAX_INSTALLMENT
    currency = settings.PAYTR_CURRENCY
    test_mode = settings.PAYTR_TEST_MODE

    paytr_token = generate_iframe_token_hash(
        user_ip=user_ip,
        merchant_oid=merchant_oid,
        email=email,
        payment_amount=payment_amount,
        user_basket=user_basket,
        no_installment=no_installment,
        max_installment=max_installment,
        currency=currency,
        test_mode=test_mode,
    )

    # PayTR tüm değerleri string olarak bekler (form-urlencoded POST)
    payload = {
        "merchant_id": str(settings.PAYTR_MERCHANT_ID),
        "user_ip": str(user_ip),
        "merchant_oid": str(merchant_oid),
        "email": str(email),
        "payment_amount": str(payment_amount),
        "paytr_token": str(paytr_token),
        "user_basket": str(user_basket),
        "debug_on": str(settings.PAYTR_DEBUG),
        "no_installment": str(no_installment),
        "max_installment": str(max_installment),
        "currency": str(currency),
        "test_mode": str(test_mode),
        "merchant_ok_url": str(merchant_ok_url),
        "merchant_fail_url": str(merchant_fail_url),
        "timeout_limit": str(settings.PAYTR_TIMEOUT_LIMIT),
        "lang": "tr",
    }

    if user_name:
        payload["user_name"] = user_name
    if user_address:
        payload["user_address"] = user_address
    if user_phone:
        payload["user_phone"] = user_phone

    logger.info(f"PayTR token request for order {merchant_oid}, amount={payment_amount}")
    logger.info(f"PayTR payload: { {k: v if k != 'paytr_token' else v[:20]+'...' for k,v in payload.items()} }")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(PAYTR_TOKEN_URL, data=payload)
        logger.info(f"PayTR raw response: {response.text[:500]}")
        result = response.json()

    if result.get("status") == "success":
        logger.info(f"PayTR token received for order {merchant_oid}")
    else:
        logger.error(f"PayTR token failed for order {merchant_oid}: {result.get('reason', 'unknown')}")

    return result


def verify_callback_hash(merchant_oid: str, status: str, total_amount: str, incoming_hash: str) -> bool:
    """
    Callback'ten gelen hash'i doğrular.
    Formül: base64(HMAC-SHA256(merchant_oid + merchant_salt + status + total_amount, merchant_key))
    """
    # Callback hash: merchant_oid + merchant_salt + status + total_amount
    hash_str = f"{merchant_oid}{settings.PAYTR_MERCHANT_SALT}{status}{total_amount}"
    expected_hash = _paytr_token(hash_str)
    return hmac.compare_digest(expected_hash, incoming_hash)


def verify_transfer_callback_hash(trans_ids: str, incoming_hash: str) -> bool:
    """
    PayTR Platform Transfer Callback hash doğrulaması.
    trans_ids: PayTR'dan gelen JSON string (örn: '["wd123", "wd456"]')
    Formül: base64(HMAC-SHA256(trans_ids_clean + merchant_salt, merchant_key))
    """
    clean_trans_ids = trans_ids.replace('\\', '')
    hash_str = f"{clean_trans_ids}{settings.PAYTR_MERCHANT_SALT}"
    expected_hash = _paytr_token(hash_str)
    return hmac.compare_digest(expected_hash, incoming_hash)


async def refund_payment(merchant_oid: str, return_amount: Decimal, reference_no: str = "") -> dict[str, Any]:
    """
    PayTR iade API'si.
    return_amount: İade tutarı (Decimal, örn: 99.90)
    Kısmi iade destekler.
    """
    return_amount_str = f"{return_amount:.2f}"

    hash_str = f"{settings.PAYTR_MERCHANT_ID}{merchant_oid}{return_amount_str}{settings.PAYTR_MERCHANT_SALT}"
    paytr_token = _paytr_token(hash_str)

    payload = {
        "merchant_id": settings.PAYTR_MERCHANT_ID,
        "merchant_oid": merchant_oid,
        "return_amount": return_amount_str,
        "paytr_token": paytr_token,
    }
    if reference_no:
        payload["reference_no"] = reference_no

    logger.info(f"PayTR refund request for order {merchant_oid}, amount={return_amount_str}")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(PAYTR_REFUND_URL, data=payload)
        result = response.json()

    if result.get("status") == "success":
        logger.info(f"PayTR refund success for order {merchant_oid}")
    else:
        logger.error(f"PayTR refund failed: {result.get('err_msg', 'unknown')}")

    return result


async def query_payment_status(merchant_oid: str) -> dict[str, Any]:
    """PayTR durum sorgulama API'si."""
    hash_str = f"{settings.PAYTR_MERCHANT_ID}{merchant_oid}{settings.PAYTR_MERCHANT_SALT}"
    paytr_token = _paytr_token(hash_str)

    payload = {
        "merchant_id": settings.PAYTR_MERCHANT_ID,
        "merchant_oid": merchant_oid,
        "paytr_token": paytr_token,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(PAYTR_STATUS_URL, data=payload)
        return response.json()


async def create_platform_transfer(
    merchant_oid: str,
    trans_id: str,
    submerchant_amount: int,
    total_amount: int,
    transfer_name: str,
    transfer_iban: str,
) -> dict[str, Any]:
    """
    Pazaryeri platform transfer talebi — öğretmene ödeme.
    submerchant_amount ve total_amount: kuruş cinsinden (100x)
    """
    hash_str = (
        f"{settings.PAYTR_MERCHANT_ID}{merchant_oid}{trans_id}"
        f"{submerchant_amount}{total_amount}{transfer_name}{transfer_iban}"
        f"{settings.PAYTR_MERCHANT_SALT}"
    )
    paytr_token = _paytr_token(hash_str)

    payload = {
        "merchant_id": settings.PAYTR_MERCHANT_ID,
        "merchant_oid": merchant_oid,
        "trans_id": trans_id,
        "submerchant_amount": submerchant_amount,
        "total_amount": total_amount,
        "transfer_name": transfer_name,
        "transfer_iban": transfer_iban,
        "paytr_token": paytr_token,
    }

    logger.info(f"PayTR transfer request: order={merchant_oid}, trans={trans_id}, amount={submerchant_amount}")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(PAYTR_TRANSFER_URL, data=payload)
        result = response.json()

    if result.get("status") == "success":
        logger.info(f"PayTR transfer success: trans={trans_id}")
    else:
        logger.error(f"PayTR transfer failed: {result.get('err_msg', 'unknown')}")

    return result
