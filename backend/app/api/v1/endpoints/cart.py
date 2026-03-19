from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.course import Course, Lesson
from app.models.cart import CartItem
from app.schemas.cart import CartItemResponse, CartItemCreate, CartWithCampaignResponse
from app.schemas.coupon import CouponResponse
from app.services.coupon_service import apply_site_wide_campaign_to_cart

router = APIRouter()


@router.get("", response_model=list[CartItemResponse] | CartWithCampaignResponse)
@router.get("/", response_model=list[CartItemResponse] | CartWithCampaignResponse)
async def get_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    with_campaign: bool = Query(False, description="Include site-wide campaign information"),
):
    """Kullanıcının sepetini getir"""
    from app.models.category import Category
    result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.course).selectinload(Course.teacher),
            selectinload(CartItem.course).selectinload(Course.lessons),
            selectinload(CartItem.course).selectinload(Course.categories)
        )
        .where(CartItem.user_id == current_user.id)
    )
    cart_items = result.scalars().all()
    
    if not with_campaign:
        return cart_items
    
    # Calculate totals
    subtotal = sum(item.price_at_add for item in cart_items)
    
    # Apply site-wide campaign
    campaign_result = await apply_site_wide_campaign_to_cart(cart_items, db)
    
    discount_amount = campaign_result["total_discount"]
    total = subtotal - discount_amount
    if total < 0:
        total = Decimal("0")
    
    # Build response
    applied_campaign = None
    if campaign_result["applied_campaign"]:
        applied_campaign = CouponResponse.model_validate(campaign_result["applied_campaign"])
    
    return CartWithCampaignResponse(
        cart_items=cart_items,
        subtotal=subtotal,
        discount_amount=discount_amount,
        total=total,
        applied_campaign=applied_campaign,
        applicable_course_ids=campaign_result["applicable_course_ids"],
        campaign_applicable_to=campaign_result["applicable_course_ids"],
    )


@router.post("", response_model=CartItemResponse)
@router.post("/", response_model=CartItemResponse)
async def add_to_cart(
    item: CartItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sepete kurs ekle"""
    # Kurs var mı ve yayında mı kontrol et
    from app.models.course import CourseStatus
    course_result = await db.execute(select(Course).where(Course.id == item.course_id))
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Sadece yayınlanmış kurslar sepete eklenebilir
    if course.status != CourseStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Bu kurs henüz yayınlanmamış. Sepete eklenemez.")
    
    # Zaten sepette var mı kontrol et
    existing = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.course_id == item.course_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu kurs zaten sepette")
    
    # Kullanıcı zaten bu kursa kayıtlı mı kontrol et
    from app.models.order import Enrollment
    enrollment = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == item.course_id
        )
    )
    if enrollment.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu kursa zaten kayıtlısınız")
    
    # Fiyatı belirle (indirimli fiyat varsa onu kullan)
    price = course.discount_price if course.discount_price else course.price
    
    cart_item = CartItem(
        user_id=current_user.id,
        course_id=item.course_id,
        price_at_add=price,
    )
    db.add(cart_item)
    await db.commit()
    
    # Tüm ilişkileri eager load et
    from app.models.category import Category
    result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.course).selectinload(Course.teacher),
            selectinload(CartItem.course).selectinload(Course.lessons),
            selectinload(CartItem.course).selectinload(Course.categories)
        )
        .where(CartItem.id == cart_item.id)
    )
    return result.scalar_one()


@router.delete("/{item_id}")
async def remove_from_cart(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sepetten kurs çıkar"""
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id
        )
    )
    cart_item = result.scalar_one_or_none()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Sepet öğesi bulunamadı")
    
    db.delete(cart_item)
    await db.commit()
    
    return {"message": "Kurs sepetten çıkarıldı"}


@router.delete("")
@router.delete("/")
async def clear_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sepeti temizle"""
    result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    cart_items = result.scalars().all()
    
    for item in cart_items:
        db.delete(item)
    
    await db.commit()
    
    return {"message": "Sepet temizlendi"}


@router.get("/active-campaign", response_model=dict)
async def get_cart_active_campaign(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get active site-wide campaign for the user's cart"""
    result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.course)
        )
        .where(CartItem.user_id == current_user.id)
    )
    cart_items = result.scalars().all()
    
    if not cart_items:
        return {
            "campaign": None,
            "applicable_course_ids": [],
            "discount_breakdown": {},
        }
    
    # Apply site-wide campaign
    campaign_result = await apply_site_wide_campaign_to_cart(cart_items, db)
    
    applied_campaign = None
    if campaign_result["applied_campaign"]:
        applied_campaign = CouponResponse.model_validate(campaign_result["applied_campaign"])
    
    # Calculate discount breakdown per course
    discount_breakdown = {}
    if campaign_result["applied_campaign"] and campaign_result["applicable_course_ids"]:
        from app.services.coupon_service import calculate_discount_for_campaign
        campaign = campaign_result["applied_campaign"]
        for item in cart_items:
            if item.course_id in campaign_result["applicable_course_ids"]:
                course_discount = await calculate_discount_for_campaign(campaign, item.price_at_add)
                discount_breakdown[item.course_id] = float(course_discount)
    
    return {
        "campaign": applied_campaign.model_dump() if applied_campaign else None,
        "applicable_course_ids": campaign_result["applicable_course_ids"],
        "discount_breakdown": discount_breakdown,
    }
