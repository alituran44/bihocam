from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, UUID4, AnyHttpUrl

from app.models.social import MediaType
from app.schemas.user import UserResponse

class SocialPostBase(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: MediaType = MediaType.TEXT
    target_level: Optional[str] = "all"

class SocialPostCreate(SocialPostBase):
    pass

class SocialPostUpdate(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[MediaType] = None
    target_level: Optional[str] = None

class SocialPostResponse(SocialPostBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None
    likes_count: int = 0
    saves_count: int = 0
    comments_count: int = 0
    target_level: Optional[str] = "all"
    is_liked_by_me: bool = False
    is_saved_by_me: bool = False

    class Config:
        from_attributes = True

class PostCommentBase(BaseModel):
    content: str

class PostCommentCreate(PostCommentBase):
    pass

class PostCommentResponse(PostCommentBase):
    id: str
    user_id: str
    post_id: str
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class FollowBase(BaseModel):
    follower_id: str
    following_id: str

class FollowResponse(FollowBase):
    id: str
    created_at: datetime
    follower: Optional[UserResponse] = None
    following: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class LikeResponse(BaseModel):
    id: str
    user_id: str
    post_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class SavedPostResponse(BaseModel):
    id: str
    user_id: str
    post_id: str
    post: Optional[SocialPostResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True
