"""
Storage Abstraction Layer

Bu modül, dosya yükleme/indirme/silme işlemleri için soyutlama katmanı sağlar.
Şu an local storage kullanılıyor, ancak tek bir config değişikliğiyle
AWS S3 veya Google Cloud Storage'a geçilebilir.

Güvenlik Özellikleri:
- Path traversal koruması (canonical path kontrolü)
- Stream ve chunk desteği (büyük dosyalar için memory exhaustion önleme)
- Checksum doğrulama (veri bütünlüğü)
- Standardize edilmiş hata tipleri
"""

import hashlib
import os
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Optional

import aiofiles
from app.core.config import settings


# ============================================================================
# Exception Hierarchy
# ============================================================================

class StorageError(Exception):
    """Base exception for all storage-related errors"""
    pass


class StorageNotFoundError(StorageError):
    """Raised when a file is not found"""
    pass


class StoragePermissionDeniedError(StorageError):
    """Raised when access to a file is denied"""
    pass


class StorageTransientError(StorageError):
    """Raised when a transient error occurs (network, timeout, etc.)"""
    pass


# ============================================================================
# Upload Response Model
# ============================================================================

class UploadResult:
    """Upload işleminin sonucu"""
    def __init__(
        self,
        storage_key: str,
        access_url: str,
        checksum: Optional[str] = None,
        file_size: Optional[int] = None,
    ):
        self.storage_key = storage_key  # Unique identifier (path veya key)
        self.access_url = access_url  # Erişim URL'i
        self.checksum = checksum  # MD5 veya SHA256 hash
        self.file_size = file_size  # Dosya boyutu (bytes)

    def to_dict(self) -> dict:
        return {
            "storage_key": self.storage_key,
            "access_url": self.access_url,
            "checksum": self.checksum,
            "file_size": self.file_size,
        }


# ============================================================================
# Abstract Base Class
# ============================================================================

class StorageBackend(ABC):
    """Storage backend abstract base class"""

    @abstractmethod
    async def upload(
        self,
        file_content: bytes,
        destination_path: str,
        content_type: str,
    ) -> UploadResult:
        """
        Dosyayı yükle
        
        Args:
            file_content: Dosya içeriği (bytes)
            destination_path: Hedef path (örn: "videos/lesson_123.mp4")
            content_type: MIME type (örn: "video/mp4")
        
        Returns:
            UploadResult: storage_key, access_url, checksum, file_size
        
        Raises:
            StoragePermissionDeniedError: Erişim reddedildi
            StorageTransientError: Geçici hata (network, timeout)
        """
        pass

    @abstractmethod
    async def upload_stream(
        self,
        stream: AsyncIterator[bytes],
        destination_path: str,
        content_type: str,
        chunk_size: int = 8192,
    ) -> UploadResult:
        """
        Dosyayı stream olarak yükle (büyük dosyalar için)
        
        Args:
            stream: AsyncIterator[bytes] - Dosya içeriği stream'i
            destination_path: Hedef path
            content_type: MIME type
            chunk_size: Chunk boyutu (bytes)
        
        Returns:
            UploadResult: storage_key, access_url, checksum, file_size
        
        Raises:
            StoragePermissionDeniedError: Erişim reddedildi
            StorageTransientError: Geçici hata
        """
        pass

    @abstractmethod
    async def download(self, file_path: str) -> bytes:
        """
        Dosyayı indir
        
        Args:
            file_path: Dosya path'i (storage_key)
        
        Returns:
            bytes: Dosya içeriği
        
        Raises:
            StorageNotFoundError: Dosya bulunamadı
            StoragePermissionDeniedError: Erişim reddedildi
        """
        pass

    @abstractmethod
    async def delete(self, file_path: str) -> bool:
        """
        Dosyayı sil
        
        Args:
            file_path: Dosya path'i (storage_key)
        
        Returns:
            bool: Silme başarılı mı
        
        Raises:
            StorageNotFoundError: Dosya bulunamadı
            StoragePermissionDeniedError: Erişim reddedildi
        """
        pass

    @abstractmethod
    async def exists(self, file_path: str) -> bool:
        """
        Dosya var mı kontrol et
        
        Args:
            file_path: Dosya path'i (storage_key)
        
        Returns:
            bool: Dosya var mı
        """
        pass

    @abstractmethod
    async def get_url(self, file_path: str) -> str:
        """
        Dosyanın erişim URL'ini döndür
        
        Args:
            file_path: Dosya path'i (storage_key)
        
        Returns:
            str: Erişim URL'i
        """
        pass

    @abstractmethod
    async def get_signed_url(
        self,
        file_path: str,
        expires_in: int = 3600,
    ) -> str:
        """
        Geçici erişim URL'i (signed URL)
        
        Args:
            file_path: Dosya path'i (storage_key)
            expires_in: Geçerlilik süresi (saniye)
        
        Returns:
            str: Signed URL (local'de normal URL döner)
        """
        pass

    @abstractmethod
    async def get_file_size(self, file_path: str) -> int:
        """
        Dosya boyutunu döndür (bytes)
        
        Args:
            file_path: Dosya path'i (storage_key)
        
        Returns:
            int: Dosya boyutu (bytes)
        
        Raises:
            StorageNotFoundError: Dosya bulunamadı
        """
        pass


