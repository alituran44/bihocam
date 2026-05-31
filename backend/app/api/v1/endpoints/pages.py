from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.page import Page
from app.schemas.page import PageCreate, PageResponse, PageUpdate

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Sadece admin erişebilir"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    return current_user


@router.get("", response_model=list[PageResponse])
@router.get("/", response_model=list[PageResponse])
async def list_pages(
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """Kurumsal sayfaları listeler. Public istekler için sadece aktif olanları döner."""
    stmt = select(Page)
    if not include_inactive:
        stmt = stmt.where(Page.is_active == True)
    
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{slug}", response_model=PageResponse)
async def get_page(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Belirli bir kurumsal sayfayı slug değerine göre getirir (Case-Insensitive)"""
    stmt = select(Page).where(func.lower(Page.slug) == func.lower(slug))
    result = await db.execute(stmt)
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sayfa bulunamadı."
        )
        
    return page


@router.post("", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
async def create_page(
    page_in: PageCreate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Yeni bir kurumsal sayfa oluşturur"""
    # Slug çakışma kontrolü
    stmt = select(Page).where(func.lower(Page.slug) == func.lower(page_in.slug))
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu slug adresi zaten kullanılıyor."
        )
        
    new_page = Page(
        slug=page_in.slug,
        title=page_in.title,
        content=page_in.content,
        is_active=page_in.is_active
    )
    db.add(new_page)
    await db.commit()
    await db.refresh(new_page)
    return new_page


@router.put("/{slug}", response_model=PageResponse)
async def update_page(
    slug: str,
    page_in: PageUpdate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Belirli bir kurumsal sayfayı günceller"""
    stmt = select(Page).where(func.lower(Page.slug) == func.lower(slug))
    result = await db.execute(stmt)
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sayfa bulunamadı."
        )
        
    if page_in.title is not None:
        page.title = page_in.title
    if page_in.content is not None:
        page.content = page_in.content
    if page_in.is_active is not None:
        page.is_active = page_in.is_active
        
    await db.commit()
    await db.refresh(page)
    return page


@router.delete("/{slug}", status_code=status.HTTP_200_OK)
async def delete_page(
    slug: str,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Belirli bir kurumsal sayfayı siler"""
    stmt = select(Page).where(func.lower(Page.slug) == func.lower(slug))
    result = await db.execute(stmt)
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sayfa bulunamadı."
        )
        
    await db.delete(page)
    await db.commit()
    return {"message": "Sayfa başarıyla silindi."}
