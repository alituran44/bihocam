from fastapi import APIRouter, Depends, HTTPException, status
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
            )
        )
    return items


@router.get("/{teacher_id}", response_model=TeacherProfileResponse)
async def get_teacher_profile(
    teacher_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Public: öğretmen profili + yayınlanmış kursları."""
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
            bio=teacher.bio,
            expertise_tags=teacher.expertise_tags or [],
            social_links=social_links.model_dump() if social_links else None,
            avatar_url=teacher.avatar_url,
        ),
        courses=[CourseResponse.model_validate(c) for c in courses],
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
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


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
        is_active=teacher.is_active,
        is_verified=teacher.is_verified,
        created_at=teacher.created_at,
        updated_at=teacher.updated_at,
    )
