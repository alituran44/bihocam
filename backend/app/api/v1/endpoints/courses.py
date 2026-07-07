from uuid import UUID as UUIDType
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, cast, String
from sqlalchemy.dialects.postgresql import ENUM, TEXT
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
import logging


def _validate_uuid(value: str, name: str = "id") -> str:
    """UUID formatini dogrula, gecersizse 404 don."""
    try:
        UUIDType(value)
        return value
    except (ValueError, AttributeError):
        raise HTTPException(status_code=404, detail=f"Gecersiz {name}")

from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.course import Course, Lesson, CourseStatus, LessonType
from app.models.category import Category
from app.models.order import Enrollment
from app.models.course_review_history import CourseReviewHistory, ModerationActionType
from app.models.notification import NotificationType, NotificationPriority
from app.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    LessonCreate,
    LessonResponse,
    LessonUpdate,
    LessonReorderRequest,
    LiveLessonCreate,
    LiveLessonRescheduleRequest,
)
from app.schemas.course_approval import CourseApproveRequest, CourseRejectRequest
from app.schemas.user import UserResponse
from app.services.notification_service import NotificationService
from app.services.storage_service import StorageBackend, StorageNotFoundError, get_storage
from app.services.security_service import validate_and_sanitize_content_text

router = APIRouter()


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER, UserRole.ORGANIZATION]:
        raise HTTPException(status_code=403, detail="Öğretmen veya admin yetkisi gerekli")
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


def _is_course_owner_or_admin(course: Course, user: User | None) -> bool:
    if not user:
        return False
    if user.role == UserRole.ADMIN:
        return True
    return course.teacher_id == user.id


async def _is_enrolled(db: AsyncSession, course_id: str, user: User | None) -> bool:
    if not user:
        return False
    # Teacher owner/admin already has access; enrollment is for students/org members.
    from app.models.order import Enrollment

    result = await db.execute(
        select(Enrollment).where(Enrollment.user_id == user.id, Enrollment.course_id == course_id)
    )
    return result.scalar_one_or_none() is not None


async def _enrich_lesson_response(
    lesson: Lesson,
    course: Course,
    current_user: User | None,
    db: AsyncSession,
    storage: StorageBackend,
) -> LessonResponse:
    """
    Lesson objesini LessonResponse'a dönüştürür ve zenginleştirir (EP10-BE-07)
    
    - content_path'den content_url oluşturur (StorageService üzerinden)
    - can_access ve requires_enrollment hesaplar
    - thumbnail_url ve live_lesson_recording_url oluşturur
    """
    # Erişim kontrolü hesapla
    owner_or_admin = _is_course_owner_or_admin(course, current_user)
    enrolled = False if owner_or_admin else await _is_enrolled(db, course.id, current_user)
    can_access = lesson.is_preview or owner_or_admin or enrolled
    requires_enrollment = not lesson.is_preview
    
    # Content URL oluştur
    content_url = None
    if lesson.content_path:
        try:
            content_url = await storage.get_url(lesson.content_path)
        except StorageNotFoundError:
            content_url = None
    
    # Thumbnail URL oluştur
    thumbnail_url = None
    if lesson.thumbnail_path:
        try:
            thumbnail_url = await storage.get_url(lesson.thumbnail_path)
        except StorageNotFoundError:
            thumbnail_url = None
    
    # Live lesson recording URL oluştur
    live_lesson_recording_url = None
    if lesson.live_lesson_recording_path:
        try:
            live_lesson_recording_url = await storage.get_url(lesson.live_lesson_recording_path)
        except StorageNotFoundError:
            live_lesson_recording_url = None
    
    # LessonResponse oluştur
    return LessonResponse(
        id=lesson.id,
        course_id=lesson.course_id,
        title=lesson.title,
        description=lesson.description,
        lesson_type=lesson.lesson_type,
        video_url=lesson.video_url,
        duration_seconds=lesson.duration_seconds,
        order=lesson.order,
        is_preview=lesson.is_preview,
        # Content URLs
        content_url=content_url,
        content_path=lesson.content_path,  # Backward compatibility için tutuluyor
        thumbnail_url=thumbnail_url,
        live_lesson_recording_url=live_lesson_recording_url,
        # Content metadata
        original_filename=lesson.original_filename,
        file_size_bytes=lesson.file_size_bytes,
        mime_type=lesson.mime_type,
        content_text=lesson.content_text,
        # Live lesson fields
        live_lesson_url=lesson.live_lesson_url,
        live_lesson_at=lesson.live_lesson_at,
        is_live_lesson_ended=lesson.is_live_lesson_ended,
        # Access control
        can_access=can_access,
        requires_enrollment=requires_enrollment,
        # Timestamps
        created_at=lesson.created_at,
        updated_at=lesson.updated_at,
    )


@router.get("", response_model=list[CourseResponse])
@router.get("/", response_model=list[CourseResponse])
async def list_courses(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Tüm yayınlanmış kursları listele"""
    # Enum'u doğru formatta kullan (PostgreSQL enum case sensitivity için)
    # Veritabanında enum değerleri küçük harf olarak saklanıyor ("published")
    # SQLAlchemy enum'u doğrudan kullan, values_callable model'de tanımlı
    # Ancak query'de string olarak kullanmak gerekiyor çünkü PostgreSQL enum case-sensitive
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories)
        )
        .where(Course.status == "published")
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/me", response_model=list[CourseResponse])
async def get_my_courses(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Öğretmenin kendi kurslarını getir"""
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories)
        )
        .where(Course.teacher_id == current_user.id)
        .order_by(Course.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/slug/{slug}", response_model=CourseResponse)
async def get_course_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories)
        )
        .where(Course.slug == slug)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    # Yayında olmayan kursları sadece owner/admin görebilsin
    if course.status != "published" and not _is_course_owner_or_admin(course, current_user):
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    # Dersleri: owner/admin veya enrolled değilse sadece preview dersleri dön
    visible_lessons = course.lessons
    if not _is_course_owner_or_admin(course, current_user):
        enrolled = await _is_enrolled(db, course.id, current_user)
        if not enrolled:
            visible_lessons = [l for l in course.lessons if l.is_preview]

    response = CourseResponse.model_validate(course)
    response.lessons = [LessonResponse.model_validate(l) for l in visible_lessons]
    return response


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    _validate_uuid(course_id, "course_id")
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories)
        )
        .where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    if course.status != "published" and not _is_course_owner_or_admin(course, current_user):
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    visible_lessons = course.lessons
    if not _is_course_owner_or_admin(course, current_user):
        enrolled = await _is_enrolled(db, course.id, current_user)
        if not enrolled:
            visible_lessons = [l for l in course.lessons if l.is_preview]

    response = CourseResponse.model_validate(course)
    response.lessons = [LessonResponse.model_validate(l) for l in visible_lessons]
    return response


@router.post("", response_model=CourseResponse)
@router.post("/", response_model=CourseResponse)
async def create_course(
    course_in: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    # Eğitmen onaylı mı kontrol et
    if current_user.role == UserRole.TEACHER and not current_user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Hesabınız admin tarafından onaylanmamıştır. Kurs oluşturmak için onaylı bir eğitmen olmanız gerekmektedir."
        )

    # Slug kontrolü - önceden kontrol et
    existing_slug = await db.execute(
        select(Course).where(Course.slug == course_in.slug)
    )
    if existing_slug.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail={
                "code": "COURSE_SLUG_EXISTS",
                "message": "Bu kurs URL'si (slug) zaten kullanılıyor. Lütfen farklı bir başlık/slug deneyin.",
            },
        )
    
    # Prepare course data (exclude category_ids and deprecated category_id)
    course_data = course_in.model_dump(exclude={'category_ids', 'category_id'})
    
    # Handle categories if provided (önce kategorileri kontrol et)
    categories = []
    if course_in.category_ids:
        # Validate categories exist and are active
        categories_result = await db.execute(
            select(Category)
            .where(Category.id.in_([str(cat_id) for cat_id in course_in.category_ids]))
            .where(Category.is_active == True)
        )
        categories = categories_result.scalars().all()
        
        if len(categories) != len(course_in.category_ids):
            raise HTTPException(
                status_code=400,
                detail="Bazı kategoriler bulunamadı veya aktif değil"
            )
    
    # Kursu oluştur (kategorileri de ekle)
    course = Course(
        **course_data,
        teacher_id=current_user.id,
    )
    if categories:
        course.categories = list(categories)
    
    db.add(course)
    
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        # Örneğin slug benzersiz değilse (race condition durumunda)
        if "ix_courses_slug" in str(e.orig):
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "COURSE_SLUG_EXISTS",
                    "message": "Bu kurs URL'si (slug) zaten kullanılıyor. Lütfen farklı bir başlık/slug deneyin.",
                },
            )
        raise HTTPException(
            status_code=400,
            detail={
                "code": "COURSE_CREATE_ERROR",
                "message": "Kurs oluşturulurken bir hata oluştu.",
            },
        ) from e

    # Kursu ilişkili alanlarla birlikte tekrar yükle (lessons, teacher, categories)
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories)
        )
        .where(Course.id == course.id)
    )
    created_course = result.scalar_one()
    return created_course


