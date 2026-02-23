"""convert course status enum to string

Revision ID: 20260207_convert_course_status_enum_to_string
Revises: b2c3d4e5f6a1
Create Date: 2026-02-07
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a1b2"  # Kısa hash - course status enum to string
down_revision: Union[str, None] = "b2c3d4e5f6a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # courses.status kolonunu enum'dan VARCHAR(50)'ye çevir
    # Önce yeni kolonu ekle
    op.execute("""
        ALTER TABLE courses 
        ADD COLUMN status_new VARCHAR(50) DEFAULT 'draft';
    """)
    
    # Mevcut enum değerlerini string'e kopyala ve küçük harfe çevir
    op.execute("""
        UPDATE courses 
        SET status_new = LOWER(status::text);
    """)
    
    # Eski kolonu sil
    op.execute("""
        ALTER TABLE courses 
        DROP COLUMN status;
    """)
    
    # Yeni kolonu eski isimle yeniden adlandır
    op.execute("""
        ALTER TABLE courses 
        RENAME COLUMN status_new TO status;
    """)
    
    # NOT NULL constraint ekle
    op.execute("""
        ALTER TABLE courses 
        ALTER COLUMN status SET NOT NULL;
    """)
    
    # Default değeri kaldır (artık gerek yok)
    op.execute("""
        ALTER TABLE courses 
        ALTER COLUMN status DROP DEFAULT;
    """)
    
    # Default değeri tekrar ekle (model'de default var)
    op.execute("""
        ALTER TABLE courses 
        ALTER COLUMN status SET DEFAULT 'draft';
    """)


def downgrade() -> None:
    # Geri alma: VARCHAR'dan enum'a çevir
    # Önce enum type'ı kontrol et (zaten varsa hata vermez)
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coursestatus') THEN
                CREATE TYPE coursestatus AS ENUM ('draft', 'pending_review', 'rejected', 'published', 'archived');
            END IF;
        END $$;
    """)
    
    # Yeni kolonu ekle (enum tipinde)
    op.execute("""
        ALTER TABLE courses 
        ADD COLUMN status_enum coursestatus DEFAULT 'draft';
    """)
    
    # Mevcut string değerlerini enum'a kopyala
    op.execute("""
        UPDATE courses 
        SET status_enum = status::coursestatus;
    """)
    
    # Eski kolonu sil
    op.execute("""
        ALTER TABLE courses 
        DROP COLUMN status;
    """)
    
    # Yeni kolonu eski isimle yeniden adlandır
    op.execute("""
        ALTER TABLE courses 
        RENAME COLUMN status_enum TO status;
    """)
    
    # NOT NULL constraint ekle
    op.execute("""
        ALTER TABLE courses 
        ALTER COLUMN status SET NOT NULL;
    """)
