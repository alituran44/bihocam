"""
Dummy ad placements and pricing seeder
Creates default placements and pricing on startup if they don't exist
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ad_placement import AdPlacement, PlacementType
from app.models.ad_pricing import AdPricing, PricingModel
from app.models.user import User, UserRole
from datetime import datetime, timezone


# Default placements configuration
DEFAULT_PLACEMENTS = [
    {
        "name": "Ana Sayfa Banner",
        "code": "homepage_banner",
        "description": "Ana sayfada features section'dan sonra görünen banner reklam alanı",
        "placement_type": PlacementType.BANNER,
        "location": "homepage",
        "width": 1200,
        "height": 300,
        "max_ads": 1,
        "is_active": True,
        "priority": 100,
    },
    {
        "name": "Kategori Sayfası Banner",
        "code": "category_banner",
        "description": "Kategori sayfasında üstte görünen banner reklam alanı",
        "placement_type": PlacementType.BANNER,
        "location": "category_page",
        "width": 1200,
        "height": 200,
        "max_ads": 1,
        "is_active": True,
        "priority": 90,
    },
    {
        "name": "Kurslar Sayfası Sidebar",
        "code": "sidebar_courses",
        "description": "Kurslar sayfasında sidebar'da görünen reklam alanı",
        "placement_type": PlacementType.SIDEBAR,
        "location": "courses_page",
        "width": 300,
        "height": 250,
        "max_ads": 2,
        "is_active": True,
        "priority": 80,
    },
    {
        "name": "Kurslar Sayfası Inline",
        "code": "inline_courses",
        "description": "Kurslar sayfasında kurslar arasında görünen inline reklam alanı",
        "placement_type": PlacementType.INLINE,
        "location": "courses_page",
        "width": 1200,
        "height": 150,
        "max_ads": 1,
        "is_active": True,
        "priority": 70,
    },
    {
        "name": "Kurs Detay Sidebar",
        "code": "sidebar_course_detail",
        "description": "Kurs detay sayfasında sidebar'da görünen reklam alanı",
        "placement_type": PlacementType.SIDEBAR,
        "location": "course_detail_page",
        "width": 300,
        "height": 250,
        "max_ads": 2,
        "is_active": True,
        "priority": 85,
    },
    {
        "name": "Öne Çıkan Kurslar",
        "code": "featured_courses_homepage",
        "description": "Ana sayfada öne çıkan kurslar bölümü",
        "placement_type": PlacementType.FEATURED_COURSE,
        "location": "homepage",
        "width": 1200,  # Container genişliği (responsive, dinamik yükseklik)
        "height": 1,  # Minimum değer (yükseklik dinamik, kurs sayısına göre değişir)
        "max_ads": 6,
        "is_active": True,
        "priority": 95,
    },
]

# Default pricing configuration (TRY)
DEFAULT_PRICING = {
    "homepage_banner": {
        "fixed_daily": 150.00,
        "per_impression": 0.05,
        "per_click": 2.00,
    },
    "category_banner": {
        "fixed_daily": 100.00,
        "per_impression": 0.03,
        "per_click": 1.50,
    },
    "sidebar_courses": {
        "fixed_daily": 50.00,
        "per_impression": 0.02,
        "per_click": 1.00,
    },
    "inline_courses": {
        "fixed_daily": 80.00,
        "per_impression": 0.025,
        "per_click": 1.25,
    },
    "sidebar_course_detail": {
        "fixed_daily": 60.00,
        "per_impression": 0.022,
        "per_click": 1.10,
    },
    "featured_courses_homepage": {
        "fixed_daily": 200.00,
        "per_impression": 0.08,
        "per_click": 3.00,
    },
}


async def seed_default_placements_and_pricing(db: AsyncSession) -> None:
    """
    Create default placements and pricing if they don't exist.
    Called on application startup.
    """
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    
    # Find an admin user for created_by_id (required for pricing)
    admin_result = await db.execute(
        select(User).where(User.role == UserRole.ADMIN).limit(1)
    )
    admin = admin_result.scalar_one_or_none()
    
    # If no admin exists, skip seeding pricing (placements don't need created_by_id)
    admin_id = admin.id if admin else None
    
    # Create placements
    for placement_data in DEFAULT_PLACEMENTS:
        # Check if placement exists
        result = await db.execute(
            select(AdPlacement).where(AdPlacement.code == placement_data["code"])
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            placement = AdPlacement(**placement_data)
            db.add(placement)
            await db.flush()  # Get ID without committing
            
            # Create pricing for this placement (only if admin exists)
            pricing_data = DEFAULT_PRICING.get(placement_data["code"], {})
            if pricing_data and admin_id:
                # Fixed daily pricing
                if "fixed_daily" in pricing_data:
                    fixed_pricing = AdPricing(
                        placement_id=placement.id,
                        pricing_model=PricingModel.FIXED_DAILY,
                        price_per_day=pricing_data["fixed_daily"],
                        min_daily_budget=pricing_data["fixed_daily"] * 0.5,
                        max_daily_budget=pricing_data["fixed_daily"] * 5,
                        min_campaign_duration_days=1,
                        max_campaign_duration_days=90,
                        is_active=True,
                        effective_from=now,
                        created_by_id=admin_id,
                    )
                    db.add(fixed_pricing)
                
                # Per impression pricing
                if "per_impression" in pricing_data:
                    impression_pricing = AdPricing(
                        placement_id=placement.id,
                        pricing_model=PricingModel.PER_IMPRESSION,
                        price_per_impression=pricing_data["per_impression"],
                        min_daily_budget=10.00,
                        max_daily_budget=1000.00,
                        min_campaign_duration_days=1,
                        max_campaign_duration_days=90,
                        is_active=True,
                        effective_from=now,
                        created_by_id=admin_id,
                    )
                    db.add(impression_pricing)
                
                # Per click pricing
                if "per_click" in pricing_data:
                    click_pricing = AdPricing(
                        placement_id=placement.id,
                        pricing_model=PricingModel.PER_CLICK,
                        price_per_click=pricing_data["per_click"],
                        min_daily_budget=20.00,
                        max_daily_budget=2000.00,
                        min_campaign_duration_days=1,
                        max_campaign_duration_days=90,
                        is_active=True,
                        effective_from=now,
                        created_by_id=admin_id,
                    )
                    db.add(click_pricing)
    
    await db.commit()