@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """
    Kurs silme — sadece draft/rejected kurslar silinebilir.
    Published kurslar oncelikle arsivlenmeli.
    Teacher kendi kursunu, admin herhangi bir kursu silebilir.
    """
    _validate_uuid(course_id, "course_id")
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadi")

    if current_user.role == UserRole.TEACHER and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu kursu silme yetkiniz yok")

    if course.status == "published":
        raise HTTPException(status_code=400, detail="Yayindaki kurslar silinemez. Oncelikle arsivleyin.")

    # Enrollment kontrolu
    from sqlalchemy import func
    enrollment_count = await db.execute(
        select(func.count(Enrollment.id)).where(Enrollment.course_id == course_id)
    )
    if (enrollment_count.scalar() or 0) > 0:
        raise HTTPException(status_code=400, detail="Kayitli ogrencisi olan kurslar silinemez")

    await db.delete(course)
    await db.commit()
    return {"message": "Kurs basariyla silindi"}


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    course_in: CourseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """
    Kurs güncelleme endpoint'i
    - Teacher: Sadece kendi kurslarında title, description, meta_title, meta_description, category_ids güncelleyebilir
    - Admin: Tüm kurslarda tüm alanları güncelleyebilir (price, status, is_featured, vb.)
    - PUBLISHED kurslarda slug güncellenemez (SEO koruması)
    """
    import json
    from fastapi import Request
    
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.categories))
        .where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    is_admin = current_user.role == UserRole.ADMIN
    is_owner = str(course.teacher_id) == str(current_user.id)

    # Yetki kontrolü
    if not is_admin and not is_owner:
        raise HTTPException(status_code=403, detail="Bu kursu düzenleme yetkiniz yok")
    
    # Teacher için izin verilen alanlar
    teacher_allowed_fields = {
        'title', 'description', 'price', 'discount_price', 
        'meta_title', 'meta_description', 'category_ids', 'thumbnail_path'
    }
    
    # Admin için tüm alanlar izinli
    update_data = course_in.model_dump(exclude_unset=True, exclude={'category_ids'})
    
    # Teacher için alan bazlı yetki kontrolü
    if not is_admin:
        restricted_fields = set(update_data.keys()) - teacher_allowed_fields
        if restricted_fields:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "FIELD_ACCESS_DENIED",
                    "message": f"Öğretmen olarak şu alanları güncelleyemezsiniz: {', '.join(restricted_fields)}."
                }
            )
        # Her düzenlemeden sonra adminin onayına düşer
        course.status = "pending_review"
    
    # Değişiklik takibi için eski değerleri sakla
    old_status = course.status
    changes = {}
    
    # Handle category_ids separately
    if 'category_ids' in course_in.model_dump(exclude_unset=True):
        category_ids = course_in.category_ids
        if category_ids is not None:
            # Validate categories exist and are active
            categories_result = await db.execute(
                select(Category)
                .where(Category.id.in_([str(cat_id) for cat_id in category_ids]))
                .where(Category.is_active == True)
            )
            categories = categories_result.scalars().all()
            
            if len(categories) != len(category_ids):
                raise HTTPException(
                    status_code=400,
                    detail="Bazı kategoriler bulunamadı veya aktif değil"
                )
            
            # Kategori değişikliğini takip et
            old_category_ids = {str(cat.id) for cat in course.categories}
            new_category_ids = {str(cat.id) for cat in categories}
            if old_category_ids != new_category_ids:
                changes['categories'] = {
                    'old': list(old_category_ids),
                    'new': list(new_category_ids)
                }
            
            # Update categories
            course.categories = list(categories)
        else:
            # Empty list means remove all categories
            old_category_ids = {str(cat.id) for cat in course.categories}
            if old_category_ids:
                changes['categories'] = {
                    'old': list(old_category_ids),
                    'new': []
                }
            course.categories = []
    
    # Update other fields and track changes
    for field, value in update_data.items():
        old_value = getattr(course, field, None)
        if old_value != value:
            changes[field] = {
                'old': str(old_value) if old_value is not None else None,
                'new': str(value) if value is not None else None
            }
        setattr(course, field, value)
    
    # Status değişikliği kontrolü (sadece admin)
    new_status = update_data.get('status')
    if new_status and new_status != old_status:
        if not is_admin:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "STATUS_CHANGE_DENIED",
                    "message": "Öğretmen olarak kurs durumunu değiştiremezsiniz. Sadece admin bu işlemi yapabilir."
                }
            )
        
        # Geçerli status geçişlerini validate et
        VALID_STATUS_TRANSITIONS = {
            "draft": ["pending_review"],
            "pending_review": ["published", "rejected"],
            "rejected": ["draft", "pending_review"],
            "published": ["archived"],
            "archived": ["published"]
        }
        
        valid_transitions = VALID_STATUS_TRANSITIONS.get(old_status, [])
        if new_status not in valid_transitions:
            logging.warning(
                f"Invalid status transition attempt: {old_status} -> {new_status} "
                f"by user {current_user.id} for course {course_id}"
            )
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "INVALID_STATUS_TRANSITION",
                    "message": f"'{old_status}' durumundan '{new_status}' durumuna geçiş yapılamaz.",
                    "valid_transitions": valid_transitions
                }
            )
    
    # ReviewHistory kaydı oluştur (admin düzenlemeleri için)
    review_history = None
    if is_admin and changes:
        # CourseReviewHistory modelinde artık string kullanıyoruz (enum değil)
        final_status = new_status if new_status else course.status
        
        review_history = CourseReviewHistory(
            course_id=course.id,
            actor_id=current_user.id,
            old_status=old_status,  # Direkt string
            new_status=final_status,  # Direkt string
            action_type="edit",  # Direkt string
            note=f"Admin tarafından düzenlendi: {', '.join(changes.keys())}",
            changes_json=json.dumps(changes, ensure_ascii=False) if changes else None,
        )
        db.add(review_history)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        if "ix_courses_slug" in str(e.orig):
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "COURSE_SLUG_EXISTS",
                    "message": "Bu kurs URL'si (slug) zaten kullanılıyor. Lütfen farklı bir slug deneyin.",
                },
            )
        raise HTTPException(
            status_code=400,
            detail={
                "code": "COURSE_UPDATE_ERROR",
                "message": "Kurs güncellenirken bir hata oluştu.",
            },
        ) from e

    # Güncellenen kursu ilişkili alanlarla birlikte tekrar yükle
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories)
        )
        .where(Course.id == course.id)
    )
    updated_course = result.scalar_one()
    return updated_course


