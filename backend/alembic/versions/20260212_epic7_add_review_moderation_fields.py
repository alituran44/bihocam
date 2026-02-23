"""epic7_add_review_moderation_fields

Revision ID: 20260212_epic7
Revises: 20260211_add_crm_tables
Create Date: 2026-02-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260212_epic7'
down_revision: Union[str, None] = '20260211_add_crm_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # CourseReview tablosuna moderasyon alanları ekle
    op.add_column('course_reviews', sa.Column('approved_at', sa.DateTime(), nullable=True))
    op.add_column('course_reviews', sa.Column('approved_by_admin_id', postgresql.UUID(as_uuid=False), nullable=True))
    op.add_column('course_reviews', sa.Column('moderation_note', sa.Text(), nullable=True))
    op.add_column('course_reviews', sa.Column('teacher_reply', sa.Text(), nullable=True))
    op.add_column('course_reviews', sa.Column('teacher_reply_at', sa.DateTime(), nullable=True))
    
    # Foreign key ekle
    op.create_foreign_key(
        'fk_course_reviews_approved_by_admin',
        'course_reviews', 'users',
        ['approved_by_admin_id'], ['id'],
        ondelete='SET NULL'
    )
    
    # is_approved default değerini False yap (mevcut True olanları koru)
    # Yeni yorumlar için default False olacak
    op.alter_column('course_reviews', 'is_approved',
                    existing_type=sa.Boolean(),
                    server_default=sa.false(),
                    nullable=False)
    
    # NotificationType enum'ına yeni değerler ekle (EPIC-7)
    # review_approved
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'review_approved' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'review_approved';
            END IF;
        END $$;
    """)
    
    # review_rejected
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'review_rejected' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'review_rejected';
            END IF;
        END $$;
    """)
    
    # teacher_reply
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'teacher_reply' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'teacher_reply';
            END IF;
        END $$;
    """)


def downgrade() -> None:
    # Foreign key'i kaldır
    op.drop_constraint('fk_course_reviews_approved_by_admin', 'course_reviews', type_='foreignkey')
    
    # Kolonları kaldır
    op.drop_column('course_reviews', 'teacher_reply_at')
    op.drop_column('course_reviews', 'teacher_reply')
    op.drop_column('course_reviews', 'moderation_note')
    op.drop_column('course_reviews', 'approved_by_admin_id')
    op.drop_column('course_reviews', 'approved_at')
    
    # is_approved default değerini True'ya geri al
    op.alter_column('course_reviews', 'is_approved',
                    existing_type=sa.Boolean(),
                    server_default=sa.true(),
                    nullable=False)
