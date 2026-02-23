from datetime import datetime

from pydantic import BaseModel

from app.schemas.course import CourseResponse


class EnrollmentResponse(BaseModel):
  id: str
  user_id: str
  course_id: str
  progress_percentage: int
  last_accessed_at: datetime | None = None
  completed_at: datetime | None = None
  enrolled_at: datetime
  course: CourseResponse

  class Config:
    from_attributes = True

