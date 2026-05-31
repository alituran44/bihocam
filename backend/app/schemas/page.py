from datetime import datetime
from pydantic import BaseModel, Field


class PageBase(BaseModel):
    slug: str = Field(..., max_length=100, description="Sayfa slug adresi (URL)")
    title: str = Field(..., max_length=255, description="Sayfa Başlığı")
    content: str = Field(..., description="Sayfa İçeriği (HTML/Markdown)")
    is_active: bool = Field(True, description="Sayfa aktif mi?")


class PageCreate(PageBase):
    pass


class PageUpdate(BaseModel):
    title: str | None = Field(None, max_length=255, description="Sayfa Başlığı")
    content: str | None = Field(None, description="Sayfa İçeriği")
    is_active: bool | None = Field(None, description="Sayfa aktif mi?")


class PageResponse(PageBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
