from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User, UserRole
from app.models.social import SocialPost, PostLike, SavedPost, UserFollow, MediaType, PostComment
from app.schemas.social import (
    SocialPostCreate,
    SocialPostUpdate,
    SocialPostResponse,
    FollowResponse,
    LikeResponse,
    SavedPostResponse,
    PostCommentCreate,
    PostCommentResponse,
)

router = APIRouter()

# -- FOLLOW & UNFOLLOW --

@router.post("/follow/{user_id}", response_model=FollowResponse)
async def follow_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")
        
    # Check if target user exists
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if already following
    stmt = select(UserFollow).where(
        UserFollow.follower_id == current_user.id,
        UserFollow.following_id == user_id
    )
    result = await db.execute(stmt)
    follow = result.scalar_one_or_none()
    
    if follow:
        raise HTTPException(status_code=400, detail="Already following this user")
        
    new_follow = UserFollow(follower_id=current_user.id, following_id=user_id)
    db.add(new_follow)
    await db.commit()
    await db.refresh(new_follow)
    return new_follow

@router.delete("/follow/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(UserFollow).where(
        UserFollow.follower_id == current_user.id,
        UserFollow.following_id == user_id
    )
    result = await db.execute(stmt)
    follow = result.scalar_one_or_none()
    
    if not follow:
        raise HTTPException(status_code=404, detail="Not following this user")
        
    await db.delete(follow)
    await db.commit()

@router.get("/followers", response_model=List[FollowResponse])
async def get_followers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # This endpoint is to see who follows ME
    # In a real app we would paginate this
    stmt = select(UserFollow).where(UserFollow.following_id == current_user.id)
    result = await db.execute(stmt)
    followers = result.scalars().all()
    # Need to load the 'follower' relation in schemas
    return followers

