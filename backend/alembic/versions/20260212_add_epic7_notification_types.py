"""add_epic7_notification_types

Revision ID: 20260212_epic7_notif
Revises: 20260212_epic7
Create Date: 2026-02-12 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '20260212_epic7_notif'
down_revision: Union[str, None] = '20260212_epic7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
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
    # PostgreSQL enum'dan değerleri kaldırmak için enum'u yeniden oluşturmak gerekir
    # Bu işlem karmaşık olduğu için downgrade'i boş bırakıyoruz
    # Gerekirse manuel olarak yapılabilir
    pass