@router.get("/{course_id}/lessons", response_model=list[LessonResponse])
async def get_course_lessons(
    course_id: str,
    # EP10-BE-10: Filtreleme parametreleri
    lesson_type: LessonType | None = None,  # Tip filtreleme
    has_content: bool | None = None,  # İçerik yüklenmiş mi
    is_live: bool | None = None,  # Canlı ders mi
    search: str | None = None,  # Text search (title ve description)
    sort_by: str = "order",  # Sıralama: "order", "created_at", "duration_seconds"
    sort_order: str = "asc",  # "asc" veya "desc"
    # Pagination
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Kurs derslerini getir (EP10-BE-10: Filtreleme & Arama)
    
    SECURITY:
    - sort_by allowlist ile sınırlandırılmış (SQL injection önleme)
    - Pagination zorunlu (performans)
    
    PRODUCT:
    - Text search (title ve description)
    - Tip bazlı filtreleme
    - İçerik durumu filtreleme
    - Canlı ders filtreleme
    """
    from sqlalchemy import or_, func
    
    # Kurs kontrolü
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    # Yayında olmayan kursların dersleri sadece owner/admin için görünür
    if course.status != "published" and not _is_course_owner_or_admin(course, current_user):
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    owner_or_admin = _is_course_owner_or_admin(course, current_user)
    enrolled = False if owner_or_admin else await _is_enrolled(db, course_id, current_user)

    # Base query
    stmt = select(Lesson).where(Lesson.course_id == course_id)
    
    # Erişim kontrolü (preview dersler)
    if not owner_or_admin and not enrolled:
        stmt = stmt.where(Lesson.is_preview == True)  # noqa: E712

    # EP10-BE-10: Filtreleme
    if lesson_type is not None:
        stmt = stmt.where(Lesson.lesson_type == lesson_type)
    
    if has_content is not None:
        if has_content:
            # İçerik yüklenmiş: content_path, content_text, live_lesson_url veya video_url var
            stmt = stmt.where(
                or_(
                    Lesson.content_path.isnot(None),
                    Lesson.content_text.isnot(None),
                    Lesson.live_lesson_url.isnot(None),
                    Lesson.video_url.isnot(None)
                )
            )
        else:
            # İçerik yüklenmemiş: tüm content alanları null
            stmt = stmt.where(
                and_(
                    Lesson.content_path.is_(None),
                    Lesson.content_text.is_(None),
                    Lesson.live_lesson_url.is_(None),
                    Lesson.video_url.is_(None)
                )
            )
    
    if is_live is not None:
        if is_live:
            stmt = stmt.where(Lesson.lesson_type == LessonType.LIVE_LESSON)
        else:
            stmt = stmt.where(Lesson.lesson_type != LessonType.LIVE_LESSON)
    
    # Text search (title ve description)
    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Lesson.title.ilike(search_pattern),
                Lesson.description.ilike(search_pattern)
            )
        )
    
    # SECURITY: sort_by allowlist kontrolü (SQL injection önleme)
    ALLOWED_SORT_FIELDS = {
        "order": Lesson.order,
        "created_at": Lesson.created_at,
        "duration_seconds": Lesson.duration_seconds,
    }
    
    if sort_by not in ALLOWED_SORT_FIELDS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz sıralama alanı: {sort_by}. İzin verilen alanlar: {', '.join(ALLOWED_SORT_FIELDS.keys())}"
        )
    
    sort_field = ALLOWED_SORT_FIELDS[sort_by]
    
    # Sıralama
    if sort_order.lower() == "desc":
        stmt = stmt.order_by(sort_field.desc())
    else:
        stmt = stmt.order_by(sort_field.asc())
    
    # Pagination
    stmt = stmt.offset(skip).limit(limit)

    result = await db.execute(stmt)
    lessons = result.scalars().all()
    
    # Enrich responses
    enriched_lessons = []
    for lesson in lessons:
        enriched = await _enrich_lesson_response(lesson, course, current_user, db, storage)
        enriched_lessons.append(enriched)
    
    return enriched_lessons


@router.get("/{course_id}/students", response_model=list[UserResponse])
async def get_course_students(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Belirli bir kursa kayıtlı öğrencileri listele (sadece kurs sahibi öğretmen / admin / kurum)."""
    _validate_uuid(course_id, "course_id")
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    if current_user.role != UserRole.ADMIN and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu kursun öğrencilerini görüntüleme yetkiniz yok")

    # Kayıtlı öğrencileri getir
    stmt = (
        select(User)
        .join(Enrollment, Enrollment.user_id == User.id)
        .where(Enrollment.course_id == course_id)
        .order_by(User.full_name)
    )
    result = await db.execute(stmt)
    students = result.scalars().all()
    return students


@router.get("/{course_id}/lessons/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    course_id: str,
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageBackend = Depends(get_storage),
):
    """Ders detayını getir (kayıtlı öğrenciler için) (EP10-BE-07: enriched response)"""
    # Course kontrolü
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Lesson kontrolü (quiz relationship ile birlikte)
    from sqlalchemy.orm import selectinload
    lesson_result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.quiz))
        .where(Lesson.id == lesson_id, Lesson.course_id == course_id)
    )
    lesson = lesson_result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # EP10-QUIZ-BE-08: Lesson type "quiz" ise quiz yoksa otomatik oluştur
    if lesson.lesson_type == LessonType.QUIZ and not lesson.quiz:
        from app.models.quiz import Quiz
        quiz = Quiz(
            lesson_id=lesson.id,
            title=lesson.title,
            description=lesson.description,
            passing_score=70,
            shuffle_questions=False,
            show_correct_answers=True,
        )
        db.add(quiz)
        await db.commit()
        await db.refresh(lesson)
    
    # Erişim kontrolü
    owner_or_admin = _is_course_owner_or_admin(course, current_user)
    enrolled = False if owner_or_admin else await _is_enrolled(db, course_id, current_user)
    
    # Eğer önizleme değilse, kullanıcının kursa kayıtlı olup olmadığını kontrol et
    if not lesson.is_preview and not owner_or_admin and not enrolled:
            raise HTTPException(status_code=403, detail="Bu derse erişim yetkiniz yok. Önce kursa kaydolmalısınız.")
    
    # Enrich response
    return await _enrich_lesson_response(lesson, course, current_user, db, storage)


@router.get("/{course_id}/similar", response_model=list[CourseResponse])
async def get_similar_courses(
    course_id: str,
    limit: int = 4,
    db: AsyncSession = Depends(get_db),
):
    """Benzer kursları getir (aynı eğitmen veya kategori)"""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    # Aynı eğitmenin diğer kurslarını getir
    similar_result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories)  # Categories eager loading eklendi
        )
        .where(
            Course.id != course_id,
            Course.status == "published",
            Course.teacher_id == course.teacher_id
        )
        .limit(limit)
    )
    similar_courses = similar_result.scalars().all()
    
    # Eğer yeterli kurs yoksa, kategoriye göre de ekle (şimdilik sadece eğitmen bazlı)
    return similar_courses


