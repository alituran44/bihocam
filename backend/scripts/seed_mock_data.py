"""
Mock veri scripti - Backend'e örnek kullanıcılar, kurslar ve dersler ekler
"""
import asyncio
import sys
import os
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timedelta

# Windows terminal encoding sorununu çöz
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Proje root dizinini path'e ekle
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.course import Course, Lesson, CourseStatus, LessonType
from app.models.order import Enrollment, Order, OrderItem, OrderStatus, PaymentMethod
from app.models.lesson_progress import LessonProgress
from app.models.course_review import CourseReview
from app.core.security import get_password_hash


# Mock veriler
MOCK_TEACHERS = [
    {
        "email": "ahmet.yilmaz@bihocam.com",
        "full_name": "Ahmet Yılmaz",
        "password": "password123",
        "role": UserRole.TEACHER,
    },
    {
        "email": "ayse.demir@bihocam.com",
        "full_name": "Ayşe Demir",
        "password": "password123",
        "role": UserRole.TEACHER,
    },
    {
        "email": "mehmet.kaya@bihocam.com",
        "full_name": "Mehmet Kaya",
        "password": "password123",
        "role": UserRole.TEACHER,
    },
    {
        "email": "fatma.oz@bihocam.com",
        "full_name": "Fatma Öz",
        "password": "password123",
        "role": UserRole.TEACHER,
    },
]

MOCK_STUDENTS = [
    {
        "email": "ogrenci1@bihocam.com",
        "full_name": "Ali Veli",
        "password": "password123",
        "role": UserRole.STUDENT,
    },
    {
        "email": "ogrenci2@bihocam.com",
        "full_name": "Zeynep Yıldız",
        "password": "password123",
        "role": UserRole.STUDENT,
    },
]

MOCK_ADMINS = [
    {
        "email": "admin@bihocam.com",
        "full_name": "BiHocam Admin",
        "password": "password123",
        "role": UserRole.ADMIN,
    }
]

