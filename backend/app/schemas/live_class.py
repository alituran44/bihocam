from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TeacherAvailabilitySlot(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Tarih: YYYY-MM-DD")
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="Başlangıç: HH:MM")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="Bitiş: HH:MM")

class TeacherAvailabilityBatchCreate(BaseModel):
    slots: List[TeacherAvailabilitySlot]

class TeacherAvailabilityResponse(BaseModel):
    id: str
    teacher_id: str
    date: str
    start_time: str
    end_time: str
    is_booked: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserMinimalInfo(BaseModel):
    id: str
    full_name: str
    email: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class LiveClassReservationCreate(BaseModel):
    availability_id: str
    lesson_type: Optional[str] = "online"  # "online" or "face_to_face"
    student_notes: Optional[str] = None

class LiveClassReservationResponse(BaseModel):
    id: str
    teacher_id: str
    student_id: str
    availability_id: Optional[str] = None
    date: str
    start_time: str
    end_time: str
    price: float
    discount_price: Optional[float] = None
    lesson_type: Optional[str] = "online"
    status: str
    meeting_link: Optional[str] = None
    student_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Nested detail info (optional in some views, but highly useful)
    teacher: Optional[UserMinimalInfo] = None
    student: Optional[UserMinimalInfo] = None

    class Config:
        from_attributes = True
