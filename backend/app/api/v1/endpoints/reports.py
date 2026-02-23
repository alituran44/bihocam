from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_, or_, case, distinct, extract
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem, OrderStatus, Enrollment
from app.models.course import Course, Lesson, LessonType
from app.models.teacher_earning import TeacherEarning, EarningType
from app.models.course_review import CourseReview
from app.models.category import Category, course_categories
from app.models.lesson_progress import LessonProgress
from app.schemas.reports import (
    OverviewStatsResponse,
    EarningsReportResponse,
    TimeSeriesDataPoint,
    TeacherStatsResponse,
    TopCourseItem,
    TopTeacherItem,
    CategoryAnalyticsResponse,
    CategoryAnalyticsItem,
    CoursePerformanceResponse,
    CoursePerformanceItem,
    StudentAnalyticsResponse,
    StudentAnalyticsItem,
    TeacherPerformanceResponse,
    TeacherPerformanceItem,
)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Sadece admin erişebilir"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu işlem için admin yetkisi gerekli")
    return current_user


def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    """Sadece öğretmen erişebilir"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Bu işlem için öğretmen yetkisi gerekli")
    return current_user


@router.get("/admin/reports/overview", response_model=OverviewStatsResponse)
async def get_overview_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin için özet istatistikler"""
    
    # Toplam ciro (tüm zamanlar, sadece PAID siparişler)
    total_revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total), 0))
        .where(Order.status == OrderStatus.PAID)
    )
    total_revenue = Decimal(str(total_revenue_result.scalar() or 0))
    
    # Son 30 gün ciro
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    last_30_days_revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total), 0))
        .where(
            and_(
                Order.status == OrderStatus.PAID,
                Order.created_at >= thirty_days_ago
            )
        )
    )
    last_30_days_revenue = Decimal(str(last_30_days_revenue_result.scalar() or 0))
    
    # Geçen 30 gün ciro (30-60 gün önce)
    sixty_days_ago = datetime.utcnow() - timedelta(days=60)
    previous_30_days_revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total), 0))
        .where(
            and_(
                Order.status == OrderStatus.PAID,
                Order.created_at >= sixty_days_ago,
                Order.created_at < thirty_days_ago
            )
        )
    )
    previous_30_days_revenue = Decimal(str(previous_30_days_revenue_result.scalar() or 0))
    
    # Geçen 30 güne göre % değişim
    revenue_change = None
    if previous_30_days_revenue > 0:
        revenue_change = float(
            ((last_30_days_revenue - previous_30_days_revenue) / previous_30_days_revenue) * 100
        )
    
    # Aktif öğrenci sayısı (son 30 günde giriş yapan veya hiç giriş yapmamış ama aktif)
    active_students_result = await db.execute(
        select(func.count(distinct(User.id)))
        .where(
            and_(
                User.role == UserRole.STUDENT,
                User.is_active == True,
                or_(
                    User.last_login_at >= thirty_days_ago,
                    User.last_login_at.is_(None)  # Hiç giriş yapmamış ama aktif
                )
            )
        )
    )
    active_students = int(active_students_result.scalar() or 0)
    
    # Aktif eğitmen sayısı (son 30 günde giriş yapan veya hiç giriş yapmamış ama aktif)
    active_teachers_result = await db.execute(
        select(func.count(distinct(User.id)))
        .where(
            and_(
                User.role == UserRole.TEACHER,
                User.is_active == True,
                or_(
                    User.last_login_at >= thirty_days_ago,
                    User.last_login_at.is_(None)  # Hiç giriş yapmamış ama aktif
                )
            )
        )
    )
    active_teachers = int(active_teachers_result.scalar() or 0)
    
    # Toplam kurs sayısı
    total_courses_result = await db.execute(
        select(func.count(Course.id))
    )
    total_courses = int(total_courses_result.scalar() or 0)
    
    # Yayında olan kurs sayısı
    published_courses_result = await db.execute(
        select(func.count(Course.id))
        .where(Course.status == "published")
    )
    published_courses = int(published_courses_result.scalar() or 0)
    
    # Toplam sipariş sayısı
    total_orders_result = await db.execute(
        select(func.count(Order.id))
        .where(Order.status == OrderStatus.PAID)
    )
    total_orders = int(total_orders_result.scalar() or 0)
    
    # Son 30 gün sipariş sayısı
    total_orders_last_30_days_result = await db.execute(
        select(func.count(Order.id))
        .where(
            and_(
                Order.status == OrderStatus.PAID,
                Order.created_at >= thirty_days_ago
            )
        )
    )
    total_orders_last_30_days = int(total_orders_last_30_days_result.scalar() or 0)
    
    return OverviewStatsResponse(
        total_revenue=total_revenue,
        last_30_days_revenue=last_30_days_revenue,
        last_30_days_revenue_change=revenue_change,
        active_students=active_students,
        active_teachers=active_teachers,
        total_courses=total_courses,
        published_courses=published_courses,
        total_orders=total_orders,
        total_orders_last_30_days=total_orders_last_30_days,
        currency="TRY"
    )


