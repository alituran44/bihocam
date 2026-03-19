"""
BiHocam — Demo veri seed script'i
Sunucuda: python seed_data.py

Admin, öğretmen, öğrenci, kategoriler, kurslar, dersler oluşturur.
"""
import asyncio
import sys
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import uuid4

# Ensure app modules are importable
sys.path.insert(0, ".")

from sqlalchemy import select
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal, engine
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.course import Course, Lesson, LessonType
from app.models.category import Category
from app.models.notification import NotificationPreferences


async def seed():
    # Tabloları oluştur (varsa atla)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Zaten veri var mı kontrol et
        existing = await db.execute(select(User).limit(1))
        if existing.scalar_one_or_none():
            print("Veri zaten mevcut, seed atlanıyor.")
            return

        print("Seed verileri oluşturuluyor...")

        # ====== KULLANICILAR ======
        admin = User(
            id=str(uuid4()),
            email="admin@bihocam.com",
            hashed_password=get_password_hash("admin123456"),
            full_name="BiHocam Admin",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )

        teacher1 = User(
            id=str(uuid4()),
            email="ahmet.yilmaz@bihocam.com",
            hashed_password=get_password_hash("teacher123456"),
            full_name="Ahmet Yılmaz",
            role=UserRole.TEACHER,
            is_active=True,
            is_verified=True,
            bio="10 yıllık yazılım deneyimi. Full-stack web geliştirme uzmanı.",
            expertise_tags=["Python", "FastAPI", "React", "PostgreSQL"],
        )

        teacher2 = User(
            id=str(uuid4()),
            email="elif.kara@bihocam.com",
            hashed_password=get_password_hash("teacher123456"),
            full_name="Elif Kara",
            role=UserRole.TEACHER,
            is_active=True,
            is_verified=True,
            bio="Veri bilimi ve yapay zeka alanında uzman. Üniversitede ders veriyor.",
            expertise_tags=["Python", "Machine Learning", "Data Science", "TensorFlow"],
        )

        student1 = User(
            id=str(uuid4()),
            email="ogrenci1@bihocam.com",
            hashed_password=get_password_hash("student123456"),
            full_name="Mehmet Demir",
            role=UserRole.STUDENT,
            is_active=True,
            is_verified=True,
        )

        student2 = User(
            id=str(uuid4()),
            email="ogrenci2@bihocam.com",
            hashed_password=get_password_hash("student123456"),
            full_name="Ayşe Çelik",
            role=UserRole.STUDENT,
            is_active=True,
            is_verified=True,
        )

        for u in [admin, teacher1, teacher2, student1, student2]:
            db.add(u)
        await db.flush()

        # Bildirim tercihleri
        for u in [admin, teacher1, teacher2, student1, student2]:
            db.add(NotificationPreferences(user_id=u.id))

        print(f"  5 kullanıcı oluşturuldu")

        # ====== KATEGORİLER ======
        categories = []
        cat_data = [
            ("Yazılım Geliştirme", "yazilim-gelistirme", "#0d9488"),
            ("Veri Bilimi", "veri-bilimi", "#7c3aed"),
            ("Tasarım", "tasarim", "#e11d48"),
            ("İş & Pazarlama", "is-pazarlama", "#ea580c"),
            ("Kişisel Gelişim", "kisisel-gelisim", "#2563eb"),
        ]
        for name, slug, color in cat_data:
            cat = Category(id=str(uuid4()), name=name, slug=slug, color=color, is_active=True)
            db.add(cat)
            categories.append(cat)
        await db.flush()
        print(f"  {len(categories)} kategori oluşturuldu")

        # ====== KURSLAR ======
        course1 = Course(
            id=str(uuid4()),
            title="Python ile Web Geliştirme - FastAPI",
            slug="python-fastapi-web-gelistirme",
            description="Sıfırdan ileri seviyeye Python FastAPI ile modern web uygulamaları geliştirmeyi öğrenin. REST API tasarımı, veritabanı entegrasyonu, authentication ve deployment konularını kapsar.",
            price=Decimal("299.90"),
            discount_price=Decimal("199.90"),
            teacher_id=teacher1.id,
            status="published",
            is_featured=True,
            published_at=datetime.utcnow() - timedelta(days=10),
            meta_title="Python FastAPI Kursu | BiHocam",
            meta_description="FastAPI ile profesyonel web API'ları geliştirin",
        )

        course2 = Course(
            id=str(uuid4()),
            title="React ile Modern Frontend Geliştirme",
            slug="react-modern-frontend",
            description="React 19, Next.js, TypeScript ve Tailwind CSS ile profesyonel frontend uygulamaları geliştirin. Component mimarisi, state management, API entegrasyonu ve performans optimizasyonu.",
            price=Decimal("349.90"),
            teacher_id=teacher1.id,
            status="published",
            is_featured=True,
            published_at=datetime.utcnow() - timedelta(days=5),
        )

        course3 = Course(
            id=str(uuid4()),
            title="Yapay Zeka ve Machine Learning Temelleri",
            slug="yapay-zeka-ml-temelleri",
            description="Python ile makine öğrenmesi algoritmalarını öğrenin. Scikit-learn, TensorFlow ve gerçek dünya projeleri ile uygulamalı eğitim.",
            price=Decimal("449.90"),
            discount_price=Decimal("349.90"),
            teacher_id=teacher2.id,
            status="published",
            is_featured=False,
            published_at=datetime.utcnow() - timedelta(days=3),
        )

        course4 = Course(
            id=str(uuid4()),
            title="Veri Analizi ve Görselleştirme",
            slug="veri-analizi-gorsellestirme",
            description="Pandas, NumPy ve Matplotlib ile veri analizi. SQL, Excel entegrasyonu ve dashboard oluşturma.",
            price=Decimal("249.90"),
            teacher_id=teacher2.id,
            status="published",
            published_at=datetime.utcnow() - timedelta(days=1),
        )

        course5 = Course(
            id=str(uuid4()),
            title="PostgreSQL Veritabanı Yönetimi",
            slug="postgresql-veritabani-yonetimi",
            description="PostgreSQL ile ileri seviye veritabanı yönetimi. Index optimizasyonu, partitioning, replikasyon ve backup stratejileri.",
            price=Decimal("199.90"),
            teacher_id=teacher1.id,
            status="draft",
        )

        courses = [course1, course2, course3, course4, course5]
        for c in courses:
            db.add(c)
        await db.flush()

        # Kurs-Kategori ilişkileri
        from app.models.category import course_categories
        await db.execute(course_categories.insert().values(course_id=course1.id, category_id=categories[0].id))
        await db.execute(course_categories.insert().values(course_id=course2.id, category_id=categories[0].id))
        await db.execute(course_categories.insert().values(course_id=course3.id, category_id=categories[1].id))
        await db.execute(course_categories.insert().values(course_id=course4.id, category_id=categories[1].id))
        await db.execute(course_categories.insert().values(course_id=course5.id, category_id=categories[0].id))

        print(f"  {len(courses)} kurs oluşturuldu")

        # ====== DERSLER ======
        lesson_count = 0
        # Course 1 dersleri
        for i, (title, ltype) in enumerate([
            ("Giriş ve Kurulum", LessonType.VIDEO),
            ("FastAPI Temelleri", LessonType.VIDEO),
            ("Route ve Path Parametreleri", LessonType.VIDEO),
            ("Pydantic Modelleri", LessonType.VIDEO),
            ("Veritabanı Entegrasyonu (SQLAlchemy)", LessonType.VIDEO),
            ("Authentication - JWT", LessonType.VIDEO),
            ("Middleware ve Error Handling", LessonType.VIDEO),
            ("Kurs Dokümanları", LessonType.PDF),
            ("Final Quiz", LessonType.QUIZ),
        ], 1):
            db.add(Lesson(
                id=str(uuid4()),
                title=title,
                lesson_type=ltype,
                order=i,
                course_id=course1.id,
                is_preview=(i <= 2),
                duration_seconds=1800 + (i * 300) if ltype == LessonType.VIDEO else None,
            ))
            lesson_count += 1

        # Course 2 dersleri
        for i, title in enumerate([
            "React Kurulumu ve JSX",
            "Component Mimarisi",
            "Hooks: useState ve useEffect",
            "React Query ile API Entegrasyonu",
            "Next.js App Router",
            "Tailwind CSS ile Styling",
        ], 1):
            db.add(Lesson(
                id=str(uuid4()),
                title=title,
                lesson_type=LessonType.VIDEO,
                order=i,
                course_id=course2.id,
                is_preview=(i == 1),
                duration_seconds=2400 + (i * 200),
            ))
            lesson_count += 1

        # Course 3 dersleri
        for i, title in enumerate([
            "Yapay Zeka Nedir?",
            "Python ile Veri Hazırlama",
            "Lineer Regresyon",
            "Karar Ağaçları",
            "Neural Network Temelleri",
            "TensorFlow ile Uygulama",
            "Proje: Görüntü Sınıflandırma",
        ], 1):
            db.add(Lesson(
                id=str(uuid4()),
                title=title,
                lesson_type=LessonType.VIDEO,
                order=i,
                course_id=course3.id,
                is_preview=(i <= 2),
                duration_seconds=2000 + (i * 400),
            ))
            lesson_count += 1

        # Course 4 dersleri
        for i, title in enumerate([
            "Pandas ile Veri Okuma",
            "Veri Temizleme Teknikleri",
            "Matplotlib Grafikleri",
            "Dashboard Oluşturma",
        ], 1):
            db.add(Lesson(
                id=str(uuid4()),
                title=title,
                lesson_type=LessonType.VIDEO,
                order=i,
                course_id=course4.id,
                is_preview=(i == 1),
                duration_seconds=1500 + (i * 300),
            ))
            lesson_count += 1

        print(f"  {lesson_count} ders oluşturuldu")

        # ====== COMMIT ======
        await db.commit()
        print("\nSeed tamamlandı!")
        print("=" * 40)
        print("Demo Hesaplar:")
        print(f"  Admin:    admin@bihocam.com / admin123456")
        print(f"  Öğretmen: ahmet.yilmaz@bihocam.com / teacher123456")
        print(f"  Öğretmen: elif.kara@bihocam.com / teacher123456")
        print(f"  Öğrenci:  ogrenci1@bihocam.com / student123456")
        print(f"  Öğrenci:  ogrenci2@bihocam.com / student123456")


if __name__ == "__main__":
    asyncio.run(seed())
