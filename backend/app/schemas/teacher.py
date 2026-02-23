from pydantic import BaseModel

from app.schemas.course import CourseResponse, TeacherInfo


class TeacherListItem(BaseModel):
    id: str
    full_name: str
    email: str
    courses_count: int = 0
    avatar_url: str | None = None


class TeacherProfileResponse(BaseModel):
    teacher: TeacherInfo
    courses: list[CourseResponse]
