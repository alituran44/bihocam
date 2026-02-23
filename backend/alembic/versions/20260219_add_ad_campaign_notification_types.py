"""add_ad_campaign_notification_types

Revision ID: 20260219_ads_notif
Revises: 20260212_epic7_notif
Create Date: 2026-02-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '20260219_ads_notif'
down_revision: Union[str, None] = 'd4e5f6a7b8c9'  # add_ad_campaign_id_to_teacher_earnings
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # NotificationType enum'ına yeni değerler ekle (EPIC-ADS)
    # ad_campaign_approved
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ad_campaign_approved' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'ad_campaign_approved';
            END IF;
        END $$;
    """)
    
    # ad_campaign_rejected
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ad_campaign_rejected' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notificationtype')) THEN
                ALTER TYPE notificationtype ADD VALUE 'ad_campaign_rejected';
            END IF;
        END $$;
    """)


def downgrade() -> None:
    # PostgreSQL enum'dan değerleri kaldırmak için enum'u yeniden oluşturmak gerekir
    # Bu işlem karmaşık olduğu için downgrade'i boş bırakıyoruz
    # Gerekirse manuel olarak yapılabilir
    pass
