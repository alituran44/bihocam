"""epic9_add_announcements_and_platform_settings

Revision ID: 20260212_epic9
Revises: 20260210_add_site_settings
Create Date: 2026-02-12

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260212_epic9"
down_revision: Union[str, None] = "20260212_epic7_notif"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # SiteSettings'e platform alanı ekle (eğer yoksa)
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("site_settings"):
        columns = [c["name"] for c in inspector.get_columns("site_settings")]
        if "platform" not in columns:
            op.add_column("site_settings", sa.Column("platform", postgresql.JSON(astext_type=sa.Text()), nullable=True))

    # Enum'u oluştur (eğer yoksa)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE announcementtype AS ENUM ('info', 'warning', 'maintenance');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    # SiteAnnouncement tablosu oluştur (eğer yoksa)
    if not inspector.has_table("site_announcements"):
        op.create_table(
            "site_announcements",
            sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("type", sa.Enum("info", "warning", "maintenance", name="announcementtype", create_type=False), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("starts_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("target_audience", sa.String(50), nullable=True, server_default="all"),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_dismissible", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("site_announcements")
    op.drop_column("site_settings", "platform")
    # Enum'u da sil
    op.execute("DROP TYPE IF EXISTS announcementtype")
