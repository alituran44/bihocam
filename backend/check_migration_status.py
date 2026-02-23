"""Check if course_review_history columns are VARCHAR or enum"""
import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text


async def check_columns():
    async with AsyncSessionLocal() as db:
        # Check column types
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
        
        if not rows:
            print("❌ course_review_history tablosu bulunamadı veya kolonlar yok!")
            return
        
        print("\n📊 course_review_history Kolon Tipleri:\n")
        for row in rows:
            col_name = row[0]
            data_type = row[1]
            udt_name = row[2]
            
            if data_type == 'character varying' or udt_name == 'varchar':
                print(f"✅ {col_name}: VARCHAR (String) - DOĞRU")
            elif data_type == 'USER-DEFINED' or 'enum' in udt_name.lower():
                print(f"❌ {col_name}: ENUM - MİGRATİON GEREKLİ!")
            else:
                print(f"⚠️  {col_name}: {data_type} ({udt_name})")
        
        print("\n" + "="*50)
        
        # Check if migration is needed
        enum_columns = [r for r in rows if r[1] == 'USER-DEFINED' or 'enum' in r[2].lower()]
        if enum_columns:
            print("\n⚠️  MİGRATİON GEREKLİ!")
            print("Manuel SQL dosyasını çalıştırın: backend/migrations_manual.sql")
        else:
            print("\n✅ Tüm kolonlar VARCHAR - Migration başarılı!")


if __name__ == "__main__":
    asyncio.run(check_columns())