# ============================================================================
# Local Storage Backend Implementation
# ============================================================================

class LocalStorageBackend(StorageBackend):
    """Local filesystem storage backend"""

    def __init__(self):
        self.media_root = Path(settings.MEDIA_ROOT)
        self.media_root.mkdir(parents=True, exist_ok=True)
        self.api_v1_str = settings.API_V1_STR

    def _validate_path(self, file_path: str) -> Path:
        """
        Path traversal koruması - canonical path kontrolü
        
        Args:
            file_path: Dosya path'i
        
        Returns:
            Path: Validated canonical path
        
        Raises:
            StoragePermissionDeniedError: Path traversal tespit edildi
        """
        # Path'i normalize et ve canonical path'e çevir
        normalized = os.path.normpath(file_path)
        
        # MEDIA_ROOT'un mutlak path'ini al
        media_root_abs = os.path.abspath(self.media_root)
        
        # Dosyanın mutlak path'ini oluştur
        file_abs = os.path.abspath(self.media_root / normalized)
        
        # MEDIA_ROOT dışına çıkış kontrolü
        # os.path.commonpath kullanarak MEDIA_ROOT'un dosya path'inin parent'ı olduğunu kontrol et
        try:
            common_path = os.path.commonpath([media_root_abs, file_abs])
            if common_path != media_root_abs:
                raise StoragePermissionDeniedError(
                    f"Path traversal detected: {file_path}"
                )
        except ValueError:
            # Windows'ta farklı drive'lar varsa ValueError oluşur
            raise StoragePermissionDeniedError(
                f"Invalid path: {file_path}"
            )
        
        # Basit karakter kontrolü (ekstra güvenlik)
        if ".." in file_path or file_path.startswith("/") or "\\" in file_path:
            # Normalize edilmiş path'te hala ".." varsa veya absolute path ise
            if ".." in normalized or os.path.isabs(normalized):
                raise StoragePermissionDeniedError(
                    f"Path traversal detected: {file_path}"
                )
        
        return self.media_root / normalized

    def _calculate_checksum(self, content: bytes) -> str:
        """MD5 checksum hesapla"""
        return hashlib.md5(content).hexdigest()

    async def upload(
        self,
        file_content: bytes,
        destination_path: str,
        content_type: str,
    ) -> UploadResult:
        """Dosyayı yükle"""
        validated_path = self._validate_path(destination_path)
        
        # Dizin oluştur (mkdir -p mantığı)
        validated_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Checksum hesapla
        checksum = self._calculate_checksum(file_content)
        
        # Dosyayı async olarak yaz
        async with aiofiles.open(validated_path, "wb") as f:
            await f.write(file_content)
        
        # Storage key (relative path)
        storage_key = str(validated_path.relative_to(self.media_root))
        
        # Access URL oluştur
        # Format: /api/v1/media/{subdir}/{filename}
        subdir = validated_path.parent.name
        filename = validated_path.name
        access_url = f"{self.api_v1_str}/media/{subdir}/{filename}"
        
        return UploadResult(
            storage_key=storage_key,
            access_url=access_url,
            checksum=checksum,
            file_size=len(file_content),
        )

    async def upload_stream(
        self,
        stream: AsyncIterator[bytes],
        destination_path: str,
        content_type: str,
        chunk_size: int = 8192,
    ) -> UploadResult:
        """Dosyayı stream olarak yükle"""
        validated_path = self._validate_path(destination_path)
        
        # Dizin oluştur
        validated_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Stream'i oku ve yaz (chunk chunk)
        total_size = 0
        hasher = hashlib.md5()
        
        async with aiofiles.open(validated_path, "wb") as f:
            async for chunk in stream:
                await f.write(chunk)
                hasher.update(chunk)
                total_size += len(chunk)
        
        checksum = hasher.hexdigest()
        
        # Storage key
        storage_key = str(validated_path.relative_to(self.media_root))
        
        # Access URL
        subdir = validated_path.parent.name
        filename = validated_path.name
        access_url = f"{self.api_v1_str}/media/{subdir}/{filename}"
        
        return UploadResult(
            storage_key=storage_key,
            access_url=access_url,
            checksum=checksum,
            file_size=total_size,
        )

    async def download(self, file_path: str) -> bytes:
        """Dosyayı indir"""
        validated_path = self._validate_path(file_path)
        
        if not validated_path.exists():
            raise StorageNotFoundError(f"File not found: {file_path}")
        
        async with aiofiles.open(validated_path, "rb") as f:
            return await f.read()

    async def delete(self, file_path: str) -> bool:
        """Dosyayı sil"""
        validated_path = self._validate_path(file_path)
        
        if not validated_path.exists():
            raise StorageNotFoundError(f"File not found: {file_path}")
        
        try:
            validated_path.unlink()
            return True
        except Exception as e:
            raise StorageTransientError(f"Failed to delete file: {e}")

    async def exists(self, file_path: str) -> bool:
        """Dosya var mı kontrol et"""
        validated_path = self._validate_path(file_path)
        return validated_path.exists()

    async def get_url(self, file_path: str) -> str:
        """Dosyanın erişim URL'ini döndür"""
        validated_path = self._validate_path(file_path)
        
        if not validated_path.exists():
            raise StorageNotFoundError(f"File not found: {file_path}")
        
        subdir = validated_path.parent.name
        filename = validated_path.name
        return f"{self.api_v1_str}/media/{subdir}/{filename}"

    async def get_signed_url(
        self,
        file_path: str,
        expires_in: int = 3600,
    ) -> str:
        """
        Geçici erişim URL'i (local'de signed URL yok, normal URL döner)
        """
        # Local storage'da signed URL gerekmez, normal URL döner
        return await self.get_url(file_path)

    async def get_file_size(self, file_path: str) -> int:
        """Dosya boyutunu döndür (bytes)"""
        validated_path = self._validate_path(file_path)
        
        if not validated_path.exists():
            raise StorageNotFoundError(f"File not found: {file_path}")
        
        return validated_path.stat().st_size


