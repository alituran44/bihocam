from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    role: UserRole | None = None
    is_active: bool | None = None
    is_verified: bool | None = None
    phone: str | None = None


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    organization_id: str | None = None
    created_at: datetime
    updated_at: datetime
    phone: str | None = None
    last_login_at: datetime | None = None
    live_class_price: float | None = None
    live_class_discount_price: float | None = None
    face_to_face_price: float | None = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    type: str
    exp: int


class UserListItem(BaseModel):
    """Kullanıcı listesi için özet bilgiler"""
    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    # last_login_at ve phone şimdilik None, ileride model'e eklendiğinde güncellenir
    last_login_at: datetime | None = None
    phone: str | None = None

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """Pagination ile kullanıcı listesi response"""
    total: int
    items: list[UserListItem]
    skip: int
    limit: int


class PasswordResetRequest(BaseModel):
    """Admin şifre reset isteği"""
    mode: str = "magic_link"  # "magic_link" veya "temporary_password"
    temporary_password: str | None = None  # mode="temporary_password" ise gerekli


class PasswordResetResponse(BaseModel):
    """Şifre reset response"""
    message: str
    magic_link: str | None = None  # mode="magic_link" ise
    temporary_password: str | None = None  # mode="temporary_password" ise (sadece bir kez gösterilir)
