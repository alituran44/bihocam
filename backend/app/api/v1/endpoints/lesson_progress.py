from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.lesson_progress import LessonProgress
from app.models.course import Lesson
from app.models.order import Enrollment
from app.schemas.lesson_progress import LessonProgressCreate, LessonProgressUpdate, LessonProgressResponse

router = APIRouter()


@router.get("/courses/{course_id}/lessons/{lesson_id}/progress", response_model=LessonProgressResponse | None)
async def get_lesson_progress(
    course_id: str,
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kullanıcının bir ders için ilerleme durumunu getir"""
    # Önce enrollment kontrolü
    enrollment_result = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == course_id
        )
    )
    enrollment = enrollment_result.scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=403, detail="Bu kursa kayıtlı değilsiniz")

    # Lesson kontrolü
    lesson_result = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id, Lesson.course_id == course_id)
    )
    lesson = lesson_result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")

    # Progress getir
    progress_result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id,
            LessonProgress.enrollment_id == enrollment.id
        )
    )
    progress = progress_result.scalar_one_or_none()
    return progress


@router.post("/courses/{course_id}/lessons/{lesson_id}/progress", response_model=LessonProgressResponse)
async def create_or_update_lesson_progress(
    course_id: str,
    lesson_id: str,
    progress_in: LessonProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ders ilerlemesini kaydet veya güncelle"""
    # Önce enrollment kontrolü
    enrollment_result = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == course_id
        )
    )
    enrollment = enrollment_result.scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=403, detail="Bu kursa kayıtlı değilsiniz")

    # Lesson kontrolü (course relationship ile birlikte)
    lesson_result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.course))
        .where(Lesson.id == lesson_id, Lesson.course_id == course_id)
    )
    lesson = lesson_result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")

    # Mevcut progress'i kontrol et
    progress_result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id,
            LessonProgress.enrollment_id == enrollment.id
        )
    )
    progress = progress_result.scalar_one_or_none()

    if progress:
        # Güncelle
        update_data = progress_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(progress, field, value)
        
        # Eğer tamamlandıysa completed_at'i set et
        if progress_in.is_completed and not progress.completed_at:
            progress.completed_at = datetime.utcnow()
        
        # Enrollment progress_percentage'i güncelle
        await update_enrollment_progress(db, enrollment.id, course_id)
    else:
        # Yeni oluştur
        progress = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            enrollment_id=enrollment.id,
            watched_seconds=progress_in.watched_seconds or 0,
            is_completed=progress_in.is_completed or False,
        )
        if progress.is_completed:
            progress.completed_at = datetime.utcnow()
        db.add(progress)
        await update_enrollment_progress(db, enrollment.id, course_id)

    await db.commit()
    await db.refresh(progress)
    
    # Check if course is completed and trigger certificate generation
    if progress_in.is_completed is True:
        from app.services.certificate_service import check_course_completion, generate_certificate
        from app.models.certificate import Certificate
        from app.models.notification import NotificationType
        from app.services.notification_service import NotificationService
        
        try:
            # Check course completion status
            completion_status = await check_course_completion(enrollment.id, db)
            
            if completion_status["is_completed"] and completion_status["percentage"] >= 80:
                # Check if certificate already exists
                existing_cert_result = await db.execute(
                    select(Certificate).where(Certificate.enrollment_id == enrollment.id)
                )
                existing_cert = existing_cert_result.scalar_one_or_none()
                
                if not existing_cert:
                    # Generate certificate
                    certificate = await generate_certificate(enrollment.id, db)
                    
                    # Send notification
                    notification_service = NotificationService(db)
                    await notification_service.send_notification(
                        user_ids=[current_user.id],
                        notification_type=NotificationType.CERTIFICATE_EARNED,
                        title="🎉 Sertifikanız Hazır!",
                        message=f"{lesson.course.title} kursunu başarıyla tamamladınız. Sertifikanızı indirebilirsiniz.",
                        data={
                            "certificate_id": str(certificate.id),
                            "course_id": str(course_id),
                            "course_title": lesson.course.title,
                        },
                    )
        except Exception as e:
            # Log error but don't fail the progress update
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to generate certificate for enrollment {enrollment.id}: {str(e)}")
    
    return progress


async def update_enrollment_progress(db: AsyncSession, enrollment_id: str, course_id: str):
    """Enrollment'in progress_percentage'ini güncelle"""
    from app.models.course import Course
    from sqlalchemy.orm import selectinload
    
    # Kursun toplam ders sayısını al (lessons relationship ile)
    course_result = await db.execute(
        select(Course)
        .options(selectinload(Course.lessons))
        .where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        return
    
    total_lessons = len(course.lessons)
    
    if total_lessons == 0:
        return
    
    # Tamamlanan ders sayısını al
    completed_result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.enrollment_id == enrollment_id,
            LessonProgress.is_completed == True
        )
    )
    completed_lessons = len(completed_result.scalars().all())
    
    # Progress percentage hesapla
    progress_percentage = int((completed_lessons / total_lessons) * 100)
    
    # Enrollment'i güncelle
    enrollment_result = await db.execute(
        select(Enrollment).where(Enrollment.id == enrollment_id)
    )
    enrollment = enrollment_result.scalar_one_or_none()
    if not enrollment:
        return
    
    enrollment.progress_percentage = progress_percentage
    enrollment.last_accessed_at = datetime.utcnow()
    
    # Eğer %100 ise completed_at set et
    if progress_percentage == 100 and not enrollment.completed_at:
        enrollment.completed_at = datetime.utcnow()
