"""add_site_settings

Revision ID: 20260210_add_site_settings
Revises: 20260209_merge_migration_branches
Create Date: 2026-02-10

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260210_add_site_settings"
down_revision: Union[str, None] = "f0a1b2c3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("site_settings"):
        op.create_table(
            "site_settings",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("general", sa.JSON(), nullable=True),
            sa.Column("smtp", sa.JSON(), nullable=True),
            sa.Column("seo", sa.JSON(), nullable=True),
            sa.Column("custom_code", sa.JSON(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )

    # Tek kayıt tutmak istediğimiz için optional olarak UNIQUE constraint ekleyebiliriz
    # Ancak ileride multi-tenant ihtimali olabileceği için şimdilik sadece
    # "en fazla bir kayıt"ı uygulama seviyesinde enforce edeceğiz.


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("site_settings"):
        op.drop_table("site_settings")

