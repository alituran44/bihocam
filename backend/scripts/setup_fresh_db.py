"""
BiHocam - Sıfırdan Veritabanı Kurulum Scripti
===============================================
Yeni bir PostgreSQL veritabanında sistemi ayağa kaldırır.

Kullanım:
  cd backend
  python scripts/setup_fresh_db.py

Bu script şunları yapar:
  1. Tüm tabloları oluşturur (Base.metadata.create_all)
  2. Varsayılan SiteSettings kaydını oluşturur
  3. Admin kullanıcıyı oluşturur
  4. Varsayılan reklam yerleşimlerini ve fiyatlandırmayı oluşturur

NOT: Mevcut veriler varsa tekrar oluşturmaz (idempotent).
"""
import asyncio
import sys
import os
from pathlib import Path

# Windows terminal encoding
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Proje root
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, text
from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base

# Import ALL models so Base.metadata knows about them
from app.models.user import User, UserRole  # noqa
from app.models.course import Course, Lesson  # noqa
from app.models.cart import CartItem  # noqa
from app.models.coupon import Coupon, CouponUsage  # noqa
from app.models.order import Order, OrderItem  # noqa
from app.models.enrollment import Enrollment  # noqa
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt, QuizAttemptAnswer  # noqa
from app.models.lesson_progress import LessonProgress  # noqa
from app.models.course_review import CourseReview  # noqa
from app.models.course_review_history import CourseReviewHistory  # noqa
from app.models.category import Category, course_categories  # noqa
from app.models.notification import Notification, NotificationPreferences  # noqa
from app.models.site_settings import SiteSettings  # noqa
from app.models.site_announcement import SiteAnnouncement  # noqa
from app.models.popup_announcement import PopupAnnouncement  # noqa
from app.models.email_log import EmailLog  # noqa
from app.models.crm import CrmAudience, CrmAudienceMember, CrmEmailTemplate  # noqa
from app.models.ad_placement import AdPlacement  # noqa
from app.models.ad_campaign import AdCampaign  # noqa
from app.models.ad_pricing import AdPricing  # noqa
from app.models.ad_campaign_analytics import AdCampaignAnalytics  # noqa
from app.models.blog_post import BlogPost  # noqa
from app.models.blog_category import BlogCategory  # noqa
from app.models.blog_tag import BlogTag  # noqa
from app.models.messaging import Conversation, Message, UserBlock, MessageReport  # noqa
from app.models.certificate import Certificate, CertificateTemplate  # noqa
from app.models.teacher_bank_account import TeacherBankAccount  # noqa
from app.models.withdrawal_request import WithdrawalRequest  # noqa
from app.models.teacher_earning import TeacherEarning  # noqa
from app.models.storage_quota import StorageQuota  # noqa
from app.models.content_audit_log import ContentAuditLog  # noqa

from app.core.security import get_password_hash


async def setup():
    print("=" * 60)
    print("  BiHocam - Veritabani Kurulumu")
    print("=" * 60)

    # ── 1. Baglanti kontrolu ──
    print("\n[1/5] Veritabani baglantiyi kontrol ediliyor...")
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version();"))
            version = result.scalar_one()
            print(f"  OK - PostgreSQL: {version[:60]}...")
    except Exception as e:
        print(f"  HATA: Veritabanina baglanilamiyor!")
        print(f"  Detay: {e}")
        print(f"\n  .env dosyanizi kontrol edin veya PostgreSQL'in calistigindann emin olun.")
        return

    # ── 2. Tablolari olustur ──
    print("\n[2/5] Tablolar olusturuluyor (create_all)...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Kac tablo var kontrol et
    async with AsyncSessionLocal() as db:
        result = await db.execute(text(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
        ))
        table_count = result.scalar_one()
        print(f"  OK - {table_count} tablo mevcut")

    # ── 3. Varsayilan SiteSettings ──
    print("\n[3/5] Varsayilan site ayarlari kontrol ediliyor...")
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(SiteSettings).limit(1))
        site_settings = result.scalar_one_or_none()

        if site_settings:
            print(f"  MEVCUT - SiteSettings id={site_settings.id}")
        else:
            site_settings = SiteSettings(
                general={
                    "site_title": "BiHocam",
                    "site_url": "http://localhost:3000",
                    "contact_email": "info@bihocam.com",
                    "primary_color": "#0f766e",
                    "secondary_color": "#f97316",
                    "footer_text": "© BiHocam - Tüm hakları saklıdır.",
                },
                smtp={},
                seo={
                    "meta_title": "BiHocam - Online Egitim Platformu",
                    "meta_description": "BiHocam ile online dersler alin, ogrenin ve gelisin.",
                },
                custom_code={},
                platform={
                    "platform_commission_rate": 35,
                    "currency": "TRY",
                    "maintenance_mode": False,
                },
            )
            db.add(site_settings)
            await db.commit()
            print(f"  OLUSTURULDU - Varsayilan site ayarlari eklendi")

    # ── 4. Admin kullanici ──
    print("\n[4/5] Admin kullanici kontrol ediliyor...")
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.role == UserRole.ADMIN).limit(1)
        )
        admin = result.scalar_one_or_none()

        if admin:
            print(f"  MEVCUT - Admin: {admin.email}")
        else:
            admin_email = os.environ.get("ADMIN_EMAIL", "admin@bihocam.com")
            admin_password = os.environ.get("ADMIN_PASSWORD", "admin123456")
            admin_name = os.environ.get("ADMIN_NAME", "BiHocam Admin")

            admin = User(
                email=admin_email,
                hashed_password=get_password_hash(admin_password),
                full_name=admin_name,
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            await db.commit()
            print(f"  OLUSTURULDU - Admin: {admin_email}")
            print(f"  SIFRE: {admin_password}")
            print(f"  UYARI: Uretim ortaminda sifreyi hemen degistirin!")

    # ── 5. Reklam yerlesim seedleri ──
    print("\n[5/5] Reklam yerlesim ve fiyatlandirma seedleri...")
    try:
        from app.services.ad_seed import seed_default_placements_and_pricing
        async with AsyncSessionLocal() as db:
            await seed_default_placements_and_pricing(db)
        print(f"  OK - Reklam seedleri yuklendi")
    except Exception as e:
        print(f"  UYARI: Reklam seedleri yuklenemedi: {e}")

    # ── Ozet ──
    print("\n" + "=" * 60)
    print("  KURULUM TAMAMLANDI!")
    print("=" * 60)
    print("""
  Sonraki adimlar:
  
  1. Backend'i baslatin:
     cd backend
     uvicorn app.main:app --reload
  
  2. Frontend'i baslatin:
     cd frontend
     npm run dev
  
  3. (Opsiyonel) Mock veri yukleyin:
     cd backend
     python scripts/seed_mock_data.py
  
  4. Tarayicinizi acin:
     http://localhost:3000
""")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(setup())
