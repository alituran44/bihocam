"""Manually run migration to convert course_review_history enum columns to VARCHAR"""
import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text


async def run_migration():
    async with AsyncSessionLocal() as db:
        try:
            print("🔄 Migration başlatılıyor...\n")
            
            # 1. Add new VARCHAR columns
            print("1️⃣  Yeni VARCHAR kolonları ekleniyor...")
            await db.execute(text("""
                ALTER TABLE course_review_history 
                ADD COLUMN IF NOT EXISTS old_status_new VARCHAR(50);
            """))
            
            await db.execute(text("""
                ALTER TABLE course_review_history 
                ADD COLUMN IF NOT EXISTS new_status_new VARCHAR(50) DEFAULT 'draft';
            """))
            
            await db.execute(text("""
                ALTER TABLE course_review_history 
                ADD COLUMN IF NOT EXISTS action_type_new VARCHAR(50) DEFAULT 'submit_for_review';
            """))
            print("   ✅ Yeni kolonlar eklendi\n")
            
            # 2. Copy existing enum values to VARCHAR columns
            print("2️⃣  Enum değerleri VARCHAR'a kopyalanıyor...")
            result = await db.execute(text("""
                UPDATE course_review_history 
                SET old_status_new = LOWER(old_status::text)
                WHERE old_status IS NOT NULL AND old_status_new IS NULL;
            """))
            print(f"   ✅ {result.rowcount} satır güncellendi (old_status)")
            
            result = await db.execute(text("""
                UPDATE course_review_history 
                SET new_status_new = LOWER(new_status::text)
                WHERE new_status_new IS NULL;
            """))
            print(f"   ✅ {result.rowcount} satır güncellendi (new_status)")
            
            result = await db.execute(text("""
                UPDATE course_review_history 
                SET action_type_new = LOWER(action_type::text)
                WHERE action_type_new IS NULL;
            """))
            print(f"   ✅ {result.rowcount} satır güncellendi (action_type)\n")
            
            # 3. Drop old enum columns
            print("3️⃣  Eski enum kolonları siliniyor...")
            await db.execute(text("""
                ALTER TABLE course_review_history 
                DROP COLUMN IF EXISTS old_status;
            """))
            
            await db.execute(text("""
                ALTER TABLE course_review_history 
                DROP COLUMN IF EXISTS new_status;
            """))
            
            await db.execute(text("""
                ALTER TABLE course_review_history 
                DROP COLUMN IF EXISTS action_type;
            """))
            print("   ✅ Eski kolonlar silindi\n")
            
            # 4. Rename new columns to original names
            print("4️⃣  Yeni kolonlar eski isimlerle yeniden adlandırılıyor...")
            await db.execute(text("""
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
            """))
            print("   ✅ Kolonlar yeniden adlandırıldı\n")
            
            # 5. Add NOT NULL constraints
            print("5️⃣  NOT NULL constraint'leri ekleniyor...")
            await db.execute(text("""
                ALTER TABLE course_review_history 
                ALTER COLUMN new_status SET NOT NULL;
            """))
            
            await db.execute(text("""
                ALTER TABLE course_review_history 
                ALTER COLUMN action_type SET NOT NULL;
            """))
            print("   ✅ Constraint'ler eklendi\n")
            
            # 6. Set defaults
            print("6️⃣  Default değerler ayarlanıyor...")
            await db.execute(text("""
                ALTER TABLE course_review_history 
                ALTER COLUMN new_status SET DEFAULT 'draft';
            """))
            
            await db.execute(text("""
                ALTER TABLE course_review_history 
                ALTER COLUMN action_type SET DEFAULT 'submit_for_review';
            """))
            print("   ✅ Default değerler ayarlandı\n")
            
            # Commit
            await db.commit()
            
            print("="*50)
            print("✅ MİGRATİON BAŞARIYLA TAMAMLANDI!")
            print("="*50)
            
            # Verify
            print("\n🔍 Kolon tiplerini kontrol ediliyor...\n")
            result = await db.execute(text("""
                SELECT 
                    column_name, 
                    data_type,
                    udt_name
                FROM information_schema.columns 
                WHERE table_name = 'course_review_history' 
                AND column_name IN ('old_status', 'new_status', 'action_type')
                ORDER BY column_name;
            """))
            
            rows = result.fetchall()
            for row in rows:
                col_name = row[0]
                data_type = row[1]
                udt_name = row[2]
                
                if data_type == 'character varying' or udt_name == 'varchar':
                    print(f"✅ {col_name}: VARCHAR (String)")
                else:
                    print(f"⚠️  {col_name}: {data_type} ({udt_name})")
            
        except Exception as e:
            await db.rollback()
            print(f"\n❌ HATA: {e}")
            print("\nMigration geri alındı (rollback).")
            raise


if __name__ == "__main__":
    asyncio.run(run_migration())
