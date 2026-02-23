"""Review moderation and rating calculation service"""
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course_review import CourseReview
from app.models.course import Course


async def recalculate_course_rating(db: AsyncSession, course_id: str) -> None:
    """
    Kursun ortalama rating'ini yeniden hesapla.
    Sadece onaylanmış yorumlar (is_approved=True) puana etki eder.
    """
    # Onaylanmış yorumların ortalama rating'ini hesapla
    result = await db.execute(
        select(
            func.avg(CourseReview.rating).label("avg_rating"),
            func.count(CourseReview.id).label("total_reviews")
        )
        .where(
            CourseReview.course_id == course_id,
            CourseReview.is_approved == True
        )
    )
    stats = result.first()
    
    # Course modelinde average_rating alanı yok, bu yüzden şimdilik sadece hesaplıyoruz
    # İleride Course modeline average_rating alanı eklenebilir
    # Şimdilik sadece stats endpoint'inde kullanılıyor
    avg_rating = float(stats.avg_rating) if stats.avg_rating else 0.0
    total_reviews = stats.total_reviews or 0
    
    # İleride Course modeline average_rating eklenirse:
    # course = await db.get(Course, course_id)
    # if course:
    #     course.average_rating = avg_rating
    #     await db.commit()
    
    return avg_rating, total_reviews
