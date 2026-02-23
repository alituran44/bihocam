from datetime import datetime
from pydantic import BaseModel, Field


class CourseReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating between 1 and 5")
    title: str | None = None
    comment: str | None = None


class CourseReviewCreate(CourseReviewBase):
    enrollment_id: str | None = None


class CourseReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5)
    title: str | None = None
    comment: str | None = None


class CourseReviewResponse(CourseReviewBase):
    id: str
    user_id: str
    course_id: str
    enrollment_id: str | None = None
    is_approved: bool
    is_helpful_count: int
    approved_at: datetime | None = None
    approved_by_admin_id: str | None = None
    moderation_note: str | None = None
    teacher_reply: str | None = None
    teacher_reply_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    user: dict | None = None  # Will include user info

    class Config:
        from_attributes = True


class ReviewApproveRequest(BaseModel):
    """Yorum onay isteği"""
    moderation_note: str | None = None


class ReviewRejectRequest(BaseModel):
    """Yorum red isteği"""
    moderation_note: str | None = None  # Red sebebi
