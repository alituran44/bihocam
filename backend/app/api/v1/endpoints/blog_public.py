from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user_optional
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.blog_post import BlogPost, BlogPostStatus
from app.models.blog_category import BlogCategory
from app.models.blog_tag import BlogTag
from app.schemas.blog_post import BlogPostResponse, BlogPostListResponse
from app.api.v1.endpoints.blog_posts import _build_blog_post_response, _build_blog_post_list_response
from app.services.blog_service import get_blog_post_by_slug, list_blog_posts, increment_view_count
from app.utils.seo_utils import (
    generate_meta_tags,
    generate_schema_org_json,
    generate_category_meta_tags,
    generate_tag_meta_tags,
    generate_author_meta_tags,
)

router = APIRouter()


@router.get("", response_model=list[BlogPostListResponse])
async def list_public_posts(
    category_slug: str | None = Query(None, description="Category slug filtresi"),
    tag_slug: str | None = Query(None, description="Tag slug filtresi"),
    search: str | None = Query(None, description="Arama terimi"),
    featured: bool | None = Query(None, description="Featured filtresi"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Public blog listesi (sadece published)"""
    category_id = None
    if category_slug:
        result = await db.execute(select(BlogCategory).where(BlogCategory.slug == category_slug))
        category = result.scalar_one_or_none()
        if category:
            category_id = category.id
        else:
            raise HTTPException(status_code=404, detail="Category not found")
    
    tag_id = None
    if tag_slug:
        result = await db.execute(select(BlogTag).where(BlogTag.slug == tag_slug))
        tag = result.scalar_one_or_none()
        if tag:
            tag_id = tag.id
        else:
            raise HTTPException(status_code=404, detail="Tag not found")
    
    posts, total = await list_blog_posts(
        db=db,
        status=BlogPostStatus.PUBLISHED,
        category_id=category_id,
        tag_id=tag_id,
        search=search,
        featured=featured,  # is_featured filter
        skip=skip,
        limit=limit,
        include_draft=False,
    )
    
    return [BlogPostListResponse.model_validate(_build_blog_post_list_response(post)) for post in posts]


@router.get("/{slug}", response_model=BlogPostResponse)
async def get_public_post(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Public blog detayı (view count increment)"""
    post = await get_blog_post_by_slug(
        db=db,
        slug=slug,
        include_draft=False,
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # View count increment
    await increment_view_count(db, post.id)
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.get("/categories", response_model=list)
async def list_public_categories(
    db: AsyncSession = Depends(get_db),
):
    """Public kategori listesi (sadece active)"""
    from app.schemas.blog_category import BlogCategoryResponse
    
    result = await db.execute(
        select(BlogCategory)
        .where(BlogCategory.is_active == True)
        .order_by(BlogCategory.order, BlogCategory.name)
        .options(selectinload(BlogCategory.parent), selectinload(BlogCategory.children))
    )
    categories = list(result.scalars().unique().all())
    
    return [BlogCategoryResponse.model_validate(cat) for cat in categories]


@router.get("/categories/{slug}", response_model=dict)
async def get_public_category(
    slug: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Public kategori detayı + posts"""
    from app.schemas.blog_category import BlogCategoryResponse
    
    result = await db.execute(
        select(BlogCategory)
        .where(BlogCategory.slug == slug)
        .options(selectinload(BlogCategory.parent), selectinload(BlogCategory.children))
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Category posts
    posts, total = await list_blog_posts(
        db=db,
        status=BlogPostStatus.PUBLISHED,
        category_id=category.id,
        skip=skip,
        limit=limit,
        include_draft=False,
    )
    
    return {
        "category": BlogCategoryResponse.model_validate(category),
        "posts": [BlogPostListResponse.model_validate(_build_blog_post_list_response(post)) for post in posts],
        "total": total,
    }


@router.get("/tags", response_model=list)
async def list_public_tags(
    popular: bool = Query(False, description="Popüler etiketler"),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Public etiket listesi"""
    from app.schemas.blog_tag import BlogTagResponse
    
    query = select(BlogTag)
    
    if popular:
        query = query.order_by(func.desc(BlogTag.usage_count), BlogTag.name)
    else:
        query = query.order_by(BlogTag.name)
    
    query = query.limit(limit)
    
    result = await db.execute(query)
    tags = list(result.scalars().all())
    
    return [BlogTagResponse.model_validate(tag) for tag in tags]


@router.get("/tags/{slug}", response_model=dict)
async def get_public_tag(
    slug: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Public etiket detayı + posts"""
    from app.schemas.blog_tag import BlogTagResponse
    
    result = await db.execute(select(BlogTag).where(BlogTag.slug == slug))
    tag = result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Tag posts
    posts, total = await list_blog_posts(
        db=db,
        status=BlogPostStatus.PUBLISHED,
        tag_id=tag.id,
        skip=skip,
        limit=limit,
        include_draft=False,
    )
    
    return {
        "tag": BlogTagResponse.model_validate(tag),
        "posts": [BlogPostListResponse.model_validate(_build_blog_post_list_response(post)) for post in posts],
        "total": total,
    }


@router.get("/authors/{author_id}", response_model=dict)
async def get_public_author(
    author_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Yazar sayfası"""
    from app.schemas.user import UserResponse
    
    result = await db.execute(select(User).where(User.id == author_id))
    author = result.scalar_one_or_none()
    
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    # Author posts
    posts, total = await list_blog_posts(
        db=db,
        status=BlogPostStatus.PUBLISHED,
        author_id=author_id,
        skip=skip,
        limit=limit,
        include_draft=False,
    )
    
    return {
        "author": UserResponse.model_validate(author),
        "posts": [BlogPostListResponse.model_validate(_build_blog_post_list_response(post)) for post in posts],
        "total": total,
    }


@router.get("/search", response_model=list[BlogPostListResponse])
async def search_posts(
    q: str = Query(..., description="Arama terimi"),
    category_id: str | None = Query(None),
    tag_id: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Blog arama (full-text search)"""
    # PostgreSQL full-text search
    # Basit implementasyon: ilike ile arama
    # Gelecekte PostgreSQL tsvector ile full-text search eklenebilir
    
    posts, total = await list_blog_posts(
        db=db,
        status=BlogPostStatus.PUBLISHED,
        category_id=category_id,
        tag_id=tag_id,
        search=q,
        skip=skip,
        limit=limit,
        include_draft=False,
    )
    
    return [BlogPostListResponse.model_validate(_build_blog_post_list_response(post)) for post in posts]
