from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.exam import Exam, ExamQuestion, ExamAttempt, ExamAttemptAnswer
from app.schemas.exam import (
    ExamCreate,
    ExamResponse,
    ExamQuestionCreate,
    ExamQuestionResponse,
    ExamAttemptSubmit,
    ExamAttemptResponse,
)

router = APIRouter()


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için öğretmen veya admin yetkisi gerekli"
        )
    return current_user


@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
async def create_exam(
    exam_in: ExamCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Eğitmen: Kurs altına yeni bir sınav tanımlar"""
    stmt = select(Course).where(Course.id == exam_in.course_id)
    result = await db.execute(stmt)
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı.")
        
    if current_user.role == UserRole.TEACHER and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu kurs için sınav oluşturma yetkiniz yok.")
        
    new_exam = Exam(
        course_id=exam_in.course_id,
        section_id=exam_in.section_id,
        title=exam_in.title,
        description=exam_in.description,
        icon=exam_in.icon,
        duration_minutes=exam_in.duration_minutes,
        max_attempts=exam_in.max_attempts,
        passing_grade=exam_in.passing_grade,
        validity_days=exam_in.validity_days,
        randomize_questions=exam_in.randomize_questions,
        include_certificate=exam_in.include_certificate,
        is_active=exam_in.is_active,
    )
    db.add(new_exam)
    await db.commit()
    await db.refresh(new_exam)
    return new_exam


@router.get("", response_model=list[ExamResponse])
@router.get("/", response_model=list[ExamResponse])
async def list_exams(
    course_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Belirli bir kurs altındaki tüm aktif sınavları listeler"""
    stmt = select(Exam).where(Exam.course_id == course_id, Exam.is_active == True).options(selectinload(Exam.questions))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/{exam_id}/questions", response_model=ExamQuestionResponse, status_code=status.HTTP_201_CREATED)
async def add_question(
    exam_id: str,
    question_in: ExamQuestionCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Eğitmen: Sınava yeni soru ekler"""
    stmt = select(Exam).where(Exam.id == exam_id).options(selectinload(Exam.course))
    result = await db.execute(stmt)
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Sınav bulunamadı.")
        
    if current_user.role == UserRole.TEACHER and exam.course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu sınava soru ekleme yetkiniz yok.")
        
    new_q = ExamQuestion(
        exam_id=exam_id,
        question_type=question_in.question_type,
        question_text=question_in.question_text,
        options=question_in.options,
        correct_answer=question_in.correct_answer,
        points=question_in.points,
        order=question_in.order,
        explanation=question_in.explanation,
    )
    db.add(new_q)
    await db.commit()
    await db.refresh(new_q)
    return new_q


@router.post("/{exam_id}/attempt", response_model=ExamAttemptResponse, status_code=status.HTTP_201_CREATED)
async def start_attempt(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Öğrenci: Sınavı başlatır (Deneme kaydı oluşturur)"""
    stmt = select(Exam).where(Exam.id == exam_id).options(selectinload(Exam.questions))
    result = await db.execute(stmt)
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Sınav bulunamadı.")
        
    # Deneme sınırı kontrolü
    stmt_count = select(func.count(ExamAttempt.id)).where(
        ExamAttempt.exam_id == exam_id,
        ExamAttempt.user_id == current_user.id
    )
    res_count = await db.execute(stmt_count)
    attempt_count = res_count.scalar() or 0
    
    if attempt_count >= exam.max_attempts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bu sınav için maksimum deneme sınırına ({exam.max_attempts}) ulaştınız."
        )
        
    new_attempt = ExamAttempt(
        exam_id=exam_id,
        user_id=current_user.id,
        status="in_progress",
    )
    db.add(new_attempt)
    await db.commit()
    await db.refresh(new_attempt)
    return new_attempt


@router.post("/attempts/{attempt_id}/submit", response_model=ExamAttemptResponse)
async def submit_attempt(
    attempt_id: str,
    attempt_in: ExamAttemptSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Öğrenci: Sınavı tamamlar, cevapları gönderir ve otomatik notlandırılır"""
    stmt = select(ExamAttempt).where(ExamAttempt.id == attempt_id).options(
        selectinload(ExamAttempt.exam).selectinload(Exam.questions)
    )
    result = await db.execute(stmt)
    attempt = result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Sınav denemesi bulunamadı.")
        
    if attempt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu denemeyi gönderme yetkiniz yok.")
        
    if attempt.status == "completed":
        raise HTTPException(status_code=400, detail="Bu sınav zaten tamamlanmış.")
        
    exam = attempt.exam
    questions_map = {q.id: q for q in exam.questions}
    
    total_points = 0
    earned_points = 0
    answers_to_add = []
    
    for ans in attempt_in.answers:
        q = questions_map.get(ans.question_id)
        if not q:
            continue
            
        total_points += q.points
        is_correct = str(ans.answer_text).strip().lower() == str(q.correct_answer).strip().lower()
        pts = q.points if is_correct else 0
        if is_correct:
            earned_points += pts
            
        new_ans = ExamAttemptAnswer(
            attempt_id=attempt_id,
            question_id=ans.question_id,
            answer_text=ans.answer_text,
            is_correct=is_correct,
            points_earned=pts,
        )
        answers_to_add.append(new_ans)
        
    # Tüm sınav puanını 100 üzerinden hesapla
    score = int((earned_points / total_points) * 100) if total_points > 0 else 0
    is_passed = score >= exam.passing_grade
    
    attempt.status = "completed"
    attempt.score = score
    attempt.is_passed = is_passed
    attempt.completed_at = datetime.utcnow()
    attempt.time_taken_seconds = int((attempt.completed_at - attempt.started_at.replace(tzinfo=None)).total_seconds())
    
    db.add_all(answers_to_add)
    await db.commit()
    
    # Reload with answers relationship loaded
    stmt_reload = select(ExamAttempt).where(ExamAttempt.id == attempt_id).options(
        selectinload(ExamAttempt.answers)
    )
    res_reload = await db.execute(stmt_reload)
    return res_reload.scalar_one()
