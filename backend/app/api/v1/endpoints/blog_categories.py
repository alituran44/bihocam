from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.blog_category import BlogCategory
from app.models.blog_post import BlogPost, BlogPostStatus
from app.schemas.blog_category import (
    BlogCategoryCreate,
    BlogCategoryUpdate,
    BlogCategoryResponse,
    generate_slug,
)
from app.services.blog_service import list_blog_posts

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Admin yetkisi kontrolü"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


async def generate_unique_category_slug(
    db: AsyncSession,
    base_slug: str,
    existing_category_id: str | None = None,
) -> str:
    """Unique category slug üret"""
    slug = base_slug
    counter = 1
    
    while True:
        query = select(BlogCategory).where(BlogCategory.slug == slug)
        if existing_category_id:
            query = query.where(BlogCategory.id != existing_category_id)
        
        result = await db.execute(query)
        existing = result.scalar_one_or_none()
        
        if not existing:
            return slug
        
        counter += 1
        slug = f"{base_slug}-{counter}"


@router.post("", response_model=BlogCategoryResponse)
async def create_category(
    category_data: BlogCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yeni kategori oluştur"""
    # Slug generation
    if not category_data.slug:
        category_data.slug = generate_slug(category_data.name)
    
    category_data.slug = await generate_unique_category_slug(db, category_data.slug)
    
    category = BlogCategory(**category_data.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category, ["parent", "children"])
    
    return BlogCategoryResponse.model_validate(category)


@router.get("", response_model=list[BlogCategoryResponse])
async def list_categories(
    parent_id: str | None = Query(None, description="Parent category ID"),
    is_active: bool | None = Query(None, description="Active filtresi"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Kategorileri listele"""
    query = select(BlogCategory)
    
    if parent_id:
        query = query.where(BlogCategory.parent_id == parent_id)
    elif parent_id is False:  # Explicitly request root categories
        query = query.where(BlogCategory.parent_id.is_(None))
    
    if is_active is not None:
        query = query.where(BlogCategory.is_active == is_active)
    
    query = query.order_by(BlogCategory.order, BlogCategory.name)
    query = query.offset(skip).limit(limit)
    query = query.options(selectinload(BlogCategory.parent), selectinload(BlogCategory.children))
    
    result = await db.execute(query)
    categories = list(result.scalars().unique().all())
    
    return [BlogCategoryResponse.model_validate(cat) for cat in categories]


@router.get("/{category_id}", response_model=BlogCategoryResponse)
async def get_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Kategori detayı"""
    result = await db.execute(
        select(BlogCategory)
        .where(BlogCategory.id == category_id)
        .options(selectinload(BlogCategory.parent), selectinload(BlogCategory.children))
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return BlogCategoryResponse.model_validate(category)


@router.get("/slug/{slug}", response_model=BlogCategoryResponse)
async def get_category_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Slug ile kategori getir"""
    result = await db.execute(
        select(BlogCategory)
        .where(BlogCategory.slug == slug)
        .options(selectinload(BlogCategory.parent), selectinload(BlogCategory.children))
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return BlogCategoryResponse.model_validate(category)


@router.put("/{category_id}", response_model=BlogCategoryResponse)
async def update_category(
    category_id: str,
    category_data: BlogCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kategori güncelle"""
    result = await db.execute(
        select(BlogCategory)
        .where(BlogCategory.id == category_id)
        .options(selectinload(BlogCategory.parent), selectinload(BlogCategory.children))
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Slug güncelleme
    if category_data.slug:
        category_data.slug = await generate_unique_category_slug(db, category_data.slug, existing_category_id=category_id)
    
    # Name değiştiyse slug'ı güncelle
    if category_data.name and category_data.name != category.name:
        if not category_data.slug:
            new_slug = generate_slug(category_data.name)
            category_data.slug = await generate_unique_category_slug(db, new_slug, existing_category_id=category_id)
    
    # Update fields
    update_dict = category_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(category, key, value)
    
    await db.commit()
    await db.refresh(category, ["parent", "children"])
    
    return BlogCategoryResponse.model_validate(category)


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kategori sil"""
    result = await db.execute(
        select(BlogCategory)
        .where(BlogCategory.id == category_id)
        .options(selectinload(BlogCategory.children))
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Alt kategorileri kontrol et
    if category.children:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category with children. Delete or move children first."
        )
    
    # Aktif post'ları kontrol et
    posts_result = await db.execute(
        select(BlogPost)
        .join(BlogPost.categories)
        .where(BlogCategory.id == category_id)
        .where(BlogPost.status == BlogPostStatus.PUBLISHED)
    )
    if posts_result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category with published posts. Archive or remove posts first."
        )
    
    await db.delete(category)
    await db.commit()
    
    return {"message": "Category deleted successfully"}


@router.get("/{category_id}/posts", response_model=list)
async def get_category_posts(
    category_id: str,
    status: BlogPostStatus | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Kategoriye ait yazılar"""
    from app.schemas.blog_post import BlogPostListResponse
    from app.api.v1.endpoints.blog_posts import _build_blog_post_list_response
    
    # Category kontrolü
    result = await db.execute(select(BlogCategory).where(BlogCategory.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    include_draft = current_user is not None and current_user.role in [UserRole.ADMIN, UserRole.TEACHER]
    user_id = current_user.id if current_user else None
    user_role = current_user.role if current_user else None
    
    posts, total = await list_blog_posts(
        db=db,
        status=status,
        category_id=category_id,
        skip=skip,
        limit=limit,
        include_draft=include_draft,
        user_id=user_id,
        user_role=user_role,
    )
    
    return [BlogPostListResponse.model_validate(_build_blog_post_list_response(post)) for post in posts]
