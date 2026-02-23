from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.blog_tag import BlogTag
from app.models.blog_post import BlogPost, BlogPostStatus
from app.schemas.blog_tag import (
    BlogTagCreate,
    BlogTagUpdate,
    BlogTagResponse,
    generate_slug,
)
from app.services.blog_service import list_blog_posts

router = APIRouter()


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Teacher veya Admin yetkisi kontrolü"""
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Öğretmen veya admin yetkisi gerekli")
    return current_user


async def generate_unique_tag_slug(
    db: AsyncSession,
    base_slug: str,
    existing_tag_id: str | None = None,
) -> str:
    """Unique tag slug üret"""
    slug = base_slug
    counter = 1
    
    while True:
        query = select(BlogTag).where(BlogTag.slug == slug)
        if existing_tag_id:
            query = query.where(BlogTag.id != existing_tag_id)
        
        result = await db.execute(query)
        existing = result.scalar_one_or_none()
        
        if not existing:
            return slug
        
        counter += 1
        slug = f"{base_slug}-{counter}"


@router.post("", response_model=BlogTagResponse)
async def create_tag(
    tag_data: BlogTagCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Yeni etiket oluştur"""
    # Slug generation
    if not tag_data.slug:
        tag_data.slug = generate_slug(tag_data.name)
    
    tag_data.slug = await generate_unique_tag_slug(db, tag_data.slug)
    
    tag = BlogTag(**tag_data.model_dump())
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    
    return BlogTagResponse.model_validate(tag)


@router.get("", response_model=list[BlogTagResponse])
async def list_tags(
    search: str | None = Query(None, description="Arama terimi"),
    min_usage_count: int | None = Query(None, ge=0, description="Minimum usage count"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("usage_count", description="Sıralama (usage_count, name)"),
    db: AsyncSession = Depends(get_db),
):
    """Etiketleri listele"""
    query = select(BlogTag)
    
    if search:
        query = query.where(BlogTag.name.ilike(f"%{search}%"))
    
    if min_usage_count is not None:
        query = query.where(BlogTag.usage_count >= min_usage_count)
    
    # Sorting
    if sort == "usage_count":
        query = query.order_by(desc(BlogTag.usage_count), BlogTag.name)
    else:
        query = query.order_by(BlogTag.name)
    
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    tags = list(result.scalars().all())
    
    return [BlogTagResponse.model_validate(tag) for tag in tags]


@router.get("/popular", response_model=list[BlogTagResponse])
async def get_popular_tags(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Popüler etiketler"""
    result = await db.execute(
        select(BlogTag)
        .order_by(desc(BlogTag.usage_count), BlogTag.name)
        .limit(limit)
    )
    tags = list(result.scalars().all())
    
    return [BlogTagResponse.model_validate(tag) for tag in tags]


@router.get("/{tag_id}", response_model=BlogTagResponse)
async def get_tag(
    tag_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Etiket detayı"""
    result = await db.execute(select(BlogTag).where(BlogTag.id == tag_id))
    tag = result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    return BlogTagResponse.model_validate(tag)


@router.get("/slug/{slug}", response_model=BlogTagResponse)
async def get_tag_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Slug ile etiket getir"""
    result = await db.execute(select(BlogTag).where(BlogTag.slug == slug))
    tag = result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    return BlogTagResponse.model_validate(tag)


@router.put("/{tag_id}", response_model=BlogTagResponse)
async def update_tag(
    tag_id: str,
    tag_data: BlogTagUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Etiket güncelle"""
    result = await db.execute(select(BlogTag).where(BlogTag.id == tag_id))
    tag = result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Admin herhangi bir tag'i güncelleyebilir, teacher sadece kendi oluşturduğu tag'leri
    # Ancak tag'lerde created_by_id yok, bu yüzden şimdilik admin-only yapıyoruz
    # Gelecekte created_by_id eklenebilir
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can update tags")
    
    # Slug güncelleme
    if tag_data.slug:
        tag_data.slug = await generate_unique_tag_slug(db, tag_data.slug, existing_tag_id=tag_id)
    
    # Name değiştiyse slug'ı güncelle
    if tag_data.name and tag_data.name != tag.name:
        if not tag_data.slug:
            new_slug = generate_slug(tag_data.name)
            tag_data.slug = await generate_unique_tag_slug(db, new_slug, existing_tag_id=tag_id)
    
    # Update fields
    update_dict = tag_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(tag, key, value)
    
    await db.commit()
    await db.refresh(tag)
    
    return BlogTagResponse.model_validate(tag)


@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Etiket sil"""
    result = await db.execute(
        select(BlogTag)
        .where(BlogTag.id == tag_id)
        .options(selectinload(BlogTag.posts))
    )
    tag = result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Admin herhangi bir tag'i silebilir
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can delete tags")
    
    # Usage count'u güncelle (post'lardan kaldırılacak)
    for post in tag.posts:
        tag.usage_count = max(0, tag.usage_count - 1)
    
    await db.delete(tag)
    await db.commit()
    
    return {"message": "Tag deleted successfully"}


@router.get("/{tag_id}/posts", response_model=list)
async def get_tag_posts(
    tag_id: str,
    status: BlogPostStatus | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Etikete ait yazılar"""
    from app.schemas.blog_post import BlogPostListResponse
    from app.api.v1.endpoints.blog_posts import _build_blog_post_list_response
    
    # Tag kontrolü
    result = await db.execute(select(BlogTag).where(BlogTag.id == tag_id))
    tag = result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    include_draft = current_user is not None and current_user.role in [UserRole.ADMIN, UserRole.TEACHER]
    user_id = current_user.id if current_user else None
    user_role = current_user.role if current_user else None
    
    posts, total = await list_blog_posts(
        db=db,
        status=status,
        tag_id=tag_id,
        skip=skip,
        limit=limit,
        include_draft=include_draft,
        user_id=user_id,
        user_role=user_role,
    )
    
    return [BlogPostListResponse.model_validate(_build_blog_post_list_response(post)) for post in posts]