@router.post("/{course_id}/lessons", response_model=LessonResponse)
async def add_lesson(
    course_id: str,
    lesson_in: LessonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """Ders ekle (EP10-BE-07: enriched response)"""
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    if current_user.role != UserRole.ADMIN and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu kursa ders ekleme yetkiniz yok")

    # EP10-BE-13: content_text sanitization (XSS koruması)
    lesson_data = lesson_in.model_dump()
    if "content_text" in lesson_data and lesson_data["content_text"] is not None:
        try:
            lesson_data["content_text"] = validate_and_sanitize_content_text(lesson_data["content_text"])
        except SecurityValidationError as e:
            raise HTTPException(status_code=400, detail=f"İçerik validasyonu başarısız: {str(e)}")

    lesson = Lesson(**lesson_data, course_id=course_id)
    if current_user.role != UserRole.ADMIN:
        course.status = "pending_review"
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    
    # ============================================================================
    # EP10-QUIZ-BE-08: Lesson-Quiz Auto-Creation
    # ============================================================================
    # Lesson type "quiz" ise otomatik boş quiz oluştur
    if lesson.lesson_type == LessonType.QUIZ:
        from app.models.quiz import Quiz
        # Zaten quiz var mı kontrol et (güvenlik için)
        existing_quiz_result = await db.execute(
            select(Quiz).where(Quiz.lesson_id == lesson.id)
        )
        if not existing_quiz_result.scalar_one_or_none():
            quiz = Quiz(
                lesson_id=lesson.id,
                title=lesson.title,
                description=lesson.description,
                passing_score=70,  # Default
                shuffle_questions=False,
                show_correct_answers=True,
            )
            db.add(quiz)
            await db.commit()
    
    # Enrich response
    return await _enrich_lesson_response(lesson, course, current_user, db, storage)


@router.put("/{course_id}/lessons/reorder", response_model=dict)
async def reorder_lessons(
    course_id: str,
    reorder_request: LessonReorderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """
    Ders sıralama endpoint'i
    
    CRITICAL SECURITY & DATA INTEGRITY:
    - Duplicate ID validasyonu
    - Kursun tam lesson setiyle birebir eşleşme kontrolü
    - Transaction ile atomik güncelleme (rollback desteği)
    """
    # Kurs kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Ownership kontrolü
    if current_user.role != UserRole.ADMIN and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu kursun derslerini sıralama yetkiniz yok")
    
    # Kursun tüm lesson'larını getir
    lessons_result = await db.execute(
        select(Lesson).where(Lesson.course_id == course_id)
    )
    all_lessons = {lesson.id: lesson for lesson in lessons_result.scalars().all()}
    
    # CRITICAL: Data Integrity - Duplicate ID kontrolü
    if len(reorder_request.lesson_ids) != len(set(reorder_request.lesson_ids)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate lesson ID bulundu. Her lesson ID sadece bir kez olmalı."
        )
    
    # CRITICAL: Data Integrity - Eksik veya ekstra ID kontrolü
    requested_ids = set(reorder_request.lesson_ids)
    existing_ids = set(all_lessons.keys())
    
    if requested_ids != existing_ids:
        missing = existing_ids - requested_ids
        extra = requested_ids - existing_ids
        error_msg = []
        if missing:
            error_msg.append(f"Eksik lesson ID'ler: {list(missing)}")
        if extra:
            error_msg.append(f"Geçersiz lesson ID'ler (bu kursa ait değil): {list(extra)}")
        raise HTTPException(
            status_code=400,
            detail=f"Lesson ID listesi kursun tam lesson setiyle eşleşmiyor. {', '.join(error_msg)}"
        )
    
    # Transaction ile atomik güncelleme
    try:
        for order, lesson_id in enumerate(reorder_request.lesson_ids, start=1):
            lesson = all_lessons[lesson_id]
            lesson.order = order
        
        if current_user.role != UserRole.ADMIN:
            course.status = "pending_review"
            
        await db.commit()
        
        return {
            "message": "Ders sıralaması başarıyla güncellendi",
            "lesson_count": len(reorder_request.lesson_ids),
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Ders sıralaması güncellenirken hata oluştu: {str(e)}"
        )


@router.patch("/{course_id}/lessons/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    course_id: str,
    lesson_id: str,
    lesson_update: LessonUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Ders güncelleme endpoint'i
    
    SECURITY:
    - URL validation (video_url, live_lesson_url için)
    """
    # Kurs kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Lesson kontrolü
    lesson_result = await db.execute(
        select(Lesson).where(
            Lesson.id == lesson_id,
            Lesson.course_id == course_id
        )
    )
    lesson = lesson_result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # Ownership kontrolü
    if current_user.role != UserRole.ADMIN and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu dersi güncelleme yetkiniz yok")
    
    # URL validation (video_url ve live_lesson_url için)
    if lesson_update.video_url is not None:
        from app.services.security_service import validate_url
        try:
            validate_url(
                lesson_update.video_url,
                allowed_schemes=["https"],
                allowed_domains=["youtube.com", "youtu.be", "vimeo.com", "dailymotion.com"]
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Geçersiz video URL: {str(e)}")
    
    if lesson_update.live_lesson_url is not None:
        from app.services.security_service import validate_url
        try:
            validate_url(
                lesson_update.live_lesson_url,
                allowed_schemes=["https"],
                allowed_domains=[
                    "zoom.us", "zoom.com",
                    "meet.google.com",
                    "teams.microsoft.com",
                    "webex.com"
                ]
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Geçersiz canlı ders URL: {str(e)}")
    
    # Güncellenebilir alanları güncelle
    update_data = lesson_update.model_dump(exclude_unset=True)
    
    # EP10-BE-13: content_text sanitization (XSS koruması)
    if "content_text" in update_data:
        try:
            update_data["content_text"] = validate_and_sanitize_content_text(update_data["content_text"])
        except SecurityValidationError as e:
            raise HTTPException(status_code=400, detail=f"İçerik validasyonu başarısız: {str(e)}")
    
    for key, value in update_data.items():
        setattr(lesson, key, value)
    
    if current_user.role != UserRole.ADMIN:
        course.status = "pending_review"
        
    await db.commit()
    await db.refresh(lesson)
    
    # Enrich response
    return await _enrich_lesson_response(lesson, course, current_user, db, storage)


@router.delete("/{course_id}/lessons/{lesson_id}", response_model=dict)
async def delete_lesson(
    course_id: str,
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Ders silme endpoint'i
    
    - İlişkili dosyayı StorageService ile sil
    - İlişkili LessonProgress kayıtlarını cascade sil (SQLAlchemy relationship)
    - İlişkili Quiz kaydını cascade sil (SQLAlchemy relationship)
    - Order reindex: Kalan derslerin order değerlerini normalize et
    """
    # Kurs kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Lesson kontrolü
    lesson_result = await db.execute(
        select(Lesson).where(
            Lesson.id == lesson_id,
            Lesson.course_id == course_id
        )
    )
    lesson = lesson_result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # Ownership kontrolü
    if current_user.role != UserRole.ADMIN and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu dersi silme yetkiniz yok")
    
    # İlişkili dosyayı StorageService ile sil
    if lesson.content_path:
        try:
            await storage.delete(lesson.content_path)
        except StorageNotFoundError:
            pass  # Dosya zaten yok, devam et
    
    # Thumbnail varsa sil
    if lesson.thumbnail_path:
        try:
            await storage.delete(lesson.thumbnail_path)
        except StorageNotFoundError:
            pass
    
    # Live lesson recording varsa sil
    if lesson.live_lesson_recording_path:
        try:
            await storage.delete(lesson.live_lesson_recording_path)
        except StorageNotFoundError:
            pass
    
    # Silinecek lesson'ın order değerini al
    deleted_order = lesson.order
    
    # Lesson'ı sil (cascade ile LessonProgress ve Quiz de silinecek)
    await db.delete(lesson)
    await db.flush()  # Cascade işlemlerini tetikle
    
    # Order reindex: Kalan derslerin order değerlerini normalize et
    remaining_lessons_result = await db.execute(
        select(Lesson)
        .where(Lesson.course_id == course_id)
        .order_by(Lesson.order)
    )
    remaining_lessons = remaining_lessons_result.scalars().all()
    
    # Order değerlerini 1'den başlayarak yeniden sırala
    for new_order, remaining_lesson in enumerate(remaining_lessons, start=1):
        if remaining_lesson.order != new_order:
            remaining_lesson.order = new_order
    
    if current_user.role != UserRole.ADMIN:
        course.status = "pending_review"
        
    await db.commit()
    
    return {
        "message": "Ders başarıyla silindi",
        "deleted_lesson_id": lesson_id,
        "remaining_lessons_count": len(remaining_lessons),
    }


# ============================================================================
# Live Lesson Endpoints (EP10-BE-06)
# ============================================================================

@router.post("/{course_id}/lessons/live", response_model=LessonResponse)
async def create_live_lesson(
    course_id: str,
    live_lesson_in: LiveLessonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Canlı ders oluşturma endpoint'i
    
    CRITICAL SECURITY:
    - URL validation (JavaScript scheme ve phishing domain engeli)
    - Timezone-aware datetime
    """
    # Kurs kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Ownership kontrolü
    if current_user.role != UserRole.ADMIN and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu kursa canlı ders ekleme yetkiniz yok")
    
    # CRITICAL: URL validation
    from app.services.security_service import validate_url
    try:
        validate_url(
            live_lesson_in.live_lesson_url,
            allowed_schemes=["https"],
            allowed_domains=[
                "zoom.us", "zoom.com",
                "meet.google.com",
                "teams.microsoft.com",
                "webex.com"
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Geçersiz canlı ders URL: {str(e)}")
    
    # En son dersin order değerini al
    last_lesson_result = await db.execute(
        select(Lesson)
        .where(Lesson.course_id == course_id)
        .order_by(Lesson.order.desc())
        .limit(1)
    )
    last_lesson = last_lesson_result.scalar_one_or_none()
    next_order = (last_lesson.order + 1) if last_lesson else 1
    
    # Canlı ders oluştur
    lesson = Lesson(
        title=live_lesson_in.title,
        description=live_lesson_in.description,
        lesson_type=LessonType.LIVE_LESSON,
        live_lesson_url=live_lesson_in.live_lesson_url,
        live_lesson_at=live_lesson_in.live_lesson_at,  # Timezone-aware datetime
        is_preview=live_lesson_in.is_preview,
        order=next_order,
        course_id=course_id,
    )
    db.add(lesson)
    await db.flush()  # ID'yi almak için
    
    # Öğrencilere bildirim gönder (opsiyonel)
    if live_lesson_in.notify_students:
        from app.services.notification_service import NotificationService
        notification_service = NotificationService(db)
        
        # Kursa kayıtlı öğrencileri getir
        enrollments_result = await db.execute(
            select(Enrollment).where(Enrollment.course_id == course_id)
        )
        enrollments = enrollments_result.scalars().all()
        student_ids = [enrollment.user_id for enrollment in enrollments]
        
        if student_ids:
            # Timezone-aware datetime'ı formatla
            from datetime import timezone
            if live_lesson_in.live_lesson_at.tzinfo is None:
                # Naive datetime ise UTC olarak kabul et
                live_lesson_at_utc = live_lesson_in.live_lesson_at.replace(tzinfo=timezone.utc)
            else:
                live_lesson_at_utc = live_lesson_in.live_lesson_at.astimezone(timezone.utc)
            
            # Bildirim gönder
            await notification_service.send_notification(
                user_ids=student_ids,
                notification_type=NotificationType.LIVE_LESSON_REMINDER,
                title=f"Yeni Canlı Ders: {live_lesson_in.title}",
                message=(
                    f"{course.title} kursunda yeni bir canlı ders planlandı. "
                    f"Tarih: {live_lesson_at_utc.strftime('%d.%m.%Y %H:%M')} UTC"
                ),
                data={
                    "course_id": course_id,
                    "lesson_id": lesson.id,
                    "live_lesson_at": live_lesson_at_utc.isoformat(),
                    "live_lesson_url": live_lesson_in.live_lesson_url,
                },
                priority=NotificationPriority.HIGH,
                delivery_channels=["in_app", "email"],
                action_url=f"/courses/{course.slug}",
                action_label="Kursa Git",
                sender_id=current_user.id,
            )
    
    await db.commit()
    await db.refresh(lesson)
    
    # Enrich response
    return await _enrich_lesson_response(lesson, course, current_user, db, storage)


@router.patch("/{course_id}/lessons/{lesson_id}/reschedule", response_model=LessonResponse)
async def reschedule_live_lesson(
    course_id: str,
    lesson_id: str,
    reschedule_request: LiveLessonRescheduleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Canlı ders yeniden zamanlama endpoint'i
    
    CRITICAL SECURITY:
    - URL validation
    - Delta notification (değişiklik bildirimi)
    """
    # Kurs ve lesson kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    lesson_result = await db.execute(
        select(Lesson).where(
            Lesson.id == lesson_id,
            Lesson.course_id == course_id,
            Lesson.lesson_type == LessonType.LIVE_LESSON
        )
    )
    lesson = lesson_result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Canlı ders bulunamadı")
    
    # Ownership kontrolü
    if current_user.role != UserRole.ADMIN and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu canlı dersi yeniden zamanlama yetkiniz yok")
    
    # URL validation (eğer güncelleniyorsa)
    if reschedule_request.live_lesson_url:
        from app.services.security_service import validate_url
        try:
            validate_url(
                reschedule_request.live_lesson_url,
                allowed_schemes=["https"],
                allowed_domains=[
                    "zoom.us", "zoom.com",
                    "meet.google.com",
                    "teams.microsoft.com",
                    "webex.com"
                ]
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Geçersiz canlı ders URL: {str(e)}")
    
    # Eski değerleri sakla (notification için)
    old_live_lesson_at = lesson.live_lesson_at
    old_live_lesson_url = lesson.live_lesson_url
    
    # Güncelle
    lesson.live_lesson_at = reschedule_request.live_lesson_at
    if reschedule_request.live_lesson_url:
        lesson.live_lesson_url = reschedule_request.live_lesson_url
    
    await db.flush()
    
    # Delta notification gönder (opsiyonel)
    if reschedule_request.notify_students:
        from app.services.notification_service import NotificationService
        notification_service = NotificationService(db)
        
        # Kursa kayıtlı öğrencileri getir
        enrollments_result = await db.execute(
            select(Enrollment).where(Enrollment.course_id == course_id)
        )
        enrollments = enrollments_result.scalars().all()
        student_ids = [enrollment.user_id for enrollment in enrollments]
        
        if student_ids:
            # Timezone-aware datetime formatla
            from datetime import timezone
            if reschedule_request.live_lesson_at.tzinfo is None:
                new_live_lesson_at_utc = reschedule_request.live_lesson_at.replace(tzinfo=timezone.utc)
            else:
                new_live_lesson_at_utc = reschedule_request.live_lesson_at.astimezone(timezone.utc)
            
            # Değişiklik mesajı oluştur
            changes = []
            if old_live_lesson_at != reschedule_request.live_lesson_at:
                if old_live_lesson_at:
                    from datetime import timezone as tz
                    if old_live_lesson_at.tzinfo is None:
                        old_utc = old_live_lesson_at.replace(tzinfo=tz.utc)
                    else:
                        old_utc = old_live_lesson_at.astimezone(tz.utc)
                    changes.append(f"Tarih: {old_utc.strftime('%d.%m.%Y %H:%M')} → {new_live_lesson_at_utc.strftime('%d.%m.%Y %H:%M')} UTC")
                else:
                    changes.append(f"Yeni tarih: {new_live_lesson_at_utc.strftime('%d.%m.%Y %H:%M')} UTC")
            
            if reschedule_request.live_lesson_url and old_live_lesson_url != reschedule_request.live_lesson_url:
                changes.append("URL güncellendi")
            
            message = f"{course.title} kursundaki canlı ders yeniden zamanlandı."
            if changes:
                message += " " + " | ".join(changes)
            
            await notification_service.send_notification(
                user_ids=student_ids,
                notification_type=NotificationType.LIVE_LESSON_REMINDER,
                title=f"Canlı Ders Yeniden Zamanlandı: {lesson.title}",
                message=message,
                data={
                    "course_id": course_id,
                    "lesson_id": lesson.id,
                    "live_lesson_at": new_live_lesson_at_utc.isoformat(),
                    "live_lesson_url": lesson.live_lesson_url,
                },
                priority=NotificationPriority.HIGH,
                delivery_channels=["in_app", "email"],
                action_url=f"/courses/{course.slug}",
                action_label="Kursa Git",
                sender_id=current_user.id,
            )
    
    await db.commit()
    await db.refresh(lesson)
    
    # Enrich response
    return await _enrich_lesson_response(lesson, course, current_user, db, storage)


@router.post("/{course_id}/lessons/{lesson_id}/cancel", response_model=LessonResponse)
async def cancel_live_lesson(
    course_id: str,
    lesson_id: str,
    notify_students: bool = True,  # Query param
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Canlı ders iptal endpoint'i
    
    - is_live_lesson_ended = True olarak set eder
    - Öğrencilere iptal bildirimi gönderir
    """
    # Kurs ve lesson kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    lesson_result = await db.execute(
        select(Lesson).where(
            Lesson.id == lesson_id,
            Lesson.course_id == course_id,
            Lesson.lesson_type == LessonType.LIVE_LESSON
        )
    )
    lesson = lesson_result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Canlı ders bulunamadı")
    
    # Ownership kontrolü
    if current_user.role != UserRole.ADMIN and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu canlı dersi iptal etme yetkiniz yok")
    
    # İptal et
    lesson.is_live_lesson_ended = True
    
    await db.flush()
    
    # İptal bildirimi gönder (opsiyonel)
    if notify_students:
        from app.services.notification_service import NotificationService
        notification_service = NotificationService(db)
        
        # Kursa kayıtlı öğrencileri getir
        enrollments_result = await db.execute(
            select(Enrollment).where(Enrollment.course_id == course_id)
        )
        enrollments = enrollments_result.scalars().all()
        student_ids = [enrollment.user_id for enrollment in enrollments]
        
        if student_ids:
            await notification_service.send_notification(
                user_ids=student_ids,
                notification_type=NotificationType.LIVE_LESSON_CANCELLED,
                title=f"Canlı Ders İptal Edildi: {lesson.title}",
                message=f"{course.title} kursundaki '{lesson.title}' canlı dersi iptal edildi.",
                data={
                    "course_id": course_id,
                    "lesson_id": lesson.id,
                },
                priority=NotificationPriority.MEDIUM,
                delivery_channels=["in_app", "email"],
                action_url=f"/courses/{course.slug}",
                action_label="Kursa Git",
                sender_id=current_user.id,
            )
    
    await db.commit()
    await db.refresh(lesson)
    
    # Enrich response
    return await _enrich_lesson_response(lesson, course, current_user, db, storage)


@router.patch("/{course_id}/lessons/{lesson_id}/end-live", response_model=LessonResponse)
async def end_live_lesson(
    course_id: str,
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """Canlı dersi sonlandırma (kayıt yüklenmeden de sonlandırılabilir)"""
    # Kurs ve lesson kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    lesson_result = await db.execute(
        select(Lesson).where(
            Lesson.id == lesson_id,
            Lesson.course_id == course_id,
            Lesson.lesson_type == LessonType.LIVE_LESSON
        )
    )
    lesson = lesson_result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Canlı ders bulunamadı")
    
    # Ownership kontrolü
    if current_user.role != UserRole.ADMIN and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu canlı dersi sonlandırma yetkiniz yok")
    
    # Sonlandır
    lesson.is_live_lesson_ended = True
    
    await db.commit()
    await db.refresh(lesson)
    
    # Enrich response
    return await _enrich_lesson_response(lesson, course, current_user, db, storage)


@router.get("/{course_id}/live-lessons", response_model=list[LessonResponse])
async def list_live_lessons(
    course_id: str,
    filter_type: str = "all",  # Query param: "upcoming", "past", "all"
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Kursun canlı derslerini listele
    
    CRITICAL:
    - Timezone-aware datetime filtreleme
    - Erişim kontrolü (enrolled/owner/admin)
    """
    # Kurs kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Erişim kontrolü (public course veya enrolled/owner/admin)
    if course.status != CourseStatus.PUBLISHED:
        if not current_user:
            raise HTTPException(status_code=401, detail="Giriş yapmalısınız")
        
        is_owner = course.teacher_id == current_user.id
        is_admin = current_user.role == UserRole.ADMIN
        
        if not is_owner and not is_admin:
            # Enrollment kontrolü
            enrollment_result = await db.execute(
                select(Enrollment).where(
                    Enrollment.user_id == current_user.id,
                    Enrollment.course_id == course_id
                )
            )
            enrollment = enrollment_result.scalar_one_or_none()
            if not enrollment:
                raise HTTPException(status_code=403, detail="Bu kursun canlı derslerine erişim yetkiniz yok")
    
    # Canlı dersleri getir
    from datetime import datetime, timezone
    now_utc = datetime.now(timezone.utc)
    
    query = select(Lesson).where(
        Lesson.course_id == course_id,
        Lesson.lesson_type == LessonType.LIVE_LESSON
    )
    
    # Timezone-aware filtreleme
    if filter_type == "upcoming":
        query = query.where(Lesson.live_lesson_at > now_utc)
    elif filter_type == "past":
        query = query.where(Lesson.live_lesson_at <= now_utc)
    # "all" için filtre yok
    
    query = query.order_by(Lesson.live_lesson_at.desc())
    
    result = await db.execute(query)
    lessons = result.scalars().all()
    
    # Enrich responses
    enriched_lessons = []
    for lesson in lessons:
        enriched = await _enrich_lesson_response(lesson, course, current_user, db, storage)
        enriched_lessons.append(enriched)
    
    return enriched_lessons


# ============================================================================
# Content Statistics Endpoints (EP10-BE-09)
# ============================================================================

@router.get("/{course_id}/content-stats")
async def get_course_content_stats(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """
    Kurs içerik istatistikleri endpoint'i (EP10-BE-09)
    
    - Toplam ders sayısı, tip dağılımı, toplam dosya boyutu
    - Preview ders sayısı
    - Canlı ders istatistikleri (upcoming/past)
    """
    # Kurs kontrolü
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Ownership veya admin kontrolü
    owner_or_admin = _is_course_owner_or_admin(course, current_user)
    if not owner_or_admin:
        raise HTTPException(status_code=403, detail="Bu kursun içerik istatistiklerine erişim yetkiniz yok")
    
    # Tüm dersleri getir
    lessons_result = await db.execute(
        select(Lesson).where(Lesson.course_id == course_id)
    )
    lessons = lessons_result.scalars().all()
    
    # İstatistikleri hesapla
    total_lessons = len(lessons)
    total_duration_seconds = sum(lesson.duration_seconds or 0 for lesson in lessons)
    total_file_size_bytes = sum(lesson.file_size_bytes or 0 for lesson in lessons)
    
    # Tip bazlı kırılım
    type_breakdown = {
        "video": 0,
        "pdf": 0,
        "document": 0,
        "presentation": 0,
        "live_lesson": 0,
        "quiz": 0,
        "text": 0,
    }
    
    preview_lesson_count = 0
    upcoming_live_lessons = 0
    completed_live_lessons = 0
    
    from datetime import datetime, timezone
    now_utc = datetime.now(timezone.utc)
    
    for lesson in lessons:
        lesson_type_value = lesson.lesson_type.value if hasattr(lesson.lesson_type, 'value') else str(lesson.lesson_type)
        if lesson_type_value in type_breakdown:
            type_breakdown[lesson_type_value] = type_breakdown.get(lesson_type_value, 0) + 1
        
        if lesson.is_preview:
            preview_lesson_count += 1
        
        # Canlı ders istatistikleri
        if lesson.lesson_type == LessonType.LIVE_LESSON:
            if lesson.live_lesson_at:
                if lesson.live_lesson_at > now_utc:
                    upcoming_live_lessons += 1
                else:
                    completed_live_lessons += 1
    
    return {
        "total_lessons": total_lessons,
        "total_duration_seconds": total_duration_seconds,
        "total_file_size_bytes": total_file_size_bytes,
        "total_file_size_mb": round(total_file_size_bytes / (1024 * 1024), 2),
        "type_breakdown": type_breakdown,
        "has_preview_lessons": preview_lesson_count > 0,
        "preview_lesson_count": preview_lesson_count,
        "upcoming_live_lessons": upcoming_live_lessons,
        "completed_live_lessons": completed_live_lessons,
    }


@router.get("/admin/pending", response_model=list[CourseResponse])
async def list_pending_courses(
    skip: int = 0,
    limit: int = 50,
    teacher_id: str | None = None,
    created_from: str | None = None,  # ISO format date string
    created_to: str | None = None,  # ISO format date string
    q: str | None = None,  # Search by course title
    sort_by: str = "created_at",  # created_at, teacher_name
    sort_order: str = "desc",  # asc, desc
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Bekleyen onay kurslarını listele (Admin)
    - Sadece admin çağırabilir
    - Status: PENDING_REVIEW olan kursları döner
    - Filtreler: teacher_id, created_from, created_to, q (search)
    - Sıralama: sort_by (created_at, teacher_name), sort_order (asc, desc)
    """
    from datetime import datetime
    from sqlalchemy import or_, func
    
    # Base query
    # Enum'u value property ile kullan (PostgreSQL enum case sensitivity için)
    query = select(Course).options(
        selectinload(Course.lessons),
        selectinload(Course.teacher),
        selectinload(Course.categories)
    ).where(Course.status == "pending_review")
    
    # Filtreler
    if teacher_id:
        query = query.where(Course.teacher_id == teacher_id)
    
    if created_from:
        try:
            from_date = datetime.fromisoformat(created_from.replace('Z', '+00:00'))
            query = query.where(Course.created_at >= from_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Geçersiz created_from formatı. ISO format kullanın (örn: 2024-01-01T00:00:00Z)")
    
    if created_to:
        try:
            to_date = datetime.fromisoformat(created_to.replace('Z', '+00:00'))
            query = query.where(Course.created_at <= to_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Geçersiz created_to formatı. ISO format kullanın (örn: 2024-01-01T00:00:00Z)")
    
    if q:
        query = query.where(Course.title.ilike(f"%{q}%"))
    
    # Sıralama
    if sort_by == "teacher_name":
        # Teacher name'e göre sıralama için join gerekli
        query = query.join(User, Course.teacher_id == User.id)
        if sort_order.lower() == "asc":
            query = query.order_by(User.full_name.asc())
        else:
            query = query.order_by(User.full_name.desc())
    else:  # default: created_at
        if sort_order.lower() == "asc":
            query = query.order_by(Course.created_at.asc())
        else:
            query = query.order_by(Course.created_at.desc())
    
    # Pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{course_id}/submit-for-review")
async def submit_course_for_review(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Kursu onaya gönder (Öğretmen)
    - Sadece kurs sahibi (öğretmen) çağırabilir
    - Kurs DRAFT durumunda olmalı
    - Minimum yayınlanabilir kriterler kontrol edilir
    - Status: DRAFT → PENDING_REVIEW
    """
    # Kursu yükle
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.categories)
        )
        .where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Sadece kurs sahibi çağırabilir (admin değil, sadece öğretmen)
    # String karşılaştırması için str() kullan
    if str(course.teacher_id) != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Bu kursu onaya gönderme yetkiniz yok. Sadece kurs sahibi onaya gönderebilir."
        )
    
    # Öğretmen rolü kontrolü
    if current_user.role not in [UserRole.TEACHER, UserRole.ORGANIZATION]:
        raise HTTPException(
            status_code=403,
            detail="Sadece öğretmenler kurs onaya gönderebilir"
        )
    
    # Status kontrolü: Sadece DRAFT veya REJECTED durumundaki kurslar onaya gönderilebilir
    if course.status not in ["draft", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_STATUS",
                "message": f"Kurs onaya gönderilemez. Mevcut durum: {course.status}. Sadece 'draft' veya 'rejected' durumundaki kurslar onaya gönderilebilir."
            }
        )
    
    # Minimum yayınlanabilir kriterler kontrolü
    validation_errors = []
    
    if not course.title or len(course.title.strip()) < 3:
        validation_errors.append("Kurs başlığı en az 3 karakter olmalıdır")
    
    if not course.description or len(course.description.strip()) < 50:
        validation_errors.append("Kurs açıklaması en az 50 karakter olmalıdır")
    
    # En az 1 ders kontrolü
    if not course.lessons or len(course.lessons) == 0:
        validation_errors.append("Kurs en az 1 ders içermelidir")
    
    # Fiyat kontrolü (ücretsiz kurslar için 0 olabilir, ama fiyat alanı dolu olmalı)
    if course.price is None:
        validation_errors.append("Kurs fiyatı belirtilmelidir")
    
    # Kategori kontrolü (en az 1 kategori)
    if not course.categories or len(course.categories) == 0:
        validation_errors.append("Kurs en az 1 kategoriye atanmalıdır")
    
    if validation_errors:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "VALIDATION_ERROR",
                "message": "Kurs onaya gönderilemez. Eksik alanlar:",
                "errors": validation_errors
            }
        )
    
    # Status geçişi: DRAFT/REJECTED → PENDING_REVIEW
    old_status = course.status
    course.status = "pending_review"
    
    # Logging
    logging.info(
        f"Course {course_id} status changed: {old_status} -> pending_review "
        f"by teacher {current_user.id}"
    )
    
    # ReviewHistory kaydı oluştur
    # CourseReviewHistory modelinde artık string kullanıyoruz (enum değil)
    review_history = CourseReviewHistory(
        course_id=course.id,
        actor_id=current_user.id,
        old_status=old_status,  # Direkt string
        new_status="pending_review",  # Direkt string
        action_type="submit_for_review" if old_status == "draft" else "resubmit",  # Direkt string
        note=None,
    )
    db.add(review_history)
    
    try:
        await db.commit()
        await db.refresh(course)
        
        # Logging - başarılı
        logging.info(f"Course {course_id} successfully submitted for review by {current_user.id}")
        
        # Bildirim gönder (APP-BE-07) - Öğretmene onay gönderildi bilgisi
        try:
            notification_service = NotificationService(db)
            notification_type = NotificationType.COURSE_SUBMITTED if old_status == "draft" else NotificationType.COURSE_RESUBMITTED
            await notification_service.send_notification(
                user_ids=[course.teacher_id],
                sender_id=current_user.id,
                notification_type=notification_type,
                title=f"Kursunuz Onaya Gönderildi: {course.title}",
                message=f"'{course.title}' adlı kursunuz onay için gönderildi. Admin incelemesi tamamlandığında bilgilendirileceksiniz.",
                priority=NotificationPriority.MEDIUM,
                action_url=f"/dashboard/my-courses/{course.id}",
                action_label="Kursu Görüntüle",
                data={
                    "course_id": course.id,
                    "course_title": course.title,
                    "course_slug": course.slug,
                    "status": "pending_review",
                    "is_resubmission": old_status == "rejected",
                }
            )
            await db.commit()
        except Exception as notif_error:
            # Bildirim hatası kritik değil, sadece logla
            logging.error(f"Bildirim gönderilirken hata: {str(notif_error)}", exc_info=True)
            # Bildirim hatası olsa bile kurs onaya gönderilmiş sayılır
    except Exception as e:
        await db.rollback()
        # Gerçek hatayı logla ve kullanıcıya göster
        error_message = str(e)
        error_type = type(e).__name__
        logging.error(f"Kurs onaya gönderilirken hata: {error_type}: {error_message}", exc_info=True)
        
        raise HTTPException(
            status_code=500,
            detail={
                "code": "SUBMIT_ERROR",
                "message": f"Kurs onaya gönderilirken bir hata oluştu: {error_type}",
                "error": error_message,
                "details": str(e) if hasattr(e, '__cause__') and e.__cause__ else None
            }
        ) from e
    
    return {
        "message": "Kurs başarıyla onaya gönderildi",
        "course_id": course.id,
        "status": course.status,
        "submitted_at": review_history.created_at.isoformat()
    }


@router.post("/{course_id}/approve")
async def approve_course(
    course_id: str,
    request: CourseApproveRequest | None = None,
    note: str | None = None,  # Backward compatibility - query parameter
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Kursu onayla (Admin)
    - Sadece admin çağırabilir
    - Kurs PENDING_REVIEW durumunda olmalı
    - Status: PENDING_REVIEW → PUBLISHED
    - published_at timestamp set edilir
    """
    from datetime import datetime
    
    # Backward compatibility: note query parametresi varsa kullan, yoksa request body'den al
    admin_note = note if note is not None else (request.note if request else None)
    
    # Logging
    logging.info(f"Course {course_id} approval attempt by admin {current_user.id}")
    
    # Kursu yükle
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories)
        )
        .where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Race condition önleme: Status kontrolü
    if course.status != "pending_review":
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_STATUS",
                "message": f"Kurs onaylanamaz. Mevcut durum: {course.status}. Sadece 'pending_review' durumundaki kurslar onaylanabilir."
            }
        )
    
    # Status geçişi: PENDING_REVIEW → PUBLISHED
    old_status = course.status
    course.status = "published"
    course.published_at = datetime.utcnow()
    
    # Logging
    logging.info(
        f"Course {course_id} status changed: {old_status} -> published "
        f"by admin {current_user.id}"
    )
    
    # ReviewHistory kaydı oluştur
    # CourseReviewHistory modelinde artık string kullanıyoruz (enum değil)
    review_history = CourseReviewHistory(
        course_id=course.id,
        actor_id=current_user.id,
        old_status=old_status,  # Direkt string
        new_status="published",  # Direkt string
        action_type="approve",  # Direkt string
        note=admin_note,
    )
    db.add(review_history)
    
    try:
        await db.commit()
        await db.refresh(course)
        
        # Logging - başarılı
        logging.info(
            f"Course {course_id} successfully approved by admin {current_user.id}. "
            f"Status: {old_status} -> published"
        )
        
        # Bildirim gönder (APP-BE-07) - Non-blocking
        try:
            notification_service = NotificationService(db)
            await notification_service.send_notification(
                user_ids=[course.teacher_id],
                sender_id=current_user.id,
                notification_type=NotificationType.COURSE_APPROVED,
                title=f"Kursunuz Onaylandı: {course.title}",
                message=f"'{course.title}' adlı kursunuz admin tarafından onaylandı ve yayınlandı.{" Admin notu: " + admin_note if admin_note else ""}",
                priority=NotificationPriority.MEDIUM,
                action_url=f"/dashboard/my-courses/{course.id}",
                action_label="Kursu Görüntüle",
                data={
                    "course_id": course.id,
                    "course_title": course.title,
                    "course_slug": course.slug,
                    "status": "published",
                    "admin_note": admin_note,
                }
            )
            await db.commit()
        except Exception as notif_error:
            # Bildirim hatası kritik değil, sadece logla
            logging.error(f"Bildirim gönderilirken hata: {str(notif_error)}", exc_info=True)
            # Bildirim hatası olsa bile kurs onaylanmış sayılır
    except Exception as e:
        await db.rollback()
        # Detaylı error mesajı (submit_course_for_review ile tutarlı)
        error_message = str(e)
        error_type = type(e).__name__
        logging.error(f"Kurs onaylanırken hata: {error_type}: {error_message}", exc_info=True)
        
        raise HTTPException(
            status_code=500,
            detail={
                "code": "APPROVE_ERROR",
                "message": f"Kurs onaylanırken bir hata oluştu: {error_type}",
                "error": error_message,
                "details": str(e) if hasattr(e, '__cause__') and e.__cause__ else None
            }
        ) from e
    
    return {
        "message": "Kurs başarıyla onaylandı ve yayınlandı",
        "course_id": course.id,
        "status": course.status,
        "published_at": course.published_at.isoformat() if course.published_at else None,
        "approved_at": review_history.created_at.isoformat()
    }


@router.post("/{course_id}/reject")
async def reject_course(
    course_id: str,
    request: CourseRejectRequest | None = None,
    note: str | None = None,  # Backward compatibility
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Kursu reddet (Admin)
    - Sadece admin çağırabilir
    - Kurs PENDING_REVIEW durumunda olmalı
    - Status: PENDING_REVIEW → REJECTED
    - note (red sebebi) zorunlu
    """
    # Backward compatibility: note parametresi varsa kullan, yoksa request'ten al
    rejection_note = note if note is not None else (request.note if request else None)
    
    # Logging
    logging.info(f"Course {course_id} rejection attempt by admin {current_user.id}")
    # Kursu yükle
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories)
        )
        .where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Race condition önleme: Status kontrolü
    if course.status != "pending_review":
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_STATUS",
                "message": f"Kurs reddedilemez. Mevcut durum: {course.status}. Sadece 'pending_review' durumundaki kurslar reddedilebilir."
            }
        )
    
    # Note zorunlu kontrolü (Pydantic validation zaten yapıyor ama backward compatibility için)
    if not rejection_note or len(rejection_note.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "NOTE_REQUIRED",
                "message": "Red sebebi (note) zorunludur ve en az 10 karakter olmalıdır."
            }
        )
    
    # Status geçişi: PENDING_REVIEW → REJECTED
    old_status = course.status
    course.status = "rejected"
    
    # Logging
    logging.info(
        f"Course {course_id} status changed: {old_status} -> rejected "
        f"by admin {current_user.id}"
    )
    
    # ReviewHistory kaydı oluştur
    # CourseReviewHistory modelinde artık string kullanıyoruz (enum değil)
    review_history = CourseReviewHistory(
        course_id=course.id,
        actor_id=current_user.id,
        old_status=old_status,  # Direkt string
        new_status="rejected",  # Direkt string
        action_type="reject",  # Direkt string
        note=rejection_note.strip(),
    )
    db.add(review_history)
    
    try:
        await db.commit()
        await db.refresh(course)
        
        # Logging - başarılı
        logging.info(
            f"Course {course_id} successfully rejected by admin {current_user.id}. "
            f"Status: {old_status} -> rejected"
        )
        
        # Bildirim gönder (APP-BE-07) - Non-blocking
        try:
            notification_service = NotificationService(db)
            await notification_service.send_notification(
                user_ids=[course.teacher_id],
                sender_id=current_user.id,
                notification_type=NotificationType.COURSE_REJECTED,
                title=f"Kursunuz Reddedildi: {course.title}",
                message=f"'{course.title}' adlı kursunuz admin tarafından reddedildi. Red sebebi: {rejection_note.strip()}",
                priority=NotificationPriority.HIGH,
                action_url=f"/dashboard/my-courses/{course.id}",
                action_label="Kursu Düzenle",
                data={
                    "course_id": course.id,
                    "course_title": course.title,
                    "course_slug": course.slug,
                    "status": "rejected",
                    "rejection_reason": rejection_note.strip(),
                }
            )
            await db.commit()
        except Exception as notif_error:
            # Bildirim hatası kritik değil, sadece logla
            logging.error(f"Bildirim gönderilirken hata: {str(notif_error)}", exc_info=True)
            # Bildirim hatası olsa bile kurs reddedilmiş sayılır
    except Exception as e:
        await db.rollback()
        # Detaylı error mesajı (submit_course_for_review ile tutarlı)
        error_message = str(e)
        error_type = type(e).__name__
        logging.error(f"Kurs reddedilirken hata: {error_type}: {error_message}", exc_info=True)
        
        raise HTTPException(
            status_code=500,
            detail={
                "code": "REJECT_ERROR",
                "message": f"Kurs reddedilirken bir hata oluştu: {error_type}",
                "error": error_message,
                "details": str(e) if hasattr(e, '__cause__') and e.__cause__ else None
            }
        ) from e
    
    return {
        "message": "Kurs reddedildi",
        "course_id": course.id,
        "status": course.status,
        "rejection_note": note.strip(),
        "rejected_at": review_history.created_at.isoformat()
    }


