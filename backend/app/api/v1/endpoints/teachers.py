from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy import select, func as sql_func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.course import Course, CourseStatus
from app.schemas.teacher import TeacherListItem, TeacherProfileResponse
from app.schemas.course import TeacherInfo, CourseResponse
from app.schemas.teacher_profile import TeacherProfileUpdate, TeacherProfileResponse as TeacherProfileDetailResponse

# Live Class and Library Models/Schemas
from app.models.live_class import TeacherAvailability, LiveClassReservation
from app.schemas.live_class import (
    TeacherAvailabilityResponse,
    LiveClassReservationResponse,
    LiveClassReservationCreate,
    TeacherAvailabilityBatchCreate,
)
from app.models.library import TeacherLibraryItem
from app.schemas.library import TeacherLibraryItemCreate, TeacherLibraryItemResponse
from app.services.storage_service import StorageBackend, get_storage
from app.core.config import settings


router = APIRouter()
admin_router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Sadece admin erişebilir"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    return current_user


@router.get("", response_model=list[TeacherListItem])
@router.get("/", response_model=list[TeacherListItem])
async def list_teachers(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Public: aktif öğretmenleri listele."""
    result = await db.execute(
        select(User)
        .where(User.role == UserRole.TEACHER, User.is_active == True)  # noqa: E712
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    teachers = result.scalars().all()

    items: list[TeacherListItem] = []
    for t in teachers:
        count_result = await db.execute(
            select(sql_func.count(Course.id)).where(
                Course.teacher_id == t.id,
                Course.status == CourseStatus.PUBLISHED,
            )
        )
        courses_count = int(count_result.scalar() or 0)
        items.append(
            TeacherListItem(
                id=t.id,
                full_name=t.full_name,
                email=t.email,
                courses_count=courses_count,
                avatar_url=t.avatar_url,
                bio=t.bio,
                expertise_tags=t.expertise_tags or [],
                live_class_price=t.live_class_price,
                live_class_discount_price=t.live_class_discount_price,
                created_at=t.created_at,
            )
        )
    return items


@router.get("/my-bookings", response_model=list[LiveClassReservationResponse])
async def get_student_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Student/Authenticated: Bir öğrenci kendi aldığı tüm canlı ders rezervasyonlarını listeler."""
    from app.models.live_class import LiveClassReservation
    result = await db.execute(
        select(LiveClassReservation)
        .options(
            selectinload(LiveClassReservation.teacher),
            selectinload(LiveClassReservation.student)
        )
        .where(LiveClassReservation.student_id == current_user.id)
        .order_by(LiveClassReservation.date.desc(), LiveClassReservation.start_time.desc())
    )
    return result.scalars().all()


@router.get("/{teacher_id}", response_model=TeacherProfileResponse)
async def get_teacher_profile(
    teacher_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Public: öğretmen profili + yayınlanmış kursları + kurs yorumları."""
    result = await db.execute(
        select(User).where(User.id == teacher_id, User.role == UserRole.TEACHER)
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Öğretmen bulunamadı")

    courses_result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.lessons),
            selectinload(Course.teacher),
            selectinload(Course.categories),
        )
        .where(Course.teacher_id == teacher_id, Course.status == CourseStatus.PUBLISHED)
        .order_by(Course.created_at.desc())
    )
    courses = courses_result.scalars().all()

    # Kurs yorumlarını çek
    from app.models.course_review import CourseReview
    reviews_result = await db.execute(
        select(CourseReview)
        .options(selectinload(CourseReview.user))
        .join(Course, Course.id == CourseReview.course_id)
        .where(
            Course.teacher_id == teacher_id,
            CourseReview.is_approved == True
        )
        .order_by(CourseReview.created_at.desc())
    )
    reviews = reviews_result.scalars().all()

    from app.schemas.course_review import CourseReviewResponse
    formatted_reviews = []
    for r in reviews:
        user_info = None
        if r.user:
            user_info = {
                "id": r.user.id,
                "full_name": r.user.full_name,
                "email": r.user.email,
                "avatar_url": r.user.avatar_url
            }
        formatted_reviews.append(
            CourseReviewResponse(
                id=r.id,
                user_id=r.user_id,
                course_id=r.course_id,
                enrollment_id=r.enrollment_id,
                rating=r.rating,
                title=r.title,
                comment=r.comment,
                is_approved=r.is_approved,
                is_helpful_count=r.is_helpful_count,
                approved_at=r.approved_at,
                approved_by_admin_id=r.approved_by_admin_id,
                moderation_note=r.moderation_note,
                teacher_reply=r.teacher_reply,
                teacher_reply_at=r.teacher_reply_at,
                created_at=r.created_at,
                updated_at=r.updated_at,
                user=user_info
            )
        )

    # Social links'i dict'ten SocialLinks objesine çevir
    social_links = None
    if teacher.social_links:
        from app.schemas.teacher_profile import SocialLinks
        social_links = SocialLinks(**teacher.social_links)
    
    return TeacherProfileResponse(
        teacher=TeacherInfo(
            id=teacher.id,
            full_name=teacher.full_name,
            email=teacher.email,
            phone=teacher.phone,
            bio=teacher.bio,
            expertise_tags=teacher.expertise_tags or [],
            social_links=social_links.model_dump() if social_links else None,
            avatar_url=teacher.avatar_url,
            live_class_price=teacher.live_class_price,
            live_class_discount_price=teacher.live_class_discount_price,
            live_class_link=teacher.live_class_link,
            promo_images=teacher.promo_images,
            promo_video=teacher.promo_video,
        ),
        courses=[CourseResponse.model_validate(c) for c in courses],
        reviews=formatted_reviews,
    )


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Sadece öğretmen veya admin erişebilir"""
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için öğretmen veya admin yetkisi gerekli"
        )
    return current_user


@router.get("/me/profile", response_model=TeacherProfileDetailResponse)
async def get_my_profile(
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen kendi profilini görüntüler"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu endpoint sadece öğretmenler için"
        )
    
    # Social links'i dict'ten SocialLinks objesine çevir
    social_links = None
    if current_user.social_links:
        from app.schemas.teacher_profile import SocialLinks
        social_links = SocialLinks(**current_user.social_links)
    
    return TeacherProfileDetailResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        bio=current_user.bio,
        expertise_tags=current_user.expertise_tags or [],
        social_links=social_links,
        avatar_url=current_user.avatar_url,
        promo_images=current_user.promo_images,
        promo_video=current_user.promo_video,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.put("/me/profile", response_model=TeacherProfileDetailResponse)
async def update_my_profile(
    profile_update: TeacherProfileUpdate,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Öğretmen kendi profilini günceller"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu endpoint sadece öğretmenler için"
        )
    
    update_data = profile_update.model_dump(exclude_unset=True)
    
    # Social links'i dict'e çevir
    if "social_links" in update_data and update_data["social_links"]:
        update_data["social_links"] = update_data["social_links"].model_dump(exclude_unset=True)
        # None değerleri temizle
        update_data["social_links"] = {k: v for k, v in update_data["social_links"].items() if v is not None}
        if not update_data["social_links"]:
            update_data["social_links"] = None
    
    # Bio için XSS sanitization (schema'da zaten yapılıyor ama ekstra güvenlik)
    if "bio" in update_data and update_data["bio"]:
        from app.utils.validation import sanitize_html
        update_data["bio"] = sanitize_html(update_data["bio"])
    
    # Güncelleme
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    try:
        await db.commit()
        await db.refresh(current_user)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profil güncellenirken bir hata oluştu: {str(e)}"
        )
    
    # Response için social links'i dönüştür
    social_links = None
    if current_user.social_links:
        from app.schemas.teacher_profile import SocialLinks
        social_links = SocialLinks(**current_user.social_links)
    
    return TeacherProfileDetailResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        bio=current_user.bio,
        expertise_tags=current_user.expertise_tags or [],
        social_links=social_links,
        avatar_url=current_user.avatar_url,
        promo_images=current_user.promo_images,
        promo_video=current_user.promo_video,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.get("/me/availability", response_model=list[TeacherAvailabilityResponse])