MOCK_COURSES = [
    {
        "title": "Matematik - Temel Seviye",
        "slug": "matematik-temel-seviye",
        "description": "Matematik temel konularını öğrenin. Toplama, çıkarma, çarpma ve bölme işlemlerinden başlayarak matematik dünyasına adım atın.",
        "price": Decimal("299.00"),
        "discount_price": Decimal("199.00"),
        "status": CourseStatus.PUBLISHED,
        "is_featured": True,
        "lessons": [
            {"title": "Sayılar ve İşlemler", "order": 1, "duration_seconds": 1800, "is_preview": True},
            {"title": "Toplama İşlemi", "order": 2, "duration_seconds": 2400},
            {"title": "Çıkarma İşlemi", "order": 3, "duration_seconds": 2400},
            {"title": "Çarpma İşlemi", "order": 4, "duration_seconds": 3000},
            {"title": "Bölme İşlemi", "order": 5, "duration_seconds": 3000},
        ],
    },
    {
        "title": "Fizik - Mekanik",
        "slug": "fizik-mekanik",
        "description": "Fizik mekanik konularını detaylı bir şekilde öğrenin. Hareket, kuvvet, enerji ve momentum konularını kapsar.",
        "price": Decimal("399.00"),
        "discount_price": None,
        "status": CourseStatus.PUBLISHED,
        "is_featured": True,
        "lessons": [
            {"title": "Hareket ve Hız", "order": 1, "duration_seconds": 3600, "is_preview": True},
            {"title": "Kuvvet ve Newton Yasaları", "order": 2, "duration_seconds": 4200},
            {"title": "Enerji ve İş", "order": 3, "duration_seconds": 3600},
            {"title": "Momentum", "order": 4, "duration_seconds": 3000},
        ],
    },
    {
        "title": "Kimya - Organik Kimya",
        "slug": "kimya-organik-kimya",
        "description": "Organik kimya temellerini öğrenin. Karbon bileşikleri, reaksiyonlar ve organik sentez konularını kapsar.",
        "price": Decimal("349.00"),
        "discount_price": Decimal("249.00"),
        "status": CourseStatus.PUBLISHED,
        "is_featured": False,
        "lessons": [
            {"title": "Organik Bileşikler", "order": 1, "duration_seconds": 3000, "is_preview": True},
            {"title": "Alkanlar ve Alkenler", "order": 2, "duration_seconds": 3600},
            {"title": "Alkoller ve Eterler", "order": 3, "duration_seconds": 3000},
            {"title": "Karboksilik Asitler", "order": 4, "duration_seconds": 3600},
        ],
    },
    {
        "title": "Türkçe - Dil Bilgisi",
        "slug": "turkce-dil-bilgisi",
        "description": "Türkçe dil bilgisi kurallarını öğrenin. İsimler, fiiller, sıfatlar ve zarflar konularını detaylı bir şekilde işleyin.",
        "price": Decimal("199.00"),
        "discount_price": None,
        "status": CourseStatus.PUBLISHED,
        "is_featured": False,
        "lessons": [
            {"title": "İsimler ve İsim Tamlamaları", "order": 1, "duration_seconds": 2400, "is_preview": True},
            {"title": "Fiiller ve Fiil Çekimleri", "order": 2, "duration_seconds": 3000},
            {"title": "Sıfatlar ve Zarflar", "order": 3, "duration_seconds": 2400},
            {"title": "Edatlar ve Bağlaçlar", "order": 4, "duration_seconds": 1800},
        ],
    },
    {
        "title": "İngilizce - Başlangıç Seviyesi",
        "slug": "ingilizce-baslangic-seviyesi",
        "description": "İngilizce öğrenmeye başlayın. Temel kelimeler, gramer kuralları ve konuşma pratiği ile İngilizce dünyasına adım atın.",
        "price": Decimal("449.00"),
        "discount_price": Decimal("299.00"),
        "status": CourseStatus.PUBLISHED,
        "is_featured": True,
        "lessons": [
            {"title": "Alfabe ve Temel Kelimeler", "order": 1, "duration_seconds": 1800, "is_preview": True},
            {"title": "Present Tense", "order": 2, "duration_seconds": 3600},
            {"title": "Past Tense", "order": 3, "duration_seconds": 3600},
            {"title": "Future Tense", "order": 4, "duration_seconds": 3000},
            {"title": "Konuşma Pratiği", "order": 5, "duration_seconds": 4200},
        ],
    },
    {
        "title": "Biyoloji - Hücre Yapısı",
        "slug": "biyoloji-hucre-yapisi",
        "description": "Hücre yapısı ve işlevlerini öğrenin. Hücre organelleri, hücre bölünmesi ve genetik konularını kapsar.",
        "price": Decimal("379.00"),
        "discount_price": None,
        "status": CourseStatus.PUBLISHED,
        "is_featured": False,
        "lessons": [
            {"title": "Hücre Yapısı", "order": 1, "duration_seconds": 3000, "is_preview": True},
            {"title": "Hücre Organelleri", "order": 2, "duration_seconds": 3600},
            {"title": "Hücre Bölünmesi", "order": 3, "duration_seconds": 4200},
            {"title": "Genetik ve DNA", "order": 4, "duration_seconds": 3600},
        ],
    },
    {
        "title": "Tarih - Osmanlı Tarihi",
        "slug": "tarih-osmanli-tarihi",
        "description": "Osmanlı İmparatorluğu tarihini öğrenin. Kuruluş, yükseliş ve çöküş dönemlerini detaylı bir şekilde işleyin.",
        "price": Decimal("279.00"),
        "discount_price": Decimal("199.00"),
        "status": CourseStatus.PUBLISHED,
        "is_featured": False,
        "lessons": [
            {"title": "Osmanlı'nın Kuruluşu", "order": 1, "duration_seconds": 3600, "is_preview": True},
            {"title": "Yükseliş Dönemi", "order": 2, "duration_seconds": 4200},
            {"title": "Duraklama Dönemi", "order": 3, "duration_seconds": 3600},
            {"title": "Çöküş ve Dağılma", "order": 4, "duration_seconds": 3000},
        ],
    },
    {
        "title": "Coğrafya - Türkiye Coğrafyası",
        "slug": "cografya-turkiye-cografyasi",
        "description": "Türkiye'nin coğrafi özelliklerini öğrenin. Fiziki coğrafya, iklim, bitki örtüsü ve nüfus konularını kapsar.",
        "price": Decimal("229.00"),
        "discount_price": None,
        "status": CourseStatus.PUBLISHED,
        "is_featured": False,
        "lessons": [
            {"title": "Türkiye'nin Fiziki Coğrafyası", "order": 1, "duration_seconds": 3000, "is_preview": True},
            {"title": "İklim ve Bitki Örtüsü", "order": 2, "duration_seconds": 3600},
            {"title": "Nüfus ve Yerleşme", "order": 3, "duration_seconds": 2400},
            {"title": "Ekonomik Coğrafya", "order": 4, "duration_seconds": 3000},
        ],
    },
]


