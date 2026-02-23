from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.blog_post import BlogPost, BlogPostStatus
from app.models.blog_category import BlogCategory
from app.models.blog_tag import BlogTag
from app.schemas.blog_post import BlogPostResponse, BlogPostUpdate
from app.api.v1.endpoints.blog_posts import _build_blog_post_response
from app.services.blog_service import get_blog_post, update_blog_post, list_blog_posts

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Admin yetkisi kontrolü"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


@router.get("/posts", response_model=list[BlogPostResponse])
async def list_all_posts(
    status: BlogPostStatus | None = Query(None),
    author_id: str | None = Query(None),
    category_id: str | None = Query(None),
    tag_id: str | None = Query(None),
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Tüm blog yazılarını listele (admin)"""
    posts, total = await list_blog_posts(
        db=db,
        status=status,
        author_id=author_id,
        category_id=category_id,
        tag_id=tag_id,
        search=search,
        skip=skip,
        limit=limit,
        include_draft=True,
        user_id=current_user.id,
        user_role=current_user.role,
    )
    
    return [BlogPostResponse.model_validate(_build_blog_post_response(post)) for post in posts]


@router.get("/posts/pending", response_model=list[BlogPostResponse])
async def list_pending_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Onay bekleyen blog yazılarını listele (admin)"""
    posts, total = await list_blog_posts(
        db=db,
        status=BlogPostStatus.PENDING_REVIEW,
        skip=skip,
        limit=limit,
        include_draft=True,
        user_id=current_user.id,
        user_role=current_user.role,
    )
    
    return [BlogPostResponse.model_validate(_build_blog_post_response(post)) for post in posts]


@router.get("/posts/{post_id}", response_model=BlogPostResponse)
async def get_post_admin(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Blog yazısı detayı (admin)"""
    post = await get_blog_post(
        db=db,
        post_id=post_id,
        include_draft=True,
        user_id=current_user.id,
        user_role=current_user.role,
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.put("/posts/{post_id}", response_model=BlogPostResponse)
async def update_post_admin(
    post_id: str,
    post_data: BlogPostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Herhangi bir blog yazısını güncelle (admin override)"""
    try:
        post = await update_blog_post(
            db=db,
            post_id=post_id,
            post_data=post_data,
            user_id=current_user.id,
            user_role=current_user.role,
        )
        return BlogPostResponse.model_validate(_build_blog_post_response(post))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating blog post: {str(e)}")


@router.delete("/posts/{post_id}")
async def delete_post_admin(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Blog yazısını sil (admin)"""
    from app.services.blog_service import delete_blog_post
    
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting blog post: {str(e)}")


@router.post("/posts/{post_id}/feature", response_model=BlogPostResponse)
async def feature_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Öne çıkar"""
    post = await get_blog_post(
        db=db,
        post_id=post_id,
        include_draft=True,
        user_id=current_user.id,
        user_role=current_user.role,
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    post.is_featured = True
    await db.commit()
    await db.refresh(post, ["author", "categories", "tags"])
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.post("/posts/{post_id}/unfeature", response_model=BlogPostResponse)
async def unfeature_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Öne çıkarmayı kaldır"""
    post = await get_blog_post(
        db=db,
        post_id=post_id,
        include_draft=True,
        user_id=current_user.id,
        user_role=current_user.role,
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    post.is_featured = False
    await db.commit()
    await db.refresh(post, ["author", "categories", "tags"])
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.post("/posts/{post_id}/pin", response_model=BlogPostResponse)
async def pin_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Sabitle"""
    post = await get_blog_post(
        db=db,
        post_id=post_id,
        include_draft=True,
        user_id=current_user.id,
        user_role=current_user.role,
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    post.is_pinned = True
    await db.commit()
    await db.refresh(post, ["author", "categories", "tags"])
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.post("/posts/{post_id}/unpin", response_model=BlogPostResponse)
async def unpin_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Sabitlemeyi kaldır"""
    post = await get_blog_post(
        db=db,
        post_id=post_id,
        include_draft=True,
        user_id=current_user.id,
        user_role=current_user.role,
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    post.is_pinned = False
    await db.commit()
    await db.refresh(post, ["author", "categories", "tags"])
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.post("/posts/{post_id}/approve", response_model=BlogPostResponse)
async def approve_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Blog yazısını onayla ve yayınla (admin)"""
    from datetime import datetime
    from sqlalchemy.orm import selectinload
    
    # Post'u eager loading ile getir
    from sqlalchemy import select
    result = await db.execute(
        select(BlogPost)
        .where(BlogPost.id == post_id)
        .options(
            selectinload(BlogPost.author),
            selectinload(BlogPost.categories),
            selectinload(BlogPost.tags),
        )
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    if post.status != BlogPostStatus.PENDING_REVIEW:
        raise HTTPException(
            status_code=400,
            detail=f"Bu yazı onay bekliyor durumunda değil. Mevcut durum: {post.status}"
        )
    
    post.status = BlogPostStatus.PUBLISHED
    if not post.published_at:
        post.published_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(post)
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.post("/posts/{post_id}/reject", response_model=BlogPostResponse)
async def reject_post(
    post_id: str,
    rejection_reason: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Blog yazısını reddet ve taslağa döndür (admin)"""
    from sqlalchemy.orm import selectinload
    from sqlalchemy import select
    
    # Post'u eager loading ile getir
    result = await db.execute(
        select(BlogPost)
        .where(BlogPost.id == post_id)
        .options(
            selectinload(BlogPost.author),
            selectinload(BlogPost.categories),
            selectinload(BlogPost.tags),
        )
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    if post.status != BlogPostStatus.PENDING_REVIEW:
        raise HTTPException(
            status_code=400,
            detail=f"Bu yazı onay bekliyor durumunda değil. Mevcut durum: {post.status}"
        )
    
    post.status = BlogPostStatus.DRAFT
    # Rejection reason'ı bir yere kaydetmek isterseniz, model'e ekleyebilirsiniz
    
    await db.commit()
    await db.refresh(post)
    
    return BlogPostResponse.model_validate(_build_blog_post_response(post))


@router.get("/stats")
async def get_blog_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Blog istatistikleri"""
    # Total posts
    total_result = await db.execute(select(func.count(BlogPost.id)))
    total_posts = total_result.scalar() or 0
    
    # Published posts
    published_result = await db.execute(
        select(func.count(BlogPost.id)).where(BlogPost.status == BlogPostStatus.PUBLISHED)
    )
    published_posts = published_result.scalar() or 0
    
    # Draft posts
    draft_result = await db.execute(
        select(func.count(BlogPost.id)).where(BlogPost.status == BlogPostStatus.DRAFT)
    )
    draft_posts = draft_result.scalar() or 0
    
    # Pending review posts
    pending_result = await db.execute(
        select(func.count(BlogPost.id)).where(BlogPost.status == BlogPostStatus.PENDING_REVIEW)
    )
    pending_posts = pending_result.scalar() or 0
    
    # Total views
    views_result = await db.execute(select(func.sum(BlogPost.view_count)))
    total_views = views_result.scalar() or 0
    
    # Top posts (by view count)
    top_posts_result = await db.execute(
        select(BlogPost)
        .where(BlogPost.status == BlogPostStatus.PUBLISHED)
        .order_by(desc(BlogPost.view_count))
        .limit(10)
        .options(selectinload(BlogPost.author))
    )
    top_posts = list(top_posts_result.scalars().all())
    
    # Top categories (by post count)
    top_categories_result = await db.execute(
        select(
            BlogCategory.id,
            BlogCategory.name,
            func.count(BlogPost.id).label("post_count"),
        )
        .join(BlogPost.categories)
        .where(BlogPost.status == BlogPostStatus.PUBLISHED)
        .group_by(BlogCategory.id, BlogCategory.name)
        .order_by(desc(func.count(BlogPost.id)))
        .limit(10)
    )
    top_categories = [
        {"id": row.id, "name": row.name, "post_count": row.post_count}
        for row in top_categories_result.all()
    ]
    
    # Top tags (by usage_count)
    top_tags_result = await db.execute(
        select(BlogTag)
        .order_by(desc(BlogTag.usage_count))
        .limit(10)
    )
    top_tags = list(top_tags_result.scalars().all())
    
    return {
        "total_posts": total_posts,
        "published_posts": published_posts,
        "draft_posts": draft_posts,
        "pending_posts": pending_posts,
        "total_views": total_views,
        "top_posts": [
            {
                "id": post.id,
                "title": post.title,
                "view_count": post.view_count,
                "author": post.author.full_name if post.author else None,
            }
            for post in top_posts
        ],
        "top_categories": top_categories,
        "top_tags": [
            {
                "id": tag.id,
                "name": tag.name,
                "usage_count": tag.usage_count,
            }
            for tag in top_tags
        ],
    }