@router.get("/admin/reports/earnings", response_model=EarningsReportResponse)
async def get_earnings_report(
    group_by: str = Query(..., description="Gruplama: 'course' veya 'teacher'"),
    interval: str = Query(..., description="Aralık: 'daily', 'weekly', 'monthly'"),
    date_from: datetime = Query(..., description="Başlangıç tarihi"),
    date_to: datetime = Query(..., description="Bitiş tarihi"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kurs veya eğitmen bazlı zaman serisi gelir raporu"""
    
    if group_by not in ["course", "teacher"]:
        raise HTTPException(status_code=400, detail="group_by 'course' veya 'teacher' olmalı")
    
    if interval not in ["daily", "weekly", "monthly"]:
        raise HTTPException(status_code=400, detail="interval 'daily', 'weekly' veya 'monthly' olmalı")
    
    # Timezone-aware datetime'ları timezone-naive'a çevir (PostgreSQL TIMESTAMP WITHOUT TIME ZONE için)
    # Eğer timezone-aware ise, UTC'ye normalize edip timezone bilgisini kaldır
    if date_from.tzinfo is not None:
        date_from = date_from.astimezone(timezone.utc).replace(tzinfo=None)
    if date_to.tzinfo is not None:
        date_to = date_to.astimezone(timezone.utc).replace(tzinfo=None)
    
    # Tarih aralığı validasyonu
    if date_from > date_to:
        raise HTTPException(status_code=400, detail="Başlangıç tarihi bitiş tarihinden sonra olamaz")
    
    if (date_to - date_from).days > 365:
        raise HTTPException(status_code=400, detail="Tarih aralığı en fazla 1 yıl olabilir")
    
    # Interval'e göre tarih formatı
    if interval == "daily":
        date_format = func.to_char(Order.created_at, "YYYY-MM-DD")
    elif interval == "weekly":
        date_format = func.to_char(Order.created_at, "IYYY-IW")  # ISO week
    else:  # monthly
        date_format = func.to_char(Order.created_at, "YYYY-MM")
    
    # Group by'a göre sorgu
    if group_by == "course":
        query = (
            select(
                date_format.label("label"),
                func.sum(OrderItem.final_price).label("value"),
                func.count(OrderItem.id).label("count")
            )
            .select_from(OrderItem)
            .join(Order, OrderItem.order_id == Order.id)
            .join(Course, OrderItem.course_id == Course.id)
            .where(
                and_(
                    Order.status == OrderStatus.PAID,
                    Order.created_at >= date_from,
                    Order.created_at <= date_to
                )
            )
            .group_by(date_format)
            .order_by(date_format)
        )
    else:  # teacher
        query = (
            select(
                date_format.label("label"),
                func.sum(OrderItem.final_price).label("value"),
                func.count(OrderItem.id).label("count")
            )
            .select_from(OrderItem)
            .join(Order, OrderItem.order_id == Order.id)
            .join(Course, OrderItem.course_id == Course.id)
            .join(User, Course.teacher_id == User.id)
            .where(
                and_(
                    Order.status == OrderStatus.PAID,
                    Order.created_at >= date_from,
                    Order.created_at <= date_to
                )
            )
            .group_by(date_format)
            .order_by(date_format)
        )
    
    result = await db.execute(query)
    rows = result.all()
    
    # Toplam ciro ve satış adedi
    total_revenue_result = await db.execute(
        select(
            func.coalesce(func.sum(OrderItem.final_price), 0).label("total_revenue"),
            func.count(OrderItem.id).label("total_count")
        )
        .select_from(OrderItem)
        .join(Order, OrderItem.order_id == Order.id)
        .where(
            and_(
                Order.status == OrderStatus.PAID,
                Order.created_at >= date_from,
                Order.created_at <= date_to
            )
        )
    )
    total_row = total_revenue_result.first()
    total_revenue = Decimal(str(total_row.total_revenue or 0))
    total_count = int(total_row.total_count or 0)
    
    # Zaman serisi verileri
    data = [
        TimeSeriesDataPoint(
            label=row.label,
            value=Decimal(str(row.value or 0)),
            count=int(row.count or 0)
        )
        for row in rows
    ]
    
    return EarningsReportResponse(
        group_by=group_by,
        interval=interval,
        date_from=date_from,
        date_to=date_to,
        data=data,
        total_revenue=total_revenue,
        total_count=total_count
    )


@router.get("/teachers/me/stats", response_model=TeacherStatsResponse)
async def get_teacher_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Öğretmenin kendi istatistiklerini getir"""
    
    teacher_id = current_user.id
    
    # Toplam kurs sayısı
    total_courses_result = await db.execute(
        select(func.count(Course.id))
        .where(Course.teacher_id == teacher_id)
    )
    total_courses = int(total_courses_result.scalar() or 0)
    
    # Toplam öğrenci sayısı (tüm kurslarına kayıtlı unique öğrenci)
    total_students_result = await db.execute(
        select(func.count(distinct(Enrollment.user_id)))
        .join(Course, Enrollment.course_id == Course.id)
        .where(Course.teacher_id == teacher_id)
    )
    total_students = int(total_students_result.scalar() or 0)
    
    # Toplam satış adedi (PAID siparişler)
    total_sales_result = await db.execute(
        select(func.count(OrderItem.id))
        .join(Order, OrderItem.order_id == Order.id)
        .join(Course, OrderItem.course_id == Course.id)
        .where(
            and_(
                Course.teacher_id == teacher_id,
                Order.status == OrderStatus.PAID
            )
        )
    )
    total_sales = int(total_sales_result.scalar() or 0)
    
    # Toplam gelir (TeacherEarning'den EARNING tipindeki pozitif tutarlar)
    total_revenue_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0))
        .where(
            and_(
                TeacherEarning.teacher_id == teacher_id,
                TeacherEarning.type == EarningType.EARNING
            )
        )
    )
    total_revenue = Decimal(str(total_revenue_result.scalar() or 0))
    
    # Bu ay gelir
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month_revenue_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0))
        .where(
            and_(
                TeacherEarning.teacher_id == teacher_id,
                TeacherEarning.type == EarningType.EARNING,
                TeacherEarning.created_at >= month_start
            )
        )
    )
    this_month_revenue = Decimal(str(this_month_revenue_result.scalar() or 0))
    
    # Geçen ay gelir
    if month_start.month == 1:
        last_month_start = datetime.utcnow().replace(year=month_start.year - 1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        last_month_start = datetime.utcnow().replace(month=month_start.month - 1, day=1, hour=0, minute=0, second=0, microsecond=0)
    
    last_month_revenue_result = await db.execute(
        select(func.coalesce(func.sum(TeacherEarning.amount), 0))
        .where(
            and_(
                TeacherEarning.teacher_id == teacher_id,
                TeacherEarning.type == EarningType.EARNING,
                TeacherEarning.created_at >= last_month_start,
                TeacherEarning.created_at < month_start
            )
        )
    )
    last_month_revenue = Decimal(str(last_month_revenue_result.scalar() or 0))
    
    # Geçen aya göre % değişim
    revenue_change_percentage = None
    if last_month_revenue > 0:
        revenue_change_percentage = float(
            ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100
        )
    
    # Ortalama kurs puanı (onaylanmış yorumlar üzerinden)
    avg_rating_result = await db.execute(
        select(func.avg(CourseReview.rating))
        .join(Course, CourseReview.course_id == Course.id)
        .where(
            and_(
                Course.teacher_id == teacher_id,
                CourseReview.is_approved == True
            )
        )
    )
    avg_rating_value = avg_rating_result.scalar()
    average_rating = float(avg_rating_value) if avg_rating_value is not None else None
    
    # Toplam yorum sayısı
    total_reviews_result = await db.execute(
        select(func.count(CourseReview.id))
        .join(Course, CourseReview.course_id == Course.id)
        .where(
            and_(
                Course.teacher_id == teacher_id,
                CourseReview.is_approved == True
            )
        )
    )
    total_reviews = int(total_reviews_result.scalar() or 0)
    
    # En çok satan kurslar (top 5)
    top_courses_query = (
        select(
            Course.id,
            Course.title,
            func.sum(OrderItem.final_price).label("total_revenue"),
            func.count(OrderItem.id).label("total_sales"),
            func.avg(CourseReview.rating).label("average_rating")
        )
        .join(OrderItem, Course.id == OrderItem.course_id)
        .join(Order, OrderItem.order_id == Order.id)
        .outerjoin(CourseReview, and_(
            CourseReview.course_id == Course.id,
            CourseReview.is_approved == True
        ))
        .where(
            and_(
                Course.teacher_id == teacher_id,
                Order.status == OrderStatus.PAID
            )
        )
        .group_by(Course.id, Course.title)
        .order_by(func.sum(OrderItem.final_price).desc())
        .limit(5)
    )
    top_courses_result = await db.execute(top_courses_query)
    top_courses = [
        TopCourseItem(
            course_id=str(row.id),
            course_title=row.title,
            total_revenue=Decimal(str(row.total_revenue or 0)),
            total_sales=int(row.total_sales or 0),
            average_rating=float(row.average_rating) if row.average_rating else None
        )
        for row in top_courses_result.all()
    ]
    
    # Son 6 ay gelir trendi (aylık)
    six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)
    # PostgreSQL TIMESTAMP WITHOUT TIME ZONE için timezone bilgisini kaldır
    if six_months_ago.tzinfo is not None:
        six_months_ago = six_months_ago.replace(tzinfo=None)
    
    # GROUP BY için date_format ifadesini bir değişkene al
    # PostgreSQL'de GROUP BY ve ORDER BY'da aynı ifadeyi kullanmak gerekir
    # Diğer sorgularda (get_earnings_report) aynı pattern kullanılıyor ve çalışıyor
    date_format = func.to_char(TeacherEarning.created_at, "YYYY-MM")
    
    monthly_trend_query = (
        select(
            date_format.label("label"),
            func.sum(TeacherEarning.amount).label("value")
        )
        .where(
            and_(
                TeacherEarning.teacher_id == teacher_id,
                TeacherEarning.type == EarningType.EARNING,
                TeacherEarning.created_at >= six_months_ago
            )
        )
        .group_by(date_format)
        .order_by(date_format)
    )
    monthly_trend_result = await db.execute(monthly_trend_query)
    monthly_revenue_trend = [
        TimeSeriesDataPoint(
            label=row.label,
            value=Decimal(str(row.value or 0))
        )
        for row in monthly_trend_result.all()
    ]
    
    return TeacherStatsResponse(
        total_courses=total_courses,
        total_students=total_students,
        total_sales=total_sales,
        total_revenue=total_revenue,
        this_month_revenue=this_month_revenue,
        last_month_revenue=last_month_revenue,
        revenue_change_percentage=revenue_change_percentage,
        average_rating=average_rating,
        total_reviews=total_reviews,
        top_courses=top_courses,
        monthly_revenue_trend=monthly_revenue_trend,
        currency="TRY"
    )


