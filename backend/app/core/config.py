import logging
import secrets

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "BiHocam API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/bihocam"

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3454", 
        "http://localhost:3000", 
        "https://bihocam.vercel.app"
    ]

    # Redis (for future use)
    REDIS_URL: str = "redis://localhost:6379/0"

    # SMTP / Email (NOTIF-V2 – geçici env tabanlı config)
    # NOT: KANBAN'da uzun vadede SiteSettings tablosundan okunması planlanıyor.
    # Şimdilik env üzerinden yönetip, EmailService'i daha sonra SiteSettings ile
    # entegre edilebilir olacak şekilde tasarlıyoruz.
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False
    SMTP_DEFAULT_FROM: str = "no-reply@bihocam.local"

    # Platform settings
    PLATFORM_COMMISSION_RATE: float = 0.35  # %35 komisyon

    # Media storage (local for now, will migrate to S3/Google Cloud later)
    STORAGE_BACKEND: str = "local"  # "local", "s3", "gcs"
    MEDIA_ROOT: str = "media"
    VIDEOS_DIR: str = "videos"
    THUMBNAILS_DIR: str = "thumbnails"
    AVATARS_DIR: str = "avatars"
    DOCUMENTS_DIR: str = "documents"  # PDF/DOCX/PPTX dosyaları
    LIVE_RECORDINGS_DIR: str = "live_recordings"  # Canlı ders kayıtları
    MAX_VIDEO_SIZE_MB: int = 500  # 500MB max video size
    MAX_AVATAR_SIZE_MB: int = 5  # 5MB max avatar size
    MAX_DOCUMENT_SIZE_MB: int = 50  # 50MB max doküman boyutu
    
    # Allowed file extensions
    ALLOWED_DOCUMENT_EXTENSIONS: list[str] = [".pdf", ".doc", ".docx", ".ppt", ".pptx"]
    ALLOWED_VIDEO_EXTENSIONS: list[str] = [".mp4", ".webm", ".ogg", ".mov", ".avi"]
    ALLOWED_ALL_CONTENT_EXTENSIONS: list[str] = [
        ".mp4", ".webm", ".ogg", ".mov", ".avi",
        ".pdf", ".doc", ".docx", ".ppt", ".pptx"
    ]

    # S3 Settings (ileride kullanılacak)
    S3_BUCKET_NAME: str = ""
    S3_REGION: str = "eu-central-1"
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_ENDPOINT_URL: str | None = None  # MinIO gibi S3-compatible servisler için

    # GCS Settings (ileride kullanılacak)
    GCS_BUCKET_NAME: str = ""
    GCS_PROJECT_ID: str = ""
    GCS_CREDENTIALS_PATH: str = ""

    # Frontend URL (for password reset links, etc.)
    FRONTEND_URL: str = "http://localhost:3454"
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24

    # Email worker settings
    EMAIL_QUEUE_KEY: str = "queue:email"
    EMAIL_RETRY_MAX_ATTEMPTS: int = 3
    EMAIL_RATE_LIMIT_PER_MINUTE: int = 60

    # Storage Quota Settings (EP10-BE-14)
    DEFAULT_STORAGE_QUOTA_MB: int = 1024  # 1GB default quota
    MAX_STORAGE_QUOTA_MB: int = 10240  # 10GB max quota
    QUOTA_RESET_PERIOD_DAYS: int = 30  # Aylık reset

    # PayTR Ödeme Entegrasyonu
    PAYTR_MERCHANT_ID: str = ""
    PAYTR_MERCHANT_KEY: str = ""
    PAYTR_MERCHANT_SALT: str = ""
    PAYTR_TEST_MODE: int = 1  # 1=test, 0=canlı
    PAYTR_DEBUG: int = 1  # 1=hata detayı döner
    PAYTR_MAX_INSTALLMENT: int = 12  # Maksimum taksit sayısı
    PAYTR_NO_INSTALLMENT: int = 0  # 1=taksit kapalı
    PAYTR_TIMEOUT_LIMIT: int = 30  # dakika
    PAYTR_CURRENCY: str = "TL"

    # DB Connection Pool
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 40
    DB_POOL_RECYCLE: int = 3600
    DB_POOL_PRE_PING: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


_INSECURE_SECRET_KEYS = {
    "dev-secret-key-change-in-production",
    "secret",
    "changeme",
    "",
}

settings = Settings()

# Startup güvenlik kontrolü
_logger = logging.getLogger(__name__)

if not settings.DEBUG:
    if settings.SECRET_KEY in _INSECURE_SECRET_KEYS or len(settings.SECRET_KEY) < 32:
        raise RuntimeError(
            "GÜVENLIK HATASI: Production modunda (DEBUG=false) güçlü bir SECRET_KEY gereklidir. "
            ".env dosyanıza en az 32 karakterlik bir SECRET_KEY ekleyin. "
            f"Örnek: SECRET_KEY={secrets.token_urlsafe(48)}"
        )
    if "postgres:postgres@localhost" in settings.DATABASE_URL:
        _logger.warning(
            "UYARI: DATABASE_URL varsayılan localhost credentials kullanıyor. "
            "Production için güvenli bir DATABASE_URL ayarlayın."
        )
else:
    if settings.SECRET_KEY in _INSECURE_SECRET_KEYS:
        _logger.warning(
            "UYARI: Varsayılan SECRET_KEY kullanılıyor. "
            "Bu sadece geliştirme ortamı için uygundur. "
            "Production'da DEBUG=false ve güçlü bir SECRET_KEY ayarlayın."
        )
