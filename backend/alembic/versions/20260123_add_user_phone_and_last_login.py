"""add phone and last_login_at to users table

Revision ID: 5302cd7439b9
Revises: d4e5f6a1b2c3
Create Date: 2026-01-23
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5302cd7439b9"
down_revision: Union[str, None] = "d4e5f6a1b2c3"  # 20260208_convert_course_review_history_status_to_string.py
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users tablosuna phone ve last_login_at kolonlarını ekle
    op.add_column("users", sa.Column("phone", sa.String(20), nullable=True))
    op.add_column("users", sa.Column("last_login_at", sa.DateTime(), nullable=True))
    
    # phone için index ekle (opsiyonel, arama için)
    op.create_index("ix_users_phone", "users", ["phone"], unique=False)


def downgrade() -> None:
    # Index'i sil
    op.drop_index("ix_users_phone", table_name="users")
    
    # Kolonları sil
    op.drop_column("users", "last_login_at")
    op.drop_column("users", "phone")
