"""add notifications and notification_preferences tables

Revision ID: 20260205_add_notifications
Revises: 20260123_add_categories
Create Date: 2026-02-05
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260205_add_notifications"
down_revision: Union[str, None] = "20260123_add_categories"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
  op.create_table(
      "notifications",
      sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=False), primary_key=True),
      sa.Column(
          "user_id",
          sa.dialects.postgresql.UUID(as_uuid=False),
          sa.ForeignKey("users.id", ondelete="CASCADE"),
          nullable=False,
      ),
      sa.Column(
          "sender_id",
          sa.dialects.postgresql.UUID(as_uuid=False),
          sa.ForeignKey("users.id", ondelete="SET NULL"),
          nullable=True,
      ),
      sa.Column(
          "notification_type",
          sa.Enum(
              "course_update",
              "new_lesson",
              "course_announcement",
              "org_announcement",
              "org_course_update",
              "admin_to_teacher",
              "system_announcement",
              "maintenance",
              "live_lesson_reminder",
              "live_lesson_starting",
              "live_lesson_cancelled",
              "order_confirmed",
              "payment_success",
              "certificate_earned",
              "course_submitted",
              "course_approved",
              "course_rejected",
              "course_resubmitted",
              name="notificationtype",
          ),
          nullable=False,
      ),
      sa.Column("title", sa.String(length=255), nullable=False),
      sa.Column("message", sa.Text(), nullable=False),
      sa.Column("data", sa.JSON(), nullable=True),
      sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
      sa.Column("read_at", sa.DateTime(), nullable=True),
      sa.Column("delivery_channels", sa.JSON(), nullable=True),
      sa.Column(
          "priority",
          sa.Enum("low", "medium", "high", "urgent", name="notificationpriority"),
          nullable=False,
          server_default="medium",
      ),
      sa.Column("expires_at", sa.DateTime(), nullable=True),
      sa.Column("action_url", sa.String(length=500), nullable=True),
      sa.Column("action_label", sa.String(length=100), nullable=True),
      sa.Column(
          "created_at",
          sa.DateTime(),
          nullable=False,
          server_default=sa.func.now(),
      ),
      sa.Column(
          "updated_at",
          sa.DateTime(),
          nullable=False,
          server_default=sa.func.now(),
      ),
  )
  op.create_index(
      "ix_notifications_user_id",
      "notifications",
      ["user_id"],
  )
  op.create_index(
      "ix_notifications_is_read",
      "notifications",
      ["is_read"],
  )
  op.create_index(
      "ix_notifications_notification_type",
      "notifications",
      ["notification_type"],
  )

  op.create_table(
      "notification_preferences",
      sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=False), primary_key=True),
      sa.Column(
          "user_id",
          sa.dialects.postgresql.UUID(as_uuid=False),
          sa.ForeignKey("users.id", ondelete="CASCADE"),
          nullable=False,
      ),
      sa.Column("preferences", sa.JSON(), nullable=True),
      sa.Column("email_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
      sa.Column("push_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
      sa.Column("in_app_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
      sa.Column("quiet_hours_start", sa.String(length=5), nullable=True),
      sa.Column("quiet_hours_end", sa.String(length=5), nullable=True),
      sa.Column(
          "created_at",
          sa.DateTime(),
          nullable=False,
          server_default=sa.func.now(),
      ),
      sa.Column(
          "updated_at",
          sa.DateTime(),
          nullable=False,
          server_default=sa.func.now(),
      ),
      sa.UniqueConstraint("user_id", name="uq_notification_preferences_user_id"),
  )
  op.create_index(
      "ix_notification_preferences_user_id",
      "notification_preferences",
      ["user_id"],
  )


def downgrade() -> None:
  op.drop_index("ix_notification_preferences_user_id", table_name="notification_preferences")
  op.drop_table("notification_preferences")

  op.drop_index("ix_notifications_notification_type", table_name="notifications")
  op.drop_index("ix_notifications_is_read", table_name="notifications")
  op.drop_index("ix_notifications_user_id", table_name="notifications")
  op.drop_table("notifications")

  sa.Enum(name="notificationtype").drop(op.get_bind(), checkfirst=False)
  sa.Enum(name="notificationpriority").drop(op.get_bind(), checkfirst=False)

