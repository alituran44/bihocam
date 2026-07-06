"""
PayTR iFrame API ödeme endpoint'leri

POST /payments/checkout  — Sepetten order oluştur + PayTR token al
POST /payments/callback  — PayTR async bildirim (hash doğrulamalı)
GET  /payments/status     — Sipariş ödeme durumu sorgula
"""
import logging
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.api.v1.endpoints.orders import (
    _create_enrollments_for_order,
    _create_teacher_earnings_for_order,
    _load_order,
    generate_order_number,
)
from app.core.config import settings
from app.core.paytr import (
    PAYTR_IFRAME_BASE,
    _amount_to_int,
    _build_user_basket,
    get_iframe_token,
    verify_callback_hash,
)
from app.db.session import get_db
from app.models.cart import CartItem
from app.models.coupon import Coupon, CouponUsage
from app.models.course import Course
from app.models.order import Enrollment, Order, OrderItem, OrderStatus, PaymentMethod
from app.models.teacher_earning import EarningType, TeacherEarning
from app.models.user import User
from app.schemas.payment import CheckoutResponse, PaymentStatusResponse
from app.services.commission import calculate_commission, get_platform_commission_rate, get_platform_currency

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_client_ip(request: Request) -> str:
    """Client IP adresini al. Proxy arkasındaysa X-Forwarded-For kullan."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.post("", response_model=CheckoutResponse)
@router.post("/", response_model=CheckoutResponse)
@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(
    request: Request,
    coupon_code: str | None = None,
    user_name: str | None = None,
    user_phone: str | None = None,
    user_address: str | None = None,
    package_weeks: int | None = None,
    package_hours: int | None = None,
    teacher_id: str | None = None,
    slot_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Sepetten sipariş oluştur ve PayTR iFrame token'ı al.
    Veya canlı ders paketi için sipariş oluştur.
    """
    if package_weeks is not None:
        # 1. Fetch teacher
        teacher_result = await db.execute(select(User).where(User.id == teacher_id, User.role == "teacher"))
        teacher = teacher_result.scalar_one_or_none()
        if not teacher:
            raise HTTPException(status_code=404, detail="Öğretmen bulunamadı")

        # 2. Calculate subtotal & total
        hourly_price = teacher.live_class_price or 0.0
        subtotal = Decimal(str(hourly_price)) * Decimal(str(package_hours)) * Decimal(str(package_weeks))
        
        discount_percent = 0
        if package_weeks == 12: discount_percent = 10
        elif package_weeks == 24: discount_percent = 15
        elif package_weeks == 36: discount_percent = 20
        
        discount_amount = subtotal * Decimal(str(discount_percent)) / Decimal("100")
        total = subtotal - discount_amount

        # 3. Create or verify LiveClassReservation (status: pending)
        from app.models.live_class import TeacherAvailability, LiveClassReservation
        
        # Check slot availability
        slot_result = await db.execute(
            select(TeacherAvailability).where(
                TeacherAvailability.id == slot_id,
                TeacherAvailability.is_booked == False
            )
        )
        slot = slot_result.scalar_one_or_none()
        if slot:
            slot.is_booked = True
            reservation = LiveClassReservation(
                teacher_id=teacher_id,
                student_id=current_user.id,
                availability_id=slot.id,
                date=slot.date,
                start_time=slot.start_time,
                end_time=slot.end_time,
                price=Decimal(str(hourly_price)),
                discount_price=None,
                status="pending",
                student_notes="Ders paketi rezervasyonu"
            )
            db.add(reservation)
            await db.flush()
        else:
            # Check if there is an active reservation already
            res_check = await db.execute(
                select(LiveClassReservation).where(
                    LiveClassReservation.availability_id == slot_id,
                    LiveClassReservation.student_id == current_user.id
                )
            )
            if not res_check.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Seçilen canlı ders slotu uygun değil veya rezerve edilmiş")

        # 4. Create dummy course for package representation if not exists
        dummy_course_result = await db.execute(
            select(Course).where(Course.slug == "canli-ders-paketi")
        )
        dummy_course = dummy_course_result.scalar_one_or_none()
        if not dummy_course:
            import uuid
            dummy_course_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, "canli-ders-paketi"))
            dummy_course = Course(
                id=dummy_course_uuid,
                title="Canlı Ders Paketi",
                slug="canli-ders-paketi",
                price=total,
                status="published",
                teacher_id=teacher_id
            )
            db.add(dummy_course)
            await db.flush()

        # 5. Create Order
        order = Order(
            order_number=generate_order_number(),
            user_id=current_user.id,
            subtotal=subtotal,
            discount_amount=discount_amount,
            total=total,
            status=OrderStatus.PENDING,
            payment_method=PaymentMethod.CREDIT_CARD,
            notes=f"package_purchase | slot_id: {slot_id}"
        )
        db.add(order)
        await db.flush()

        # 6. Create OrderItem
        commission_rate = await get_platform_commission_rate(db)
        platform_commission, teacher_earnings = calculate_commission(total, commission_rate)
        db.add(OrderItem(
            order_id=order.id,
            course_id=dummy_course.id,
            price=subtotal,
            discount_price=discount_amount,
            final_price=total,
            platform_commission_rate=commission_rate,
            platform_commission=platform_commission,
            teacher_earnings=teacher_earnings,
        ))
        await db.flush()
        await db.commit()

        # Get PayTR token
        try:
            user_ip = _get_client_ip(request)
            user_basket = _build_user_basket([
                {
                    "name": f"{package_weeks} Hafta Canlı Ders Paketi ({package_hours} Saat/Hafta)",
                    "price": total,
                    "quantity": 1
                }
            ])
            
            paytr_result = await get_iframe_token(
                user_ip=user_ip,
                merchant_oid=order.order_number,
                email=current_user.email,
                payment_amount=_amount_to_int(total),
                user_basket=user_basket,
                user_name=user_name or current_user.full_name or "Müşteri",
                user_phone=user_phone or getattr(current_user, "phone", None) or "05000000000",
                user_address=user_address or "Türkiye",
                merchant_ok_url=f"{settings.FRONTEND_URL}/payment/success?oid={order.id}",
                merchant_fail_url=f"{settings.FRONTEND_URL}/payment/fail",
            )
            
            if paytr_result.get("status") != "success":
                logger.error(f"PayTR token failed for {order.order_number}: {paytr_result}")
                raise HTTPException(
                    status_code=502,
                    detail=f"Ödeme sistemi hatası: {paytr_result.get('reason', 'Bilinmeyen hata')}",
                )

            token = paytr_result["token"]
            return CheckoutResponse(
                order_id=order.id,
                order_number=order.order_number,
                iframe_token=token,
                iframe_url=f"{PAYTR_IFRAME_BASE}/{token}",
                total=f"{total:.2f}",
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"PayTR token generation failed for order {order.order_number}: {e}")
            raise HTTPException(status_code=500, detail="Ödeme formu oluşturulurken bir hata oluştu")

    # 1. Sepeti çek
    cart_result = await db.execute(
        select(CartItem)
        .options(selectinload(CartItem.course))
        .where(CartItem.user_id == current_user.id)
    )
    cart_items = cart_result.scalars().all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Sepet boş")

    # 2. Subtotal hesapla
    subtotal = sum(item.price_at_add for item in cart_items)

    # 3. Kupon uygula (orders.py'deki aynı logic)
    discount_amount = Decimal("0")
    coupon_usage = None
    applied_campaign = None

    if coupon_code:
        coupon_result = await db.execute(select(Coupon).where(Coupon.code == coupon_code.strip().upper()))
        coupon = coupon_result.scalar_one_or_none()
        if not coupon:
            raise HTTPException(status_code=400, detail="Geçersiz kupon kodu")
        if not coupon.is_active:
            raise HTTPException(status_code=400, detail="Bu kupon aktif değil")

        from sqlalchemy import func
        now = datetime.now()
        if now < coupon.valid_from or now > coupon.valid_until:
            raise HTTPException(status_code=400, detail="Bu kupon geçerlilik süresi dışında")
        if coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
            raise HTTPException(status_code=400, detail="Bu kuponun kullanım limiti dolmuş")

        if coupon.usage_limit_per_user is not None:
            user_usage_result = await db.execute(
                select(func.count(CouponUsage.id)).where(
                    CouponUsage.coupon_id == coupon.id,
                    CouponUsage.user_id == current_user.id,
                )
            )
            if (user_usage_result.scalar() or 0) >= coupon.usage_limit_per_user:
                raise HTTPException(status_code=400, detail="Bu kuponu daha fazla kullanamazsınız")

        from app.models.coupon import CouponType
        if coupon.coupon_type == CouponType.PERCENTAGE:
            discount_amount = subtotal * (coupon.discount_value / Decimal("100"))
            if coupon.max_discount:
                discount_amount = min(discount_amount, coupon.max_discount)
        elif coupon.coupon_type == CouponType.FIXED:
            discount_amount = min(coupon.discount_value, subtotal)

        coupon_usage = CouponUsage(
            coupon_id=coupon.id,
            user_id=current_user.id,
            discount_amount=discount_amount,
        )
        db.add(coupon_usage)
        coupon.used_count += 1
    else:
        from app.services.coupon_service import apply_site_wide_campaign_to_cart
        campaign_result = await apply_site_wide_campaign_to_cart(cart_items, db)
        if campaign_result["applied_campaign"]:
            applied_campaign = campaign_result["applied_campaign"]
            discount_amount = campaign_result["total_discount"]
            coupon_usage = CouponUsage(
                coupon_id=applied_campaign.id,
                user_id=current_user.id,
                discount_amount=discount_amount,
            )
            db.add(coupon_usage)
            applied_campaign.used_count += 1

    total = subtotal - discount_amount
    if total < Decimal("0"):
        total = Decimal("0")

    # 4. Ücretsiz sipariş → PayTR'ye gitme, direkt enrollment
    if total == Decimal("0"):
        order = Order(
            order_number=generate_order_number(),
            user_id=current_user.id,
            subtotal=subtotal,
            discount_amount=discount_amount,
            total=total,
            status=OrderStatus.PAID,
            payment_method=PaymentMethod.MANUAL,
            paid_at=datetime.now(),
        )
        db.add(order)
        await db.flush()

        if coupon_usage:
            coupon_usage.order_id = order.id

        commission_rate = await get_platform_commission_rate(db)
        for cart_item in cart_items:
            final_price = cart_item.price_at_add
            platform_commission, teacher_earnings = calculate_commission(final_price, commission_rate)
            db.add(OrderItem(
                order_id=order.id,
                course_id=cart_item.course.id,
                price=cart_item.course.price,
                discount_price=cart_item.course.discount_price,
                final_price=final_price,
                platform_commission_rate=commission_rate,
                platform_commission=platform_commission,
                teacher_earnings=teacher_earnings,
            ))

        await db.flush()
        await _create_enrollments_for_order(db, order)
        await _create_teacher_earnings_for_order(db, order)

        for cart_item in cart_items:
            await db.delete(cart_item)

        await db.commit()

        return CheckoutResponse(
            order_id=order.id,
            order_number=order.order_number,
            iframe_token="",  # Ücretsiz — iframe yok
            iframe_url="",
            total="0.00",
        )

    # 5. Ücretli sipariş → Order oluştur (PENDING) + PayTR token al
    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id,
        subtotal=subtotal,
        discount_amount=discount_amount,
        total=total,
        status=OrderStatus.PENDING,
        payment_method=PaymentMethod.CREDIT_CARD,
    )
    db.add(order)
    await db.flush()

    if coupon_usage:
        coupon_usage.order_id = order.id

    commission_rate = await get_platform_commission_rate(db)
    for cart_item in cart_items:
        final_price = cart_item.price_at_add
        platform_commission, teacher_earnings = calculate_commission(final_price, commission_rate)
        db.add(OrderItem(
            order_id=order.id,
            course_id=cart_item.course.id,
            price=cart_item.course.price,
            discount_price=cart_item.course.discount_price,
            final_price=final_price,
            platform_commission_rate=commission_rate,
            platform_commission=platform_commission,
            teacher_earnings=teacher_earnings,
        ))

    for cart_item in cart_items:
        await db.delete(cart_item)

    await db.commit()

    # 6. PayTR iFrame token al
    user_basket = _build_user_basket([
        {"name": item.course.title, "price": item.price_at_add, "quantity": 1}
        for item in cart_items
    ])

    paytr_result = await get_iframe_token(
        user_ip=_get_client_ip(request),
        merchant_oid=order.order_number,
        email=current_user.email,
        payment_amount=_amount_to_int(total),
        user_basket=user_basket,
        user_name=user_name or current_user.full_name or "Müşteri",
        user_phone=user_phone or getattr(current_user, "phone", None) or "05000000000",
        user_address=user_address or "Türkiye",
        merchant_ok_url=f"{settings.FRONTEND_URL}/payment/success?oid={order.id}",
        merchant_fail_url=f"{settings.FRONTEND_URL}/payment/fail",
    )

    if paytr_result.get("status") != "success":
        logger.error(f"PayTR token failed for {order.order_number}: {paytr_result}")
        raise HTTPException(
            status_code=502,
            detail=f"Ödeme sistemi hatası: {paytr_result.get('reason', 'Bilinmeyen hata')}",
        )

    token = paytr_result["token"]

    return CheckoutResponse(
        order_id=order.id,
        order_number=order.order_number,
        iframe_token=token,
        iframe_url=f"{PAYTR_IFRAME_BASE}/{token}",
        total=f"{total:.2f}",
    )


