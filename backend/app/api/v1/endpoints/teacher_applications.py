from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.teacher_application import TeacherApplication, TeacherApplicationStatus
from app.schemas.teacher_application import (
    TeacherApplicationCreate,
    TeacherApplicationResponse,
    TeacherApplicationReview,
    TeacherApplicationUpdateDocuments,
)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Sadece admin erişebilir"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    return current_user


@router.post("", response_model=TeacherApplicationResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=TeacherApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    application_in: TeacherApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Kullanıcı eğitmen olmak için başvurur (Harmanlanmış Form)"""
    # Zaten eğitmen mi ve doğrulanmış mı kontrol et
    if current_user.role == UserRole.TEACHER and current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zaten onaylanmış bir eğitmensiniz."
        )

    # Mevcut bir başvuru var mı kontrol et
    stmt = select(TeacherApplication).where(TeacherApplication.user_id == current_user.id)
    result = await db.execute(stmt)
    existing_app = result.scalar_one_or_none()

    if existing_app:
        if existing_app.status == TeacherApplicationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Zaten devam eden bir başvurunuz bulunmaktadır."
            )
        elif existing_app.status == TeacherApplicationStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Başvurunuz zaten onaylanmıştır."
            )
        else:
            # Önceki başvuru reddedilmişse, mevcut kaydı güncelleyip tekrar PENDING yapabiliriz
            existing_app.full_name = application_in.full_name
            existing_app.phone = application_in.phone
            existing_app.address = application_in.address
            existing_app.birth_date = application_in.birth_date
            existing_app.gender = application_in.gender
            existing_app.branches = application_in.branches
            existing_app.levels = application_in.levels
            existing_app.experience_years = application_in.experience_years
            existing_app.bio = application_in.bio
            existing_app.heard_from = application_in.heard_from
            existing_app.cv_path = application_in.cv_path
            existing_app.graduation_cert_path = application_in.graduation_cert_path
            existing_app.criminal_record_path = application_in.criminal_record_path
            existing_app.status = TeacherApplicationStatus.PENDING
            existing_app.admin_note = None

            # Constraint: Rolü teacher yap, ama is_verified=False bırak
            current_user.role = UserRole.TEACHER
            current_user.is_verified = False
            
            # Profil alanlarını da doldur
            current_user.bio = application_in.bio
            current_user.phone = application_in.phone
            current_user.expertise_tags = application_in.branches

            await db.commit()
            await db.refresh(existing_app)
            return existing_app

    # Yeni başvuru oluştur
    new_app = TeacherApplication(
        user_id=current_user.id,
        full_name=application_in.full_name,
        phone=application_in.phone,
        address=application_in.address,
        birth_date=application_in.birth_date,
        gender=application_in.gender,
        branches=application_in.branches,
        levels=application_in.levels,
        experience_years=application_in.experience_years,
        bio=application_in.bio,
        heard_from=application_in.heard_from,
        cv_path=application_in.cv_path,
        graduation_cert_path=application_in.graduation_cert_path,
        criminal_record_path=application_in.criminal_record_path,
        status=TeacherApplicationStatus.PENDING,
    )
    db.add(new_app)

    # Constraint: Rolü teacher yap, ama is_verified=False bırak
    current_user.role = UserRole.TEACHER
    current_user.is_verified = False
    
    # Profil alanlarını da güncelle
    current_user.bio = application_in.bio
    current_user.phone = application_in.phone
    current_user.expertise_tags = application_in.branches

    await db.commit()
    await db.refresh(new_app)
    return new_app


@router.get("/me", response_model=TeacherApplicationResponse)
async def get_my_application(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Kullanıcı kendi başvurusunu görüntüler"""
    stmt = select(TeacherApplication).where(TeacherApplication.user_id == current_user.id)
    result = await db.execute(stmt)
    app = result.scalar_one_or_none()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Henüz eğitmenlik başvurunuz bulunmamaktadır."
        )
    return app


@router.patch("/me/documents", response_model=TeacherApplicationResponse)
async def update_my_documents(
    docs_in: TeacherApplicationUpdateDocuments,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Eğitmen adayı başvuru yaptıktan sonra eksik evraklarını buradan yükler/günceller"""
    stmt = select(TeacherApplication).where(TeacherApplication.user_id == current_user.id)
    result = await db.execute(stmt)
    app = result.scalar_one_or_none()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Henüz eğitmenlik başvurunuz bulunmamaktadır."
        )
    
    # Sadece PENDING veya REJECTED durumunda evrak yüklenebilir
    if app.status == TeacherApplicationStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Başvurunuz zaten onaylanmıştır. Evrak güncellenemez."
        )

    if docs_in.cv_path is not None:
        app.cv_path = docs_in.cv_path
    if docs_in.graduation_cert_path is not None:
        app.graduation_cert_path = docs_in.graduation_cert_path
    if docs_in.criminal_record_path is not None:
        app.criminal_record_path = docs_in.criminal_record_path
        
    await db.commit()
    await db.refresh(app)
    return app


@router.get("", response_model=list[TeacherApplicationResponse])
@router.get("/", response_model=list[TeacherApplicationResponse])
async def list_applications(
    status: TeacherApplicationStatus | None = None,
    skip: int = 0,
    limit: int = 50,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Tüm başvuruları listeler"""
    stmt = select(TeacherApplication)
    if status:
        stmt = stmt.where(TeacherApplication.status == status)
    stmt = stmt.order_by(TeacherApplication.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/{application_id}/review", response_model=TeacherApplicationResponse)
async def review_application(
    application_id: str,
    review: TeacherApplicationReview,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Başvuruyu onaylar veya reddeder"""
    stmt = select(TeacherApplication).where(TeacherApplication.id == application_id).options(selectinload(TeacherApplication.user))
    result = await db.execute(stmt)
    app = result.scalar_one_or_none()

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Başvuru bulunamadı."
        )

    app.status = review.status
    app.admin_note = review.admin_note
    
    user = app.user
    if review.status == TeacherApplicationStatus.APPROVED:
        if not app.cv_path or not app.graduation_cert_path or not app.criminal_record_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Eğitmen adayının evrakları (CV, diploma ve adli sicil kaydı) eksik olduğu için onay verilemez."
            )
        user.role = UserRole.TEACHER
        user.is_verified = True
    elif review.status == TeacherApplicationStatus.REJECTED:
        # Reddedildiğinde öğrenci rolüne geri çek
        user.role = UserRole.STUDENT
        user.is_verified = False

    await db.commit()
    await db.refresh(app)
    return app
