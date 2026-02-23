from datetime import datetime
from pydantic import BaseModel


class LessonProgressBase(BaseModel):
    watched_seconds: int = 0
    is_completed: bool = False


class LessonProgressCreate(LessonProgressBase):
    lesson_id: str
    enrollment_id: str


class LessonProgressUpdate(BaseModel):
    watched_seconds: int | None = None
    is_completed: bool | None = None


class LessonProgressResponse(LessonProgressBase):
    id: str
    user_id: str
    lesson_id: str
    enrollment_id: str
    completed_at: datetime | None = None
    first_accessed_at: datetime
    last_accessed_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