@router.post("/callback")
async def payment_callback(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    PayTR async bildirim endpoint'i.
    - Auth koruması YOK (PayTR erişebilmeli)
    - Hash doğrulaması zorunlu
    - Sadece "OK" döner
    """
    form = await request.form()
    merchant_oid = form.get("merchant_oid", "")
    status = form.get("status", "")
    total_amount = form.get("total_amount", "")
    incoming_hash = form.get("hash", "")
    failed_reason_code = form.get("failed_reason_code", "")
    failed_reason_msg = form.get("failed_reason_msg", "")
    test_mode = form.get("test_mode", "")
    payment_type = form.get("payment_type", "")

    logger.info(f"PayTR callback: order={merchant_oid}, status={status}, amount={total_amount}")

    # 1. Hash doğrula
    if not verify_callback_hash(merchant_oid, status, total_amount, incoming_hash):
        logger.error(f"PayTR callback HASH MISMATCH for {merchant_oid}")
        return Response(content="PAYTR notification failed: bad hash", media_type="text/plain")

    # Check if this is an ad campaign payment (prefixed with "AD-")
    if merchant_oid.startswith("AD-"):
        campaign_id = merchant_oid.split("-")[1]
        from app.models.ad_campaign import AdCampaign, PaymentStatus
        
        result = await db.execute(
            select(AdCampaign).where(AdCampaign.id == campaign_id)
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            logger.error(f"PayTR callback: Ad campaign not found: {campaign_id}")
            return Response(content="OK", media_type="text/plain")
            
        if campaign.payment_status == PaymentStatus.PAID:
            logger.info(f"PayTR callback: Ad campaign {campaign_id} already marked PAID")
            return Response(content="OK", media_type="text/plain")
            
        if status == "success":
            campaign.payment_status = PaymentStatus.PAID
            campaign.payment_transaction_id = merchant_oid
            await db.commit()
            logger.info(f"PayTR callback: Ad campaign {campaign_id} marked PAID successfully")
        elif status == "failed":
            logger.warning(f"PayTR callback: Ad campaign {campaign_id} payment failed: {failed_reason_msg}")
            
        return Response(content="OK", media_type="text/plain")

    # 2. Siparişi bul (order_number = merchant_oid)
    result = await db.execute(
        select(Order).where(Order.order_number == merchant_oid)
    )
    order = result.scalar_one_or_none()

    if not order:
        logger.error(f"PayTR callback: order not found: {merchant_oid}")
        return Response(content="OK", media_type="text/plain")

    # 3. İdempotency — zaten işlenmiş mi?
    if order.status in [OrderStatus.PAID, OrderStatus.REFUNDED]:
        logger.info(f"PayTR callback: order {merchant_oid} already processed ({order.status.value})")
        return Response(content="OK", media_type="text/plain")

    # 4. Ödeme sonucu işle
    if status == "success":
        order.status = OrderStatus.PAID
        order.paid_at = datetime.now()
        order.payment_gateway_response = json.dumps({
            "total_amount": total_amount,
            "payment_type": payment_type,
            "test_mode": test_mode,
        }) if payment_type else None

        # Enrollment + teacher earnings oluştur
        try:
            await _create_enrollments_for_order(db, order)
            await _create_teacher_earnings_for_order(db, order)
            # If it's a package purchase, approve the corresponding LiveClassReservation
            if order.notes and "slot_id:" in order.notes:
                parts = order.notes.split("slot_id:")
                if len(parts) > 1:
                    slot_id = parts[1].strip()
                    from app.models.live_class import LiveClassReservation
                    res_query = await db.execute(
                        select(LiveClassReservation).where(LiveClassReservation.availability_id == slot_id)
                    )
                    reservation = res_query.scalar_one_or_none()
                    if reservation:
                        reservation.status = "approved"
            await db.commit()
            logger.info(f"Order {merchant_oid} PAID — enrollments + earnings created")
        except IntegrityError as e:
            await db.rollback()
            logger.warning(f"PayTR callback IntegrityError for {merchant_oid}: {e}")
            # Yeniden dene — idempotent
            order.status = OrderStatus.PAID
            order.paid_at = datetime.now()
            if order.notes and "slot_id:" in order.notes:
                parts = order.notes.split("slot_id:")
                if len(parts) > 1:
                    slot_id = parts[1].strip()
                    from app.models.live_class import LiveClassReservation
                    res_query = await db.execute(
                        select(LiveClassReservation).where(LiveClassReservation.availability_id == slot_id)
                    )
                    reservation = res_query.scalar_one_or_none()
                    if reservation:
                        reservation.status = "approved"
            await db.commit()

        # Bildirim gönder (non-blocking)
        try:
            from app.services.notification_service import NotificationService
            from app.models.notification import NotificationType, NotificationPriority
            notification_service = NotificationService(db)
            await notification_service.send_notification(
                user_ids=[order.user_id],
                notification_type=NotificationType.PAYMENT_SUCCESS,
                title="Ödemeniz Tamamlandı",
                message=f"#{order.order_number} numaralı siparişinizin ödemesi başarıyla tamamlandı.",
                priority=NotificationPriority.MEDIUM,
                action_url=f"/dashboard/courses",
                action_label="Kurslarıma Git",
                delivery_channels=["in_app", "email"],
            )
            await db.commit()
        except Exception as e:
            logger.warning(f"Payment notification failed: {e}")

    elif status == "failed":
        order.status = OrderStatus.FAILED
        order.notes = f"PayTR ödeme başarısız: [{failed_reason_code}] {failed_reason_msg}"
        order.payment_gateway_response = json.dumps({
            "failed_reason_code": failed_reason_code,
            "failed_reason_msg": failed_reason_msg,
        })
        # Free slot if package purchase
        if order.notes and "slot_id:" in order.notes:
            parts = order.notes.split("slot_id:")
            if len(parts) > 1:
                slot_id = parts[1].strip()
                from app.models.live_class import TeacherAvailability, LiveClassReservation
                res_query = await db.execute(
                    select(LiveClassReservation).where(LiveClassReservation.availability_id == slot_id)
                )
                reservation = res_query.scalar_one_or_none()
                if reservation:
                    reservation.status = "rejected"
                slot_query = await db.execute(
                    select(TeacherAvailability).where(TeacherAvailability.id == slot_id)
                )
                slot = slot_query.scalar_one_or_none()
                if slot:
                    slot.is_booked = False
        await db.commit()
        logger.info(f"Order {merchant_oid} FAILED: {failed_reason_code} - {failed_reason_msg}")

    return Response(content="OK", media_type="text/plain")


@router.get("/status/{order_id}", response_model=PaymentStatusResponse)
async def get_payment_status(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sipariş ödeme durumunu sorgula."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    return PaymentStatusResponse(
        order_id=order.id,
        order_number=order.order_number,
        status=order.status.value,
        payment_amount=f"{order.total:.2f}",
        payment_date=order.paid_at.isoformat() if order.paid_at else None,
        currency="TRY",
    )


@router.post("/simulate-callback")
async def simulate_callback(
    order_number: str,
    status: str = "success",  # "success" veya "failed"
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    [SADECE TEST] PayTR callback'ini simüle eder.
    DEBUG=true ve PAYTR_TEST_MODE=1 iken çalışır.
    ngrok olmadan local'de ödeme akışını test etmek için.
    """
    if not settings.DEBUG or settings.PAYTR_TEST_MODE != 1:
        raise HTTPException(status_code=403, detail="Bu endpoint sadece test modunda çalışır")

    result = await db.execute(select(Order).where(Order.order_number == order_number))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu sipariş size ait değil")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Sipariş zaten {order.status.value} durumunda")

    if status == "success":
        order.status = OrderStatus.PAID
        order.paid_at = datetime.now()
        order.payment_gateway_response = json.dumps({"simulated": True, "test_mode": "1"})

        try:
            await _create_enrollments_for_order(db, order)
            await _create_teacher_earnings_for_order(db, order)
            await db.commit()
        except IntegrityError:
            await db.rollback()
            order.status = OrderStatus.PAID
            order.paid_at = datetime.now()
            await db.commit()

        logger.info(f"[SIMULATE] Order {order_number} → PAID")
        return {"status": "success", "message": f"Sipariş {order_number} başarıyla ödendi (simülasyon)"}

    else:
        order.status = OrderStatus.FAILED
        order.notes = "Simüle edilmiş başarısız ödeme"
        await db.commit()
        logger.info(f"[SIMULATE] Order {order_number} → FAILED")
        return {"status": "failed", "message": f"Sipariş {order_number} başarısız olarak işaretlendi (simülasyon)"}


# json import — callback'te kullanılıyor
import json
