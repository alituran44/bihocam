"""merge migration branches

Revision ID: 20260209_merge_migration_branches
Revises: ('d4e5f6a1b2c3', 'f7a8b9c0d1e2')
Create Date: 2026-02-09
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e9f0a1b2c3d4"  # Kısa hash - merge migration branches
down_revision: Union[str, tuple[str, ...], None] = ("d4e5f6a1b2c3", "f7a8b9c0d1e2")  # Merge two branches
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Bu bir merge migration, sadece branch'leri birleştirir
    # Herhangi bir schema değişikliği yapmaz
    pass


def downgrade() -> None:
    # Merge migration'ı geri almak için bir şey yapmaya gerek yok
    pass
