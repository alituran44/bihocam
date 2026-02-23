"""add ad_campaign_id to teacher_earnings

Revision ID: d4e5f6a7b8c9
Revises: c63ab666862c
Create Date: 2026-02-19 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c63ab666862c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add ad_campaign_id column to teacher_earnings table
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'teacher_earnings' 
                AND column_name = 'ad_campaign_id'
            ) THEN
                ALTER TABLE teacher_earnings 
                ADD COLUMN ad_campaign_id UUID;
                
                -- Add foreign key constraint
                ALTER TABLE teacher_earnings 
                ADD CONSTRAINT fk_teacher_earnings_ad_campaign_id 
                FOREIGN KEY (ad_campaign_id) REFERENCES ad_campaigns (id) ON DELETE SET NULL;
                
                -- Add index
                CREATE INDEX ix_teacher_earnings_ad_campaign_id ON teacher_earnings (ad_campaign_id);
            END IF;
        END $$;
    """)
    
    # Add 'ad_spend' to earningtype enum if it doesn't exist
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum 
                WHERE enumlabel = 'ad_spend' 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'earningtype')
            ) THEN
                ALTER TYPE earningtype ADD VALUE 'ad_spend';
            END IF;
        END $$;
    """)


def downgrade() -> None:
    # Remove index
    op.execute("DROP INDEX IF EXISTS ix_teacher_earnings_ad_campaign_id")
    
    # Remove foreign key constraint
    op.execute("ALTER TABLE teacher_earnings DROP CONSTRAINT IF EXISTS fk_teacher_earnings_ad_campaign_id")
    
    # Remove column
    op.execute("ALTER TABLE teacher_earnings DROP COLUMN IF EXISTS ad_campaign_id")
    
    # Note: PostgreSQL doesn't support removing enum values easily
    # The 'ad_spend' value will remain in the enum but won't be used
