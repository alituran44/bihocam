"""add_site_wide_campaign_support_to_coupons

Revision ID: 20260223_site_wide_coupons
Revises: c02a7c935793
Create Date: 2026-02-23 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260223_site_wide_coupons'
down_revision: Union[str, None] = 'c02a7c935793'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add 'site_wide' to coupontriggertype enum (must be in separate transaction)
    # PostgreSQL requires enum values to be committed before use in constraints
    op.execute("ALTER TYPE coupontriggertype ADD VALUE IF NOT EXISTS 'site_wide'")
    
    # Commit the enum change (Alembic handles this automatically, but we need to ensure it's done)
    # Note: We'll add columns first, then constraints in a way that works with asyncpg
    
    # Add new columns to coupons table
    op.add_column('coupons', sa.Column('is_auto_apply', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('coupons', sa.Column('auto_apply_priority', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('coupons', sa.Column('campaign_name', sa.String(length=255), nullable=True))
    op.add_column('coupons', sa.Column('campaign_description', sa.Text(), nullable=True))
    op.add_column('coupons', sa.Column('target_course_ids', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    
    # Create indexes
    op.create_index('idx_coupon_auto_apply_trigger', 'coupons', ['is_auto_apply', 'trigger_type'], unique=False)
    op.create_index('idx_coupon_auto_apply_priority', 'coupons', ['auto_apply_priority'], unique=False)
    op.create_index('idx_coupon_target_courses', 'coupons', ['target_course_ids'], unique=False, postgresql_using='gin')
    
    # Add check constraints
    # Note: We use text comparison for enum to avoid "unsafe use of new enum value" error
    # PostgreSQL requires enum values to be committed before use in constraints
    op.execute("""
        ALTER TABLE coupons 
        ADD CONSTRAINT check_auto_apply_site_wide 
        CHECK ((is_auto_apply = false) OR (trigger_type::text = 'site_wide'))
    """)
    op.create_check_constraint(
        'check_auto_apply_priority_non_negative',
        'coupons',
        'auto_apply_priority >= 0'
    )


def downgrade() -> None:
    # Drop check constraints
    op.drop_constraint('check_auto_apply_priority_non_negative', 'coupons', type_='check')
    op.drop_constraint('check_auto_apply_site_wide', 'coupons', type_='check')
    
    # Drop indexes
    op.drop_index('idx_coupon_target_courses', table_name='coupons')
    op.drop_index('idx_coupon_auto_apply_priority', table_name='coupons')
    op.drop_index('idx_coupon_auto_apply_trigger', table_name='coupons')
    
    # Drop columns
    op.drop_column('coupons', 'target_course_ids')
    op.drop_column('coupons', 'campaign_description')
    op.drop_column('coupons', 'campaign_name')
    op.drop_column('coupons', 'auto_apply_priority')
    op.drop_column('coupons', 'is_auto_apply')
    
    # Note: PostgreSQL doesn't support removing enum values directly
    # The 'site_wide' value will remain in the enum but unused