async def create_users(db: AsyncSession):
    """Mock kullanıcıları oluştur"""
    print("📝 Kullanıcılar oluşturuluyor...")
    created_users = []
    all_users = []
    
    # Tüm e-posta adreslerini topla
    all_emails = (
        [t["email"] for t in MOCK_TEACHERS]
        + [s["email"] for s in MOCK_STUDENTS]
        + [a["email"] for a in MOCK_ADMINS]
    )
    
    # Mevcut kullanıcıları al
    result = await db.execute(select(User).where(User.email.in_(all_emails)))
    existing_users = result.scalars().all()
    existing_emails = {user.email for user in existing_users}
    all_users.extend(existing_users)
    
    for user in existing_users:
        print(f"  ⏭️  {user.email} zaten mevcut")
    
    # Yeni eğitmenleri oluştur
    for teacher_data in MOCK_TEACHERS:
        if teacher_data['email'] in existing_emails:
            continue
            
        user = User(
            email=teacher_data["email"],
            hashed_password=get_password_hash(teacher_data["password"]),
            full_name=teacher_data["full_name"],
            role=teacher_data["role"],
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        created_users.append(user)
        all_users.append(user)
        print(f"  ✅ {teacher_data['full_name']} oluşturuldu")
    
    # Yeni öğrencileri oluştur
    for student_data in MOCK_STUDENTS:
        if student_data['email'] in existing_emails:
            continue
            
        user = User(
            email=student_data["email"],
            hashed_password=get_password_hash(student_data["password"]),
            full_name=student_data["full_name"],
            role=student_data["role"],
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        created_users.append(user)
        all_users.append(user)
        print(f"  ✅ {student_data['full_name']} oluşturuldu")

    # Yeni adminleri oluştur
    for admin_data in MOCK_ADMINS:
        if admin_data["email"] in existing_emails:
            continue

        user = User(
            email=admin_data["email"],
            hashed_password=get_password_hash(admin_data["password"]),
            full_name=admin_data["full_name"],
            role=admin_data["role"],
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        created_users.append(user)
        all_users.append(user)
        print(f"  ✅ {admin_data['full_name']} oluşturuldu")
    
    if created_users:
        await db.commit()
        # Oluşturulan kullanıcıları yeniden yükle
        for user in created_users:
            await db.refresh(user)
    
    return all_users


async def create_courses(db: AsyncSession, teachers: list[User]):
    """Mock kursları oluştur"""
    print("\n📚 Kurslar oluşturuluyor...")
    created_courses = []
    total_lessons = 0
    
    teacher_index = 0
    for course_data in MOCK_COURSES:
        # Slug kontrolü
        result = await db.execute(select(Course).where(Course.slug == course_data['slug']))
        if result.scalar_one_or_none():
            print(f"  ⏭️  {course_data['title']} zaten mevcut")
            continue
        
        teacher = teachers[teacher_index % len(teachers)]
        teacher_index += 1
        
        course = Course(
            title=course_data["title"],
            slug=course_data["slug"],
            description=course_data["description"],
            price=course_data["price"],
            discount_price=course_data.get("discount_price"),
            status=course_data["status"],
            is_featured=course_data.get("is_featured", False),
            teacher_id=teacher.id,
            published_at=datetime.now() - timedelta(days=teacher_index),
        )
        db.add(course)
        await db.flush()  # ID'yi almak için
        
        # Dersleri ekle
        lesson_count = len(course_data.get("lessons", []))
        for lesson_data in course_data.get("lessons", []):
            lesson = Lesson(
                title=lesson_data["title"],
                course_id=course.id,
                lesson_type=LessonType.VIDEO,
                order=lesson_data["order"],
                duration_seconds=lesson_data.get("duration_seconds"),
                is_preview=lesson_data.get("is_preview", False),
            )
            db.add(lesson)
        
        total_lessons += lesson_count
        created_courses.append(course)
        print(f"  ✅ {course_data['title']} oluşturuldu ({lesson_count} ders ile)")
    
    await db.commit()
    
    return created_courses, total_lessons


async def create_enrollments_and_progress(db: AsyncSession, users: list[User], courses: list[Course]):
    """Öğrencileri kurslara kaydet ve ilerleme verileri oluştur"""
    print("\n📝 Kayıtlar ve ilerleme verileri oluşturuluyor...")
    students = [u for u in users if u.role == UserRole.STUDENT]
    
    if not students:
        print("  ⚠️  Öğrenci bulunamadı, kayıt oluşturulmayacak")
        return 0, 0
    
    enrollments_created = 0
    progress_created = 0
    
    # Her öğrenciyi bazı kurslara kaydet
    for student in students[:2]:  # İlk 2 öğrenci
        for course in courses[:3]:  # İlk 3 kurs
            # Mevcut kayıt kontrolü
            result = await db.execute(
                select(Enrollment).where(
                    Enrollment.user_id == student.id,
                    Enrollment.course_id == course.id
                )
            )
            if result.scalar_one_or_none():
                continue
            
            # Enrollment oluştur
            enrollment = Enrollment(
                user_id=student.id,
                course_id=course.id,
                progress_percentage=0,
            )
            db.add(enrollment)
            await db.flush()
            enrollments_created += 1
            
            # İlk ders için progress oluştur (bazı öğrenciler için)
            if course.lessons and student == students[0]:
                first_lesson = sorted(course.lessons, key=lambda l: l.order)[0]
                progress = LessonProgress(
                    user_id=student.id,
                    lesson_id=first_lesson.id,
                    enrollment_id=enrollment.id,
                    watched_seconds=300,  # 5 dakika izlenmiş
                    is_completed=False,
                )
                db.add(progress)
                progress_created += 1
    
    await db.commit()
    return enrollments_created, progress_created


async def create_reviews(db: AsyncSession, users: list[User], courses: list[Course]):
    """Kurs yorumları oluştur"""
    print("\n⭐ Kurs yorumları oluşturuluyor...")
    students = [u for u in users if u.role == UserRole.STUDENT]
    reviews_created = 0
    
    if not students:
        print("  ⚠️  Öğrenci bulunamadı, yorum oluşturulmayacak")
        return 0
    
    # Her öğrenci bazı kurslara yorum yapsın
    review_templates = [
        {"rating": 5, "title": "Harika bir kurs!", "comment": "Çok faydalı ve açıklayıcı. Kesinlikle tavsiye ederim."},
        {"rating": 4, "title": "İyi bir kurs", "comment": "Güzel anlatılmış, biraz daha örnek olsa daha iyi olurdu."},
        {"rating": 5, "title": "Mükemmel", "comment": "Eğitmen çok iyi, konular çok net anlatılmış."},
        {"rating": 4, "title": "Beğendim", "comment": "İyi bir kurs, devamını bekliyorum."},
    ]
    
    for i, course in enumerate(courses[:4]):  # İlk 4 kurs
        if i >= len(students):
            break
        
        student = students[i % len(students)]
        template = review_templates[i % len(review_templates)]
        
        # Mevcut yorum kontrolü
        result = await db.execute(
            select(CourseReview).where(
                CourseReview.user_id == student.id,
                CourseReview.course_id == course.id
            )
        )
        if result.scalar_one_or_none():
            continue
        
        # Enrollment kontrolü (yorum yapabilmek için)
        enrollment_result = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == student.id,
                Enrollment.course_id == course.id
            )
        )
        enrollment = enrollment_result.scalar_one_or_none()
        
        review = CourseReview(
            user_id=student.id,
            course_id=course.id,
            enrollment_id=enrollment.id if enrollment else None,
            rating=template["rating"],
            title=template["title"],
            comment=template["comment"],
            is_approved=True,
        )
        db.add(review)
        reviews_created += 1
    
    await db.commit()
    return reviews_created


async def main():
    """Ana fonksiyon"""
    print("🚀 Mock veri oluşturma başlatılıyor...\n")
    
    async with AsyncSessionLocal() as db:
        try:
            # Kullanıcıları oluştur
            users = await create_users(db)
            teachers = [u for u in users if u.role in [UserRole.TEACHER, UserRole.ADMIN]]
            
            if not teachers:
                print("❌ Eğitmen bulunamadı! Önce eğitmenler oluşturulmalı.")
                return
            
            # Kursları oluştur
            courses, total_lessons = await create_courses(db, teachers)
            
            # Mevcut tüm kursları al (oluşturulan + zaten var olanlar)
            all_courses_result = await db.execute(
                select(Course)
                .options(selectinload(Course.lessons))
                .where(Course.status == CourseStatus.PUBLISHED)
            )
            all_courses = all_courses_result.scalars().all()
            courses_with_lessons = list(all_courses)
            
            # Eğer hiç kurs yoksa uyar
            if not courses_with_lessons:
                print("  ⚠️  Hiç kurs bulunamadı!")
                return
            
            # Kayıtlar ve ilerleme verileri oluştur
            enrollments_count, progress_count = await create_enrollments_and_progress(db, users, courses_with_lessons)
            
            # Yorumlar oluştur
            reviews_count = await create_reviews(db, users, courses_with_lessons)
            
            print(f"\n✅ Tamamlandı!")
            print(f"   👥 {len(users)} kullanıcı oluşturuldu")
            print(f"   📚 {len(courses)} kurs oluşturuldu")
            print(f"   📖 Toplam {total_lessons} ders oluşturuldu")
            print(f"   📝 {enrollments_count} kayıt oluşturuldu")
            print(f"   📊 {progress_count} ilerleme kaydı oluşturuldu")
            print(f"   ⭐ {reviews_count} yorum oluşturuldu")
            
        except Exception as e:
            print(f"\n❌ Hata oluştu: {e}")
            import traceback
            traceback.print_exc()
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
