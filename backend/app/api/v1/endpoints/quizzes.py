from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func as sql_func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Optional

from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.course import Lesson
from app.models.quiz import (
    Quiz,
    QuizQuestion,
    QuizAttempt,
    QuizAttemptAnswer,
    QuizQuestionType,
    QuizAttemptStatus,
)
from app.schemas.quiz import (
    QuizCreate,
    QuizUpdate,
    QuizResponse,
    QuizListItem,
    QuizQuestionCreate,
    QuizQuestionUpdate,
    QuizQuestionResponse,
    QuizQuestionReorderRequest,
    QuizQuestionBulkCreateRequest,
    QuizAttemptCreate,
    QuizAttemptResponse,
    QuizAttemptAnswerCreate,
    QuizAttemptProgressUpdate,
    QuizAssignmentCreate,
    QuizAssignmentResponse,
)

router = APIRouter(prefix="", tags=["quizzes"])


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Öğretmen veya admin yetkisi gerekli")
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Yalnızca admin bu işlemi gerçekleştirebilir.")
    return current_user


# List endpoint must come before detail endpoint to avoid route conflicts
# Note: Using "" instead of "/" to match frontend calls without trailing slash
@router.get("", response_model=list[QuizListItem])
async def list_quizzes(
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    lesson_id: Optional[str] = Query(None, description="Filter by lesson ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Quiz listesi (kurs veya ders bazlı veya bağımsız)"""
    from app.models.course import Course
    from app.models.order import Enrollment
    
    query = select(Quiz)
    
    # Filtreleme
    if course_id:
        query = query.join(Lesson, Quiz.lesson_id == Lesson.id).where(Lesson.course_id == course_id)
    elif lesson_id:
        query = query.where(Quiz.lesson_id == lesson_id)
    
    # Eğer authenticated kullanıcı varsa, sadece erişebileceği quizleri göster
    if current_user:
        if current_user.role == UserRole.ADMIN:
            # Admin her şeyi görebilir
            pass
        elif current_user.role == UserRole.TEACHER:
            # Öğretmen kendi kurslarındaki quizleri veya kendi oluşturduğu bağımsız quizleri görebilir
            query = query.outerjoin(Lesson, Quiz.lesson_id == Lesson.id).outerjoin(Course, Lesson.course_id == Course.id).where(
                or_(
                    Course.teacher_id == current_user.id,
                    Quiz.teacher_id == current_user.id
                )
            )
        else:
            # Öğrenci sadece kayıtlı olduğu kurslardaki quizleri veya kendisine atanan quizleri görebilir
            enrollment_subquery = select(Enrollment.course_id).where(Enrollment.user_id == current_user.id)
            from app.models.quiz import QuizAssignment
            assignment_subquery = select(QuizAssignment.quiz_id).where(
                or_(
                    QuizAssignment.student_id == current_user.id,
                    QuizAssignment.course_id.in_(enrollment_subquery)
                )
            )
            query = query.outerjoin(Lesson, Quiz.lesson_id == Lesson.id).where(
                or_(
                    Lesson.course_id.in_(enrollment_subquery),
                    Quiz.id.in_(assignment_subquery)
                )
            )
    
    # Pagination
    total_result = await db.execute(select(sql_func.count()).select_from(query.subquery()))
    total = total_result.scalar_one()
    
    result = await db.execute(
        query
        .offset(skip)
        .limit(limit)
        .order_by(Quiz.created_at.desc())
    )
    quizzes = result.scalars().all()
    
    # Question count ve attempt count hesapla
    quiz_list = []
    for quiz in quizzes:
        question_count_result = await db.execute(
            select(sql_func.count(QuizQuestion.id)).where(QuizQuestion.quiz_id == quiz.id)
        )
        question_count = question_count_result.scalar_one()
        
        attempt_count_result = await db.execute(
            select(sql_func.count(QuizAttempt.id)).where(QuizAttempt.quiz_id == quiz.id)
        )
        attempt_count = attempt_count_result.scalar_one()
        
        quiz_list.append(QuizListItem(
            id=quiz.id,
            title=quiz.title,
            lesson_id=quiz.lesson_id,
            pdf_path=quiz.pdf_path,
            question_count=question_count,
            attempt_count=attempt_count,
            created_at=quiz.created_at,
        ))
    
    return quiz_list


# Note: Using "" instead of "/" to match frontend calls without trailing slash
@router.post("", response_model=QuizResponse)
async def create_quiz(
    quiz_in: QuizCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Yeni quiz oluştur (bağımsız veya bir derse bağlı)"""
    if quiz_in.lesson_id:
        # Lesson var mı ve eğitmenin mi kontrol et
        from app.models.course import Course
        lesson_result = await db.execute(
            select(Lesson)
            .join(Course, Lesson.course_id == Course.id)
            .where(Lesson.id == quiz_in.lesson_id)
        )
        lesson = lesson_result.scalar_one_or_none()
        if not lesson:
            raise HTTPException(status_code=404, detail="Ders bulunamadı")
        
        # Eğitmen kontrolü
        course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
        course = course_result.scalar_one_or_none()
        if course and course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Bu derse quiz ekleme yetkiniz yok")
        
        # Zaten quiz var mı kontrol et
        existing = await db.execute(select(Quiz).where(Quiz.lesson_id == quiz_in.lesson_id))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Bu ders için zaten bir quiz var")
        
        quiz = Quiz(**quiz_in.model_dump(), is_approved=True)
    else:
        # Bağımsız Quiz (Deneme Sınavı vb.)
        quiz_data = quiz_in.model_dump()
        quiz_data["lesson_id"] = None
        quiz = Quiz(
            **quiz_data,
            teacher_id=current_user.id,
            is_approved=(current_user.role == UserRole.ADMIN)
        )
        
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    
    # Eager load questions relationship for response
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.id == quiz.id)
    )
    quiz_with_questions = result.scalar_one()
    # Sort questions by order
    if quiz_with_questions.questions:
        quiz_with_questions.questions = sorted(quiz_with_questions.questions, key=lambda q: q.order)
    return quiz_with_questions


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Quiz detayını getir (enrolled öğrenciler veya course owner için)"""
    from app.models.course import Course
    from app.models.order import Enrollment
    
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.id == quiz_id)
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Sort questions by order
    if quiz.questions:
        quiz.questions = sorted(quiz.questions, key=lambda q: q.order)
    
    # Eğer authenticated kullanıcı varsa, enrollment veya ownership kontrolü yap
    if current_user:
        # Admin her zaman erişebilir
        if current_user.role == UserRole.ADMIN:
            return quiz
            
        # Eğitmen/Sahip kontrolü
        if current_user.role == UserRole.TEACHER and quiz.teacher_id == current_user.id:
            return quiz

        # Sınav onaylı değilse ve yetkili değilse engelle
        if not quiz.is_approved:
            raise HTTPException(status_code=403, detail="Bu test henüz admin tarafından onaylanmamıştır.")

        # Ders bazlı quiz kontrolü
        if quiz.lesson_id:
            lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
            lesson = lesson_result.scalar_one_or_none()
            if lesson:
                course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
                course = course_result.scalar_one_or_none()
                if course:
                    # Kurs eğitmeni ise erişim ver
                    if course.teacher_id == current_user.id:
                        return quiz
                    # Enrolled ise erişim ver
                    enrollment_result = await db.execute(
                        select(Enrollment).where(
                            Enrollment.user_id == current_user.id,
                            Enrollment.course_id == course.id
                        )
                    )
                    if enrollment_result.scalar_one_or_none():
                        return quiz
                    # Enrolled değilse erişim yok
                    raise HTTPException(status_code=403, detail="Bu quiz'e erişim yetkiniz yok. Önce kursa kaydolmalısınız.")
        
        # Bağımsız / Atanmış Quiz Kontrolü
        else:
            # Öğrenci ataması var mı kontrol et
            from app.models.quiz import QuizAssignment
            enrollment_subquery = select(Enrollment.course_id).where(Enrollment.user_id == current_user.id)
            assignment_result = await db.execute(
                select(QuizAssignment).where(
                    QuizAssignment.quiz_id == quiz.id,
                    or_(
                        QuizAssignment.student_id == current_user.id,
                        QuizAssignment.course_id.in_(enrollment_subquery)
                    )
                )
            )
            if assignment_result.scalar_one_or_none():
                return quiz
                
            raise HTTPException(status_code=403, detail="Bu test için aktif bir atamanız bulunmuyor.")
            
    # Anonymous kullanıcılar quiz detayını göremez
    raise HTTPException(status_code=401, detail="Quiz detayını görmek için giriş yapmalısınız")


@router.post("/{quiz_id}/questions", response_model=QuizQuestionResponse)
async def add_question(
    quiz_id: str,
    question_in: QuizQuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Quiz'e soru ekle"""
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Yetki kontrolü
    lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
    lesson = lesson_result.scalar_one_or_none()
    if lesson:
        from app.models.course import Course
        course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
        course = course_result.scalar_one_or_none()
        if course and course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Bu quiz'e soru ekleme yetkiniz yok")
    
    # Order'ı belirle
    max_order_result = await db.execute(
        select(sql_func.max(QuizQuestion.order)).where(QuizQuestion.quiz_id == quiz_id)
    )
    max_order = max_order_result.scalar() or 0
    
    question = QuizQuestion(
        **question_in.model_dump(),
        quiz_id=quiz_id,
        order=max_order + 1,
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


@router.post("/{quiz_id}/attempt", response_model=QuizAttemptResponse)
async def start_attempt(
    quiz_id: str,
    assignment_id: Optional[str] = Query(None, description="Linked assignment ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Quiz denemesini başlat"""
    quiz_result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.id == quiz_id)
    )
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Quiz'de soru var mı kontrol et
    if len(quiz.questions) == 0:
        raise HTTPException(status_code=400, detail="Quiz'de henüz soru yok. Önce soru ekleyin.")
        
    # Sınav onaylı mı ve aktif tarih aralığında mı kontrolü
    if current_user.role != UserRole.ADMIN and quiz.teacher_id != current_user.id:
        if not quiz.is_approved:
            raise HTTPException(status_code=403, detail="Bu test henüz admin tarafından onaylanmamıştır.")
            
        now = datetime.now()
        if quiz.start_date and now < quiz.start_date:
            raise HTTPException(
                status_code=400,
                detail=f"Bu sınav henüz başlamadı. Başlangıç zamanı: {quiz.start_date.strftime('%d.%m.%Y %H:%M')}"
            )
        if quiz.end_date and now > quiz.end_date:
            raise HTTPException(
                status_code=400,
                detail=f"Bu sınavın süresi sona erdi. Bitiş zamanı: {quiz.end_date.strftime('%d.%m.%Y %H:%M')}"
            )
    
    # Kullanıcının kursa kayıtlı veya atanmış olup olmadığını kontrol et
    from app.models.course import Course
    from app.models.order import Enrollment
    from app.models.quiz import QuizAssignment
    
    lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id) if quiz.lesson_id else select(Lesson).where(Lesson.id == None))
    lesson = lesson_result.scalar_one_or_none()
    
    if lesson:
        enrollment_result = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == lesson.course_id
            )
        )
        enrollment = enrollment_result.scalar_one_or_none()
        if not enrollment:
            raise HTTPException(status_code=403, detail="Bu quiz'e erişim yetkiniz yok. Önce kursa kaydolmalısınız.")
    else:
        # Bağımsız/standalone quiz kontrolü: Aktif bir atama var mı?
        enrollment_subquery = select(Enrollment.course_id).where(Enrollment.user_id == current_user.id)
        if assignment_id:
            assignment_result = await db.execute(
                select(QuizAssignment).where(
                    QuizAssignment.id == assignment_id,
                    QuizAssignment.quiz_id == quiz_id,
                    or_(
                        QuizAssignment.student_id == current_user.id,
                        QuizAssignment.course_id.in_(enrollment_subquery)
                    )
                )
            )
            assignment = assignment_result.scalar_one_or_none()
            if not assignment:
                raise HTTPException(status_code=403, detail="Geçersiz atama ID'si veya atamaya erişiminiz yok.")
        else:
            # Otomatik olarak en güncel atamayı bul
            assignment_result = await db.execute(
                select(QuizAssignment).where(
                    QuizAssignment.quiz_id == quiz_id,
                    or_(
                        QuizAssignment.student_id == current_user.id,
                        QuizAssignment.course_id.in_(enrollment_subquery)
                    )
                ).order_by(QuizAssignment.created_at.desc())
            )
            assignment = assignment_result.scalar_one_or_none()
            if not assignment:
                raise HTTPException(status_code=403, detail="Bu test için aktif bir atamanız bulunmuyor.")
            assignment_id = assignment.id
    
    # Maksimum deneme kontrolü
    if quiz.max_attempts:
        attempt_count_result = await db.execute(
            select(sql_func.count(QuizAttempt.id)).where(
                QuizAttempt.quiz_id == quiz_id,
                QuizAttempt.user_id == current_user.id,
                QuizAttempt.status == QuizAttemptStatus.COMPLETED
            )
        )
        attempt_count = attempt_count_result.scalar()
        if attempt_count >= quiz.max_attempts:
            raise HTTPException(status_code=400, detail="Maksimum deneme sayısına ulaştınız")
    
    # Shuffle questions kontrolü
    questions = list(quiz.questions)
    if quiz.shuffle_questions:
        import random
        random.shuffle(questions)
    
    # Yeni deneme oluştur
    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=current_user.id,
        assignment_id=assignment_id,
        total_questions=len(questions),
        total_points=sum(q.points for q in questions),
        started_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    
    # Eager load answers relationship for response (empty list initially)
    result = await db.execute(
        select(QuizAttempt)
        .options(selectinload(QuizAttempt.answers))
        .where(QuizAttempt.id == attempt.id)
    )
    attempt_with_answers = result.scalar_one()
    return attempt_with_answers


