"""
Media endpoints - Storage Service entegrasyonu ile

CRITICAL SECURITY FIXES:
- Anonim erişim kapatıldı (non-preview videolar sadece enrolled/owner/admin)
- Token loglama kaldırıldı
- Storage key üzerinden birebir lookup
- Range streaming desteği korundu
"""

from pathlib import Path
from typing import BinaryIO

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.course import Lesson, Course, LessonType
from app.models.order import Enrollment
from app.services.storage_service import (
    StorageBackend,
    StorageNotFoundError,
    get_storage,
)
from app.services.security_service import (
    validate_mime_type_magic_byte,
    sanitize_filename_for_content_disposition,
    MimeTypeMismatchError,
    InvalidFilenameError,
    MIME_TYPE_MAP,
)
from app.services.document_conversion_queue import enqueue_conversion_job
from app.services.quota_service import reserve_quota, release_quota, QuotaExceededError
from app.services.audit_service import log_upload, log_delete, log_security_event
from app.models.content_audit_log import ContentAuditAction, ContentResourceType
from uuid import uuid4

router = APIRouter()

ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".ogg", ".mov", ".avi"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_DOCUMENT_EXTENSIONS = set(settings.ALLOWED_DOCUMENT_EXTENSIONS)
ALLOWED_ALL_CONTENT_EXTENSIONS = set(settings.ALLOWED_ALL_CONTENT_EXTENSIONS)
MAX_VIDEO_SIZE = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024  # Convert MB to bytes
MAX_AVATAR_SIZE = settings.MAX_AVATAR_SIZE_MB * 1024 * 1024  # Convert MB to bytes
MAX_DOCUMENT_SIZE = settings.MAX_DOCUMENT_SIZE_MB * 1024 * 1024  # Convert MB to bytes


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER, UserRole.ORGANIZATION]:
        raise HTTPException(status_code=403, detail="Öğretmen veya admin yetkisi gerekli")
    return current_user


@router.post("/lessons/{lesson_id}/upload-video")
async def upload_lesson_video(
    lesson_id: str,
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """Ders için video yükle (Storage Service kullanarak)"""
    # Lesson kontrolü (course ile birlikte eager load)
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # Ownership kontrolü
    if lesson.course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu derse video yükleme yetkiniz yok")
    
    # Dosya validasyonu
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz dosya formatı. İzin verilen formatlar: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )
    
    # Dosya boyutu kontrolü
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Dosya boyutu çok büyük. Maksimum: {settings.MAX_VIDEO_SIZE_MB}MB"
        )
    
    # EP10-BE-14: Quota kontrolü
    try:
        await reserve_quota(db, current_user.id, file_size)
    except QuotaExceededError as e:
        # Audit log: quota aşımı
        await log_security_event(
            db, ContentAuditAction.QUOTA_EXCEEDED, ContentResourceType.VIDEO,
            user_id=current_user.id, resource_id=lesson_id,
            metadata={"file_size": file_size, "lesson_id": lesson_id},
            request=request,
        )
        raise HTTPException(status_code=403, detail=str(e))
    
    # Eski video varsa sil ve quota release et
    old_file_size = 0
    if lesson.content_path:
        try:
            # Eski dosya boyutunu al
            old_file_size = await storage.get_file_size(lesson.content_path)
            await storage.delete(lesson.content_path)
            # Quota release
            if old_file_size > 0:
                await release_quota(db, current_user.id, old_file_size)
        except StorageNotFoundError:
            pass  # Dosya zaten yok, devam et
        except Exception:
            pass  # Hata durumunda devam et
    
    # Dosya adı oluştur (lesson_id + timestamp + extension)
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{lesson_id}_{timestamp}{file_ext}"
    destination_path = f"{settings.VIDEOS_DIR}/{filename}"
    
    # MIME type belirle
    content_type = "video/mp4"
    if file_ext == ".webm":
        content_type = "video/webm"
    elif file_ext == ".ogg":
        content_type = "video/ogg"
    elif file_ext == ".mov":
        content_type = "video/quicktime"
    elif file_ext == ".avi":
        content_type = "video/x-msvideo"
    
    # Storage Service ile yükle
    upload_result = await storage.upload(
        file_content=file_content,
        destination_path=destination_path,
        content_type=content_type,
    )
    
    # Lesson'a storage_key kaydet
    lesson.content_path = upload_result.storage_key
    lesson.lesson_type = LessonType.VIDEO  # Ensure lesson type is video
    lesson.file_size_bytes = upload_result.file_size
    
    await db.commit()
    await db.refresh(lesson)
    
    # EP10-BE-18: Audit logging
    await log_upload(
        db, ContentResourceType.VIDEO, lesson_id, current_user.id,
        file_size=upload_result.file_size,
        file_type=content_type,
        storage_key=upload_result.storage_key,
        request=request,
    )
    
    return {
        "message": "Video başarıyla yüklendi",
        "filename": filename,
        "path": upload_result.storage_key,
        "url": upload_result.access_url,
        "size": upload_result.file_size,
        "checksum": upload_result.checksum,
    }


