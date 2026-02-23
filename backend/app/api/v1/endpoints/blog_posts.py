from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.blog_post import BlogPost, BlogPostStatus
from app.schemas.blog_post import (
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostResponse,
    BlogPostListResponse,
    AuthorInfo,
    CategoryInfo,
    TagInfo,
)
from app.services.blog_service import (
    create_blog_post,
    update_blog_post,
    delete_blog_post,
    get_blog_post,
    get_blog_post_by_slug,
    list_blog_posts,
    increment_view_count,
)

router = APIRouter()


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Teacher veya Admin yetkisi kontrolü"""
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Öğretmen veya admin yetkisi gerekli")
    return current_user


def _build_blog_post_response(post: BlogPost) -> dict:
    """BlogPost objesini response dict'e dönüştür"""
    return {
        "id": post.id,
        "title": post.title,
        "slug": post.slug,
        "excerpt": post.excerpt,
        "content": post.content,
        "featured_image_url": post.featured_image_url,
        "author_id": post.author_id,
        "status": post.status,
        "published_at": post.published_at,
        "view_count": post.view_count,
        "is_featured": post.is_featured,
        "is_pinned": post.is_pinned,
        "allow_comments": post.allow_comments,
        "seo_meta_title": post.seo_meta_title,
        "seo_meta_description": post.seo_meta_description,
        "seo_meta_keywords": post.seo_meta_keywords,
        "seo_og_title": post.seo_og_title,
        "seo_og_description": post.seo_og_description,
        "seo_og_image_url": post.seo_og_image_url,
        "seo_twitter_card": post.seo_twitter_card,
        "seo_canonical_url": post.seo_canonical_url,
        "seo_schema_json": post.seo_schema_json,
        "author": AuthorInfo(
            id=post.author.id,
            full_name=post.author.full_name,
            avatar_url=post.author.avatar_url,
            bio=post.author.bio,
        ) if post.author else None,
        "categories": [
            CategoryInfo(
                id=cat.id,
                name=cat.name,
                slug=cat.slug,
                color=cat.color,
            )
            for cat in post.categories
        ],
        "tags": [
            TagInfo(
                id=tag.id,
                name=tag.name,
                slug=tag.slug,
            )
            for tag in post.tags
        ],
        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }


def _build_blog_post_list_response(post: BlogPost) -> dict:
    """BlogPost objesini list response dict'e dönüştür"""
    return {
        "id": post.id,
        "title": post.title,
        "slug": post.slug,
        "excerpt": post.excerpt,
        "featured_image_url": post.featured_image_url,
        "author_id": post.author_id,
        "author": AuthorInfo(
            id=post.author.id,
            full_name=post.author.full_name,
            avatar_url=post.author.avatar_url,
            bio=post.author.bio,
        ) if post.author else None,
        "status": post.status,
        "published_at": post.published_at,
        "view_count": post.view_count,
        "is_featured": post.is_featured,
        "is_pinned": post.is_pinned,
        "categories": [
            CategoryInfo(
                id=cat.id,
                name=cat.name,
                slug=cat.slug,
                color=cat.color,
            )
            for cat in post.categories
        ],
        "tags": [
            TagInfo(
                id=tag.id,
                name=tag.name,
                slug=tag.slug,
            )
            for tag in post.tags
        ],
        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }


