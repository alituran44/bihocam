"""Admin endpoints for managing featured courses."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.course import Course
from app.schemas.course import CourseResponse


router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


@router.get("/admin/featured-courses", response_model=List[CourseResponse])
async def list_featured_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Featured kursları listele (Admin).
    """
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.teacher),
            selectinload(Course.categories),
            selectinload(Course.lessons)
        )
        .where(Course.is_featured == True)
        .order_by(Course.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    courses = result.scalars().all()
    return list(courses)


@router.get("/admin/courses/all", response_model=List[CourseResponse])
async def list_all_courses_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=1000),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Tüm kursları listele (Admin - featured yönetimi için).
    """
    query = select(Course).options(
        selectinload(Course.teacher),
        selectinload(Course.categories),
        selectinload(Course.lessons)
    )
    
    if status:
        query = query.where(Course.status == status)
    
    result = await db.execute(
        query
        .order_by(Course.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    courses = result.scalars().all()
    return list(courses)


@router.post("/admin/courses/{course_id}/featured", response_model=CourseResponse)
async def set_featured(
    course_id: str,
    is_featured: bool = Query(True, alias="is_featured"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Kursu featured yap/kaldır (Admin).
    """
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.teacher),
            selectinload(Course.categories),
            selectinload(Course.lessons)
        )
        .where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    course.is_featured = is_featured
    await db.commit()
    await db.refresh(course)
    
    return course


@router.get("/public/featured-courses", response_model=List[CourseResponse])
async def get_featured_courses_public(
    limit: int = Query(8, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """
    Featured kursları getir (Public - ana sayfa için).
    """
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.teacher),
            selectinload(Course.categories),
            selectinload(Course.lessons)
        )
        .where(
            Course.is_featured == True,
            Course.status == "published"
        )
        .order_by(Course.created_at.desc())
        .limit(limit)
    )
    courses = result.scalars().all()
    return list(courses)