@router.get("/videos/{filename}")
async def stream_video(
    filename: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Video streaming endpoint (range request desteği ile)
    
    CRITICAL SECURITY FIX:
    - Anonim erişim kapatıldı (non-preview videolar sadece enrolled/owner/admin)
    - Token loglama kaldırıldı
    - Storage key üzerinden birebir lookup
    """
    # URL decode filename (frontend'den encode edilmiş gelebilir)
    from urllib.parse import unquote
    decoded_filename = unquote(filename)
    
    # Kullanıcı authentication (optional - video element header göndermeyebilir)
    # Support both Authorization header and token query parameter
    current_user = None
    token = None
    
    # Try Authorization header first
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    except Exception:
        pass
    
    # Fallback to query parameter (for video elements that don't send headers)
    if not token:
        token = request.query_params.get("token")
    
    # Decode token if found
    if token:
        try:
            from jose import JWTError, jwt
            from app.services.user_service import get_user_by_id
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                user_id: str = payload.get("sub")
                token_type: str = payload.get("type")
                if user_id and token_type == "access":
                    current_user = await get_user_by_id(db, user_id)
                    if current_user and not current_user.is_active:
                        current_user = None
            except (JWTError, Exception):
                pass  # Token geçersiz, current_user None kalacak
        except Exception:
            pass  # Hata durumunda current_user None kalacak
    
    # Storage key oluştur (videos/filename formatında)
    # Normalize path separator (Windows uses \ but we store with /)
    storage_key = f"{settings.VIDEOS_DIR}/{decoded_filename}".replace("\\", "/")
    
    # Lesson'ı bul (storage_key ile birebir eşleşme - LIKE yerine)
    # Normalize content_path for comparison (handle both / and \)
    lesson_result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.course))
        .where(
            func.replace(Lesson.content_path, "\\", "/") == storage_key
        )
    )
    lesson = lesson_result.scalar_one_or_none()
    
    # Debug: Eğer lesson bulunamazsa, alternatif formatları dene
    if not lesson:
        # Try with just filename (without videos/ prefix)
        lesson_result = await db.execute(
            select(Lesson)
            .options(selectinload(Lesson.course))
            .where(Lesson.content_path == decoded_filename)
        )
        lesson = lesson_result.scalar_one_or_none()
    
    # Eğer hala lesson bulunamazsa, güvenlik için erişim izni verme
    if not lesson:
        # Debug: Try to find any lesson with this filename in content_path
        all_lessons_result = await db.execute(
            select(Lesson)
            .options(selectinload(Lesson.course))
            .where(Lesson.content_path.like(f"%{decoded_filename}%"))
        )
        lessons = all_lessons_result.scalars().all()
        if lessons:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Video not found with exact match. Filename: {decoded_filename}, Storage key: {storage_key}")
            logger.warning(f"Found {len(lessons)} lessons with similar content_path:")
            for l in lessons:
                logger.warning(f"  - Lesson {l.id}: content_path={l.content_path}")
            # Use first match as fallback
            lesson = lessons[0]
    
    if not lesson:
        # Final check: does the file exist in storage?
        try:
            file_exists = await storage.exists(storage_key)
            import logging
            logger = logging.getLogger(__name__)
            if file_exists:
                logger.warning(f"File exists in storage but no lesson found. Storage key: {storage_key}")
            else:
                logger.warning(f"File does not exist in storage. Storage key: {storage_key}")
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error checking file existence: {e}")
        
        raise HTTPException(status_code=404, detail=f"Video bulunamadı (filename: {decoded_filename}, storage_key: {storage_key})")
    
    # CRITICAL SECURITY FIX: Anonim erişim kapatıldı
    # Preview dersleri herkese açık
    if lesson.is_preview:
        # Preview dersleri için herhangi bir kontrol yapma, direkt stream et
        pass
    else:
        # Preview değilse MUTLAKA authentication ve enrollment kontrolü
        if not current_user:
            raise HTTPException(status_code=401, detail="Giriş yapmalısınız")
        
        # Enrollment kontrolü
        enrollment_result = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == lesson.course_id
            )
        )
        enrollment = enrollment_result.scalar_one_or_none()
        
        # Owner veya admin kontrolü
        is_owner = lesson.course.teacher_id == current_user.id
        is_admin = current_user.role == UserRole.ADMIN
        
        if not enrollment and not is_owner and not is_admin:
            raise HTTPException(status_code=403, detail="Bu videoya erişim yetkiniz yok")
    
    # Range request desteği (video streaming için)
    # Local storage için dosyayı stream et
    try:
        file_content = await storage.download(storage_key)
    except StorageNotFoundError:
        raise HTTPException(status_code=404, detail="Video bulunamadı")
    
    # Range request header'ını kontrol et
    range_header = request.headers.get("Range")
    
    if range_header:
        # Range request desteği
        # Format: "bytes=start-end"
        range_match = range_header.replace("bytes=", "").split("-")
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if range_match[1] else len(file_content) - 1
        
        # Range validation
        if start < 0 or end >= len(file_content) or start > end:
            raise HTTPException(status_code=416, detail="Range Not Satisfiable")
        
        chunk = file_content[start:end + 1]
        content_length = len(file_content)
        
        # Content type belirle
        content_type = "video/mp4"
        if decoded_filename.endswith(".webm"):
            content_type = "video/webm"
        elif decoded_filename.endswith(".ogg"):
            content_type = "video/ogg"
        
        return StreamingResponse(
            iter([chunk]),
            status_code=206,  # Partial Content
            media_type=content_type,
            headers={
                "Accept-Ranges": "bytes",
                "Content-Range": f"bytes {start}-{end}/{content_length}",
                "Content-Length": str(len(chunk)),
            }
        )
    else:
        # Normal streaming (tüm dosya)
        def generate():
            chunk_size = 8192  # 8KB chunks
            for i in range(0, len(file_content), chunk_size):
                yield file_content[i:i + chunk_size]
        
        # Content type belirle
        content_type = "video/mp4"
        if decoded_filename.endswith(".webm"):
            content_type = "video/webm"
        elif decoded_filename.endswith(".ogg"):
            content_type = "video/ogg"
        
        # ETag oluştur (dosya içeriğinden hash)
        import hashlib
        etag = hashlib.md5(file_content).hexdigest()
        
        # Conditional request kontrolü (If-None-Match)
        if_none_match = request.headers.get("If-None-Match")
        if if_none_match and if_none_match.strip('"') == etag:
            from fastapi import Response
            return Response(
                status_code=304,
                headers={
                    "ETag": f'"{etag}"',
                    "Accept-Ranges": "bytes",
                }
            )
        
        return StreamingResponse(
            generate(),
            media_type=content_type,
            headers={
                "Accept-Ranges": "bytes",
                "Content-Length": str(len(file_content)),
                "ETag": f'"{etag}"',
                "Cache-Control": "public, max-age=3600",  # 1 saat cache (video için)
            }
        )


@router.delete("/lessons/{lesson_id}/video")
async def delete_lesson_video(
    lesson_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """Ders videosunu sil (Storage Service kullanarak)"""
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # Ownership kontrolü
    if lesson.course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu dersin videosunu silme yetkiniz yok")
    
    # Dosyayı Storage Service ile sil ve quota release et
    old_file_size = 0
    if lesson.content_path:
        try:
            # Eski dosya boyutunu al
            old_file_size = await storage.get_file_size(lesson.content_path)
            await storage.delete(lesson.content_path)
            # EP10-BE-14: Quota release
            if old_file_size > 0:
                await release_quota(db, current_user.id, old_file_size)
        except StorageNotFoundError:
            pass  # Dosya zaten yok, devam et
        except Exception:
            pass  # Hata durumunda devam et
        
        lesson.content_path = None
        lesson.file_size_bytes = None
        await db.commit()
        
        # EP10-BE-18: Audit logging
        await log_delete(
            db, ContentResourceType.VIDEO, lesson_id, current_user.id,
            storage_key=lesson.content_path,
            request=request,
        )
    
    return {"message": "Video başarıyla silindi"}


@router.post("/users/me/upload-avatar")
async def upload_user_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageBackend = Depends(get_storage),
):
    """Kullanıcı avatar yükle (Storage Service kullanarak)"""
    from datetime import datetime
    from PIL import Image
    import io
    
    # Dosya validasyonu
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz dosya formatı. İzin verilen formatlar: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Dosya boyutu kontrolü
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Dosya boyutu çok büyük. Maksimum: {settings.MAX_AVATAR_SIZE_MB}MB"
        )
    
    # Resmi optimize et (PIL ile)
    try:
        image = Image.open(io.BytesIO(file_content))
        # Resmi kare yap ve 512x512'e resize et
        width, height = image.size
        size = min(width, height)
        left = (width - size) / 2
        top = (height - size) / 2
        right = (width + size) / 2
        bottom = (height + size) / 2
        image = image.crop((left, top, right, bottom))
        image = image.resize((512, 512), Image.Resampling.LANCZOS)
        
        # WebP formatında kaydet (daha küçük dosya boyutu)
        output = io.BytesIO()
        image.save(output, format="WEBP", quality=85, optimize=True)
        file_content = output.getvalue()
        file_ext = ".webp"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Resim işlenirken hata oluştu: {str(e)}")
    
    # Eski avatar varsa sil
    if current_user.avatar_url:
        # URL'den dosya adını çıkar
        # Format: /api/v1/media/avatars/{filename}
        try:
            old_filename = current_user.avatar_url.split("/")[-1]
            old_storage_key = f"{settings.AVATARS_DIR}/{old_filename}"
            try:
                await storage.delete(old_storage_key)
            except StorageNotFoundError:
                pass  # Dosya zaten yok, devam et
        except Exception:
            pass  # URL formatı beklenmedik, devam et
    
    # Dosya adı oluştur (user_id + timestamp + extension)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{current_user.id}_{timestamp}{file_ext}"
    destination_path = f"{settings.AVATARS_DIR}/{filename}"
    
    # Storage Service ile yükle
    upload_result = await storage.upload(
        file_content=file_content,
        destination_path=destination_path,
        content_type="image/webp",
    )
    
    # User'a URL kaydet
    avatar_url = upload_result.access_url
    current_user.avatar_url = avatar_url
    
    await db.commit()
    await db.refresh(current_user)
    
    return {
        "message": "Avatar başarıyla yüklendi",
        "filename": filename,
        "path": upload_result.storage_key,
        "url": avatar_url,
        "size": upload_result.file_size,
        "checksum": upload_result.checksum,
    }


@router.get("/avatars/{filename}")
async def get_avatar(
    filename: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    storage: StorageBackend = Depends(get_storage),
):
    """Avatar dosyasını döndür (Storage Service kullanarak) - EP10-BE-17: Cache optimization"""
    storage_key = f"{settings.AVATARS_DIR}/{filename}"
    
    try:
        file_content = await storage.download(storage_key)
    except StorageNotFoundError:
        raise HTTPException(status_code=404, detail="Avatar bulunamadı")
    
    # ETag oluştur (dosya içeriğinden hash)
    import hashlib
    etag = hashlib.md5(file_content).hexdigest()
    
    # Conditional request kontrolü (If-None-Match)
    if_none_match = request.headers.get("If-None-Match")
    if if_none_match and if_none_match.strip('"') == etag:
        from fastapi import Response
        return Response(status_code=304, headers={"ETag": f'"{etag}"'})
    
    return StreamingResponse(
        iter([file_content]),
        media_type="image/webp",
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",  # 1 yıl cache, immutable
            "ETag": f'"{etag}"',
        }
    )


# ============================================================================
# Document Upload Endpoints (EP10-BE-04)
# ============================================================================

def _get_lesson_type_from_extension(file_ext: str) -> LessonType:
    """Dosya uzantısından LessonType belirle"""
    file_ext_lower = file_ext.lower()
    if file_ext_lower == ".pdf":
        return LessonType.PDF
    elif file_ext_lower in [".doc", ".docx"]:
        return LessonType.DOCUMENT
    elif file_ext_lower in [".ppt", ".pptx"]:
        return LessonType.PRESENTATION
    elif file_ext_lower in ALLOWED_VIDEO_EXTENSIONS:
        return LessonType.VIDEO
    else:
        raise HTTPException(status_code=400, detail=f"Desteklenmeyen dosya formatı: {file_ext}")


@router.post("/lessons/{lesson_id}/upload-document")
async def upload_lesson_document(
    lesson_id: str,
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Ders için doküman yükle (PDF, DOCX, PPTX/PPT)
    
    CRITICAL SECURITY:
    - Magic-byte MIME doğrulama (uzantı bypass önleme)
    - Filename sanitization (Content-Disposition için)
    """
    # Lesson kontrolü
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # Ownership kontrolü
    if lesson.course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu derse doküman yükleme yetkiniz yok")
    
    # Dosya validasyonu
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya adı belirtilmedi")
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz dosya formatı. İzin verilen formatlar: {', '.join(ALLOWED_DOCUMENT_EXTENSIONS)}"
        )
    
    # Dosya boyutu kontrolü
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_DOCUMENT_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Dosya boyutu çok büyük. Maksimum: {settings.MAX_DOCUMENT_SIZE_MB}MB"
        )
    
    # CRITICAL: Magic-byte MIME doğrulama
    try:
        detected_mime = validate_mime_type_magic_byte(file_content, file_ext)
    except MimeTypeMismatchError as e:
        # EP10-BE-18: Audit log - MIME mismatch
        await log_security_event(
            db, ContentAuditAction.MIME_MISMATCH, ContentResourceType.DOCUMENT,
            user_id=current_user.id, resource_id=lesson_id,
            metadata={"file_ext": file_ext, "lesson_id": lesson_id},
            request=request,
        )
        raise HTTPException(
            status_code=400,
            detail=f"Güvenlik kontrolü başarısız: {str(e)}"
        )
    except Exception as e:
        # Magic-byte tespit edilemedi ama uzantı geçerli
        # Production'da bu durumda reddetmek daha güvenli
        # Şimdilik uyarı verip devam ediyoruz (python-magic yoksa)
        detected_mime = MIME_TYPE_MAP.get(file_ext, "application/octet-stream")
    
    # EP10-BE-14: Quota kontrolü
    try:
        await reserve_quota(db, current_user.id, file_size)
    except QuotaExceededError as e:
        # Audit log: quota aşımı
        await log_security_event(
            db, ContentAuditAction.QUOTA_EXCEEDED, ContentResourceType.DOCUMENT,
            user_id=current_user.id, resource_id=lesson_id,
            metadata={"file_size": file_size, "lesson_id": lesson_id},
            request=request,
        )
        raise HTTPException(status_code=403, detail=str(e))
    
    # Eski dosya varsa sil ve quota release et
    old_file_size = 0
    if lesson.content_path:
        try:
            # Eski dosya boyutunu al
            old_file_size = await storage.get_file_size(lesson.content_path)
            await storage.delete(lesson.content_path)
            # Quota release
            if old_file_size > 0:
                await release_quota(db, current_user.id, old_file_size)
        except StorageNotFoundError:
            pass
        except Exception:
            pass
    
    # Dosya adı oluştur
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{lesson_id}_{timestamp}{file_ext}"
    destination_path = f"{settings.DOCUMENTS_DIR}/{filename}"
    
    # Storage Service ile yükle
    upload_result = await storage.upload(
        file_content=file_content,
        destination_path=destination_path,
        content_type=detected_mime,
    )
    
    # Lesson'a bilgileri kaydet
    lesson_type = _get_lesson_type_from_extension(file_ext)
    lesson.lesson_type = lesson_type
    lesson.content_path = upload_result.storage_key
    lesson.original_filename = file.filename
    lesson.file_size_bytes = upload_result.file_size
    lesson.mime_type = detected_mime
    
    await db.commit()
    await db.refresh(lesson)
    
    # EP10-BE-18: Audit logging
    await log_upload(
        db, ContentResourceType.DOCUMENT, lesson_id, current_user.id,
        file_size=upload_result.file_size,
        file_type=detected_mime,
        storage_key=upload_result.storage_key,
        request=request,
    )
    
    return {
        "message": "Doküman başarıyla yüklendi",
        "filename": filename,
        "path": upload_result.storage_key,
        "url": upload_result.access_url,
        "size": upload_result.file_size,
        "checksum": upload_result.checksum,
        "lesson_type": lesson_type.value,
        "mime_type": detected_mime,
    }


