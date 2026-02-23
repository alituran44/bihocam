"""
Fix lesson_type enum case issues in database
Converts uppercase values (PDF, VIDEO, etc.) to lowercase (pdf, video, etc.)
"""
import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text


async def fix_lesson_types():
    """Fix case issues in lesson_type enum values"""
    async with AsyncSessionLocal() as db:
        try:
            print("Lesson type case duzeltmesi baslatiliyor...\n")
            
            # Önce enum değerlerini kontrol et
            enum_result = await db.execute(text("""
                SELECT enumlabel 
                FROM pg_enum 
                WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'lessontype')
                ORDER BY enumsortorder;
            """))
            enum_values = [row[0] for row in enum_result.fetchall()]
            print(f"Mevcut enum degerleri: {enum_values}\n")
            
            # Eksik küçük harfli değerleri ekle
            lowercase_values = ['video', 'pdf', 'quiz']
            for value in lowercase_values:
                if value not in enum_values:
                    print(f"Enum'a '{value}' degeri ekleniyor...")
                    await db.execute(text(f"""
                        DO $$ 
                        BEGIN
                            IF NOT EXISTS (
                                SELECT 1 FROM pg_enum 
                                WHERE enumlabel = '{value}' 
                                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'lessontype')
                            ) THEN
                                ALTER TYPE lessontype ADD VALUE '{value}';
                            END IF;
                        END $$;
                    """))
                    print(f"  OK: '{value}' eklendi")
            
            await db.commit()
            print("\nEnum degerleri guncellendi, simdi dersleri guncelliyoruz...\n")
            
            # Mevcut lesson_type değerlerini kontrol et
            current_result = await db.execute(text("""
                SELECT DISTINCT lesson_type::text 
                FROM lessons 
                ORDER BY lesson_type::text;
            """))
            current_values = [row[0] for row in current_result.fetchall()]
            print(f"Mevcut ders tipleri: {current_values}\n")
            
            # Büyük harfli değerleri küçük harfe çevir
            mapping = {
                'VIDEO': 'video',
                'PDF': 'pdf',
                'QUIZ': 'quiz',
            }
            
            for old_value, new_value in mapping.items():
                if old_value in current_values:
                    result = await db.execute(text(f"""
                        UPDATE lessons
                        SET lesson_type = '{new_value}'::lessontype
                        WHERE lesson_type::text = '{old_value}';
                    """))
                    print(f"  {old_value} -> {new_value}: {result.rowcount} ders guncellendi")
            
            await db.commit()
            print("\nOK: Tum degisiklikler kaydedildi")
            
        except Exception as e:
            await db.rollback()
            print(f"HATA: {e}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            await db.close()


if __name__ == "__main__":
    asyncio.run(fix_lesson_types())
