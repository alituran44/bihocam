from datetime import datetime
from pydantic import BaseModel

from app.models.quiz import QuizQuestionType, QuizAttemptStatus


class QuizBase(BaseModel):
    title: str
    description: str | None = None
    pdf_path: str | None = None
    passing_score: int = 70
    time_limit_minutes: int | None = None
    max_attempts: int | None = None
    shuffle_questions: bool = False
    show_correct_answers: bool = True


class QuizCreate(QuizBase):
    lesson_id: str


class QuizUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    pdf_path: str | None = None
    passing_score: int | None = None
    time_limit_minutes: int | None = None
    max_attempts: int | None = None
    shuffle_questions: bool | None = None
    show_correct_answers: bool | None = None


class QuizResponse(QuizBase):
    id: str
    lesson_id: str
    questions: list["QuizQuestionResponse"] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QuizListItem(BaseModel):
    id: str
    title: str
    lesson_id: str
    pdf_path: str | None = None
    question_count: int
    attempt_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class QuizQuestionBase(BaseModel):
    question_type: QuizQuestionType
    question_text: str
    options: dict | None = None  # JSON format for multiple choice
    correct_answer: str
    points: int = 1
    explanation: str | None = None


class QuizQuestionCreate(QuizQuestionBase):
    pass


class QuizQuestionUpdate(BaseModel):
    question_type: QuizQuestionType | None = None
    question_text: str | None = None
    options: dict | None = None
    correct_answer: str | None = None
    points: int | None = None
    explanation: str | None = None


class QuizQuestionResponse(QuizQuestionBase):
    id: str
    quiz_id: str
    order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QuizQuestionReorderRequest(BaseModel):
    question_ids: list[str]


class QuizQuestionBulkCreateRequest(BaseModel):
    questions: list[QuizQuestionCreate]


class QuizAttemptBase(BaseModel):
    pass


class QuizAttemptCreate(QuizAttemptBase):
    pass


class QuizAttemptAnswerBase(BaseModel):
    question_id: str
    answer_text: str


class QuizAttemptAnswerCreate(QuizAttemptAnswerBase):
    pass


class QuizAttemptProgressUpdate(BaseModel):
    answers: list[QuizAttemptAnswerCreate]


class QuizAttemptAnswerResponse(QuizAttemptAnswerBase):
    id: str
    attempt_id: str
    is_correct: bool
    points_earned: int
    answered_at: datetime

    class Config:
        from_attributes = True


class QuizAttemptResponse(QuizAttemptBase):
    id: str
    quiz_id: str
    user_id: str
    status: QuizAttemptStatus
    total_questions: int
    correct_answers: int
    score_percentage: int
    points_earned: int
    total_points: int
    started_at: datetime
    completed_at: datetime | None = None
    time_taken_seconds: int | None = None
    answers: list[QuizAttemptAnswerResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
