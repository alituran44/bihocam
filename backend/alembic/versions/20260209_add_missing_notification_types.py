"""add missing notification types to enum

Revision ID: 20260209_add_missing_notification_types
Revises: 20260208_convert_course_review_history_status_to_string
Create Date: 2026-02-09
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f0a1b2c3d4e5"  # Kısa hash - add missing notification types
down_revision: Union[str, None] = "e9f0a1b2c3d4"  # Merge migration'dan sonra
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL enum'a yeni değerler ekle
    # NOT: ALTER TYPE ... ADD VALUE transaction içinde çalışmaz, bu yüzden her biri ayrı execute edilmeli
    # IF NOT EXISTS PostgreSQL 9.5+ için çalışır ama enum için desteklenmez, bu yüzden hata kontrolü yapıyoruz
    
    # password_reset
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'password_reset' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'password_reset';
            END IF;
        END $$;
    """)
    
    # bank_account_pending
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bank_account_pending' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'bank_account_pending';
            END IF;
        END $$;
    """)
    
    # bank_account_approved
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bank_account_approved' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'bank_account_approved';
            END IF;
        END $$;
    """)
    
    # bank_account_rejected
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bank_account_rejected' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'bank_account_rejected';
            END IF;
        END $$;
    """)
    
    # withdrawal_request_created
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'withdrawal_request_created' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'withdrawal_request_created';
            END IF;
        END $$;
    """)
    
    # withdrawal_approved
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'withdrawal_approved' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'withdrawal_approved';
            END IF;
        END $$;
    """)
    
    # withdrawal_rejected
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'withdrawal_rejected' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'withdrawal_rejected';
            END IF;
        END $$;
    """)
    
    # withdrawal_paid
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'withdrawal_paid' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'withdrawal_paid';
            END IF;
        END $$;
    """)


def downgrade() -> None:
    # PostgreSQL enum'dan değerleri kaldırmak için enum'u yeniden oluşturmak gerekir
    # Bu işlem karmaşık olduğu için downgrade'i boş bırakıyoruz
    # Gerekirse manuel olarak yapılabilir
    pass
