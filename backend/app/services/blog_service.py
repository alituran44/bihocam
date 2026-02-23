from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.blog_post import BlogPost, BlogPostStatus
from app.models.blog_category import BlogCategory
from app.models.blog_tag import BlogTag
from app.models.user import User, UserRole
from app.schemas.blog_post import BlogPostCreate, BlogPostUpdate
from app.schemas.blog_post import generate_slug


async def generate_unique_slug(
    db: AsyncSession,
    base_slug: str,
    existing_post_id: str | None = None,
) -> str:
    """
    Unique slug üret (duplicate ise -2, -3 ekle).
    
    Args:
        db: Database session
        base_slug: Base slug
        existing_post_id: Mevcut post ID (update için, kendisini hariç tut)
    
    Returns:
        Unique slug
    """
    slug = base_slug
    counter = 1
    
    while True:
        query = select(BlogPost).where(BlogPost.slug == slug)
        if existing_post_id:
            query = query.where(BlogPost.id != existing_post_id)
        
        result = await db.execute(query)
        existing = result.scalar_one_or_none()
        
        if not existing:
            return slug
        
        counter += 1
        slug = f"{base_slug}-{counter}"


async def create_blog_post(
    db: AsyncSession,
    post_data: BlogPostCreate,
    author_id: str,
) -> BlogPost:
    """
    Yeni blog yazısı oluştur.
    
    Args:
        db: Database session
        post_data: Blog post verisi
        author_id: Yazar ID
    
    Returns:
        Oluşturulan BlogPost objesi
    
    Raises:
        ValueError: Validation hatası
    """
    # Slug generation ve unique check
    if not post_data.slug:
        post_data.slug = generate_slug(post_data.title)
    
    post_data.slug = await generate_unique_slug(db, post_data.slug)
    
    # Categories ve tags kontrolü
    categories = []
    if post_data.category_ids:
        result = await db.execute(
            select(BlogCategory).where(BlogCategory.id.in_(post_data.category_ids))
        )
        categories = list(result.scalars().all())
        if len(categories) != len(post_data.category_ids):
            raise ValueError("One or more categories not found")
    
    tags = []
    if post_data.tag_ids:
        result = await db.execute(
            select(BlogTag).where(BlogTag.id.in_(post_data.tag_ids))
        )
        tags = list(result.scalars().all())
        if len(tags) != len(post_data.tag_ids):
            raise ValueError("One or more tags not found")
    
    # Blog post oluştur
    post_dict = post_data.model_dump(exclude={"category_ids", "tag_ids"})
    post = BlogPost(
        **post_dict,
        author_id=author_id,
    )
    
    # Categories ve tags ilişkilendir
    post.categories = categories
    post.tags = tags
    
    # Tag usage_count güncelle
    for tag in tags:
        tag.usage_count += 1
    
    db.add(post)
    await db.commit()
    await db.refresh(post, ["author", "categories", "tags"])
    
    return post


