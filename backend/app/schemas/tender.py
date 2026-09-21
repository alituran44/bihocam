from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class TenderCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, description="Özel Ders Talebi Başlığı")
    subject: str = Field(..., min_length=2, max_length=150, description="Ders / Konu (Örn: LGS Matematik)")
    category_name: Optional[str] = Field(None, max_length=100, description="Kategori")
    description: str = Field(..., min_length=10, description="Detaylı talep ve öğrenci hedefi")
    mode: Optional[str] = Field("ONLINE", description="ONLINE, FACE_TO_FACE, HYBRID")
    city: Optional[str] = Field(None, max_length=100, description="Şehir (Yüz yüze için)")
    district: Optional[str] = Field(None, max_length=100, description="İlçe")
    target_date_info: Optional[str] = Field(None, max_length=150, description="Zamanlama tercihi (Örn: Hafta Sonu)")
    min_budget: Optional[float] = Field(None, ge=0, description="Minimum saatlik veya toplam bütçe")
    max_budget: Optional[float] = Field(None, ge=0, description="Maksimum bütçe")
    currency: Optional[str] = Field("TRY", max_length=10)


class TenderUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    category_name: Optional[str] = None
    description: Optional[str] = None
    mode: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    target_date_info: Optional[str] = None
    min_budget: Optional[float] = Field(None, ge=0, description="Minimum bütçe")
    max_budget: Optional[float] = Field(None, ge=0, description="Maksimum bütçe")
    status: Optional[str] = None


class TenderBidCreate(BaseModel):
    offered_price: float = Field(..., gt=0, description="Teklif edilen saatlik/toplam ders ücreti")
    currency: Optional[str] = Field("TRY", max_length=10)
    proposal_letter: str = Field(..., min_length=10, description="Eğitmen tanıtım ve ders planı notu")


class TenderBidOut(BaseModel):
    id: str
    tender_id: str
    teacher_id: str
    teacher_name: Optional[str] = None
    teacher_avatar: Optional[str] = None
    teacher_title: Optional[str] = None
    teacher_rating: Optional[float] = 5.0
    teacher_reviews_count: Optional[int] = 0
    offered_price: float
    currency: str = "TRY"
    proposal_letter: str
    status: str
    client_ip: Optional[str] = None
    client_port: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TenderOut(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    student_avatar: Optional[str] = None
    title: str
    subject: str
    category_name: Optional[str] = None
    description: str
    mode: str
    city: Optional[str] = None
    district: Optional[str] = None
    target_date_info: Optional[str] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    currency: str = "TRY"
    status: str
    accepted_bid_id: Optional[str] = None
    bids_count: int = 0
    version: int = 1
    client_ip: Optional[str] = None
    client_port: Optional[int] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    bids: Optional[List[TenderBidOut]] = []
    accepted_bid: Optional[TenderBidOut] = None

    class Config:
        from_attributes = True


class TenderAcceptOut(BaseModel):
    success: bool
    message: str
    tender_id: str
    accepted_bid_id: str
    teacher_id: Optional[str] = None
    teacher_name: str
    teacher_phone: Optional[str] = None
    teacher_whatsapp_link: Optional[str] = None


class TenderStats(BaseModel):
    total_tenders: int
    open_tenders: int
    bidding_tenders: int
    accepted_tenders: int
    paid_tenders: int
    total_bids: int