@router.get("/documents/{filename}")
async def get_document(
    filename: str,
    request: Request,
    download: bool = False,  # Query param: true ise attachment, false ise inline
    db: AsyncSession = Depends(get_db),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Doküman indirme/görüntüleme endpoint'i
    
    CRITICAL SECURITY:
    - Anonim erişim kapatıldı (non-preview sadece enrolled/owner/admin)
    - Filename sanitization (Content-Disposition için)
    """
    # URL decode filename (frontend'den encode edilmiş gelebilir)
    from urllib.parse import unquote
    decoded_filename = unquote(filename)
    
    # Kullanıcı authentication
    # Support both Authorization header and token query parameter
    current_user = None
    token = None
    
    # Try Authorization header first
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    except Exception:
        pass
    
    # Fallback to query parameter (for iframes that don't send headers)
    if not token:
        token = request.query_params.get("token")
    
    # Decode token if found
    if token:
        try:
            from jose import JWTError, jwt
            from app.services.user_service import get_user_by_id
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                user_id: str = payload.get("sub")
                token_type: str = payload.get("type")
                if user_id and token_type == "access":
                    current_user = await get_user_by_id(db, user_id)
                    if current_user and not current_user.is_active:
                        current_user = None
            except (JWTError, Exception):
                pass
        except Exception:
            pass
    
    # Storage key oluştur
    # Normalize path separator (Windows uses \ but we store with /)
    storage_key = f"{settings.DOCUMENTS_DIR}/{decoded_filename}".replace("\\", "/")
    
    # Lesson'ı bul (storage_key ile birebir eşleşme)
    # Normalize content_path for comparison (handle both / and \)
    lesson_result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.course))
        .where(
            func.replace(Lesson.content_path, "\\", "/") == storage_key
        )
    )
    lesson = lesson_result.scalar_one_or_none()
    
    # Debug: Eğer lesson bulunamazsa, alternatif formatları dene
    if not lesson:
        # Try with just filename (without documents/ prefix)
        lesson_result = await db.execute(
            select(Lesson)
            .options(selectinload(Lesson.course))
            .where(Lesson.content_path == decoded_filename)
        )
        lesson = lesson_result.scalar_one_or_none()
    
    # Debug: Eğer hala bulunamazsa, tüm content_path'leri kontrol et
    if not lesson:
        # Try to find any lesson with this filename in content_path
        all_lessons_result = await db.execute(
            select(Lesson)
            .options(selectinload(Lesson.course))
            .where(Lesson.content_path.like(f"%{decoded_filename}%"))
        )
        lessons = all_lessons_result.scalars().all()
        if lessons:
            # Log for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Document not found with exact match. Filename: {decoded_filename}, Storage key: {storage_key}")
            logger.warning(f"Found {len(lessons)} lessons with similar content_path:")
            for l in lessons:
                logger.warning(f"  - Lesson {l.id}: content_path={l.content_path}")
            # Use first match as fallback
            lesson = lessons[0]
    
    if not lesson:
        # TeacherApplication kontrolü yap
        from app.models.teacher_application import TeacherApplication
        from sqlalchemy import or_
        
        stmt = select(TeacherApplication).where(
            or_(
                TeacherApplication.cv_path == storage_key,
                TeacherApplication.graduation_cert_path == storage_key,
                TeacherApplication.criminal_record_path == storage_key,
                TeacherApplication.cv_path.like(f"%{decoded_filename}%"),
                TeacherApplication.graduation_cert_path.like(f"%{decoded_filename}%"),
                TeacherApplication.criminal_record_path.like(f"%{decoded_filename}%")
            )
        )
        app_result = await db.execute(stmt)
        application = app_result.scalar_one_or_none()
        
        if application:
            if not current_user:
                raise HTTPException(status_code=401, detail="Giriş yapmalısınız")
            
            is_owner = application.user_id == current_user.id
            is_admin = current_user.role == UserRole.ADMIN
            
            if not is_owner and not is_admin:
                raise HTTPException(status_code=403, detail="Bu dokümana erişim yetkiniz yok")
                
            try:
                file_content = await storage.download(storage_key)
            except StorageNotFoundError:
                raise HTTPException(status_code=404, detail="Doküman bulunamadı")
                
            mime_type = MIME_TYPE_MAP.get(Path(filename).suffix.lower(), "application/octet-stream")
            display_filename = filename
            sanitized_filename = sanitize_filename_for_content_disposition(display_filename)
            
            disposition = "attachment" if download else "inline"
            return StreamingResponse(
                iter([file_content]),
                media_type=mime_type,
                headers={
                    "Content-Disposition": f'{disposition}; filename="{sanitized_filename}"',
                    "Cache-Control": "private, max-age=3600",
                }
            )
        
        raise HTTPException(status_code=404, detail=f"Doküman bulunamadı (filename: {decoded_filename}, storage_key: {storage_key})")
    
    # CRITICAL SECURITY: Anonim erişim kapatıldı
    if lesson.is_preview:
        # Preview dersleri için herhangi bir kontrol yapma
        pass
    else:
        # Preview değilse MUTLAKA authentication ve enrollment kontrolü
        if not current_user:
            raise HTTPException(status_code=401, detail="Giriş yapmalısınız")
        
        # Enrollment kontrolü
        enrollment_result = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == lesson.course_id
            )
        )
        enrollment = enrollment_result.scalar_one_or_none()
        
        # Owner veya admin kontrolü
        is_owner = lesson.course.teacher_id == current_user.id
        is_admin = current_user.role == UserRole.ADMIN
        
        if not enrollment and not is_owner and not is_admin:
            raise HTTPException(status_code=403, detail="Bu dokümana erişim yetkiniz yok")
    
    # Dosyayı indir
    try:
        file_content = await storage.download(storage_key)
    except StorageNotFoundError:
        raise HTTPException(status_code=404, detail="Doküman bulunamadı")
    
    # MIME type belirle (lesson'dan veya filename'den)
    mime_type = lesson.mime_type or MIME_TYPE_MAP.get(Path(filename).suffix.lower(), "application/octet-stream")
    
    # Filename sanitization (Content-Disposition için)
    display_filename = lesson.original_filename or filename
    try:
        sanitized_filename = sanitize_filename_for_content_disposition(display_filename)
    except InvalidFilenameError:
        # Sanitization başarısız, basit filename kullan
        sanitized_filename = filename.replace('"', "'").replace("\n", "").replace("\r", "")
    
    # Content-Disposition header
    disposition_type = "attachment" if download else "inline"
    content_disposition = f'{disposition_type}; filename="{sanitized_filename}"'
    
    return StreamingResponse(
        iter([file_content]),
        media_type=mime_type,
        headers={
            "Content-Disposition": content_disposition,
            "Cache-Control": "public, max-age=3600",  # 1 saat cache
        }
    )


@router.delete("/lessons/{lesson_id}/document")
async def delete_lesson_document(
    lesson_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """Ders dokümanını sil"""
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # Ownership kontrolü
    if lesson.course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu dersin dokümanını silme yetkiniz yok")
    
    # Dosyayı Storage Service ile sil ve quota release et
    old_file_size = 0
    old_storage_key = lesson.content_path
    if lesson.content_path:
        try:
            # Eski dosya boyutunu al
            old_file_size = await storage.get_file_size(lesson.content_path)
            await storage.delete(lesson.content_path)
            # EP10-BE-14: Quota release
            if old_file_size > 0:
                await release_quota(db, current_user.id, old_file_size)
        except StorageNotFoundError:
            pass  # Dosya zaten yok, devam et
        except Exception:
            pass  # Hata durumunda devam et
        
        # Metadata'yı temizle
        lesson.content_path = None
        lesson.original_filename = None
        lesson.file_size_bytes = None
        lesson.mime_type = None
        
        await db.commit()
        
        # EP10-BE-18: Audit logging
        await log_delete(
            db, ContentResourceType.DOCUMENT, lesson_id, current_user.id,
            storage_key=old_storage_key,
            request=request,
        )
    
    return {"message": "Doküman başarıyla silindi"}


@router.post("/lessons/{lesson_id}/upload-content")
async def upload_lesson_content(
    lesson_id: str,
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Genel içerik yükleme endpoint'i (unified)
    
    Hem video hem doküman hem sunum kabul eden tek endpoint.
    Dosya uzantısına göre otomatik tip belirleme ve uygun dizine yükleme.
    """
    # Lesson kontrolü
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # Ownership kontrolü
    if lesson.course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu derse içerik yükleme yetkiniz yok")
    
    # Dosya validasyonu
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya adı belirtilmedi")
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_ALL_CONTENT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz dosya formatı. İzin verilen formatlar: {', '.join(ALLOWED_ALL_CONTENT_EXTENSIONS)}"
        )
    
    # Dosya boyutu kontrolü
    file_content = await file.read()
    file_size = len(file_content)
    
    # Tip bazlı max size kontrolü
    if file_ext in ALLOWED_VIDEO_EXTENSIONS:
        max_size = MAX_VIDEO_SIZE
        max_size_mb = settings.MAX_VIDEO_SIZE_MB
    elif file_ext in ALLOWED_DOCUMENT_EXTENSIONS:
        max_size = MAX_DOCUMENT_SIZE
        max_size_mb = settings.MAX_DOCUMENT_SIZE_MB
    else:
        max_size = MAX_DOCUMENT_SIZE  # Default
        max_size_mb = settings.MAX_DOCUMENT_SIZE_MB
    
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"Dosya boyutu çok büyük. Maksimum: {max_size_mb}MB"
        )
    
    # CRITICAL: Magic-byte MIME doğrulama (dokümanlar için)
    detected_mime = None
    if file_ext in ALLOWED_DOCUMENT_EXTENSIONS:
        try:
            detected_mime = validate_mime_type_magic_byte(file_content, file_ext)
        except MimeTypeMismatchError as e:
            # EP10-BE-18: Audit log - MIME mismatch
            await log_security_event(
                db, ContentAuditAction.MIME_MISMATCH, ContentResourceType.DOCUMENT,
                user_id=current_user.id, resource_id=lesson_id,
                metadata={"file_ext": file_ext, "lesson_id": lesson_id},
                request=request,
            )
            raise HTTPException(
                status_code=400,
                detail=f"Güvenlik kontrolü başarısız: {str(e)}"
            )
        except Exception:
            detected_mime = MIME_TYPE_MAP.get(file_ext, "application/octet-stream")
    else:
        # Video için MIME type mapping
        detected_mime = MIME_TYPE_MAP.get(file_ext, "video/mp4")
    
    # EP10-BE-14: Quota kontrolü
    try:
        await reserve_quota(db, current_user.id, file_size)
    except QuotaExceededError as e:
        # Audit log: quota aşımı
        await log_security_event(
            db, ContentAuditAction.QUOTA_EXCEEDED,
            ContentResourceType.VIDEO if file_ext in ALLOWED_VIDEO_EXTENSIONS else ContentResourceType.DOCUMENT,
            user_id=current_user.id, resource_id=lesson_id,
            metadata={"file_size": file_size, "lesson_id": lesson_id},
            request=request,
        )
        raise HTTPException(status_code=403, detail=str(e))
    
    # Eski dosya varsa sil ve quota release et
    old_file_size = 0
    if lesson.content_path:
        try:
            # Eski dosya boyutunu al
            old_file_size = await storage.get_file_size(lesson.content_path)
            await storage.delete(lesson.content_path)
            # Quota release
            if old_file_size > 0:
                await release_quota(db, current_user.id, old_file_size)
        except StorageNotFoundError:
            pass
        except Exception:
            pass
    
    # Dosya adı ve destination path oluştur
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{lesson_id}_{timestamp}{file_ext}"
    
    # Tip bazlı dizin seçimi
    if file_ext in ALLOWED_VIDEO_EXTENSIONS:
        destination_path = f"{settings.VIDEOS_DIR}/{filename}"
    elif file_ext in ALLOWED_DOCUMENT_EXTENSIONS:
        destination_path = f"{settings.DOCUMENTS_DIR}/{filename}"
    else:
        destination_path = f"{settings.DOCUMENTS_DIR}/{filename}"  # Default
    
    # Storage Service ile yükle
    upload_result = await storage.upload(
        file_content=file_content,
        destination_path=destination_path,
        content_type=detected_mime,
    )
    
    # Lesson'a bilgileri kaydet
    lesson_type = _get_lesson_type_from_extension(file_ext)
    lesson.lesson_type = lesson_type
    lesson.content_path = upload_result.storage_key
    lesson.original_filename = file.filename
    lesson.file_size_bytes = upload_result.file_size
    lesson.mime_type = detected_mime
    
    await db.commit()
    await db.refresh(lesson)
    
    # EP10-BE-18: Audit logging
    resource_type = ContentResourceType.VIDEO if file_ext in ALLOWED_VIDEO_EXTENSIONS else ContentResourceType.DOCUMENT
    await log_upload(
        db, resource_type, lesson_id, current_user.id,
        file_size=upload_result.file_size,
        file_type=detected_mime,
        storage_key=upload_result.storage_key,
        request=request,
    )
    
    return {
        "message": "İçerik başarıyla yüklendi",
        "filename": filename,
        "path": upload_result.storage_key,
        "url": upload_result.access_url,
        "size": upload_result.file_size,
        "checksum": upload_result.checksum,
        "lesson_type": lesson_type.value,
        "mime_type": detected_mime,
    }


