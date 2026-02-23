from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.course_review import CourseReview
from app.models.order import Enrollment
from app.models.course import Course
from app.models.notification import NotificationType, NotificationPriority
from pydantic import BaseModel, Field
from app.schemas.course_review import (
    CourseReviewCreate, CourseReviewUpdate, CourseReviewResponse,
    ReviewApproveRequest, ReviewRejectRequest
)
from app.services.review_service import recalculate_course_rating
from app.services.notification_service import NotificationService

router = APIRouter()


@router.get("/courses/{course_id}/reviews", response_model=list[CourseReviewResponse])
async def get_course_reviews(
    course_id: str,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Kurs yorumlarını getir"""
    result = await db.execute(
        select(CourseReview)
        .options(selectinload(CourseReview.user))
        .where(CourseReview.course_id == course_id, CourseReview.is_approved == True)
        .order_by(CourseReview.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    reviews = result.scalars().all()
    
    # User bilgilerini ekle
    reviews_with_user = []
    for review in reviews:
        review_dict = {
            "id": review.id,
            "user_id": review.user_id,
            "course_id": review.course_id,
            "enrollment_id": review.enrollment_id,
            "rating": review.rating,
            "title": review.title,
            "comment": review.comment,
            "is_approved": review.is_approved,
            "is_helpful_count": review.is_helpful_count,
            "teacher_reply": review.teacher_reply,
            "teacher_reply_at": review.teacher_reply_at.isoformat() if review.teacher_reply_at else None,
            "created_at": review.created_at,
            "updated_at": review.updated_at,
            "user": {
                "id": review.user.id,
                "full_name": review.user.full_name,
            },
        }
        reviews_with_user.append(review_dict)
    
    return reviews_with_user


@router.get("/courses/{course_id}/reviews/stats")
async def get_course_review_stats(
    course_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Kurs yorum istatistiklerini getir (ortalama puan, toplam yorum sayısı)"""
    result = await db.execute(
        select(
            func.avg(CourseReview.rating).label("avg_rating"),
            func.count(CourseReview.id).label("total_reviews")
        )
        .where(CourseReview.course_id == course_id, CourseReview.is_approved == True)
    )
    stats = result.first()
    
    return {
        "average_rating": float(stats.avg_rating) if stats.avg_rating else 0.0,
        "total_reviews": stats.total_reviews or 0,
    }


@router.post("/courses/{course_id}/reviews", response_model=CourseReviewResponse)
async def create_course_review(
    course_id: str,
    review_in: CourseReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kurs yorumu oluştur"""
    # Kullanıcının kursa kayıtlı olup olmadığını kontrol et
    enrollment_result = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == course_id
        )
    )
    enrollment = enrollment_result.scalar_one_or_none()
    
    # Kayıtlı değilse yorum yapamaz
    if not enrollment:
        raise HTTPException(status_code=403, detail="Bu kursa kayıtlı değilsiniz. Yorum yapmak için önce kursa kaydolmalısınız.")

    # Kullanıcının daha önce yorum yapıp yapmadığını kontrol et
    existing_review_result = await db.execute(
        select(CourseReview).where(
            CourseReview.user_id == current_user.id,
            CourseReview.course_id == course_id
        )
    )
    existing_review = existing_review_result.scalar_one_or_none()
    if existing_review:
        raise HTTPException(status_code=400, detail="Bu kurs için zaten yorum yaptınız")

    # Yorum içeriği validasyonu - en az title veya comment olmalı
    title_clean = review_in.title.strip() if review_in.title else ""
    comment_clean = review_in.comment.strip() if review_in.comment else ""
    
    if not title_clean and not comment_clean:
        raise HTTPException(
            status_code=400,
            detail="Yorum başlığı veya yorum metni doldurulmalıdır"
        )

    review = CourseReview(
        user_id=current_user.id,
        course_id=course_id,
        enrollment_id=enrollment.id if enrollment else None,
        rating=review_in.rating,
        title=title_clean if title_clean else None,
        comment=comment_clean if comment_clean else None,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    
    # User bilgisini ekle
    review_dict = {
        "id": review.id,
        "user_id": review.user_id,
        "course_id": review.course_id,
        "enrollment_id": review.enrollment_id,
        "rating": review.rating,
        "title": review.title,
        "comment": review.comment,
        "is_approved": review.is_approved,
        "is_helpful_count": review.is_helpful_count,
        "teacher_reply": review.teacher_reply,
        "teacher_reply_at": review.teacher_reply_at.isoformat() if review.teacher_reply_at else None,
        "created_at": review.created_at,
        "updated_at": review.updated_at,
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
        },
    }
    
    return review_dict


@router.get("/courses/{course_id}/reviews/me", response_model=CourseReviewResponse | None)
async def get_my_course_review(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kullanıcının bu kurs için yaptığı yorumu getir"""
    result = await db.execute(
        select(CourseReview)
        .options(selectinload(CourseReview.user))
        .where(
            CourseReview.user_id == current_user.id,
            CourseReview.course_id == course_id
        )
    )
    review = result.scalar_one_or_none()
    if not review:
        return None
    
    review_dict = {
        "id": review.id,
        "user_id": review.user_id,
        "course_id": review.course_id,
        "enrollment_id": review.enrollment_id,
        "rating": review.rating,
        "title": review.title,
        "comment": review.comment,
        "is_approved": review.is_approved,
        "is_helpful_count": review.is_helpful_count,
        "teacher_reply": review.teacher_reply,
        "teacher_reply_at": review.teacher_reply_at.isoformat() if review.teacher_reply_at else None,
        "approved_at": review.approved_at.isoformat() if review.approved_at else None,
        "moderation_note": review.moderation_note,
        "created_at": review.created_at,
        "updated_at": review.updated_at,
        "user": {
            "id": review.user.id,
            "full_name": review.user.full_name,
        },
    }
    return review_dict


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Admin yetkisi kontrolü"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


@router.get("/admin/reviews", response_model=list[dict])
async def get_all_reviews_admin(
    skip: int = 0,
    limit: int = 50,
    is_approved: bool | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin için tüm yorumları getir"""
    query = select(CourseReview).options(
        selectinload(CourseReview.user),
        selectinload(CourseReview.course)
    ).order_by(CourseReview.created_at.desc())
    
    if is_approved is not None:
        query = query.where(CourseReview.is_approved == is_approved)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    reviews = result.scalars().all()
    
    reviews_list = []
    for review in reviews:
        reviews_list.append({
            "id": review.id,
            "user_id": review.user_id,
            "course_id": review.course_id,
            "enrollment_id": review.enrollment_id,
            "rating": review.rating,
            "title": review.title,
            "comment": review.comment,
            "is_approved": review.is_approved,
            "is_helpful_count": review.is_helpful_count,
            "created_at": review.created_at.isoformat(),
            "updated_at": review.updated_at.isoformat(),
            "user": {
                "id": review.user.id,
                "full_name": review.user.full_name,
                "email": review.user.email,
            },
            "course": {
                "id": review.course.id if review.course else None,
                "title": review.course.title if review.course else "Kurs silinmiş",
                "slug": review.course.slug if review.course else None,
            } if review.course else None,
            "approved_at": review.approved_at.isoformat() if review.approved_at else None,
            "approved_by_admin_id": review.approved_by_admin_id,
            "moderation_note": review.moderation_note,
            "teacher_reply": review.teacher_reply,
            "teacher_reply_at": review.teacher_reply_at.isoformat() if review.teacher_reply_at else None,
        })
    
    return reviews_list


@router.post("/admin/reviews/{review_id}/approve", response_model=dict)
async def approve_review(
    review_id: str,
    request: ReviewApproveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yorumu onayla"""
    result = await db.execute(
        select(CourseReview)
        .options(selectinload(CourseReview.user), selectinload(CourseReview.course))
        .where(CourseReview.id == review_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    if review.is_approved:
        raise HTTPException(status_code=400, detail="Yorum zaten onaylanmış")
    
    # Yorumu onayla
    review.is_approved = True
    review.approved_at = datetime.utcnow()
    review.approved_by_admin_id = current_user.id
    review.moderation_note = request.moderation_note
    
    await db.commit()
    await db.refresh(review)
    
    # Rating'i yeniden hesapla
    await recalculate_course_rating(db, review.course_id)
    
    # Öğrenciye bildirim gönder
    notification_service = NotificationService(db)
    await notification_service.send_notification(
        user_ids=[review.user_id],
        notification_type=NotificationType.REVIEW_APPROVED,
        title="Yorumunuz Onaylandı",
        message=f'"{review.course.title if review.course else "Kurs"}" kursuna yaptığınız yorum onaylandı.',
        priority=NotificationPriority.MEDIUM,
        delivery_channels=["in_app", "email"],
        action_url=f"/courses/{review.course.slug if review.course else ''}",
        action_label="Kursu Görüntüle",
        sender_id=current_user.id,
    )
    await db.commit()
    
    return {
        "id": review.id,
        "is_approved": review.is_approved,
        "approved_at": review.approved_at.isoformat(),
        "message": "Yorum onaylandı"
    }


@router.post("/admin/reviews/{review_id}/reject", response_model=dict)
async def reject_review(
    review_id: str,
    request: ReviewRejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yorumu reddet"""
    result = await db.execute(
        select(CourseReview)
        .options(selectinload(CourseReview.user), selectinload(CourseReview.course))
        .where(CourseReview.id == review_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    if not review.is_approved and review.approved_at is None:
        # Zaten reddedilmiş veya hiç onaylanmamış
        pass
    else:
        # Onaylanmış yorumu reddet - is_approved'i False yap
        review.is_approved = False
        review.approved_at = None
        review.approved_by_admin_id = current_user.id
        review.moderation_note = request.moderation_note
    
    await db.commit()
    await db.refresh(review)
    
    # Rating'i yeniden hesapla (onaylanmış yorum artık yok)
    await recalculate_course_rating(db, review.course_id)
    
    # Öğrenciye bildirim gönder
    notification_service = NotificationService(db)
    reason = request.moderation_note or "Belirtilmedi"
    await notification_service.send_notification(
        user_ids=[review.user_id],
        notification_type=NotificationType.REVIEW_REJECTED,
        title="Yorumunuz Reddedildi",
        message=f'"{review.course.title if review.course else "Kurs"}" kursuna yaptığınız yorum reddedildi. Sebep: {reason}',
        priority=NotificationPriority.MEDIUM,
        delivery_channels=["in_app", "email"],
        action_url=f"/courses/{review.course.slug if review.course else ''}",
        action_label="Kursu Görüntüle",
        sender_id=current_user.id,
    )
    await db.commit()
    
    return {
        "id": review.id,
        "is_approved": review.is_approved,
        "moderation_note": review.moderation_note,
        "message": "Yorum reddedildi"
    }


@router.delete("/admin/reviews/{review_id}", response_model=dict)
async def delete_review(
    review_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Yorumu tamamen sil"""
    result = await db.execute(
        select(CourseReview)
        .options(selectinload(CourseReview.course))
        .where(CourseReview.id == review_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    course_id = review.course_id
    was_approved = review.is_approved
    
    # Yorumu sil
    await db.delete(review)
    await db.flush()  # Flush before commit to ensure deletion is processed
    await db.commit()
    
    # Eğer onaylanmış bir yorumduysa rating'i yeniden hesapla
    if was_approved:
        await recalculate_course_rating(db, course_id)
    
    return {"message": "Yorum silindi"}


class TeacherReplyRequest(BaseModel):
    reply_text: str = Field(..., min_length=1, max_length=2000, description="Cevap metni (1-2000 karakter)")


@router.post("/courses/{course_id}/reviews/{review_id}/reply", response_model=dict)
async def reply_to_review(
    course_id: str,
    review_id: str,
    request: TeacherReplyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Eğitmen yorum cevabı"""
    # Kursu kontrol et
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    
    # Sadece kursun sahibi olan eğitmen cevap verebilir
    if course.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu kursun eğitmeni değilsiniz")
    
    # Yorumu kontrol et
    review_result = await db.execute(
        select(CourseReview)
        .options(selectinload(CourseReview.user))
        .where(CourseReview.id == review_id, CourseReview.course_id == course_id)
    )
    review = review_result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    # Cevap metni validasyonu
    reply_text = request.reply_text.strip()
    if not reply_text or len(reply_text) < 1:
        raise HTTPException(status_code=400, detail="Cevap metni boş olamaz")
    if len(reply_text) > 2000:
        raise HTTPException(status_code=400, detail="Cevap metni en fazla 2000 karakter olabilir")
    
    # Cevabı güncelle veya ekle
    review.teacher_reply = reply_text
    review.teacher_reply_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(review)
    
    # Öğrenciye bildirim gönder
    notification_service = NotificationService(db)
    await notification_service.send_notification(
        user_ids=[review.user_id],
        notification_type=NotificationType.TEACHER_REPLY,
        title="Eğitmeniniz Yorumunuza Cevap Verdi",
        message=f'"{course.title}" kursuna yaptığınız yoruma eğitmen cevap verdi.',
        priority=NotificationPriority.MEDIUM,
        delivery_channels=["in_app", "email"],
        action_url=f"/courses/{course.slug}",
        action_label="Yorumu Görüntüle",
        sender_id=current_user.id,
    )
    await db.commit()
    
    return {
        "id": review.id,
        "teacher_reply": review.teacher_reply,
        "teacher_reply_at": review.teacher_reply_at.isoformat(),
        "message": "Cevap gönderildi"
    }


def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    """Teacher yetkisi kontrolü"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Teacher yetkisi gerekli")
    return current_user


@router.get("/me/reviews", response_model=list[dict])
async def get_teacher_reviews(
    course_id: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """Eğitmenin kurslarına yapılan yorumları getir"""
    # Eğitmenin kurslarını getir
    courses_result = await db.execute(
        select(Course.id).where(Course.teacher_id == current_user.id)
    )
    course_ids = [str(c[0]) for c in courses_result.all()]
    
    if not course_ids:
        return []
    
    # Kurs yorumlarını getir
    query = select(CourseReview).options(
        selectinload(CourseReview.user),
        selectinload(CourseReview.course)
    ).where(CourseReview.course_id.in_(course_ids))
    
    if course_id:
        query = query.where(CourseReview.course_id == course_id)
    
    query = query.order_by(CourseReview.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    reviews = result.scalars().all()
    
    reviews_list = []
    for review in reviews:
        reviews_list.append({
            "id": review.id,
            "user_id": review.user_id,
            "course_id": review.course_id,
            "rating": review.rating,
            "title": review.title,
            "comment": review.comment,
            "is_approved": review.is_approved,
            "teacher_reply": review.teacher_reply,
            "teacher_reply_at": review.teacher_reply_at.isoformat() if review.teacher_reply_at else None,
            "created_at": review.created_at.isoformat(),
            "user": {
                "id": review.user.id,
                "full_name": review.user.full_name,
            },
            "course": {
                "id": review.course.id if review.course else None,
                "title": review.course.title if review.course else "Kurs silinmiş",
                "slug": review.course.slug if review.course else None,
            } if review.course else None,
        })
    
    return reviews_list
