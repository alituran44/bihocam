import logging
import secrets
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.cart import CartItem
from app.models.coupon import Coupon, CouponUsage
from app.models.course import Course
from app.models.order import Enrollment, Order, OrderItem, OrderStatus
from app.models.teacher_earning import EarningType, TeacherEarning
from app.models.user import User, UserRole
from app.schemas.order import (
    OrderAdminResponse,
    OrderCreate,
    OrderRefundRequest,
    OrderResponse,
    OrderTimelineEntry,
)
from app.services.commission import calculate_commission

router = APIRouter()
admin_router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu işlem için admin yetkisi gerekli")
    return current_user


def generate_order_number() -> str:
    timestamp = datetime.now().strftime("%Y%m%d")
    random_part = secrets.token_hex(4).upper()
    return f"ORD{timestamp}{random_part}"


async def _load_order(db: AsyncSession, order_id: str) -> Order | None:
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.user),
            selectinload(Order.coupon_usage).selectinload(CouponUsage.coupon),
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.teacher),
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.categories),
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.lessons),
        )
        .where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


def _build_timeline(order: Order) -> list[OrderTimelineEntry]:
    timeline: list[OrderTimelineEntry] = [
        OrderTimelineEntry(status="created", at=order.created_at, note="Sipariş oluşturuldu")
    ]
    if order.paid_at:
        timeline.append(OrderTimelineEntry(status="paid", at=order.paid_at, note="Ödeme tamamlandı"))
    if order.status == OrderStatus.CANCELLED:
        timeline.append(OrderTimelineEntry(status="cancelled", at=order.updated_at, note=order.notes))
    if order.status == OrderStatus.REFUNDED:
        timeline.append(OrderTimelineEntry(status="refunded", at=order.updated_at, note=order.notes))
    return timeline


def _to_admin_response(order: Order) -> OrderAdminResponse:
    coupon_code = None
    if order.coupon_usage and order.coupon_usage.coupon:
        coupon_code = order.coupon_usage.coupon.code

    payload = OrderAdminResponse.model_validate(order)
    payload.coupon_code = coupon_code
    payload.timeline = _build_timeline(order)
    return payload


async def _create_enrollments_for_order(db: AsyncSession, order: Order) -> None:
    """P0-05: Race condition korumalı enrollment oluşturma — batch query ile N+1 fix."""
    order_items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    order_items = order_items_result.scalars().all()
    if not order_items:
        return

    # Batch: mevcut enrollment'ları tek sorguda çek
    course_ids = [item.course_id for item in order_items]
    existing_result = await db.execute(
        select(Enrollment.course_id).where(
            Enrollment.user_id == order.user_id,
            Enrollment.course_id.in_(course_ids),
        )
    )
    existing_course_ids = {row[0] for row in existing_result.all()}

    for item in order_items:
        if item.course_id not in existing_course_ids:
            db.add(
                Enrollment(
                    user_id=order.user_id,
                    course_id=item.course_id,
                    order_id=order.id,
                )
            )


async def _create_teacher_earnings_for_order(db: AsyncSession, order: Order) -> None:
    from app.services.commission import get_platform_currency
    currency = await get_platform_currency(db)
    
    items_result = await db.execute(
        select(OrderItem).options(selectinload(OrderItem.course)).where(OrderItem.order_id == order.id)
    )
    order_items = items_result.scalars().all()

    for item in order_items:
        reference_id = f"order:{order.id}:course:{item.course_id}"
        existing = await db.execute(
            select(TeacherEarning).where(
                TeacherEarning.reference_id == reference_id,
                TeacherEarning.type == EarningType.EARNING,
            )
        )
        if existing.scalar_one_or_none():
            continue

        if not item.course or not item.course.teacher_id:
            continue

        db.add(
            TeacherEarning(
                teacher_id=item.course.teacher_id,
                course_id=item.course_id,
                order_id=order.id,
                amount=item.teacher_earnings,
                currency=currency,
                gross_amount=item.final_price,
                commission_rate=item.platform_commission_rate,
                commission_amount=item.platform_commission,
                type=EarningType.EARNING,
                description=f"Sipariş geliri: {order.order_number}",
                reference_id=reference_id,
            )
        )