@router.post("/attempts/{attempt_id}/submit", response_model=QuizAttemptResponse)
async def submit_attempt(
    attempt_id: str,
    answers: list[QuizAttemptAnswerCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Quiz denemesini gönder ve puanla"""
    attempt_result = await db.execute(
        select(QuizAttempt)
        .options(
            selectinload(QuizAttempt.quiz).selectinload(Quiz.questions),
            selectinload(QuizAttempt.answers)
        )
        .where(QuizAttempt.id == attempt_id, QuizAttempt.user_id == current_user.id)
    )
    attempt = attempt_result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Deneme bulunamadı")
    
    # Attempt ownership kontrolü zaten yapılıyor (user_id check), ama quiz'e erişim kontrolü de ekleyelim
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == attempt.quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if quiz:
        from app.models.course import Lesson
        from app.models.order import Enrollment
        lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
        lesson = lesson_result.scalar_one_or_none()
        if lesson:
            enrollment_result = await db.execute(
                select(Enrollment).where(
                    Enrollment.user_id == current_user.id,
                    Enrollment.course_id == lesson.course_id
                )
            )
            enrollment = enrollment_result.scalar_one_or_none()
            if not enrollment:
                raise HTTPException(status_code=403, detail="Bu quiz'e erişim yetkiniz yok. Önce kursa kaydolmalısınız.")
    
    if attempt.status == QuizAttemptStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Bu deneme zaten tamamlanmış")
    
    # Zaman limiti kontrolü
    if quiz.time_limit_minutes:
        # Ensure started_at is timezone-aware
        started_at = attempt.started_at
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        elapsed_seconds = (datetime.now(timezone.utc) - started_at).total_seconds()
        if elapsed_seconds > quiz.time_limit_minutes * 60:
            # Süre dolmuş, attempt'i abandon et
            attempt.status = QuizAttemptStatus.ABANDONED
            attempt.completed_at = datetime.now(timezone.utc)
            attempt.time_taken_seconds = int(elapsed_seconds)
            await db.commit()
            raise HTTPException(status_code=400, detail="Süre doldu, deneme sonlandırıldı")
    
    # Tüm sorulara cevap verilmiş mi kontrol et
    quiz_questions_result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.quiz_id == attempt.quiz_id)
    )
    quiz_questions = {q.id for q in quiz_questions_result.scalars().all()}
    answered_questions = {a.question_id for a in answers}
    
    if quiz_questions != answered_questions:
        missing = quiz_questions - answered_questions
        raise HTTPException(
            status_code=400, 
            detail=f"Tüm sorulara cevap verilmedi. Eksik soru sayısı: {len(missing)}"
        )
    
    # Cevapları kaydet ve puanla
    correct_count = 0
    points_earned = 0
    
    for answer_data in answers:
        question_result = await db.execute(
            select(QuizQuestion).where(QuizQuestion.id == answer_data.question_id)
        )
        question = question_result.scalar_one_or_none()
        if not question:
            continue
        
        is_correct = False
        if question.question_type == QuizQuestionType.MULTIPLE_CHOICE:
            is_correct = answer_data.answer_text.strip().upper() == question.correct_answer.strip().upper()
        elif question.question_type == QuizQuestionType.TRUE_FALSE:
            is_correct = answer_data.answer_text.lower() == question.correct_answer.lower()
        else:  # SHORT_ANSWER
            is_correct = answer_data.answer_text.strip().lower() == question.correct_answer.strip().lower()
        
        if is_correct:
            correct_count += 1
            points_earned += question.points
        
        answer = QuizAttemptAnswer(
            attempt_id=attempt_id,
            question_id=answer_data.question_id,
            answer_text=answer_data.answer_text,
            is_correct=is_correct,
            points_earned=question.points if is_correct else 0,
        )
        db.add(answer)
    
    # Denemeyi güncelle
    attempt.correct_answers = correct_count
    attempt.points_earned = points_earned
    attempt.score_percentage = int((points_earned / attempt.total_points * 100)) if attempt.total_points > 0 else 0
    attempt.status = QuizAttemptStatus.COMPLETED
    attempt.completed_at = datetime.now(timezone.utc)
    
    if attempt.started_at:
        # Ensure started_at is timezone-aware
        started_at = attempt.started_at
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        time_taken = (attempt.completed_at - started_at).total_seconds()
        attempt.time_taken_seconds = int(time_taken)
    
    await db.commit()
    await db.refresh(attempt)
    
    # ============================================================================
    # EP10-QUIZ-BE-09: Quiz Completion ve Lesson Progress Entegrasyonu
    # ============================================================================
    # Quiz geçildiğinde (score >= passing_score) lesson'ı otomatik tamamla
    if attempt.score_percentage >= quiz.passing_score:
        from app.models.lesson_progress import LessonProgress
        from app.api.v1.endpoints.lesson_progress import update_enrollment_progress
        
        # Enrollment'ı bul
        lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
        lesson = lesson_result.scalar_one_or_none()
        if lesson:
            enrollment_result = await db.execute(
                select(Enrollment).where(
                    Enrollment.user_id == current_user.id,
                    Enrollment.course_id == lesson.course_id
                )
            )
            enrollment = enrollment_result.scalar_one_or_none()
            if enrollment:
                # Mevcut progress'i kontrol et
                progress_result = await db.execute(
                    select(LessonProgress).where(
                        LessonProgress.user_id == current_user.id,
                        LessonProgress.lesson_id == lesson.id,
                        LessonProgress.enrollment_id == enrollment.id
                    )
                )
                progress = progress_result.scalar_one_or_none()
                
                # Sadece ilk geçişte tamamla (sonraki denemelerde tekrar tamamlamaz)
                if not progress or not progress.is_completed:
                    # LessonProgress.completed_at is timezone-naive, so convert to naive datetime
                    completed_at_naive = datetime.now(timezone.utc).replace(tzinfo=None)
                    if progress:
                        progress.is_completed = True
                        progress.completed_at = completed_at_naive
                    else:
                        progress = LessonProgress(
                            user_id=current_user.id,
                            lesson_id=lesson.id,
                            enrollment_id=enrollment.id,
                            watched_seconds=0,
                            is_completed=True,
                            completed_at=completed_at_naive,
                        )
                        db.add(progress)
                    
                    # Enrollment progress_percentage'i güncelle
                    await update_enrollment_progress(db, enrollment.id, lesson.course_id)
                    await db.commit()
    
    # Eager load answers relationship for response
    result = await db.execute(
        select(QuizAttempt)
        .options(selectinload(QuizAttempt.answers))
        .where(QuizAttempt.id == attempt.id)
    )
    attempt_with_answers = result.scalar_one()
    return attempt_with_answers


@router.get("/attempts/{attempt_id}", response_model=QuizAttemptResponse)
async def get_attempt(
    attempt_id: str,
    include_questions: bool = Query(False, description="Include questions in response"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Quiz deneme detayını getir"""
    query = select(QuizAttempt).where(
        QuizAttempt.id == attempt_id, 
        QuizAttempt.user_id == current_user.id
    )
    
    if include_questions:
        query = query.options(
            selectinload(QuizAttempt.answers).selectinload(QuizAttemptAnswer.question),
            selectinload(QuizAttempt.quiz).selectinload(Quiz.questions)
        )
    else:
        query = query.options(
            selectinload(QuizAttempt.answers).selectinload(QuizAttemptAnswer.question)
        )
    
    result = await db.execute(query)
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Deneme bulunamadı")
    return attempt


# ============================================================================
# EP10-QUIZ-BE-01: Quiz CRUD Endpoint'leri Tamamlama
# ============================================================================

@router.put("/{quiz_id}", response_model=QuizResponse)
async def update_quiz(
    quiz_id: str,
    quiz_update: QuizUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Quiz ayarlarını güncelle"""
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Yetki kontrolü
    lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
    lesson = lesson_result.scalar_one_or_none()
    if lesson:
        from app.models.course import Course
        course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
        course = course_result.scalar_one_or_none()
        if course and course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Bu quiz'i güncelleme yetkiniz yok")
    
    # Validation
    update_data = quiz_update.model_dump(exclude_unset=True)
    if "passing_score" in update_data:
        if not (0 <= update_data["passing_score"] <= 100):
            raise HTTPException(status_code=400, detail="Geçme notu 0-100 arası olmalıdır")
    if "time_limit_minutes" in update_data and update_data["time_limit_minutes"] is not None:
        if update_data["time_limit_minutes"] <= 0:
            raise HTTPException(status_code=400, detail="Zaman limiti pozitif bir sayı olmalıdır")
    if "max_attempts" in update_data and update_data["max_attempts"] is not None:
        if update_data["max_attempts"] <= 0:
            raise HTTPException(status_code=400, detail="Maksimum deneme sayısı pozitif bir sayı olmalıdır")
    
    # Güncelle
    for field, value in update_data.items():
        setattr(quiz, field, value)
    
    await db.commit()
    await db.refresh(quiz)
    
    # Eager load questions relationship for response
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.id == quiz.id)
    )
    quiz_with_questions = result.scalar_one()
    # Sort questions by order
    quiz_with_questions.questions = sorted(quiz_with_questions.questions, key=lambda q: q.order)
    return quiz_with_questions


@router.delete("/{quiz_id}")
async def delete_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Quiz'i sil (cascade delete: questions, attempts, answers)"""
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Yetki kontrolü
    lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
    lesson = lesson_result.scalar_one_or_none()
    if lesson:
        from app.models.course import Course
        course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
        course = course_result.scalar_one_or_none()
        if course and course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Bu quiz'i silme yetkiniz yok")
    
    # Cascade delete otomatik olarak çalışacak (relationship cascade="all, delete-orphan")
    await db.delete(quiz)
    await db.commit()
    return {"message": "Quiz başarıyla silindi"}


# ============================================================================
# EP10-QUIZ-BE-02: Quiz Soru Yönetimi Endpoint'leri
# ============================================================================

@router.get("/{quiz_id}/questions", response_model=list[QuizQuestionResponse])
async def get_quiz_questions(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Quiz'in tüm sorularını listele"""
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Erişim kontrolü
    from app.models.course import Course
    from app.models.order import Enrollment
    lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
    lesson = lesson_result.scalar_one_or_none()
    if lesson:
        course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
        course = course_result.scalar_one_or_none()
        if course and current_user:
            # Owner veya admin ise tüm detaylar
            if course.teacher_id == current_user.id or current_user.role == UserRole.ADMIN:
                pass  # Tüm detaylar gösterilir
            else:
                # Enrolled öğrenci için doğru cevap gizleme
                enrollment_result = await db.execute(
                    select(Enrollment).where(
                        Enrollment.user_id == current_user.id,
                        Enrollment.course_id == course.id
                    )
                )
                if not enrollment_result.scalar_one_or_none():
                    raise HTTPException(status_code=403, detail="Bu quiz'e erişim yetkiniz yok")
        elif not current_user:
            raise HTTPException(status_code=401, detail="Giriş yapmalısınız")
    
    # Soruları getir
    questions_result = await db.execute(
        select(QuizQuestion)
        .where(QuizQuestion.quiz_id == quiz_id)
        .order_by(QuizQuestion.order)
    )
    questions = questions_result.scalars().all()
    
    # Öğrenci için doğru cevap gizleme
    if current_user and course and course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        if not quiz.show_correct_answers:
            for question in questions:
                question.correct_answer = ""  # Doğru cevabı gizle
                question.explanation = None  # Açıklamayı gizle
    
    return list(questions)


@router.put("/{quiz_id}/questions/{question_id}", response_model=QuizQuestionResponse)
async def update_question(
    quiz_id: str,
    question_id: str,
    question_update: QuizQuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Soru güncelle"""
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Yetki kontrolü
    lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
    lesson = lesson_result.scalar_one_or_none()
    if lesson:
        from app.models.course import Course
        course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
        course = course_result.scalar_one_or_none()
        if course and course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Bu soruyu güncelleme yetkiniz yok")
    
    # Soruyu bul
    question_result = await db.execute(
        select(QuizQuestion).where(
            QuizQuestion.id == question_id,
            QuizQuestion.quiz_id == quiz_id
        )
    )
    question = question_result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    
    # Validation
    update_data = question_update.model_dump(exclude_unset=True)
    if "question_type" in update_data:
        # Question type değiştiyse validation yap
        new_type = update_data["question_type"]
        if new_type == QuizQuestionType.MULTIPLE_CHOICE:
            if "options" not in update_data or not update_data.get("options"):
                raise HTTPException(status_code=400, detail="Multiple choice sorular için seçenekler gerekli")
            if "correct_answer" not in update_data or not update_data.get("correct_answer"):
                raise HTTPException(status_code=400, detail="Doğru cevap gerekli")
            # Correct answer options içinde olmalı
            if update_data.get("correct_answer") not in update_data.get("options", {}).keys():
                raise HTTPException(status_code=400, detail="Doğru cevap seçenekler içinde olmalı")
        elif new_type == QuizQuestionType.TRUE_FALSE:
            if "correct_answer" not in update_data or update_data.get("correct_answer") not in ["true", "false"]:
                raise HTTPException(status_code=400, detail="True/False sorular için doğru cevap 'true' veya 'false' olmalı")
        elif new_type == QuizQuestionType.SHORT_ANSWER:
            if "correct_answer" not in update_data or not update_data.get("correct_answer"):
                raise HTTPException(status_code=400, detail="Kısa cevap sorular için doğru cevap gerekli")
    
    if "points" in update_data and update_data["points"] <= 0:
        raise HTTPException(status_code=400, detail="Puan pozitif bir sayı olmalıdır")
    
    # Güncelle
    for field, value in update_data.items():
        setattr(question, field, value)
    
    await db.commit()
    await db.refresh(question)
    return question


@router.delete("/{quiz_id}/questions/{question_id}")
async def delete_question(
    quiz_id: str,
    question_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Soru sil"""
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Yetki kontrolü
    lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
    lesson = lesson_result.scalar_one_or_none()
    if lesson:
        from app.models.course import Course
        course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
        course = course_result.scalar_one_or_none()
        if course and course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Bu soruyu silme yetkiniz yok")
    
    # Soruyu bul
    question_result = await db.execute(
        select(QuizQuestion).where(
            QuizQuestion.id == question_id,
            QuizQuestion.quiz_id == quiz_id
        )
    )
    question = question_result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    
    deleted_order = question.order
    
    # Sil (cascade delete attempt_answers otomatik)
    await db.delete(question)
    
    # Diğer soruların order'ını güncelle
    remaining_questions_result = await db.execute(
        select(QuizQuestion).where(
            QuizQuestion.quiz_id == quiz_id,
            QuizQuestion.order > deleted_order
        )
    )
    remaining_questions = remaining_questions_result.scalars().all()
    for q in remaining_questions:
        q.order -= 1
    
    await db.commit()
    return {"message": "Soru başarıyla silindi"}


@router.put("/{quiz_id}/questions/reorder", response_model=list[QuizQuestionResponse])
async def reorder_questions(
    quiz_id: str,
    reorder_request: QuizQuestionReorderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Soruların sırasını güncelle"""
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Yetki kontrolü
    lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
    lesson = lesson_result.scalar_one_or_none()
    if lesson:
        from app.models.course import Course
        course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
        course = course_result.scalar_one_or_none()
        if course and course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Bu quiz'in sorularını yeniden sıralama yetkiniz yok")
    
    # Tüm soruları getir
    questions_result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id)
    )
    all_questions = {q.id: q for q in questions_result.scalars().all()}
    
    # Validation: Tüm question_id'ler quiz'e ait olmalı
    if len(reorder_request.question_ids) != len(all_questions):
        raise HTTPException(status_code=400, detail="Tüm soruların ID'leri sağlanmalıdır")
    
    for q_id in reorder_request.question_ids:
        if q_id not in all_questions:
            raise HTTPException(status_code=400, detail=f"Soru {q_id} bu quiz'e ait değil")
    
    # Order'ı güncelle
    for index, q_id in enumerate(reorder_request.question_ids, start=1):
        all_questions[q_id].order = index
    
    await db.commit()
    
    # Güncellenmiş soruları döndür
    updated_result = await db.execute(
        select(QuizQuestion)
        .where(QuizQuestion.quiz_id == quiz_id)
        .order_by(QuizQuestion.order)
    )
    return list(updated_result.scalars().all())


@router.post("/{quiz_id}/questions/bulk", response_model=list[QuizQuestionResponse])
async def bulk_add_questions(
    quiz_id: str,
    bulk_request: QuizQuestionBulkCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Birden fazla soruyu tek seferde ekle"""
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Yetki kontrolü
    lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id))
    lesson = lesson_result.scalar_one_or_none()
    if lesson:
        from app.models.course import Course
        course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
        course = course_result.scalar_one_or_none()
        if course and course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Bu quiz'e soru ekleme yetkiniz yok")
    
    # Mevcut max order'ı bul
    max_order_result = await db.execute(
        select(sql_func.max(QuizQuestion.order)).where(QuizQuestion.quiz_id == quiz_id)
    )
    max_order = max_order_result.scalar() or 0
    
    # Soruları ekle (transaction içinde)
    new_questions = []
    for index, question_data in enumerate(bulk_request.questions, start=1):
        question = QuizQuestion(
            **question_data.model_dump(),
            quiz_id=quiz_id,
            order=max_order + index,
        )
        db.add(question)
        new_questions.append(question)
    
    await db.commit()
    
    # Refresh edilmiş soruları döndür
    for q in new_questions:
        await db.refresh(q)
    
    return new_questions


# ============================================================================
# EP10-QUIZ-BE-03: Quiz Deneme Yönetimi Geliştirme
# ============================================================================

@router.put("/attempts/{attempt_id}/progress", response_model=QuizAttemptResponse)
async def save_attempt_progress(
    attempt_id: str,
    progress_update: QuizAttemptProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Quiz çözülürken cevapları kaydet (otomatik kaydetme)"""
    attempt_result = await db.execute(
        select(QuizAttempt).where(
            QuizAttempt.id == attempt_id,
            QuizAttempt.user_id == current_user.id
        )
    )
    attempt = attempt_result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Deneme bulunamadı")
    
    if attempt.status == QuizAttemptStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Bu deneme zaten tamamlanmış")
    
    # Zaman limiti kontrolü
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == attempt.quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if quiz and quiz.time_limit_minutes:
        # Ensure started_at is timezone-aware
        started_at = attempt.started_at
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        elapsed_seconds = (datetime.now(timezone.utc) - started_at).total_seconds()
        if elapsed_seconds > quiz.time_limit_minutes * 60:
            # Süre dolmuş, attempt'i abandon et
            attempt.status = QuizAttemptStatus.ABANDONED
            await db.commit()
            raise HTTPException(status_code=400, detail="Süre doldu, deneme sonlandırıldı")
    
    # Mevcut cevapları sil (güncelleme için)
    existing_answers_result = await db.execute(
        select(QuizAttemptAnswer).where(QuizAttemptAnswer.attempt_id == attempt_id)
    )
    existing_answers = existing_answers_result.scalars().all()
    for answer in existing_answers:
        await db.delete(answer)
    
    # Yeni cevapları kaydet
    for answer_data in progress_update.answers:
        answer = QuizAttemptAnswer(
            attempt_id=attempt_id,
            question_id=answer_data.question_id,
            answer_text=answer_data.answer_text,
            is_correct=False,  # Henüz puanlanmadı
            points_earned=0,
        )
        db.add(answer)
    
    # Attempt durumu IN_PROGRESS kalır
    await db.commit()
    await db.refresh(attempt)
    
    # Eager load answers relationship for response
    result = await db.execute(
        select(QuizAttempt)
        .options(selectinload(QuizAttempt.answers))
        .where(QuizAttempt.id == attempt.id)
    )
    attempt_with_answers = result.scalar_one()
    return attempt_with_answers


@router.put("/attempts/{attempt_id}/abandon", response_model=QuizAttemptResponse)
async def abandon_attempt(
    attempt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Denemeyi yarıda bırak"""
    attempt_result = await db.execute(
        select(QuizAttempt)
        .options(selectinload(QuizAttempt.answers))
        .where(
            QuizAttempt.id == attempt_id,
            QuizAttempt.user_id == current_user.id
        )
    )
    attempt = attempt_result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Deneme bulunamadı")
    
    if attempt.status == QuizAttemptStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Bu deneme zaten tamamlanmış")
    
    # Abandon et
    attempt.status = QuizAttemptStatus.ABANDONED
    attempt.completed_at = datetime.now(timezone.utc)
    
    if attempt.started_at:
        # Ensure started_at is timezone-aware
        started_at = attempt.started_at
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        time_taken = (attempt.completed_at - started_at).total_seconds()
        attempt.time_taken_seconds = int(time_taken)
    
    await db.commit()
    await db.refresh(attempt)
    
    # Eager load answers relationship for response
    result = await db.execute(
        select(QuizAttempt)
        .options(selectinload(QuizAttempt.answers))
        .where(QuizAttempt.id == attempt.id)
    )
    attempt_with_answers = result.scalar_one()
    return attempt_with_answers


@router.get("/{quiz_id}/attempts/my", response_model=list[QuizAttemptResponse])
async def list_my_attempts(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kullanıcının bir quiz için tüm denemelerini listele"""
    # Quiz var mı kontrol et
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz bulunamadı")
    
    # Enrollment kontrolü
    from app.models.course import Course
    from app.models.order import Enrollment
    lesson_result = await db.execute(select(Lesson).where(Lesson.id == quiz.lesson_id) if quiz.lesson_id else select(Lesson).where(Lesson.id == None))
    lesson = lesson_result.scalar_one_or_none()
    if lesson:
        enrollment_result = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == lesson.course_id
            )
        )
        if not enrollment_result.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Bu quiz'e erişim yetkiniz yok")
    else:
        # Bağımsız/standalone test: aktif atama var mı kontrol et
        from app.models.quiz import QuizAssignment
        enrollment_subquery = select(Enrollment.course_id).where(Enrollment.user_id == current_user.id)
        assignment_result = await db.execute(
            select(QuizAssignment).where(
                QuizAssignment.quiz_id == quiz_id,
                or_(
                    QuizAssignment.student_id == current_user.id,
                    QuizAssignment.course_id.in_(enrollment_subquery)
                )
            )
        )
        if not assignment_result.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Bu quiz'e erişim yetkiniz yok")
    
    # Attempt'ları getir
    attempts_result = await db.execute(
        select(QuizAttempt)
        .options(selectinload(QuizAttempt.answers))
        .where(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.user_id == current_user.id
        )
        .order_by(QuizAttempt.completed_at.desc().nulls_last(), QuizAttempt.created_at.desc())
    )
    attempts = attempts_result.scalars().all()
    
    return list(attempts)


# ============================================================================
# Quiz Assignments Endpoints
# ============================================================================

from app.models.quiz import QuizAssignment

@router.post("/assignments", response_model=QuizAssignmentResponse)
async def create_assignment(
    assignment_in: QuizAssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Eğitmen: Bir testi kursa veya öğrenciye atar"""
    # Quiz kontrolü
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == assignment_in.quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Test bulunamadı")
        
    # Yetki kontrolü
    if current_user.role == UserRole.TEACHER:
        if quiz.teacher_id != current_user.id:
            # Lesson check if it's a lesson-bound quiz
            if quiz.lesson_id:
                from app.models.course import Course
                lesson_result = await db.execute(
                    select(Lesson)
                    .join(Course, Lesson.course_id == Course.id)
                    .where(Lesson.id == quiz.lesson_id)
                )
                lesson = lesson_result.scalar_one_or_none()
                if not lesson:
                    raise HTTPException(status_code=403, detail="Bu test üzerinde yetkiniz yok.")
                course_result = await db.execute(select(Course).where(Course.id == lesson.course_id))
                course = course_result.scalar_one_or_none()
                if not course or course.teacher_id != current_user.id:
                    raise HTTPException(status_code=403, detail="Bu test üzerinde yetkiniz yok.")
            else:
                raise HTTPException(status_code=403, detail="Bu test üzerinde yetkiniz yok.")

    # Target control (Either course OR student must be provided)
    if not assignment_in.course_id and not assignment_in.student_id:
        raise HTTPException(status_code=400, detail="Lütfen bir hedef seçin (Kurs veya Öğrenci)")
        
    if assignment_in.course_id and assignment_in.student_id:
        raise HTTPException(status_code=400, detail="Bir atama için hem kurs hem öğrenci seçilemez")

    # If assigning to course, check ownership of course
    if assignment_in.course_id:
        from app.models.course import Course
        course_result = await db.execute(select(Course).where(Course.id == assignment_in.course_id))
        course = course_result.scalar_one_or_none()
        if not course:
            raise HTTPException(status_code=404, detail="Kurs bulunamadı")
        if current_user.role == UserRole.TEACHER and course.teacher_id != current_user.id:
            raise HTTPException(status_code=403, detail="Bu kursa test atama yetkiniz yok")

    # If assigning to student, verify student exists
    if assignment_in.student_id:
        student_result = await db.execute(select(User).where(User.id == assignment_in.student_id))
        student = student_result.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=404, detail="Öğrenci bulunamadı")

    new_assignment = QuizAssignment(
        quiz_id=assignment_in.quiz_id,
        teacher_id=current_user.id,
        course_id=assignment_in.course_id,
        student_id=assignment_in.student_id,
        due_date=assignment_in.due_date,
    )
    db.add(new_assignment)
    await db.commit()
    await db.refresh(new_assignment)
    
    # Reload with quiz and student details for response
    result = await db.execute(
        select(QuizAssignment)
        .options(selectinload(QuizAssignment.quiz), selectinload(QuizAssignment.student))
        .where(QuizAssignment.id == new_assignment.id)
    )
    return result.scalar_one()


@router.get("/assignments/my", response_model=list[QuizAssignmentResponse])
async def list_my_assignments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Öğrenci: Kendisine atanmış tüm testleri listeler"""
    from app.models.order import Enrollment
    enrollment_subquery = select(Enrollment.course_id).where(Enrollment.user_id == current_user.id)
    
    stmt = (
        select(QuizAssignment)
        .join(Quiz, QuizAssignment.quiz_id == Quiz.id)
        .options(selectinload(QuizAssignment.quiz), selectinload(QuizAssignment.student))
        .where(
            or_(
                QuizAssignment.student_id == current_user.id,
                QuizAssignment.course_id.in_(enrollment_subquery)
            ),
            Quiz.is_approved == True
        )
        .order_by(QuizAssignment.created_at.desc())
    )
    result = await db.execute(stmt)
    assignments = result.scalars().all()
    
    # Her atama için en güncel kullanıcı denemesini bul ve ekle
    response_data = []
    for a in assignments:
        attempt_stmt = select(QuizAttempt).where(
            QuizAttempt.quiz_id == a.quiz_id,
            QuizAttempt.user_id == current_user.id,
            or_(
                QuizAttempt.assignment_id == a.id,
                QuizAttempt.assignment_id == None
            )
        ).order_by(QuizAttempt.completed_at.desc().nulls_last(), QuizAttempt.created_at.desc()).limit(1)
        attempt_result = await db.execute(attempt_stmt)
        attempt = attempt_result.scalar_one_or_none()
        
        # Pydantic şemasına dönüştür
        from app.schemas.quiz import QuizAssignmentResponse as SchemaResponse
        a_data = SchemaResponse.model_validate(a)
        a_data.my_attempt = attempt
        response_data.append(a_data)
        
    return response_data


@router.get("/assignments/teacher/my", response_model=list[QuizAssignmentResponse])
async def list_teacher_assignments(
    quiz_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Eğitmen: Gönderdiği atamaları listeler"""
    stmt = select(QuizAssignment).options(selectinload(QuizAssignment.quiz), selectinload(QuizAssignment.student)).where(QuizAssignment.teacher_id == current_user.id)
    if quiz_id:
        stmt = stmt.where(QuizAssignment.quiz_id == quiz_id)
        
    stmt = stmt.order_by(QuizAssignment.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/assignments/{assignment_id}", response_model=QuizAssignmentResponse)
async def get_assignment(
    assignment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Atama detayını getir"""
    stmt = select(QuizAssignment).options(selectinload(QuizAssignment.quiz), selectinload(QuizAssignment.student)).where(QuizAssignment.id == assignment_id)
    result = await db.execute(stmt)
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Atama bulunamadı")
        
    # Authorization checks
    if current_user.role == UserRole.TEACHER and assignment.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Erişim yetkiniz yok")
    if current_user.role == UserRole.STUDENT and assignment.student_id != current_user.id:
        from app.models.order import Enrollment
        enrollment_result = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == assignment.course_id
            )
        )
        if not enrollment_result.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Erişim yetkiniz yok")
            
    # Sınav onaylanmış mı kontrolü (Öğrenciler için)
    if current_user.role == UserRole.STUDENT:
        if assignment.quiz and not assignment.quiz.is_approved:
            raise HTTPException(status_code=403, detail="Bu test henüz onaylanmamıştır.")
            
    return assignment


@router.post("/{quiz_id}/approve", response_model=QuizResponse)
async def approve_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: Bir quizi onaylar"""
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.id == quiz_id)
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Test bulunamadı")
        
    quiz.is_approved = True
    await db.commit()
    await db.refresh(quiz)
    return quiz


@router.post("/{quiz_id}/reject", response_model=QuizResponse)
async def reject_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: Bir quizi reddeder/onayını kaldırır"""
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.id == quiz_id)
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Test bulunamadı")
        
    quiz.is_approved = False
    await db.commit()
    await db.refresh(quiz)
    return quiz
