from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class TeacherLibraryItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    item_type: str  # "file", "video", "youtube"
    file_path: Optional[str] = None
    youtube_url: Optional[str] = None

class TeacherLibraryItemCreate(TeacherLibraryItemBase):
    pass

class TeacherLibraryItemResponse(TeacherLibraryItemBase):
    id: str
    teacher_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