@router.post("", response_model=OrderResponse)
@router.post("/", response_model=OrderResponse)
async def create_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart_result = await db.execute(
        select(CartItem).options(selectinload(CartItem.course)).where(CartItem.user_id == current_user.id)
    )
    cart_items = cart_result.scalars().all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Sepet boş")

    subtotal = sum(item.price_at_add for item in cart_items)
    discount_amount = Decimal("0")
    coupon_usage = None
    applied_campaign = None

    # Check for manual coupon code first
    if order_in.coupon_code:
        coupon_result = await db.execute(select(Coupon).where(Coupon.code == order_in.coupon_code.strip().upper()))
        coupon = coupon_result.scalar_one_or_none()
        if not coupon:
            raise HTTPException(status_code=400, detail="Geçersiz kupon kodu")

        # P0-04: Kupon validasyonu — aktiflik, tarih, global limit, per-user limit
        if not coupon.is_active:
            raise HTTPException(status_code=400, detail="Bu kupon aktif değil")

        now = datetime.now()
        if now < coupon.valid_from or now > coupon.valid_until:
            raise HTTPException(status_code=400, detail="Bu kupon geçerlilik süresi dışında")

        if coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
            raise HTTPException(status_code=400, detail="Bu kuponun kullanım limiti dolmuş")

        # Per-user limit kontrolü
        if coupon.usage_limit_per_user is not None:
            user_usage_result = await db.execute(
                select(func.count(CouponUsage.id)).where(
                    CouponUsage.coupon_id == coupon.id,
                    CouponUsage.user_id == current_user.id,
                )
            )
            user_usage_count = user_usage_result.scalar() or 0
            if user_usage_count >= coupon.usage_limit_per_user:
                raise HTTPException(status_code=400, detail="Bu kuponu daha fazla kullanamazsınız")

        # Min cart value kontrolü
        if coupon.min_cart_value and subtotal < coupon.min_cart_value:
            raise HTTPException(
                status_code=400,
                detail=f"Bu kupon için minimum sepet tutarı {coupon.min_cart_value} TL olmalıdır",
            )

        # P0-01: Discount'ı server-side hesapla — client'tan gelen değere güvenme
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
        # Check for site-wide auto-apply campaign
        from app.services.coupon_service import apply_site_wide_campaign_to_cart
        campaign_result = await apply_site_wide_campaign_to_cart(cart_items, db)

        if campaign_result["applied_campaign"]:
            applied_campaign = campaign_result["applied_campaign"]
            discount_amount = campaign_result["total_discount"]

            # Create CouponUsage record
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

    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id,
        subtotal=subtotal,
        discount_amount=discount_amount,
        total=total,
        status=OrderStatus.PENDING,
        payment_method=order_in.payment_method,
        notes=order_in.notes,
    )
    db.add(order)
    await db.flush()

    if coupon_usage:
        coupon_usage.order_id = order.id

    # Site settings'ten komisyon oranını ve para birimini al
    from app.services.commission import get_platform_commission_rate, get_platform_currency
    commission_rate = await get_platform_commission_rate(db)
    currency = await get_platform_currency(db)
    
    for cart_item in cart_items:
        final_price = cart_item.price_at_add
        platform_commission, teacher_earnings = calculate_commission(final_price, commission_rate)
        db.add(
            OrderItem(
                order_id=order.id,
                course_id=cart_item.course.id,
                price=cart_item.course.price,
                discount_price=cart_item.course.discount_price,
                final_price=final_price,
                platform_commission_rate=commission_rate,
                platform_commission=platform_commission,
                teacher_earnings=teacher_earnings,
            )
        )

    await db.flush()

    if total == Decimal("0"):
        order.status = OrderStatus.PAID
        order.paid_at = datetime.now()
        await _create_enrollments_for_order(db, order)
        await _create_teacher_earnings_for_order(db, order)

    for cart_item in cart_items:
        await db.delete(cart_item)

    # P0-06: Tüm order flow tek transaction'da — hata durumunda tam rollback
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.warning(f"Order creation IntegrityError (possible race condition): {e}")
        raise HTTPException(status_code=409, detail="Sipariş oluşturulamadı, lütfen tekrar deneyin")

    refreshed = await _load_order(db, order.id)
    if not refreshed:
        raise HTTPException(status_code=500, detail="Sipariş oluşturuldu ancak yüklenemedi")

    # P1-10: Sipariş bildirimi — non-blocking
    try:
        from app.services.notification_service import NotificationService
        from app.models.notification import NotificationType, NotificationPriority
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            user_ids=[current_user.id],
            notification_type=NotificationType.ORDER_CONFIRMED,
            title="Siparişiniz Oluşturuldu",
            message=f"#{refreshed.order_number} numaralı siparişiniz başarıyla oluşturuldu.",
            priority=NotificationPriority.MEDIUM,
            action_url=f"/orders/{refreshed.id}",
            action_label="Siparişi Görüntüle",
            delivery_channels=["in_app", "email"],
            data={"order_id": refreshed.id, "order_number": refreshed.order_number},
        )
        await db.commit()
    except Exception as e:
        logger.warning(f"Order notification failed (non-critical): {e}")

    return refreshed


