"""add course_review_history table

Revision ID: 20260206_add_course_review_history
Revises: 20260206_add_course_status_pending_review_rejected
Create Date: 2026-02-06
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a1"  # Kısa hash - course review history table
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ModerationActionType enum oluştur (eğer yoksa)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE moderationactiontype AS ENUM (
                'submit_for_review',
                'approve',
                'reject',
                'edit',
                'resubmit',
                'archive',
                'unarchive'
            );
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # course_review_history tablosu oluştur (enum'ları doğrudan SQL ile kullan)
    # Eğer tablo zaten varsa oluşturma
    op.execute("""
        DO $$ BEGIN
            CREATE TABLE course_review_history (
                id UUID NOT NULL PRIMARY KEY,
                course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
                old_status coursestatus,
                new_status coursestatus NOT NULL,
                action_type moderationactiontype NOT NULL,
                note TEXT,
                changes_json TEXT,
                ip_address VARCHAR(45),
                user_agent VARCHAR(500),
                is_system_generated BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        EXCEPTION
            WHEN duplicate_table THEN null;
        END $$;
    """)
    
    # Index'ler (eğer yoksa oluştur)
    op.execute("CREATE INDEX IF NOT EXISTS ix_course_review_history_course_id ON course_review_history(course_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_course_review_history_created_at ON course_review_history(created_at)")


def downgrade() -> None:
    op.drop_index("ix_course_review_history_created_at", table_name="course_review_history")
    op.drop_index("ix_course_review_history_course_id", table_name="course_review_history")
    op.drop_table("course_review_history")
    op.execute("DROP TYPE IF EXISTS moderationactiontype")
