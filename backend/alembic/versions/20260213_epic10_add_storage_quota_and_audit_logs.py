"""epic10_add_storage_quota_and_audit_logs

Revision ID: 20260213_epic10_quota_audit
Revises: 44867ed6fbe5
Create Date: 2026-02-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260213_epic10_quota_audit'
down_revision: Union[str, None] = '44867ed6fbe5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ========================================================================
    # EPIC-10: Storage Quota Table (EP10-BE-14)
    # ========================================================================
    # Tablo zaten varsa oluşturma (idempotent)
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    
    if not inspector.has_table('storage_quotas'):
        op.create_table(
            'storage_quotas',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('quota_bytes', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('used_bytes', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('reset_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reset_period_days', sa.Integer(), nullable=True),
        sa.Column('is_custom', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_storage_quotas_user_id'), 'storage_quotas', ['user_id'], unique=True)
    
    # ========================================================================
    # EPIC-10: Content Audit Log Table (EP10-BE-18)
    # ========================================================================
    if not inspector.has_table('content_audit_logs'):
        op.create_table(
            'content_audit_logs',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('resource_id', sa.String(length=36), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id'),
        )
        # Index'leri sadece tablo yoksa oluştur
        op.create_index(op.f('ix_content_audit_logs_user_id'), 'content_audit_logs', ['user_id'], unique=False)
        op.create_index(op.f('ix_content_audit_logs_action'), 'content_audit_logs', ['action'], unique=False)
        op.create_index(op.f('ix_content_audit_logs_resource_type'), 'content_audit_logs', ['resource_type'], unique=False)
        op.create_index(op.f('ix_content_audit_logs_resource_id'), 'content_audit_logs', ['resource_id'], unique=False)
        op.create_index(op.f('ix_content_audit_logs_created_at'), 'content_audit_logs', ['created_at'], unique=False)
        
        # Composite indexes for common queries
        op.create_index('idx_audit_user_action', 'content_audit_logs', ['user_id', 'action'], unique=False)
        op.create_index('idx_audit_resource', 'content_audit_logs', ['resource_type', 'resource_id'], unique=False)
        op.create_index('idx_audit_created', 'content_audit_logs', ['created_at'], unique=False)
    
    # ========================================================================
    # EPIC-10: lessons.updated_at column (EP10-BE-03)
    # ========================================================================
    # updated_at kolonu migration'da eksik kalmış, ekliyoruz
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table('lessons'):
        columns = [c['name'] for c in inspector.get_columns('lessons')]
        if 'updated_at' not in columns:
            op.add_column('lessons', sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False))


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('idx_audit_created', table_name='content_audit_logs')
    op.drop_index('idx_audit_resource', table_name='content_audit_logs')
    op.drop_index('idx_audit_user_action', table_name='content_audit_logs')
    
    # Drop content_audit_logs table
    op.drop_index(op.f('ix_content_audit_logs_created_at'), table_name='content_audit_logs')
    op.drop_index(op.f('ix_content_audit_logs_resource_id'), table_name='content_audit_logs')
    op.drop_index(op.f('ix_content_audit_logs_resource_type'), table_name='content_audit_logs')
    op.drop_index(op.f('ix_content_audit_logs_action'), table_name='content_audit_logs')
    op.drop_index(op.f('ix_content_audit_logs_user_id'), table_name='content_audit_logs')
    op.drop_table('content_audit_logs')
    
    # Drop storage_quotas table
    op.drop_index(op.f('ix_storage_quotas_user_id'), table_name='storage_quotas')
    op.drop_table('storage_quotas')
    
    # Drop updated_at column from lessons (if exists)
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table('lessons'):
        columns = [c['name'] for c in inspector.get_columns('lessons')]
        if 'updated_at' in columns:
            op.drop_column('lessons', 'updated_at')
