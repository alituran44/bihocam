"""
Aktif (PUBLISHED) kursları başlıklarına göre makul kategorilere dağıtır.
Eksik kategorileri oluşturur, kurs–kategori ilişkilerini kurar.

Çalıştırma:
    cd backend
    python scripts/auto_categorize_courses.py
veya
    python -m scripts.auto_categorize_courses
"""

import asyncio
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionLocal
from app.models.course import Course, CourseStatus
from app.models.category import Category
from app.utils.slug import generate_slug


# Başlığa göre kategori tahmini için keyword kuralları
CATEGORY_RULES: list[tuple[str, list[str]]] = [
    # Lise / sınav dersleri
    ("Matematik", ["matematik", "geometri"]),
    ("Fizik", ["fizik"]),
    ("Kimya", ["kimya"]),
    ("Biyoloji", ["biyoloji"]),
    ("Türkçe", ["türkçe", "turkce", "dil bilgisi"]),
    ("Tarih", ["tarih", "osmanlı", "inkılap"]),
    ("Coğrafya", ["coğrafya", "cografya"]),
    ("İngilizce", ["ingilizce", "english"]),
    ("Fen Bilimleri", ["fen bilgisi", "fen bilimleri"]),
    # Genel alanlar
    ("Programlama", ["python", "javascript", "react", "node", "java", "c#", "programlama", "kodlama"]),
    ("Veri Bilimi", ["veri bilimi", "data science", "machine learning", "ml", "yapay zeka", "ai"]),
    ("Web Geliştirme", ["html", "css", "web", "frontend", "backend", "fullstack", "django", "flask", "fastapi"]),
    ("Sınav Hazırlık", ["tyt", "ayt", "lgs", "kpss", "ales", "yks", "deneme", "sınav"]),
    ("İş ve Ofis", ["excel", "word", "powerpoint", "office", "iş dünyası", "kariyer"]),
]

DEFAULT_CATEGORY_NAME = "Genel"


def detect_category_names(title: str) -> list[str]:
    """Kurs başlığından kategori isimlerini tahmin et."""
    t = (title or "").lower()
    matched: list[str] = []

    for cat_name, keywords in CATEGORY_RULES:
        if any(kw in t for kw in keywords):
            matched.append(cat_name)

    if not matched:
        matched.append(DEFAULT_CATEGORY_NAME)

    # Aynı ismi tekrar etme
    seen = set()
    unique: list[str] = []
    for name in matched:
        if name not in seen:
            seen.add(name)
            unique.append(name)
    return unique


async def ensure_categories(
    db: AsyncSession,
    names: Iterable[str],
) -> dict[str, Category]:
    """
    Verilen isimler için kategorileri döndürür.
    Eksik olanları oluşturur.
    """
    names = list(set(names))
    if not names:
        return {}

    # Mevcut olanları çek
    res = await db.execute(select(Category).where(Category.name.in_(names)))
    existing: list[Category] = res.scalars().all()
    by_name: dict[str, Category] = {c.name: c for c in existing}

    # Eksik olanları yarat
    for name in names:
        if name in by_name:
            continue
        slug = await generate_slug(name, db, table="categories")
        cat = Category(
            name=name,
            slug=slug,
            description=None,
            icon="🏷️",
            color="#0d9488",
            is_active=True,
            order=0,
        )
        db.add(cat)
        await db.flush()  # id üret
        by_name[name] = cat
        print(f"🆕 Kategori oluşturuldu: {name} ({slug})")

    return by_name


async def main() -> None:
    async with AsyncSessionLocal() as db:  # type: AsyncSession
        # 1) Yayında olan kursları çek
        res = await db.execute(
            select(Course)
            .options(selectinload(Course.categories))
            .where(Course.status == CourseStatus.PUBLISHED)
            .order_by(Course.created_at.desc())
        )
        courses: list[Course] = res.scalars().unique().all()

        if not courses:
            print("📭 Yayında kurs yok.")
            return

        print(f"✅ {len(courses)} adet yayınlanmış kurs bulundu.")

        # 2) Her kurs için hangi kategorilerin uygun olduğunu hesapla
        course_to_cat_names: dict[str, list[str]] = {}
        all_cat_names: set[str] = set()

        for course in courses:
            names = detect_category_names(course.title or "")
            course_to_cat_names[course.id] = names
            all_cat_names.update(names)
            print(f"• \"{course.title}\" -> {', '.join(names)}")

        # 3) Tüm bu kategorileri oluştur (veya mevcutları al)
        name_to_category = await ensure_categories(db, all_cat_names)

        # 4) Kurs–kategori ilişkilerini kur
        link_created = 0
        for course in courses:
            wanted_names = course_to_cat_names[course.id]
            wanted_categories = [
                name_to_category[n]
                for n in wanted_names
                if n in name_to_category
            ]

            # Mevcut ilişkilere bak
            current_ids = {c.id for c in course.categories}
            for cat in wanted_categories:
                if cat.id in current_ids:
                    continue
                course.categories.append(cat)
                link_created += 1

        await db.commit()
        print(f"🔗 {link_created} yeni kurs–kategori ilişkisi eklendi.")
        print("✅ Otomatik kategorilendirme tamamlandı.")


if __name__ == "__main__":
    asyncio.run(main())