# ============================================================================
# S3 Storage Backend (Stub)
# ============================================================================

class S3StorageBackend(StorageBackend):
    """
    AWS S3 storage backend (stub implementation)
    
    İleride implement edilecek:
    - boto3 veya aioboto3 kullanımı
    - Presigned URL oluşturma
    - Multipart upload (büyük dosyalar için)
    - Bucket policy ve CORS ayarları
    """

    def __init__(self):
        self.bucket_name = settings.S3_BUCKET_NAME
        self.region = settings.S3_REGION
        self.access_key = settings.S3_ACCESS_KEY
        self.secret_key = settings.S3_SECRET_KEY
        self.endpoint_url = settings.S3_ENDPOINT_URL

    async def upload(
        self,
        file_content: bytes,
        destination_path: str,
        content_type: str,
    ) -> UploadResult:
        raise NotImplementedError(
            "S3StorageBackend.upload() - Use aioboto3 to implement S3 upload"
        )

    async def upload_stream(
        self,
        stream: AsyncIterator[bytes],
        destination_path: str,
        content_type: str,
        chunk_size: int = 8192,
    ) -> UploadResult:
        raise NotImplementedError(
            "S3StorageBackend.upload_stream() - Use aioboto3 multipart upload"
        )

    async def download(self, file_path: str) -> bytes:
        raise NotImplementedError(
            "S3StorageBackend.download() - Use aioboto3 to implement S3 download"
        )

    async def delete(self, file_path: str) -> bool:
        raise NotImplementedError(
            "S3StorageBackend.delete() - Use aioboto3 to implement S3 delete"
        )

    async def exists(self, file_path: str) -> bool:
        raise NotImplementedError(
            "S3StorageBackend.exists() - Use aioboto3 to check S3 object existence"
        )

    async def get_url(self, file_path: str) -> str:
        raise NotImplementedError(
            "S3StorageBackend.get_url() - Return S3 public URL or CloudFront URL"
        )

    async def get_signed_url(
        self,
        file_path: str,
        expires_in: int = 3600,
    ) -> str:
        raise NotImplementedError(
            "S3StorageBackend.get_signed_url() - Use boto3 generate_presigned_url()"
        )

    async def get_file_size(self, file_path: str) -> int:
        raise NotImplementedError(
            "S3StorageBackend.get_file_size() - Use boto3 S3.head_object() to get file size"
        )


