from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from app.models.popcast import PopcastStatus

class PopcastTeacherInfo(BaseModel):
    id: str
    full_name: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class PopcastBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration: float = 0.0

class PopcastCreate(PopcastBase):
    audio_url: str
    cover_image_url: Optional[str] = None

class PopcastUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    audio_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    duration: Optional[float] = None
    status: Optional[PopcastStatus] = None

class PopcastReview(BaseModel):
    status: PopcastStatus
    admin_note: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_review_status(cls, v: PopcastStatus) -> PopcastStatus:
        if v not in [PopcastStatus.APPROVED, PopcastStatus.REJECTED]:
            raise ValueError("Inceleme durumu sadece APPROVED veya REJECTED olabilir")
        return v

class PopcastResponse(PopcastBase):
    id: str
    audio_url: str
    cover_image_url: Optional[str] = None
    status: PopcastStatus
    admin_note: Optional[str] = None
    teacher_id: str
    created_at: datetime
    updated_at: datetime
    teacher: Optional[PopcastTeacherInfo] = None
    is_favorited: bool = False

    @field_validator("audio_url", "cover_image_url")
    @classmethod
    def format_media_urls(cls, v: Optional[str]) -> Optional[str]:
        if v:
            if v.startswith("http://") or v.startswith("https://") or v.startswith("/api/v1/media"):
                return v
            # Local path format matching Storage Service (e.g. popcasts/audio/...)
            # Resolve to absolute backend URLs for streaming/viewing
            filename = v.split("/")[-1]
            if "audio" in v:
                return f"http://127.0.0.1:8000/api/v1/media/popcasts/audio/{filename}"
            else:
                return f"http://127.0.0.1:8000/api/v1/media/popcasts/covers/{filename}"
        return v

    class Config:
        from_attributes = True
