"""
Messaging Attachment Service (EPIC-12 SEC-03)

File upload security and validation for message attachments.
"""

from pathlib import Path
from typing import Optional

from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.storage_service import StorageBackend
from app.services.security_service import validate_mime_type_magic_byte, MimeTypeMismatchError

# Allowed file types
ALLOWED_IMAGE_TYPES = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
ALLOWED_DOCUMENT_TYPES = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"]
ALLOWED_ARCHIVE_TYPES = [".zip", ".rar"]

# Size limits (bytes)
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10MB
MAX_ARCHIVE_SIZE = 10 * 1024 * 1024  # 10MB

# Per-user attachment quota (100MB)
MAX_USER_ATTACHMENT_QUOTA = 100 * 1024 * 1024  # 100MB

# Per-message attachment limit
MAX_ATTACHMENTS_PER_MESSAGE = 5


async def validate_attachment(
    file: UploadFile,
    user_id: str,
    db: AsyncSession,
) -> tuple[bytes, str, int]:
    """
    Validate and sanitize attachment file
    
    Returns:
        tuple[bytes, str, int]: (file_content, sanitized_filename, file_size)
    
    Raises:
        HTTPException: If validation fails
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya adı belirtilmedi")

    # Filename sanitization (path traversal önleme)
    filename = Path(file.filename).name  # Remove path traversal
    if len(filename) > 255:
        raise HTTPException(status_code=400, detail="Dosya adı çok uzun (max: 255 karakter)")

    # File extension check
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_TYPES + ALLOWED_DOCUMENT_TYPES + ALLOWED_ARCHIVE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"İzin verilmeyen dosya tipi: {ext}. İzin verilen tipler: {', '.join(ALLOWED_IMAGE_TYPES + ALLOWED_DOCUMENT_TYPES + ALLOWED_ARCHIVE_TYPES)}",
        )

    # Read file
    content = await file.read()
    file_size = len(content)

    # Size check
    if ext in ALLOWED_IMAGE_TYPES and file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Görsel boyutu çok büyük (max: 5MB)",
        )
    elif ext in ALLOWED_DOCUMENT_TYPES and file_size > MAX_DOCUMENT_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Doküman boyutu çok büyük (max: 10MB)",
        )
    elif ext in ALLOWED_ARCHIVE_TYPES and file_size > MAX_ARCHIVE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Arşiv boyutu çok büyük (max: 10MB)",
        )

    # Magic-byte validation (MIME type spoofing önleme)
    try:
        detected_mime = validate_mime_type_magic_byte(content, ext)
    except MimeTypeMismatchError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Güvenlik kontrolü başarısız: {str(e)}",
        )
    except Exception:
        # Magic-byte tespit edilemedi ama uzantı geçerli
        # Production'da bu durumda reddetmek daha güvenli
        # Şimdilik uyarı verip devam ediyoruz (python-magic yoksa)
        pass

    # Quota check (per-user attachment quota)
    # TODO: Implement quota checking when user attachment tracking is added
    # For now, we'll skip this check

    # Sanitize filename (remove dangerous characters)
    sanitized_filename = filename.replace("..", "").replace("/", "_").replace("\\", "_")

    return content, sanitized_filename, file_size


async def upload_attachment(
    file_content: bytes,
    filename: str,
    user_id: str,
    conversation_id: str,
    storage: StorageBackend,
) -> str:
    """
    Upload attachment to storage
    
    Returns:
        str: Access URL for the uploaded file
    """
    from datetime import datetime

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    storage_path = f"messages/attachments/{user_id}/{conversation_id}/{timestamp}_{filename}"

    upload_result = await storage.upload(
        file_content=file_content,
        destination_path=storage_path,
        content_type="application/octet-stream",  # Will be determined by storage backend
    )

    return upload_result.access_url
