from datetime import datetime
from pydantic import BaseModel, Field


class MockExamQuestionBase(BaseModel):
    question_number: int = Field(..., description="Soru Numarası")
    subject_name: str = Field(..., description="Ders Adı (örn: Matematik, Türkçe)")
    correct_answer: str | None = Field(None, description="Doğru Cevap Şıkkı (A, B, C, D, E)")
    points: float = Field(1.0, description="Soru Puanı")


class MockExamQuestionCreate(MockExamQuestionBase):
    pass


class MockExamQuestionResponse(MockExamQuestionBase):
    id: str
    mock_exam_id: str

    class Config:
        from_attributes = True


class MockExamBase(BaseModel):
    title: str = Field(..., max_length=255, description="Deneme Sınavı Başlığı")
    description: str | None = Field(None, description="Açıklama")
    exam_type: str = Field(..., description="Sınav Türü: LGS, YKS")
    pdf_path: str = Field(..., description="Sınav PDF Dosya Yolu")
    duration_minutes: int = Field(120, description="Süre (Dakika)")
    number_of_options: int = Field(4, description="Şık Sayısı (LGS için 4, YKS için 5)")
    is_active: bool = Field(True, description="Aktif mi?")
    
    # New scheduling & assignment fields
    start_date: datetime | None = Field(None, description="Sınav Başlangıç Tarihi")
    end_date: datetime | None = Field(None, description="Sınav Bitiş Tarihi")
    course_id: str | None = Field(None, description="Atanan Kurs ID")
    student_id: str | None = Field(None, description="Atanan Öğrenci ID")


class MockExamCreate(MockExamBase):
    questions: list[MockExamQuestionCreate] = Field(..., description="Cevap Anahtarı Soru Dağılımı")


class MockExamResponse(MockExamBase):
    id: str
    created_by_id: str
    created_at: datetime
    updated_at: datetime
    questions: list[MockExamQuestionResponse] = []

    class Config:
        from_attributes = True


class MockExamStudentAnswerBase(BaseModel):
    question_number: int = Field(..., description="Soru Numarası")
    selected_answer: str | None = Field(None, description="İşaretlenen Şık (A, B, C, D, E ya da Boş)")


class MockExamAttemptSubmit(BaseModel):
    answers: list[MockExamStudentAnswerBase] = Field(..., description="İşaretlenen Cevaplar Listesi")


class MockExamStudentAnswerResponse(MockExamStudentAnswerBase):
    id: str
    is_correct: bool | None = None

    class Config:
        from_attributes = True


class MockExamAttemptResponse(BaseModel):
    id: str
    mock_exam_id: str
    student_id: str
    status: str
    total_correct: int
    total_wrong: int
    total_empty: int
    total_net: float
    score: float
    started_at: datetime
    completed_at: datetime | None = None
    answers: list[MockExamStudentAnswerResponse] = []

    class Config:
        from_attributes = True


class MockExamSubjectAnalysis(BaseModel):
    subject_name: str = Field(..., description="Ders Adı")
    total_questions: int = Field(..., description="Toplam Soru")
    correct: int = Field(..., description="Doğru Sayısı")
    wrong: int = Field(..., description="Yanlış Sayısı")
    empty: int = Field(..., description="Boş Sayısı")
    net: float = Field(..., description="Net Sayısı")
    accuracy_percentage: float = Field(..., description="Başarı Yüzdesi")


class MockExamAnswerComparison(BaseModel):
    question_number: int
    subject_name: str
    selected_answer: str | None
    correct_answer: str | None = None
    is_correct: bool | None = None


class MockExamAttemptAnalysis(BaseModel):
    attempt: MockExamAttemptResponse
    mock_exam_title: str
    mock_exam_type: str
    subjects_analysis: list[MockExamSubjectAnalysis]
    comparisons: list[MockExamAnswerComparison]


class MockExamAttemptListResponse(BaseModel):
    id: str
    mock_exam_id: str
    mock_exam_title: str
    mock_exam_type: str
    status: str
    total_correct: int
    total_wrong: int
    total_empty: int
    total_net: float
    score: float
    started_at: datetime
    completed_at: datetime | None = None

    class Config:
        from_attributes = True

