from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func as sql_func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.coupon import Coupon, CouponTriggerType, CouponType, CouponUsage
from app.models.user import User, UserRole
from app.schemas.coupon import (
    CouponCreate,
    CouponResponse,
    CouponUpdate,
    CouponValidateRequest,
    CouponValidateResponse,
)

router = APIRouter()
admin_router = APIRouter()


def require_admin_or_staff(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(status_code=403, detail="Admin veya staff yetkisi gerekli")
    return current_user


@admin_router.post("", response_model=CouponResponse)
@admin_router.post("/", response_model=CouponResponse)
@router.post("", response_model=CouponResponse)
@router.post("/", response_model=CouponResponse)
async def create_coupon(
    coupon_in: CouponCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_staff),
):
    code = coupon_in.code.strip().upper()
    existing = await db.execute(select(Coupon).where(Coupon.code == code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu kupon kodu zaten kullanılıyor")

    if coupon_in.valid_until <= coupon_in.valid_from:
        raise HTTPException(status_code=400, detail="Bitiş tarihi başlangıç tarihinden büyük olmalıdır")
    
    # Site-wide validation
    if coupon_in.trigger_type == CouponTriggerType.SITE_WIDE:
        if coupon_in.category_id is not None:
            raise HTTPException(status_code=400, detail="Site-wide kampanyalar için category_id null olmalıdır")
        
        # Validate target_course_ids if provided
        if coupon_in.target_course_ids:
            from app.models.course import Course
            course_ids = coupon_in.target_course_ids
            course_result = await db.execute(
                select(Course.id).where(Course.id.in_(course_ids))
            )
            existing_course_ids = {str(row[0]) for row in course_result.all()}
            invalid_ids = set(course_ids) - existing_course_ids
            if invalid_ids:
                raise HTTPException(
                    status_code=400,
                    detail=f"Geçersiz kurs ID'leri: {', '.join(invalid_ids)}"
                )

    coupon_data = coupon_in.model_dump()
    coupon_data["code"] = code
    coupon_data["created_by_id"] = current_user.id
    coupon = Coupon(**coupon_data)
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon


@admin_router.get("", response_model=list[CouponResponse])
@admin_router.get("/", response_model=list[CouponResponse])
@router.get("", response_model=list[CouponResponse])
@router.get("/", response_model=list[CouponResponse])
async def list_coupons(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    status: str | None = Query(None, description="active|expired|disabled"),
    trigger_type: str | None = Query(None, description="Filter by trigger type (site_wide, manual, etc.)"),
    is_auto_apply: bool | None = Query(None, description="Filter by auto-apply status"),
    q: str | None = Query(None),
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_staff),
):
    query = select(Coupon)
    now = datetime.now()

    conditions = []
    if q:
        like_q = f"%{q.strip().upper()}%"
        conditions.append(Coupon.code.ilike(like_q))

    if date_from:
        conditions.append(Coupon.created_at >= date_from)
    if date_to:
        conditions.append(Coupon.created_at <= date_to)

    if status == "active":
        conditions.extend([Coupon.is_active == True, Coupon.valid_until >= now])
    elif status == "expired":
        conditions.append(Coupon.valid_until < now)
    elif status == "disabled":
        conditions.append(Coupon.is_active == False)

    # Site-wide filters
    if trigger_type:
        try:
            trigger_enum = CouponTriggerType(trigger_type)
            conditions.append(Coupon.trigger_type == trigger_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid trigger_type: {trigger_type}")
    
    if is_auto_apply is not None:
        conditions.append(Coupon.is_auto_apply == is_auto_apply)

    if conditions:
        query = query.where(and_(*conditions))

    result = await db.execute(
        query.order_by(Coupon.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


@admin_router.get("/{coupon_id}", response_model=CouponResponse)
@router.get("/{coupon_id}", response_model=CouponResponse)
async def get_coupon(
    coupon_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_staff),
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon bulunamadı")
    return coupon


@admin_router.put("/{coupon_id}", response_model=CouponResponse)
@router.patch("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: str,
    coupon_in: CouponUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_staff),
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon bulunamadı")

    data = coupon_in.model_dump(exclude_unset=True)

    if "valid_from" in data or "valid_until" in data:
        valid_from = data.get("valid_from", coupon.valid_from)
        valid_until = data.get("valid_until", coupon.valid_until)
        if valid_until <= valid_from:
            raise HTTPException(status_code=400, detail="Bitiş tarihi başlangıç tarihinden büyük olmalıdır")
    
    # Site-wide validation
    trigger_type = data.get("trigger_type", coupon.trigger_type)
    if trigger_type == CouponTriggerType.SITE_WIDE:
        category_id = data.get("category_id", coupon.category_id)
        if category_id is not None:
            raise HTTPException(status_code=400, detail="Site-wide kampanyalar için category_id null olmalıdır")
        
        # Validate target_course_ids if provided
        target_course_ids = data.get("target_course_ids")
        if target_course_ids is not None:
            from app.models.course import Course
            course_ids = target_course_ids
            course_result = await db.execute(
                select(Course.id).where(Course.id.in_(course_ids))
            )
            existing_course_ids = {str(row[0]) for row in course_result.all()}
            invalid_ids = set(course_ids) - existing_course_ids
            if invalid_ids:
                raise HTTPException(
                    status_code=400,
                    detail=f"Geçersiz kurs ID'leri: {', '.join(invalid_ids)}"
                )

    # Convert timezone-aware datetimes to naive if needed
    from datetime import datetime
    if "valid_from" in data and isinstance(data["valid_from"], datetime) and data["valid_from"].tzinfo is not None:
        data["valid_from"] = data["valid_from"].replace(tzinfo=None)
    if "valid_until" in data and isinstance(data["valid_until"], datetime) and data["valid_until"].tzinfo is not None:
        data["valid_until"] = data["valid_until"].replace(tzinfo=None)

    for key, value in data.items():
        setattr(coupon, key, value)

    await db.commit()
    await db.refresh(coupon)
    return coupon


@admin_router.delete("/{coupon_id}")
@router.delete("/{coupon_id}")
async def disable_coupon(
    coupon_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_staff),
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon bulunamadı")

    coupon.is_active = False
    await db.commit()
    return {"success": True, "message": "Kupon pasif edildi"}


@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    request: CouponValidateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    coupon_result = await db.execute(
        select(Coupon).where(Coupon.code == request.code.strip().upper())
    )
    coupon = coupon_result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon bulunamadı")

    if not coupon.is_active:
        raise HTTPException(status_code=400, detail="Bu kupon aktif değil")

    now = datetime.now()
    if now < coupon.valid_from or now > coupon.valid_until:
        raise HTTPException(status_code=400, detail="Bu kupon geçerli değil")

    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Bu kuponun kullanım limiti dolmuş")

    user_usage_count = await db.execute(
        select(sql_func.count(CouponUsage.id)).where(
            CouponUsage.coupon_id == coupon.id,
            CouponUsage.user_id == current_user.id,
        )
    )
    user_usage = user_usage_count.scalar() or 0
    if coupon.usage_limit_per_user and user_usage >= coupon.usage_limit_per_user:
        raise HTTPException(status_code=400, detail="Bu kuponu daha fazla kullanamazsınız")

    if coupon.trigger_type == CouponTriggerType.CART_VALUE:
        if not coupon.min_cart_value:
            raise HTTPException(status_code=400, detail="Sepet tutarı kontrolü yapılamıyor")
        if request.cart_total < coupon.min_cart_value:
            raise HTTPException(
                status_code=400,
                detail=f"Bu kupon için minimum sepet tutarı ?{coupon.min_cart_value} olmalıdır",
            )

    discount_amount = Decimal("0")
    if coupon.coupon_type == CouponType.PERCENTAGE:
        discount_amount = request.cart_total * (coupon.discount_value / Decimal("100"))
        if coupon.max_discount:
            discount_amount = min(discount_amount, coupon.max_discount)
    elif coupon.coupon_type == CouponType.FIXED:
        discount_amount = min(coupon.discount_value, request.cart_total)

    return CouponValidateResponse(
        valid=True,
        discount_amount=discount_amount,
        coupon_id=coupon.id,
        coupon_code=coupon.code,
    )


@router.get("/public/active-site-wide", response_model=list[CouponResponse])
async def get_active_site_wide_campaigns(
    course_id: str | None = Query(None, description="Filter by specific course ID"),
    db: AsyncSession = Depends(get_db),
):
    """Get active site-wide campaigns (public endpoint)"""
    from app.services.coupon_service import get_active_site_wide_campaigns
    
    course_ids = [course_id] if course_id else None
    campaigns = await get_active_site_wide_campaigns(db, course_ids)
    
    return campaigns