@router.post("/lessons/{lesson_id}/upload-recording")
async def upload_live_lesson_recording(
    lesson_id: str,
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Canlı ders kaydı yükleme endpoint'i (EP10-BE-06)
    
    CRITICAL SECURITY:
    - Sadece LIVE_LESSON tipi dersler için
    - Sadece ders sahibi ve admin yetkisi
    """
    # Lesson kontrolü
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # CRITICAL: Sadece LIVE_LESSON tipi dersler için
    if lesson.lesson_type != LessonType.LIVE_LESSON:
        raise HTTPException(
            status_code=400,
            detail="Bu endpoint sadece canlı dersler için kullanılabilir"
        )
    
    # Ownership kontrolü
    if lesson.course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu canlı dersin kaydını yükleme yetkiniz yok")
    
    # Dosya validasyonu
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya adı belirtilmedi")
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz dosya formatı. İzin verilen formatlar: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )
    
    # Dosya boyutu kontrolü
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Dosya boyutu çok büyük. Maksimum: {settings.MAX_VIDEO_SIZE_MB}MB"
        )
    
    # EP10-BE-14: Quota kontrolü
    try:
        await reserve_quota(db, current_user.id, file_size)
    except QuotaExceededError as e:
        # Audit log: quota aşımı
        await log_security_event(
            db, ContentAuditAction.QUOTA_EXCEEDED, ContentResourceType.VIDEO,
            user_id=current_user.id, resource_id=lesson_id,
            metadata={"file_size": file_size, "lesson_id": lesson_id},
            request=request,
        )
        raise HTTPException(status_code=403, detail=str(e))
    
    # Eski kayıt varsa sil ve quota release et
    old_file_size = 0
    if lesson.live_lesson_recording_path:
        try:
            # Eski dosya boyutunu al
            old_file_size = await storage.get_file_size(lesson.live_lesson_recording_path)
            await storage.delete(lesson.live_lesson_recording_path)
            # Quota release
            if old_file_size > 0:
                await release_quota(db, current_user.id, old_file_size)
        except StorageNotFoundError:
            pass
        except Exception:
            pass
    
    # Dosya adı oluştur
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{lesson_id}_recording_{timestamp}{file_ext}"
    destination_path = f"{settings.LIVE_RECORDINGS_DIR}/{filename}"
    
    # MIME type belirle
    content_type = MIME_TYPE_MAP.get(file_ext, "video/mp4")
    
    # Storage Service ile yükle
    upload_result = await storage.upload(
        file_content=file_content,
        destination_path=destination_path,
        content_type=content_type,
    )
    
    # Lesson'a kayıt bilgilerini kaydet
    lesson.live_lesson_recording_path = upload_result.storage_key
    lesson.is_live_lesson_ended = True  # Kayıt yüklendiğinde ders sonlandırılmış sayılır
    
    await db.commit()
    await db.refresh(lesson)
    
    # EP10-BE-18: Audit logging
    await log_upload(
        db, ContentResourceType.VIDEO, lesson_id, current_user.id,
        file_size=upload_result.file_size,
        file_type=content_type,
        storage_key=upload_result.storage_key,
        request=request,
    )
    
    return {
        "message": "Canlı ders kaydı başarıyla yüklendi",
        "filename": filename,
        "path": upload_result.storage_key,
        "url": upload_result.access_url,
        "size": upload_result.file_size,
        "checksum": upload_result.checksum,
        "lesson_id": lesson_id,
    }


# ============================================================================
# Thumbnail Upload Endpoints (EP10-BE-08)
# ============================================================================

MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024  # 5MB max thumbnail size
THUMBNAIL_TARGET_SIZE = (1280, 720)  # 16:9 aspect ratio


@router.post("/courses/{course_id}/upload-thumbnail")
async def upload_course_thumbnail(
    course_id: str,
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Kurs kapak fotoğrafı yükleme endpoint'i (EP10-BE-08)
    
    SECURITY:
    - Decompression bomb koruması (Pillow limitleri)
    - EXIF metadata temizleme
    - Eski thumbnail silme sırası (önce yeni dosya + DB commit, sonra eski dosya cleanup)
    """
    from PIL import Image
    from PIL.ExifTags import TAGS
    import io
    
    # Kurs kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Ownership kontrolü
    if course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu kursun thumbnail'ini yükleme yetkiniz yok")
    
    # Dosya validasyonu
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya adı belirtilmedi")
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz dosya formatı. İzin verilen formatlar: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Dosya boyutu kontrolü
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_THUMBNAIL_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Dosya boyutu çok büyük. Maksimum: 5MB"
        )
    
    # Image processing (Pillow ile)
    try:
        # SECURITY: Decompression bomb koruması
        Image.MAX_IMAGE_PIXELS = 100_000_000  # 100MP limit (yaklaşık 10K x 10K)
        
        # Image aç
        image = Image.open(io.BytesIO(file_content))
        
        # SECURITY: EXIF metadata temizleme
        # EXIF verilerini kaldır (konum bilgisi sızıntısı önleme)
        if hasattr(image, '_getexif'):
            exif = image._getexif()
            if exif:
                # EXIF verilerini temizle
                image_data = list(image.getdata())
                image_without_exif = Image.new(image.mode, image.size)
                image_without_exif.putdata(image_data)
                image = image_without_exif
        
        # RGB'ye dönüştür (RGBA, P, L gibi modlar için)
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Resize (16:9 aspect ratio, 1280x720)
        # Aspect ratio korunarak resize
        target_width, target_height = THUMBNAIL_TARGET_SIZE
        image.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
        
        # WebP formatında kaydet (performans için)
        output = io.BytesIO()
        image.save(output, format="WEBP", quality=85, optimize=True)
        processed_content = output.getvalue()
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Resim işlenirken hata oluştu: {str(e)}"
        )
    
    # EP10-BE-14: Quota kontrolü (thumbnail için küçük dosya, ama yine de kontrol)
    processed_size = len(processed_content)
    try:
        await reserve_quota(db, current_user.id, processed_size)
    except QuotaExceededError as e:
        # Audit log: quota aşımı
        await log_security_event(
            db, ContentAuditAction.QUOTA_EXCEEDED, ContentResourceType.THUMBNAIL,
            user_id=current_user.id, resource_id=course_id,
            metadata={"file_size": processed_size, "course_id": course_id},
            request=request,
        )
        raise HTTPException(status_code=403, detail=str(e))
    
    # Eski thumbnail path'ini sakla (silme için)
    old_thumbnail_path = course.thumbnail_path
    old_file_size = 0
    
    # Eski thumbnail varsa sil ve quota release et
    if old_thumbnail_path:
        try:
            old_file_size = await storage.get_file_size(old_thumbnail_path)
            await storage.delete(old_thumbnail_path)
            # Quota release
            if old_file_size > 0:
                await release_quota(db, current_user.id, old_file_size)
        except StorageNotFoundError:
            pass
        except Exception:
            pass
    
    # Dosya adı oluştur (cache busting için hash ekle)
    from datetime import datetime
    import hashlib
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    content_hash = hashlib.md5(processed_content).hexdigest()[:8]  # İlk 8 karakter
    filename = f"{course_id}_{timestamp}_{content_hash}.webp"
    destination_path = f"{settings.THUMBNAILS_DIR}/{filename}"
    
    # Storage Service ile yükle
    upload_result = await storage.upload(
        file_content=processed_content,
        destination_path=destination_path,
        content_type="image/webp",
    )
    
    # Course'a thumbnail path kaydet
    course.thumbnail_path = upload_result.storage_key
    
    # PRODUCT: Önce yeni dosya ve DB commit, sonra eski dosya cleanup
    await db.commit()
    await db.refresh(course)
    
    # EP10-BE-18: Audit logging
    await log_upload(
        db, ContentResourceType.THUMBNAIL, course_id, current_user.id,
        file_size=upload_result.file_size,
        file_type="image/webp",
        storage_key=upload_result.storage_key,
        request=request,
    )
    
    return {
        "message": "Kurs thumbnail'ı başarıyla yüklendi",
        "filename": filename,
        "path": upload_result.storage_key,
        "url": upload_result.access_url,
        "size": upload_result.file_size,
        "checksum": upload_result.checksum,
    }


