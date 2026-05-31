from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.education_program import EducationProgram
from app.schemas.education_program import (
    EducationProgramCreate,
    EducationProgramUpdate,
    EducationProgramResponse,
)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Sadece yöneticiler (admin) işlem yapabilir"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gereklidir."
        )
    return current_user


@router.get("", response_model=List[EducationProgramResponse])
@router.get("/", response_model=List[EducationProgramResponse])
async def list_education_programs(
    category: Optional[str] = None,
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """Eğitim programlarını listeler. Herkese açık sorgularda sadece aktif olanlar listelenir."""
    stmt = select(EducationProgram)
    
    if not include_inactive:
        stmt = stmt.where(EducationProgram.active == True)
        
    if category:
        stmt = stmt.where(func.lower(EducationProgram.category) == func.lower(category))
        
    # Sıralama: En son eklenenler önce veya başlığa göre
    stmt = stmt.order_by(EducationProgram.title.asc())
    
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/slug/{slug}", response_model=EducationProgramResponse)
async def get_education_program_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Belirli bir eğitim programını slug değerine göre getirir"""
    stmt = select(EducationProgram).where(func.lower(EducationProgram.slug) == func.lower(slug))
    result = await db.execute(stmt)
    program = result.scalar_one_or_none()
    
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eğitim programı bulunamadı."
        )
        
    return program


@router.get("/{id}", response_model=EducationProgramResponse)
async def get_education_program(
    id: str,
    db: AsyncSession = Depends(get_db),
):
    """Belirli bir eğitim programını benzersiz kimliğine (ID) göre getirir"""
    stmt = select(EducationProgram).where(EducationProgram.id == id)
    result = await db.execute(stmt)
    program = result.scalar_one_or_none()
    
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eğitim programı bulunamadı."
        )
        
    return program


@router.post("", response_model=EducationProgramResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=EducationProgramResponse, status_code=status.HTTP_201_CREATED)
async def create_education_program(
    program_in: EducationProgramCreate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Yeni bir eğitim programı oluşturur"""
    # Slug çakışma kontrolü
    stmt = select(EducationProgram).where(func.lower(EducationProgram.slug) == func.lower(program_in.slug))
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu URL (slug) adresi zaten başka bir program tarafından kullanılıyor."
        )
        
    # Pydantic alt şemalarını SQLAlchemy JSON formatına dönüştürme
    new_program = EducationProgram(
        slug=program_in.slug,
        title=program_in.title,
        category=program_in.category,
        gradient=program_in.gradient,
        price=program_in.price,
        original_price=program_in.original_price,
        rating=program_in.rating,
        review_count=program_in.review_count,
        students=program_in.students,
        hours=program_in.hours,
        lessons=program_in.lessons,
        badge=program_in.badge,
        description=program_in.description,
        what_you_learn=program_in.what_you_learn,
        curriculum=[c.model_dump() for c in program_in.curriculum],
        faqs=[f.model_dump() for f in program_in.faqs],
        reviews=[r.model_dump() for r in program_in.reviews],
        active=program_in.active,
    )
    
    db.add(new_program)
    await db.commit()
    await db.refresh(new_program)
    return new_program


@router.patch("/{id}", response_model=EducationProgramResponse)
async def update_education_program(
    id: str,
    program_in: EducationProgramUpdate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Belirli bir eğitim programını günceller"""
    stmt = select(EducationProgram).where(EducationProgram.id == id)
    result = await db.execute(stmt)
    program = result.scalar_one_or_none()
    
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Güncellenecek eğitim programı bulunamadı."
        )
        
    # Slug çakışma kontrolü (eğer slug değiştiriliyorsa)
    if program_in.slug is not None and program_in.slug != program.slug:
        stmt = select(EducationProgram).where(func.lower(EducationProgram.slug) == func.lower(program_in.slug))
        conflict_res = await db.execute(stmt)
        if conflict_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu URL (slug) adresi zaten başka bir program tarafından kullanılıyor."
            )
            
    # Güncelleme alanlarını eşleme
    update_data = program_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "curriculum" and value is not None:
            program.curriculum = [c.model_dump() if hasattr(c, "model_dump") else c for c in program_in.curriculum]
        elif field == "faqs" and value is not None:
            program.faqs = [f.model_dump() if hasattr(f, "model_dump") else f for f in program_in.faqs]
        elif field == "reviews" and value is not None:
            program.reviews = [r.model_dump() if hasattr(r, "model_dump") else r for r in program_in.reviews]
        else:
            setattr(program, field, value)
            
    await db.commit()
    await db.refresh(program)
    return program


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_education_program(
    id: str,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Belirli bir eğitim programını siler"""
    stmt = select(EducationProgram).where(EducationProgram.id == id)
    result = await db.execute(stmt)
    program = result.scalar_one_or_none()
    
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Silinecek eğitim programı bulunamadı."
        )
        
    await db.delete(program)
    await db.commit()
    return {"message": "Eğitim programı başarıyla silindi."}
