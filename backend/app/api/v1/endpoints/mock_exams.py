from datetime import datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.mock_exam import MockExam, MockExamQuestion, MockExamAttempt, MockExamStudentAnswer
from app.models.order import Enrollment
from app.schemas.mock_exam import (
    MockExamCreate,
    MockExamResponse,
    MockExamAttemptSubmit,
    MockExamAttemptResponse,
    MockExamAttemptAnalysis,
    MockExamSubjectAnalysis,
    MockExamAnswerComparison,
    MockExamAttemptListResponse,
)

router = APIRouter()


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için yetkiniz yok. Sadece eğitmenler veya yöneticiler deneme sınavı oluşturabilir."
        )
    return current_user


@router.post("", response_model=MockExamResponse, status_code=status.HTTP_201_CREATED)
async def create_mock_exam(
    payload: MockExamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """
    Yeni bir deneme sınavı oluşturur ve cevap anahtarını kaydeder.
    """
    # 1. Create the MockExam
    new_exam = MockExam(
        title=payload.title,
        description=payload.description,
        exam_type=payload.exam_type,
        pdf_path=payload.pdf_path,
        duration_minutes=payload.duration_minutes,
        number_of_options=payload.number_of_options,
        is_active=payload.is_active,
        start_date=payload.start_date,
        end_date=payload.end_date,
        course_id=payload.course_id,
        student_id=payload.student_id,
        created_by_id=current_user.id,
    )
    db.add(new_exam)
    await db.flush()  # Generate UUID/ID for foreign key relation

    # 2. Create correct answers (questions)
    for q in payload.questions:
        correct_answer = q.correct_answer.upper().strip() if q.correct_answer else ""
        db_question = MockExamQuestion(
            mock_exam_id=new_exam.id,
            question_number=q.question_number,
            subject_name=q.subject_name,
            correct_answer=correct_answer,
            points=q.points,
        )
        db.add(db_question)

    await db.commit()
    
    # Reload with questions relationship
    result = await db.execute(
        select(MockExam)
        .options(selectinload(MockExam.questions))
        .where(MockExam.id == new_exam.id)
    )
    return result.scalar_one()


@router.get("", response_model=list[MockExamResponse])
async def list_mock_exams(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Tüm aktif deneme sınavlarını listeler (Öğrenciler için sadece atanan ve aktif olanları getirir).
    """
    query = select(MockExam).options(selectinload(MockExam.questions))
    
    # Students should only see active and assigned mock exams
    if current_user.role == "student":
        # Get enrolled courses
        enrollment_query = select(Enrollment.course_id).where(Enrollment.user_id == current_user.id)
        enrollment_result = await db.execute(enrollment_query)
        student_course_ids = enrollment_result.scalars().all()

        query = query.where(
            and_(
                MockExam.is_active == True,
                or_(
                    MockExam.student_id == current_user.id,
                    MockExam.course_id.in_(student_course_ids) if student_course_ids else False,
                    and_(MockExam.course_id == None, MockExam.student_id == None)
                )
            )
        )
        
    result = await db.execute(query.order_by(MockExam.created_at.desc()))
    return result.scalars().all()


@router.get("/attempts/my", response_model=list[MockExamAttemptListResponse])
async def list_my_mock_exam_attempts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Öğrencinin çözmüş olduğu veya çözmeye devam ettiği tüm deneme sınavı geçmişini listeler.
    """
    result = await db.execute(
        select(MockExamAttempt, MockExam.title, MockExam.exam_type)
        .join(MockExam, MockExamAttempt.mock_exam_id == MockExam.id)
        .where(MockExamAttempt.student_id == current_user.id)
        .order_by(MockExamAttempt.started_at.desc())
    )
    
    attempts_list = []
    for row in result.all():
        attempt, exam_title, exam_type = row
        attempts_list.append(MockExamAttemptListResponse(
            id=attempt.id,
            mock_exam_id=attempt.mock_exam_id,
            mock_exam_title=exam_title,
            mock_exam_type=exam_type,
            status=attempt.status,
            total_correct=attempt.total_correct,
            total_wrong=attempt.total_wrong,
            total_empty=attempt.total_empty,
            total_net=attempt.total_net,
            score=attempt.score,
            started_at=attempt.started_at,
            completed_at=attempt.completed_at
        ))
        
    return attempts_list


@router.get("/{id}", response_model=MockExamResponse)
async def get_mock_exam(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Belirli bir deneme sınavının detaylarını ve cevap anahtarını getirir.
    """
    result = await db.execute(
        select(MockExam)
        .options(selectinload(MockExam.questions))
        .where(MockExam.id == id)
    )
    exam = result.scalar_one_or_none()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deneme sınavı bulunamadı."
        )
    return exam


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mock_exam(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """
    Bir deneme sınavını ve ilgili tüm verilerini (cevap anahtarı, deneme çözümleri) siler.
    """
    result = await db.execute(select(MockExam).where(MockExam.id == id))
    exam = result.scalar_one_or_none()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deneme sınavı bulunamadı."
        )
        
    # Check permissions (teachers can only delete their own exams, admins can delete anything)
    if current_user.role != "admin" and exam.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu deneme sınavını silmek için yetkiniz yok."
        )
        
    await db.delete(exam)
    await db.commit()
    return None


@router.put("/{id}", response_model=MockExamResponse)
async def update_mock_exam(
    id: str,
    payload: MockExamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """
    Mevcut bir deneme sınavını ve ilgili cevap anahtarını günceller.
    """
    # 1. Fetch exam
    result = await db.execute(select(MockExam).where(MockExam.id == id))
    exam = result.scalar_one_or_none()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deneme sınavı bulunamadı."
        )

    # Check permission
    if current_user.role != "admin" and exam.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu deneme sınavını güncellemek için yetkiniz yok."
        )

    # 2. Update MockExam metadata
    exam.title = payload.title
    exam.description = payload.description
    exam.exam_type = payload.exam_type
    exam.pdf_path = payload.pdf_path
    exam.duration_minutes = payload.duration_minutes
    exam.number_of_options = payload.number_of_options
    exam.is_active = payload.is_active
    exam.start_date = payload.start_date
    exam.end_date = payload.end_date
    exam.course_id = payload.course_id
    exam.student_id = payload.student_id

    # 3. Update questions (answers)
    # Clear existing questions
    await db.execute(delete(MockExamQuestion).where(MockExamQuestion.mock_exam_id == id))

    # Add new questions
    for q in payload.questions:
        correct_answer = q.correct_answer.upper().strip() if q.correct_answer else ""
        db_question = MockExamQuestion(
            mock_exam_id=id,
            question_number=q.question_number,
            subject_name=q.subject_name,
            correct_answer=correct_answer,
            points=q.points,
        )
        db.add(db_question)

    await db.commit()

    # Reload with questions relationship
    result = await db.execute(
        select(MockExam)
        .options(selectinload(MockExam.questions))
        .where(MockExam.id == id)
    )
    return result.scalar_one()


@router.post("/{id}/attempts", response_model=MockExamAttemptResponse)
async def start_mock_exam_attempt(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Öğrenci için yeni bir deneme çözme oturumu (attempt) başlatır.
    """
    # Verify exam exists
    exam_result = await db.execute(select(MockExam).where(MockExam.id == id))
    exam = exam_result.scalar_one_or_none()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deneme sınavı bulunamadı."
        )
        
    # Check if there is an in-progress attempt already
    existing_result = await db.execute(
        select(MockExamAttempt)
        .options(selectinload(MockExamAttempt.answers))
        .where(MockExamAttempt.mock_exam_id == id)
        .where(MockExamAttempt.student_id == current_user.id)
        .where(MockExamAttempt.status == "in_progress")
    )
    existing_attempt = existing_result.scalar_one_or_none()
    if existing_attempt:
        return existing_attempt

    # Create new attempt
    attempt = MockExamAttempt(
        mock_exam_id=id,
        student_id=current_user.id,
        status="in_progress",
    )
    db.add(attempt)
    await db.commit()
    
    # Reload attempt with eagerly loaded answers relationship
    reload_res = await db.execute(
        select(MockExamAttempt)
        .options(selectinload(MockExamAttempt.answers))
        .where(MockExamAttempt.id == attempt.id)
    )
    return reload_res.scalar_one()


@router.post("/attempts/{attempt_id}/submit", response_model=MockExamAttemptResponse)
async def submit_mock_exam_attempt(
    attempt_id: str,
    payload: MockExamAttemptSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Öğrencinin optik form cevaplarını teslim alır, doğruluğunu hesaplar, 
    yanlış-doğru götürme kurallarına (LGS için 3y1d, YKS için 4y1d) göre netleri hesaplar ve kaydeder.
    """
    # Fetch attempt
    attempt_result = await db.execute(
        select(MockExamAttempt)
        .options(selectinload(MockExamAttempt.mock_exam))
        .where(MockExamAttempt.id == attempt_id)
    )
    attempt = attempt_result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deneme oturumu bulunamadı."
        )
        
    if attempt.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için yetkiniz yok."
        )
        
    if attempt.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu sınav denemesi zaten tamamlanmış."
        )
        
    # Fetch correct answer keys
    questions_result = await db.execute(
        select(MockExamQuestion)
        .where(MockExamQuestion.mock_exam_id == attempt.mock_exam_id)
    )
    questions = {q.question_number: q for q in questions_result.scalars().all()}
    
    # Index student answers
    student_answers_map = {ans.question_number: ans.selected_answer.upper().strip() if ans.selected_answer else None for ans in payload.answers}

    total_correct = 0
    total_wrong = 0
    total_empty = 0
    
    # Delete previous answers for this attempt (just in case)
    await db.execute(delete(MockExamStudentAnswer).where(MockExamStudentAnswer.attempt_id == attempt.id))
    
    # Validate and score each question
    for q_num, question in questions.items():
        student_ans = student_answers_map.get(q_num)
        
        is_evaluated = question.correct_answer and question.correct_answer.strip() not in ["", "-", "PENDING"]
        is_correct = None
        
        if not is_evaluated:
            is_correct = None
            total_empty += 1
            if not student_ans:
                student_ans = None
        elif not student_ans:
            total_empty += 1
            student_ans = None
            is_correct = False
        elif student_ans == question.correct_answer:
            total_correct += 1
            is_correct = True
        else:
            total_wrong += 1
            is_correct = False
            
        db_student_answer = MockExamStudentAnswer(
            attempt_id=attempt.id,
            question_number=q_num,
            selected_answer=student_ans,
            is_correct=is_correct if student_ans is not None else None
        )
        db.add(db_student_answer)
        
    # Compute Net score based on exam type penalty rules
    # LGS: 3 wrong answers remove 1 correct answer (3y1d)
    # YKS: 4 wrong answers remove 1 correct answer (4y1d)
    penalty_divisor = 3 if attempt.mock_exam.exam_type == "LGS" else 4
    total_net = total_correct - (total_wrong / penalty_divisor)
    if total_net < 0.0:
        total_net = 0.0
        
    # Accuracy percentage score
    total_questions_count = len(questions)
    score_percentage = (total_net / total_questions_count * 100.0) if total_questions_count > 0 else 0.0
    
    # Update attempt
    attempt.status = "completed"
    attempt.total_correct = total_correct
    attempt.total_wrong = total_wrong
    attempt.total_empty = total_empty
    attempt.total_net = round(total_net, 2)
    attempt.score = round(score_percentage, 2)
    attempt.completed_at = datetime.now()
    
    await db.commit()
    
    # Reload with answers relationship
    reload_result = await db.execute(
        select(MockExamAttempt)
        .options(selectinload(MockExamAttempt.answers))
        .where(MockExamAttempt.id == attempt.id)
    )
    return reload_result.scalar_one()


@router.get("/attempts/{attempt_id}/analysis", response_model=MockExamAttemptAnalysis)
async def get_mock_exam_attempt_analysis(
    attempt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Öğrenci deneme çözümü için ders ders ( Türkçe, Matematik, Fen vb.) Doğru, Yanlış, Boş, Net analizleri 
    ve optik form detaylarının cevap anahtarı ile karşılaştırmasını üretir.
    """
    # Fetch attempt
    attempt_result = await db.execute(
        select(MockExamAttempt)
        .options(
            selectinload(MockExamAttempt.mock_exam),
            selectinload(MockExamAttempt.answers)
        )
        .where(MockExamAttempt.id == attempt_id)
    )
    attempt = attempt_result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deneme oturumu bulunamadı."
        )
        
    # Admins and teachers can view any attempt, students can only view their own
    if current_user.role not in ["admin", "teacher"] and attempt.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu analiz verisini görüntülemek için yetkiniz yok."
        )
        
    # Fetch exam answer keys
    questions_result = await db.execute(
        select(MockExamQuestion)
        .where(MockExamQuestion.mock_exam_id == attempt.mock_exam_id)
    )
    questions = {q.question_number: q for q in questions_result.scalars().all()}
    
    # Index student marked answers
    student_answers = {ans.question_number: ans for ans in attempt.answers}
    
    # Group by subjects
    subjects_stats: dict[str, dict[str, Any]] = {}
    comparisons: list[MockExamAnswerComparison] = []
    
    penalty_divisor = 3 if attempt.mock_exam.exam_type == "LGS" else 4
    
    for q_num, question in sorted(questions.items()):
        subject = question.subject_name
        if subject not in subjects_stats:
            subjects_stats[subject] = {
                "total_questions": 0,
                "correct": 0,
                "wrong": 0,
                "empty": 0,
            }
            
        student_ans_obj = student_answers.get(q_num)
        selected = student_ans_obj.selected_answer if student_ans_obj else None
        
        is_evaluated = question.correct_answer and question.correct_answer.strip() not in ["", "-", "PENDING"]
        is_correct = None
        subjects_stats[subject]["total_questions"] += 1
        
        if not is_evaluated:
            is_correct = None
            subjects_stats[subject]["empty"] += 1
        elif not selected:
            subjects_stats[subject]["empty"] += 1
            is_correct = False
        elif selected == question.correct_answer:
            subjects_stats[subject]["correct"] += 1
            is_correct = True
        else:
            subjects_stats[subject]["wrong"] += 1
            is_correct = False
            
        comparisons.append(MockExamAnswerComparison(
            question_number=q_num,
            subject_name=subject,
            selected_answer=selected,
            correct_answer=question.correct_answer if is_evaluated else None,
            is_correct=is_correct
        ))
        
    # Calculate nets and accuracies per subject
    subjects_analysis: list[MockExamSubjectAnalysis] = []
    for subject, stats in subjects_stats.items():
        correct = stats["correct"]
        wrong = stats["wrong"]
        empty = stats["empty"]
        total = stats["total_questions"]
        
        # Calculate subject net
        net = correct - (wrong / penalty_divisor)
        if net < 0.0:
            net = 0.0
            
        accuracy = (net / total * 100.0) if total > 0 else 0.0
        
        subjects_analysis.append(MockExamSubjectAnalysis(
            subject_name=subject,
            total_questions=total,
            correct=correct,
            wrong=wrong,
            empty=empty,
            net=round(net, 2),
            accuracy_percentage=round(accuracy, 2)
        ))
        
    # Build schema payload response
    attempt_schema = MockExamAttemptResponse.model_validate(attempt)
    
    return MockExamAttemptAnalysis(
        attempt=attempt_schema,
        mock_exam_title=attempt.mock_exam.title,
        mock_exam_type=attempt.mock_exam.exam_type,
        subjects_analysis=subjects_analysis,
        comparisons=comparisons
    )
