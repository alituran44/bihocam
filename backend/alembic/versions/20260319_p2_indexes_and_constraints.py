"""P2 indexes and constraints

Faz 3 Paket H:
- P2-01: 7 composite index ekleme
- P2-04: CHECK constraint'ler (coupon, order_item, storage_quota, enrollment)
- P2-05: CourseStatus string CHECK constraint

Revision ID: 20260319_p2_idx_chk
Revises: 20260319_ad_spend_enum
Create Date: 2026-03-19 14:00:00.000000
"""
from typing import Sequence, Union

from alembic import op

revision: str = '20260319_p2_idx_chk'
down_revision: Union[str, None] = '20260319_ad_spend_enum'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ========== P2-01: Composite Indexes ==========

    # 1. courses (teacher_id, status) — öğretmen kurs listesi
    op.create_index(
        "idx_courses_teacher_status",
        "courses",
        ["teacher_id", "status"],
        if_not_exists=True,
    )

    # 2. lessons (course_id, lesson_type) — ders tipi filtreleme
    op.create_index(
        "idx_lessons_course_type",
        "lessons",
        ["course_id", "lesson_type"],
        if_not_exists=True,
    )

    # 3. notifications (user_id, is_read, created_at) — okunmamış bildirimler
    op.create_index(
        "idx_notifications_user_read_date",
        "notifications",
        ["user_id", "is_read", "created_at"],
        if_not_exists=True,
    )

    # 4. messages (conversation_id, is_deleted) — mesaj listesi
    op.create_index(
        "idx_messages_conversation_deleted",
        "messages",
        ["conversation_id", "is_deleted"],
        if_not_exists=True,
    )

    # 5. teacher_earnings (teacher_id, created_at DESC) — kazanç geçmişi
    op.create_index(
        "idx_teacher_earnings_teacher_date",
        "teacher_earnings",
        ["teacher_id", "created_at"],
        if_not_exists=True,
    )

    # 6. coupons (is_active, valid_from, valid_until) — aktif kupon sorgusu
    op.create_index(
        "idx_coupons_active_validity",
        "coupons",
        ["is_active", "valid_from", "valid_until"],
        if_not_exists=True,
    )

    # 7. orders (user_id, created_at) — kullanıcı sipariş geçmişi
    op.create_index(
        "idx_orders_user_date",
        "orders",
        ["user_id", "created_at"],
        if_not_exists=True,
    )

    # ========== P2-04: CHECK Constraints ==========

    # Coupon: discount_value > 0
    op.execute("""
        ALTER TABLE coupons
        ADD CONSTRAINT check_coupon_discount_positive
        CHECK (discount_value > 0)
    """)

    # OrderItem: final_price >= 0
    op.execute("""
        ALTER TABLE order_items
        ADD CONSTRAINT check_order_item_final_price_non_negative
        CHECK (final_price >= 0)
    """)

    # OrderItem: platform_commission >= 0
    op.execute("""
        ALTER TABLE order_items
        ADD CONSTRAINT check_order_item_commission_non_negative
        CHECK (platform_commission >= 0)
    """)

    # StorageQuota: used_bytes >= 0
    op.execute("""
        ALTER TABLE storage_quotas
        ADD CONSTRAINT check_storage_used_non_negative
        CHECK (used_bytes >= 0)
    """)

    # StorageQuota: quota_bytes > 0
    op.execute("""
        ALTER TABLE storage_quotas
        ADD CONSTRAINT check_storage_quota_positive
        CHECK (quota_bytes > 0)
    """)

    # Enrollment: progress 0-100
    op.execute("""
        ALTER TABLE enrollments
        ADD CONSTRAINT check_enrollment_progress_range
        CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
    """)

    # ========== P2-05: CourseStatus CHECK Constraint ==========
    op.execute("""
        ALTER TABLE courses
        ADD CONSTRAINT check_course_status_valid
        CHECK (status IN ('draft', 'published', 'archived', 'pending_review', 'rejected'))
    """)


def downgrade() -> None:
    # CHECK Constraints kaldır
    op.execute("ALTER TABLE courses DROP CONSTRAINT IF EXISTS check_course_status_valid")
    op.execute("ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS check_enrollment_progress_range")
    op.execute("ALTER TABLE storage_quotas DROP CONSTRAINT IF EXISTS check_storage_quota_positive")
    op.execute("ALTER TABLE storage_quotas DROP CONSTRAINT IF EXISTS check_storage_used_non_negative")
    op.execute("ALTER TABLE order_items DROP CONSTRAINT IF EXISTS check_order_item_commission_non_negative")
    op.execute("ALTER TABLE order_items DROP CONSTRAINT IF EXISTS check_order_item_final_price_non_negative")
    op.execute("ALTER TABLE coupons DROP CONSTRAINT IF EXISTS check_coupon_discount_positive")

    # Indexes kaldır
    op.drop_index("idx_orders_user_date", table_name="orders", if_exists=True)
    op.drop_index("idx_coupons_active_validity", table_name="coupons", if_exists=True)
    op.drop_index("idx_teacher_earnings_teacher_date", table_name="teacher_earnings", if_exists=True)
    op.drop_index("idx_messages_conversation_deleted", table_name="messages", if_exists=True)
    op.drop_index("idx_notifications_user_read_date", table_name="notifications", if_exists=True)
    op.drop_index("idx_lessons_course_type", table_name="lessons", if_exists=True)
    op.drop_index("idx_courses_teacher_status", table_name="courses", if_exists=True)
