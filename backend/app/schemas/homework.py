from datetime import datetime
from pydantic import BaseModel, Field


class HomeworkBase(BaseModel):
    title: str = Field(..., max_length=255, description="Ödev Başlığı")
    description: str = Field(..., description="Ödev Açıklaması")
    due_date: datetime = Field(..., description="Teslim Tarihi")
    lesson_id: str | None = Field(None, description="İlgili Ders ID")


class HomeworkCreate(HomeworkBase):
    course_id: str = Field(..., description="Kurs ID")


class HomeworkUpdate(BaseModel):
    title: str | None = Field(None, max_length=255)
    description: str | None = None
    due_date: datetime | None = None
    file_path: str | None = None


class HomeworkResponse(HomeworkBase):
    id: str
    teacher_id: str
    course_id: str
    file_path: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HomeworkSubmissionBase(BaseModel):
    submission_text: str | None = Field(None, description="Ödev Yanıt Metni")
    file_path: str | None = Field(None, description="Yüklenen Dosya Yolu")


class HomeworkSubmissionCreate(HomeworkSubmissionBase):
    homework_id: str = Field(..., description="Ödev ID")


class HomeworkSubmissionGrade(BaseModel):
    grade: int = Field(..., ge=0, le=100, description="Puan (0-100)")
    feedback: str | None = Field(None, description="Eğitmen Geribildirimi")


class HomeworkSubmissionResponse(HomeworkSubmissionBase):
    id: str
    homework_id: str
    student_id: str
    grade: int | None = None
    feedback: str | None = None
    submitted_at: datetime
    graded_at: datetime | None = None

    class Config:
        from_attributes = True