async def get_my_availability(
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Teacher: Kendi oluşturduğum tüm müsaitlik slotlarını getiririm."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Bu işlem sadece öğretmenler için geçerlidir")
        
    result = await db.execute(
        select(TeacherAvailability)
        .where(TeacherAvailability.teacher_id == current_user.id)
        .order_by(TeacherAvailability.date.asc(), TeacherAvailability.start_time.asc())
    )
    return result.scalars().all()


@router.post("/me/availability", response_model=list[TeacherAvailabilityResponse])
async def create_my_availability(
    payload: TeacherAvailabilityBatchCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Teacher: Toplu şekilde yeni müsaitlik slotları eklerim."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Bu işlem sadece öğretmenler için geçerlidir")
        
    new_slots = []
    for slot_data in payload.slots:
        exist_result = await db.execute(
            select(TeacherAvailability).where(
                TeacherAvailability.teacher_id == current_user.id,
                TeacherAvailability.date == slot_data.date,
                TeacherAvailability.start_time == slot_data.start_time,
                TeacherAvailability.end_time == slot_data.end_time
            )
        )
        if exist_result.scalar_one_or_none():
            continue
            
        slot = TeacherAvailability(
            teacher_id=current_user.id,
            date=slot_data.date,
            start_time=slot_data.start_time,
            end_time=slot_data.end_time,
            is_booked=False
        )
        db.add(slot)
        new_slots.append(slot)
        
    try:
        await db.commit()
        for s in new_slots:
            await db.refresh(s)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Müsaitlik slotları kaydedilirken hata oluştu: {str(e)}")
        
    result = await db.execute(
        select(TeacherAvailability)
        .where(TeacherAvailability.teacher_id == current_user.id)
        .order_by(TeacherAvailability.date.asc(), TeacherAvailability.start_time.asc())
    )
    return result.scalars().all()


