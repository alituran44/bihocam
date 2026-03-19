"""add_ad_spend_to_earningtype

P1-06: EarningType enum'una ad_spend değerini ekler.
Model'de tanımlı olan AD_SPEND enum değeri migration'da eksikti.

Revision ID: 20260319_ad_spend_enum
Revises: 20260223_site_wide_coupons
Create Date: 2026-03-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '20260319_ad_spend_enum'
down_revision: Union[str, None] = '20260223_site_wide_coupons'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL'de mevcut enum tipine yeni değer ekleme
    # IF NOT EXISTS ile idempotent yapıyoruz
    op.execute("ALTER TYPE earningtype ADD VALUE IF NOT EXISTS 'ad_spend'")


def downgrade() -> None:
    # PostgreSQL'de enum değeri kaldırmak doğrudan mümkün değil.
    # ad_spend kullanan kayıt yoksa sorun yok, varsa migration geri alınamaz.
    # Bu bilinçli bir karar — enum değeri production'da kullanıldıktan sonra
    # kaldırılması veri kaybına yol açar.
    pass