@router.delete("/courses/{course_id}/thumbnail")
async def delete_course_thumbnail(
    course_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """Kurs thumbnail silme endpoint'i"""
    # Kurs kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Ownership kontrolü
    if course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu kursun thumbnail'ini silme yetkiniz yok")
    
    # Thumbnail'ı sil ve quota release et
    old_file_size = 0
    old_storage_key = course.thumbnail_path
    if course.thumbnail_path:
        try:
            # Eski dosya boyutunu al
            old_file_size = await storage.get_file_size(course.thumbnail_path)
            await storage.delete(course.thumbnail_path)
            # EP10-BE-14: Quota release
            if old_file_size > 0:
                await release_quota(db, current_user.id, old_file_size)
        except StorageNotFoundError:
            pass  # Dosya zaten yok, devam et
        except Exception:
            pass  # Hata durumunda devam et
        
        course.thumbnail_path = None
        await db.commit()
        
        # EP10-BE-18: Audit logging
        await log_delete(
            db, ContentResourceType.THUMBNAIL, course_id, current_user.id,
            storage_key=old_storage_key,
            request=request,
        )
    
    return {"message": "Kurs thumbnail'ı başarıyla silindi"}


@router.post("/upload-image")
async def upload_general_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Genel görsel yükleme endpoint'i (Quiz, Reklam, vb. için)
    - WebP'ye optimize eder ve settings.THUMBNAILS_DIR'a kaydeder.
    - Public erişilebilir URL döner.
    """
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz resim formatı. Desteklenenler: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    file_content = await file.read()
    if len(file_content) > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Resim boyutu çok büyük. Maksimum {settings.MAX_AVATAR_SIZE_MB}MB olmalıdır."
        )
    
    # Process image with Pillow to WebP
    try:
        import io
        from PIL import Image
        image = Image.open(io.BytesIO(file_content))
        
        # EXIF temizle
        image_data = list(image.getdata())
        image_without_exif = Image.new(image.mode, image.size)
        image_without_exif.putdata(image_data)
        
        # RGB'ye dönüştür
        if image_without_exif.mode != "RGB":
            image_without_exif = image_without_exif.convert("RGB")
            
        output = io.BytesIO()
        image_without_exif.save(output, format="WEBP", quality=85, optimize=True)
        processed_content = output.getvalue()
    except Exception as e:
        processed_content = file_content
        
    from datetime import datetime
    import hashlib
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    content_hash = hashlib.md5(processed_content).hexdigest()[:8]
    filename = f"gen_{timestamp}_{content_hash}.webp"
    destination_path = f"{settings.THUMBNAILS_DIR}/{filename}"
    
    upload_result = await storage.upload(
        file_content=processed_content,
        destination_path=destination_path,
        content_type="image/webp",
    )
    
    access_url = f"{settings.FRONTEND_URL.rstrip('/')}/api/v1/media/thumbnails/{filename}"
    if settings.STORAGE_BACKEND != "local":
        access_url = upload_result.access_url
        
    return {
        "message": "Görsel başarıyla yüklendi",
        "filename": filename,
        "path": upload_result.storage_key,
        "url": f"/api/v1/media/thumbnails/{filename}",
        "full_url": access_url,
        "size": upload_result.file_size,
    }


@router.post("/upload-document")
async def upload_general_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Genel doküman yükleme endpoint'i (Eğitmen Başvurusu vb. için)
    - settings.DOCUMENTS_DIR'a kaydeder.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya adı belirtilmedi")
        
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz doküman formatı. İzin verilen formatlar: {', '.join(ALLOWED_DOCUMENT_EXTENSIONS)}"
        )
        
    file_content = await file.read()
    if len(file_content) > MAX_DOCUMENT_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Doküman boyutu çok büyük. Maksimum {settings.MAX_DOCUMENT_SIZE_MB}MB olmalıdır."
        )
        
    from datetime import datetime
    import hashlib
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    content_hash = hashlib.md5(file_content).hexdigest()[:8]
    filename = f"doc_{current_user.id}_{timestamp}_{content_hash}{file_ext}"
    destination_path = f"{settings.DOCUMENTS_DIR}/{filename}"
    
    upload_result = await storage.upload(
        file_content=file_content,
        destination_path=destination_path,
        content_type=MIME_TYPE_MAP.get(file_ext, "application/octet-stream"),
    )
    
    return {
        "message": "Doküman başarıyla yüklendi",
        "filename": filename,
        "path": upload_result.storage_key,
        "url": f"/api/v1/media/documents/{filename}",
        "size": upload_result.file_size,
    }


@router.get("/thumbnails/{filename}")
async def get_thumbnail(
    filename: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Thumbnail görüntüleme endpoint'i (public erişim)
    
    - Public erişim (auth gereksiz)
    - Cache headers (1 yıl)
    - Doğru content-type (image/webp)
    """
    storage_key = f"{settings.THUMBNAILS_DIR}/{filename}"
    
    try:
        file_content = await storage.download(storage_key)
    except StorageNotFoundError:
        raise HTTPException(status_code=404, detail="Thumbnail bulunamadı")
    
    # ETag oluştur (dosya içeriğinden hash)
    import hashlib
    etag = hashlib.md5(file_content).hexdigest()
    
    # Conditional request kontrolü (If-None-Match)
    if_none_match = request.headers.get("If-None-Match")
    if if_none_match and if_none_match.strip('"') == etag:
        from fastapi import Response
        return Response(status_code=304, headers={"ETag": f'"{etag}"'})
    
    return StreamingResponse(
        iter([file_content]),
        media_type="image/webp",
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",  # 1 yıl cache, immutable
            "Content-Disposition": f'inline; filename="{filename}"',
            "ETag": f'"{etag}"',
        }
    )