@router.get("", response_model=list[OrderResponse])
@router.get("/", response_model=list[OrderResponse])
async def list_orders(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.teacher),
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.categories),
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.lessons),
        )
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = await _load_order(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    return order


@router.patch("/{order_id}/complete", response_model=OrderResponse)
async def complete_order(
    order_id: str,
    payment_gateway_transaction_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = await _load_order(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="Bu sipariş zaten işlenmiş")

    order.status = OrderStatus.PAID
    order.paid_at = datetime.now()
    if payment_gateway_transaction_id:
        order.payment_gateway_transaction_id = payment_gateway_transaction_id

    # P0-06: Enrollment + earnings tek transaction'da
    await _create_enrollments_for_order(db, order)
    await _create_teacher_earnings_for_order(db, order)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.warning(f"Order completion IntegrityError (possible race condition): {e}")
        raise HTTPException(status_code=409, detail="Sipariş tamamlanamadı, lütfen tekrar deneyin")

    refreshed = await _load_order(db, order.id)
    if not refreshed:
        raise HTTPException(status_code=500, detail="Sipariş güncellendi ancak yüklenemedi")

    # P1-10: Ödeme tamamlandı bildirimi
    try:
        from app.services.notification_service import NotificationService
        from app.models.notification import NotificationType, NotificationPriority
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            user_ids=[current_user.id],
            notification_type=NotificationType.PAYMENT_SUCCESS,
            title="Ödemeniz Tamamlandı",
            message=f"#{refreshed.order_number} numaralı siparişinizin ödemesi başarıyla tamamlandı. Kurslarınıza erişebilirsiniz.",
            priority=NotificationPriority.MEDIUM,
            action_url=f"/dashboard/courses",
            action_label="Kurslarıma Git",
            delivery_channels=["in_app", "email"],
            data={"order_id": refreshed.id, "order_number": refreshed.order_number},
        )
        await db.commit()
    except Exception as e:
        logger.warning(f"Payment notification failed (non-critical): {e}")

    return refreshed


@admin_router.get("", response_model=list[OrderAdminResponse])
@admin_router.get("/", response_model=list[OrderAdminResponse])
async def list_admin_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: OrderStatus | None = Query(None),
    q: str | None = Query(None),
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = select(Order)

    if q:
        query = query.join(User, User.id == Order.user_id)
        like_q = f"%{q.strip()}%"
        query = query.where(or_(User.full_name.ilike(like_q), User.email.ilike(like_q), Order.order_number.ilike(like_q)))

    filters = []
    if status:
        filters.append(Order.status == status)
    if date_from:
        filters.append(Order.created_at >= date_from)
    if date_to:
        filters.append(Order.created_at <= date_to)
    if filters:
        query = query.where(and_(*filters))

    result = await db.execute(
        query.options(
            selectinload(Order.user),
            selectinload(Order.coupon_usage).selectinload(CouponUsage.coupon),
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.teacher),
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.categories),
            selectinload(Order.order_items).selectinload(OrderItem.course).selectinload(Course.lessons),
        )
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    orders = result.scalars().all()
    return [_to_admin_response(order) for order in orders]


@admin_router.get("/{order_id}", response_model=OrderAdminResponse)
async def get_admin_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    order = await _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    return _to_admin_response(order)


