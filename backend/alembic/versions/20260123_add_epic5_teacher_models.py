"""add EPIC-5 teacher profile and financial models

Revision ID: f7a8b9c0d1e2
Revises: 5302cd7439b9
Create Date: 2026-01-23
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "f7a8b9c0d1e2"
down_revision: Union[str, None] = "5302cd7439b9"  # 20260123_add_user_phone_and_last_login.py
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 0. Enum'ları oluştur (eğer yoksa)
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bankaccountstatus') THEN
                CREATE TYPE bankaccountstatus AS ENUM ('pending', 'approved', 'rejected');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'earningtype') THEN
                CREATE TYPE earningtype AS ENUM ('earning', 'withdrawal', 'adjustment', 'commission');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawalstatus') THEN
                CREATE TYPE withdrawalstatus AS ENUM ('pending', 'approved', 'rejected', 'paid');
            END IF;
        END $$;
    """)
    
    # 1. User tablosuna teacher profile alanlarını ekle (eğer yoksa)
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
                ALTER TABLE users ADD COLUMN bio TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'expertise_tags') THEN
                ALTER TABLE users ADD COLUMN expertise_tags JSONB;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'social_links') THEN
                ALTER TABLE users ADD COLUMN social_links JSONB;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
                ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
            END IF;
        END $$;
    """)
    
    # 2. Teacher bank accounts tablosu (eğer yoksa)
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_bank_accounts') THEN
                CREATE TABLE teacher_bank_accounts (
                    id VARCHAR NOT NULL,
                    teacher_id VARCHAR NOT NULL,
                    bank_name VARCHAR(100) NOT NULL,
                    iban VARCHAR(34) NOT NULL,
                    account_holder_name VARCHAR(150) NOT NULL,
                    is_default BOOLEAN DEFAULT 'false' NOT NULL,
                    status bankaccountstatus DEFAULT 'pending' NOT NULL,
                    review_note TEXT,
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
                    approved_at TIMESTAMP WITHOUT TIME ZONE,
                    rejected_at TIMESTAMP WITHOUT TIME ZONE,
                    PRIMARY KEY (id),
                    FOREIGN KEY(teacher_id) REFERENCES users (id) ON DELETE CASCADE
                );
                CREATE INDEX ix_teacher_bank_accounts_teacher_id ON teacher_bank_accounts (teacher_id);
                CREATE UNIQUE INDEX ix_teacher_bank_accounts_iban ON teacher_bank_accounts (iban);
                CREATE INDEX ix_teacher_bank_accounts_is_default ON teacher_bank_accounts (is_default);
                CREATE INDEX ix_teacher_bank_accounts_status ON teacher_bank_accounts (status);
            END IF;
        END $$;
    """)
    
    # 3. Teacher earnings tablosu (eğer yoksa)
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_earnings') THEN
                CREATE TABLE teacher_earnings (
                    id VARCHAR NOT NULL,
                    teacher_id VARCHAR NOT NULL,
                    course_id VARCHAR,
                    order_id VARCHAR,
                    withdrawal_request_id VARCHAR,
                    amount NUMERIC(10, 2) NOT NULL,
                    currency VARCHAR(3) DEFAULT 'TRY' NOT NULL,
                    gross_amount NUMERIC(10, 2),
                    commission_rate NUMERIC(5, 2),
                    commission_amount NUMERIC(10, 2),
                    type earningtype NOT NULL,
                    description TEXT,
                    reference_id VARCHAR(255),
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY(teacher_id) REFERENCES users (id) ON DELETE CASCADE,
                    FOREIGN KEY(course_id) REFERENCES courses (id) ON DELETE SET NULL,
                    FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE SET NULL
                );
                CREATE INDEX ix_teacher_earnings_teacher_id ON teacher_earnings (teacher_id);
                CREATE INDEX ix_teacher_earnings_course_id ON teacher_earnings (course_id);
                CREATE INDEX ix_teacher_earnings_order_id ON teacher_earnings (order_id);
                CREATE INDEX ix_teacher_earnings_withdrawal_request_id ON teacher_earnings (withdrawal_request_id);
                CREATE INDEX ix_teacher_earnings_type ON teacher_earnings (type);
                CREATE INDEX ix_teacher_earnings_created_at ON teacher_earnings (created_at);
                CREATE INDEX ix_teacher_earnings_reference_id ON teacher_earnings (reference_id);
            END IF;
        END $$;
    """)
    
    # 4. Withdrawal requests tablosu (eğer yoksa)
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'withdrawal_requests') THEN
                CREATE TABLE withdrawal_requests (
                    id VARCHAR NOT NULL,
                    teacher_id VARCHAR NOT NULL,
                    bank_account_id VARCHAR NOT NULL,
                    amount NUMERIC(10, 2) NOT NULL,
                    currency VARCHAR(3) DEFAULT 'TRY' NOT NULL,
                    status withdrawalstatus DEFAULT 'pending' NOT NULL,
                    admin_note TEXT,
                    requested_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
                    processed_at TIMESTAMP WITHOUT TIME ZONE,
                    paid_at TIMESTAMP WITHOUT TIME ZONE,
                    PRIMARY KEY (id),
                    FOREIGN KEY(teacher_id) REFERENCES users (id) ON DELETE CASCADE,
                    FOREIGN KEY(bank_account_id) REFERENCES teacher_bank_accounts (id) ON DELETE RESTRICT
                );
                CREATE INDEX ix_withdrawal_requests_teacher_id ON withdrawal_requests (teacher_id);
                CREATE INDEX ix_withdrawal_requests_bank_account_id ON withdrawal_requests (bank_account_id);
                CREATE INDEX ix_withdrawal_requests_status ON withdrawal_requests (status);
                CREATE INDEX ix_withdrawal_requests_requested_at ON withdrawal_requests (requested_at);
            END IF;
        END $$;
    """)
    
    # 5. Withdrawal requests foreign key constraint for teacher_earnings (eğer yoksa)
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_teacher_earnings_withdrawal_request_id'
            ) THEN
                ALTER TABLE teacher_earnings 
                ADD CONSTRAINT fk_teacher_earnings_withdrawal_request_id 
                FOREIGN KEY (withdrawal_request_id) REFERENCES withdrawal_requests (id) ON DELETE SET NULL;
            END IF;
        END $$;
    """)


def downgrade() -> None:
    # Tabloları sil (foreign key'ler otomatik silinecek)
    op.execute("DROP TABLE IF EXISTS withdrawal_requests CASCADE")
    op.execute("DROP TABLE IF EXISTS teacher_earnings CASCADE")
    op.execute("DROP TABLE IF EXISTS teacher_bank_accounts CASCADE")
    
    # Enum'ları sil
    op.execute("DROP TYPE IF EXISTS withdrawalstatus")
    op.execute("DROP TYPE IF EXISTS earningtype")
    op.execute("DROP TYPE IF EXISTS bankaccountstatus")
    
    # User tablosundan teacher profile alanlarını sil
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS avatar_url")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS social_links")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS expertise_tags")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS bio")
