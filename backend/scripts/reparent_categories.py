"""
Kategori düzenleme script'i.

Senaryon:
  - Bazı ders kategorilerini (Matematik, Fizik, Kimya, vb.) tek bir üst kategori
    altında (ör: "YKS") toplamak istiyorsun.
  - "Genel" gibi çok geniş kategorileri kurslardan kaldırmak istiyorsun.

Bu script:
  1) VERILEN İSİMLERDEKİ kategorileri bulur (örn. Matematik, Fizik, Kimya, Biyoloji, Türkçe, Tarih, Coğrafya).
  2) "YKS" isimli bir üst kategori yoksa oluşturur.
  3) Bu kategorilerin `parent_id` alanını YKS'ye bağlar.
  4) "Genel" kategorisini bulur ve:
       - `Genel` + başka kategoriye sahip olan kurslardan `Genel`'i kaldırır.
       - Sadece `Genel`'e sahip kurslar varsa onları şimdilik olduğu gibi bırakır
         (istersen altta yorumlu kısmı açıp tamamen kaldırabilirsin).

Çalıştırma:
    cd backend
    python -m scripts.reparent_categories
"""

import asyncio
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionLocal
from app.models.category import Category
from app.models.course import Course
from app.utils.slug import generate_slug


# YKS gibi üst kategori adı
PARENT_CATEGORY_NAME = "YKS"

# Bu isimlere sahip kategoriler YKS altına alınacak
CHILD_CATEGORY_NAMES: list[str] = [
    "Matematik",
    "Fizik",
    "Kimya",
    "Biyoloji",
    "Türkçe",
    "Tarih",
    "Coğrafya",
    "İngilizce",
]

# Kurslardan kaldırılacak çok genel kategori adı
GENERIC_CATEGORY_NAME = "Genel"


async def get_or_create_parent_category(db: AsyncSession) -> Category:
    """YKS (veya belirlediğin isimde) üst kategoriyi getirir, yoksa oluşturur."""
    res = await db.execute(select(Category).where(Category.name == PARENT_CATEGORY_NAME))
    parent = res.scalar_one_or_none()

    if parent:
        print(f"✅ Üst kategori zaten var: {parent.name} ({parent.slug})")
        return parent

    slug = await generate_slug(PARENT_CATEGORY_NAME, db, table="categories")
    parent = Category(
        name=PARENT_CATEGORY_NAME,
        slug=slug,
        description="Sınav odaklı dersler için üst kategori",
        icon="🎯",
        color="#0f766e",
        is_active=True,
        order=0,
    )
    db.add(parent)
    await db.flush()
    print(f"🆕 Üst kategori oluşturuldu: {parent.name} ({parent.slug})")
    return parent


async def move_children_under_parent(db: AsyncSession, parent: Category) -> None:
    """Belirlenen isimlerdeki kategorileri verilen parent altına taşır."""
    res = await db.execute(
        select(Category)
        .where(Category.name.in_(CHILD_CATEGORY_NAMES))
        .options(selectinload(Category.children))
    )
    children: list[Category] = res.scalars().all()

    if not children:
        print("⚠️ Belirtilen isimlerde alt kategori bulunamadı.")
        return

    for cat in children:
        if cat.id == parent.id:
            continue
        old_parent = cat.parent_id
        cat.parent_id = parent.id
        print(
            f"🔁 Kategori yeniden konumlandırıldı: {cat.name} "
            f"(eski parent={old_parent}, yeni parent={parent.id})"
        )


async def remove_generic_from_courses(db: AsyncSession) -> None:
    """
    'Genel' kategorisini, başka kategorileri de olan kurslardan kaldırır.
    Sadece 'Genel' kategorisine sahip kurslar şimdilik olduğu gibi bırakılır.
    """
    res = await db.execute(
        select(Category)
        .where(Category.name == GENERIC_CATEGORY_NAME)
        .options(selectinload(Category.courses).selectinload(Course.categories))
    )
    generic = res.scalar_one_or_none()

    if not generic:
        print(f"ℹ️ '{GENERIC_CATEGORY_NAME}' isminde kategori bulunamadı, atlanıyor.")
        return

    removed_links = 0
    for course in list(generic.courses):
        # Kursun başka kategorisi de varsa Genel'i kaldır
        if len(course.categories) > 1:
            course.categories = [c for c in course.categories if c.id != generic.id]
            removed_links += 1
            print(f"❌ 'Genel' kaldırıldı: {course.title}")

    print(f"✅ Toplam {removed_links} kurs'tan '{GENERIC_CATEGORY_NAME}' kategorisi kaldırıldı.")

    # Eğer hiç kurs kalmadıysa istersen kategorinin kendisini de silebilirsin:
    # if not generic.courses:
    #     await db.delete(generic)
    #     print(f\"🗑️ '{GENERIC_CATEGORY_NAME}' kategorisi silindi (hiç kurs kalmadı).\")


async def main() -> None:
    async with AsyncSessionLocal() as db:
        parent = await get_or_create_parent_category(db)
        await move_children_under_parent(db, parent)
        await remove_generic_from_courses(db)

        await db.commit()
        print("🎉 Kategori yeniden yapılandırma işlemi tamamlandı.")


if __name__ == "__main__":
    asyncio.run(main())