@admin_router.patch("/{order_id}/complete", response_model=OrderAdminResponse)
async def complete_order_admin(
    order_id: str,
    payment_gateway_transaction_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    order = await _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Bu sipariş zaten {order.status.value} durumunda")

    order.status = OrderStatus.PAID
    order.paid_at = datetime.now()
    if payment_gateway_transaction_id:
        order.payment_gateway_transaction_id = payment_gateway_transaction_id

    await _create_enrollments_for_order(db, order)
    await _create_teacher_earnings_for_order(db, order)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.warning(f"Admin order completion IntegrityError: {e}")
        raise HTTPException(status_code=409, detail="Sipariş tamamlanamadı, lütfen tekrar deneyin")

    refreshed = await _load_order(db, order.id)
    if not refreshed:
        raise HTTPException(status_code=500, detail="Sipariş güncellendi ancak yüklenemedi")
    return _to_admin_response(refreshed)


@admin_router.patch("/{order_id}/cancel", response_model=OrderAdminResponse)
async def cancel_order_admin(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    order = await _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    if order.status == OrderStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Bu sipariş zaten iptal edilmiş")
    if order.status == OrderStatus.PAID:
        raise HTTPException(status_code=400, detail="Ödenmiş siparişler iptal edilemez, iade işlemi yapın")

    order.status = OrderStatus.CANCELLED
    await db.commit()

    refreshed = await _load_order(db, order.id)
    if not refreshed:
        raise HTTPException(status_code=500, detail="Sipariş güncellendi ancak yüklenemedi")
    return _to_admin_response(refreshed)


@admin_router.post("/{order_id}/refund", response_model=OrderAdminResponse)
async def refund_order_admin(
    order_id: str,
    payload: OrderRefundRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    order = await _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    if order.status not in [OrderStatus.PAID, OrderStatus.REFUNDED]:
        raise HTTPException(status_code=400, detail="Sadece ödenmiş siparişler için iade yapılabilir")

    if order.status == OrderStatus.REFUNDED:
        raise HTTPException(status_code=400, detail="Bu sipariş zaten iade edilmiş")

    refund_amount = payload.amount if payload.amount is not None else order.total
    if refund_amount <= 0:
        raise HTTPException(status_code=400, detail="İade tutarı sıfırdan büyük olmalıdır")
    if refund_amount > order.total:
        raise HTTPException(status_code=400, detail="İade tutarı sipariş toplamından büyük olamaz")

    ratio = refund_amount / order.total if order.total and order.total > 0 else Decimal("1")

    items_result = await db.execute(
        select(OrderItem).options(selectinload(OrderItem.course)).where(OrderItem.order_id == order.id)
    )
    order_items = items_result.scalars().all()

    for item in order_items:
        if not item.course or not item.course.teacher_id:
            continue
        teacher_refund = item.teacher_earnings * ratio
        db.add(
            TeacherEarning(
                teacher_id=item.course.teacher_id,
                course_id=item.course_id,
                order_id=order.id,
                amount=-teacher_refund,
                currency="TRY",
                gross_amount=item.final_price,
                commission_rate=item.platform_commission_rate,
                commission_amount=item.platform_commission,
                type=EarningType.ADJUSTMENT,
                description=f"İade düzeltmesi: {order.order_number}",
                reference_id=f"refund:{order.id}:course:{item.course_id}",
            )
        )

    full_refund = refund_amount == order.total
    if full_refund:
        order.status = OrderStatus.REFUNDED
        reason = payload.reason or "Tam iade"
        order.notes = f"{order.notes or ''}\n[REFUND] {reason}".strip()

        course_ids = [item.course_id for item in order_items]
        enrollments = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == order.user_id,
                Enrollment.course_id.in_(course_ids),
            )
        )
        for enrollment in enrollments.scalars().all():
            await db.delete(enrollment)
    else:
        reason = payload.reason or "Kısmi iade"
        order.notes = f"{order.notes or ''}\n[PARTIAL_REFUND {refund_amount}] {reason}".strip()

    await db.commit()

    refreshed = await _load_order(db, order.id)
    if not refreshed:
        raise HTTPException(status_code=500, detail="İade işlendi ancak sipariş yüklenemedi")
    return _to_admin_response(refreshed)


# Legacy admin aliases for backward compatibility
@router.get("/admin/all", response_model=list[OrderAdminResponse])
async def list_all_orders_admin_legacy(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: OrderStatus | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await list_admin_orders(skip=skip, limit=limit, status=status, db=db, _=_)


@router.patch("/admin/{order_id}/complete", response_model=OrderAdminResponse)
async def complete_order_admin_legacy(
    order_id: str,
    payment_gateway_transaction_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await complete_order_admin(
        order_id=order_id,
        payment_gateway_transaction_id=payment_gateway_transaction_id,
        db=db,
        _=_,
    )


@router.patch("/admin/{order_id}/cancel", response_model=OrderAdminResponse)
async def cancel_order_admin_legacy(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await cancel_order_admin(order_id=order_id, db=db, _=_)


@router.post("/admin/{order_id}/refund", response_model=OrderAdminResponse)
async def refund_order_admin_legacy(
    order_id: str,
    payload: OrderRefundRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await refund_order_admin(order_id=order_id, payload=payload, db=db, _=_)

