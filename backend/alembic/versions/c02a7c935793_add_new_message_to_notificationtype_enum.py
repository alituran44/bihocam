"""add_new_message_to_notificationtype_enum

Revision ID: c02a7c935793
Revises: 8961b0816dfb
Create Date: 2026-02-23 02:27:58.149171

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c02a7c935793'
down_revision: Union[str, None] = '8961b0816dfb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add 'new_message' to notificationtype enum
    op.execute("ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'new_message'")


def downgrade() -> None:
    # PostgreSQL doesn't support removing enum values directly
    # This would require recreating the enum, which is complex
    # For now, we'll leave it as a no-op
    pass
