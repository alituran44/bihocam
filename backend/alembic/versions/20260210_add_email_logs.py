"""add_email_logs

Revision ID: 20260210_add_email_logs
Revises: 20260210_add_site_settings
Create Date: 2026-02-10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "20260210_add_email_logs"
down_revision: Union[str, None] = "20260210_add_site_settings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    email_status_enum = sa.Enum("pending", "sent", "failed", "retrying", name="emailstatus")
    email_status_enum.create(bind, checkfirst=True)

    if not inspector.has_table("email_logs"):
        op.create_table(
            "email_logs",
            sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
            sa.Column("notification_id", postgresql.UUID(as_uuid=False), nullable=True),
            sa.Column("to_email", sa.String(length=255), nullable=False),
            sa.Column("subject", sa.String(length=255), nullable=False),
            sa.Column("template_name", sa.String(length=100), nullable=True),
            sa.Column("status", email_status_enum, nullable=False, server_default="pending"),
            sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("last_error", sa.Text(), nullable=True),
            sa.Column("sent_at", sa.DateTime(), nullable=True),
            sa.Column("payload", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["notification_id"], ["notifications.id"], ondelete="SET NULL"),
        )
        op.create_index("ix_email_logs_notification_id", "email_logs", ["notification_id"])
        op.create_index("ix_email_logs_to_email", "email_logs", ["to_email"])
        op.create_index("ix_email_logs_template_name", "email_logs", ["template_name"])
        op.create_index("ix_email_logs_status", "email_logs", ["status"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("email_logs"):
        op.drop_index("ix_email_logs_status", table_name="email_logs")
        op.drop_index("ix_email_logs_template_name", table_name="email_logs")
        op.drop_index("ix_email_logs_to_email", table_name="email_logs")
        op.drop_index("ix_email_logs_notification_id", table_name="email_logs")
        op.drop_table("email_logs")
    sa.Enum(name="emailstatus").drop(bind, checkfirst=True)