# ============================================================================
# GCS Storage Backend (Stub)
# ============================================================================

class GCSStorageBackend(StorageBackend):
    """
    Google Cloud Storage backend (stub implementation)
    
    İleride implement edilecek:
    - google-cloud-storage veya gcloud-aio-storage kullanımı
    - Signed URL oluşturma
    - Resumable upload (büyük dosyalar için)
    - Bucket IAM ve CORS ayarları
    """

    def __init__(self):
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.project_id = settings.GCS_PROJECT_ID
        self.credentials_path = settings.GCS_CREDENTIALS_PATH

    async def upload(
        self,
        file_content: bytes,
        destination_path: str,
        content_type: str,
    ) -> UploadResult:
        raise NotImplementedError(
            "GCSStorageBackend.upload() - Use gcloud-aio-storage to implement GCS upload"
        )

    async def upload_stream(
        self,
        stream: AsyncIterator[bytes],
        destination_path: str,
        content_type: str,
        chunk_size: int = 8192,
    ) -> UploadResult:
        raise NotImplementedError(
            "GCSStorageBackend.upload_stream() - Use gcloud-aio-storage resumable upload"
        )

    async def download(self, file_path: str) -> bytes:
        raise NotImplementedError(
            "GCSStorageBackend.download() - Use gcloud-aio-storage to implement GCS download"
        )

    async def delete(self, file_path: str) -> bool:
        raise NotImplementedError(
            "GCSStorageBackend.delete() - Use gcloud-aio-storage to implement GCS delete"
        )

    async def exists(self, file_path: str) -> bool:
        raise NotImplementedError(
            "GCSStorageBackend.exists() - Use gcloud-aio-storage to check GCS object existence"
        )

    async def get_url(self, file_path: str) -> str:
        raise NotImplementedError(
            "GCSStorageBackend.get_url() - Return GCS public URL or CDN URL"
        )

    async def get_signed_url(
        self,
        file_path: str,
        expires_in: int = 3600,
    ) -> str:
        raise NotImplementedError(
            "GCSStorageBackend.get_signed_url() - Use gcloud-aio-storage generate_signed_url()"
        )

    async def get_file_size(self, file_path: str) -> int:
        raise NotImplementedError(
            "GCSStorageBackend.get_file_size() - Use gcloud-aio-storage Blob.size to get file size"
        )


# ============================================================================
# Factory Function
# ============================================================================

def get_storage_backend() -> StorageBackend:
    """
    Config'e göre doğru storage backend'ini döndür
    
    Returns:
        StorageBackend: LocalStorageBackend, S3StorageBackend veya GCSStorageBackend
    
    Raises:
        ValueError: Geçersiz STORAGE_BACKEND değeri
    """
    backend_type = settings.STORAGE_BACKEND.lower()
    
    if backend_type == "local":
        return LocalStorageBackend()
    elif backend_type == "s3":
        return S3StorageBackend()
    elif backend_type == "gcs":
        return GCSStorageBackend()
    else:
        raise ValueError(
            f"Invalid STORAGE_BACKEND: {backend_type}. "
            f"Supported values: 'local', 's3', 'gcs'"
        )


# ============================================================================
# Dependency Injection Helper
# ============================================================================

async def get_storage() -> StorageBackend:
    """
    FastAPI dependency için storage backend döndürür
    
    Usage:
        @router.post("/upload")
        async def upload_file(
            storage: StorageBackend = Depends(get_storage),
        ):
            result = await storage.upload(...)
    """
    return get_storage_backend()