@router.get("/following", response_model=List[FollowResponse])
async def get_following(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(UserFollow).where(UserFollow.follower_id == current_user.id)
    result = await db.execute(stmt)
    following = result.scalars().all()
    return following

# -- POSTS (CRUD) --

@router.post("/posts", response_model=SocialPostResponse)
async def create_post(
    post_in: SocialPostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only Admin and Teachers can create posts in the current design
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Not enough permissions to post")
        
    new_post = SocialPost(
        user_id=current_user.id,
        content=post_in.content,
        media_url=post_in.media_url,
        media_type=post_in.media_type,
        target_level=post_in.target_level or "all"
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    
    setattr(new_post, 'likes_count', 0)
    setattr(new_post, 'saves_count', 0)
    setattr(new_post, 'comments_count', 0)
    setattr(new_post, 'is_liked_by_me', False)
    setattr(new_post, 'is_saved_by_me', False)
    new_post.user = current_user
    
    return new_post

@router.put("/posts/{post_id}", response_model=SocialPostResponse)
async def update_post(
    post_id: str,
    post_in: SocialPostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(SocialPost).options(selectinload(SocialPost.user)).where(SocialPost.id == post_id)
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post bulunamadı")
        
    if post.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu gönderiyi düzenleme yetkiniz yok")
        
    if post_in.content is not None:
        post.content = post_in.content
    if post_in.media_url is not None:
        post.media_url = post_in.media_url
    if post_in.media_type is not None:
        post.media_type = post_in.media_type
    if post_in.target_level is not None:
        post.target_level = post_in.target_level
        
    await db.commit()
    await db.refresh(post)
    
    likes_stmt = select(func.count(PostLike.id)).where(PostLike.post_id == post.id)
    saves_stmt = select(func.count(SavedPost.id)).where(SavedPost.post_id == post.id)
    comments_stmt = select(func.count(PostComment.id)).where(PostComment.post_id == post.id)
    my_like_stmt = select(PostLike).where(PostLike.post_id == post.id, PostLike.user_id == current_user.id)
    my_save_stmt = select(SavedPost).where(SavedPost.post_id == post.id, SavedPost.user_id == current_user.id)
    
    l_cnt = await db.execute(likes_stmt)
    s_cnt = await db.execute(saves_stmt)
    c_cnt = await db.execute(comments_stmt)
    m_like = await db.execute(my_like_stmt)
    m_save = await db.execute(my_save_stmt)
    
    setattr(post, 'likes_count', l_cnt.scalar() or 0)
    setattr(post, 'saves_count', s_cnt.scalar() or 0)
    setattr(post, 'comments_count', c_cnt.scalar() or 0)
    setattr(post, 'is_liked_by_me', m_like.scalar_one_or_none() is not None)
    setattr(post, 'is_saved_by_me', m_save.scalar_one_or_none() is not None)
    
    return post

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(SocialPost).where(SocialPost.id == post_id)
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post bulunamadı")
        
    if post.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu gönderiyi silme yetkiniz yok")
        
    from sqlalchemy import delete
    await db.execute(delete(PostLike).where(PostLike.post_id == post_id))
    await db.execute(delete(SavedPost).where(SavedPost.post_id == post_id))
    await db.execute(delete(PostComment).where(PostComment.post_id == post_id))
    await db.delete(post)
    await db.commit()
    
    return {"message": "Gönderi başarıyla silindi"}

@router.get("/posts/reels", response_model=List[SocialPostResponse])
async def get_reels_feed(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    level: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    # Fetch posts with media_type=VIDEO and level filtering
    stmt = select(SocialPost).options(selectinload(SocialPost.user)).where(SocialPost.media_type == MediaType.VIDEO)
    if level and level != "all":
        stmt = stmt.where(
            or_(
                SocialPost.target_level == level,
                SocialPost.target_level == "all",
                SocialPost.target_level.is_(None)
            )
        )
    stmt = stmt.order_by(SocialPost.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    posts = result.scalars().all()
    
    # We should normally use subqueries for likes and saves counts, 
    # but for simplicity in this prototype, we'll manually fetch them or let SQLAlchemy lazy load (not recommended for async).
    # Since this is an async session, we must eagerly load or compute manually.
    # To keep it simple:
    
    response_list = []
    for post in posts:
        # manual count
        likes_stmt = select(func.count(PostLike.id)).where(PostLike.post_id == post.id)
        saves_stmt = select(func.count(SavedPost.id)).where(SavedPost.post_id == post.id)
        
        my_like_stmt = select(PostLike).where(PostLike.post_id == post.id, PostLike.user_id == current_user.id)
        my_save_stmt = select(SavedPost).where(SavedPost.post_id == post.id, SavedPost.user_id == current_user.id)
        
        comments_stmt = select(func.count(PostComment.id)).where(PostComment.post_id == post.id)
        
        l_cnt = await db.execute(likes_stmt)
        s_cnt = await db.execute(saves_stmt)
        c_cnt = await db.execute(comments_stmt)
        m_like = await db.execute(my_like_stmt)
        m_save = await db.execute(my_save_stmt)
        
        setattr(post, 'likes_count', l_cnt.scalar() or 0)
        setattr(post, 'saves_count', s_cnt.scalar() or 0)
        setattr(post, 'comments_count', c_cnt.scalar() or 0)
        setattr(post, 'is_liked_by_me', m_like.scalar_one_or_none() is not None)
        setattr(post, 'is_saved_by_me', m_save.scalar_one_or_none() is not None)
        
        response_list.append(post)
        
    return response_list

# -- LIKES & SAVES --

@router.post("/posts/{post_id}/like", response_model=LikeResponse)
async def like_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # check post
    stmt = select(SocialPost).where(SocialPost.id == post_id)
    post = (await db.execute(stmt)).scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    stmt = select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.id)
    like = (await db.execute(stmt)).scalar_one_or_none()
    if like:
        raise HTTPException(status_code=400, detail="Already liked")
        
    new_like = PostLike(user_id=current_user.id, post_id=post_id)
    db.add(new_like)
    await db.commit()
    await db.refresh(new_like)
    return new_like

@router.delete("/posts/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.id)
    like = (await db.execute(stmt)).scalar_one_or_none()
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
        
    await db.delete(like)
    await db.commit()

@router.post("/posts/{post_id}/save", response_model=SavedPostResponse)
async def save_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(SocialPost).where(SocialPost.id == post_id)
    post = (await db.execute(stmt)).scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    stmt = select(SavedPost).where(SavedPost.post_id == post_id, SavedPost.user_id == current_user.id)
    saved = (await db.execute(stmt)).scalar_one_or_none()
    if saved:
        raise HTTPException(status_code=400, detail="Already saved")
        
    new_saved = SavedPost(user_id=current_user.id, post_id=post_id)
    db.add(new_saved)
    await db.commit()
    await db.refresh(new_saved)
    return new_saved

@router.delete("/posts/{post_id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(SavedPost).where(SavedPost.post_id == post_id, SavedPost.user_id == current_user.id)
    saved = (await db.execute(stmt)).scalar_one_or_none()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved post not found")
        
    await db.delete(saved)
    await db.commit()

@router.get("/posts/saved", response_model=List[SavedPostResponse])
async def get_saved_posts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(SavedPost).where(SavedPost.user_id == current_user.id)
    result = await db.execute(stmt)
    saved_posts = result.scalars().all()
    return saved_posts

# -- COMMENTS (CRUD) --

@router.get("/posts/{post_id}/comments", response_model=List[PostCommentResponse])
async def get_post_comments(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(PostComment)
        .where(PostComment.post_id == post_id)
        .order_by(PostComment.created_at.asc())
    )
    result = await db.execute(stmt)
    comments = result.scalars().all()
    
    for comment in comments:
        user_stmt = select(User).where(User.id == comment.user_id)
        u_res = await db.execute(user_stmt)
        comment.user = u_res.scalar_one_or_none()
        
    return comments

@router.post("/posts/{post_id}/comments", response_model=PostCommentResponse)
async def create_post_comment(
    post_id: str,
    comment_in: PostCommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(SocialPost).where(SocialPost.id == post_id)
    post_res = await db.execute(stmt)
    post = post_res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post bulunamadı")
        
    new_comment = PostComment(
        user_id=current_user.id,
        post_id=post_id,
        content=comment_in.content.strip()
    )
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    
    new_comment.user = current_user
    return new_comment

@router.delete("/posts/comments/{comment_id}")
async def delete_post_comment(
    comment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(PostComment).where(PostComment.id == comment_id)
    result = await db.execute(stmt)
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
        
    post_stmt = select(SocialPost).where(SocialPost.id == comment.post_id)
    p_res = await db.execute(post_stmt)
    post = p_res.scalar_one_or_none()
    
    is_author = comment.user_id == current_user.id
    is_post_owner = post and post.user_id == current_user.id
    is_admin = current_user.role == UserRole.ADMIN
    
    if not (is_author or is_post_owner or is_admin):
        raise HTTPException(status_code=403, detail="Bu yorumu silme yetkiniz yok")
        
    await db.delete(comment)
    await db.commit()
    return {"message": "Yorum başarıyla silindi"}

