"""
Coupon Service Layer
Site-wide campaign support and coupon business logic
"""
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import and_, func, or_, select, cast, String, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.coupon import Coupon, CouponTriggerType, CouponType


async def get_active_site_wide_campaigns(
    db: AsyncSession,
    course_ids: list[str] | None = None,
) -> list[Coupon]:
    """
    Get active site-wide campaigns that match the given course IDs.
    
    Args:
        db: Database session
        course_ids: Optional list of course IDs to filter campaigns.
                    If None, returns all active site-wide campaigns.
    
    Returns:
        List of active site-wide campaigns, sorted by priority (desc) and discount (desc)
    """
    now = datetime.now()
    
    # Use PostgreSQL text cast to compare enum as string (avoids case sensitivity issues)
    query = (
        select(Coupon)
        .where(
            Coupon.trigger_type == "site_wide",
            Coupon.is_active == True,
            Coupon.valid_from <= now,
            Coupon.valid_until >= now,
        )
    )
    
    # Filter by usage limit
    # Note: We'll check usage_limit in Python after fetching, as it requires comparison with used_count
    
    result = await db.execute(query.order_by(Coupon.auto_apply_priority.desc(), Coupon.discount_value.desc()))
    campaigns = result.scalars().all()
    
    # Filter by usage limit and course IDs
    active_campaigns = []
    for campaign in campaigns:
        # Check usage limit
        if campaign.usage_limit and campaign.used_count >= campaign.usage_limit:
            continue
        
        # Check course matching
        if course_ids is not None:
            applicable = get_applicable_courses_for_campaign(campaign, course_ids)
            if not applicable:
                continue
        
        active_campaigns.append(campaign)
    
    return active_campaigns


def get_applicable_courses_for_campaign(
    campaign: Coupon,
    cart_course_ids: list[str],
) -> list[str]:
    """
    Get list of course IDs from cart that are applicable to the campaign.
    
    Args:
        campaign: The coupon/campaign
        cart_course_ids: List of course IDs in the cart
    
    Returns:
        List of applicable course IDs (empty if none match)
    """
    # If target_course_ids is None or empty, all courses are applicable
    if not campaign.target_course_ids:
        return cart_course_ids
    
    # Otherwise, return intersection of cart courses and target courses
    applicable = [cid for cid in cart_course_ids if cid in campaign.target_course_ids]
    return applicable


async def get_best_site_wide_campaign(
    db: AsyncSession,
    cart_items: list[Any],  # List of CartItem objects
    cart_total: Decimal,
) -> Coupon | None:
    """
    Get the best site-wide campaign for the given cart.
    
    Args:
        db: Database session
        cart_items: List of cart items (must have course_id attribute)
        cart_total: Total cart value
    
    Returns:
        Best matching campaign or None
    """
    # Extract course IDs from cart items
    cart_course_ids = [item.course_id if hasattr(item, "course_id") else str(item.get("course_id", "")) for item in cart_items]
    
    # Get active campaigns
    campaigns = await get_active_site_wide_campaigns(db, cart_course_ids)
    
    if not campaigns:
        return None
    
    # Filter campaigns that match cart requirements
    valid_campaigns = []
    for campaign in campaigns:
        is_valid, error = await validate_site_wide_campaign(campaign, cart_items, cart_total, db)
        if is_valid:
            valid_campaigns.append(campaign)
    
    if not valid_campaigns:
        return None
    
    # Sort by priority (desc) and discount value (desc)
    # Priority is already considered in get_active_site_wide_campaigns
    # Return the first one (highest priority)
    return valid_campaigns[0]


