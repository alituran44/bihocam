from datetime import datetime
from pydantic import BaseModel, Field
from app.models.teacher_application import TeacherApplicationStatus


class TeacherApplicationBase(BaseModel):
    full_name: str = Field(..., max_length=255, description="Adı Soyadı")
    phone: str = Field(..., max_length=20, description="Cep Tel")
    address: str = Field(..., description="Adresi")
    birth_date: str = Field(..., max_length=20, description="Doğum Tarihi")
    gender: str = Field(..., max_length=20, description="Cinsiyet")
    
    # Harmanlanmış çoklu seçimler
    branches: list[str] = Field(..., description="Seçilen Branşlar")
    levels: list[str] = Field(..., description="Seçilen Kademeler")
    
    experience_years: int = Field(..., ge=0, description="Deneyim Yılı")
    bio: str = Field(..., description="Kendinizi Tanıtınız (Biyografi)")
    heard_from: str = Field(..., max_length=100, description="Bizi Nereden Duydunuz")
    
    cv_path: str | None = Field(None, description="Özgeçmiş (CV) Dosya Yolu")
    graduation_cert_path: str | None = Field(None, description="Mezuniyet Belgesi Dosya Yolu")
    criminal_record_path: str | None = Field(None, description="Adli Sicil Belgesi Dosya Yolu")


class TeacherApplicationCreate(TeacherApplicationBase):
    pass


class TeacherApplicationResponse(TeacherApplicationBase):
    id: str
    user_id: str
    status: TeacherApplicationStatus
    admin_note: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TeacherApplicationReview(BaseModel):
    status: TeacherApplicationStatus
    admin_note: str | None = None


class TeacherApplicationUpdateDocuments(BaseModel):
    cv_path: str | None = None
    graduation_cert_path: str | None = None
    criminal_record_path: str | None = None

