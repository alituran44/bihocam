from datetime import datetime
from pydantic import BaseModel, Field


class ExamQuestionBase(BaseModel):
    question_type: str = Field("multiple_choice", description="Soru Tipi: multiple_choice, true_false, text")
    question_text: str = Field(..., description="Soru Metni")
    options: list[str] | None = Field(None, description="Çoktan Seçmeli Seçenekler")
    correct_answer: str = Field(..., description="Doğru Cevap")
    points: int = Field(10, ge=1, description="Soru Puanı")
    order: int = Field(0, description="Sıralama")
    explanation: str | None = Field(None, description="Açıklama")


class ExamQuestionCreate(ExamQuestionBase):
    exam_id: str = Field(..., description="Sınav ID")


class ExamQuestionResponse(ExamQuestionBase):
    id: str

    class Config:
        from_attributes = True


class ExamBase(BaseModel):
    title: str = Field(..., max_length=255, description="Sınav Başlığı")
    description: str | None = Field(None, description="Açıklama")
    section_id: str | None = Field(None, description="Bölüm Adı")
    icon: str | None = Field("graduation-cap", description="İkon")
    duration_minutes: int = Field(60, ge=1, description="Süre (Dakika)")
    max_attempts: int = Field(3, ge=1, description="Maksimum Deneme Sayısı")
    passing_grade: int = Field(70, ge=0, le=100, description="Geçme Notu")
    validity_days: int = Field(365, ge=1, description="Geçerlilik Süresi (Gün)")
    randomize_questions: bool = Field(True, description="Soruları Rastgele Göster")
    include_certificate: bool = Field(False, description="Sertifika Dahil")
    is_active: bool = Field(True, description="Aktif mi?")


class ExamCreate(ExamBase):
    course_id: str = Field(..., description="Kurs ID")


class ExamResponse(ExamBase):
    id: str
    course_id: str
    created_at: datetime
    updated_at: datetime
    questions: list[ExamQuestionResponse] = []

    class Config:
        from_attributes = True


class ExamAttemptAnswerBase(BaseModel):
    question_id: str = Field(..., description="Soru ID")
    answer_text: str = Field(..., description="Öğrencinin Cevap Metni")


class ExamAttemptSubmit(BaseModel):
    answers: list[ExamAttemptAnswerBase] = Field(..., description="Cevap Listesi")


class ExamAttemptAnswerResponse(BaseModel):
    id: str
    question_id: str
    answer_text: str
    is_correct: bool
    points_earned: int

    class Config:
        from_attributes = True


class ExamAttemptResponse(BaseModel):
    id: str
    exam_id: str
    user_id: str
    status: str
    score: int | None = None
    is_passed: bool | None = None
    started_at: datetime
    completed_at: datetime | None = None
    time_taken_seconds: int | None = None
    answers: list[ExamAttemptAnswerResponse] = []

    class Config:
        from_attributes = True
