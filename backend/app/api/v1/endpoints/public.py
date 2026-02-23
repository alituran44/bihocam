from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.site_settings import SiteSettings
from app.schemas.site_settings import PublicSettingsResponse

router = APIRouter()


@router.get("/settings/public", response_model=PublicSettingsResponse)
async def get_public_settings(
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint - sadece güvenli bilgileri döner (auth gereksiz)"""
    result = await db.execute(select(SiteSettings).limit(1))
    row = result.scalar_one_or_none()
    
    if not row:
        # Default değerler
        return PublicSettingsResponse(
            site_title=None,
            logo_url=None,
            favicon_url=None,
            footer_text=None,
            contact_email=None,
            contact_phone=None,
            meta_description=None,
            meta_keywords=None,
            seo={},
            custom_code={},
            platform={},
        )
    
    general = row.general or {}
    
    return PublicSettingsResponse(
        site_title=general.get("site_title"),
        logo_url=general.get("logo_url"),
        favicon_url=general.get("favicon_url"),
        footer_text=general.get("footer_text"),
        contact_email=general.get("contact_email"),
        contact_phone=general.get("contact_phone"),
        meta_description=general.get("meta_description"),
        meta_keywords=general.get("meta_keywords"),
        seo=row.seo or {},  # SEO kodları public (tracking için)
        custom_code=row.custom_code or {},  # Custom kodlar public (sayfaya inject için)
        platform=row.platform or {},  # Platform ayarları (maintenance mode için)
    )
