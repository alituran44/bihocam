from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security import create_access_token, create_refresh_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserResponse
from app.services.user_service import authenticate_user, create_user, get_user_by_email, get_user_by_id

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

# P1-02: Cookie ayarları
_COOKIE_HTTPONLY = True
_COOKIE_SAMESITE = "lax"
_COOKIE_PATH = "/"


def _cookie_secure() -> bool:
    """Production'da Secure flag aktif."""
    return not settings.DEBUG


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """P1-02: JWT token'ları HttpOnly cookie olarak set eder."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=_COOKIE_HTTPONLY,
        secure=_cookie_secure(),
        samesite=_COOKIE_SAMESITE,
        path=_COOKIE_PATH,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=_COOKIE_HTTPONLY,
        secure=_cookie_secure(),
        samesite=_COOKIE_SAMESITE,
        path=_COOKIE_PATH,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )


def _clear_auth_cookies(response: Response) -> None:
    """Auth cookie'lerini temizler."""
    response.delete_cookie(key="access_token", path=_COOKIE_PATH)
    response.delete_cookie(key="refresh_token", path=_COOKIE_PATH)


def _extract_token(request: Request, bearer_token: str | None) -> str | None:
    """P1-02: Önce cookie'den, sonra Authorization header'dan token çıkarır."""
    # 1. HttpOnly cookie (öncelikli — daha güvenli)
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        return cookie_token
    # 2. Bearer header (backward compatible — mevcut API client'lar için)
    if bearer_token:
        return bearer_token
    return None


async def get_current_user(
    request: Request,
    bearer_token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = _extract_token(request, bearer_token)
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Kullanıcı aktif değil")
    return user


async def get_current_user_optional(
    request: Request,
    bearer_token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Optional current user - returns None if not authenticated"""
    token = _extract_token(request, bearer_token)
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            return None
    except JWTError:
        return None

    user = await get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        return None
    return user


@router.post("/register", response_model=UserResponse)
@limiter.limit("3/hour")
async def register(request: Request, user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    user = await create_user(db, user_in)
    return user


@router.post("/login")
@limiter.limit("10/minute")
async def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    # P1-02: HttpOnly cookie'lere yaz
    _set_auth_cookies(response, access_token, refresh_token)

    # Backward compatible: Token'ları body'de de döndür (mevcut frontend geçiş süreci için)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/logout")
async def logout(response: Response):
    """P1-02: Cookie'leri temizleyerek çıkış yapar."""
    _clear_auth_cookies(response)
    return {"message": "Başarıyla çıkış yapıldı"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