@router.post("/{course_id}/unarchive")
async def unarchive_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """
    Kursu arşivden çıkar (Admin veya Kurs Sahibi)
    - Admin veya kurs sahibi çağırabilir
    - Kurs ARCHIVED durumunda olmalı
    - Status: ARCHIVED → PUBLISHED
    """
    # Kursu yükle
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories)
        )
        .where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Yetki kontrolü: Admin veya kurs sahibi
    is_admin = current_user.role == UserRole.ADMIN
    is_owner = str(course.teacher_id) == str(current_user.id)
    
    if not is_admin and not is_owner:
        logging.warning(
            f"Unauthorized unarchive attempt: user {current_user.id} "
            f"tried to unarchive course {course_id} (owner: {course.teacher_id})"
        )
        raise HTTPException(
            status_code=403,
            detail={
                "code": "ACCESS_DENIED",
                "message": "Bu kursu arşivden çıkarma yetkiniz yok. Sadece admin veya kurs sahibi bu işlemi yapabilir."
            }
        )
    
    # Race condition önleme: Status kontrolü
    if course.status != "archived":
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_STATUS",
                "message": f"Kurs arşivden çıkarılamaz. Mevcut durum: {course.status}. Sadece 'archived' durumundaki kurslar arşivden çıkarılabilir."
            }
        )
    
    # Status geçişi: ARCHIVED → PUBLISHED
    old_status = course.status
    course.status = "published"
    
    # Logging
    logging.info(
        f"Course {course_id} status changed: {old_status} -> published "
        f"by {'admin' if is_admin else 'teacher'} {current_user.id}"
    )
    
    # ReviewHistory kaydı oluştur
    review_history = CourseReviewHistory(
        course_id=course.id,
        actor_id=current_user.id,
        old_status=old_status,  # Direkt string
        new_status="published",  # Direkt string
        action_type="unarchive",  # Direkt string
        note=f"Kurs arşivden çıkarıldı ({'admin' if is_admin else 'öğretmen'} tarafından)",
    )
    db.add(review_history)
    
    try:
        await db.commit()
        await db.refresh(course)
        
        # Logging - başarılı
        logging.info(
            f"Course {course_id} successfully unarchived by {'admin' if is_admin else 'teacher'} {current_user.id}. "
            f"Status: {old_status} -> published"
        )
        
        # Bildirim gönder (opsiyonel, non-blocking) - Sadece admin tarafından yapıldıysa öğretmene bildir
        if is_admin:
            try:
                notification_service = NotificationService(db)
                await notification_service.send_notification(
                    user_ids=[course.teacher_id],
                    sender_id=current_user.id,
                    notification_type=NotificationType.COURSE_APPROVED,  # Veya yeni bir type: COURSE_UNARCHIVED
                    title=f"Kursunuz Arşivden Çıkarıldı: {course.title}",
                    message=f"'{course.title}' adlı kursunuz admin tarafından arşivden çıkarıldı ve tekrar yayınlandı.",
                    priority=NotificationPriority.MEDIUM,
                    action_url=f"/dashboard/my-courses/{course.id}",
                    action_label="Kursu Görüntüle",
                    data={
                        "course_id": course.id,
                        "course_title": course.title,
                        "course_slug": course.slug,
                        "status": "published",
                    }
                )
                await db.commit()
            except Exception as notif_error:
                # Bildirim hatası kritik değil, sadece logla
                logging.error(f"Bildirim gönderilirken hata: {str(notif_error)}", exc_info=True)
    except Exception as e:
        await db.rollback()
        # Detaylı error mesajı
        error_message = str(e)
        error_type = type(e).__name__
        logging.error(f"Kurs arşivden çıkarılırken hata: {error_type}: {error_message}", exc_info=True)
        
        raise HTTPException(
            status_code=500,
            detail={
                "code": "UNARCHIVE_ERROR",
                "message": f"Kurs arşivden çıkarılırken bir hata oluştu: {error_type}",
                "error": error_message,
                "details": str(e) if hasattr(e, '__cause__') and e.__cause__ else None
            }
        ) from e
    
    return {
        "message": "Kurs başarıyla arşivden çıkarıldı ve yayınlandı",
        "course_id": course.id,
        "status": course.status,
        "unarchived_at": review_history.created_at.isoformat()
    }


@router.get("/{course_id}/review-history")
async def get_course_review_history(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Kurs moderasyon geçmişini getir (Admin)
    - Sadece admin çağırabilir
    - CourseReviewHistory kayıtlarını döner
    """
    from app.models.user import User as UserModel
    
    # Kursun var olup olmadığını kontrol et
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Review history kayıtlarını getir
    result = await db.execute(
        select(CourseReviewHistory)
        .options(selectinload(CourseReviewHistory.actor))
        .where(CourseReviewHistory.course_id == course_id)
        .order_by(CourseReviewHistory.created_at.desc())
    )
    history_records = result.scalars().all()
    
    # Response formatı
    history_list = []
    for record in history_records:
        history_list.append({
            "id": record.id,
            "course_id": record.course_id,
            "actor_id": record.actor_id,
            "actor_name": record.actor.full_name if record.actor else "Sistem",
            "old_status": record.old_status,  # Artık string
            "new_status": record.new_status,  # Artık string
            "action_type": record.action_type,  # Artık string
            "note": record.note,
            "changes_json": record.changes_json,
            "created_at": record.created_at.isoformat(),
        })
    
    return history_list