async def update_blog_post(
    db: AsyncSession,
    post_id: str,
    post_data: BlogPostUpdate,
    user_id: str,
    user_role: UserRole,
) -> BlogPost:
    """
    Blog yazısı güncelle.
    
    Args:
        db: Database session
        post_id: Post ID
        post_data: Güncelleme verisi
        user_id: Kullanıcı ID
        user_role: Kullanıcı rolü
    
    Returns:
        Güncellenmiş BlogPost objesi
    
    Raises:
        ValueError: Validation hatası
        PermissionError: Yetki hatası
    """
    # Post'u getir
    result = await db.execute(
        select(BlogPost)
        .where(BlogPost.id == post_id)
        .options(selectinload(BlogPost.author), selectinload(BlogPost.categories), selectinload(BlogPost.tags))
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise ValueError("Blog post not found")
    
    # Author kontrolü (sadece yazar veya admin güncelleyebilir)
    if post.author_id != user_id and user_role != UserRole.ADMIN:
        raise PermissionError("You can only update your own posts")
    
    # Slug güncelleme
    if post_data.slug:
        post_data.slug = await generate_unique_slug(db, post_data.slug, existing_post_id=post_id)
    
    # Title değiştiyse slug'ı güncelle
    if post_data.title and post_data.title != post.title:
        if not post_data.slug:
            new_slug = generate_slug(post_data.title)
            post_data.slug = await generate_unique_slug(db, new_slug, existing_post_id=post_id)
    
    # Update fields
    update_dict = post_data.model_dump(exclude_unset=True, exclude={"category_ids", "tag_ids"})
    for key, value in update_dict.items():
        setattr(post, key, value)
    
    # Categories güncelle
    if post_data.category_ids is not None:
        result = await db.execute(
            select(BlogCategory).where(BlogCategory.id.in_(post_data.category_ids))
        )
        new_categories = list(result.scalars().all())
        if len(new_categories) != len(post_data.category_ids):
            raise ValueError("One or more categories not found")
        post.categories = new_categories
    
    # Tags güncelle
    if post_data.tag_ids is not None:
        # Eski tag'lerin usage_count'unu azalt
        for old_tag in post.tags:
            old_tag.usage_count = max(0, old_tag.usage_count - 1)
        
        # Yeni tag'leri getir
        result = await db.execute(
            select(BlogTag).where(BlogTag.id.in_(post_data.tag_ids))
        )
        new_tags = list(result.scalars().all())
        if len(new_tags) != len(post_data.tag_ids):
            raise ValueError("One or more tags not found")
        
        # Yeni tag'lerin usage_count'unu artır
        for new_tag in new_tags:
            new_tag.usage_count += 1
        
        post.tags = new_tags
    
    await db.commit()
    await db.refresh(post, ["author", "categories", "tags"])
    
    return post


async def delete_blog_post(
    db: AsyncSession,
    post_id: str,
    user_id: str,
    user_role: UserRole,
) -> bool:
    """
    Blog yazısı sil.
    
    Args:
        db: Database session
        post_id: Post ID
        user_id: Kullanıcı ID
        user_role: Kullanıcı rolü
    
    Returns:
        bool: Silindi mi?
    
    Raises:
        ValueError: Post bulunamadı
        PermissionError: Yetki hatası
    """
    # Post'u getir
    result = await db.execute(
        select(BlogPost)
        .where(BlogPost.id == post_id)
        .options(selectinload(BlogPost.tags))
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise ValueError("Blog post not found")
    
    # Author kontrolü
    if post.author_id != user_id and user_role != UserRole.ADMIN:
        raise PermissionError("You can only delete your own posts")
    
    # Tag usage_count güncelle
    for tag in post.tags:
        tag.usage_count = max(0, tag.usage_count - 1)
    
    await db.delete(post)
    await db.commit()
    
    return True


async def get_blog_post(
    db: AsyncSession,
    post_id: str,
    include_draft: bool = False,
    user_id: str | None = None,
    user_role: UserRole | None = None,
) -> BlogPost | None:
    """
    Blog yazısı getir.
    
    Args:
        db: Database session
        post_id: Post ID
        include_draft: Draft post'ları dahil et
        user_id: Kullanıcı ID (author kontrolü için)
        user_role: Kullanıcı rolü
    
    Returns:
        BlogPost objesi veya None
    """
    query = select(BlogPost).where(BlogPost.id == post_id)
    
    # Status kontrolü
    if not include_draft:
        query = query.where(BlogPost.status == BlogPostStatus.PUBLISHED)
    elif user_id and user_role != UserRole.ADMIN:
        # Sadece yazar kendi draft ve pending review yazılarını görebilir
        query = query.where(
            or_(
                BlogPost.status == BlogPostStatus.PUBLISHED,
                and_(
                    BlogPost.status.in_([BlogPostStatus.DRAFT, BlogPostStatus.PENDING_REVIEW]),
                    BlogPost.author_id == user_id,
                ),
            )
        )
    
    result = await db.execute(
        query.options(
            selectinload(BlogPost.author),
            selectinload(BlogPost.categories),
            selectinload(BlogPost.tags),
        )
    )
    return result.scalar_one_or_none()


async def get_blog_post_by_slug(
    db: AsyncSession,
    slug: str,
    include_draft: bool = False,
    user_id: str | None = None,
    user_role: UserRole | None = None,
) -> BlogPost | None:
    """
    Slug ile blog yazısı getir.
    
    Args:
        db: Database session
        slug: Post slug
        include_draft: Draft post'ları dahil et
        user_id: Kullanıcı ID
        user_role: Kullanıcı rolü
    
    Returns:
        BlogPost objesi veya None
    """
    query = select(BlogPost).where(BlogPost.slug == slug)
    
    # Status kontrolü
    if not include_draft:
        query = query.where(BlogPost.status == BlogPostStatus.PUBLISHED)
    elif user_id and user_role != UserRole.ADMIN:
        query = query.where(
            or_(
                BlogPost.status == BlogPostStatus.PUBLISHED,
                and_(
                    BlogPost.status == BlogPostStatus.DRAFT,
                    BlogPost.author_id == user_id,
                ),
            )
        )
    
    result = await db.execute(
        query.options(
            selectinload(BlogPost.author),
            selectinload(BlogPost.categories),
            selectinload(BlogPost.tags),
        )
    )
    return result.scalar_one_or_none()


async def list_blog_posts(
    db: AsyncSession,
    status: BlogPostStatus | None = None,
    author_id: str | None = None,
    category_id: str | None = None,
    tag_id: str | None = None,
    search: str | None = None,
    featured: bool | None = None,
    pinned: bool | None = None,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    include_draft: bool = False,
    user_id: str | None = None,
    user_role: UserRole | None = None,
) -> tuple[list[BlogPost], int]:
    """
    Blog yazılarını listele.
    
    Args:
        db: Database session
        status: Status filtresi
        author_id: Author filtresi
        category_id: Category filtresi
        tag_id: Tag filtresi
        search: Arama terimi (title, excerpt, content)
        featured: Featured filtresi
        pinned: Pinned filtresi
        skip: Pagination skip
        limit: Pagination limit
        sort_by: Sıralama alanı (created_at, published_at, view_count)
        sort_order: Sıralama yönü (asc, desc)
        include_draft: Draft post'ları dahil et
        user_id: Kullanıcı ID
        user_role: Kullanıcı rolü
    
    Returns:
        (posts list, total count)
    """
    # Base query
    query = select(BlogPost)
    count_query = select(func.count(BlogPost.id))
    
    # Status filtresi
    if status:
        query = query.where(BlogPost.status == status)
        count_query = count_query.where(BlogPost.status == status)
    elif not include_draft:
        query = query.where(BlogPost.status == BlogPostStatus.PUBLISHED)
        count_query = count_query.where(BlogPost.status == BlogPostStatus.PUBLISHED)
    elif user_id and user_role != UserRole.ADMIN:
        # Sadece yazar kendi draft ve pending review yazılarını görebilir
        query = query.where(
            or_(
                BlogPost.status == BlogPostStatus.PUBLISHED,
                and_(
                    BlogPost.status.in_([BlogPostStatus.DRAFT, BlogPostStatus.PENDING_REVIEW]),
                    BlogPost.author_id == user_id,
                ),
            )
        )
        count_query = count_query.where(
            or_(
                BlogPost.status == BlogPostStatus.PUBLISHED,
                and_(
                    BlogPost.status.in_([BlogPostStatus.DRAFT, BlogPostStatus.PENDING_REVIEW]),
                    BlogPost.author_id == user_id,
                ),
            )
        )
    
    # Filters
    if author_id:
        query = query.where(BlogPost.author_id == author_id)
        count_query = count_query.where(BlogPost.author_id == author_id)
    
    if category_id:
        query = query.join(BlogPost.categories).where(BlogCategory.id == category_id)
        count_query = count_query.join(BlogPost.categories).where(BlogCategory.id == category_id)
    
    if tag_id:
        query = query.join(BlogPost.tags).where(BlogTag.id == tag_id)
        count_query = count_query.join(BlogPost.tags).where(BlogTag.id == tag_id)
    
    if search:
        search_filter = or_(
            BlogPost.title.ilike(f"%{search}%"),
            BlogPost.excerpt.ilike(f"%{search}%"),
            BlogPost.content.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)
    
    if featured is not None:
        query = query.where(BlogPost.is_featured == featured)
        count_query = count_query.where(BlogPost.is_featured == featured)
    
    if pinned is not None:
        query = query.where(BlogPost.is_pinned == pinned)
        count_query = count_query.where(BlogPost.is_pinned == pinned)
    
    # Sorting
    sort_column = getattr(BlogPost, sort_by, BlogPost.created_at)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)
    
    # Pagination
    query = query.offset(skip).limit(limit)
    
    # Eager loading
    query = query.options(
        selectinload(BlogPost.author),
        selectinload(BlogPost.categories),
        selectinload(BlogPost.tags),
    )
    
    # Execute
    result = await db.execute(query)
    posts = list(result.scalars().unique().all())
    
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    return posts, total


async def increment_view_count(
    db: AsyncSession,
    post_id: str,
) -> int:
    """
    Görüntülenme sayısını artır.
    
    Args:
        db: Database session
        post_id: Post ID
    
    Returns:
        Yeni view count
    """
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    
    if not post:
        raise ValueError("Blog post not found")
    
    post.view_count += 1
    await db.commit()
    await db.refresh(post)
    
    return post.view_count
