from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    courses,
    cart,
    coupons,
    enrollments,
    lesson_progress,
    course_reviews,
    teachers,
    media,
    orders,
    payments,
    categories,
    notifications,
    quizzes,
    teacher_bank_accounts,
    withdrawals,
    teacher_earnings,
    site_settings,
    announcements,
    public,
    email_logs,
    crm,
    students,
    reports,
    audit_logs,
    certificates,
    popup_announcements,
    ad_campaigns,
    ad_campaigns_admin,
    ad_placements_admin,
    ad_pricing_admin,
    ad_display,
    featured_courses,
    blog_posts,
    blog_categories,
    blog_tags,
    blog_admin,
    blog_public,
    messages,
    teacher_applications,
    pages,
    homeworks,
    exams,
    education_programs,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/admin/users", tags=["Admin - Users"])
api_router.include_router(students.router, prefix="/admin/students", tags=["Admin - Students"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(teachers.router, prefix="/teachers", tags=["teachers"])
api_router.include_router(teacher_applications.router, prefix="/teacher-applications", tags=["Teacher Applications"])
# course_reviews router'ı teachers router'ından SONRA eklenmeli (me/reviews endpoint'i teacher_id ile çakışmaz)
api_router.include_router(course_reviews.router, prefix="/teachers", tags=["Teacher - Reviews"])
api_router.include_router(teachers.admin_router, prefix="/admin/teachers", tags=["Admin - Teachers"])
api_router.include_router(teacher_bank_accounts.router, prefix="/teachers", tags=["Teacher - Bank Accounts"])
api_router.include_router(teacher_bank_accounts.admin_router, prefix="/admin/teachers", tags=["Admin - Teacher Bank Accounts"])
api_router.include_router(teacher_earnings.router, prefix="/teachers", tags=["Teacher - Earnings"])
api_router.include_router(withdrawals.router, prefix="/teachers", tags=["Teacher - Withdrawals"])
api_router.include_router(withdrawals.admin_router, prefix="/admin", tags=["Admin - Withdrawals"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(coupons.router, prefix="/coupons", tags=["coupons"])
api_router.include_router(coupons.admin_router, prefix="/admin/coupons", tags=["Admin - Coupons"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(orders.admin_router, prefix="/admin/orders", tags=["Admin - Orders"])
api_router.include_router(enrollments.router, prefix="/enrollments", tags=["enrollments"])
api_router.include_router(lesson_progress.router, prefix="", tags=["lesson-progress"])
api_router.include_router(course_reviews.router, prefix="", tags=["course-reviews"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])
api_router.include_router(site_settings.router, prefix="/admin/settings", tags=["Admin - Site Settings"])
api_router.include_router(public.router, prefix="", tags=["Public"])
api_router.include_router(announcements.router, prefix="", tags=["Announcements"])
api_router.include_router(email_logs.router, prefix="/admin/email-logs", tags=["Admin - Email Logs"])
api_router.include_router(crm.router, prefix="/admin/crm", tags=["Admin - CRM"])
api_router.include_router(reports.router, prefix="", tags=["Reports"])
api_router.include_router(audit_logs.router, prefix="", tags=["Admin - Audit Logs"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
api_router.include_router(popup_announcements.router, prefix="", tags=["Popup Announcements"])
api_router.include_router(ad_campaigns.router, prefix="", tags=["Teacher - Ad Campaigns"])
api_router.include_router(ad_campaigns_admin.router, prefix="", tags=["Admin - Ad Campaigns"])
api_router.include_router(ad_placements_admin.router, prefix="", tags=["Admin - Ad Placements"])
api_router.include_router(ad_pricing_admin.router, prefix="", tags=["Admin - Ad Pricing"])
api_router.include_router(ad_display.router, prefix="", tags=["Public - Ad Display"])
api_router.include_router(featured_courses.router, prefix="", tags=["Admin - Featured Courses", "Public"])
api_router.include_router(blog_posts.router, prefix="/blog/posts", tags=["Blog Posts"])
api_router.include_router(blog_categories.router, prefix="/blog/categories", tags=["Blog Categories"])
api_router.include_router(blog_tags.router, prefix="/blog/tags", tags=["Blog Tags"])
api_router.include_router(blog_admin.router, prefix="/admin/blog", tags=["Admin - Blog"])
api_router.include_router(blog_public.router, prefix="/public/blog", tags=["Public - Blog"])
api_router.include_router(messages.router, prefix="/messages", tags=["Messages"])
api_router.include_router(pages.router, prefix="/pages", tags=["Pages"])
api_router.include_router(education_programs.router, prefix="/education-programs", tags=["Education Programs"])
api_router.include_router(homeworks.router, prefix="/homeworks", tags=["Homeworks"])
api_router.include_router(exams.router, prefix="/exams", tags=["Exams"])