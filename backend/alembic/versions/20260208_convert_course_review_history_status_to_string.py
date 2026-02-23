"""convert course_review_history status columns to string

Revision ID: d4e5f6a1b2c3
Revises: c3d4e5f6a1b2
Create Date: 2026-02-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d4e5f6a1b2c3"
down_revision: Union[str, None] = "c3d4e5f6a1b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # course_review_history.old_status, new_status ve action_type kolonlarını enum'dan VARCHAR(50)'ye çevir
    # Tüm işlemleri tek bir transaction içinde yapıyoruz
    
    # Önce kolonların var olup olmadığını kontrol et ve yeni kolonları ekle
    op.execute("""
        DO $$ 
        BEGIN
            -- old_status_new kolonu yoksa ekle
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'old_status_new'
            ) THEN
                ALTER TABLE course_review_history ADD COLUMN old_status_new VARCHAR(50);
            END IF;
            
            -- new_status_new kolonu yoksa ekle
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'new_status_new'
            ) THEN
                ALTER TABLE course_review_history ADD COLUMN new_status_new VARCHAR(50) DEFAULT 'draft';
            END IF;
            
            -- action_type_new kolonu yoksa ekle
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'action_type_new'
            ) THEN
                ALTER TABLE course_review_history ADD COLUMN action_type_new VARCHAR(50) DEFAULT 'submit_for_review';
            END IF;
        END $$;
    """)
    
    # Mevcut enum değerlerini string'e kopyala ve küçük harfe çevir
    op.execute("""
        UPDATE course_review_history 
        SET old_status_new = LOWER(old_status::text)
        WHERE old_status IS NOT NULL AND old_status_new IS NULL;
    """)
    
    op.execute("""
        UPDATE course_review_history 
        SET new_status_new = LOWER(new_status::text)
        WHERE new_status_new IS NULL;
    """)
    
    op.execute("""
        UPDATE course_review_history 
        SET action_type_new = LOWER(action_type::text)
        WHERE action_type_new IS NULL;
    """)
    
    # Eski kolonları sil (eğer varsa)
    op.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'old_status'
            ) THEN
                ALTER TABLE course_review_history DROP COLUMN old_status;
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'new_status'
            ) THEN
                ALTER TABLE course_review_history DROP COLUMN new_status;
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'action_type'
            ) THEN
                ALTER TABLE course_review_history DROP COLUMN action_type;
            END IF;
        END $$;
    """)
    
    # Yeni kolonları eski isimlerle yeniden adlandır
    op.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'old_status_new'
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'old_status'
            ) THEN
                ALTER TABLE course_review_history RENAME COLUMN old_status_new TO old_status;
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'new_status_new'
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'new_status'
            ) THEN
                ALTER TABLE course_review_history RENAME COLUMN new_status_new TO new_status;
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'action_type_new'
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'course_review_history' AND column_name = 'action_type'
            ) THEN
                ALTER TABLE course_review_history RENAME COLUMN action_type_new TO action_type;
            END IF;
        END $$;
    """)
    
    # NOT NULL constraint ekle
    op.execute("""
        ALTER TABLE course_review_history 
        ALTER COLUMN new_status SET NOT NULL;
    """)
    
    op.execute("""
        ALTER TABLE course_review_history 
        ALTER COLUMN action_type SET NOT NULL;
    """)
    
    # Default değerleri ayarla
    op.execute("""
        ALTER TABLE course_review_history 
        ALTER COLUMN new_status SET DEFAULT 'draft';
    """)
    
    op.execute("""
        ALTER TABLE course_review_history 
        ALTER COLUMN action_type SET DEFAULT 'submit_for_review';
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
    
    # Yeni kolonları ekle (enum tipinde)
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coursestatus') THEN
                CREATE TYPE coursestatus AS ENUM ('draft', 'pending_review', 'rejected', 'published', 'archived');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderationactiontype') THEN
                CREATE TYPE moderationactiontype AS ENUM ('submit_for_review', 'approve', 'reject', 'edit', 'resubmit', 'archive', 'unarchive');
            END IF;
        END $$;
    """)
    
    op.execute("""
        ALTER TABLE course_review_history 
        ADD COLUMN old_status_enum coursestatus;
    """)
    
    op.execute("""
        ALTER TABLE course_review_history 
        ADD COLUMN new_status_enum coursestatus DEFAULT 'draft';
    """)
    
    op.execute("""
        ALTER TABLE course_review_history 
        ADD COLUMN action_type_enum moderationactiontype DEFAULT 'submit_for_review';
    """)
    
    # Mevcut string değerlerini enum'a kopyala
    op.execute("""
        UPDATE course_review_history 
        SET old_status_enum = old_status::coursestatus
        WHERE old_status IS NOT NULL;
    """)
    
    op.execute("""
        UPDATE course_review_history 
        SET new_status_enum = new_status::coursestatus;
    """)
    
    op.execute("""
        UPDATE course_review_history 
        SET action_type_enum = action_type::moderationactiontype;
    """)
    
    # Eski kolonları sil
    op.execute("""
        ALTER TABLE course_review_history 
        DROP COLUMN old_status;
    """)
    
    op.execute("""
        ALTER TABLE course_review_history 
        DROP COLUMN new_status;
    """)
    
    op.execute("""
        ALTER TABLE course_review_history 
        DROP COLUMN action_type;
    """)
    
    # Yeni kolonları eski isimlerle yeniden adlandır
    op.execute("""
        ALTER TABLE course_review_history 
        RENAME COLUMN old_status_enum TO old_status;
    """)
    
    op.execute("""
        ALTER TABLE course_review_history 
        RENAME COLUMN new_status_enum TO new_status;
    """)
    
    op.execute("""
        ALTER TABLE course_review_history 
        RENAME COLUMN action_type_enum TO action_type;
    """)
    
    # NOT NULL constraint ekle
    op.execute("""
        ALTER TABLE course_review_history 
        ALTER COLUMN new_status SET NOT NULL;
    """)
    
    op.execute("""
        ALTER TABLE course_review_history 
        ALTER COLUMN action_type SET NOT NULL;
    """)