@router.post("", response_model=BlogPostResponse)
async def create_post(
    post_data: BlogPostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Yeni blog yazısı oluştur"""
    try:
        # Teacher'lar sadece DRAFT veya PENDING_REVIEW seçebilir, PUBLISHED seçemez
        if current_user.role == UserRole.TEACHER:
            if post_data.status == BlogPostStatus.PUBLISHED:
                raise HTTPException(
                    status_code=403,
                    detail="Öğretmenler yazıları direkt yayınlayamaz. Lütfen 'Onay Bekliyor' seçin, admin onayından sonra yayınlanacaktır."
                )
            # Eğer PUBLISHED değilse ve status belirtilmemişse, PENDING_REVIEW yap
            if post_data.status is None:
                post_data.status = BlogPostStatus.PENDING_REVIEW
        
        post = await create_blog_post(db, post_data, current_user.id)
        return BlogPostResponse.model_validate(_build_blog_post_response(post))
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating blog post: {str(e)}")


@router.get("", response_model=list[BlogPostListResponse])
async def list_posts(
    status: BlogPostStatus | None = Query(None, description="Status filtresi"),
    author_id: str | None = Query(None, description="Author ID filtresi"),
    category_id: str | None = Query(None, description="Category ID filtresi"),
    tag_id: str | None = Query(None, description="Tag ID filtresi"),
    search: str | None = Query(None, description="Arama terimi"),
    featured: bool | None = Query(None, description="Featured filtresi"),
    pinned: bool | None = Query(None, description="Pinned filtresi"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at", description="Sıralama alanı"),
    sort_order: str = Query("desc", description="Sıralama yönü"),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Blog yazılarını listele"""
    include_draft = current_user is not None and current_user.role in [UserRole.ADMIN, UserRole.TEACHER]
    user_id = current_user.id if current_user else None
    user_role = current_user.role if current_user else None
    
    posts, total = await list_blog_posts(
        db=db,
        status=status,
        author_id=author_id,
        category_id=category_id,
        tag_id=tag_id,
        search=search,
        featured=featured,
        pinned=pinned,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
        include_draft=include_draft,
        user_id=user_id,
        user_role=user_role,
    )
    
    return [BlogPostListResponse.model_validate(_build_blog_post_list_response(post)) for post in posts]


@router.get("/me", response_model=list[BlogPostListResponse])
async def list_my_posts(
    status: BlogPostStatus | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Kullanıcının kendi yazılarını listele"""
    posts, total = await list_blog_posts(
        db=db,
        status=status,
        author_id=current_user.id,
        skip=skip,
        limit=limit,
        include_draft=True,
        user_id=current_user.id,
        user_role=current_user.role,
    )
    
    return [BlogPostListResponse.model_validate(_build_blog_post_list_response(post)) for post in posts]


@router.get("/{post_id}", response_model=BlogPostResponse)
async def get_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Blog yazısı detayı"""
    include_draft = current_user is not None and current_user.role in [UserRole.ADMIN, UserRole.TEACHER]
    user_id = current_user.id if current_user else None
    user_role = current_user.role if current_user else None
    
    post = await get_blog_post(
        db=db,
        post_id=post_id,
        include_draft=include_draft,
        user_id=user_id,
        user_role=user_role,
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.get("/slug/{slug}", response_model=BlogPostResponse)
async def get_post_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Slug ile blog yazısı getir (view count increment)"""
    include_draft = current_user is not None and current_user.role in [UserRole.ADMIN, UserRole.TEACHER]
    user_id = current_user.id if current_user else None
    user_role = current_user.role if current_user else None
    
    post = await get_blog_post_by_slug(
        db=db,
        slug=slug,
        include_draft=include_draft,
        user_id=user_id,
        user_role=user_role,
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # View count increment (sadece published post'lar için)
    if post.status == BlogPostStatus.PUBLISHED:
        await increment_view_count(db, post.id)
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.put("/{post_id}", response_model=BlogPostResponse)
async def update_post(
    post_id: str,
    post_data: BlogPostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Blog yazısı güncelle"""
    # Teacher'lar sadece DRAFT veya PENDING_REVIEW seçebilir, PUBLISHED seçemez
    if current_user.role == UserRole.TEACHER and post_data.status:
        if post_data.status == BlogPostStatus.PUBLISHED:
            raise HTTPException(
                status_code=403,
                detail="Öğretmenler yazıları direkt yayınlayamaz. Lütfen 'Onay Bekliyor' seçin, admin onayından sonra yayınlanacaktır."
            )
    
    try:
        post = await update_blog_post(
            db=db,
            post_id=post_id,
            post_data=post_data,
            user_id=current_user.id,
            user_role=current_user.role,
        )
        return BlogPostResponse.model_validate(_build_blog_post_response(post))
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating blog post: {str(e)}")


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Blog yazısı sil"""
    try:
        await delete_blog_post(
            db=db,
            post_id=post_id,
            user_id=current_user.id,
            user_role=current_user.role,
        )
        return {"message": "Blog post deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting blog post: {str(e)}")


@router.post("/{post_id}/publish", response_model=BlogPostResponse)
async def publish_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Blog yazısını yayınla (Sadece admin)"""
    from datetime import datetime
    
    # Teacher'lar publish edemez, sadece admin
    if current_user.role == UserRole.TEACHER:
        raise HTTPException(
            status_code=403,
            detail="Öğretmenler yazıları direkt yayınlayamaz. Lütfen 'Onay Bekliyor' seçin, admin onayından sonra yayınlanacaktır."
        )
    
    post = await get_blog_post(
        db=db,
        post_id=post_id,
        include_draft=True,
        user_id=current_user.id,
        user_role=current_user.role,
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    post.status = BlogPostStatus.PUBLISHED
    if not post.published_at:
        post.published_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(post, ["author", "categories", "tags"])
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.post("/{post_id}/unpublish", response_model=BlogPostResponse)
async def unpublish_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Blog yazısını taslağa çevir"""
    post = await get_blog_post(
        db=db,
        post_id=post_id,
        include_draft=True,
        user_id=current_user.id,
        user_role=current_user.role,
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    if post.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You can only unpublish your own posts")
    
    post.status = BlogPostStatus.DRAFT
    
    await db.commit()
    await db.refresh(post, ["author", "categories", "tags"])
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))
