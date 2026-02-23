from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class OverviewStatsResponse(BaseModel):
    """Admin overview istatistikleri"""
    total_revenue: Decimal  # Toplam ciro (tüm zamanlar)
    last_30_days_revenue: Decimal  # Son 30 gün ciro
    last_30_days_revenue_change: Optional[float] = None  # Geçen 30 güne göre % değişim
    active_students: int  # Aktif öğrenci sayısı (son 30 günde giriş yapan)
    active_teachers: int  # Aktif eğitmen sayısı (son 30 günde giriş yapan veya kurs ekleyen)
    total_courses: int  # Toplam kurs sayısı
    published_courses: int  # Yayında olan kurs sayısı
    total_orders: int  # Toplam sipariş sayısı
    total_orders_last_30_days: int  # Son 30 gün sipariş sayısı
    currency: str = "TRY"


class TimeSeriesDataPoint(BaseModel):
    """Zaman serisi veri noktası"""
    label: str  # Tarih etiketi (örn: "2026-01", "2026-01-15")
    value: Decimal  # Değer (ciro, satış adedi vb.)
    count: Optional[int] = None  # Satış adedi (opsiyonel)


class EarningsReportResponse(BaseModel):
    """Kurs/Eğitmen bazlı gelir raporu"""
    group_by: str  # "course" veya "teacher"
    interval: str  # "daily", "weekly", "monthly"
    date_from: datetime
    date_to: datetime
    data: list[TimeSeriesDataPoint]  # Zaman serisi verileri
    total_revenue: Decimal
    total_count: int  # Toplam satış adedi


class TopCourseItem(BaseModel):
    """En çok kazandıran kurs"""
    course_id: str
    course_title: str
    total_revenue: Decimal
    total_sales: int
    average_rating: Optional[float] = None


class TopTeacherItem(BaseModel):
    """En çok kazandıran eğitmen"""
    teacher_id: str
    teacher_name: str
    total_revenue: Decimal
    total_sales: int
    total_courses: int


class TeacherStatsResponse(BaseModel):
    """Öğretmen istatistikleri"""
    # Genel istatistikler
    total_courses: int
    total_students: int  # Toplam öğrenci sayısı (tüm kurslarına kayıtlı)
    total_sales: int  # Toplam satış adedi
    total_revenue: Decimal  # Toplam gelir
    this_month_revenue: Decimal  # Bu ay gelir
    last_month_revenue: Decimal  # Geçen ay gelir
    revenue_change_percentage: Optional[float] = None  # Geçen aya göre % değişim
    
    # Rating istatistikleri
    average_rating: Optional[float] = None  # Ortalama kurs puanı
    total_reviews: int  # Toplam yorum sayısı
    
    # En çok satan kurslar
    top_courses: list[TopCourseItem]
    
    # Son 6 ay gelir trendi
    monthly_revenue_trend: list[TimeSeriesDataPoint]
    
    currency: str = "TRY"


class CategoryAnalyticsItem(BaseModel):
    """Kategori bazlı analiz öğesi"""
    category_id: str
    category_name: str
    total_courses: int
    total_revenue: Decimal
    total_sales: int
    average_rating: Optional[float] = None
    total_enrollments: int


class CategoryAnalyticsResponse(BaseModel):
    """Kategori bazlı analiz raporu"""
    data: list[CategoryAnalyticsItem]
    total_revenue: Decimal
    total_courses: int
    total_sales: int


class CoursePerformanceItem(BaseModel):
    """Kurs performans öğesi"""
    course_id: str
    course_title: str
    teacher_name: str
    total_revenue: Decimal
    total_sales: int
    total_enrollments: int
    completion_rate: Optional[float] = None  # Tamamlama oranı
    average_rating: Optional[float] = None
    refund_rate: Optional[float] = None  # İade oranı


class CoursePerformanceResponse(BaseModel):
    """Kurs performans raporu"""
    data: list[CoursePerformanceItem]
    total_revenue: Decimal
    total_courses: int
    total_sales: int


class StudentAnalyticsItem(BaseModel):
    """Öğrenci analiz öğesi"""
    student_id: str
    student_name: str
    student_email: str
    total_enrollments: int
    completed_courses: int
    total_spent: Decimal
    average_completion_rate: Optional[float] = None
    last_activity_at: Optional[datetime] = None
    enrolled_at: datetime
    total_lessons_watched: int
    total_watch_time_minutes: int


class StudentAnalyticsResponse(BaseModel):
    """Öğrenci analiz raporu"""
    data: list[StudentAnalyticsItem]
    total_students: int
    total_enrollments: int
    total_revenue: Decimal
    average_completion_rate: Optional[float] = None


class TeacherPerformanceItem(BaseModel):
    """Eğitmen performans öğesi"""
    teacher_id: str
    teacher_name: str
    total_courses: int
    published_courses: int
    total_students: int
    total_revenue: Decimal
    total_sales: int
    average_rating: Optional[float] = None
    total_reviews: int
    average_completion_rate: Optional[float] = None
    refund_rate: Optional[float] = None


class TeacherPerformanceResponse(BaseModel):
    """Eğitmen performans raporu"""
    data: list[TeacherPerformanceItem]
    total_teachers: int
    total_revenue: Decimal
    total_courses: int
    total_students: int
