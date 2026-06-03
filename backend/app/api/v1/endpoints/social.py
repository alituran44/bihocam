from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api import deps
from app.models.user import User, UserRole
from app.models.social import SocialPost, PostLike, SavedPost, UserFollow, MediaType
from app.schemas.social import (
    SocialPostCreate,
    SocialPostResponse,
    FollowResponse,
    LikeResponse,
    SavedPostResponse,
)

router = APIRouter()

# -- FOLLOW & UNFOLLOW --

@router.post("/follow/{user_id}", response_model=FollowResponse)
async def follow_user(
    user_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
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
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
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
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
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
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    stmt = select(UserFollow).where(UserFollow.follower_id == current_user.id)
    result = await db.execute(stmt)
    following = result.scalars().all()
    return following

# -- POSTS (CRUD) --

@router.post("/posts", response_model=SocialPostResponse)
async def create_post(
    post_in: SocialPostCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    # Only Admin and Teachers can create posts in the current design
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Not enough permissions to post")
        
    new_post = SocialPost(
        user_id=current_user.id,
        content=post_in.content,
        media_url=post_in.media_url,
        media_type=post_in.media_type
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    
    # Needs to return user relation, count, etc for response_model
    # For a newly created post:
    setattr(new_post, 'likes_count', 0)
    setattr(new_post, 'saves_count', 0)
    setattr(new_post, 'is_liked_by_me', False)
    setattr(new_post, 'is_saved_by_me', False)
    
    return new_post

@router.get("/posts/reels", response_model=List[SocialPostResponse])
async def get_reels_feed(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 10
):
    # Fetch posts with media_type=VIDEO
    stmt = select(SocialPost).where(SocialPost.media_type == MediaType.VIDEO).order_by(SocialPost.created_at.desc()).offset(skip).limit(limit)
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
        
        l_cnt = await db.execute(likes_stmt)
        s_cnt = await db.execute(saves_stmt)
        m_like = await db.execute(my_like_stmt)
        m_save = await db.execute(my_save_stmt)
        
        setattr(post, 'likes_count', l_cnt.scalar() or 0)
        setattr(post, 'saves_count', s_cnt.scalar() or 0)
        setattr(post, 'is_liked_by_me', m_like.scalar_one_or_none() is not None)
        setattr(post, 'is_saved_by_me', m_save.scalar_one_or_none() is not None)
        
        response_list.append(post)
        
    return response_list

# -- LIKES & SAVES --

@router.post("/posts/{post_id}/like", response_model=LikeResponse)
async def like_post(
    post_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
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
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
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
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
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
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    stmt = select(SavedPost).where(SavedPost.post_id == post_id, SavedPost.user_id == current_user.id)
    saved = (await db.execute(stmt)).scalar_one_or_none()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved post not found")
        
    await db.delete(saved)
    await db.commit()

@router.get("/posts/saved", response_model=List[SavedPostResponse])
async def get_saved_posts(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    stmt = select(SavedPost).where(SavedPost.user_id == current_user.id)
    result = await db.execute(stmt)
    saved_posts = result.scalars().all()
    # Eager loading or populating would be needed for the actual post contents
    # A real implementation requires `joinedload` on post and user.
    return saved_posts
