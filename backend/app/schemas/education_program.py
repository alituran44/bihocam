from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any


class CurriculumSectionSchema(BaseModel):
    title: str
    lessonCount: int
    duration: str
    items: List[str] = []


class FAQSchema(BaseModel):
    q: str
    a: str


class ReviewSchema(BaseModel):
    name: str
    score: int
    role: str
    text: str
    date: str


class EducationProgramBase(BaseModel):
    slug: str
    title: str
    category: str
    gradient: str = "from-gray-900 to-gray-700"
    price: int
    original_price: Optional[int] = None
    rating: float = 4.9
    review_count: int = 0
    students: int = 0
    hours: int = 0
    lessons: int = 0
    badge: Optional[str] = None
    description: str
    what_you_learn: List[str] = []
    curriculum: List[CurriculumSectionSchema] = []
    faqs: List[FAQSchema] = []
    reviews: List[ReviewSchema] = []
    active: bool = True


class EducationProgramCreate(EducationProgramBase):
    pass


class EducationProgramUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    gradient: Optional[str] = None
    price: Optional[int] = None
    original_price: Optional[int] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    students: Optional[int] = None
    hours: Optional[int] = None
    lessons: Optional[int] = None
    badge: Optional[str] = None
    description: Optional[str] = None
    what_you_learn: Optional[List[str]] = None
    curriculum: Optional[List[CurriculumSectionSchema]] = None
    faqs: Optional[List[FAQSchema]] = None
    reviews: Optional[List[ReviewSchema]] = None
    active: Optional[bool] = None


class EducationProgramResponse(EducationProgramBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
