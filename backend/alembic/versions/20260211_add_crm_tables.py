"""add crm tables and backfill legacy site_settings data

Revision ID: 20260211_add_crm_tables
Revises: 20260210_add_email_logs
Create Date: 2026-02-11
"""

from __future__ import annotations

from datetime import datetime
import json
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "20260211_add_crm_tables"
down_revision: Union[str, None] = "20260210_add_email_logs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _parse_iso_datetime(value: object) -> datetime:
    if isinstance(value, datetime):
        return value
    if isinstance(value, str) and value:
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            return datetime.utcnow()
    return datetime.utcnow()


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("crm_email_templates"):
        op.create_table(
            "crm_email_templates",
            sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("subject", sa.String(length=255), nullable=False),
            sa.Column("html_body", sa.Text(), nullable=False),
            sa.Column("plain_body", sa.Text(), nullable=True),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("variables_json", sa.JSON(), nullable=True),
            sa.Column("created_by", postgresql.UUID(as_uuid=False), nullable=True),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        )
        op.create_index("ix_crm_email_templates_created_by", "crm_email_templates", ["created_by"])

    if not inspector.has_table("crm_audiences"):
        op.create_table(
            "crm_audiences",
            sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("created_by", postgresql.UUID(as_uuid=False), nullable=True),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        )
        op.create_index("ix_crm_audiences_created_by", "crm_audiences", ["created_by"])

    if not inspector.has_table("crm_audience_members"):
        op.create_table(
            "crm_audience_members",
            sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
            sa.Column("audience_id", postgresql.UUID(as_uuid=False), nullable=False),
            sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["audience_id"], ["crm_audiences.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.UniqueConstraint("audience_id", "user_id", name="uq_crm_audience_members_audience_user"),
        )
        op.create_index("ix_crm_audience_members_audience_id", "crm_audience_members", ["audience_id"])
        op.create_index("ix_crm_audience_members_user_id", "crm_audience_members", ["user_id"])

    if not inspector.has_table("site_settings"):
        return

    settings_row = bind.execute(
        sa.text("SELECT custom_code FROM site_settings ORDER BY created_at ASC LIMIT 1")
    ).scalar_one_or_none()
    if not isinstance(settings_row, dict):
        return

    templates = settings_row.get("email_custom_templates")
    if isinstance(templates, list):
        for item in templates:
            if not isinstance(item, dict):
                continue
            template_id = item.get("id")
            if not template_id:
                continue
            bind.execute(
                sa.text(
                    """
                    INSERT INTO crm_email_templates
                    (id, name, subject, html_body, plain_body, description, variables_json, created_at, updated_at)
                    VALUES
                    (:id, :name, :subject, :html_body, :plain_body, :description, CAST(:variables_json AS JSON), :created_at, :updated_at)
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                {
                    "id": str(template_id),
                    "name": item.get("name") or "Adsiz Sablon",
                    "subject": item.get("subject") or "(Konu yok)",
                    "html_body": item.get("html_body") or "<p>Icerik yok</p>",
                    "plain_body": item.get("plain_body"),
                    "description": item.get("description"),
                    "variables_json": json.dumps(item.get("variables") if isinstance(item.get("variables"), list) else []),
                    "created_at": _parse_iso_datetime(item.get("created_at")),
                    "updated_at": _parse_iso_datetime(item.get("updated_at")),
                },
            )

    segments = settings_row.get("email_custom_segments")
    if isinstance(segments, list):
        for item in segments:
            if not isinstance(item, dict):
                continue
            segment_id = item.get("id")
            if not segment_id:
                continue

            bind.execute(
                sa.text(
                    """
                    INSERT INTO crm_audiences (id, name, description, created_at, updated_at)
                    VALUES (:id, :name, :description, :created_at, :updated_at)
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                {
                    "id": str(segment_id),
                    "name": item.get("name") or "Adsiz Kitle",
                    "description": item.get("description"),
                    "created_at": _parse_iso_datetime(item.get("created_at")),
                    "updated_at": _parse_iso_datetime(item.get("updated_at")),
                },
            )

            user_ids = item.get("user_ids")
            if not isinstance(user_ids, list):
                continue
            for user_id in list(dict.fromkeys(user_ids)):
                bind.execute(
                    sa.text(
                        """
                        INSERT INTO crm_audience_members (id, audience_id, user_id)
                        SELECT :id, :audience_id, :user_id
                        WHERE EXISTS (SELECT 1 FROM users WHERE id = :user_id)
                        ON CONFLICT ON CONSTRAINT uq_crm_audience_members_audience_user DO NOTHING
                        """
                    ),
                    {"id": str(uuid4()), "audience_id": str(segment_id), "user_id": str(user_id)},
                )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("crm_audience_members"):
        op.drop_index("ix_crm_audience_members_user_id", table_name="crm_audience_members")
        op.drop_index("ix_crm_audience_members_audience_id", table_name="crm_audience_members")
        op.drop_table("crm_audience_members")

    if inspector.has_table("crm_audiences"):
        op.drop_index("ix_crm_audiences_created_by", table_name="crm_audiences")
        op.drop_table("crm_audiences")

    if inspector.has_table("crm_email_templates"):
        op.drop_index("ix_crm_email_templates_created_by", table_name="crm_email_templates")
        op.drop_table("crm_email_templates")