async def validate_site_wide_campaign(
    coupon: Coupon,
    cart_items: list[Any],
    cart_total: Decimal,
    db: AsyncSession,
) -> tuple[bool, str]:
    """
    Validate if a site-wide campaign can be applied to the cart.
    
    Args:
        coupon: The coupon/campaign
        cart_items: List of cart items
        cart_total: Total cart value
        db: Database session
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check if it's a site-wide campaign
    if coupon.trigger_type != CouponTriggerType.SITE_WIDE:
        return False, "Not a site-wide campaign"
    
    # Check if active
    now = datetime.now()
    if not coupon.is_active:
        return False, "Campaign is not active"
    
    if now < coupon.valid_from or now > coupon.valid_until:
        return False, "Campaign is not valid at this time"
    
    # Check usage limit
    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        return False, "Campaign usage limit reached"
    
    # Check course matching
    cart_course_ids = [item.course_id if hasattr(item, "course_id") else str(item.get("course_id", "")) for item in cart_items]
    applicable_courses = get_applicable_courses_for_campaign(coupon, cart_course_ids)
    
    if not applicable_courses:
        return False, "No matching courses in cart"
    
    # Calculate applicable cart total (only for matching courses)
    applicable_total = Decimal("0")
    for item in cart_items:
        course_id = item.course_id if hasattr(item, "course_id") else str(item.get("course_id", ""))
        if course_id in applicable_courses:
            price = item.price_at_add if hasattr(item, "price_at_add") else Decimal(str(item.get("price_at_add", 0)))
            applicable_total += price
    
    # Check min_cart_value (only for applicable courses)
    if coupon.min_cart_value and applicable_total < coupon.min_cart_value:
        return False, f"Minimum cart value not met (required: {coupon.min_cart_value}, applicable: {applicable_total})"
    
    return True, ""


async def apply_site_wide_campaign_to_cart(
    cart_items: list[Any],
    db: AsyncSession,
) -> dict[str, Any]:
    """
    Apply the best site-wide campaign to the cart.
    
    Args:
        cart_items: List of cart items
        db: Database session
    
    Returns:
        Dictionary with:
        - applied_campaign: Coupon | None
        - discount_amount: Decimal
        - applicable_course_ids: list[str]
        - total_discount: Decimal
    """
    # Calculate cart total
    cart_total = sum(
        item.price_at_add if hasattr(item, "price_at_add") else Decimal(str(item.get("price_at_add", 0)))
        for item in cart_items
    )
    
    # Get best campaign
    campaign = await get_best_site_wide_campaign(db, cart_items, cart_total)
    
    if not campaign:
        return {
            "applied_campaign": None,
            "discount_amount": Decimal("0"),
            "applicable_course_ids": [],
            "total_discount": Decimal("0"),
        }
    
    # Get applicable courses
    cart_course_ids = [item.course_id if hasattr(item, "course_id") else str(item.get("course_id", "")) for item in cart_items]
    applicable_course_ids = get_applicable_courses_for_campaign(campaign, cart_course_ids)
    
    # Calculate discount for applicable courses only
    applicable_total = Decimal("0")
    for item in cart_items:
        course_id = item.course_id if hasattr(item, "course_id") else str(item.get("course_id", ""))
        if course_id in applicable_course_ids:
            price = item.price_at_add if hasattr(item, "price_at_add") else Decimal(str(item.get("price_at_add", 0)))
            applicable_total += price
    
    # Calculate discount
    discount_amount = Decimal("0")
    if campaign.coupon_type == CouponType.PERCENTAGE:
        discount_amount = applicable_total * (campaign.discount_value / Decimal("100"))
        if campaign.max_discount:
            discount_amount = min(discount_amount, campaign.max_discount)
    elif campaign.coupon_type == CouponType.FIXED:
        discount_amount = min(campaign.discount_value, applicable_total)
    
    return {
        "applied_campaign": campaign,
        "discount_amount": discount_amount,
        "applicable_course_ids": applicable_course_ids,
        "total_discount": discount_amount,
    }


async def calculate_discount_for_campaign(
    campaign: Coupon,
    applicable_total: Decimal,
) -> Decimal:
    """
    Calculate discount amount for a campaign given the applicable total.
    
    Args:
        campaign: The coupon/campaign
        applicable_total: Total amount to apply discount to
    
    Returns:
        Discount amount
    """
    discount_amount = Decimal("0")
    if campaign.coupon_type == CouponType.PERCENTAGE:
        discount_amount = applicable_total * (campaign.discount_value / Decimal("100"))
        if campaign.max_discount:
            discount_amount = min(discount_amount, campaign.max_discount)
    elif campaign.coupon_type == CouponType.FIXED:
        discount_amount = min(campaign.discount_value, applicable_total)
    
    return discount_amount
