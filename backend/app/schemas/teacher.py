from pydantic import BaseModel

from app.schemas.course import CourseResponse, TeacherInfo
from app.schemas.course_review import CourseReviewResponse


from datetime import datetime

class TeacherListItem(BaseModel):
    id: str
    full_name: str
    email: str
    courses_count: int = 0
    avatar_url: str | None = None
    bio: str | None = None
    expertise_tags: list[str] = []
    live_class_price: float | None = None
    live_class_discount_price: float | None = None
    created_at: datetime


class TeacherProfileResponse(BaseModel):
    teacher: TeacherInfo
    courses: list[CourseResponse]
    reviews: list[CourseReviewResponse] = []