@router.get("/admin/reports/category-analytics", response_model=CategoryAnalyticsResponse)
async def get_category_analytics(
    date_from: Optional[datetime] = Query(None, description="Başlangıç tarihi (opsiyonel)"),
    date_to: Optional[datetime] = Query(None, description="Bitiş tarihi (opsiyonel)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kategori bazlı analiz raporu"""
    
    # Timezone-aware datetime'ları timezone-naive'a çevir
    if date_from and date_from.tzinfo is not None:
        date_from = date_from.astimezone(timezone.utc).replace(tzinfo=None)
    if date_to and date_to.tzinfo is not None:
        date_to = date_to.astimezone(timezone.utc).replace(tzinfo=None)
    
    # Kategori bazlı sorgu
    query = (
        select(
            Category.id,
            Category.name,
            func.count(distinct(Course.id)).label("total_courses"),
            func.coalesce(func.sum(OrderItem.final_price), 0).label("total_revenue"),
            func.count(OrderItem.id).label("total_sales"),
            func.avg(CourseReview.rating).label("average_rating"),
            func.count(distinct(Enrollment.id)).label("total_enrollments")
        )
        .select_from(Category)
        .join(course_categories, Category.id == course_categories.c.category_id)
        .join(Course, course_categories.c.course_id == Course.id)
        .outerjoin(OrderItem, OrderItem.course_id == Course.id)
        .outerjoin(Order, and_(
            OrderItem.order_id == Order.id,
            Order.status == OrderStatus.PAID
        ))
        .outerjoin(CourseReview, and_(
            CourseReview.course_id == Course.id,
            CourseReview.is_approved == True
        ))
        .outerjoin(Enrollment, Enrollment.course_id == Course.id)
        .where(Category.is_active == True)
    )
    
    # Tarih filtresi (sadece Order varsa uygula)
    if date_from or date_to:
        order_conditions = []
        if date_from:
            order_conditions.append(Order.created_at >= date_from)
        if date_to:
            order_conditions.append(Order.created_at <= date_to)
        if order_conditions:
            query = query.where(or_(
                Order.id.is_(None),  # Order yoksa (kategori var ama satış yok)
                and_(*order_conditions)  # Order varsa tarih filtresi uygula
            ))
    
    query = query.group_by(Category.id, Category.name)
    
    result = await db.execute(query)
    rows = result.all()
    
    # Toplam değerler
    total_revenue = Decimal("0")
    total_courses = 0
    total_sales = 0
    
    data = []
    for row in rows:
        category_revenue = Decimal(str(row.total_revenue or 0))
        category_sales = int(row.total_sales or 0)
        category_courses = int(row.total_courses or 0)
        
        total_revenue += category_revenue
        total_courses += category_courses
        total_sales += category_sales
        
        data.append(CategoryAnalyticsItem(
            category_id=str(row.id),
            category_name=row.name,
            total_courses=category_courses,
            total_revenue=category_revenue,
            total_sales=category_sales,
            average_rating=float(row.average_rating) if row.average_rating else None,
            total_enrollments=int(row.total_enrollments or 0)
        ))
    
    return CategoryAnalyticsResponse(
        data=data,
        total_revenue=total_revenue,
        total_courses=total_courses,
        total_sales=total_sales
    )


@router.get("/admin/reports/course-performance", response_model=CoursePerformanceResponse)
async def get_course_performance(
    limit: int = Query(50, ge=1, le=200, description="Top N kurs"),
    date_from: Optional[datetime] = Query(None, description="Başlangıç tarihi (opsiyonel)"),
    date_to: Optional[datetime] = Query(None, description="Bitiş tarihi (opsiyonel)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Kurs performans raporu (en çok kazandıran, en çok satan vb.)"""
    
    # Timezone-aware datetime'ları timezone-naive'a çevir
    if date_from and date_from.tzinfo is not None:
        date_from = date_from.astimezone(timezone.utc).replace(tzinfo=None)
    if date_to and date_to.tzinfo is not None:
        date_to = date_to.astimezone(timezone.utc).replace(tzinfo=None)
    
    # Kurs performans sorgusu
    query = (
        select(
            Course.id,
            Course.title,
            User.full_name.label("teacher_name"),
            func.coalesce(func.sum(OrderItem.final_price), 0).label("total_revenue"),
            func.count(OrderItem.id).label("total_sales"),
            func.count(distinct(Enrollment.id)).label("total_enrollments"),
            func.avg(CourseReview.rating).label("average_rating"),
            func.avg(
                case(
                    (Enrollment.completed_at.isnot(None), 100),
                    else_=Enrollment.progress_percentage
                )
            ).label("completion_rate")
        )
        .select_from(Course)
        .join(User, Course.teacher_id == User.id)
        .outerjoin(OrderItem, OrderItem.course_id == Course.id)
        .outerjoin(Order, and_(
            OrderItem.order_id == Order.id,
            Order.status == OrderStatus.PAID
        ))
        .outerjoin(Enrollment, Enrollment.course_id == Course.id)
        .outerjoin(CourseReview, and_(
            CourseReview.course_id == Course.id,
            CourseReview.is_approved == True
        ))
        .where(Course.status == "published")
    )
    
    # Tarih filtresi (sadece Order varsa uygula)
    if date_from or date_to:
        order_conditions = []
        if date_from:
            order_conditions.append(Order.created_at >= date_from)
        if date_to:
            order_conditions.append(Order.created_at <= date_to)
        if order_conditions:
            query = query.where(or_(
                Order.id.is_(None),  # Order yoksa (kurs var ama satış yok)
                and_(*order_conditions)  # Order varsa tarih filtresi uygula
            ))
    
    query = query.group_by(Course.id, Course.title, User.full_name)
    
    # İade oranı hesaplama için ayrı sorgu
    refund_query = (
        select(
            OrderItem.course_id,
            func.count(case((Order.status == OrderStatus.REFUNDED, 1))).label("refund_count"),
            func.count(OrderItem.id).label("total_orders")
        )
        .select_from(OrderItem)
        .join(Order, OrderItem.order_id == Order.id)
        .where(Order.status.in_([OrderStatus.PAID, OrderStatus.REFUNDED]))
    )
    
    if date_from:
        refund_query = refund_query.where(Order.created_at >= date_from)
    if date_to:
        refund_query = refund_query.where(Order.created_at <= date_to)
    
    refund_query = refund_query.group_by(OrderItem.course_id)
    refund_result = await db.execute(refund_query)
    refund_data = {str(row.course_id): (int(row.refund_count or 0), int(row.total_orders or 0)) for row in refund_result.all()}
    
    query = query.order_by(func.sum(OrderItem.final_price).desc()).limit(limit)
    result = await db.execute(query)
    rows = result.all()
    
    total_revenue = Decimal("0")
    total_courses = len(rows)
    total_sales = 0
    
    data = []
    for row in rows:
        course_revenue = Decimal(str(row.total_revenue or 0))
        course_sales = int(row.total_sales or 0)
        total_revenue += course_revenue
        total_sales += course_sales
        
        refund_info = refund_data.get(str(row.id), (0, 0))
        refund_rate = (refund_info[0] / refund_info[1] * 100) if refund_info[1] > 0 else 0.0
        
        data.append(CoursePerformanceItem(
            course_id=str(row.id),
            course_title=row.title,
            teacher_name=row.teacher_name or "Bilinmiyor",
            total_revenue=course_revenue,
            total_sales=course_sales,
            total_enrollments=int(row.total_enrollments or 0),
            completion_rate=float(row.completion_rate) if row.completion_rate else None,
            average_rating=float(row.average_rating) if row.average_rating else None,
            refund_rate=refund_rate if refund_rate > 0 else None
        ))
    
    return CoursePerformanceResponse(
        data=data,
        total_revenue=total_revenue,
        total_courses=total_courses,
        total_sales=total_sales
    )


@router.get("/admin/reports/student-analytics", response_model=StudentAnalyticsResponse)
async def get_student_analytics(
    limit: int = Query(100, ge=1, le=500, description="Top N öğrenci"),
    date_from: Optional[datetime] = Query(None, description="Başlangıç tarihi (opsiyonel)"),
    date_to: Optional[datetime] = Query(None, description="Bitiş tarihi (opsiyonel)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Öğrenci analiz raporu (en aktif, en çok harcayan, en çok tamamlayan vb.)"""
    
    # Timezone-aware datetime'ları timezone-naive'a çevir
    if date_from and date_from.tzinfo is not None:
        date_from = date_from.astimezone(timezone.utc).replace(tzinfo=None)
    if date_to and date_to.tzinfo is not None:
        date_to = date_to.astimezone(timezone.utc).replace(tzinfo=None)
    
    # Öğrenci analiz sorgusu
    query = (
        select(
            User.id,
            User.full_name,
            User.email,
            func.count(distinct(Enrollment.id)).label("total_enrollments"),
            func.count(case((Enrollment.completed_at.isnot(None), 1))).label("completed_courses"),
            func.coalesce(func.sum(Order.total), 0).label("total_spent"),
            func.avg(Enrollment.progress_percentage).label("average_completion_rate"),
            func.max(Enrollment.last_accessed_at).label("last_activity_at"),
            func.min(Enrollment.enrolled_at).label("enrolled_at"),
            func.count(distinct(LessonProgress.id)).label("total_lessons_watched"),
            func.coalesce(func.sum(LessonProgress.watched_seconds), 0).label("total_watch_time_seconds")
        )
        .select_from(User)
        .outerjoin(Enrollment, Enrollment.user_id == User.id)
        .outerjoin(Order, and_(
            Order.user_id == User.id,
            Order.status == OrderStatus.PAID
        ))
        .outerjoin(LessonProgress, LessonProgress.user_id == User.id)
        .where(User.role == UserRole.STUDENT)
    )
    
    # Tarih filtresi
    if date_from:
        query = query.where(or_(
            Enrollment.enrolled_at >= date_from,
            Order.created_at >= date_from,
            LessonProgress.last_accessed_at >= date_from
        ))
    if date_to:
        query = query.where(or_(
            Enrollment.enrolled_at <= date_to,
            Order.created_at <= date_to,
            LessonProgress.last_accessed_at <= date_to
        ))
    
    query = query.group_by(User.id, User.full_name, User.email)
    
    # Sıralama: En çok harcayan
    query = query.order_by(func.sum(Order.total).desc()).limit(limit)
    
    result = await db.execute(query)
    rows = result.all()
    
    total_students = len(rows)
    total_enrollments = 0
    total_revenue = Decimal("0")
    total_completion_rates = []
    
    data = []
    for row in rows:
        student_enrollments = int(row.total_enrollments or 0)
        student_completed = int(row.completed_courses or 0)
        student_spent = Decimal(str(row.total_spent or 0))
        student_completion_rate = float(row.average_completion_rate) if row.average_completion_rate else None
        student_lessons_watched = int(row.total_lessons_watched or 0)
        student_watch_time_seconds = int(row.total_watch_time_seconds or 0)
        
        total_enrollments += student_enrollments
        total_revenue += student_spent
        if student_completion_rate is not None:
            total_completion_rates.append(student_completion_rate)
        
        data.append(StudentAnalyticsItem(
            student_id=str(row.id),
            student_name=row.full_name or "Bilinmiyor",
            student_email=row.email or "",
            total_enrollments=student_enrollments,
            completed_courses=student_completed,
            total_spent=student_spent,
            average_completion_rate=student_completion_rate,
            last_activity_at=row.last_activity_at.isoformat() if row.last_activity_at else None,
            enrolled_at=row.enrolled_at if row.enrolled_at else datetime.utcnow(),
            total_lessons_watched=student_lessons_watched,
            total_watch_time_minutes=student_watch_time_seconds // 60
        ))
    
    avg_completion_rate = sum(total_completion_rates) / len(total_completion_rates) if total_completion_rates else None
    
    return StudentAnalyticsResponse(
        data=data,
        total_students=total_students,
        total_enrollments=total_enrollments,
        total_revenue=total_revenue,
        average_completion_rate=avg_completion_rate
    )


@router.get("/admin/reports/teacher-performance", response_model=TeacherPerformanceResponse)
async def get_teacher_performance(
    limit: int = Query(50, ge=1, le=200, description="Top N eğitmen"),
    date_from: Optional[datetime] = Query(None, description="Başlangıç tarihi (opsiyonel)"),
    date_to: Optional[datetime] = Query(None, description="Bitiş tarihi (opsiyonel)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Eğitmen performans raporu (en çok kazandıran, en çok öğrenciye sahip vb.)"""
    
    # Timezone-aware datetime'ları timezone-naive'a çevir
    if date_from and date_from.tzinfo is not None:
        date_from = date_from.astimezone(timezone.utc).replace(tzinfo=None)
    if date_to and date_to.tzinfo is not None:
        date_to = date_to.astimezone(timezone.utc).replace(tzinfo=None)
    
    # Eğitmen performans sorgusu
    query = (
        select(
            User.id,
            User.full_name,
            func.count(distinct(Course.id)).label("total_courses"),
            func.count(case((Course.status == "published", 1))).label("published_courses"),
            func.count(distinct(Enrollment.user_id)).label("total_students"),
            func.coalesce(func.sum(OrderItem.final_price), 0).label("total_revenue"),
            func.count(OrderItem.id).label("total_sales"),
            func.avg(CourseReview.rating).label("average_rating"),
            func.count(CourseReview.id).label("total_reviews"),
            func.avg(
                case(
                    (Enrollment.completed_at.isnot(None), 100),
                    else_=Enrollment.progress_percentage
                )
            ).label("average_completion_rate")
        )
        .select_from(User)
        .join(Course, Course.teacher_id == User.id)
        .outerjoin(Enrollment, Enrollment.course_id == Course.id)
        .outerjoin(OrderItem, OrderItem.course_id == Course.id)
        .outerjoin(Order, and_(
            OrderItem.order_id == Order.id,
            Order.status == OrderStatus.PAID
        ))
        .outerjoin(CourseReview, and_(
            CourseReview.course_id == Course.id,
            CourseReview.is_approved == True
        ))
        .where(User.role == UserRole.TEACHER)
    )
    
    # Tarih filtresi
    if date_from or date_to:
        order_conditions = []
        if date_from:
            order_conditions.append(Order.created_at >= date_from)
        if date_to:
            order_conditions.append(Order.created_at <= date_to)
        if order_conditions:
            query = query.where(or_(
                Order.id.is_(None),
                and_(*order_conditions)
            ))
    
    query = query.group_by(User.id, User.full_name)
    
    # İade oranı hesaplama için ayrı sorgu
    refund_query = (
        select(
            Course.teacher_id,
            func.count(case((Order.status == OrderStatus.REFUNDED, 1))).label("refund_count"),
            func.count(OrderItem.id).label("total_orders")
        )
        .select_from(OrderItem)
        .join(Order, OrderItem.order_id == Order.id)
        .join(Course, OrderItem.course_id == Course.id)
        .where(Order.status.in_([OrderStatus.PAID, OrderStatus.REFUNDED]))
    )
    
    if date_from:
        refund_query = refund_query.where(Order.created_at >= date_from)
    if date_to:
        refund_query = refund_query.where(Order.created_at <= date_to)
    
    refund_query = refund_query.group_by(Course.teacher_id)
    refund_result = await db.execute(refund_query)
    refund_data = {str(row.teacher_id): (int(row.refund_count or 0), int(row.total_orders or 0)) for row in refund_result.all()}
    
    query = query.order_by(func.sum(OrderItem.final_price).desc()).limit(limit)
    result = await db.execute(query)
    rows = result.all()
    
    total_teachers = len(rows)
    total_revenue = Decimal("0")
    total_courses = 0
    total_students = 0
    
    data = []
    for row in rows:
        teacher_revenue = Decimal(str(row.total_revenue or 0))
        teacher_sales = int(row.total_sales or 0)
        teacher_courses = int(row.total_courses or 0)
        teacher_published = int(row.published_courses or 0)
        teacher_students = int(row.total_students or 0)
        
        total_revenue += teacher_revenue
        total_courses += teacher_courses
        total_students += teacher_students
        
        refund_info = refund_data.get(str(row.id), (0, 0))
        refund_rate = (refund_info[0] / refund_info[1] * 100) if refund_info[1] > 0 else 0.0
        
        data.append(TeacherPerformanceItem(
            teacher_id=str(row.id),
            teacher_name=row.full_name or "Bilinmiyor",
            total_courses=teacher_courses,
            published_courses=teacher_published,
            total_students=teacher_students,
            total_revenue=teacher_revenue,
            total_sales=teacher_sales,
            average_rating=float(row.average_rating) if row.average_rating else None,
            total_reviews=int(row.total_reviews or 0),
            average_completion_rate=float(row.average_completion_rate) if row.average_completion_rate else None,
            refund_rate=refund_rate if refund_rate > 0 else None
        ))
    
    return TeacherPerformanceResponse(
        data=data,
        total_teachers=total_teachers,
        total_revenue=total_revenue,
        total_courses=total_courses,
        total_students=total_students
    )


@router.get("/admin/content-overview")
async def get_content_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Platform geneli içerik istatistikleri (EP10-BE-09)
    
    SECURITY:
    - Admin only
    - Tenant ve role izolasyonu korunmalı (organization bazlı veri sızıntısı önleme)
    
    PRODUCT:
    - Quota kullanım metriği (storage sürdürülebilirliği için kritik)
    - Tip bazlı kırılım
    - En çok içerik yükleyen eğitmenler
    - Son 30 gün içerik yükleme trendi
    """
    # Toplam ders sayısı ve tip bazlı kırılım
    lessons_result = await db.execute(
        select(
            Lesson.lesson_type,
            func.count(Lesson.id).label("count"),
            func.coalesce(func.sum(Lesson.file_size_bytes), 0).label("total_size")
        )
        .group_by(Lesson.lesson_type)
    )
    lessons_stats = lessons_result.all()
    
    # Tip bazlı kırılım oluştur
    type_breakdown = {}
    total_lessons = 0
    total_file_size_bytes = 0
    
    for stat in lessons_stats:
        lesson_type_value = stat.lesson_type.value if hasattr(stat.lesson_type, 'value') else str(stat.lesson_type)
        type_breakdown[lesson_type_value] = int(stat.count)
        total_lessons += int(stat.count)
        total_file_size_bytes += int(stat.total_size or 0)
    
    # En çok içerik yükleyen eğitmenler (top 10)
    top_teachers_result = await db.execute(
        select(
            User.id,
            User.full_name,
            func.count(Lesson.id).label("lesson_count"),
            func.coalesce(func.sum(Lesson.file_size_bytes), 0).label("total_size")
        )
        .select_from(Lesson)
        .join(Course, Lesson.course_id == Course.id)
        .join(User, Course.teacher_id == User.id)
        .group_by(User.id, User.full_name)
        .order_by(func.count(Lesson.id).desc())
        .limit(10)
    )
    top_teachers = [
        {
            "teacher_id": row.id,
            "teacher_name": row.full_name,
            "lesson_count": int(row.lesson_count),
            "total_size_bytes": int(row.total_size or 0),
            "total_size_mb": round(int(row.total_size or 0) / (1024 * 1024), 2),
        }
        for row in top_teachers_result.all()
    ]
    
    # Son 30 gün içerik yükleme trendi (günlük)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_uploads_result = await db.execute(
        select(
            func.date(Lesson.created_at).label("date"),
            func.count(Lesson.id).label("count")
        )
        .where(Lesson.created_at >= thirty_days_ago)
        .group_by(func.date(Lesson.created_at))
        .order_by(func.date(Lesson.created_at))
    )
    daily_uploads = [
        {
            "date": row.date.isoformat() if row.date else None,
            "count": int(row.count),
        }
        for row in daily_uploads_result.all()
    ]
    
    # Storage kullanım yüzdesi (config'deki limitle karşılaştırma)
    # Şimdilik placeholder, EP10-BE-14'te quota system eklenecek
    from app.core.config import settings
    # MAX_STORAGE_GB config'den okunacak (şimdilik yok, placeholder)
    max_storage_bytes = getattr(settings, 'MAX_STORAGE_GB', None)
    if max_storage_bytes:
        max_storage_bytes = max_storage_bytes * 1024 * 1024 * 1024  # GB to bytes
        storage_usage_percent = (total_file_size_bytes / max_storage_bytes) * 100 if max_storage_bytes > 0 else 0
    else:
        storage_usage_percent = None
    
    return {
        "total_lessons": total_lessons,
        "total_file_size_bytes": total_file_size_bytes,
        "total_file_size_gb": round(total_file_size_bytes / (1024 * 1024 * 1024), 2),
        "type_breakdown": type_breakdown,
        "top_teachers": top_teachers,
        "daily_uploads_last_30_days": daily_uploads,
        "storage_usage_percent": storage_usage_percent,
    }