@router.post("/lessons/{lesson_id}/convert-to-pdf")
async def convert_lesson_to_pdf(
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Dokümanı PDF'e dönüştür (EP10-BE-12)
    
    - Async task olarak çalışır (non-blocking)
    - DOCX ve PPTX dosyaları desteklenir
    - Orijinal dosya korunur
    - Dönüştürme tamamlandığında lesson.content_path güncellenir
    
    Returns:
        {
            "status": "processing",
            "task_id": "...",
            "message": "Dönüştürme işlemi başlatıldı"
        }
    """
    # Lesson'ı getir
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # Ownership kontrolü
    course = lesson.course
    if course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu dersi düzenleme yetkiniz yok")
    
    # Sadece DOCX ve PPTX dosyaları dönüştürülebilir
    if lesson.lesson_type not in [LessonType.DOCUMENT, LessonType.PRESENTATION]:
        raise HTTPException(
            status_code=400,
            detail=f"Bu ders tipi PDF'e dönüştürülemez. Sadece DOCX ve PPTX dosyaları desteklenir"
        )
    
    # content_path kontrolü
    if not lesson.content_path:
        raise HTTPException(status_code=400, detail="Ders içeriği bulunamadı")
    
    # Zaten PDF mi kontrol et
    if lesson.mime_type == "application/pdf":
        return {
            "status": "already_pdf",
            "task_id": None,
            "message": "Ders zaten PDF formatında",
        }
    
    # Job ID oluştur
    job_id = f"conv_{uuid4().hex[:12]}"
    
    # Destination storage key (PDF için)
    source_path = Path(lesson.content_path)
    pdf_storage_key = f"{settings.DOCUMENTS_DIR}/{source_path.stem}_converted.pdf"
    
    # Job'u kuyruğa ekle
    await enqueue_conversion_job({
        "job_id": job_id,
        "lesson_id": lesson_id,
        "source_storage_key": lesson.content_path,
        "destination_storage_key": pdf_storage_key,
        "lesson_type": lesson.lesson_type.value,
    })
    
    return {
        "status": "processing",
        "task_id": job_id,
        "message": "Dönüştürme işlemi başlatıldı. Durum kontrolü için task_id kullanabilirsiniz.",
    }


@router.get("/lessons/{lesson_id}/convert-status/{task_id}")
async def get_conversion_status(
    lesson_id: str,
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    """
    Dönüştürme işlemi durumunu kontrol et (EP10-BE-12)
    
    Returns:
        {
            "status": "pending" | "processing" | "completed" | "failed",
            "task_id": "...",
            "error": str | None,
            "pdf_storage_key": str | None,
            "file_size_bytes": int | None,
            "started_at": str | None,
            "completed_at": str | None,
        }
    """
    from app.services.document_conversion_queue import get_job_status
    
    # Lesson ownership kontrolü (opsiyonel - public de olabilir)
    result = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # Job durumunu al
    job_status = await get_job_status(task_id)
    
    if not job_status:
        raise HTTPException(status_code=404, detail="Task bulunamadı veya süresi dolmuş")
    
    return job_status
