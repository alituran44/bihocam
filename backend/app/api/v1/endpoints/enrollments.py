from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, load_only

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.order import Enrollment
from app.models.course import Course, Lesson
from app.schemas.enrollment import EnrollmentResponse

router = APIRouter()


@router.get("/me", response_model=list[EnrollmentResponse])
async def get_my_enrollments(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """P2-06: Pagination eklendi. P2-02: Lesson load optimize edildi."""
    result = await db.execute(
        select(Enrollment)
        .options(
            selectinload(Enrollment.course).selectinload(Course.teacher),
            selectinload(Enrollment.course).selectinload(Course.lessons),
            selectinload(Enrollment.course).selectinload(Course.categories),
        )
        .where(Enrollment.user_id == current_user.id)
        .order_by(Enrollment.enrolled_at.desc())
        .offset(skip)
        .limit(limit)
    )
    enrollments = result.scalars().all()
    return enrollments

