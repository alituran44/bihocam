from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any, Union


class CurriculumSectionSchema(BaseModel):
    title: str
    # Eski format (frontend uyumu)
    lessonCount: Optional[int] = None
    duration: Optional[str] = None
    items: List[Union[str, Dict[str, Any]]] = []
    # Yeni MEB format
    lessons: List[str] = []
    hours: Optional[int] = None



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
    
    # Yeni premium alanlar
    subtitle: Optional[str] = None
    short_description: Optional[str] = None
    curriculum_intro: Optional[str] = None
    kontenjan: int = 20
    start_date: Optional[str] = None
    
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
    
    # Yeni premium alanlar
    subtitle: Optional[str] = None
    short_description: Optional[str] = None
    curriculum_intro: Optional[str] = None
    kontenjan: Optional[int] = None
    start_date: Optional[str] = None
    
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
