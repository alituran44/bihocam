import asyncio
import sys

# Ensure app modules are importable
sys.path.insert(0, ".")

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.blog_post import BlogPost

async def update_images():
    async with AsyncSessionLocal() as db:
        print("Blog yazısı resimleri güncelleniyor...")
        
        updates = {
            "yks-son-3-ay-netleri-artiracak-altin-kurallar": "/yks_study.png",
            "sinav-stresiyle-bas-etmenin-5-bilimsel-yolu": "/calm_student.png",
            "yapay-zeka-destekli-bireysel-ogrenim-sistemleri": "/ai_study.png"
        }

        updated_count = 0
        for slug, img_url in updates.items():
            res = await db.execute(select(BlogPost).filter(BlogPost.slug == slug))
            post = res.scalar_one_or_none()
            if post:
                post.featured_image_url = img_url
                updated_count += 1
                print(f"Resim güncellendi: {post.title} -> {img_url}")
            else:
                print(f"UYARI: Slug bulunamadı: {slug}")

        await db.commit()
        print(f"\nGüncelleme tamamlandı: {updated_count} blog yazısı resmi veritabanında güncellendi.")

if __name__ == "__main__":
    asyncio.run(update_images())
