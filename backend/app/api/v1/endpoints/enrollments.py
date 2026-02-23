from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.order import Enrollment
from app.models.course import Course
from app.schemas.enrollment import EnrollmentResponse

router = APIRouter()


@router.get("/me", response_model=list[EnrollmentResponse])
async def get_my_enrollments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Giriş yapmış kullanıcının kayıtlı olduğu kursları döner."""
    result = await db.execute(
        select(Enrollment)
        .options(
            selectinload(Enrollment.course).selectinload(Course.teacher),
            selectinload(Enrollment.course).selectinload(Course.lessons),
            # Kategori bilgilerini de eager load et (MissingGreenlet hatasını önlemek için)
            selectinload(Enrollment.course).selectinload(Course.categories),
        )
        .where(Enrollment.user_id == current_user.id)
        .order_by(Enrollment.enrolled_at.desc())
    )
    enrollments = result.scalars().all()
    return enrollments

