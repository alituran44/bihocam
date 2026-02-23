from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_, or_, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.order import Enrollment, Order
from app.models.course import Course
from app.models.lesson_progress import LessonProgress

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Admin yetkisi kontrolü"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


@router.get("", response_model=dict)
@router.get("/", response_model=dict)
async def list_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None, description="Ad, soyad veya email içinde arama"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Admin için öğrenci listesi endpoint'i.
    Student rolündeki kullanıcıları listeler, enrollments ve orders özet bilgileriyle.
    """
    # Base query - sadece student rolündeki kullanıcılar
    stmt = select(User).where(User.role == UserRole.STUDENT)
    count_stmt = select(func.count()).select_from(User).where(User.role == UserRole.STUDENT)
    
    # Arama filtresi
    if q:
        search_pattern = f"%{q}%"
        search_condition = or_(
            User.full_name.ilike(search_pattern),
            User.email.ilike(search_pattern)
        )
        stmt = stmt.where(search_condition)
        count_stmt = count_stmt.where(search_condition)
    
    # Sıralama - en son kayıt olanlar önce
    stmt = stmt.order_by(User.created_at.desc())
    
    # Pagination
    stmt = stmt.offset(skip).limit(limit)
    
    # Toplam sayıyı al
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0
    
    # Öğrencileri getir
    result = await db.execute(stmt)
    students = result.scalars().all()
    
    # Her öğrenci için enrollments ve orders sayısını hesapla
    student_list = []
    for student in students:
        # Enrollment sayısı
        enrollment_count_result = await db.execute(
            select(func.count(Enrollment.id)).where(Enrollment.user_id == student.id)
        )
        enrollment_count = enrollment_count_result.scalar() or 0
        
        # Order sayısı
        order_count_result = await db.execute(
            select(func.count(Order.id)).where(Order.user_id == student.id)
        )
        order_count = order_count_result.scalar() or 0
        
        # Son aktivite - enrollment'lardan en son erişilen tarih
        last_activity_result = await db.execute(
            select(func.max(Enrollment.last_accessed_at))
            .where(Enrollment.user_id == student.id)
        )
        last_activity = last_activity_result.scalar()
        
        student_list.append({
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "is_active": student.is_active,
            "is_verified": student.is_verified,
            "created_at": student.created_at.isoformat(),
            "last_login_at": student.last_login_at.isoformat() if student.last_login_at else None,
            "enrollment_count": enrollment_count,
            "order_count": order_count,
            "last_activity_at": last_activity.isoformat() if last_activity else None,
        })
    
    return {
        "total": total,
        "items": student_list,
        "skip": skip,
        "limit": limit
    }


@router.get("/{student_id}", response_model=dict)
async def get_student_detail(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Admin için öğrenci detay endpoint'i.
    Öğrencinin kayıtlı kursları, ilerleme özetleri, sipariş sayısı vs. bilgileri.
    """
    # Öğrenciyi getir
    result = await db.execute(
        select(User)
        .where(User.id == student_id, User.role == UserRole.STUDENT)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı")
    
    # Enrollments'ları eager load et (course bilgileriyle)
    enrollments_result = await db.execute(
        select(Enrollment)
        .options(
            selectinload(Enrollment.course).selectinload(Course.teacher)
        )
        .where(Enrollment.user_id == student_id)
        .order_by(Enrollment.enrolled_at.desc())
    )
    enrollments = enrollments_result.scalars().all()
    
    # Orders'ları getir
    orders_result = await db.execute(
        select(Order)
        .where(Order.user_id == student_id)
        .order_by(Order.created_at.desc())
    )
    orders = orders_result.scalars().all()
    
    # Enrollment özetleri
    enrollment_summaries = []
    total_completion_rate = 0
    completed_courses = 0
    
    for enrollment in enrollments:
        # Lesson progress bilgilerini hesapla
        progress_result = await db.execute(
            select(
                func.count(LessonProgress.id).label("total_lessons"),
                func.sum(case((LessonProgress.is_completed == True, 1), else_=0)).label("completed_lessons")
            )
            .where(LessonProgress.enrollment_id == enrollment.id)
        )
        progress_stats = progress_result.first()
        
        total_lessons = progress_stats.total_lessons or 0
        completed_lessons = progress_stats.completed_lessons or 0
        completion_rate = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0
        
        if completion_rate == 100:
            completed_courses += 1
        total_completion_rate += completion_rate
        
        enrollment_summaries.append({
            "id": enrollment.id,
            "course": {
                "id": enrollment.course.id if enrollment.course else None,
                "title": enrollment.course.title if enrollment.course else "Kurs silinmiş",
                "slug": enrollment.course.slug if enrollment.course else None,
                "teacher_name": enrollment.course.teacher.full_name if enrollment.course and enrollment.course.teacher else None,
            } if enrollment.course else None,
            "progress_percentage": enrollment.progress_percentage,
            "completion_rate": completion_rate,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "enrolled_at": enrollment.enrolled_at.isoformat(),
            "last_accessed_at": enrollment.last_accessed_at.isoformat() if enrollment.last_accessed_at else None,
            "completed_at": enrollment.completed_at.isoformat() if enrollment.completed_at else None,
        })
    
    # Ortalama tamamlama oranı
    avg_completion_rate = total_completion_rate / len(enrollments) if enrollments else 0
    
    # Order özetleri
    order_summaries = []
    total_spent = 0
    for order in orders:
        total_spent += float(order.total)
        order_summaries.append({
            "id": order.id,
            "order_number": order.order_number,
            "total_amount": float(order.total),
            "status": order.status,
            "created_at": order.created_at.isoformat(),
        })
    
    return {
        "id": student.id,
        "full_name": student.full_name,
        "email": student.email,
        "phone": student.phone,
        "is_active": student.is_active,
        "is_verified": student.is_verified,
        "created_at": student.created_at.isoformat(),
        "last_login_at": student.last_login_at.isoformat() if student.last_login_at else None,
        "enrollments": enrollment_summaries,
        "orders": order_summaries,
        "stats": {
            "total_enrollments": len(enrollments),
            "total_orders": len(orders),
            "total_spent": total_spent,
            "completed_courses": completed_courses,
            "average_completion_rate": round(avg_completion_rate, 2),
        }
    }


def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    """Teacher yetkisi kontrolü"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Teacher yetkisi gerekli")
    return current_user


@router.get("/teachers/students", response_model=dict)
async def get_teacher_students(
    course_id: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """
    Eğitmenin kurslarına kayıtlı öğrencileri getir.
    course_id belirtilirse sadece o kursun öğrencileri, belirtilmezse tüm kursların öğrencileri.
    """
    # Eğitmenin kurslarını getir
    courses_query = select(Course.id).where(Course.teacher_id == current_user.id)
    if course_id:
        courses_query = courses_query.where(Course.id == course_id)
    
    courses_result = await db.execute(courses_query)
    course_ids = [str(c[0]) for c in courses_result.all()]
    
    if not course_ids:
        return {
            "total": 0,
            "items": [],
            "skip": skip,
            "limit": limit,
            "stats": {
                "total_students": 0,
                "average_completion": 0,
                "new_this_month": 0,
            }
        }
    
    # Bu kurslara kayıtlı öğrencileri getir
    enrollments_query = (
        select(Enrollment)
        .options(
            selectinload(Enrollment.user),
            selectinload(Enrollment.course)
        )
        .where(Enrollment.course_id.in_(course_ids))
        .order_by(Enrollment.enrolled_at.desc())
    )
    
    count_query = select(func.count(Enrollment.id)).where(Enrollment.course_id.in_(course_ids))
    
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    enrollments_result = await db.execute(enrollments_query.offset(skip).limit(limit))
    enrollments = enrollments_result.scalars().all()
    
    # Öğrenci listesi (unique students)
    student_map: dict[str, any] = {}
    for enrollment in enrollments:
        if enrollment.user_id not in student_map:
            # Lesson progress bilgilerini hesapla
            progress_result = await db.execute(
                select(
                    func.count(LessonProgress.id).label("total_lessons"),
                    func.sum(case((LessonProgress.is_completed == True, 1), else_=0)).label("completed_lessons")
                )
                .where(LessonProgress.enrollment_id == enrollment.id)
            )
            progress_stats = progress_result.first()
            
            total_lessons = progress_stats.total_lessons or 0
            completed_lessons = progress_stats.completed_lessons or 0
            completion_rate = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0
            
            student_map[enrollment.user_id] = {
                "id": enrollment.user.id,
                "full_name": enrollment.user.full_name,
                "email": enrollment.user.email,
                "enrolled_at": enrollment.enrolled_at.isoformat(),
                "last_activity_at": enrollment.last_accessed_at.isoformat() if enrollment.last_accessed_at else None,
                "completion_rate": completion_rate,
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "course": {
                    "id": enrollment.course.id if enrollment.course else None,
                    "title": enrollment.course.title if enrollment.course else "Kurs silinmiş",
                } if enrollment.course else None,
            }
    
    student_list = list(student_map.values())
    
    # İstatistikler
    avg_completion = sum(s["completion_rate"] for s in student_list) / len(student_list) if student_list else 0
    
    # Bu ay yeni kayıtlar
    this_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_this_month_result = await db.execute(
        select(func.count(Enrollment.id))
        .where(
            Enrollment.course_id.in_(course_ids),
            Enrollment.enrolled_at >= this_month_start
        )
    )
    new_this_month = new_this_month_result.scalar() or 0
    
    return {
        "total": total,
        "items": student_list,
        "skip": skip,
        "limit": limit,
        "stats": {
            "total_students": len(student_map),
            "average_completion": round(avg_completion, 2),
            "new_this_month": new_this_month,
        }
    }
