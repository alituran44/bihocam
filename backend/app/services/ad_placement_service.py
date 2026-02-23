from __future__ import annotations

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ad_placement import AdPlacement
from app.models.ad_campaign import AdCampaign, CampaignStatus
from app.schemas.ad_placement import AdPlacementCreate, AdPlacementUpdate


async def create_ad_placement(
    db: AsyncSession,
    placement_data: AdPlacementCreate,
    admin_id: str,
) -> AdPlacement:
    """
    Yeni reklam yerleşimi oluştur.
    
    Args:
        db: Database session
        placement_data: Placement verisi
        admin_id: Admin ID
    
    Returns:
        Oluşturulan AdPlacement objesi
    
    Raises:
        ValueError: Validation hatası
    """
    # Check code uniqueness
    existing_result = await db.execute(
        select(AdPlacement).where(AdPlacement.code == placement_data.code)
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        raise ValueError(f"Placement with code '{placement_data.code}' already exists")

    placement = AdPlacement(**placement_data.model_dump())
    db.add(placement)
    await db.commit()
    await db.refresh(placement)

    return placement


async def update_ad_placement(
    db: AsyncSession,
    placement_id: str,
    placement_data: AdPlacementUpdate,
    admin_id: str,
) -> AdPlacement:
    """
    Reklam yerleşimini güncelle.
    
    Args:
        db: Database session
        placement_id: Placement ID
        placement_data: Güncelleme verisi
        admin_id: Admin ID
    
    Returns:
        Güncellenmiş AdPlacement objesi
    """
    result = await db.execute(
        select(AdPlacement).where(AdPlacement.id == placement_id)
    )
    placement = result.scalar_one_or_none()
    if not placement:
        raise ValueError("Placement not found")

    # Check code uniqueness (if code is being updated)
    if placement_data.code and placement_data.code != placement.code:
        existing_result = await db.execute(
            select(AdPlacement).where(AdPlacement.code == placement_data.code)
        )
        existing = existing_result.scalar_one_or_none()
        if existing:
            raise ValueError(f"Placement with code '{placement_data.code}' already exists")

    # Update fields
    update_dict = placement_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(placement, key, value)

    await db.commit()
    await db.refresh(placement)

    return placement


async def delete_ad_placement(
    db: AsyncSession,
    placement_id: str,
    admin_id: str,
) -> bool:
    """
    Reklam yerleşimini sil.
    
    Args:
        db: Database session
        placement_id: Placement ID
        admin_id: Admin ID
    
    Returns:
        True if deleted
    
    Raises:
        ValueError: Validation hatası
    """
    result = await db.execute(
        select(AdPlacement).where(AdPlacement.id == placement_id)
    )
    placement = result.scalar_one_or_none()
    if not placement:
        raise ValueError("Placement not found")

    # Check for active campaigns
    active_campaigns_result = await db.execute(
        select(AdCampaign).where(
            and_(
                AdCampaign.placement_id == placement_id,
                AdCampaign.status == CampaignStatus.ACTIVE,
            )
        )
    )
    active_campaigns = active_campaigns_result.scalars().all()
    if active_campaigns:
        raise ValueError(
            f"Cannot delete placement with {len(active_campaigns)} active campaigns"
        )

    await db.delete(placement)
    await db.commit()

    return True


async def get_active_placements(
    db: AsyncSession,
) -> list[AdPlacement]:
    """
    Aktif yerleşimleri getir.
    
    Args:
        db: Database session
    
    Returns:
        Aktif yerleşimler listesi
    """
    result = await db.execute(
        select(AdPlacement)
        .where(AdPlacement.is_active == True)
        .order_by(AdPlacement.priority.desc(), AdPlacement.created_at.desc())
    )
    return list(result.scalars().all())


async def get_placement_with_pricing(
    db: AsyncSession,
    placement_id: str,
) -> AdPlacement:
    """
    Yerleşim + aktif pricing bilgisi getir.
    
    Args:
        db: Database session
        placement_id: Placement ID
    
    Returns:
        AdPlacement objesi (pricing relationship loaded)
    """
    from sqlalchemy.orm import selectinload
    from datetime import datetime

    result = await db.execute(
        select(AdPlacement)
        .options(selectinload(AdPlacement.pricing))
        .where(AdPlacement.id == placement_id)
    )
    placement = result.scalar_one_or_none()
    if not placement:
        raise ValueError("Placement not found")

    return placement