@router.delete("/me/availability/{slot_id}")
async def delete_my_availability(
    slot_id: str,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Teacher: Henüz rezerve edilmemiş bir müsaitlik slotumu silerim."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Bu işlem sadece öğretmenler için geçerlidir")
        
    result = await db.execute(
        select(TeacherAvailability).where(
            TeacherAvailability.id == slot_id,
            TeacherAvailability.teacher_id == current_user.id
        )
    )
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot bulunamadı")
        
    if slot.is_booked:
        raise HTTPException(status_code=400, detail="Rezerve edilmiş bir slot silinemez")
        
    await db.delete(slot)
    await db.commit()
    return {"message": "Müsaitlik slotu başarıyla silindi"}


# ========== LIVE CLASS SCHEDULING & RESERVATION ENDPOINTS ==========

@router.get("/{teacher_id}/availability", response_model=list[TeacherAvailabilityResponse])
async def get_teacher_availability_public(
    teacher_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Public: Bir öğretmenin henüz rezerve edilmemiş boş slotlarını getirir."""
    from datetime import date
    today_str = date.today().strftime("%Y-%m-%d")
    
    result = await db.execute(
        select(TeacherAvailability)
        .where(
            TeacherAvailability.teacher_id == teacher_id,
            TeacherAvailability.is_booked == False
        )
        .order_by(TeacherAvailability.date.asc(), TeacherAvailability.start_time.asc())
    )
    return result.scalars().all()


@router.post("/{teacher_id}/book-live-class", response_model=LiveClassReservationResponse)
async def book_live_class(
    teacher_id: str,
    payload: LiveClassReservationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Authenticated: Öğrenci seçtiği boş slot için canlı ders rezervasyon talebi gönderir."""
    slot_result = await db.execute(
        select(TeacherAvailability).where(
            TeacherAvailability.id == payload.availability_id,
            TeacherAvailability.teacher_id == teacher_id,
            TeacherAvailability.is_booked == False
        )
    )
    slot = slot_result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=400, detail="Seçilen canlı ders slotu uygun değil veya daha önce rezerve edilmiş")
        
    teacher_result = await db.execute(
        select(User).where(User.id == teacher_id, User.role == UserRole.TEACHER)
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Öğretmen bulunamadı")

    price = teacher.live_class_price or 0.0
    discount_price = teacher.live_class_discount_price
    
    slot.is_booked = True
    
    reservation = LiveClassReservation(
        teacher_id=teacher_id,
        student_id=current_user.id,
        availability_id=slot.id,
        date=slot.date,
        start_time=slot.start_time,
        end_time=slot.end_time,
        price=price,
        discount_price=discount_price,
        status="pending",
        student_notes=payload.student_notes
    )
    
    db.add(reservation)
    try:
        await db.commit()
        await db.refresh(reservation)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Rezervasyon oluşturulurken bir hata oluştu: {str(e)}")
        
    res_detail = await db.execute(
        select(LiveClassReservation)
        .options(
            selectinload(LiveClassReservation.teacher),
            selectinload(LiveClassReservation.student)
        )
        .where(LiveClassReservation.id == reservation.id)
    )
    return res_detail.scalar_one()





@router.get("/me/reservations", response_model=list[LiveClassReservationResponse])
async def get_teacher_reservations(
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Teacher: Bana gelen tüm canlı ders rezervasyonlarını listelerim."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Bu işlem sadece öğretmenler için geçerlidir")
        
    result = await db.execute(
        select(LiveClassReservation)
        .options(
            selectinload(LiveClassReservation.teacher),
            selectinload(LiveClassReservation.student)
        )
        .where(LiveClassReservation.teacher_id == current_user.id)
        .order_by(LiveClassReservation.date.desc(), LiveClassReservation.start_time.desc())
    )
    return result.scalars().all()


@router.put("/me/reservations/{reservation_id}/status", response_model=LiveClassReservationResponse)
async def update_reservation_status(
    reservation_id: str,
    status: str,  # approved, rejected, cancelled
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Teacher: Gelen bir rezervasyonun durumunu günceller."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Bu işlem sadece öğretmenler için geçerlidir")
        
    result = await db.execute(
        select(LiveClassReservation)
        .where(
            LiveClassReservation.id == reservation_id,
            LiveClassReservation.teacher_id == current_user.id
        )
    )
    reservation = result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı")
        
    if status not in ["approved", "rejected", "cancelled"]:
        raise HTTPException(status_code=400, detail="Geçersiz durum değeri")
        
    reservation.status = status
    
    if status == "approved":
        reservation.meeting_link = current_user.live_class_link
    elif status in ["rejected", "cancelled"]:
        if reservation.availability_id:
            slot_res = await db.execute(
                select(TeacherAvailability).where(TeacherAvailability.id == reservation.availability_id)
            )
            slot = slot_res.scalar_one_or_none()
            if slot:
                slot.is_booked = False
                
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Durum güncellenirken hata oluştu: {str(e)}")
        
    res_detail = await db.execute(
        select(LiveClassReservation)
        .options(
            selectinload(LiveClassReservation.teacher),
            selectinload(LiveClassReservation.student)
        )
        .where(LiveClassReservation.id == reservation.id)
    )
    return res_detail.scalar_one()



# ========== ADMIN ENDPOINTS ==========

@admin_router.get("/{teacher_id}/profile", response_model=TeacherProfileDetailResponse)
async def get_teacher_profile_admin(
    teacher_id: str,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin belirli bir öğretmenin profilini görüntüler"""
    result = await db.execute(
        select(User).where(User.id == teacher_id, User.role == UserRole.TEACHER)
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Öğretmen bulunamadı")
    
    # Social links'i dict'ten SocialLinks objesine çevir
    social_links = None
    if teacher.social_links:
        from app.schemas.teacher_profile import SocialLinks
        social_links = SocialLinks(**teacher.social_links)
    
    return TeacherProfileDetailResponse(
        id=teacher.id,
        full_name=teacher.full_name,
        email=teacher.email,
        phone=teacher.phone,
        bio=teacher.bio,
        expertise_tags=teacher.expertise_tags or [],
        social_links=social_links,
        avatar_url=teacher.avatar_url,
        promo_images=teacher.promo_images,
        promo_video=teacher.promo_video,
        is_active=teacher.is_active,
        is_verified=teacher.is_verified,
        created_at=teacher.created_at,
        updated_at=teacher.updated_at,
    )


@admin_router.put("/{teacher_id}/profile", response_model=TeacherProfileDetailResponse)
async def update_teacher_profile_admin(
    teacher_id: str,
    profile_update: TeacherProfileUpdate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin belirli bir öğretmenin profilini günceller"""
    result = await db.execute(
        select(User).where(User.id == teacher_id, User.role == UserRole.TEACHER)
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Öğretmen bulunamadı")
    
    update_data = profile_update.model_dump(exclude_unset=True)
    
    # Social links'i dict'e çevir
    if "social_links" in update_data and update_data["social_links"]:
        update_data["social_links"] = update_data["social_links"].model_dump(exclude_unset=True)
        # None değerleri temizle
        update_data["social_links"] = {k: v for k, v in update_data["social_links"].items() if v is not None}
        if not update_data["social_links"]:
            update_data["social_links"] = None
    
    # Bio için XSS sanitization (schema'da zaten yapılıyor ama ekstra güvenlik)
    if "bio" in update_data and update_data["bio"]:
        from app.utils.validation import sanitize_html
        update_data["bio"] = sanitize_html(update_data["bio"])
    
    # Güncelleme
    for field, value in update_data.items():
        setattr(teacher, field, value)
    
    try:
        await db.commit()
        await db.refresh(teacher)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profil güncellenirken bir hata oluştu: {str(e)}"
        )
    
    # Response için social links'i dönüştür
    social_links = None
    if teacher.social_links:
        from app.schemas.teacher_profile import SocialLinks
        social_links = SocialLinks(**teacher.social_links)
    
    return TeacherProfileDetailResponse(
        id=teacher.id,
        full_name=teacher.full_name,
        email=teacher.email,
        phone=teacher.phone,
        bio=teacher.bio,
        expertise_tags=teacher.expertise_tags or [],
        social_links=social_links,
        avatar_url=teacher.avatar_url,
        promo_images=teacher.promo_images,
        promo_video=teacher.promo_video,
        is_active=teacher.is_active,
        is_verified=teacher.is_verified,
        created_at=teacher.created_at,
        updated_at=teacher.updated_at,
    )


# ========== TEACHER LIBRARY ENDPOINTS ==========

@router.get("/{teacher_id}/library", response_model=list[TeacherLibraryItemResponse])
async def get_teacher_library_public(
    teacher_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Public: Bir eğitmenin paylaştığı kütüphane öğelerini listeler."""
    result = await db.execute(
        select(TeacherLibraryItem)
        .where(TeacherLibraryItem.teacher_id == teacher_id)
        .order_by(TeacherLibraryItem.created_at.desc())
    )
    return result.scalars().all()


@router.get("/me/library", response_model=list[TeacherLibraryItemResponse])
async def get_my_library(
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Teacher: Kendi kütüphane öğelerimi listelerim."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Bu işlem sadece öğretmenler için geçerlidir")
        
    result = await db.execute(
        select(TeacherLibraryItem)
        .where(TeacherLibraryItem.teacher_id == current_user.id)
        .order_by(TeacherLibraryItem.created_at.desc())
    )
    return result.scalars().all()


@router.post("/me/library", response_model=TeacherLibraryItemResponse)
async def create_library_item(
    payload: TeacherLibraryItemCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Teacher: Yeni bir kütüphane öğesi (video linki, dosya ref vb.) eklerim."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Bu işlem sadece öğretmenler için geçerlidir")
        
    item = TeacherLibraryItem(
        teacher_id=current_user.id,
        title=payload.title,
        description=payload.description,
        item_type=payload.item_type,
        file_path=payload.file_path,
        youtube_url=payload.youtube_url,
    )
    db.add(item)
    try:
        await db.commit()
        await db.refresh(item)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Kütüphane öğesi kaydedilirken hata oluştu: {str(e)}")
        
    return item


@router.post("/me/library/upload")
async def upload_library_file(
    file: UploadFile = File(...),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """Teacher: Kütüphane için dosya veya yerel MP4 video yükler."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Bu işlem sadece öğretmenler için geçerlidir")
        
    from pathlib import Path
    file_ext = Path(file.filename).suffix.lower()
    
    # Valide et
    allowed_doc_exts = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".zip", ".png", ".jpg", ".jpeg"}
    allowed_video_exts = {".mp4", ".webm", ".ogg"}
    
    is_video = file_ext in allowed_video_exts
    is_doc = file_ext in allowed_doc_exts
    
    if not is_video and not is_doc:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz dosya formatı. İzin verilen formatlar: PDF, Word, Excel, PPT, TXT, ZIP, Görsel veya MP4/WebM"
        )
        
    # Dosya içeriğini oku
    file_content = await file.read()
    file_size = len(file_content)
    
    # Maksimum boyut: 100MB video için, 15MB döküman için
    max_size = 100 * 1024 * 1024 if is_video else 15 * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"Dosya boyutu limitleri aşıyor. Maksimum: {max_size / (1024*1024):.0f}MB"
        )
        
    # Dosya ismi oluştur
    from datetime import datetime
    import uuid
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"lib_{current_user.id}_{timestamp}_{unique_id}{file_ext}"
    
    # Destination path
    dest_dir = "library/videos" if is_video else "library/documents"
    destination_path = f"{dest_dir}/{filename}"
    
    # Content type
    content_type = "video/mp4" if is_video else "application/octet-stream"
    if file_ext == ".pdf":
        content_type = "application/pdf"
    elif file_ext in [".png", ".jpg", ".jpeg"]:
        content_type = f"image/{file_ext[1:]}"
        
    # Yükle
    upload_result = await storage.upload(
        file_content=file_content,
        destination_path=destination_path,
        content_type=content_type,
    )
    
    return {
        "message": "Dosya başarıyla yüklendi",
        "file_path": upload_result.storage_key,
        "access_url": upload_result.access_url,
        "file_size": upload_result.file_size,
    }


@router.delete("/me/library/{item_id}")
async def delete_library_item(
    item_id: str,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
    storage: StorageBackend = Depends(get_storage),
):
    """Teacher: Kütüphaneden bir öğeyi siler."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Bu işlem sadece öğretmenler için geçerlidir")
        
    result = await db.execute(
        select(TeacherLibraryItem).where(
            TeacherLibraryItem.id == item_id,
            TeacherLibraryItem.teacher_id == current_user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Kütüphane öğesi bulunamadı")
        
    # Yerel dosya referansı varsa storage'dan da sil
    if item.file_path:
        try:
            await storage.delete(item.file_path)
        except Exception:
            pass  # Dosya bulunamazsa veya silinemezse devam et
            
    await db.delete(item)
    await db.commit()
    return {"message": "Kütüphane öğesi başarıyla silindi"}
