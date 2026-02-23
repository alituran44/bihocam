"""add popup announcements

Revision ID: c63ab666862c
Revises: a23dd055a1e0
Create Date: 2026-02-19 13:58:17.048854

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c63ab666862c'
down_revision: Union[str, None] = 'a23dd055a1e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Table already exists (created by Base.metadata.create_all)
    # Just update the index to use DESC ordering
    try:
        op.drop_index('idx_popup_priority', table_name='popup_announcements')
    except Exception:
        pass  # Index might not exist or have different name
    
    # Create index with DESC ordering
    op.create_index(
        'idx_popup_priority',
        'popup_announcements',
        ['priority'],
        unique=False,
        postgresql_ops={'priority': 'DESC'}
    )


def downgrade() -> None:
    # Drop the index
    op.drop_index('idx_popup_priority', table_name='popup_announcements')
    # Note: We don't drop the table or enum as they might be used by the application
