"""add pending_review and rejected to course_status enum

Revision ID: 20260206_add_course_status_pending_review_rejected
Revises: 20260205_add_notifications
Create Date: 2026-02-06
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"  # Kısa hash - course status enum genişletme
down_revision: Union[str, None] = "20260205_add_notifications"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL'de enum'a yeni değer eklemek için ALTER TYPE kullanıyoruz
    # NOT: Bu işlem transaction içinde yapılamaz, bu yüzden op.execute ile yapıyoruz
    op.execute("ALTER TYPE coursestatus ADD VALUE IF NOT EXISTS 'pending_review'")
    op.execute("ALTER TYPE coursestatus ADD VALUE IF NOT EXISTS 'rejected'")


def downgrade() -> None:
    # PostgreSQL'de enum'dan değer silmek mümkün değil
    # Bu yüzden downgrade için bir şey yapamıyoruz
    # Eğer gerçekten geri almak gerekirse, enum'u yeniden oluşturmak gerekir
    # Ancak bu production'da riskli, bu yüzden şimdilik pass ediyoruz
    pass
