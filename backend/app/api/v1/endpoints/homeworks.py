from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.homework import Homework, HomeworkSubmission
from app.schemas.homework import (
    HomeworkCreate,
    HomeworkResponse,
    HomeworkAssign,
    HomeworkSubmissionCreate,
    HomeworkSubmissionGrade,
    HomeworkSubmissionResponse,
)

router = APIRouter()


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için öğretmen veya admin yetkisi gerekli"
        )
    return current_user


@router.post("", response_model=HomeworkResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=HomeworkResponse, status_code=status.HTTP_201_CREATED)
async def create_homework(
    homework_in: HomeworkCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Eğitmen: Kurs altında yeni bir ödev havuzu şablonu oluşturur"""
    # Kurs kontrolü ve sahiplik doğrulama
    stmt = select(Course).where(Course.id == homework_in.course_id)
    result = await db.execute(stmt)
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı.")
        
    if current_user.role == UserRole.TEACHER and course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu kurs için ödev oluşturma yetkiniz yok."
        )

    # Öğrenci kontrolü
    if homework_in.student_id:
        student_stmt = select(User).where(User.id == homework_in.student_id, User.role == UserRole.STUDENT)
        student_result = await db.execute(student_stmt)
        student = student_result.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=400, detail="Belirtilen öğrenci bulunamadı.")

    # Havuzda durması için ilk başta is_assigned = False olarak kaydedilir.
    # due_date ve student_id atama esnasında tanımlanacaktır.
    new_homework = Homework(
        teacher_id=current_user.id,
        course_id=homework_in.course_id,
        student_id=homework_in.student_id,
        lesson_id=homework_in.lesson_id,
        title=homework_in.title,
        description=homework_in.description,
        due_date=homework_in.due_date,
        file_path=homework_in.file_path,
        is_assigned=False,
    )
    db.add(new_homework)
    await db.commit()
    
    # Load with relationship
    stmt_load = select(Homework).where(Homework.id == new_homework.id).options(selectinload(Homework.student))
    res_load = await db.execute(stmt_load)
    return res_load.scalar_one()


@router.get("", response_model=list[HomeworkResponse])
@router.get("/", response_model=list[HomeworkResponse])
async def list_homeworks(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Kurs altındaki ödevleri listeler"""
    if current_user.role == UserRole.STUDENT:
        # Öğrenciler sadece yayınlanmış/atanmış (is_assigned = True) ödevleri görebilir
        stmt = select(Homework).where(
            Homework.course_id == course_id,
            Homework.is_assigned == True,
            (Homework.student_id.is_(None)) | (Homework.student_id == current_user.id)
        ).options(selectinload(Homework.student)).order_by(Homework.created_at.desc())
    else:
        # Eğitmen ve yöneticiler havuzdaki tüm ödevleri görebilir
        stmt = select(Homework).where(Homework.course_id == course_id).options(selectinload(Homework.student)).order_by(Homework.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/{homework_id}/assign", response_model=HomeworkResponse)
async def assign_homework(
    homework_id: str,
    assign_in: HomeworkAssign,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Eğitmen/Admin: Hazırlanan ödevi öğrenciye/kursa tanımlar ve yayınlar"""
    stmt = select(Homework).where(Homework.id == homework_id)
    result = await db.execute(stmt)
    homework = result.scalar_one_or_none()
    
    if not homework:
        raise HTTPException(status_code=404, detail="Ödev bulunamadı.")
        
    if current_user.role == UserRole.TEACHER and homework.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu ödevi tanımlama yetkiniz yok.")
        
    if assign_in.student_id:
        student_stmt = select(User).where(User.id == assign_in.student_id, User.role == UserRole.STUDENT)
        student_result = await db.execute(student_stmt)
        student = student_result.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=400, detail="Belirtilen öğrenci bulunamadı.")
            
    homework.student_id = assign_in.student_id
    homework.due_date = assign_in.due_date
    homework.is_assigned = True
    
    await db.commit()
    
    # Reload with relations
    stmt_load = select(Homework).where(Homework.id == homework.id).options(selectinload(Homework.student))
    res_load = await db.execute(stmt_load)
    return res_load.scalar_one()


@router.post("/{homework_id}/submit", response_model=HomeworkSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_homework(
    homework_id: str,
    submission_in: HomeworkSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Öğrenci: Ödev yanıtını yükler/gönderir"""
    stmt = select(Homework).where(Homework.id == homework_id)
    result = await db.execute(stmt)
    homework = result.scalar_one_or_none()
    
    if not homework:
        raise HTTPException(status_code=404, detail="Ödev bulunamadı.")

    # Zaten teslim edilmiş mi kontrol et
    stmt_exist = select(HomeworkSubmission).where(
        HomeworkSubmission.homework_id == homework_id,
        HomeworkSubmission.student_id == current_user.id
    )
    res_exist = await db.execute(stmt_exist)
    existing_submission = res_exist.scalar_one_or_none()
    
    if existing_submission:
        # Mevcut teslimatı güncelle
        existing_submission.submission_text = submission_in.submission_text
        existing_submission.file_path = submission_in.file_path
        existing_submission.submitted_at = datetime.utcnow()
        await db.commit()
        
        stmt_load = select(HomeworkSubmission).where(HomeworkSubmission.id == existing_submission.id).options(selectinload(HomeworkSubmission.student))
        res_load = await db.execute(stmt_load)
        return res_load.scalar_one()

    new_submission = HomeworkSubmission(
        homework_id=homework_id,
        student_id=current_user.id,
        submission_text=submission_in.submission_text,
        file_path=submission_in.file_path,
    )
    db.add(new_submission)
    await db.commit()
    
    stmt_load = select(HomeworkSubmission).where(HomeworkSubmission.id == new_submission.id).options(selectinload(HomeworkSubmission.student))
    res_load = await db.execute(stmt_load)
    return res_load.scalar_one()


@router.get("/{homework_id}/submissions", response_model=list[HomeworkSubmissionResponse])
async def list_submissions(
    homework_id: str,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Eğitmen: Bir ödev için yapılan tüm teslimatları listeler"""
    stmt = select(Homework).where(Homework.id == homework_id)
    result = await db.execute(stmt)
    homework = result.scalar_one_or_none()
    
    if not homework:
        raise HTTPException(status_code=404, detail="Ödev bulunamadı.")
        
    if current_user.role == UserRole.TEACHER and homework.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu ödevin teslimatlarını görüntüleme yetkiniz yok.")
        
    stmt_subs = select(HomeworkSubmission).where(HomeworkSubmission.homework_id == homework_id).options(selectinload(HomeworkSubmission.student)).order_by(HomeworkSubmission.submitted_at.desc())
    res_subs = await db.execute(stmt_subs)
    return res_subs.scalars().all()


@router.post("/submissions/{submission_id}/grade", response_model=HomeworkSubmissionResponse)
async def grade_submission(
    submission_id: str,
    grade_in: HomeworkSubmissionGrade,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Eğitmen: Öğrencinin ödevini notlandırır ve geribildirim verir"""
    stmt = select(HomeworkSubmission).where(HomeworkSubmission.id == submission_id).options(selectinload(HomeworkSubmission.homework), selectinload(HomeworkSubmission.student))
    result = await db.execute(stmt)
    submission = result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Teslimat bulunamadı.")
        
    if current_user.role == UserRole.TEACHER and submission.homework.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu teslimatı notlandırma yetkiniz yok.")
        
    submission.grade = grade_in.grade
    submission.feedback = grade_in.feedback
    submission.graded_at = datetime.utcnow()
    
    await db.commit()
    
    # Reload submission to return populated model
    stmt_load = select(HomeworkSubmission).where(HomeworkSubmission.id == submission.id).options(selectinload(HomeworkSubmission.homework), selectinload(HomeworkSubmission.student))
    res_load = await db.execute(stmt_load)
    return res_load.scalar_one()
