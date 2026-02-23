# 📋 BiHocam - Kategori Sistemi Kanban Board

**Proje:** Kategori Sistemi Geliştirme  
**Durum:** 🟠 Planlama Aşaması  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2-3 Gün

---

## 📊 Genel Durum

- **Toplam Task:** 26/26 ✅
- **Backend:** 13/13 ✅
- **Frontend:** 13/13 ✅
- **Tamamlanma:** 100%

---

## ğŸ¯ Aktif EPIC'ler ve Durum

### ✅ EPIC-4: Kullanıcı & Rol Yönetimi
- **Durum:** ✅ TAMAMLANDI
- **Backend:** 4/4 ✅
- **Frontend:** 3/3 ✅
- **Ek İyileştirmeler:**
  - ✅ Admin sidebar menüsü gruplandı (Kurslar, Kullanıcılar, Finansal, Bildirim)
  - ✅ Admin için gereksiz menü Ã¶ğeleri kaldırıldı (Kurslarım, Siparişlerim)
  - ✅ Bildirim logları sayfası eklendi (`/dashboard/admin/notifications/logs`)

### ✅ EPIC-5: Eğitmen Profili, Finans & Ödeme Akışları
- **Durum:** ✅ TAMAMLANDI
- **Backend:** 6/6 ✅
- **Frontend:** 5/5 ✅
- **Ek İyileştirmeler:**
  - ✅ Admin dashboard tasarımı modernize edildi (glassmorphism, gradient efektler)
  - ✅ Bekleyen banka hesabı talepleri dashboard'a eklendi
  - ✅ Admin banka hesabı yÃ¶netim sayfası eklendi

### ✅ EPIC-6: Siparişler & Kupon Yönetimi
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK
- **Backend:** 4/4 ✅ (EP6-BE-01 ~ EP6-BE-04)
- **Frontend:** 5/5 ✅ (EP6-FE-01 ~ EP6-FE-05)
- **Not:** Admin sipariş filtreleri + detay/iade, admin kupon CRUD, öğretmen satışları, sidebar + API client tamamlandı.

### ✅ EPIC-7: Öğrenciler, Yorumlar & Moderasyon
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🟠 ORTA
- **Backend:** 5/5 ✅ (EP7-BE-01 ~ EP7-BE-05)
- **Frontend:** 6/6 ✅ (EP7-FE-01 ~ EP7-FE-06)
- **Ek İyileştirmeler:**
  - ✅ Public course page'de eğitmen cevapları gösterimi
  - ✅ Öğrenci için "Yorumlarım" sayfası (`/dashboard/my-reviews`)
  - ✅ Notification type'ları veritabanına eklendi (review_approved, review_rejected, teacher_reply)
  - ✅ Rating recalculation servisi eklendi
  - ✅ Modern glassmorphism tasarım (yeşil tonlar)

### ✅ EPIC-8: Raporlar & İstatistikler
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🟠 ORTA
- **Backend:** 3/3 ✅ (EP8-BE-01 ~ EP8-BE-03)
- **Frontend:** 4/4 ✅ (EP8-FE-01 ~ EP8-FE-04)
- **Ek İyileştirmeler:**
  - ✅ Recharts entegrasyonu (line, bar, pie, area, composed charts)
  - ✅ React Query ile data management ve auto-refresh
  - ✅ Loading/error state handling
  - ✅ TypeScript type safety
  - ✅ Modern glassmorphism tasarım (yeşil tonlar)
  - ✅ **Analitik Suite Genişletmesi:**
    - ✅ Sidebar'da "Analitik" ayrı section olarak eklendi (Finansal'dan ayrıldı)
    - ✅ Kategori Analizi detay sayfası (`/dashboard/admin/analytics/categories`)
    - ✅ Kurs Performansı detay sayfası (`/dashboard/admin/analytics/courses`)
    - ✅ Öğrenci Analizi detay sayfası (`/dashboard/admin/analytics/students`)
    - ✅ Eğitmen Performansı detay sayfası (`/dashboard/admin/analytics/teachers`)
    - ✅ Zaman Serisi Analizi detay sayfası (`/dashboard/admin/analytics/timeseries`)
    - ✅ Backend'e öğrenci analizi endpoint'i (`/admin/reports/student-analytics`)
    - ✅ Backend'e eğitmen performans endpoint'i (`/admin/reports/teacher-performance`)
    - ✅ Ana analitik sayfasına quick link kartları eklendi
    - ✅ Her detay sayfasında KPI kartları, filtreler, grafikler ve detaylı tablolar

### ✅ EPIC-9: Not Yönetimi & Site Ayarları
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK
- **Backend:** 6/6 ✅ (EP9-BE-01 ~ EP9-BE-06)
- **Frontend:** 8/8 ✅ (EP9-FE-01 ~ EP9-FE-08)
- **Ek İyileştirmeler:**
  - ✅ Maintenance mode middleware - admin login ve public settings endpoint'leri exempt edildi
  - ✅ Maintenance page tasarımı - yeşil tonlar (emerald-teal-cyan), animasyonlu blob backgrounds, geometric patterns, glassmorphism
  - ✅ Maintenance page - admin login butonu kaldırıldı (admin zaten nereye gireceğini biliyor)
  - ✅ AnnouncementBanner - öğrenci rolü için düzeltme (target_audience="students" ve "all" duyuruları gösteriliyor)
  - ✅ SiteSettingsScripts - SEO kodları (Google Analytics, GTM, Search Console, Bing, Yandex) ve custom code injection
  - ✅ Admin sidebar - tüm menü grupları varsayılan olarak expand (courses, users, analytics, financial, notifications, announcements, settings, crm)
  - ✅ Public settings endpoint - platform settings (maintenance_mode, maintenance_message, maintenance_estimated_end) dahil
  - ✅ Homepage maintenance mode kontrolü - direkt maintenance page render (redirect loop önleme)
  - ✅ Platform settings - commission_rate, currency, tax_rate, maintenance_mode SiteSettings'e eklendi
  - ✅ SiteSettings model - platform JSON field eklendi
  - ✅ Maintenance mode middleware - OPTIONS (CORS preflight) requests exempt
  - ✅ Axios interceptor - 503 response'ları yakalayıp maintenance page'e yönlendirme

### ✅ EPIC-10: Eğitim İçerikleri & Storage Modülü
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK
- **Backend:** 16/18 ✅ (EP10-BE-01, BE-02, BE-03, BE-04, BE-05, BE-06, BE-07, BE-08, BE-09, BE-10, BE-11, BE-12, BE-13, BE-14, BE-15, BE-17, BE-18)
- **Frontend:** 13/13 ✅ (EP10-FE-01, FE-02, FE-03, FE-04, FE-05, FE-06, FE-07, FE-08, FE-09, FE-10, FE-11, FE-12, FE-13)
- **Security & Quality:** 0/5 (EP10-SQ-01 ~ EP10-SQ-05) - Opsiyonel iyileştirmeler
- **Açıklama:** Storage abstraction layer (local → S3/GCS geçişi), çoklu içerik tipi desteği (Video, PDF, DOCX, PPTX, PPT), ders düzenleme/sıralama, içerik önizleme, canlı ders yönetimi, öğrenci içerik erişimi. **Güvenlik ve kalite iyileştirmeleri dahil.**
- **Tamamlanma Tarihi:** 2025-02-XX
- **Not:** Ana özellikler tamamlandı. Kalan task'lar opsiyonel iyileştirmeler (test suite, performance optimization, dokümantasyon).

### ⏳ NOTIF-V2: E-Mail Entegrasyonu
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK
- **Backend:** 5/5 ✅ (NOTIFV2-BE-01 ~ NOTIFV2-BE-05)
- **Frontend:** 2/2 ✅ (NOTIFV2-FE-01 ~ NOTIFV2-FE-02)
- **Açıklama:** SMTP email gönderimi, Jinja2 şablonlar, async worker, log & retry, admin email yönetimi

### 💡 CLAUDE-EPICS: Yaratıcı Öneriler (Gelecek Yol Haritası)
- **Durum:** 💡 ÖNERİ
- **Toplam:** 10 EPIC önerisi
- **İçerik:** Canlı Ders, Sertifika, Mesajlaşma, AI Asistan, Gamification, Affiliate, Blog/CMS, PWA, i18n, Gelişmiş Arama

---

## 🔴 BACKEND TASKS

### 💡¦ Model & Database

#### [BE-01] Category Model Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 30 dk

**Açıklama:**
- `backend/app/models/category.py` dosyası oluştur
- SQLAlchemy model tanımla
- Gerekli alanlar:
  - `id`: UUID (Primary Key)
  - `name`: String (Kategori adı, unique, required)
  - `slug`: String (URL-friendly, unique, auto-generate)
  - `description`: String (Optional, kategori açıklaması)
  - `icon`: String (Optional, icon class veya emoji)
  - `color`: String (Optional, hex color code, default: teal)
  - `is_active`: Boolean (Default: True)
  - `parent_id`: UUID (Optional, ForeignKey to Category - alt kategori desteği)
  - `order`: Integer (Sıralama, default: 0)
  - `created_at`: DateTime
  - `updated_at`: DateTime

**Kriterler:**
- ✅ Model SQLAlchemy Base'den inherit etmeli
- ✅ `__tablename__` = "categories"
- ✅ Timestamp mixin kullanılmalı
- ✅ Relationship tanımları (courses, parent, children)

**Kod Örneği:**
```python
class Category(Base, TimestampMixin):
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    color = Column(String(7), nullable=True, default="#0d9488")
    is_active = Column(Boolean, default=True, nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    order = Column(Integer, default=0, nullable=False)
    
    # Relationships
    parent = relationship("Category", remote_side=[id], back_populates="children")
    children = relationship("Category", back_populates="parent")
    courses = relationship("Course", secondary="course_categories", back_populates="categories")
```

> [!IMPORTANT]
> **GEMINI-COMMENT:** Slug oluşturma mantığında collision (çakışma) yönetimi mutlaka olmalı. Aynı isimde veya benzer isimde kategori açıldığında slug sonuna `-1`, `-2` gibi ekler getirecek bir yapı kurulmalı. Ayrıca `slug` alanının `index=True` olması performans için kritik, plana eklenmiş olması güzel.

---

#### [BE-02] Course-Category İlişki Tablosu
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 15 dk

**Açıklama:**
- Many-to-Many ilişki için association table
- `course_categories` tablosu oluştur
- `course_id` ve `category_id` foreign keys

**Kriterler:**
- ✅ Composite primary key (course_id, category_id)
- ✅ Cascade delete desteği
- ✅ Index'ler eklenmeli

**Kod Örneği:**
```python
course_categories = Table(
    "course_categories",
    Base.metadata,
    Column("course_id", UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
    Index("idx_course_category", "course_id", "category_id"),
)
```

---

#### [BE-03] Course Model Güncelleme
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 20 dk

**Açıklama:**
- `Course` modeline `categories` relationship ekle
- `course_categories` association table kullan

**Kriterler:**
- ✅ Mevcut Course modeline dokunmadan ekleme
- ✅ Backward compatibility korunmalı
- ✅ Relationship lazy loading ayarlanmalı

**Değişiklikler:**
```python
# Course modeline eklenecek:
categories = relationship("Category", secondary="course_categories", back_populates="courses")
```

---

#### [BE-04] Database Migration
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 30 dk

**Açıklama:**
- Alembic migration dosyası oluştur
- `categories` tablosu oluştur
- `course_categories` association table oluştur
- Seed data ekle (en az 5-10 kategori)

**Kriterler:**
- ✅ Migration dosyası isimlendirme: `YYYYMMDD_HHMMSS_add_categories.py`
- ✅ Rollback desteği
- ✅ Seed data için ayrı migration veya script
- ✅ Default kategoriler: "Programlama", "Tasarım", "İş Dünyası", "Kişisel Gelişim", "Dil Eğitimi"

**Migration Adımları:**
1. `alembic revision --autogenerate -m "add categories"`
2. Migration dosyasını kontrol et
3. Seed data scripti oluştur
4. `alembic upgrade head` çalıştır
5. Seed data'yı import et

---

### 💡Œ API Endpoints

#### [BE-05] Category List Endpoint
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- `GET /api/v1/categories` endpoint
- Tüm aktif kategorileri listele
- Query params: `skip`, `limit`, `parent_id`, `is_active`
- Response: Category listesi (id, name, slug, icon, color, course_count)

**Kriterler:**
- ✅ Pagination desteği
- ✅ Filtreleme (parent_id, is_active)
- ✅ Sıralama (order field'a gÃ¶re)
- ✅ Course count hesaplama (subquery ile)
- ✅ Response model (Pydantic)

**Endpoint:**
```
GET /api/v1/categories?skip=0&limit=20&parent_id=null&is_active=true
```

**Response Model:**
```python
class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    icon: Optional[str]
    color: Optional[str]
    is_active: bool
    parent_id: Optional[UUID]
    order: int
    course_count: int
    created_at: datetime
    updated_at: datetime
```

---

#### [BE-05B] Category Tree Endpoint (Hiyerarşik)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 45 dk

**Açıklama:**
- `GET /api/v1/categories/tree` endpoint
- **N+1 problemi Ã¶nlemek için**: Tüm kategorileri tek seferde hiyerarşik (nested tree) dÃ¶ndür
- Frontend'de ağaç yapısını oluşturmak için optimize edilmiş

**Kriterler:**
- ✅ Tüm kategorileri tek sorguda çek
- ✅ Parent-child ilişkilerini memory'de organize et
- ✅ Nested tree structure dÃ¶ndür
- ✅ Course count include et
- ✅ Sadece aktif kategoriler (is_active=True)

**Endpoint:**
```
GET /api/v1/categories/tree?is_active=true
```

**Response Model:**
```python
class CategoryTreeResponse(CategoryResponse):
    children: List["CategoryTreeResponse"] = []

# Response Ã¶rneği:
[
  {
    "id": "...",
    "name": "Programlama",
    "children": [
      {
        "id": "...",
        "name": "Python",
        "children": []
      },
      {
        "id": "...",
        "name": "JavaScript",
        "children": []
      }
    ]
  }
]
```

**Implementation:**
```python
async def get_category_tree(db: AsyncSession, is_active: bool = True):
    # Tüm kategorileri tek sorguda çek
    result = await db.execute(
        select(Category)
        .where(Category.is_active == is_active)
        .order_by(Category.order, Category.name)
    )
    categories = result.scalars().all()
    
    # Memory'de tree oluştur
    category_dict = {cat.id: CategoryTreeResponse.from_orm(cat) for cat in categories}
    root_categories = []
    
    for cat in categories:
        tree_node = category_dict[cat.id]
        if cat.parent_id:
            parent = category_dict.get(cat.parent_id)
            if parent:
                parent.children.append(tree_node)
        else:
            root_categories.append(tree_node)
    
    return root_categories
```

> [!TIP]
> **GEMINI-COMMENT:** Frontend tarafında kategori ağacını oluştururken her seviye için ayrı sorgu atmak (N+1) yerine, API'nin tüm kategorileri tek seferde hiyerarşik (nested tree) dÃ¶nen bir endpoint'i (Ã¶rn: `GET /categories/tree`) olması performans için çok daha iyidir.

---

#### [BE-06] Category Detail Endpoint
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 30 dk

**Açıklama:**
- `GET /api/v1/categories/{category_id}` endpoint
- Tek kategori detayı
- Alt kategorileri de dÃ¶ndür
- İlgili kurs sayısı

**Kriterler:**
- ✅ 404 handling (kategori bulunamazsa)
- ✅ Children kategorileri include et
- ✅ Course count

**Response:**
```python
class CategoryDetailResponse(CategoryResponse):
    children: List[CategoryResponse]
    parent: Optional[CategoryResponse]
```

---

#### [BE-07] Category Create Endpoint
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 45 dk

**Açıklama:**
- `POST /api/v1/categories` endpoint
- Yeni kategori oluştur
- Sadece admin/staff erişebilir
- Slug otomatik generate et

**Kriterler:**
- ✅ Authentication required
- ✅ Role check (admin/staff)
- ✅ Slug generation (Türkçe karakter desteği)
- ✅ Validation (name unique, slug unique)
- ✅ Parent category validation

**Request Model:**
```python
class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = Field(None, regex="^#[0-9A-Fa-f]{6}$")
    parent_id: Optional[UUID] = None
    order: int = Field(0, ge=0)
```

---

#### [BE-08] Category Update Endpoint
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 45 dk

**Açıklama:**
- `PUT /api/v1/categories/{category_id}` endpoint
- Kategori güncelle
- Sadece admin/staff erişebilir

**Kriterler:**
- ✅ Partial update desteği
- ✅ Slug güncelleme (optional)
- ✅ Circular parent validation (kendi kendinin parent'ı olamaz)
- ✅ Validation

**Request Model:**
```python
class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = Field(None, regex="^#[0-9A-Fa-f]{6}$")
    parent_id: Optional[UUID] = None
    order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
```

---

#### [BE-09] Category Delete Endpoint
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:**
- `DELETE /api/v1/categories/{category_id}` endpoint
- **ZORUNLU: Soft delete kullan** (`is_active=False`)
- Sadece admin erişebilir
- **Kursları başka kategoriye taşıma opsiyonu**

**Kriterler:**
- ✅ **Soft delete zorunlu** (hard delete yasak - SEO ve data bütünlüğü için)
- ✅ Alt kategori kontrolü (children varsa silinemez - 400 Bad Request)
- ✅ Kurs kontrolü:
  - Eğer courses varsa: `migrate_to_category_id` parametresi zorunlu
  - Kursları belirtilen kategoriye taşı
  - Yoksa: 400 Bad Request (kursları taşı veya silme)
- ✅ Cascade handling
- ✅ Validation (migrate_to_category_id geçerli kategori mi?)

**Request Model:**
```python
class CategoryDeleteRequest(BaseModel):
    migrate_to_category_id: Optional[UUID] = None
    # Eğer kurslar varsa, bu parametre zorunlu
```

**Strateji:**
1. Alt kategori kontrolü:
   - Children varsa → 400 Bad Request ("Alt kategorileri Ã¶nce silin")
2. Kurs kontrolü:
   - Courses varsa:
     - `migrate_to_category_id` yoksa → 400 Bad Request
     - `migrate_to_category_id` varsa → Kursları taşı, sonra soft delete
   - Courses yoksa → Direkt soft delete
3. Soft delete:
   - `is_active = False` set et
   - **Hard delete YAPMA**

**Implementation:**
```python
@router.delete("/{category_id}")
async def delete_category(
    category_id: UUID,
    request: CategoryDeleteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    category = await db.get(Category, category_id)
    if not category:
        raise HTTPException(404, "Kategori bulunamadı")
    
    # Alt kategori kontrolü
    if category.children:
        raise HTTPException(400, "Alt kategorileri Ã¶nce silin")
    
    # Kurs kontrolü
    course_count = len(category.courses)
    if course_count > 0:
        if not request.migrate_to_category_id:
            raise HTTPException(
                400, 
                f"Bu kategoride {course_count} kurs var. Kursları taşımak için 'migrate_to_category_id' parametresi gerekli."
            )
        
        # Kursları taşı
        target_category = await db.get(Category, request.migrate_to_category_id)
        if not target_category:
            raise HTTPException(404, "Hedef kategori bulunamadı")
        
        for course in category.courses:
            course.categories.remove(category)
            course.categories.append(target_category)
    
    # Soft delete
    category.is_active = False
    await db.commit()
    
    return {"message": "Kategori silindi (soft delete)"}
```

> [!CAUTION]
> **GEMINI-COMMENT:** Kursu olan bir kategoriyi silmeyi sadece engellemek yetersiz. "Kursları başka kategoriye taşı" opsiyonu BE-09'a eklenmeli. Ayrıca SEO ve data bütünlüğü için hard delete yerine kalıcı olarak `is_active=False` (soft delete) kullanılması zorunlu tutulmalı.

---

#### [BE-10] Course-Category İlişki Endpoints
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Kurs oluştururken/güncellerken kategori atama
- `POST /api/v1/courses/{course_id}/categories` - Kategori ekle
- `DELETE /api/v1/courses/{course_id}/categories/{category_id}` - Kategori kaldır
- `GET /api/v1/courses/{course_id}/categories` - Kurs kategorileri

**Kriterler:**
- ✅ Course update endpoint'ine category_ids ekle
- ✅ Bulk category assignment
- ✅ Validation (kategori var mı, aktif mi)

**Request Model (Course Update'e eklenecek):**
```python
category_ids: Optional[List[UUID]] = None
```

---

#### [BE-11] Category Router Entegrasyonu
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 20 dk

**Açıklama:**
- `backend/app/api/v1/endpoints/categories.py` oluştur
- Router'ı `backend/app/api/v1/router.py`'ye ekle
- Tag: "categories"

**Kriterler:**
- ✅ Router yapısı diğer endpoint'lerle tutarlı
- ✅ Dependency injection (get_current_user, get_db)
- ✅ Error handling

**Router Yapısı:**
```python
router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def list_categories(...):
    ...

@router.get("/{category_id}", response_model=CategoryDetailResponse)
async def get_category(...):
    ...

# ... diğer endpoints
```

---

#### [BE-12] Slug Generation Utility
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 45 dk

**Açıklama:**
- Türkçe karakter desteği ile slug generation
- `backend/app/utils/slug.py` oluştur
- `generate_slug(name: str) -> str` fonksiyonu
- **Collision (çakışma) yönetimi zorunlu**

**Kriterler:**
- ✅ Türkçe karakter mapping (ğ→g, ü→u, ş→s, ı→i, Ã¶→o, ç→c)
- ✅ Lowercase
- ✅ Special chars → hyphen
- ✅ Multiple hyphens → single hyphen
- ✅ Trim hyphens from start/end
- ✅ **Collision yönetimi**: Slug zaten varsa sonuna `-1`, `-2`, `-3` gibi ekler getir
- ✅ Database'de unique kontrolü
- ✅ Recursive collision check (sonsuz dÃ¶ngü Ã¶nleme)

**Fonksiyon:**
```python
async def generate_slug(
    name: str, 
    db: AsyncSession,
    table: str = "categories",
    max_attempts: int = 100
) -> str:
    –"
    Slug oluştur ve collision yönetimi yap.
    Eğer slug zaten varsa, sonuna -1, -2, -3 ekle.
    –"
    base_slug = _slugify(name)  # Türkçe karakter dönüşümü + slugify
    
    # İlk deneme
    slug = base_slug
    attempt = 0
    
    while attempt < max_attempts:
        # Database'de kontrol et
        exists = await _check_slug_exists(db, table, slug)
        if not exists:
            return slug
        
        # Collision var, numara ekle
        attempt += 1
        slug = f"{base_slug}-{attempt}"
    
    raise ValueError(f"Slug oluşturulamadı: {name} (max attempts: {max_attempts})")
```

**Örnek:**
- "Programlama" → "programlama"
- "Programlama" (zaten var) → "programlama-1"
- "Programlama" (ikisi de var) → "programlama-2"

---

## ğŸ¨ FRONTEND TASKS

### ğŸ§© API Integration

#### [FE-01] Category API Client
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 45 dk

**Açıklama:**
- `frontend/src/lib/api.ts` dosyasına category API ekle
- Tüm CRUD işlemleri için fonksiyonlar

**Kriterler:**
- ✅ TypeScript type definitions
- ✅ Error handling
- ✅ React Query uyumlu

**API Fonksiyonları:**
```typescript
export const categoriesApi = {
  list: async (params?: { skip?: number; limit?: number; parent_id?: string; is_active?: boolean }) => Promise<Category[]>,
  getTree: async (is_active?: boolean) => Promise<Category[]>, // Hiyerarşik tree
  get: async (categoryId: string) => Promise<Category>,
  create: async (data: CategoryCreate) => Promise<Category>,
  update: async (categoryId: string, data: CategoryUpdate) => Promise<Category>,
  delete: async (categoryId: string, migrateToCategoryId?: string) => Promise<void>, // migrate_to_category_id parametresi
  getCourseCategories: async (courseId: string) => Promise<Category[]>,
  addCategoryToCourse: async (courseId: string, categoryId: string) => Promise<void>,
  removeCategoryFromCourse: async (courseId: string, categoryId: string) => Promise<void>,
};
```

**Type Definitions:**
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  parent_id?: string | null;
  order: number;
  course_count?: number;
  children?: Category[];
  parent?: Category | null;
  created_at: string;
  updated_at: string;
}
```

---

### ⏳ Pages & Components

#### [FE-02] Kategori Filtreleme (Kurslar Sayfası)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- `frontend/src/app/courses/page.tsx` güncelle
- Statik kategori filtreleme yerine dinamik
- Kategorileri API'den çek
- Kategori badge'leri gÃ¶ster
- Kategori seçildiğinde filtrele

**Kriterler:**
- ✅ Kategorileri sidebar veya üstte gÃ¶ster
- ✅ Aktif kategori highlight
- ✅ "Tümü" seçeneği
- ✅ Kategori badge'leri (icon + color)
- ✅ Loading state
- ✅ Empty state

**UI Tasarım:**
- Kategori butonları: Teal/orange theme
- Aktif kategori: Gradient background
- Icon + name gÃ¶sterimi
- Course count gÃ¶sterimi

**Değişiklikler:**
```typescript
// Mevcut statik kategorileri kaldır
// API'den kategorileri çek
const { data: categories } = useQuery({
  queryKey: ["categories"],
  queryFn: () => categoriesApi.list({ is_active: true }),
});

// Filtreleme state'i
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
```

---

#### [FE-03] Kategori Seçimi (Kurs Oluşturma)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- `frontend/src/app/(dashboard)/dashboard/my-courses/new/page.tsx` güncelle
- Step 1'e kategori seçimi ekle
- Multi-select dropdown veya checkbox list
- Kategori badge preview

**Kriterler:**
- ✅ Multi-select (birden fazla kategori)
- ✅ Kategori arama (search input)
- ✅ Kategori grupları (parent/children)
- ✅ Seçili kategorileri gÃ¶ster
- ✅ Validation (en az 1 kategori)

**UI Tasarım:**
- Dropdown veya modal picker
- Kategori kartları (icon + color + name)
- Seçili kategoriler: Badge listesi
- Search bar

**Form Data:**
```typescript
category_ids: string[] // Step 1'e eklenecek
```

---

#### [FE-04] Kategori Yönetimi Sayfası (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:**
- `frontend/src/app/(dashboard)/dashboard/categories/page.tsx` oluştur
- Kategori listesi (table veya grid)
- CRUD işlemleri
- Sadece admin/staff erişebilir

**Kriterler:**
- ✅ Kategori listesi (name, slug, course_count, actions)
- ✅ Create button
- ✅ Edit modal/form
- ✅ Delete confirmation
- ✅ Parent/children hierarchy gÃ¶sterimi
- ✅ Drag & drop sıralama (optional)
- ✅ Active/inactive toggle

**UI Tasarım:**
- Modern table veya card grid
- Teal theme
- Action buttons (edit, delete, toggle)
- Create/Edit modal

**Sayfa Yapısı:**
```
/dashboard/categories
â”œâ”€â”€ Header (Başlık + Create Button)
â”œâ”€â”€ Kategori Listesi
â”‚   â”œâ”€â”€ Kategori Kartı/Row
â”‚   â”‚   â”œâ”€â”€ Icon + Name
â”‚   â”‚   â”œâ”€â”€ Slug
â”‚   â”‚   â”œâ”€â”€ Course Count
â”‚   â”‚   â”œâ”€â”€ Status Badge
â”‚   â”‚   â–â”€â”€ Actions (Edit, Delete, Toggle)
â”‚   â–â”€â”€ ...
â–â”€â”€ Create/Edit Modal
```

---

#### [FE-05] Kategori Oluşturma/Edit Modal
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Kategori form component'i
- Create ve Edit için kullanılabilir
- Modal içinde gÃ¶ster

**Kriterler:**
- ✅ Form validation
- ✅ Icon picker (emoji veya icon library)
- ✅ Color picker
- ✅ Parent category select
- ✅ Slug preview (auto-generate)
- ✅ Error handling

**Form Fields:**
- Name (required)
- Description (optional)
- Icon (optional, emoji picker)
- Color (optional, color picker, default: teal)
- Parent Category (optional, dropdown)
- Order (optional, number input)

**UI:**
- Modern modal design
- Teal theme
- Form validation messages
- Submit/Cancel buttons

---

#### [FE-06] Kategori Badge Component
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 30 dk

**Açıklama:**
- `frontend/src/components/CategoryBadge.tsx` oluştur
- Kategori gÃ¶sterimi için reusable component
- Icon + name + color

**Kriterler:**
- ✅ Icon gÃ¶sterimi (emoji veya icon)
- ✅ Color background
- ✅ Hover effects
- ✅ Click handler (optional)
- ✅ Size variants (sm, md, lg)

**Props:**
```typescript
interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  onClick?: () => void;
  className?: string;
}
```

**Kullanım:**
```tsx
<CategoryBadge category={category} size="md" showCount />
```

---

#### [FE-07] Kurs Detay Sayfası - Kategori GÃ¶sterimi
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 30 dk

**Açıklama:**
- `frontend/src/app/courses/[slug]/page.tsx` güncelle
- Kurs kategorilerini gÃ¶ster
- Kategori badge'leri
- Kategoriye tıklayınca filtreleme

**Kriterler:**
- ✅ Kurs kategorileri hero section'da gÃ¶ster
- ✅ Kategori badge'leri
- ✅ Kategoriye tıklayınca `/courses?category={slug}` yÃ¶nlendir

**Değişiklikler:**
```typescript
// Course type'a categories ekle
interface Course {
  // ... existing fields
  categories?: Category[];
}

// Hero section'da gÃ¶ster
{course.categories && course.categories.length > 0 && (
  <div className="flex items-center gap-2 flex-wrap">
    {course.categories.map((cat) => (
      <Link key={cat.id} href={`/courses?category=${cat.slug}`}>
        <CategoryBadge category={cat} />
      </Link>
    ))}
  </div>
)}
```

---

#### [FE-08] Kurs Kartında Kategori Badge
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 30 dk

**Açıklama:**
- Kurs kartlarına kategori badge'i ekle
- `frontend/src/app/courses/page.tsx` ve diğer kurs listeleri

**Kriterler:**
- ✅ İlk kategoriyi gÃ¶ster (veya tümünü)
- ✅ Badge hover effect
- ✅ Kategoriye tıklayınca filtreleme

**UI:**
- Kurs kartının üstünde veya altında
- Küçük badge (sm size)
- Teal theme

---

#### [FE-09] Dashboard Sidebar - Kategori Linki
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 15 dk

**Açıklama:**
- `frontend/src/app/(dashboard)/layout.tsx` güncelle
- Admin için "Kategoriler" menü item'ı ekle

**Kriterler:**
- ✅ Sadece admin/staff gÃ¶rebilir
- ✅ Icon: Folder veya Tag
- ✅ Active state

**Menu Item:**
```typescript
{
  href: "/dashboard/categories",
  label: "Kategoriler",
  icon: <TagIcon />,
  roles: ["admin", "staff"],
}
```

---

#### [FE-10] Kategori Arama/Filter Component
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 45 dk

**Açıklama:**
- Kategori seçimi için arama component'i
- Dropdown veya modal içinde kullanılabilir

**Kriterler:**
- ✅ Search input
- ✅ Kategori filtreleme (name'e gÃ¶re)
- ✅ Parent/children hierarchy
- ✅ Multi-select
- ✅ Selected categories display

**Component:**
```typescript
interface CategoryPickerProps {
  selectedCategories: string[];
  onChange: (categoryIds: string[]) => void;
  multiple?: boolean;
  showSearch?: boolean;
}
```

---

#### [FE-11] Kategori İstatistikleri (Admin Dashboard)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Admin dashboard'a kategori istatistikleri ekle
- Toplam kategori sayısı
- En popüler kategoriler (kurs sayısına gÃ¶re)

**Kriterler:**
- ✅ Stat card component
- ✅ Chart (en popüler kategoriler)
- ✅ Recharts veya Chart.js kullan

**UI:**
- Stat cards (teal theme)
- Bar chart veya pie chart

---

#### [FE-12] Kategori Breadcrumb
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 30 dk

**Açıklama:**
- Kurslar sayfasında kategori breadcrumb
- Parent → Child hierarchy gÃ¶ster

**Kriterler:**
- ✅ Breadcrumb component
- ✅ Kategoriye tıklayınca filtreleme
- ✅ "Tümü" linki

**UI:**
```
Ana Sayfa > Kurslar > Programlama > Python
```

---

#### [FE-13] Kategori URL Parametresi
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 30 dk

**Açıklama:**
- URL'de kategori parametresi desteği
- `/courses?category=programlama`
- Sayfa yüklendiğinde kategori filtresi uygula

**Kriterler:**
- ✅ URL search params okuma
- ✅ Kategori slug'dan kategori bulma
- ✅ Filtreleme state'i sync
- ✅ Browser history support

**Implementation:**
```typescript
const searchParams = useSearchParams();
const categorySlug = searchParams.get("category");

useEffect(() => {
  if (categorySlug) {
    // Kategoriyi bul ve filtrele
    const category = categories.find(c => c.slug === categorySlug);
    if (category) {
      setSelectedCategory(category.id);
    }
  }
}, [categorySlug]);
```

---

## ğŸ§ª TEST TASKS

### [TEST-01] Backend Unit Tests
**Durum:** ❌ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

- Category model tests
- Category CRUD endpoint tests
- Slug generation tests
- Validation tests

### [TEST-02] Frontend Component Tests
**Durum:** ❌ TODO  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 1 saat

- CategoryBadge component test
- CategoryPicker component test
- Category filter test

### [TEST-03] Integration Tests
**Durum:** ❌ TODO  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 1 saat

- Course-Category relationship test
- Category filtering test
- Category CRUD flow test

---

## 💡 NOTLAR

### Teknik Notlar
- Kategori sistemi many-to-many relationship kullanıyor (Course â†” Category)
- Slug generation Türkçe karakter desteği ile yapılmalı
- Kategori silme işlemi için cascade stratejisi belirlenmeli
- Kategori sıralaması için `order` field kullanılacak

### UI/UX Notlar
- Kategori badge'leri teal/orange theme ile uyumlu olmalı
- Kategori seçimi için modern dropdown/modal kullanılmalı
- Kategori filtreleme responsive olmalı
- Loading state'ler eklenmeli

### Performans Notlar
- Kategori listesi cache'lenebilir (React Query)
- Course count subquery ile hesaplanmalı (N+1 problem Ã¶nleme)
- Kategori filtreleme client-side veya server-side olabilir

---

## ✅ Definition of Done

Her task için:
- ✅ Kod yazıldı ve çalışıyor
- ✅ TypeScript/Type hints eklendi
- ✅ Error handling yapıldı
- ✅ Loading/Empty states eklendi
- ✅ Responsive tasarım
- ✅ Teal/Orange theme uyumlu
- ✅ Code review yapıldı
- ✅ Test edildi (manual veya automated)

---

**Son Güncelleme:** 2025-01-XX  
**Toplam Tahmini Süre:** ~22-27 saat (3-3.5 gün)

**Önemli Güncellemeler:**
- ✅ BE-12: Slug collision yönetimi eklendi
- ✅ BE-05B: Category tree endpoint eklendi (N+1 Ã¶nleme)
- ✅ BE-09: Soft delete zorunlu, kurs taşıma opsiyonu eklendi

---

# 📋 BiHocam - Notification Sistemi Kanban Board

**Proje:** Notification/Bildirim Sistemi Geliştirme  
**Durum:** ✅ EPIC-2 TAMAMLANDI  
**Öncelik:** ğŸŸ¢ NORMAL  
**Tahmini Süre (Gerçekleşen):** ~3-4 Gün

---

## 📊 Genel Durum

- **Toplam Task:** 28/28 ✅
- **Backend:** 14/14 ✅
- **Frontend:** 14/14 ✅
- **Tamamlanma:** 100%

---

## 🔴 BACKEND TASKS

### 💡¦ Model & Database

#### [NOT-BE-01] Notification Model Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 45 dk

**Açıklama:**
- `backend/app/models/notification.py` dosyası oluştur
- SQLAlchemy model tanımla
- Tüm bildirim tiplerini destekleyecek yapı

**Gerekli Alanlar:**
- `id`: UUID (Primary Key)
- `user_id`: UUID (ForeignKey to User - alıcı)
- `sender_id`: UUID (Optional, ForeignKey to User - gÃ¶nderen)
- `notification_type`: Enum (COURSE_UPDATE, LIVE_LESSON, SYSTEM, ADMIN_MESSAGE, etc.)
- `title`: String (Bildirim başlığı, required)
- `message`: Text (Bildirim mesajı, required)
- `data`: JSON (Optional, ek metadata - course_id, lesson_id, etc.)
- `is_read`: Boolean (Okundu mu?, default: False)
- `read_at`: DateTime (Optional, ne zaman okundu)
- `delivery_channels`: JSON (Array: ["in_app", "email", "push"] - hangi kanallardan gÃ¶nderildi)
- `priority`: Enum (LOW, MEDIUM, HIGH, URGENT - default: MEDIUM)
- `expires_at`: DateTime (Optional, bildirim geçerlilik süresi)
- `action_url`: String (Optional, tıklayınca yÃ¶nlendirilecek URL)
- `action_label`: String (Optional, buton metni)
- `created_at`: DateTime
- `updated_at`: DateTime

**Kriterler:**
- ✅ Model SQLAlchemy Base'den inherit etmeli
- ✅ `__tablename__` = "notifications"
- ✅ Timestamp mixin kullanılmalı
- ✅ Relationship tanımları (user, sender)
- ✅ Index'ler: user_id, is_read, created_at, notification_type

**Kod Örneği:**
```python
class NotificationType(str, enum.Enum):
    # Hoca -> Öğrenci
    COURSE_UPDATE = "course_update"  # Kurs güncellendi
    NEW_LESSON = "new_lesson"  # Yeni ders eklendi
    COURSE_ANNOUNCEMENT = "course_announcement"  # Kurs duyurusu
    
    # Kurum -> Öğrenci
    ORG_ANNOUNCEMENT = "org_announcement"  # Kurum duyurusu
    ORG_COURSE_UPDATE = "org_course_update"  # Kurum kursu güncellendi
    
    # Admin -> Öğretmen
    ADMIN_TO_TEACHER = "admin_to_teacher"  # Admin mesajı
    
    # Admin -> Herkese
    SYSTEM_ANNOUNCEMENT = "system_announcement"  # Sistem duyurusu
    MAINTENANCE = "maintenance"  # Bakım bildirimi
    
    # Canlı Ders (ileride)
    LIVE_LESSON_REMINDER = "live_lesson_reminder"  # Canlı ders hatırlatması
    LIVE_LESSON_STARTING = "live_lesson_starting"  # Canlı ders başlıyor
    LIVE_LESSON_CANCELLED = "live_lesson_cancelled"  # Canlı ders iptal
    
    # Sipariş/Ödeme
    ORDER_CONFIRMED = "order_confirmed"  # Sipariş onaylandı
    PAYMENT_SUCCESS = "payment_success"  # Ödeme başarılı
    CERTIFICATE_EARNED = "certificate_earned"  # Sertifika kazanıldı

class NotificationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    sender_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    notification_type = Column(Enum(NotificationType), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON, nullable=True)  # {course_id, lesson_id, order_id, etc.}
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    delivery_channels = Column(JSON, default=["in_app"])  # ["in_app", "email", "push"]
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM)
    expires_at = Column(DateTime, nullable=True)
    action_url = Column(String(500), nullable=True)
    action_label = Column(String(100), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="notifications")
    sender = relationship("User", foreign_keys=[sender_id])

> [!CAUTION]
> **GEMINI-COMMENT:** Bildirim başlık ve mesajlarının (title/message) kod içerisinde hardcoded olması esnekliği Ã¶ldürür. Bunları veritabanında veya merkezi bir `templates.json` dosyasında saklayan basit bir template engine yapısı (Ã¶rn: "Hoş geldin {user_name}!") kurulması uzun vadede zorunlu hale gelecektir.
```

---

#### [NOT-BE-02] Notification Preferences Model
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 30 dk

**Açıklama:**
- Kullanıcı bildirim tercihleri modeli
- Hangi bildirim tiplerini hangi kanallardan almak istiyor

**Gerekli Alanlar:**
- `id`: UUID (Primary Key)
- `user_id`: UUID (ForeignKey to User, unique)
- `preferences`: JSON (Bildirim tipi -> kanal mapping)
- `email_enabled`: Boolean (Genel email açık/kapalı)
- `push_enabled`: Boolean (Genel push açık/kapalı)
- `in_app_enabled`: Boolean (Genel in-app açık/kapalı, default: True)
- `quiet_hours_start`: Time (Optional, sessiz saatler başlangıç)
- `quiet_hours_end`: Time (Optional, sessiz saatler bitiş)
- `created_at`: DateTime
- `updated_at`: DateTime

**Kriterler:**
- ✅ One-to-one relationship with User
- ✅ Default preferences (tüm bildirimler açık)
- ✅ JSON structure: `{"course_update": ["in_app", "email"], "system_announcement": ["in_app"]}`

**Kod Örneği:**
```python
class NotificationPreferences(Base, TimestampMixin):
    __tablename__ = "notification_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    preferences = Column(JSON, default={})  # {notification_type: [channels]}
    email_enabled = Column(Boolean, default=True)
    push_enabled = Column(Boolean, default=True)
    in_app_enabled = Column(Boolean, default=True)
    quiet_hours_start = Column(Time, nullable=True)
    quiet_hours_end = Column(Time, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="notification_preferences")
```

---

#### [NOT-BE-03] User Model Güncelleme
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 15 dk

**Açıklama:**
- `User` modeline notification relationships ekle

**Değişiklikler:**
```python
# User modeline eklenecek:
notifications = relationship("Notification", foreign_keys="Notification.user_id", back_populates="user")
notification_preferences = relationship("NotificationPreferences", back_populates="user", uselist=False)
```

---

#### [NOT-BE-04] Database Migration
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 30 dk

**Açıklama:**
- Alembic migration dosyası oluştur
- `notifications` tablosu oluştur
- `notification_preferences` tablosu oluştur
- Index'ler ekle

**Kriterler:**
- ✅ Migration dosyası isimlendirme: `YYYYMMDD_HHMMSS_add_notifications.py`
- ✅ Rollback desteği
- ✅ Mevcut kullanıcılar için default preferences oluştur (optional script)

---

### 💡Œ API Endpoints

#### [NOT-BE-05] Notification List Endpoint
**Durum:** ❌ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 45 dk

**Açıklama:**
- `GET /api/v1/notifications` endpoint
- Kullanıcının bildirimlerini listele
- Query params: `skip`, `limit`, `is_read`, `notification_type`, `priority`

**Kriterler:**
- ✅ Authentication required
- ✅ Sadece kendi bildirimlerini gÃ¶rebilir
- ✅ Pagination desteği
- ✅ Filtreleme (is_read, type, priority)
- ✅ Sıralama (created_at DESC - en yeni Ã¶nce)
- ✅ Unread count dÃ¶ndür

**Endpoint:**
```
GET /api/v1/notifications?skip=0&limit=20&is_read=false&notification_type=course_update
```

**Response Model:**
```python
class NotificationResponse(BaseModel):
    id: UUID
    sender_id: Optional[UUID]
    sender_name: Optional[str]  # Eager load
    notification_type: NotificationType
    title: str
    message: str
    data: Optional[dict]
    is_read: bool
    read_at: Optional[datetime]
    priority: NotificationPriority
    action_url: Optional[str]
    action_label: Optional[str]
    created_at: datetime

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
```

---

#### [NOT-BE-06] Notification Mark as Read Endpoint
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 30 dk

**Açıklama:**
- `PUT /api/v1/notifications/{notification_id}/read` - Tek bildirimi okundu işaretle
- `PUT /api/v1/notifications/read-all` - Tüm bildirimleri okundu işaretle

**Kriterler:**
- ✅ Authentication required
- ✅ Sadece kendi bildirimlerini işaretleyebilir
- ✅ read_at timestamp set et
- ✅ Bulk read-all endpoint

---

#### [NOT-BE-07] Notification Delete Endpoint
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 20 dk

**Açıklama:**
- `DELETE /api/v1/notifications/{notification_id}` - Bildirim sil
- `DELETE /api/v1/notifications/read` - Okunmuş bildirimleri sil

**Kriterler:**
- ✅ Authentication required
- ✅ Sadece kendi bildirimlerini silebilir
- ✅ Soft delete veya hard delete (soft delete Ã¶nerilir)

---

#### [NOT-BE-08] Notification Create Endpoint (Admin/System)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- `POST /api/v1/notifications` - Bildirim oluştur
- Admin, Teacher, Organization kullanabilir
- Bulk notification desteği (birden fazla kullanıcıya)

**Kriterler:**
- ✅ Authentication + Role check
- ✅ Bulk send (user_ids list)
- ✅ Role-based send (tüm öğretmenlere, tüm öğrencilere)
- ✅ Organization scope (kurum üyelerine)
- ✅ Delivery channel seçimi
- ✅ Background job için hazır (Arq - Redis-based)

**Request Model:**
```python
class NotificationCreate(BaseModel):
    user_ids: Optional[List[UUID]] = None  # Specific users
    role: Optional[UserRole] = None  # All users with this role
    organization_id: Optional[UUID] = None  # All org members
    notification_type: NotificationType
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    data: Optional[dict] = None
    priority: NotificationPriority = NotificationPriority.MEDIUM
    delivery_channels: List[str] = ["in_app"]  # ["in_app", "email", "push"]
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    expires_at: Optional[datetime] = None
```

---

#### [NOT-BE-09] Notification Preferences Endpoint
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 45 dk

**Açıklama:**
- `GET /api/v1/notifications/preferences` - Tercihleri getir
- `PUT /api/v1/notifications/preferences` - Tercihleri güncelle

**Kriterler:**
- ✅ Authentication required
- ✅ Default preferences oluştur (yoksa)
- ✅ Validation (quiet hours, channel selection)

**Request Model:**
```python
class NotificationPreferencesUpdate(BaseModel):
    preferences: Optional[dict] = None  # {type: [channels]}
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    quiet_hours_start: Optional[time] = None
    quiet_hours_end: Optional[time] = None
```

---

#### [NOT-BE-10] Notification Unread Count Endpoint
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 20 dk

**Açıklama:**
- `GET /api/v1/notifications/unread-count` - Okunmamış bildirim sayısı
- Header'da badge için kullanılacak

**Kriterler:**
- ✅ Authentication required
- ✅ Hızlı response (cache edilebilir)
- ✅ Priority bazlı count (optional)

**Response:**
```python
class UnreadCountResponse(BaseModel):
    total: int
    by_priority: dict  # {"urgent": 2, "high": 5, "medium": 10}
```

---

#### [NOT-BE-11] Notification Service Layer
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:**
- `backend/app/services/notification_service.py` oluştur
- Bildirim gÃ¶nderme logic'i
- User targeting (role, organization, course enrollment)
- Delivery channel routing (in-app, email, push)
- Preference checking
- **Template engine entegrasyonu**
- **Bulk insert optimizasyonu**

**Kriterler:**
- ✅ Preference checking (kullanıcı bu bildirimi almak istiyor mu?)
- ✅ Quiet hours checking
- ✅ Delivery channel routing
- ✅ **Template engine**: Hardcoded mesajlar yerine template sistemi
- ✅ **Bulk insert**: N tane kullanıcı için tek sorgu (bulk_save_objects veya insert values)
- ✅ Error handling
- ✅ Logging

**Template Engine:**
```python
# backend/app/services/notification_templates.py
NOTIFICATION_TEMPLATES = {
    NotificationType.COURSE_UPDATE: {
        "title": "{course_title} güncellendi",
        "message": "Kurs içeriğinde yeni güncellemeler var. Hemen kontrol et!",
    },
    NotificationType.NEW_LESSON: {
        "title": "{course_title} - Yeni ders eklendi",
        "message": "{lesson_title} dersi eklendi. Hemen izle!",
    },
    # ... diğer template'ler
}

def render_template(
    template_type: NotificationType,
    context: dict
) -> tuple[str, str]:
    –"Template'i context ile render et–"
    template = NOTIFICATION_TEMPLATES.get(template_type)
    if not template:
        raise ValueError(f"Template bulunamadı: {template_type}")
    
    title = template["title"].format(**context)
    message = template["message"].format(**context)
    return title, message
```

**Bulk Insert Optimizasyonu:**
```python
async def send_to_role(
    self,
    role: UserRole,
    notification_type: NotificationType,
    title: str = None,
    message: str = None,
    template_context: dict = None,
    use_template: bool = False,
    **kwargs
) -> int:
    # Get all users with role
    users = await self._get_users_by_role(role)
    
    # Template render (eğer template varsa)
    if use_template and template_context:
        title, message = render_template(notification_type, template_context)
    
    # Bulk notification creation
    notifications = []
    for user in users:
        # Preference check
        if not await self._should_send_notification(user.id, notification_type):
            continue
        
        notifications.append(Notification(
            user_id=user.id,
            notification_type=notification_type,
            title=title,
            message=message,
            # ... diğer alanlar
        ))
    
    # BULK INSERT - Tek sorguda tüm bildirimleri ekle
    if notifications:
        db.bulk_save_objects(notifications)
        await db.commit()
    
    return len(notifications)
```

**Fonksiyonlar:**
```python
class NotificationService:
    async def send_notification(
        self,
        user_ids: List[UUID],
        notification_type: NotificationType,
        title: str = None,
        message: str = None,
        template_context: dict = None,
        use_template: bool = False,
        **kwargs
    ) -> List[Notification]:
        # Template kullan veya direkt title/message
        if use_template and template_context:
            title, message = render_template(notification_type, template_context)
        
        # Bulk create notifications
        # Check preferences
        # Route to delivery channels
        # Return created notifications
    
    async def send_to_role(
        self,
        role: UserRole,
        notification_type: NotificationType,
        title: str = None,
        message: str = None,
        template_context: dict = None,
        use_template: bool = False,
        **kwargs
    ) -> int:
        # Get all users with role
        # Bulk send notifications (bulk_save_objects)
        # Return count
    
    async def send_to_course_students(
        self,
        course_id: UUID,
        notification_type: NotificationType,
        title: str = None,
        message: str = None,
        template_context: dict = None,
        use_template: bool = False,
        **kwargs
    ) -> int:
        # Get enrolled students
        # Bulk send notifications
        # Return count
    
    async def send_to_organization(
        self,
        organization_id: UUID,
        notification_type: NotificationType,
        title: str = None,
        message: str = None,
        template_context: dict = None,
        use_template: bool = False,
        **kwargs
    ) -> int:
        # Get org members
        # Bulk send notifications
        # Return count
```

> [!IMPORTANT]
> **GEMINI-COMMENT:** Bulk bildirimlerde (send_to_role, send_to_course_students) performans için "bulk_save_objects" veya "insert values" kullanılmalı. N tane kullanıcı için N tane insert sorgusu atılması veritabanını kilitler.

> [!CAUTION]
> **GEMINI-COMMENT:** Bildirim başlık ve mesajlarının (title/message) kod içerisinde hardcoded olması esnekliği Ã¶ldürür. Bunları veritabanında veya merkezi bir `templates.json` dosyasında saklayan basit bir template engine yapısı (Ã¶rn: "Hoş geldin {user_name}!") kurulması uzun vadede zorunlu hale gelecektir.

---

#### [NOT-BE-12] Email Delivery Service
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- `backend/app/services/email_service.py` oluştur
- Email gÃ¶nderme logic'i
- Email template'leri
- SMTP veya SendGrid/AWS SES entegrasyonu
- **ZORUNLU: Redis-based Task Queue (Arq) entegrasyonu**

**Kriterler:**
- ✅ Email template system (Jinja2)
- ✅ HTML email support
- ✅ **Redis-based Task Queue (Arq) - ZORUNLU**
- ✅ Email gönderimi kesinlikle background job olmalı
- ✅ Error handling ve retry logic
- ✅ Email queue management

**Dependencies:**
```bash
# backend/pyproject.toml veya requirements.txt'e eklenecek:
arq>=0.25.0
aioredis>=2.0.1  # Arq için gerekli
```

**Implementation:**
```python
# backend/app/services/email_service.py
from arq import create_pool
from arq.connections import RedisSettings
from arq.jobs import Job
from app.core.config import settings

# Redis connection pool
redis_pool = None

async def get_redis_pool():
    –"Redis connection pool oluştur–"
    global redis_pool
    if redis_pool is None:
        redis_pool = await create_pool(
            RedisSettings.from_dsn(settings.REDIS_URL)
        )
    return redis_pool

async def send_email_task(
    ctx,
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str = None
) -> bool:
    –"Email gönderimi - Background job (Arq worker tarafından çalıştırılacak)–"
    try:
        # SMTP veya SendGrid/AWS SES
        await send_email_via_smtp(to_email, subject, html_content, text_content)
        return True
    except Exception as exc:
        # Arq otomatik retry yapar (max_retries ayarına gÃ¶re)
        raise exc

# Notification service'den kullanım:
async def send_notification(...):
    # In-app notification oluştur (sync)
    notification = await create_in_app_notification(...)
    
    # Email gönderimi (async - background job)
    if "email" in delivery_channels:
        pool = await get_redis_pool()
        job = await pool.enqueue_job(
            'send_email_task',
            to_email=user.email,
            subject=title,
            html_content=render_email_template(notification_type, context)
        )
        # Job ID'yi logla (optional)
        logger.info(f"Email job enqueued: {job.job_id}")
    
    return notification
```

**Arq Worker Setup:**
```python
# backend/app/workers/email_worker.py (oluşturulacak)
from arq import create_pool
from arq.connections import RedisSettings
from arq.worker import Worker
from app.services.email_service import send_email_task
from app.core.config import settings

# Worker functions
class WorkerSettings:
    functions = [send_email_task]
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
    max_jobs = 10
    job_timeout = 300  # 5 dakika
    max_tries = 3  # Max retry sayısı
    retry_delay = 60  # 60 saniye sonra retry

# Worker'ı çalıştırmak için:
# arq app.workers.email_worker.WorkerSettings
```

**Worker Ã‡alıştırma:**
```bash
# Terminal'de ayrı bir process olarak çalıştırılacak:
cd backend
arq app.workers.email_worker.WorkerSettings
```

**Template'ler:**
- Course update notification
- Live lesson reminder
- System announcement
- Order confirmation
- Certificate earned

**Arq Avantajları:**
- ✅ Async/await desteği (FastAPI ile mükemmel uyumlu)
- ✅ Redis kullanır (zaten projede var, ekstra broker gerekmez)
- ✅ Hafif ve modern
- ✅ Type hints desteği
- ✅ Built-in retry logic
- ✅ Worker process ayrı çalışır (API'yi bloklamaz)
- ✅ Production-ready (monitoring, retry, timeout desteği)

> [!DANGER]
> **GEMINI-COMMENT:** Email gönderimi kesinlikle senkron (await) yapılmamalı. SMTP bağlantısı yavaştır, API response süresini 2-3 saniye artırır. Bu işlem için Redis-based task queue (Arq) kullanımı task'ın zorunlu parçası olmalı.

---

#### [NOT-BE-13] Push Notification Service (Future)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- `backend/app/services/push_service.py` oluştur
- Web Push API entegrasyonu
- Firebase Cloud Messaging (FCM) veya benzeri

**Kriterler:**
- ✅ Push subscription management
- ✅ Push notification sending
- ✅ Platform support (web, mobile - future)

**Not:** Åimdilik placeholder, ileride implement edilecek.

---

#### [NOT-BE-14] Notification Router Entegrasyonu
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 30 dk

**Açıklama:**
- `backend/app/api/v1/endpoints/notifications.py` oluştur
- Router'ı `backend/app/api/v1/router.py`'ye ekle
- Tag: "notifications"

**Endpoints:**
- GET /notifications
- GET /notifications/{id}
- PUT /notifications/{id}/read
- PUT /notifications/read-all
- DELETE /notifications/{id}
- DELETE /notifications/read
- POST /notifications (admin/teacher/org)
- GET /notifications/preferences
- PUT /notifications/preferences
- GET /notifications/unread-count

---

## ğŸ¨ FRONTEND TASKS

### ğŸ§© API Integration

#### [NOT-FE-01] Notification API Client
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 45 dk

**Açıklama:**
- `frontend/src/lib/api.ts` dosyasına notification API ekle
- Tüm CRUD işlemleri için fonksiyonlar

**API Fonksiyonları:**
```typescript
export const notificationsApi = {
  list: async (params?: NotificationListParams) => Promise<NotificationListResponse>,
  get: async (notificationId: string) => Promise<Notification>,
  markAsRead: async (notificationId: string) => Promise<void>,
  markAllAsRead: async () => Promise<void>,
  delete: async (notificationId: string) => Promise<void>,
  deleteRead: async () => Promise<void>,
  getUnreadCount: async () => Promise<UnreadCountResponse>,
  getPreferences: async () => Promise<NotificationPreferences>,
  updatePreferences: async (data: NotificationPreferencesUpdate) => Promise<NotificationPreferences>,
  create: async (data: NotificationCreate) => Promise<Notification>, // Admin/Teacher only
};
```

**Type Definitions:**
```typescript
enum NotificationType {
  COURSE_UPDATE = "course_update",
  NEW_LESSON = "new_lesson",
  COURSE_ANNOUNCEMENT = "course_announcement",
  ORG_ANNOUNCEMENT = "org_announcement",
  ORG_COURSE_UPDATE = "org_course_update",
  ADMIN_TO_TEACHER = "admin_to_teacher",
  SYSTEM_ANNOUNCEMENT = "system_announcement",
  MAINTENANCE = "maintenance",
  LIVE_LESSON_REMINDER = "live_lesson_reminder",
  LIVE_LESSON_STARTING = "live_lesson_starting",
  LIVE_LESSON_CANCELLED = "live_lesson_cancelled",
  ORDER_CONFIRMED = "order_confirmed",
  PAYMENT_SUCCESS = "payment_success",
  CERTIFICATE_EARNED = "certificate_earned",
}

enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

interface Notification {
  id: string;
  sender_id?: string | null;
  sender_name?: string | null;
  notification_type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any> | null;
  is_read: boolean;
  read_at?: string | null;
  priority: NotificationPriority;
  action_url?: string | null;
  action_label?: string | null;
  created_at: string;
}
```

---

### ⏳ Components

#### [NOT-FE-02] Notification Bell Icon Component
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- `frontend/src/components/NotificationBell.tsx` oluştur
- Header'a eklenecek
- Badge ile unread count gÃ¶ster
- Dropdown açılır (notification list)

**Kriterler:**
- ✅ Bell icon (SVG)
- ✅ Unread count badge (teal/orange theme)
- ✅ Click'te dropdown açılır
- ✅ Real-time updates (polling veya WebSocket)
- ✅ Hover effects

**UI Tasarım:**
- Teal bell icon
- Orange/red badge (unread count)
- Dropdown: Modern card design
- Notification items listesi

---

#### [NOT-FE-03] Notification Dropdown Component
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Notification list dropdown
- Bell icon'a tıklayınca açılır
- Scrollable list
- Mark as read, delete actions

**Kriterler:**
- ✅ Notification items listesi
- ✅ Unread/read styling
- ✅ Priority indicators (urgent = red, high = orange)
- ✅ Action buttons (mark as read, delete)
- ✅ "Mark all as read" button
- ✅ "View all" link
- ✅ Empty state
- ✅ Loading state

**UI Tasarım:**
- Modern dropdown card
- Teal/orange theme
- Priority color coding
- Smooth animations

---

#### [NOT-FE-04] Notification Item Component
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 45 dk

**Açıklama:**
- `frontend/src/components/NotificationItem.tsx` oluştur
- Tek bildirim gÃ¶sterimi
- Reusable component

**Kriterler:**
- ✅ Title, message, timestamp
- ✅ Sender info (eğer varsa)
- ✅ Priority indicator
- ✅ Action button (eğer action_url varsa)
- ✅ Read/unread styling
- ✅ Click handler (mark as read + navigate)

**Props:**
```typescript
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}
```

---

#### [NOT-FE-05] Notification List Page
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- `frontend/src/app/(dashboard)/dashboard/notifications/page.tsx` oluştur
- Tüm bildirimlerin listelendiği sayfa
- Filtreleme ve sıralama

**Kriterler:**
- ✅ Pagination
- ✅ Filtreleme (is_read, type, priority)
- ✅ "Mark all as read" button
- ✅ "Delete read" button
- ✅ Group by date (Bugün, Dün, Bu Hafta, etc.)
- ✅ Empty state
- ✅ Loading state

**UI Tasarım:**
- Modern list design
- Teal/orange theme
- Group headers
- Action buttons

---

#### [NOT-FE-06] Notification Settings Page
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:**
- `frontend/src/app/(dashboard)/dashboard/settings/notifications/page.tsx` oluştur
- Bildirim tercihleri yönetimi
- Settings sayfasından link

**Kriterler:**
- ✅ Notification type bazlı tercihler
- ✅ Channel selection (in-app, email, push)
- ✅ Quiet hours ayarı
- ✅ Global enable/disable
- ✅ Save button
- ✅ Success/error messages

**UI Tasarım:**
- Modern form design
- Toggle switches (teal theme)
- Time picker (quiet hours)
- Category grouping

**Form Yapısı:**
```
Genel Ayarlar
â”œâ”€â”€ Email bildirimleri: [Toggle]
â”œâ”€â”€ Push bildirimleri: [Toggle]
â”œâ”€â”€ In-app bildirimleri: [Toggle]
â–â”€â”€ Sessiz saatler: [Time Range]

Bildirim Tipleri
â”œâ”€â”€ Kurs Güncellemeleri
â”‚   â”œâ”€â”€ In-app: [Toggle]
â”‚   â”œâ”€â”€ Email: [Toggle]
â”‚   â–â”€â”€ Push: [Toggle]
â”œâ”€â”€ Canlı Ders Hatırlatmaları
â”‚   â–â”€â”€ ...
â–â”€â”€ Sistem Duyuruları
    â–â”€â”€ ...
```

---

#### [NOT-FE-07] Notification Badge Hook
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- `frontend/src/hooks/useNotifications.ts` oluştur
- Unread count tracking
- Real-time updates (polling)
- **Exponential Backoff ve Page Focus kontrolü**

**Kriterler:**
- ✅ React Query ile unread count fetch
- ✅ **Exponential Backoff**: Hata durumunda polling süresini artır
- ✅ **Page Focus kontrolü**: Sayfa focus'ta değilken polling durdur
- ✅ **Visibility API**: Tab gÃ¶rünür değilken polling durdur
- ✅ Optimistic updates
- ✅ Error handling
- ✅ Uzun vadede SSE (Server-Sent Events) desteği

**Hook:**
```typescript
export function useNotifications() {
  const [pollInterval, setPollInterval] = useState(30000); // 30 saniye başlangıç
  const [isPageVisible, setIsPageVisible] = useState(true);
  
  // Page visibility tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Window focus tracking
  useEffect(() => {
    const handleFocus = () => setIsPageVisible(true);
    const handleBlur = () => setIsPageVisible(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
  
  const { data: unreadCount, refetch, error } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: isPageVisible ? pollInterval : false, // Sadece gÃ¶rünürken poll
    onError: () => {
      // Exponential backoff: 30s -> 60s -> 120s -> 300s (max)
      setPollInterval(prev => Math.min(prev * 2, 300000));
    },
    onSuccess: () => {
      // Başarılı olunca interval'i resetle
      setPollInterval(30000);
    },
  });
  
  return { unreadCount, refetch };
}
```

**Alternatif (SSE - İleride):**
```typescript
// Server-Sent Events kullanımı (daha verimli)
export function useNotificationsSSE() {
  useEffect(() => {
    const eventSource = new EventSource('/api/v1/notifications/stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      queryClient.setQueryData(['notifications', 'unread-count'], data);
    };
    
    return () => eventSource.close();
  }, []);
}
```

> [!NOTE]
> **GEMINI-COMMENT:** 30 saniyelik sabit polling, mobil cihazlarda pil tüketimi ve gereksiz data kullanımına yol açar. "Exponential Backoff" (sekme arttıkça süreyi uzatma) veya sayfa focus'ta değilken polling'i durdurma mekanizması eklenmeli. Uzun vadede SSE (Server-Sent Events) zorunlu.

---

#### [NOT-FE-08] Real-time Notification Updates
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:**
- WebSocket veya Server-Sent Events (SSE) entegrasyonu
- Yeni bildirim geldiğinde anında güncelleme

**Kriterler:**
- ✅ WebSocket connection (veya SSE)
- ✅ Notification received event
- ✅ Badge update
- ✅ Toast notification (optional)
- ✅ Reconnection logic

**Alternatif:** Polling (daha basit, şimdilik yeterli)

---

#### [NOT-FE-09] Notification Toast Component
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 45 dk

**Açıklama:**
- Yeni bildirim geldiğinde toast gÃ¶ster
- `frontend/src/components/NotificationToast.tsx`

**Kriterler:**
- ✅ Toast notification
- ✅ Auto-dismiss (5 saniye)
- ✅ Click to view
- ✅ Priority-based styling

---

#### [NOT-FE-10] Header Integration
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 30 dk

**Açıklama:**
- `frontend/src/components/Header.tsx` güncelle
- NotificationBell component'ini ekle
- Dashboard layout'a da ekle

**Kriterler:**
- ✅ Bell icon sağ üstte
- ✅ Badge ile unread count
- ✅ Responsive (mobile'da icon küçülür)

---

#### [NOT-FE-11] Course Update Notification Trigger
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Kurs güncellendiğinde öğrencilere bildirim gÃ¶nder
- `backend/app/api/v1/endpoints/courses.py` içinde trigger

**Kriterler:**
- ✅ Course update endpoint'inde hook
- ✅ Enrolled students'a bildirim gÃ¶nder
- ✅ Notification service kullan

**Implementation:**
```python
# courses.py - update_course endpoint'inde
if course.status == CourseStatus.PUBLISHED:
    await notification_service.send_to_course_students(
        course_id=course.id,
        notification_type=NotificationType.COURSE_UPDATE,
        title=f"{course.title} güncellendi",
        message=f"Kurs içeriğinde yeni güncellemeler var.",
        data={"course_id": str(course.id)},
        action_url=f"/courses/{course.slug}",
        action_label="Kursu GÃ¶rüntüle"
    )
```

---

#### [NOT-FE-12] Live Lesson Notification (Future)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Canlı ders duyuruları için notification
- Kurslarım sayfasında gÃ¶sterilecek (ileride)

**Kriterler:**
- ✅ Live lesson model (ileride eklenecek)
- ✅ Reminder notification (1 saat Ã¶nce)
- ✅ Starting notification (5 dakika Ã¶nce)
- ✅ Cancelled notification

**Not:** Åimdilik placeholder, canlı ders modülü eklendiğinde implement edilecek.

---

#### [NOT-FE-13] Admin Notification Panel
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Admin için bildirim gÃ¶nderme paneli
- `frontend/src/app/(dashboard)/dashboard/admin/notifications/page.tsx`

**Kriterler:**
- ✅ Notification form
- ✅ Target selection (role, organization, specific users)
- ✅ Preview
- ✅ Send button
- ✅ Notification history

**UI:**
- Modern form design
- Target selector (radio/checkbox)
- Rich text editor (optional)
- Preview panel

---

#### [NOT-FE-14] Notification Empty States
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 30 dk

**Açıklama:**
- Empty state component'leri
- "Bildirim yok" mesajları
- İkon ve açıklama

**Kriterler:**
- ✅ Empty state design
- ✅ Teal/orange theme
- ✅ Friendly messages

---

## ğŸ§ª TEST TASKS

### [NOT-TEST-01] Backend Unit Tests
**Durum:** ❌ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

- Notification model tests
- Notification service tests
- Preference validation tests

### [NOT-TEST-02] Frontend Component Tests
**Durum:** ❌ TODO  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 1 saat

- NotificationBell component test
- NotificationItem component test
- useNotifications hook test

### [NOT-TEST-03] Integration Tests
**Durum:** ❌ TODO  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 1.5 saat

- Notification flow test (create → receive → read)
- Preference update test
- Role-based notification test

---

## 💡 NOTLAR

### Teknik Notlar
- Notification sistemi genişletilebilir yapıda olmalı
- Delivery channels (in-app, email, push) ayrı servisler olarak implement edilmeli
- Background job queue (Arq - Redis-based) email gönderimi için kullanılmalı
- Real-time updates için WebSocket veya SSE kullanılabilir (şimdilik polling yeterli)
- Arq worker ayrı bir process olarak çalıştırılmalı (API server'dan bağımsız)

### UI/UX Notlar
- Notification badge teal/orange theme ile uyumlu olmalı
- Priority-based color coding (urgent = red, high = orange, medium = teal, low = gray)
- Notification dropdown modern ve kullanıcı dostu olmalı
- Settings sayfası kapsamlı ama basit olmalı

### Performans Notlar
- Unread count cache'lenebilir (React Query)
- Notification list pagination ile yüklenmeli
- Real-time updates için efficient polling (30 saniye) veya WebSocket

### Gelecek Özellikler
- Canlı ders bildirimleri (live lesson modülü eklendiğinde)
- Push notifications (web push API)
- SMS notifications (optional)
- Notification templates (admin için)

---

## ✅ Definition of Done

Her task için:
- ✅ Kod yazıldı ve çalışıyor
- ✅ TypeScript/Type hints eklendi
- ✅ Error handling yapıldı
- ✅ Loading/Empty states eklendi
- ✅ Responsive tasarım
- ✅ Teal/Orange theme uyumlu
- ✅ Code review yapıldı
- ✅ Test edildi (manual veya automated)

---

**Son Güncelleme:** 2025-01-XX  
**Toplam Tahmini Süre:** ~33-40 saat (4.5-5 gün)

**Önemli Güncellemeler:**
- ✅ NOT-BE-11: Template engine ve bulk insert optimizasyonu eklendi
- ✅ NOT-BE-12: Redis-based Task Queue (Arq) zorunlu hale getirildi
- ✅ NOT-FE-07: Exponential Backoff ve Page Focus kontrolü eklendi

---

# 📋 BiHocam - Eğitim Onaylama Akışı Kanban Board

**Proje:** Eğitim Onaylama / Moderasyon Sistemi  
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3-4 Gün  
**Tamamlanma Tarihi:** 2025-02-08

---

## 📊 Genel Durum

- **Toplam Task:** 14/14 ✅
- **Backend:** 7/7 ✅
- **Frontend:** 7/7 ✅
- **Tamamlanma:** 100%

---

## ğŸ¯ Amaç

- Öğretmenler kurslarını **taslak** olarak oluşturacak ve **onaya gÃ¶nderecek**.
- Admin, bu kursları **inceleyip onaylayacak veya reddedecek**.
- Admin, kurs üzerinde **düzenleme yapabilecek** ve **kategori atayabilecek**.
- Onaylanan kurslar **öğrencilere gÃ¶rünür / satın alınabilir** hale gelecek.
- Akış boyunca hem öğretmen hem admin için **şeffaf bir durum takibi** sağlanacak.
- **Ek Özellik:** Arşivlenen kurslar arşivden çıkarılabilir (unarchive endpoint).

---

## 🔴 BACKEND TASKS (Eğitim Onaylama)

### 💡¦ Model & Domain

#### [APP-BE-01] CourseStatus Enumu Genişletme
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 30 dk

**Açıklama:**
- Mevcut `CourseStatus` sadece `draft / published / archived` içeriyor.
- Moderasyon akışı için ek statüler ekle:
  - `PENDING_REVIEW` (öğretmen onaya gÃ¶nderdi)
  - `REJECTED` (admin reddetti)

**Kriterler:**
- ✅ `CourseStatus` enum'una yeni değerler eklenmeli.
- ✅ `Course` modelindeki `status` alanı bu enumu kullanmaya devam etmeli.
- ✅ Migration gerekirse planlanmalı (enum tipi DB tarafında güncellenecek).
- ✅ Mevcut datalar için default mapping: `draft` ve `published` aynen kalabilir.
 - ✅ Basit bir **status transition matrix** dÃ¶kümante edilmeli (hangi statüden hangisine kim geçirebilir).
 - 💡œ İLERİ AÅAMA (opsiyonel): `SUSPENDED` / `UNLISTED` / `DELETED` gibi ek statüler telif/policy ihlali ve soft delete senaryoları için ayrı bir epic'te ele alınabilir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: `SUSPENDED` veya `UNLISTED` durumu eklenebilir (policy ihlali, telif hakkı şikayeti vb. durumlar için).
2. EDGE CASE: ARCHIVED durumunun moderasyon akışındaki yeri belirsiz. PUBLISHED → ARCHIVED geçişi sadece admin mi yoksa öğretmen de yapabilir mi?
3. EDGE CASE: Soft delete için `DELETED` enum değeri düşünülebilir (hard delete yerine, GDPR compliance).
4. ÖNERİ: Status transition matrix'i bu task'ta da belgelenmeli (hangi status'ten hangisine geçiş valid, kim tarafından yapılabilir).
5. EDGE CASE: Enum değişikliği için Alembic migration'ı PostgreSQL'de `ALTER TYPE ... ADD VALUE` gerektirir - migration order Ã¶nemli.
-->

---

#### [APP-BE-02] CourseReviewHistory / Moderation Log Modeli
**Durum:** ✅ TAMAMLANDI  
 **Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Her onay/ret işlemi için bir log tutulmalı.
- Kim, ne zaman, hangi yorumu bıraktı, eski/yeni durum neydi?

**Alanlar:**
- `id`: UUID
- `course_id`: UUID (Course FK)
- `admin_id`: UUID (işlemi yapan admin)
- `old_status`: Enum(CourseStatus)
- `new_status`: Enum(CourseStatus)
- `note`: Text (admin notu veya açıklaması)
- `created_at`: DateTime

**Kriterler:**
- ✅ Course ile `one-to-many` ilişki (`course.review_history`).
- ✅ İşlemi yapan kullanıcı ile relationship (admin veya öğretmen - generic `actor_id`).
- ✅ Sorgulama için index: `course_id`, `created_at`.
- ✅ `action_type` enum alanı (SUBMIT_FOR_REVIEW, APPROVE, REJECT, EDIT, RESUBMIT, ARCHIVE vb.).
- ✅ Minimum olarak `old_status`, `new_status`, `note`, `actor_id`, `action_type` loglanmalı.
- 💡œ İLERİ AÅAMA (opsiyonel):
  - `changes_json` alanı ile alan bazlı değişiklik diff'i tutmak.
  - Güvenlik için `ip_address` ve `user_agent` loglamak.
  - `is_system_generated` ile otomatik işlemleri işaretlemek.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EKSİK ALAN: `action_type` enum alanı eklenmeli (SUBMIT_FOR_REVIEW, APPROVE, REJECT, EDIT, RESUBMIT, ARCHIVE vb.) - sadece old/new status yeterli değil.
2. EKSİK ALAN: `actor_id` yerine daha generic bir alan kullanılmalı - admin dışında öğretmen de log oluşturabilir (submit işlemi için).
3. EDGE CASE: `ip_address` ve `user_agent` alanları audit trail için düşünülebilir (güvenlik amaçlı).
4. EDGE CASE: Admin kursu düzenlediğinde de log tutulmalı mı? `changes_json` alanı ile değişen alanlar kaydedilebilir.
5. ÖNERİ: `is_system_generated` boolean - otomatik işlemler (timeout, scheduled publish) için.
-->

---

### 💡Œ API Endpoints & Servisler

#### [APP-BE-03] Kursu Onaya GÃ¶nderme Endpoint'i (Teacher)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Endpoint: `POST /api/v1/courses/{course_id}/submit-for-review`
- Sadece **kursun öğretmeni** çağırabilmeli.
- Kurs status:
  - `DRAFT` → `PENDING_REVIEW`
- Bazı zorunlu alanlar boşsa (başlık, açıklama, en az 1 ders, fiyat, kategori vs.)
  → 400 dÃ¶n ve hangi alanların eksik olduğunu bildir.

**Kriterler:**
- ✅ Auth: öğretmen rolü ve kurs owner kontrolü.
- ✅ Validasyon: minimum yayınlanabilir kurs kriterleri (DoD).
- ✅ Status geçiş kontrolü:
  - `DRAFT` dışındaki statülerden `PENDING_REVIEW`'e geçişe izin verme.
- ✅ ReviewHistory kaydı aç (old_status: DRAFT, new_status: PENDING_REVIEW).
- ✅ Kurs `PENDING_REVIEW` durumundayken öğretmen için **readonly** olmalı (sadece admin düzenleyebilir).
- 💡œ İLERİ AÅAMA:
  - `REJECTED` durumundaki kurslar için tekrar onaya gÃ¶nderme (resubmission) akışı netleştirilmeli.
  - Öğretmenin onay isteğini geri çekmesi (`withdraw from review`) için ayrı bir endpoint planlanmalı.

> [!IMPORTANT]
> **GEMINI-COMMENT:** Kurs `PENDING_REVIEW` durumuna geçtiğinde, öğretmen tarafından düzenlenemez (readonly) olmalıdır. Eğer öğretmen düzenleme yapmak isterse kursu tekrar `DRAFT` moduna çekmeli veya admin incelemeyi bitirene kadar beklemelidir. Bu, adminin incelediği içerik ile son yayınlanan içeriğin tutarlı olmasını sağlar.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: `REJECTED` → tekrar `PENDING_REVIEW` geçişi tanımlanmalı. Öğretmen düzeltme yapıp tekrar gÃ¶nderebilmeli. Akış: REJECTED → (öğretmen düzeltir) → DRAFT değil, doğrudan PENDING_REVIEW mı?
2. EDGE CASE: Rate limiting - öğretmen spam submit yapmasın (Ã¶r: 24 saatte max 3 submit, veya son ret'ten sonra min 1 saat bekleme).
3. EDGE CASE: Video transcoding devam ederken submit engellensin mi? Async işlem durumu kontrolü.
4. EKSİK KRİTER: Minimum içerik detayları eksik - "en az 1 ders" yeterli mi? Toplam video süresi minimum (Ã¶r: 30 dk)?
5. EDGE CASE: Kurs silinirse veya öğretmen hesabı deaktif edilirse PENDING_REVIEW durumundaki kurs ne olacak?
6. ÖNERİ: `submit_count` field - kaçıncı kez onaya gÃ¶nderildiğini track etmek için (tekrar eden retler için admin insight).
-->

---

#### [APP-BE-04] Admin Onay / Red Endpoint'leri
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Endpoint'ler:
  - `POST /api/v1/admin/courses/{course_id}/approve`
  - `POST /api/v1/admin/courses/{course_id}/reject`
- Sadece admin rolü erişebilmeli.
- `approve`:
  - `PENDING_REVIEW` → `PUBLISHED`
  - `published_at` timestamp set et.
- `reject`:
  - `PENDING_REVIEW` → `REJECTED`
  - Admin notu (zorunlu parametre) ile birlikte kaydet.

**Kriterler:**
- ✅ Role check: `require_admin`.
- ✅ Status transition matrix:
  - Sadece `PENDING_REVIEW` durumundaki kurslar için izin ver.
- ✅ ReviewHistory log kaydı oluştur.
- ✅ Gerekirse öğretmene notification tetiklemek için Notification Service hook'ları planla (NOT-BE-11 ile entegre).
- ✅ `reject` işleminde `note` alanı **zorunlu** olmalı; `approve` için opsiyonel not alanı desteklenebilir.
- ✅ İki adminin aynı anda işlem yapmasına karşı, güncelleme Ã¶ncesi mevcut statü kontrolü ile **race condition** Ã¶nlenmeli (Ã¶r. beklenen statü değilse 409/400 dÃ¶n).
- 💡œ İLERİ AÅAMA:
  - Toplu onay/red için `bulk-approve` / `bulk-reject` endpoint'leri (yüksek hacimli moderasyon için).

> [!CAUTION]
> **GEMINI-COMMENT:** Red (`reject`) işlemi sırasında `note` (red sebebi) parametresi kesinlikle zorunlu (required) tutulmalıdır. Ayrıca statü güncellemeleri veritabanı seviyesinde atomik olmalı; aynı anda iki adminin aynı kursu onaylaması/reddetmesi durumu (race condition) statü kontrolü ile engellenmelidir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Bulk approve/reject - admin 10+ kurs beklerken hepsini tek tek mi onaylayacak? Toplu işlem endpoint'i: `POST /api/v1/admin/courses/bulk-approve` (course_ids array).
2. EDGE CASE: Onay için de opsiyonel not alanı olmalı - "Harika içerik!" veya "Fiyatı düşürmenizi Ã¶neririm" gibi feedback.
3. EDGE CASE: Reject reason categories - dropdown ile "İçerik kalitesi", "Telif hakkı ihlali", "Uygunsuz içerik", "Eksik bilgi", "Diğer" seçtirip custom note yazdırılabilir (analytics için).
4. EDGE CASE: `rejection_deadline` - Admin X gün içinde (Ã¶r: 7 gün) incelemezse öğretmene "Hala bekliyorsunuz" notification'ı veya auto-escalation.
5. ÖNERİ: `reviewed_by` alanı Course modeline eklenmeli - hangi admin onayladı/reddetti bilgisi.
6. EDGE CASE: Onay sonrası kurs anında mı yayınlanacak yoksa `scheduled_publish_at` ile ileri tarihli yayın seçeneği?
-->

---

#### [APP-BE-05] Admin Kurs Detay / Edit Endpoint Genişletmesi
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Admin, öğretmenin kursu üzerinde düzenleme yapabilmeli:
  - Başlık, açıklama, fiyat, is_featured vb.
  - Kurs kategorilerini ekleyip çıkarabilmeli.
- Mevcut `/courses/{id}` update endpoint'ini role-aware hale getir:
  - Öğretmen sadece kendi kurslarında, belirli alanları güncelleyebilsin.
  - Admin tüm kurslarda daha geniş alan setini düzenleyebilsin.

**Kriterler:**
- ✅ Backend'de alan bazlı güvenlik:
  - Teacher: sınırlı alan (Ã¶r: title, description, content).
  - Admin: fiyat, is_featured, status override vb. alanlar.
- ✅ Category assignment için mevcut BE-10 altyapısını kullan.
- ✅ Değişiklikler gerektiğinde ReviewHistory'ye not eklenebilir (OPS).
- ✅ Yayında (`PUBLISHED`) kurslarda **slug güncelleme politikası** belirlenmeli:
  - Öneri: Kurs yayınlandıktan sonra başlık değişse bile slug sabit kalsın; slug değişecekse redirect mekanizması ayrı epic'te planlansın.
- 💡œ İLERİ AÅAMA:
  - Admin edit'leri için `edited_by_admin_at` ve `last_admin_editor_id` alanları.
  - Price değişikliklerinin mevcut öğrenciler üzerindeki etkisi için ayrı policy (sadece yeni alımları etkilemesi vb.).

> [!TIP]
> **GEMINI-COMMENT:** Admin başlığı değiştirdiğinde `slug` alanının güncellenip güncellenmeyeceğine karar verilmelidir. Eğer kurs henüz yayınlanmadıysa (`PUBLISHED` değilse) slug güncellenebilir, ancak yayınlanmış bir kursun başlığı değişirse SEO ve linklerin kırılmaması için slug sabit kalmalı veya bir yÃ¶nlendirme (301 redirect) mekanizması düşünülmelidir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Admin hangi statülerde düzenleme yapabilir? Sadece PENDING_REVIEW mu, yoksa tüm statüler mi? PUBLISHED kursları da düzenleyebilir mi?
2. EDGE CASE: Admin düzenlemesi için audit trail - `edited_by_admin_at`, `last_admin_editor_id` alanları.
3. EDGE CASE: Öğretmen kendi kursunu düzenlerken PENDING_REVIEW durumunda ise ne olacak? GEMINI-COMMENT'te readonly denmiş ama endpoint'te bu kontrolün explicit yapılması lazım.
4. ÖNERİ: Admin edit'leri için diff/changelog - öğretmene "Admin şu alanları değiştirdi" bildirimi.
5. EDGE CASE: Price değişikliği - aktif enrollment'ları olan bir kursun fiyatını admin değiştirebilir mi? Mevcut öğrencileri etkiler mi?
6. EDGE CASE: is_featured toggle - aynı anda kaç kurs featured olabilir? Limit var mı?
-->

---

#### [APP-BE-06] Onay Bekleyen Kurslar Listesi (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 45 dk

**Açıklama:**
- Endpoint: `GET /api/v1/admin/courses/pending`
- Sadece admin rolü.
- Sadece `PENDING_REVIEW` statüsündeki kursları dÃ¶ner.

**Kriterler:**
- ✅ Pagination (skip/limit).
- ✅ Teacher bilgisi eager-load (full_name, email).
- ✅ Basit filtreler:
  - `?teacher_id=...`
  - `?created_from=...&created_to=...`
- ✅ Sıralama ve arama desteği:
  - `?q=` (kurs adı arama), `?sort_by=submitted_at|created_at|teacher_name`, `?sort_order=asc|desc`.
- 💡œ İLERİ AÅAMA:
  - `?resubmission=true`, `?has_previous_rejection=true`, `?category_id=...` gibi detaylı filtreler.
  - Response içinde `days_pending` ve `submission_count` alanları ile SLA takibi.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EKSİK FİLTRE: `?sort_by=submitted_at|created_at|teacher_name` ve `?sort_order=asc|desc` parametreleri eklenmeli.
2. EKSİK FİLTRE: `?resubmission=true` - daha Ã¶nce reddedilip tekrar gÃ¶nderilen kursları filtreleme (Ã¶ncelikli inceleme için).
3. EDGE CASE: `?has_previous_rejection=true` - geçmişinde ret olan kursları işaretleme (admin dikkatli incelemeli).
4. ÖNERİ: Response'da `days_pending` field - kurs kaç gündür bekliyor bilgisi (SLA takibi için).
5. ÖNERİ: Response'da `submission_count` - kaçıncı kez onaya gÃ¶nderildi bilgisi.
6. EDGE CASE: Search by course title - `?q=python` ile kurs adında arama.
7. ÖNERİ: `?category_id=...` filtresi - belirli kategorideki bekleyen kurslar.
-->

---

### 💡¬ Notification Entegrasyon Notları (BE)

#### [APP-BE-07] Onay / Red Bildirim Trigger'ları
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Course approval/reject endpointlerinde Notification Service kullan:
  - Onay → `ADMIN_TO_TEACHER` tipinde bildirim + (isteğe bağlı email).
  - Ret → `ADMIN_TO_TEACHER` + admin notu mesaj içinde.

**Kriterler:**
- ✅ NotificationType ve template'ler Notification epic'i ile uyumlu.
- ✅ Bildirim içeriğinde:
  - Kurs adı
  - Yeni durum
  - Admin mesajı (ret durumunda)
  - Kurs detayına giden action_url.
- ✅ Bildirim tiplerine özel enum değerleri kullanılmalı: `COURSE_SUBMITTED`, `COURSE_APPROVED`, `COURSE_REJECTED`, `COURSE_RESUBMITTED`.
- 💡œ İLERİ AÅAMA:
  - Admin için "yeni kurs onay bekliyor" bildirimleri (course submit edildiğinde).
  - Pending kurslar uzun süre incelenmediyse hatırlatma veya escalation bildirimleri.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EKSİK BİLDİRİM: Kurs tekrar onaya gÃ¶nderildiğinde admin'e bildirim - "Daha Ã¶nce reddettiğiniz 'X' kursu tekrar gÃ¶nderildi".
2. EDGE CASE: Email opt-out - öğretmen sadece in-app bildirim isteyebilir, email spam'den kaçınmak için.
3. EDGE CASE: Bildirim batching - öğretmenin 5 kursu aynı anda onaylanırsa 5 ayrı email yerine tek özet email.
4. ÖNERİ: Admin için "Yeni kurs onay bekliyor" bildirimi - kurs submit edildiğinde admin'lere push notification.
5. ÖNERİ: Reminder notification - X gün (Ã¶r: 3 gün) inceleme yapılmazsa admin'e hatırlatma.
6. EDGE CASE: Notification delivery failure handling - email bounce durumunda retry logic.
7. ÖNERİ: NotificationType enum'larına eklenmeli: `COURSE_SUBMITTED`, `COURSE_APPROVED`, `COURSE_REJECTED`, `COURSE_RESUBMITTED`.
-->

---

## ğŸ¨ FRONTEND TASKS (Eğitim Onaylama)

### 📊 Dashboard Ayrımı & Navigasyon

#### [APP-FE-01] Admin / Öğretmen Dashboard Ayrımı
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- `dashboard/layout.tsx` ve `dashboard/page.tsx` tarafında:
  - Admin için ayrı bir dashboard gÃ¶rünümü (daha kapsamlı istatistikler, bekleyen onaylar, bildirimler vb.).
  - Öğretmen için daha sade, kendi kurslarına ve istatistiklerine odaklı gÃ¶rünüm.
- Navigation:
  - Admin: `Kategoriler`, `Bekleyen Eğitimler`, `Kullanıcı Yönetimi (ileride)`, `Bildirimler Paneli (Notification Epic)` vb.
  - Öğretmen: `Kurslarım`, `Yeni Kurs`, `Kazançlar`, `Yorumlar`.

**Kriterler:**
- ✅ Role based conditional render:
  - `user.role === "admin"` → AdminDashboard component.
  - `user.role === "teacher"` → TeacherDashboard component.
- ✅ Sidebar menü item'ları role bazlı ayrıştırılmış olmalı.
- ✅ Admin top-bar'da "Bekleyen Eğitimler" gibi quick action butonu.
- 💡œ İLERİ AÅAMA:
  - Bir kullanıcının birden fazla role sahip olması durumunda (admin + teacher) role-switch UI tasarlamak.
  - Admin dashboard'da bekleyen onay sayısı için belirgin bir badge/gÃ¶sterge.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Kullanıcı birden fazla role sahip olabilir mi? (admin + teacher). Eğer evet, hangi dashboard gÃ¶sterilecek? Role switch UI?
2. EDGE CASE: Role değişikliği (admin → teacher demote) anında UI nasıl güncellenecek? Force logout mu, real-time update mi?
3. ÖNERİ: Admin dashboard'da "Bekleyen Onay Sayısı" badge'i - kırmızı bildirim balonu gibi.
4. EDGE CASE: Student role'ü bu akışta tanımlı değil - student dashboard da olmalı mı? Yoksa sadece public sayfalar mı?
5. ÖNERİ: Dashboard widget'ları - son 7 günde onaylanan/reddedilen kurs sayısı, ortalama onay süresi vb. analytics.
6. EDGE CASE: Mobile responsive tasarım - sidebar collapse/drawer pattern.
-->

---

### ⏳ Kurs Onay Akışı Ekranları (Admin)

#### [APP-FE-02] Bekleyen Eğitimler Listesi (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Sayfa: `/dashboard/admin/courses/pending`
- İçerik:
  - List / table gÃ¶rünüm:
    - Kurs adı
    - Eğitmen adı
    - Oluşturulma tarihi
    - Mevcut status (PENDING_REVIEW)
    - Hızlı aksiyonlar: `İncele`, `Onayla`, `Reddet`

**Kriterler:**
- ✅ React Query ile pending listesi çek.
- ✅ Loading / empty states.
- ✅ Row hover / action butonları (teal/orange theme).
- ✅ İncele butonu kurs detay ekranına gÃ¶türmeli.
- ✅ Onay / red aksiyonları için **confirmation modal** (yanlışlıkla tıklamaları Ã¶nlemek için).
- 💡œ İLERİ AÅAMA:
  - Search/filter bar (kurs adı, öğretmen adı).
  - Bulk selection (checkbox) ile toplu onaylama.
  - "Resubmission" badge'i ve "kaç gündür bekliyor" kolonu.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Real-time updates - başka admin onayladığında liste anında güncellensin mi? WebSocket veya polling ile.
2. EKSİK UX: Confirmation modal - "Onayla" veya "Reddet" butonuna basınca yanlışlıkla işlem yapılmasın diye konfirmasyon.
3. ÖNERİ: Search/filter bar - kurs adı, öğretmen adı ile arama.
4. ÖNERİ: Bulk selection - checkbox ile birden fazla kurs seçip toplu onaylama.
5. EDGE CASE: Error state - API fail olursa retry butonu ve hata mesajı.
6. ÖNERİ: "Resubmission" badge - daha Ã¶nce reddedilip tekrar gÃ¶nderilen kurslar için gÃ¶rsel işaret.
7. ÖNERİ: "Bekleme süresi" kolonu - "3 gündür bekliyor" gibi, uzun bekleyenler kırmızı highlight.
-->

---

#### [APP-FE-03] Admin Kurs İnceleme / Detay Ekranı
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:**
- Sayfa: `/dashboard/admin/courses/{courseId}`
- Admin için öğretmenin kursunu inceleyebileceği özel layout:
  - Sol: Kurs içeriği (başlık, açıklama, fiyat, ders listesi, Ã¶nizleme vb.).
  - Sağ: Onay/Red paneli:
    - Status badge
    - Admin notu text-area
    - `Onayla` ve `Reddet` butonları
  - Alt: Moderasyon geçmişi (ReviewHistory log listesi).

**Kriterler:**
- ✅ Kurs detay API'sinden tüm gerekli alanlar çekilmeli.
- ✅ Onay / red butonları ilgili BE endpoint'lerine bağlı olmalı.
- ✅ İşlem sonrası:
  - Toast mesajı
  - Listeye geri dÃ¶n / kursu gÃ¶rüntüle opsiyonu.
- 💡œ İLERİ AÅAMA:
  - Aynı kursu başka bir admin inceliyorsa uyarı gÃ¶sterme (concurrent review warning).
  - Red notu için karakter limiti ve hazır "ret sebepleri" şablonları (dropdown + custom text).
  - Öğrenci Ã¶nizleme ve video preview player ile daha zengin inceleme deneyimi.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EKSİK UX: Concurrent edit uyarısı - başka admin aynı kursu inceliyorsa "X admin şu anda inceliyor" warning.
2. ÖNERİ: Video preview player - admin kursu incelemek için videoları izleyebilmeli (embedded player).
3. ÖNERİ: "Öğrenci Önizleme" butonu - admin kursu öğrenci gÃ¶zünden gÃ¶rebilmeli (preview mode).
4. EDGE CASE: Red notu character limit - max 1000 karakter? Minimum 20 karakter zorunlu mu?
5. ÖNERİ: Quick reject reasons - dropdown ile hazır seçenekler + custom text alanı (analytics ve hız için).
6. EDGE CASE: Sayfa yenileme/browser geri - form state kaybedilirse uyarı (unsaved changes).
7. ÖNERİ: Keyboard shortcuts - Enter for approve, Escape for cancel, Ctrl+R for reject (power user UX).
8. EDGE CASE: Önceki ve sonraki kurs navigasyonu - liste sırasına gÃ¶re prev/next butonları.
-->

---

### âœï¸ Öğretmen Tarafı Akış

#### [APP-FE-04] Kurs Oluşturma Sihirbazında "Onaya GÃ¶nder" Adımı
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:**
- `dashboard/my-courses/new` sihirbazında son step'e:
  - `Taslak Olarak Kaydet` ve
  - `Onaya GÃ¶nder` butonları ekle.
- `Onaya GÃ¶nder`:
  - Kursu kaydeder veya günceller.
  - Ardından `submit-for-review` endpoint'ini çağırır.

**Kriterler:**
- ✅ Button state'leri (loading, disabled).
- ✅ Minimum alan validasyonları (eksikse kullanıcıyı bilgilendir).
- ✅ Başarılı durumda öğretmeni dashboard'a veya kurs detayına yÃ¶nlendir ve bilgi mesajı gÃ¶ster.
- 💡œ İLERİ AÅAMA:
  - Pre-submit checklist (tamamlanan/eksik kısımları gÃ¶rsel olarak gÃ¶steren bir liste).
  - Video upload/transcoding devam ederken submit'i engelleme.
  - Rate limiting / double-click prevention için ekstra korumalar.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Double-click prevention - buton disable olmalı, request sırasında spinner gÃ¶sterilmeli.
2. EDGE CASE: Unsaved changes warning - form dirty state ise "Kaydedilmemiş değişiklikler var" modal.
3. ÖNERİ: Pre-submit checklist UI - eksik alanları kırmızı, tamamlanan alanları yeşil gÃ¶steren visual checklist.
4. EDGE CASE: Network failure - submit sırasında internet kesilirse retry option ve draft auto-save.
5. ÖNERİ: "Ne beklenir?" tooltip - onay sürecinde adminin neye baktığını açıklayan info box.
6. EDGE CASE: Video upload devam ediyorsa submit disable edilmeli - "Video işleniyor, lütfen bekleyin" mesajı.
7. ÖNERİ: Estimated review time - "Kursunuz genellikle 1-3 iş günü içinde incelenir" bilgisi.
-->

---

#### [APP-FE-05] Öğretmen Kurs Listesinde Durum Badge'leri
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:**
- `dashboard/my-courses` sayfasındaki kurs kartlarında / satırlarında:
  - Status mapping:
    - `DRAFT` → Taslak (gri/amber)
    - `PENDING_REVIEW` → İncelemede (mavi)
    - `REJECTED` → Reddedildi (kırmızı, tooltip ile admin notu gelecek)
    - `PUBLISHED` → Yayında (yeşil)

**Kriterler:**
- ✅ Renk kodlu badge tasarımı.
- ✅ Reddedilen kurslar için hover'da admin notunu gÃ¶steren tooltip veya küçük modal.
- ✅ Reddedilen kurslarda kurs detay/düzenleme sayfasının üstünde belirgin bir **alert bloğu** içinde red sebebi ve admin tavsiyeleri gÃ¶sterilmeli.

> [!NOTE]
> **GEMINI-COMMENT:** Reddedilen kurslar için admin notu öğretmen ekranında çok belirgin olmalıdır. Sadece tooltip değil, kurs düzenleme sayfasına girildiğinde en üstte bir "Uyarı/Alert" bloğu içinde red sebebi ve adminin tavsiyeleri gÃ¶sterilmelidir. Bu, öğretmenin düzeltmeleri daha hızlı yapmasını sağlar.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EKSİK STATUS: `ARCHIVED` badge'i de eklenmeli - mapping: gri veya strikethrough style.
2. ÖNERİ: Badge'e tıklandığında durum geçmişi (history) popup - "Ne zaman hangi duruma geçti" timeline.
3. EDGE CASE: "Tekrar GÃ¶nder" quick action - REJECTED kurslar için inline buton, edit sayfasına gitmeye gerek kalmadan.
4. ÖNERİ: Status filter dropdown - "Tüm Kurslar", "Taslaklar", "İncelemede", "Reddedilenler", "Yayında" filtreleri.
5. EDGE CASE: PENDING_REVIEW badge'inde "X gündür bekliyor" bilgisi eklenebilir.
6. ÖNERİ: Animated status transition - durum değiştiğinde badge'de subtle animation (UX polish).
7. EDGE CASE: Accessibility - badge'lerin sadece renk değil, ikon veya pattern ile de ayırt edilmesi (color-blind users).
-->

---

### ğŸ§© Kategori Atama UX İyileştirmeleri

#### [APP-FE-06] Öğretmen Kurs Düzenle Ekranında Kategori Seçimi
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Mevcut kategori seçici (CategoryPicker) sadece oluşturma akışında.
- Öğretmen, kendi kursunu düzenlerken de kategori ekleyip çıkarabilmeli:
  - Sayfa: `/dashboard/my-courses/{courseId}/edit` (veya mevcut edit sayfası).

**Kriterler:**
- ✅ `CategoryPicker` entegrasyonu (çoklu seçim).
- ✅ Mevcut kategoriler varsayılan seçili gelsin.
- ✅ Save sonrası BE-10 üzerinden kategori_ids güncellensin.
- 💡œ İLERİ AÅAMA:
  - Minimum 1 kategori zorunluluğu ve maksimum kategori limiti (Ã¶r: max 3) policy olarak netleştirilmeli.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Kategori zorunlu mu? Minimum 1 kategori seçilmeden kursu kaydetmeye izin verilmemeli.
2. EDGE CASE: Maximum kategori limiti - bir kurs en fazla kaç kategoride olabilir? (Ã¶r: max 3).
3. EDGE CASE: Kategori silinirse ne olur? - admin bir kategoriyi sistemden silerse, o kategorideki kurslar ne olacak? Orphan check.
4. ÖNERİ: Kategori önerisi - kurs başlığı ve açıklamasına gÃ¶re AI-powered kategori suggestion.
5. EDGE CASE: Nested/hierarchical categories - parent-child ilişkisi varsa picker UI bunu desteklemeli (tree view).
6. ÖNERİ: "Önerilen kategoriler" section - benzer kurslara gÃ¶re popular kategori Ã¶nerileri.
-->

---

#### [APP-FE-07] Admin Kurs Detayında Kategori Yönetimi
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Admin kurs inceleme sayfasında:
  - Kategori badge'leri listelensin.
  - Kısa bir "Kategori YÃ¶net" butonu ile CategoryPicker açılıp kurs kategorileri güncellenebilsin.

**Kriterler:**
- ✅ Inline kategori güncelleme (modal veya slide-over panel).
- ✅ Güncelleme sonrası badge'ler ve course detail UI anında güncellenir.
- 💡œ İLERİ AÅAMA:
  - Kategori değişikliklerini ReviewHistory'de loglamak.
  - Değişiklik sonrası öğretmene bilgilendirici notification gÃ¶ndermek.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Kategori değişikliği log'lanmalı - ReviewHistory'ye "Admin kategorileri güncelledi" kaydı.
2. ÖNERİ: Optimistic update - save butonu sonrası anında UI güncelle, hata olursa rollback.
3. EDGE CASE: Concurrent edit - öğretmen ve admin aynı anda kategori değiştirirse conflict resolution.
4. ÖNERİ: Kategori değişikliğinde öğretmene bildirim - "Admin kursunuzun kategorisini değiştirdi".
5. EDGE CASE: "Değişiklikleri geri al" / undo option - yanlışlıkla yapılan değişiklik için.
-->

---

## ğŸ§ª TEST TASKS (Eğitim Onaylama)

#### [APP-TEST-01] Status Transition Unit Tests (BE)
**Durum:** ❌ TODO (İleride yapılacak)  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:**
- CourseStatus geçişleri için testler:
  - DRAFT → PENDING_REVIEW → PUBLISHED
  - DRAFT → PENDING_REVIEW → REJECTED
  - Geçersiz geçişlere izin verilmemesi (Ã¶r: PUBLISHED → PENDING_REVIEW).
- 💡œ İLERİ AÅAMA:
  - REJECTED → PENDING_REVIEW resubmission akış testleri.
  - PUBLISHED → ARCHIVED geçiş yetkileri.
  - Race condition ve authorization (rol) testleri.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EKSİK TEST: REJECTED → PENDING_REVIEW (resubmission) flow testi - öğretmen düzeltip tekrar gÃ¶nderme.
2. EKSİK TEST: PUBLISHED → ARCHIVED geçişi - kim yapabilir (admin/teacher)?
3. EKSİK TEST: Race condition testi - aynı kursu iki admin aynı anda approve/reject etmeye çalışırsa.
4. EKSİK TEST: Authorization testleri - teacher başkasının kursunu submit edemez, student hiçbir işlem yapamaz.
5. EKSİK TEST: Validation testleri - eksik alanlarla submit-for-review çağrısı 400 dÃ¶nmeli.
6. EKSİK TEST: ReviewHistory kaydı testleri - her işlemde doğru log oluşuyor mu?
7. ÖNERİ: Edge case: Silinmiş/deaktif öğretmenin kursu onaylanmaya çalışılırsa ne olur?
8. ÖNERİ: Load testing - 100+ kurs aynı anda pending listesinde performans testi.
-->

---

#### [APP-TEST-02] Eğitim Onay UI Flow Testleri (FE)
**Durum:** ❌ TODO (İleride yapılacak)  
**Öncelik:** ğŸŸ¢ DÜÅÜK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Örnek e2e senaryo (Cypress/Playwright veya manual script):
  1. Öğretmen kurs oluşturur ve onaya gÃ¶nderir.
  2. Admin pending listesinde kursu gÃ¶rür, detaydan onaylar.
  3. Kurs students tarafında listelenir / satın alınabilir hale gelir.
  4. Reddedilen senaryo için ayrı akış: admin notu ile ret + öğretmen ekranında gÃ¶sterim.
- 💡œ İLERİ AÅAMA:
  - PUBLISHED kurslarda kritik alan değişikliklerinin yeniden onaya gitmesi senaryosunu da kapsayan ek e2e senaryolar.

> [!IMPORTANT]
> **GEMINI-COMMENT (Genel):** Yayında olan (`PUBLISHED`) bir kurs üzerinde öğretmen kritik bir değişiklik yaptığında (fiyat değişimi, ders silme/ekleme) kursun otomatik olarak tekrar `PENDING_REVIEW` statüsüne geçip geçmeyeceği netleştirilmelidir. Genellikle kalite kontrolü için kritik alan değişikliklerinde yeniden onay mekanizması işletilir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EKSİK SENARYO: Network failure senaryoları - API çağrısı ortasında internet kesilirse UI nasıl davranır?
2. EKSİK SENARYO: Permission denied - token expire olmuş veya role değişmiş durumda işlem yapmaya çalışma.
3. EKSİK SENARYO: Concurrent access - iki farklı tarayıcıda aynı kurs üzerinde işlem.
4. EKSİK SENARYO: Mobile responsive test - tablet ve mobil cihazlarda akış çalışıyor mu?
5. EKSİK SENARYO: Browser back/forward navigation - onay sonrası geri tuşuna basınca ne olur?
6. EKSİK SENARYO: Form validation error states - tüm hata mesajları doğru gÃ¶steriliyor mu?
7. ÖNERİ: Accessibility testing - screen reader ile akış tamamlanabiliyor mu?
8. ÖNERİ: Performance test - pending listesinde 50+ kurs varken sayfa yüklenme süresi.
9. EKSİK SENARYO: Email notification delivery verification - e2e'de email gerçekten gidiyor mu mock check.
-->

<!-- CLAUDE-COMMENT (GENEL EPIC AUDIT)
💡 GENEL EDGE CASE'LER VE EKSİKLER:

1. ğŸš¨ EKSİK TASK: "Withdraw from Review" endpoint/UI - Öğretmen onaya gÃ¶nderdiği kursu geri çekebilmeli (PENDING_REVIEW → DRAFT).

2. ğŸš¨ EKSİK TASK: Admin Dashboard Analytics - Onay istatistikleri (ortalama onay süresi, ret oranı, en çok reddedilen sebep vb.).

3. ğŸš¨ EKSİK TASK: SLA/Timeout handling - X gün içinde incelenmezse otomatik bildirim veya escalation.

4. ğŸš¨ EKSİK TASK: Appeal/Itiraz mekanizması - Öğretmen red kararına itiraz edebilmeli (özellikle yanlış anlaşılma durumlarında).

5. ğŸš¨ EKSİK TASK: Admin Notes (internal) - Öğretmene gÃ¶sterilmeyen, sadece adminler arası paylaşılan internal notlar.

6. ğŸš¨ EKSİK TASK: Course Preview as Student - Admin ve öğretmen kursu öğrenci gÃ¶züyle Ã¶nizleyebilmeli.

7. ğŸš¨ SECURITY: Rate limiting tüm endpointlerde - brute force ve spam koruması.

8. ğŸš¨ SECURITY: PENDING_REVIEW kursları public course listesinde gÃ¶rünmemeli - sadece admin ve owner gÃ¶rebilmeli.

9. ğŸš¨ DATA: Soft delete vs Hard delete policy - kurs silinirse enrollment'lar, reviewler, history ne olacak?

10. ğŸš¨ LOGGING: Tüm admin işlemleri için audit log - GDPR ve legal compliance için.

11. ğŸš¨ EDGE CASE: Multi-language support - ret sebepleri ve bildirimler çoklu dilde mi olacak?

12. ğŸš¨ EDGE CASE: Timezone handling - "3 gündür bekliyor" hesaplaması hangi timezone'a gÃ¶re?
-->

---

## ✅ Definition of Done

Her task için:
- ✅ Kod yazıldı ve çalışıyor
- ✅ TypeScript/Type hints eklendi
- ✅ Error handling yapıldı
- ✅ Loading/Empty states eklendi
- ✅ Responsive tasarım
- ✅ Teal/Orange theme uyumlu
- ✅ Code review yapıldı
- ✅ Test edildi (manual)

---

## 💡 Son Güncelleme ve Notlar

**Son Güncelleme:** 2025-02-09  
**Tamamlanma Durumu:** ✅ EPIC-4 ve EPIC-5 %100 Tamamlandı  
**Toplam Tahmini Süre:** ~20-25 saat (3-4 gün)  
**Gerçek Süre:** ~3-4 gün

**Önemli Güncellemeler:**
- ✅ Tüm backend taskları tamamlandı (APP-BE-01..07)
- ✅ Tüm frontend taskları tamamlandı (APP-FE-01..07)
- ✅ Arşivden çıkarma (unarchive) endpoint'i eklendi (`POST /api/v1/courses/{course_id}/unarchive`)
- ✅ Frontend'de eksik alan kontrolü ve gÃ¶rsel uyarılar eklendi
- ✅ Status badge'leri düzeltildi (archived kontrolü eklendi)
- ✅ Admin dashboard genişletildi (yorumlar, bildirimler, istatistikler)
- ✅ **Admin dashboard tasarımı modernize edildi** (glassmorphism, gradient efektler, animasyonlar)
- ✅ **Admin sidebar menüsü gruplandı** (Kurslar, Kullanıcılar, Finansal, Bildirim grupları)
- ✅ **Admin için gereksiz menü Ã¶ğeleri kaldırıldı** (Kurslarım, Siparişlerim - sadece öğrenci için)
- ✅ **Bildirim logları sayfası eklendi** (`/dashboard/admin/notifications/logs` - kim kime ne bildirim gÃ¶ndermiş)
- ✅ **Bekleyen banka hesabı talepleri dashboard'a eklendi**
- ✅ **Admin banka hesabı yÃ¶netim sayfası eklendi** (`/dashboard/admin/bank-accounts`)

**Ek Özellikler:**
- ✅ Arşivlenen kurslar arşivden çıkarılabilir (hem admin hem öğretmen)
- ✅ Onaya gÃ¶ndermek için eksik alanlar gÃ¶rsel olarak gÃ¶steriliyor
- ✅ Validation hataları detaylı mesajlarla gÃ¶steriliyor

**İleride Yapılacaklar:**
- ❌ Unit testler (APP-TEST-01, APP-TEST-02)
- ❌ "Withdraw from Review" özelliği (PENDING_REVIEW → DRAFT)
- ❌ Admin Dashboard Analytics (onay istatistikleri - ortalama onay süresi, ret oranı vb.)

---

# 📋 EPIC-4 – Kullanıcı & Rol Yönetimi (Admin / Kurum)

**Amaç:** Admin ve kurum yÃ¶neticilerinin kullanıcıları, rollerini ve temel hesap durumlarını tek bir yerden yÃ¶netebilmesi.  
**Roller:** Admin, (ileride Organization Owner / Kurum Admin)  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3–4 gün (BE+FE)  
**Durum:** ✅ TAMAMLANDI  
**Tamamlanma Tarihi:** 2025-02-09

## 📊 Genel Durum – EPIC-4

- **Toplam Task:** 7/7 ✅
- **Backend:** 4/4 ✅
- **Frontend:** 3/3 ✅
- **Tamamlanma:** 100%  
**Durum:** ✅ TAMAMLANDI  
**Tamamlanma Tarihi:** 2025-02-09

## 📊 Genel Durum – EPIC-4

- **Toplam Task:** 7/7 ✅
- **Backend:** 4/4 ✅
- **Frontend:** 3/3 ✅
- **Tamamlanma:** 100%

---

## 🔴 BACKEND TASKS – EPIC-4

### [EP4-BE-01] Kullanıcı Listeleme Endpoint'i (Admin)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Endpoint: `GET /api/v1/admin/users`
- Tüm kullanıcıları paginate edilmiş şekilde dÃ¶ndür:
  - `id`, `full_name`, `email`, `role`, `created_at`, `is_active`, `email_verified`, `phone`, `last_login_at` (varsa).

**Kriterler:**
- ✅ Sadece admin (ve ileride kurum admini kendi organizasyon scope'unda) gÃ¶rebilmeli.
- ✅ Filtreleme:
  - `?role=student|teacher|admin`
  - `?q=` (ad/soyad/email araması)
  - `?status=active|inactive`
  - `?created_from=&created_to=`
- ✅ Sıralama parametreleri: `sort_by=created_at|full_name|last_login_at`, `sort_order=asc|desc`.
- ✅ Response içinde:
  - `total`, `items: UserListItem[]`

> [!TIP]
> **GEMINI-COMMENT:** Kullanıcı listeleme sayfasında "Bulk Action" (toplu işlem) desteği için backend tarafında `POST /api/v1/admin/users/bulk-action` gibi bir endpoint planlanmalıdır. Ayrıca adminin bir kullanıcının email doğrulama linkini manuel olarak tekrar tetikleyebileceği bir aksiyon da listeye eklenebilir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: `last_login_at` null ise "Hiç giriş yapmadı" olarak işaretlenmeli.
2. ÖNERİ: `login_count` alanı - kullanıcı kaç kez giriş yaptı istatistiği.
3. EDGE CASE: Soft-deleted kullanıcılar listede gÃ¶rünmeli mi? `?include_deleted=true` parametresi.
4. ÖNERİ: Export endpoint - `GET /api/v1/admin/users/export?format=csv|xlsx` ile kullanıcı listesi dışa aktarma.
5. EDGE CASE: Case-insensitive search - email/isim aramasında büyük/küçük harf duyarsız olmalı.
6. ÖNERİ: `?has_purchases=true` filtresi - en az bir satın alma yapan kullanıcılar.
7. EDGE CASE: Response'da hassas bilgiler (password hash vb.) kesinlikle dÃ¶nmemeli.
-->

---

### [EP4-BE-02] Kullanıcı Detay / Güncelleme Endpoint'i (Admin)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Endpoint'ler:
  - `GET /api/v1/admin/users/{user_id}` – detay.
  - `PUT /api/v1/admin/users/{user_id}` – admin tarafından güncelleme.
- Admin; aşağıdaki alanları düzenleyebilmeli:
  - İsim, soyisim, email (email değişim policy'si ileride), telefon, rol, is_active, email_verified.

**Kriterler:**
- ✅ Role-based access: sadece admin.
- ✅ Email değişiminde unique kontrolü.
- ✅ `role` değişiminde güvenlik:
  - Admin kendi rolünü düşüremesin (self-demote) – ayrı policy.
- ✅ Response, güncellenmiş kullanıcı objesini dÃ¶ndürmeli.
- ✅ Review log için (ileride) opsiyonel audit hook notu bırakılabilir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Email değişikliğinde eski email'e bildirim gÃ¶nderilmeli (güvenlik için).
2. EDGE CASE: Rol değişikliği - teacher → student yapılırsa mevcut kursları ne olacak? Yayında kurs varken rol düşürülemez olmalı.
3. EDGE CASE: Admin sayısı kontrolü - son admin'in rolü düşürülemez (sistemde en az 1 admin kalmalı).
4. ÖNERİ: `updated_by_admin_id` alanı - hangi admin değişiklik yaptı audit trail.
5. EDGE CASE: `is_active=false` yapıldığında aktif session'lar invalidate edilmeli.
6. EDGE CASE: email_verified manuel true yapılırsa verification email gÃ¶nderilmemeli.
7. ÖNERİ: Değişiklik history endpoint - `GET /api/v1/admin/users/{id}/history` ile tüm değişiklikler.
-->

---

### [EP4-BE-03] Hesap Kapama / Silme İşlemleri

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- İki ayrı konsept:
  - **Hesap kapama (soft disable):**
    - Kullanıcı giriş yapamaz, kursları/ödemeleri korunur.
  - **Hesap silme (GDPR-friendly soft delete):**
    - Kişisel veriler maskeleme/anonimleştirme, ancak finansal ve kurs kayıtları saklanır.
- Endpoint Ã¶rnekleri:
  - `POST /api/v1/admin/users/{user_id}/deactivate`
  - `POST /api/v1/admin/users/{user_id}/activate`
  - `DELETE /api/v1/admin/users/{user_id}` (soft delete / anonymize)

**Kriterler:**
- ✅ `is_active` flag ile aktif/pasif yönetimi.
- ✅ Silme işleminde:
  - Email, isim gibi PII alanları "Anonim Kullanıcı" + random suffix ile maskele.
  - Kurs, sipariş, ödeme, review ilişkileri kopmasın.
- ✅ Tüm işlemler audit trail'e işlenmek üzere hook'a hazır olmalı.

> [!CAUTION]
> **GEMINI-COMMENT:** Bir eğitmen hesabı deaktif edildiğinde (`deactivate`), bu eğitmenin yayındaki kurslarının otomatik olarak `UNLISTED` veya `SUSPENDED` durumuna geçip geçmeyeceği netleştirilmelidir. Aktif öğrencilerin eğitime erişimi devam etmeli ancak yeni satışlar engellenmelidir. Ayrıca GDPR anonimleştirme işleminde profil resminin (avatar) de fiziksel olarak silinmesi veya default bir gÃ¶rselle değiştirilmesi kritiktir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Deactivate edilen kullanıcının bekleyen çekim talepleri ne olacak? Auto-reject mi yoksa pending mi kalacak?
2. EDGE CASE: Silinen kullanıcının yorumları - anonim olarak mı kalacak yoksa silinecek mi?
3. EDGE CASE: Reactivate - daha Ã¶nce deactivate edilen hesap tekrar aktif edilebilmeli.
4. ÖNERİ: `deactivation_reason` alanı - neden deaktif edildi (spam, ihlal, kullanıcı talebi vb.).
5. EDGE CASE: GDPR silme talebi için 30 gün bekleme süresi - kullanıcı fikir değiştirebilir.
6. EDGE CASE: Silinen kullanıcının email'i tekrar kayıt için kullanılabilir mi? Unique constraint sorunu.
7. ÖNERİ: `scheduled_deletion_at` - ileri tarihli silme planlaması (GDPR compliance).
8. EDGE CASE: Aktif subscription'ı olan kullanıcı silinemez - Ã¶nce iptal edilmeli.
-->

---

### [EP4-BE-04] Åifre Reset (Admin Taraflı)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Admin'in bir kullanıcı için "şifre sıfırlama linki üretmesi" veya geçici şifre set etmesi.
- Endpoint:
  - `POST /api/v1/admin/users/{user_id}/reset-password`

**Kriterler:**
- ✅ İki mod:
  - "Magic link" üret (email ile gÃ¶nder – Notification/Email epic'iyle entegre).
  - Veya admin geçici şifre set etsin (UI'de opsiyonel).
- ✅ Åifreler hiçbir zaman plain-text loglanmamalı.
- ✅ Kuvvetli parola policy'si (mevcut auth sistemine uygun).

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Magic link expiry süresi - 24 saat sonra geçersiz olmalı.
2. EDGE CASE: Aynı kullanıcı için birden fazla reset talebi - eski linkler invalidate edilmeli.
3. ÖNERİ: Rate limiting - aynı kullanıcı için saatte max 3 reset talebi.
4. EDGE CASE: Deaktif kullanıcı için şifre reset yapılabilir mi? Önce aktif edilmeli.
5. ÖNERİ: Admin action log - hangi admin, hangi kullanıcı için reset tetikledi.
6. EDGE CASE: Email doğrulanmamış kullanıcı - reset maili gÃ¶nderilmeden Ã¶nce uyarı.
7. ÖNERİ: Geçici şifre kullanıldığında "İlk girişte şifre değiştirme zorunluluğu" flag'i.
-->

---

## ğŸ¨ FRONTEND TASKS – EPIC-4

### [EP4-FE-01] Admin Kullanıcı Listesi Sayfası

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Sayfa: `/dashboard/admin/users`
- Tablo kolonları:
  - Kullanıcı (isim + avatar/baş harf)
  - Tür (Öğrenci / Eğitmen / Admin)
  - İletişim (email, telefon)
  - Kayıt Tarihi
  - Durum (Aktif / Pasif / Silinmiş)
  - İşlemler (detay, düzenle, hesap kapama/aktif etme, reset şifre)

**Kriterler:**
- ✅ React Query ile listeyi çeken hook.
- ✅ Filtre bar:
  - Rol filtresi, durum filtresi, search input.
- ✅ Pagination (sayfalama) + total gÃ¶sterimi.
- ✅ Responsive tasarım (mobilde stack'lenmiş kart gÃ¶rünümü).

> [!TIP]
> **GEMINI-COMMENT:** Kullanıcı tablosunda her satırın başında bir checkbox ve tablonun üstünde "Seçili Olanları Deaktif Et", "Rol Değiştir" gibi "Bulk Actions" UI bileşenleri eklenmesi, çok sayıda kullanıcıyı yÃ¶neten adminler için büyük kolaylık sağlayacaktır.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Tablo boş state - "Kullanıcı bulunamadı" mesajı ve filtre temizleme butonu.
2. ÖNERİ: Quick actions - satır üzerinde hover'da hızlı aksiyonlar (deaktif, detay, reset).
3. EDGE CASE: Ã‡ok uzun email/isim truncate edilmeli, hover'da tooltip ile tam gÃ¶sterilmeli.
4. ÖNERİ: Column visibility toggle - hangi kolonların gÃ¶sterileceğini seçebilme.
5. EDGE CASE: URL'de filter state'i - sayfa yenilendiğinde filtreler korunmalı (query params).
6. ÖNERİ: "Son 7 günde kayıt olanlar" gibi quick filter butonları.
7. EDGE CASE: Infinite scroll vs pagination - büyük veri setleri için performans.
8. ÖNERİ: Keyboard navigation - tablo içinde arrow keys ile gezinme.
-->

---

### [EP4-FE-02] Admin Kullanıcı Detay & Düzenleme Formu

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- Route: `/dashboard/admin/users/{userId}`
- Sekmeli veya card tabanlı detay:
  - **Genel Bilgiler:** Ad, soyad, email, rol, durum, kayıt tarihi.
  - **İletişim:** Telefon, email doğrulama durumu (toggle).
  - **Hesap İşlemleri:** Hesap kapat/aç, şifre reset, silme (soft delete).

**Kriterler:**
- ✅ Form validation (zorunlu alanlar, email formatı).
- ✅ Rol değiştirme UI'sinde uyarılar (Ã¶r. admin yaparken).
- ✅ "Hesap sil" için kırmızı, iki aşamalı confirmation modal.
- ✅ İşlem sonrası toast bildirimleri ve listeye geri dÃ¶n linki.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Unsaved changes warning - formda değişiklik varken sayfadan çıkışta uyarı.
2. ÖNERİ: Activity log tab - kullanıcının son aktiviteleri (login, kurs satın alma vb.).
3. EDGE CASE: Kendi hesabını gÃ¶rüntüleyen admin - "Bu sizin hesabınız" uyarısı ve kısıtlamalar.
4. ÖNERİ: Quick stats - kullanıcının toplam harcaması, kayıtlı kurs sayısı gibi özet bilgiler.
5. EDGE CASE: Concurrent edit - başka admin aynı kullanıcıyı düzenliyorsa uyarı.
6. ÖNERİ: "Kullanıcı olarak giriş yap" (impersonate) özelliği - debug için.
7. EDGE CASE: Silme işlemi geri alınamaz uyarısı - çok net ve belirgin olmalı.
8. ÖNERİ: Breadcrumb navigation - "Kullanıcılar > Hakan Er > Düzenle".
-->

---

### [EP4-FE-03] Åifre Reset İşlemi (Admin Panel)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:**
- Kullanıcı detay ekranında "Åifreyi Sıfırla" butonu:
  - Modal:
    - "Åifre sıfırlama linki gÃ¶nder" seçeneği.
    - Opsiyonel: "Geçici şifre üret ve gÃ¶ster" (yalnızca admin gÃ¶rebilir).

**Kriterler:**
- ✅ Backend endpoint'ine bağlı.
- ✅ Magic link gönderimi için success mesajı ("Kullanıcıya mail gÃ¶nderildi").
- ✅ Geçici şifre üretiliyorsa, bir defaya mahsus gÃ¶sterim (kopyala butonu).

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Email gÃ¶nderim hatası - SMTP fail olursa kullanıcıya net hata mesajı.
2. ÖNERİ: "Tekrar gÃ¶nder" butonu - belirli süre sonra aktif olmalı (rate limit gÃ¶rsel feedback).
3. EDGE CASE: Geçici şifre güvenliği - modal kapandıktan sonra şifre bir daha gÃ¶sterilmemeli.
4. ÖNERİ: Åifre strength indicator - geçici şifre için bile güvenlik seviyesi gÃ¶sterimi.
5. EDGE CASE: Copy to clipboard - başarılı kopyalama için toast notification.
6. ÖNERİ: "Kullanıcıya SMS ile gÃ¶nder" alternatifi (ileride).
7. EDGE CASE: Modal açıkken sayfa yenileme - işlem kaybolur uyarısı.
-->

---

# 📋 EPIC-5 – Eğitmen Profili, Finans & Ödeme Akışları

**Amaç:** Eğitmenlerin profil bilgileri, banka hesapları, kazanç hareketleri ve çekim taleplerini yÃ¶netmek.  
**Roller:** Öğretmen, Admin, (ileride Kurum)  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4–5 gün (BE+FE)  
**Durum:** ✅ TAMAMLANDI  
**Tamamlanma Tarihi:** 2025-02-XX

---

## 📊 Genel Durum

- **Toplam Task:** 11/11 ✅
- **Backend:** 6/6 ✅
- **Frontend:** 5/5 ✅
- **Tamamlanma:** 100%

---

## 🔴 BACKEND TASKS – EPIC-5

### [EP5-BE-01] Eğitmen Genişletilmiş Profil Alanları

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- `User` veya ayrı `TeacherProfile` modeli üzerinden aşağıdaki alanları ekle:
  - Uzmanlık Alanları (string / tags).
  - Biyografi (text).
  - Sosyal medya linkleri:
    - LinkedIn, Twitter, Instagram, Kişisel Website.
  - Profil resmi (image path) – mevcutsa.

**Kriterler:**
- ✅ Pydantic şemalarında bu alanları expose et.
- ✅ Validation:
  - URL alanları için basit URL kontrolü.
  - Uzmanlık alanları için max length / tag sayısı sınırı.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Profil resmi boyut ve format kontrolü - max 5MB, sadece jpg/png/webp.
2. EDGE CASE: Biyografi için XSS sanitization - HTML tag'leri strip edilmeli.
3. EDGE CASE: Sosyal medya URL'leri için domain whitelist - sadece linkedin.com, twitter.com vb. kabul et.
4. ÖNERİ: `display_name` alanı - ad soyad yerine özel görünen isim tercih edebilir.
5. EDGE CASE: Uzmanlık alanları için predefined tag listesi mi yoksa free text mi? SEO ve search için standardize tags daha iyi.
6. ÖNERİ: `is_profile_public` flag - öğretmen profilinin public course sayfasında gÃ¶sterilip gÃ¶sterilmeyeceği.
7. EDGE CASE: Telefon numarası formatı - uluslararası format desteği (+90, +1 vb.).
-->

---

### [EP5-BE-02] Eğitmen Profil Güncelleme Endpoint'leri

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Endpoint'ler:
  - `GET /api/v1/teachers/me/profile`
  - `PUT /api/v1/teachers/me/profile`
- Öğretmen kendi profilini güncelleyebilmeli (ad, soyad, telefon, biyografi, sosyal medya, uzmanlık alanları, avatar).

**Kriterler:**
- ✅ Auth: teacher veya admin.
- ✅ Admin, ayrı bir endpoint üzerinden (`/api/v1/admin/teachers/{id}`) aynı alanları güncelleyebilmeli.
- ✅ Profil resmi upload'ı için mevcut file upload altyapısı kullanılmalı (veya yeni endpoint).

**API Spesifikasyonu (özet):**

```http
GET /api/v1/teachers/me/profile
Authorization: Bearer <token>
```

```json
// 200 OK
{
  "id": "uuid",
  "first_name": "Hakan",
  "last_name": "Er",
  "email": "hakan@mail.com",
  "phone": "05330001111",
  "bio": "Web geliştirme uzmanı",
  "expertise_tags": ["HTML", "CSS", "JS", "PHP"],
  "avatar_url": "https://cdn.bihocam.com/avatars/....jpg",
  "social_links": {
    "linkedin": "http://linkedin.com/hakan",
    "twitter": "http://twitter.com/hakan",
    "instagram": "https://www.instagram.com/hakan",
    "website": "https://hakan.dev"
  },
  "status": "active",
  "email_verified": true
}
```

```http
PUT /api/v1/teachers/me/profile
Content-Type: application/json
Authorization: Bearer <token>
```

```json
// Body (partial allowed)
{
  "first_name": "Hakan",
  "last_name": "Er",
  "phone": "05330001111",
  "bio": "Web geliştirme uzmanı",
  "expertise_tags": ["HTML", "CSS", "JS", "PHP"],
  "social_links": {
    "linkedin": "http://linkedin.com/hakan",
    "twitter": "http://twitter.com/hakan",
    "instagram": "https://www.instagram.com/hakan",
    "website": "https://hakan.dev"
  }
}
```

```json
// 200 OK (güncellenmiş profil)
{ ...teacherProfile }
```

**Hata Durumları:**
- `400` – validation error (geçersiz URL, çok uzun bio vs.).
- `401` – yetkisiz (token yok/invalid).
- `403` – rol öğretmen değil ve admin endpoint'i kullanmıyor.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Email değişikliği - öğretmen email'ini değiştirebilir mi? Eğer evet, re-verification gerekli.
2. EDGE CASE: Partial update (PATCH) vs Full update (PUT) - hangi alanlar optional?
3. EDGE CASE: Rate limiting - profil güncellemesi spam engellemesi (Ã¶r: dakikada max 5 istek).
4. ÖNERİ: Profil değişiklik history - admin audit için hangi alanlar ne zaman değişti.
5. EDGE CASE: Avatar upload sırasında eski avatar'ın CDN'den silinmesi (orphan file cleanup).
6. EDGE CASE: Concurrent edit - öğretmen ve admin aynı anda düzenlerse conflict resolution.
7. ÖNERİ: `GET /api/v1/teachers/{id}/public-profile` - öğrenciler için public endpoint (email, telefon gizli).
-->

---

### [EP5-BE-03] Eğitmen Banka Hesap Modeli

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- `TeacherBankAccount` modeli:
  - `id`, `teacher_id`, `iban`, `bank_name`, `account_holder_name`, `is_default`, `status` (PENDING / APPROVED / REJECTED), `created_at`, `approved_at`, `rejected_at`, `review_note`.

**Kriterler:**
- ✅ Bir öğretmenin birden fazla hesabı olabilir; bir tanesi `is_default`.
- ✅ Status geçişleri sadece admin tarafından yapılmalı (PENDING → APPROVED/REJECTED).
- ✅ Sensitif datalar (iban) maskeleme için helper'lar (UI'de sadece son 4 hane gÃ¶sterecek).

> [!IMPORTANT]
> **GEMINI-COMMENT:** Türkiye'deki yasal mevzuat gereği (fatura ve vergi süreçleri), banka hesabına ek olarak eğitmenin TCKN/VKN bilgisi ve fatura adresi de `TeacherProfile` veya ayrı bir `LegalInfo` tablosunda saklanmalıdır. Ödeme yapmadan Ã¶nce bu bilgilerin doğruluğu admin tarafından onaylanmalıdır.

**Model Taslağı:**

```python
class BankAccountStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class TeacherBankAccount(Base):
    __tablename__ = "teacher_bank_accounts"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    teacher_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    bank_name = Column(String(100), nullable=False)
    iban = Column(String(34), nullable=False)  # TR için TR + 24 hane, ama generic bırakılabilir
    account_holder_name = Column(String(150), nullable=False)
    is_default = Column(Boolean, default=False)
    status = Column(Enum(BankAccountStatus), default=BankAccountStatus.PENDING, nullable=False, index=True)
    review_note = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    approved_at = Column(DateTime, nullable=True)
    rejected_at = Column(DateTime, nullable=True)
```

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: IBAN encryption - IBAN veritabanında şifrelenmiş saklanmalı (PCI-DSS benzeri güvenlik).
2. EDGE CASE: Aynı IBAN farklı öğretmenlerde kullanılabilir mi? Muhtemelen hayır - unique constraint.
3. ÖNERİ: `bank_code` alanı - banka swift/bic kodu (uluslararası transferler için).
4. EDGE CASE: Hesap holder name ile profil adı uyuşmazlığı - admin uyarısı.
5. ÖNERİ: `currency` alanı - TRY default ama ileride EUR/USD desteği için.
6. EDGE CASE: Max hesap limiti - bir öğretmen en fazla 3 banka hesabı ekleyebilir.
7. ÖNERİ: `verified_at` - IBAN doğrulama servisi entegrasyonu (ileride).
8. EDGE CASE: Default hesap silinirse - başka bir hesap otomatik default olmalı mı?
-->

---

### [EP5-BE-04] Eğitmen Banka Hesap Endpoint'leri

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Öğretmen tarafı:
  - `GET /api/v1/teachers/me/bank-accounts`
  - `POST /api/v1/teachers/me/bank-accounts` (yeni hesap ekle – status PENDING).
  - `DELETE /api/v1/teachers/me/bank-accounts/{id}` (PENDING veya REJECTED durumunda silinebilir).
- Admin tarafı:
  - `GET /api/v1/admin/teachers/bank-accounts?status=pending|approved|rejected`
  - `POST /api/v1/admin/teachers/bank-accounts/{id}/approve`
  - `POST /api/v1/admin/teachers/bank-accounts/{id}/reject`

**Kriterler:**
- ✅ IBAN format validasyonu (TR bazlı veya generic).
- ✅ Onay/red log'ları (opsiyonel: moderation log ile entegre).

**API Spesifikasyonu (özet):**

```http
GET /api/v1/teachers/me/bank-accounts
Authorization: Bearer <teacher-token>
```

```json
// 200 OK
[
  {
    "id": "uuid",
    "bank_name": "Ziraat Bankası",
    "iban_masked": "TR12 **** **** **** 1234",
    "account_holder_name": "Hakan Er",
    "is_default": true,
    "status": "approved",
    "created_at": "2025-02-01T10:23:11Z"
  }
]
```

```http
POST /api/v1/teachers/me/bank-accounts
Content-Type: application/json
Authorization: Bearer <teacher-token>
```

```json
{
  "bank_name": "Ziraat Bankası",
  "iban": "TR120006200000000123456789",
  "account_holder_name": "Hakan Er"
}
```

```json
// 201 Created
{
  "id": "uuid",
  "status": "pending",
  ...
}
```

**Hata Durumları (Ã¶rnek):**
- `400` – geçersiz IBAN formatı.
- `409` – aynı IBAN zaten mevcut.
- `403` – başka bir öğretmenin hesabına erişim denemesi.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: APPROVED hesap silinemez - aktif withdrawal varsa veya son ödeme yapılan hesapsa.
2. ÖNERİ: `set-default` endpoint - `POST /api/v1/teachers/me/bank-accounts/{id}/set-default`.
3. EDGE CASE: Reject reason zorunlu - admin neden reddettiğini belirtmeli.
4. ÖNERİ: Bulk approve - admin birden fazla hesabı tek seferde onaylayabilmeli.
5. EDGE CASE: Hesap güncelleme - APPROVED hesap güncellenirse tekrar PENDING'e mi düşmeli?
6. ÖNERİ: Notification - hesap onaylandığında/reddedildiğinde öğretmene bildirim.
7. EDGE CASE: IBAN validation servisi entegrasyonu - gerçek banka hesabı doğrulama.
8. ÖNERİ: Admin listesinde filtre - `?teacher_id=...` ile belirli öğretmenin hesapları.
-->

---

### [EP5-BE-05] Eğitmen Kazanç Hareketleri & Ödeme Log Modeli

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- `TeacherEarning` (veya `PayoutTransaction`) modeli:
  - `id`, `teacher_id`, `course_id`, `order_id`, `amount`, `currency`, `type` (EARNING / WITHDRAWAL / ADJUSTMENT), `description`, `created_at`.
- Öğretmenin kazançlarını ve çekimlerini transaction bazlı olarak tut.

**Kriterler:**
- ✅ Sipariş tamamlandığında ilgili öğretmen için EARNING kaydı üret (NOT-BE-XX sipariş entegrasyonuyla birlikte).
- ✅ Withdrawal işlemlerinde negatif hareket (WITHDRAWAL) oluştur.
- ✅ Toplam bakiye = tüm EARNING – tüm WITHDRAWAL.

> [!CAUTION]
> **GEMINI-COMMENT:** Platform komisyon oranının (Ã¶rn: %20) nereden okunacağı (global settings veya eğitmen bazlı özel oran) ve iade (`Refund`) durumunda eğitmen bakiyesinden bu tutarın nasıl düşüleceği (ADJUSTMENT kaydı mı yoksa negatif EARNING mi?) netleştirilmelidir. Ayrıca vergi kesintileri (stopaj vb.) hesaplamaya dahil edilecek mi?

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Negatif bakiye - refund sonrası bakiye negatife düşebilir mi? Nasıl handle edilecek?
2. ÖNERİ: `commission_rate` alanı - öğretmen bazlı özel komisyon oranı (VIP eğitmenler için).
3. EDGE CASE: Kısmi refund - 100 TL'lik satıştan 50 TL iade edilirse kazanç nasıl hesaplanır?
4. ÖNERİ: `net_amount` ve `gross_amount` ayrımı - komisyon Ã¶ncesi ve sonrası tutarlar.
5. EDGE CASE: Currency conversion - farklı para birimleriyle ödeme yapılırsa exchange rate.
6. ÖNERİ: `reference_id` alanı - harici sistemlerle entegrasyon için (muhasebe yazılımı).
7. EDGE CASE: Transaction immutability - oluşturulan kayıtlar değiştirilemez olmalı (audit trail).
8. ÖNERİ: Monthly/yearly summary endpoint - dÃ¶nemsel kazanç özeti.
-->

---

### [EP5-BE-06] Ã‡ekim Talebi (Withdrawal Request) Modeli & Endpoint'leri

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- Model: `WithdrawalRequest`
  - `id`, `teacher_id`, `bank_account_id`, `amount`, `status` (PENDING / APPROVED / REJECTED / PAID), `requested_at`, `processed_at`, `admin_note`.
- Endpoint'ler:
  - Öğretmen:
    - `GET /api/v1/teachers/me/withdrawals`
    - `POST /api/v1/teachers/me/withdrawals` (yeni talep – yeterli bakiye kontrolü).
  - Admin:
    - `GET /api/v1/admin/withdrawals?status=...`
    - `POST /api/v1/admin/withdrawals/{id}/approve`
    - `POST /api/v1/admin/withdrawals/{id}/mark-paid`
    - `POST /api/v1/admin/withdrawals/{id}/reject`

**Kriterler:**
- ✅ Bakiye kontrolü: talep edilen `amount` mevcut withdrawable bakiyeden fazla olamaz.
- ✅ Status transition matrix net olmalı (PENDING → APPROVED → PAID vs).

> [!CAUTION]
> **GEMINI-COMMENT:** Ã‡ekim talepleri için "Minimum Ã‡ekim Tutarı" (Ã¶rn: 500 TL) kontrolü eklenmelidir. Ayrıca, eğitmenin hesabı onaylı değilse veya email doğrulaması yapmamışsa çekim talebi oluşturması backend seviyesinde engellenmelidir. `admin_note` alanının `REJECTED` durumunda zorunlu olması sağlanmalıdır.

**Model Taslağı:**

```python
class WithdrawalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    PAID = "paid"


class WithdrawalRequest(Base):
    __tablename__ = "withdrawal_requests"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    teacher_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    bank_account_id = Column(UUID(as_uuid=False), ForeignKey("teacher_bank_accounts.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(WithdrawalStatus), default=WithdrawalStatus.PENDING, nullable=False, index=True)
    admin_note = Column(Text, nullable=True)
    requested_at = Column(DateTime, server_default=func.now())
    processed_at = Column(DateTime, nullable=True)
```

**Örnek Akış (Teacher):**

```http
POST /api/v1/teachers/me/withdrawals
Authorization: Bearer <teacher-token>
Content-Type: application/json
```

```json
{
  "bank_account_id": "uuid",
  "amount": 1500.00
}
```

```json
// 201 Created
{
  "id": "wrq_123",
  "status": "pending",
  "amount": 1500.0,
  "requested_at": "2025-02-05T12:00:00Z"
}
```

**Örnek Akış (Admin onay):**

```http
POST /api/v1/admin/withdrawals/wrq_123/approve
Authorization: Bearer <admin-token>
Content-Type: application/json
```

```json
{
  "admin_note": "Ödeme hazırlanıyor, 3 iş günü içinde hesapta olacak."
}
```

```json
// 200 OK
{
  "id": "wrq_123",
  "status": "approved",
  "processed_at": "2025-02-05T12:10:00Z"
}
```

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Concurrent withdrawal - aynı anda iki talep oluşturulursa race condition (DB lock gerekli).
2. ÖNERİ: `expected_payment_date` alanı - tahmini ödeme tarihi (SLA bilgisi).
3. EDGE CASE: Banka hesabı REJECTED/PENDING iken çekim talebi engellensin.
4. ÖNERİ: Withdrawal iptal - PENDING durumundaki talep öğretmen tarafından iptal edilebilmeli.
5. EDGE CASE: Partial withdrawal - bakiyenin bir kısmını çekme (tam bakiye zorunlu olmasın).
6. ÖNERİ: Recurring withdrawal - otomatik aylık çekim talebi oluşturma özelliği.
7. EDGE CASE: Bank transfer failed - PAID durumundaki talep başarısız olursa rollback.
8. ÖNERİ: Receipt/dekont upload - admin ödeme dekontu yükleyebilmeli (kanıt olarak).
9. EDGE CASE: Fraud detection - anormal çekim pattern'leri için alert sistemi.
-->

---

## ğŸ¨ FRONTEND TASKS – EPIC-5

### [EP5-FE-01] Eğitmen Profil Düzenleme Formu (Öğretmen Paneli)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- Var olan `dashboard/settings` veya yeni bir `/dashboard/teacher/profile` sayfasında:
  - Ad, Soyad, E-posta (readonly veya değiştirilebilir), Telefon.
  - Uzmanlık Alanları (tag input).
  - Biyografi (textarea).
  - Profil Resmi (avatar upload + preview).
  - Sosyal medya linkleri (LinkedIn, Twitter, Instagram, Website).

**Kriterler:**
- ✅ Teal/orange temaya uygun modern form.
- ✅ URL alanları için inline validation.
- ✅ Değişiklik sonrası üst kısımda "Profiliniz güncellendi" alert'i.

**UI Spesifikasyonu (özet):**
- Layout:
  - Sol: Avatar + isim kartı.
  - Sağ: Form (iki kolonlu grid, mobilde tek kolon).
- Field grupları:
  - **Kimlik:** Ad, Soyad, E-posta (readonly), Telefon.
  - **Profil:** Uzmanlık Alanları (tag input), Biyografi (3–5 satır).
  - **Sosyal Medya:** LinkedIn, Twitter, Instagram, Website.
- Aksiyonlar:
  - "Kaydet" (primary) – loading state + disabled.
  - "Değişiklikleri Sıfırla" (secondary, opsiyonel).

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Avatar crop/resize - yüklenen resim otomatik kırpılmalı/boyutlandırılmalı.
2. ÖNERİ: Avatar preview - yüklemeden Ã¶nce Ã¶nizleme gÃ¶ster.
3. EDGE CASE: Tag input - duplicate tag eklenmesini engelle, max 10 tag limiti.
4. ÖNERİ: Auto-save draft - form değişiklikleri otomatik kaydedilsin (localStorage).
5. EDGE CASE: URL validation feedback - geçersiz URL anında kırmızı border + hata mesajı.
6. ÖNERİ: Character counter - biyografi için kalan karakter sayısı (max 500).
7. EDGE CASE: Mobile responsive - avatar upload mobilde de düzgün çalışmalı.
8. ÖNERİ: Profile completion percentage - "Profiliniz %80 tamamlandı" gibi motivasyon.
-->

---

### [EP5-FE-02] Admin Eğitmen Detay & Profil Yönetimi

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Sayfa: `/dashboard/admin/teachers/{teacherId}`
- Sekmeler:
  - Profil Bilgileri (admin düzenleyebilir).
  - Banka Hesapları.
  - Kazanç Özeti (toplam kazanç, bekleyen çekimler vs).

**Kriterler:**
- ✅ Öğretmen profil formunu admin tarafında da yeniden kullan (readonly / editable alanlar).
- ✅ Banka hesaplarında status badge'leri ve onay/red butonları.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. ÖNERİ: Tab navigation - Profil / Banka Hesapları / Kazançlar / Ã‡ekim Talepleri sekmeli yapı.
2. EDGE CASE: Admin düzenlemesi bildirimi - öğretmene "Admin profilinizi güncelledi" notification.
3. ÖNERİ: Öğretmen istatistikleri - toplam satış, ortalama puan, kurs sayısı gibi metriklere hızlı erişim.
4. EDGE CASE: Banka hesabı bulk approve - checkbox ile seçip toplu onaylama.
5. ÖNERİ: Öğretmen notları - admin'in öğretmen hakkında internal not bırakabilmesi.
6. EDGE CASE: Profil karşılaştırma - "Önceki değerler" ile yan yana gÃ¶rüntüleme.
7. ÖNERİ: Quick actions - "Tüm kursları gÃ¶r", "Mesaj gÃ¶nder" gibi kısayollar.
-->

---

### [EP5-FE-03] Eğitmen Banka Hesapları UI (Öğretmen)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Sayfa: `/dashboard/teacher/bank-accounts`
- Liste:
  - Banka adı + maskelemiş IBAN, durum (Beklemede / Onaylandı / Reddedildi), default flag, oluşturulma tarihi.
- İşlemler:
  - Yeni hesap ekle (form modal).
  - PENDING/REJECTED hesapları sil.

**Kriterler:**
- ✅ IBAN input'ta format helper (boşluklarla gÃ¶sterim).
- ✅ Status'a gÃ¶re renkli badge.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: IBAN copy butonu - maskelenmiş IBAN'ı tam olarak kopyalama (güvenlik riski?).
2. ÖNERİ: Bank logo/icon - banka adına gÃ¶re gÃ¶rsel (Ziraat, Garanti vb. logoları).
3. EDGE CASE: Empty state - "Henüz banka hesabı eklenmedi" + CTA butonu.
4. ÖNERİ: IBAN validation real-time - yazarken format kontrolü ve uyarı.
5. EDGE CASE: Confirmation modal - hesap silme Ã¶ncesi "Emin misiniz?" kontrolü.
6. ÖNERİ: "Varsayılan Yap" butonu - her satırda default ayarlama kolaylığı.
7. EDGE CASE: REJECTED hesap - red sebebi gÃ¶rünür olmalı (tooltip veya expandable row).
8. ÖNERİ: Success feedback - hesap eklendikten sonra "Onay bekleniyor" bilgisi.
-->

---

### [EP5-FE-04] Eğitmen Kazanç Hareketleri & Bakiye Ekranı

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- Sayfa: `/dashboard/teacher/earnings`
- Üstte özet kartlar:
  - Toplam Kazanç, Ã‡ekilebilir Bakiye, Bekleyen Ã‡ekim Talebi, Bu Ay Kazanç.
- Altta transaction tablosu:
  - Tarih, Tip (Kazanç / Ã‡ekim / Düzeltme), Tutar, Açıklama, İlgili Kurs/Sipariş linki.

**Kriterler:**
- ✅ Filtreleme (tarih aralığı, tip).
- ✅ Currency formatlama.

> [!TIP]
> **GEMINI-COMMENT:** Kazançlar ekranında rakamların `intl.NumberFormat` ile (Ã¶rn: 1.500,00 â‚º) doğru formatlanması çok kritiktir. Ayrıca bu tablodaki verilerin "Excel/CSV olarak indir" butonu ile dışarı aktarılabilmesi eğitmenler için Ã¶nemli bir ihtiyaç olacaktır.

**UI Spesifikasyonu (özet):**
- Üstte 3–4 adet stat kartı:
  - "Toplam Kazanç", "Ã‡ekilebilir Bakiye", "Bekleyen Ã‡ekim Talepleri", "Bu Ay Kazanç".
- Altında tablo:
  - Kolonlar: Tarih, Tip (Kazanç / Ã‡ekim / Düzeltme), Açıklama, Tutar, İlgili Kurs/Sipariş (link).
  - Tip'e gÃ¶re renk kodlu etiket (Kazanç yeşil, Ã‡ekim kırmızı vb.).
- Filtre bar:
  - Tarih aralığı picker.
  - Tip dropdown (All / Earning / Withdrawal / Adjustment).

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. ÖNERİ: Grafik/chart - aylık kazanç trendi line chart ile gÃ¶rselleştirme.
2. EDGE CASE: Negatif bakiye gÃ¶sterimi - kırmızı renk ve uyarı ikonu.
3. ÖNERİ: "Ã‡ekilebilir Bakiye" açıklaması - tooltip ile "Bekleyen ödemeler dahil değil" bilgisi.
4. EDGE CASE: Ã‡ok uzun transaction list - virtual scroll veya lazy loading.
5. ÖNERİ: Kurs bazlı breakdown - hangi kurstan ne kadar kazanıldı özeti.
6. EDGE CASE: Date range max limit - çok geniş tarih aralığı performans sorununa yol açabilir.
7. ÖNERİ: Print-friendly view - kazanç raporu yazdırılabilir format.
8. EDGE CASE: Zero state - "Bu dÃ¶nemde kazanç bulunmuyor" mesajı.
-->

---

### [EP5-FE-05] Ã‡ekim Talebi Ekranı (Öğretmen) & Yönetimi (Admin)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:**
- Öğretmen:
  - `/dashboard/teacher/withdrawals`:
    - Bakiye özet + "Yeni Ã‡ekim Talebi" butonu.
    - Modal: banka hesabı seç, tutar gir, özet gÃ¶ster.
    - Altta talep geçmişi tablosu (status, amount, dates).
- Admin:
  - `/dashboard/admin/withdrawals`:
    - Tüm çekim taleplerinin listesi.
    - Filtre: status, öğretmen, tarih.
    - İşlemler: onayla, Ã¶denecek olarak işaretle (PAID), reddet (admin notu zorunlu).

**Kriterler:**
- ✅ Duruma gÃ¶re renkli badge + ikonlar (bekliyor, Ã¶dendi, reddedildi).
- ✅ Onay / red için confirmation modal + admin note alanı.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Ã‡ekim tutarı validation - bakiyeden fazla tutar girilememeli (real-time check).
2. ÖNERİ: Suggested amounts - "100 TL", "500 TL", "Tümünü Ã‡ek" gibi hızlı seçenekler.
3. EDGE CASE: No approved bank account - çekim talebi oluşturulamaz uyarısı + hesap ekleme linki.
4. ÖNERİ: Talep takip numarası - kolay referans için WD-2024-001 gibi format.
5. EDGE CASE: Admin toplu işlem - birden fazla talebi tek seferde onaylama.
6. ÖNERİ: Status timeline - talebin hangi aşamalardan geçtiği gÃ¶rsel akış.
7. EDGE CASE: Duplicate request prevention - aynı anda birden fazla PENDING talep engellensin.
8. ÖNERİ: Estimated arrival - "Tahmini hesabınıza geçiş: 3 iş günü" bilgisi.
9. EDGE CASE: Cancel button - öğretmen PENDING talebi iptal edebilmeli.
-->

---

# 📋 EPIC-6 – Siparişler & Kupon Yönetimi (Admin)

**Amaç:** Admin'in tüm siparişleri görebildiği ve kupon/indirim kampanyalarını merkezi olarak yönettiği bir modül.  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3–4 gün

---

## 🔴 BACKEND TASKS – EPIC-6

### [EP6-BE-01] Global Sipariş Listeleme Endpoint'i (Admin)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Mevcut `orders` endpoint'i sadece kendi siparişlerini döküyor; admin için:
  - `GET /api/v1/admin/orders`
- Response:
  - Sipariş id, kullanıcı bilgisi, toplam tutar, ödeme durumu, ödeme tarihi, kupon bilgisi vs.

**Kriterler:**
- ✅ Filtreler:
  - `?status=paid|pending|failed`
  - `?q=` (kullanıcı email/isim araması)
  - `?date_from=&date_to=`
- ✅ Eager load: user, order_items, course, categories, lessons.
- **Not:** Eager loading hatası düzeltildi - categories ve lessons relationship'leri eager load ediliyor.

> [!CAUTION]
> **GEMINI-COMMENT:** Admin'in siparişi manuel olarak `CANCELLED` veya `REFUNDED` durumuna çekebileceği bir aksiyon eklenmelidir. Bu işlem yapıldığında (özellikle iadelerde), eğitmen bakiyesinden ilgili tutarın düşülmesi (EP5-BE-05 entegrasyonu) ve öğrencinin kursa erişiminin kapatılması otomatik olarak tetiklenmelidir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Sipariş detay endpoint - `GET /api/v1/admin/orders/{id}` ile tüm order_items ve ödeme detayları.
2. ÖNERİ: Export endpoint - `GET /api/v1/admin/orders/export?format=csv` ile sipariş raporu.
3. EDGE CASE: Partial refund - siparişin sadece bir kısmı iade edilebilir mi?
4. ÖNERİ: Order timeline - siparişin durum değişiklik geçmişi (created → paid → refunded).
5. EDGE CASE: Payment provider reference - Iyzico/Stripe transaction ID ile eşleştirme.
6. ÖNERİ: `?teacher_id=` filtresi - belirli eğitmenin kurslarına ait siparişler.
7. EDGE CASE: Free orders (kuponla %100 indirim) - ödeme durumu farklı handle edilmeli.
8. ÖNERİ: Revenue analytics - toplam gelir, ortalama sipariş tutarı gibi aggregation endpoint.
-->

---

### [EP6-BE-02] Kupon Modeli & CRUD Endpoint'leri

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:**
- Model: `Coupon`
  - `id`, `code` (unique), `name`, `description`, `discount_type` (PERCENTAGE|FIXED), `discount_value`, `min_amount`, `max_discount_amount`, `usage_limit_total`, `usage_limit_per_user`, `used_count`, `starts_at`, `expires_at`, `status` (ACTIVE|EXPIRED|DISABLED), `created_at`.

**Endpoint'ler:**
- Admin:
  - `GET /api/v1/admin/coupons`
  - `GET /api/v1/admin/coupons/{id}`
  - `POST /api/v1/admin/coupons`
  - `PUT /api/v1/admin/coupons/{id}`
  - `DELETE /api/v1/admin/coupons/{id}` (soft disable)

**Kriterler:**
- ✅ Hem yüzde hem sabit TL desteği.
- ✅ Kullanım limitleri (toplam ve kişi başı) backend'de enforce edilmeli.
- ✅ Kupon geçerlilik kontrolü sipariş oluşturma/checkout akışına entegre edilmeli.

> [!IMPORTANT]
> **GEMINI-COMMENT:** Kupon modeline "Belirli kurslar" veya "Belirli kategoriler" kısıtlaması eklenmesi (Many-to-Many ilişki) pazarlama kampanyaları için çok Ã¶nemlidir. Aksi takdirde kupon tüm sitede geçerli olur ve bu da karlılığı olumsuz etkileyebilir. Ayrıca `min_amount` kontrolü sepetteki toplam tutar üzerinden her zaman yapılmalıdır.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Kupon kodu case-insensitive - "INDIRIM20" ve "indirim20" aynı olmalı.
2. ÖNERİ: `first_purchase_only` flag - sadece ilk alışverişte geçerli kuponlar.
3. EDGE CASE: Kupon stacking - birden fazla kupon aynı anda kullanılabilir mi? (genellikle hayır)
4. ÖNERİ: `auto_apply` flag - belirli koşullarda otomatik uygulanan kuponlar (sepet tutarı X üzerindeyse).
5. EDGE CASE: Expired coupon validation - checkout sırasında expire olmuşsa hata mesajı.
6. ÖNERİ: Coupon analytics - hangi kupon ne kadar kullanıldı, toplam indirim tutarı.
7. EDGE CASE: Duplicate code prevention - aynı kod başka kupon için kullanılamaz.
8. ÖNERİ: `user_group_restriction` - sadece belirli kullanıcı gruplarına özel kuponlar.
9. EDGE CASE: Kupon silinirse - aktif kullanımlarda ne olacak? Soft delete tercih edilmeli.
-->

---

### [EP6-BE-03] Sipariş Detay & İade (Refund) Endpoint

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 2 saat

**Açıklama:**
- Sipariş detay ve iade işlemi için iki yeni admin endpoint:
  - `GET /api/v1/admin/orders/{id}` – Sipariş detayı: order_items, kullanıcı bilgisi, ödeme bilgisi, kupon, timeline.
  - `POST /api/v1/admin/orders/{id}/refund` – Sipariş iadesi: tam veya kısmi iade, eğitmen bakiyesinden düşme, öğrenci kurs erişimini kapatma.

**Kriterler:**
- ✅ Sipariş detayında tüm order_items, course bilgileri ve payment detayları eager-load edilmeli.
- ✅ Refund işlemi sırasında: eğitmen bakiyesinden ilgili tutar düşülmeli (EP5-BE-05 entegrasyonu).
- ✅ İade sonrası öğrencinin kursa erişimi otomatik kapatılmalı (enrollment deaktif).
- ✅ Order timeline: sipariş durum değişiklik geçmişi (created → paid → refunded) kaydedilmeli.
- ✅ Partial refund desteği: siparişin sadece belirli kalemleri iade edilebilmeli.

**Değişecek dosyalar:**
- `backend/app/api/v1/endpoints/orders.py`
- `backend/app/api/v1/router.py`

---

### [EP6-BE-04] Admin Kupon CRUD Endpoint'leri

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 2 saat

**Açıklama:**
- Mevcut `coupons.py`'da sadece `validate` endpoint'i var; admin için tam CRUD eklenmeli:
  - `GET /api/v1/admin/coupons` – Filtreleme: status, code arama, tarih aralığı.
  - `GET /api/v1/admin/coupons/{id}` – Kupon detayı + kullanım istatistikleri.
  - `POST /api/v1/admin/coupons` – Yeni kupon oluşturma.
  - `PUT /api/v1/admin/coupons/{id}` – Kupon güncelleme.
  - `DELETE /api/v1/admin/coupons/{id}` – Soft disable (status → DISABLED).

**Kriterler:**
- ✅ Kupon kodu case-insensitive unique kontrolü.
- ✅ Kullanım limitleri (toplam ve kişi başı) enforce edilmeli.
- ✅ Kupon kullanım istatistikleri: kaç kez kullanıldı, toplam indirim tutarı.
- ✅ Expired kuponları otomatik EXPIRED durumuna çekmek için logic.
- **Not:** Timezone hatası düzeltildi - update endpoint'inde timezone-aware datetime'lar naive'e çevriliyor.

**Değişecek dosyalar:**
- `backend/app/api/v1/endpoints/coupons.py`
- `backend/app/api/v1/router.py`

---

## ğŸ¨ FRONTEND TASKS – EPIC-6

### [EP6-FE-01] Admin Siparişler Listesi

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Sayfa: `/dashboard/admin/orders`
- Tablo kolonları:
  - Sipariş No, Kullanıcı, Toplam Tutar, Ödeme Durumu, Tarih, Kullanılan Kupon, İşlemler (detay).

**Kriterler:**
- ✅ Detay sayfasına link.
- ✅ Filtre paneli (tarih aralığı, ödeme durumu, kullanıcı arama).
- **Not:** Tasarım tamamen yenilendi - glassmorphism, gradient hero header (teal-emerald), modern stats cards, improved filters, better table design.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. ÖNERİ: Sipariş detay modal/drawer - liste üzerinde hızlı Ã¶nizleme.
2. EDGE CASE: Refund butonu - sadece "paid" durumundaki siparişlerde gÃ¶rünür.
3. ÖNERİ: Order summary stats - üstte toplam sipariş sayısı, toplam ciro kartları.
4. EDGE CASE: Ã‡ok uzun kurs listesi - sipariş içinde 5+ kurs varsa expandable gÃ¶sterim.
5. ÖNERİ: Quick actions - "İade Et", "Fatura GÃ¶nder", "Kullanıcıya Mesaj" butonları.
6. EDGE CASE: Date picker timezone - UTC/local time dönüşümü doğru yapılmalı.
7. ÖNERİ: Saved filters - sık kullanılan filtre kombinasyonlarını kaydetme.
8. EDGE CASE: Export loading - büyük veri setlerinde export progress indicator.
-->

---

### [EP6-FE-02] Kupon Yönetimi Sayfası (Liste + Create/Edit)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3–4 saat

**Açıklama:**
- Sayfa: `/dashboard/admin/coupons`
- Tasarım:
  - Üstte "Kuponlar (3)" benzeri bir başlık.
  - Tablo:
    - Kupon kodu, Adı, İndirim (tip + değer), Kullanım (Ã¶rn. 0/100, kişi başı: 1), Geçerlilik (başlangıç/bitiş), Durum (Aktif / Süresi Dolmuş / Pasif), İşlemler (gÃ¶z at, düzenle, pasif et, sil).
- Aynı sayfada create/edit için slide-over veya modal:
  - Alanlar: code, name, description, discount_type, discount_value, min_amount, max_discount_amount, usage_limit_total, usage_limit_per_user, starts_at, expires_at, status.

**Kriterler:**
- ✅ Durumlara gÃ¶re renkli badge (Ã¶rneğin: Aktif — yeşil, Süresi Dolmuş — kırmızı).
- ✅ Kullanım sayıları (used_count / usage_limit_total) progress bar ile gÃ¶sterilebilir.
- ✅ Form validation (negatif olmayan rakamlar, tarih aralığı mantıklı vs.).
- **Not:** 
  - Form tasarımı tamamen yenilendi: bölümlendirilmiş form (Temel Bilgiler, İndirim Detayları, Kullanım ve Tarih, Ek Bilgiler), icon'lu inputs, gradient header, better UX.
  - Kupon listesi: gradient header, detailed card design with usage progress bars, status badges, kalan gün gösterimi, improved visual hierarchy.

> [!TIP]
> **GEMINI-COMMENT:** Kupon listesinde her kuponun "Toplam Getirdiği Ciro" bilgisinin gÃ¶sterilmesi admin için çok değerli bir veri olacaktır. Ayrıca kupon kodunun büyük harfe otomatik dÃ¶nüştürülmesi (AUTO-CAPS) kullanıcı deneyimini iyileştirir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. ÖNERİ: Kupon kodu generator - rastgele benzersiz kod üretme butonu.
2. EDGE CASE: Percentage 100% - ücretsiz kurs için max_discount_amount kontrolü.
3. ÖNERİ: Kupon preview - oluşturmadan Ã¶nce "Bu kupon X TL'lik alışverişte Y TL indirim sağlar" özeti.
4. EDGE CASE: Date validation - bitiş tarihi başlangıç tarihinden Ã¶nce olamaz.
5. ÖNERİ: Duplicate coupon - mevcut kuponu kopyalayarak yeni oluşturma.
6. EDGE CASE: Usage limit reached - limite ulaşan kupon otomatik DISABLED olmalı mı?
7. ÖNERİ: Coupon sharing - kupon linkini kopyalama butonu (affiliate için).
8. EDGE CASE: Negative values prevention - discount_value negatif olamaz.
9. ÖNERİ: Bulk create - CSV ile toplu kupon oluşturma (kampanya kodları için).
-->

---

### [EP6-FE-03] Admin Sipariş Detay Modal/Sayfası

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- Sayfa: `/dashboard/admin/orders/[id]`
- Sipariş detay gÃ¶rünümü:
  - Sipariş bilgileri: sipariş no, tarih, toplam tutar, ödeme durumu, ödeme yÃ¶ntemi.
  - Kullanıcı bilgileri: isim, email, telefon (tıklanabilir profil linki).
  - Sipariş kalemleri: kurs adı, eğitmen, fiyat, indirim (tablo).
  - Kupon bilgisi: kullanılan kupon kodu ve indirim tutarı.
  - Sipariş timeline: durum değişiklik geçmişi (created → paid → refunded vb.).
  - İade butonu: sadece "paid" durumundaki siparişlerde gÃ¶rünür, onay modal'ı ile.

**Kriterler:**
- ✅ İade butonu tıklandığında onay modal'ı açılmalı (iade nedeni + onay).
- ✅ Timeline bileşeni: her durum değişikliği tarih ve admin bilgisi ile gÃ¶sterilmeli.
- ✅ Responsive tasarım: mobilde de düzgün gÃ¶rünmeli.
- **Not:** Tasarım iyileştirildi - timeline component, refined layout, better information hierarchy, modern card design.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/dashboard/admin/orders/[id]/page.tsx` (yeni)

---

### [EP6-FE-04] Öğretmen Satış Takibi Sayfası

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- Sayfa: `/dashboard/teacher/sales`
- Eğitmenin kendi kurslarına ait satış bilgilerini gÃ¶rebildiği sayfa:
  - Üstte KPI kartları: toplam satış adedi, toplam gelir, bu ay gelir, ortalama sipariş tutarı.
  - Satış tablosu: tarih, kurs adı, öğrenci, tutar, komisyon, net kazanç, durum.
  - Filtreleme: tarih aralığı, kurs seçimi, durum (paid/refunded).

**Kriterler:**
- ✅ Sadece eğitmenin kendi kurslarına ait satışlar gÃ¶rünmeli.
- ✅ Komisyon oranı ve net kazanç hesaplaması gÃ¶sterilmeli.
- ✅ Tarih aralığı filtresi ile satışları daraltabilme.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/dashboard/teacher/sales/page.tsx` (yeni)
- `frontend/src/lib/api.ts` (teacher sales endpoint)

---

### [EP6-FE-05] Sidebar Navigation + API Client Güncelleme (EPIC-6)

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Sidebar güncellemesi:
  - Admin sidebar'a "Siparişler" ve "Kuponlar" menü Ã¶ğeleri eklenmeli (Finansal grubu altına).
  - Öğretmen sidebar'a "Satışlarım" menü Ã¶ğesi eklenmeli.
- API client güncelleme:
  - `api.ts`'e admin sipariş detay, refund, kupon CRUD endpoint'leri eklenmeli.
  - `ordersApi.getDetail(id)`, `ordersApi.refund(id, data)` fonksiyonları.
  - `couponsApi.list()`, `couponsApi.create()`, `couponsApi.update()`, `couponsApi.delete()` fonksiyonları.

**Kriterler:**
- ✅ Sidebar menü Ã¶ğeleri doğru gruplama ve ikonlarla eklenmiş olmalı.
- ✅ API client fonksiyonları TypeScript tip güvenliğiyle tanımlanmış olmalı.
- ✅ Mevcut sidebar yapısına uyumlu şekilde entegre edilmeli.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/layout.tsx`
- `frontend/src/lib/api.ts`

---

# 📋 EPIC-7 – Öğrenciler, Yorumlar & Moderasyon

**Amaç:** Admin'in öğrencileri, yorumları ve içerik moderasyonunu merkezi bir panelden yönetmesi.  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3–4 gün

---

## 🔴 BACKEND TASKS – EPIC-7

### [EP7-BE-01] Global Öğrenci Listeleme & Detay Endpoint'leri

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Bazı kısımlar EPIC-4 kullanıcı yönetimi ile overlap eder; burada **student** rolüne özel görünümler:
  - `GET /api/v1/admin/students`
  - `GET /api/v1/admin/students/{id}` – kayıtlı kurslar, ilerleme özetleri, sipariş sayısı vs.

**Kriterler:**
- ✅ Öğrencinin enrollments ve orders bilgilerini eager-load edecek hafif özet şemalar.
- ✅ EPIC-4'teki user detay endpoint'i ile reuse edilebilir yapı.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. ÖNERİ: `completion_rate` hesaplama - öğrencinin kurs tamamlama oranı.
2. EDGE CASE: Öğrenci → öğretmen dönüşümü - aynı kullanıcı hem öğrenci hem öğretmen olabilir.
3. ÖNERİ: `last_activity_at` - son video izleme, quiz çözme vb. aktivite tarihi.
4. ÖNERİ: Student segments - "Aktif", "Pasif", "Churn riski" gibi otomatik segmentasyon.
5. EDGE CASE: Öğrenci silme - enrollments ve progress kayıtları ne olacak?
6. ÖNERİ: Lifetime value (LTV) - öğrencinin toplam harcama tutarı.
7. EDGE CASE: Duplicate student check - aynı email ile birden fazla hesap.
8. ÖNERİ: Student notes - admin'in öğrenci hakkında internal not bırakabilmesi.
-->

---

### [EP7-BE-02] Yorum Moderasyon Modeli Genişletmesi

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Mevcut `CourseReview` modeline:
  - `is_approved` (bool, default: False)
  - `approved_at`
  - `approved_by_admin_id` (nullable)
  - `moderation_note` (opsiyonel)

**Kriterler:**
- ✅ Yeni yorumlar default olarak `is_approved=False` olmalı.
- ✅ Public course detail endpoint'leri sadece `is_approved=True` yorumları döndürmeli.

> [!CAUTION]
> **GEMINI-COMMENT:** Bir yorum onaylandığında veya reddedildiğinde, ilgili kursun `average_rating` değerinin (ve eğitmenin toplam puanının) asenkron veya senkron olarak yeniden hesaplanması (`Recalculate Rating`) mekanizması kurulmalıdır. Sadece approved yorumlar puana etki etmelidir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Spam detection - otomatik spam tespiti için keyword filter veya ML model.
2. ÖNERİ: `rejection_reason` enum - "Spam", "Uygunsuz içerik", "Alakasız", "Diğer" gibi kategoriler.
3. EDGE CASE: Aynı kullanıcı aynı kursa birden fazla yorum yapabilir mi? (genellikle hayır)
4. ÖNERİ: Review edit history - yorum düzenlendiğinde Ã¶nceki versiyonlar saklanmalı.
5. EDGE CASE: Profanity filter - küfürlü yorumlar otomatik flaglenmeli.
6. ÖNERİ: Verified purchase badge - satın alan kullanıcıların yorumları işaretli.
7. EDGE CASE: Rating without comment - sadece yıldız puanı verilebilir mi?
8. ÖNERİ: Helpful votes - "Bu yorum faydalı mıydı?" mekanizması.
-->

---

### [EP7-BE-03] Yorum Moderasyon Endpoint'leri

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Admin:
  - `GET /api/v1/admin/reviews?status=pending|approved|rejected`
  - `POST /api/v1/admin/reviews/{id}/approve`
  - `POST /api/v1/admin/reviews/{id}/reject`
  - `DELETE /api/v1/admin/reviews/{id}` (tamamen sil).

**Kriterler:**
- ✅ Onay/ret sırasında optional admin notu.
- ✅ Onaylanmamış yorumlar öğrencinin kendi panelinde "onay bekliyor" şeklinde gÃ¶sterilebilir (ileride FE task).

> [!TIP]
> **GEMINI-COMMENT:** Admin'in bir yoruma "Admin Yanıtı" (Reply) bırakabilmesi hem moderasyon hem de topluluk yönetimi için Ã¶nemlidir. Ayrıca öğrencinin daha Ã¶nce onaylanmış yorumunu düzenlemesi durumunda, yorumun tekrar `is_approved=False` statüsüne düşüp moderasyon sırasına girmesi (Re-moderation) sağlanmalıdır.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Bulk moderation - birden fazla yorumu tek seferde onaylama/reddetme.
2. ÖNERİ: Auto-approve threshold - 5 yıldız yorumlar otomatik onaylanabilir mi?
3. EDGE CASE: Yorum silme - hard delete mi soft delete mi? İstatistikler etkilenir.
4. ÖNERİ: Teacher reply - eğitmenin kendi kursundaki yorumlara cevap vermesi.
5. EDGE CASE: Report mechanism - öğrencilerin uygunsuz yorumları raporlaması.
6. ÖNERİ: Moderation queue priority - eski yorumlar Ã¶nce mi yoksa yeni mi?
7. EDGE CASE: Empty review text - sadece puan verilmişse moderation gerekli mi?
8. ÖNERİ: Notification to student - yorum onaylandığında/reddedildiğinde bildirim.
-->

---

### [EP7-BE-04] Eğitmen Yorum Cevap Endpoint

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Eğitmenin kendi kurslarındaki yorumlara cevap verebilmesi:
  - `POST /api/v1/courses/{course_id}/reviews/{review_id}/reply`
  - Body: `{ "reply_text": "..." }`
- `CourseReview` modeline `teacher_reply` (Text, nullable) ve `teacher_reply_at` (DateTime, nullable) alanları eklenmeli.
- Sadece kursun sahibi olan eğitmen cevap verebilmeli.

**Kriterler:**
- ✅ Yetki kontrolü: sadece ilgili kursun eğitmeni reply yapabilmeli.
- ✅ Bir yoruma sadece bir teacher_reply olabilir (güncelleme mümkün).
- ✅ Reply yapıldığında öğrenciye bildirim gÃ¶nderilmeli (notification service entegrasyonu).
- ✅ Public course detail endpoint'inde teacher_reply da dÃ¶nmeli.

**Değişecek dosyalar:**
- `backend/app/api/v1/endpoints/course_reviews.py`
- `backend/app/models/course.py` (CourseReview modeli)

---

### [EP7-BE-05] Yorum Onay Bildirim + Rating Recalculate

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Yorum onay/red işlemi sırasında:
  - Öğrenciye bildirim gÃ¶nderilmeli: "Yorumunuz onaylandı" veya "Yorumunuz reddedildi: [sebep]".
  - NotificationService entegrasyonu (mevcut bildirim sistemi kullanılacak).
- Rating recalculation:
  - Yorum onaylandığında/reddedildiğinde kursun `average_rating` değeri yeniden hesaplanmalı.
  - Sadece `is_approved=True` yorumlar puana etki etmeli.
  - Eğitmenin toplam puanı da güncellenebilir (opsiyonel).

**Kriterler:**
- ✅ Bildirim, mevcut NotificationService üzerinden gÃ¶nderilmeli.
- ✅ Rating hesaplaması: `AVG(rating) WHERE is_approved=True` formülü.
- ✅ Bulk onay/red işlemlerinde de rating tek seferde recalculate edilmeli (N+1 koruması).

**Değişecek dosyalar:**
- `backend/app/api/v1/endpoints/course_reviews.py`
- `backend/app/models/course.py` (rating recalculation logic)

---

## ğŸ¨ FRONTEND TASKS – EPIC-7

### [EP7-FE-01] Admin Öğrenciler Listesi & Detay Sayfası

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- `/dashboard/admin/students`:
  - Tablo: İsim, E-posta, Kayıt Tarihi, Kayıtlı Kurs Sayısı, Son Giriş, Durum, İşlemler.
- `/dashboard/admin/students/{id}`:
  - Öğrenci bilgileri + kurs listesi + ilerleme özetleri (mini progress bar).
  - YÃ¶netim aksiyonları: Åifre reset, hesap kapama vs. EPIC-4 ile reuse.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. ÖNERİ: Student search - isim, email, telefon ile arama.
2. EDGE CASE: Kurs ilerleme detayı - hangi dersleri izledi, quiz sonuçları.
3. ÖNERİ: Communication log - öğrenciyle yapılan yazışmaların geçmişi.
4. EDGE CASE: Certificate download - tamamlanan kursların sertifikalarını gÃ¶rme/indirme.
5. ÖNERİ: Engagement metrics - son 30 gün aktivite grafiği.
6. EDGE CASE: Gift purchase - başkası adına alınan kurslar.
7. ÖNERİ: Student export - öğrenci listesini CSV/Excel olarak dışa aktarma.
8. EDGE CASE: Inactive student highlight - X gündür giriş yapmayan öğrenciler.
-->

---

### [EP7-FE-02] Admin Yorum Yönetimi Sayfası

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- `/dashboard/admin/reviews`:
  - Tablo:
    - Kurs adı, Öğrenci, Puan, Yorum metni (truncate), Tarih, Durum (Beklemede / Onaylı / Reddedilmiş), İşlemler (Onayla, Reddet, Sil, Düzenle).

**Kriterler:**
- ✅ Inline detay panel (yorum metninin tamamını gÃ¶stermek için).
- ✅ Onay/ret için küçük modal + optional admin notu.
- ✅ Onaylanmamış yorumlar için belirgin highlight.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. ÖNERİ: Star rating visual - sayısal puan yerine yıldız gÃ¶sterimi.
2. EDGE CASE: Long review text - expandable/collapsible text area.
3. ÖNERİ: Course quick link - kurs adına tıklandığında kursa gitme.
4. EDGE CASE: Reviewer profile - öğrenci adına tıklandığında profil detayı.
5. ÖNERİ: Sentiment indicator - pozitif/negatif/nÃ¶tr yorum renk kodu.
6. EDGE CASE: Image in review - yorumlara eklenen gÃ¶rsellerin moderasyonu.
7. ÖNERİ: Quick filters - "Sadece 1 yıldız", "Sadece bekleyenler" gibi hızlı filtreler.
8. EDGE CASE: Reported reviews priority - raporlanan yorumlar üstte gÃ¶sterilmeli.
9. ÖNERİ: Review stats - toplam yorum sayısı, ortalama puan, pending sayısı kartları.
-->

---

### [EP7-FE-03] Öğrenci Yorum Durumu Gösterimi

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Öğrencinin dashboard'unda (`/dashboard/courses` veya kurs detay sayfasında):
  - Yazdığı yorumların durumlarını gÃ¶rebilmesi: "Onay Bekliyor", "Onaylandı", "Reddedildi".
  - Her yorum yanında durum badge'i: sarı (beklemede), yeşil (onaylı), kırmızı (reddedilmiş).
  - Reddedilen yorumlarda moderasyon notu gÃ¶sterilmeli.

**Kriterler:**
- ✅ Durum badge'leri renk kodlu ve anlaşılır olmalı.
- ✅ Reddedilen yorum için "Yeniden Yaz" seçeneği olabilir (opsiyonel).
- ✅ Mevcut kurs sayfası tasarımına uyumlu entegrasyon.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/dashboard/courses/page.tsx` (mevcut)

---

### [EP7-FE-04] Öğretmen Yorum Cevaplama Sayfası

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- Sayfa: `/dashboard/teacher/reviews`
- Eğitmenin kurslarına yapılan tüm yorumları gÃ¶rebildiği ve cevaplayabildiği sayfa:
  - Yorum listesi: kurs adı, öğrenci, puan (yıldız), yorum metni, tarih, cevap durumu.
  - Filtreleme: kurs seçimi, cevap durumu (cevaplanmış/cevaplanmamış), puan aralığı.
  - Her yorum satırında "Cevapla" butonu → inline textarea ile reply yazma.
  - Mevcut cevaplar düzenlenebilmeli.

**Kriterler:**
- ✅ Cevaplanmamış yorumlar belirgin şekilde vurgulanmalı (highlight/badge).
- ✅ Yıldız gÃ¶sterimi gÃ¶rsel (star icons) olmalı.
- ✅ Cevap gÃ¶nderildikten sonra liste otomatik güncellenmeli.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/dashboard/teacher/reviews/page.tsx` (yeni)
- `frontend/src/lib/api.ts` (teacher reviews endpoint)

---

### [EP7-FE-05] Öğretmen Öğrenci İlerleme Takibi

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- Sayfa: `/dashboard/teacher/students`
- Eğitmenin kurslarına kayıtlı öğrencileri ve ilerlemelerini takip edebildiği sayfa:
  - Kurs seçici: üstte dropdown ile eğitmenin kurslarından birini seçme.
  - Öğrenci tablosu: isim, email, kayıt tarihi, tamamlama yüzdesi (progress bar), son aktivite.
  - Özet kartları: toplam öğrenci, ortalama tamamlama oranı, bu ay yeni kayıtlar.

**Kriterler:**
- ✅ Tamamlama yüzdesi progress bar ile gÃ¶rsel gÃ¶sterilmeli.
- ✅ Kurs bazlı filtreleme çalışmalı.
- ✅ Öğrenci ismine tıklandığında detay (izlenen dersler, quiz sonuçları) gÃ¶sterilebilir (opsiyonel).

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/dashboard/teacher/students/page.tsx` (yeni)
- `frontend/src/lib/api.ts` (teacher students endpoint)

---

### [EP7-FE-06] Sidebar Navigation + API Client Güncelleme (EPIC-7)

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Sidebar güncellemesi:
  - Admin sidebar'a "Öğrenciler" ve "Yorumlar" menü Ã¶ğeleri eklenmeli (Kullanıcılar grubu altına).
  - Öğretmen sidebar'a "Öğrencilerim" ve "Yorumlar" menü Ã¶ğeleri eklenmeli.
- API client güncelleme:
  - `api.ts`'e yorum cevaplama, öğretmen review listesi, öğretmen öğrenci listesi endpoint'leri eklenmeli.
  - `reviewsApi.teacherReply(courseId, reviewId, data)` fonksiyonu.
  - `reviewsApi.teacherList(params)` – eğitmenin kurslarına ait yorumlar.
  - `studentsApi.teacherStudents(params)` – eğitmenin öğrencileri.

**Kriterler:**
- ✅ Sidebar menü Ã¶ğeleri doğru gruplama ve ikonlarla eklenmiş olmalı.
- ✅ API client fonksiyonları TypeScript tip güvenliğiyle tanımlanmış olmalı.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/layout.tsx`
- `frontend/src/lib/api.ts`

---

# 📋 EPIC-8 – Raporlar & İstatistikler

**Amaç:** Kurs, eğitmen ve zaman bazlı finansal istatistikleri görselleştiren analiz ekranları.  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3–4 gün
**Durum:** ✅ TAMAMLANDI

---

## 🔴 BACKEND TASKS – EPIC-8

### [EP8-BE-01] Rapor API'leri (Özet İstatistikler)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Endpoint: `GET /api/v1/admin/reports/overview`
- DÃ¶ndürülecek Ã¶rnek datalar:
  - Toplam ciro, son 30 gün ciro, aktif öğrenci sayısı, aktif eğitmen sayısı, toplam kurs sayısı.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. ÖNERİ: Cache mechanism - rapor verileri heavy query, Redis cache ile optimize et.
2. EDGE CASE: Real-time vs snapshot - veriler anlık mı yoksa periyodik hesaplanmış mı?
3. ÖNERİ: Comparison data - "Geçen aya gÃ¶re %X artış/azalış" bilgisi.
4. EDGE CASE: Empty data handling - yeni kurulmuş sistemde 0 değerleri için uygun gÃ¶sterim.
5. ÖNERİ: Conversion rate - ziyaretçi → kayıt → satın alma dÃ¶nüşüm oranları.
6. EDGE CASE: Currency consideration - farklı para birimlerinde satışlar varsa dÃ¶nüşüm.
7. ÖNERİ: Trend indicators - artış/azalış okları ile gÃ¶rsel feedback.
8. EDGE CASE: Permission granularity - bazı raporlar sadece super admin için olabilir.
-->

---

### [EP8-BE-02] Kurs / Eğitmen Bazlı Zaman Serisi Raporlar

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Endpoint: `GET /api/v1/admin/reports/earnings`
- Parametreler:
  - `group_by=course|teacher`
  - `interval=daily|weekly|monthly`
  - `date_from=&date_to=`

**Kriterler:**
- ✅ Response time serisi için (label, value) dizileri.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Date range validation - max 1 yıl gibi limit, çok geniş aralıklar performans sorunu.
2. ÖNERİ: Drill-down capability - aylık grafikten günlük detaya inme.
3. EDGE CASE: Missing data points - veri olmayan günler için 0 mı null mı?
4. ÖNERİ: Multiple metrics - aynı grafikte ciro + satış adedi karşılaştırması.
5. EDGE CASE: Timezone handling - UTC'de mi yoksa local time'da mı gruplama?
6. ÖNERİ: Top N filter - en çok kazandıran 10 kurs/eğitmen limiti.
7. EDGE CASE: Large dataset pagination - 1000+ veri noktası için sayfalama veya aggregation.
8. ÖNERİ: Export raw data - grafik verilerini CSV olarak indirme.
-->

---

### [EP8-BE-03] Öğretmen İstatistik Endpoint

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2 saat

**Açıklama:**
- Eğitmenin kendi istatistiklerini gÃ¶rebildiği endpoint:
  - `GET /api/v1/teachers/me/stats`
- Response:
  - Toplam kurs sayısı, toplam öğrenci sayısı, toplam satış adedi.
  - Toplam gelir, bu ay gelir, geçen ay gelir (karşılaştırma için).
  - Ortalama kurs puanı, toplam yorum sayısı.
  - En çok satan kurs (top 5).
  - Son 6 ay gelir trendi (aylık breakdown).

**Kriterler:**
- ✅ Sadece eğitmenin kendi verilerini dÃ¶ndürmeli (token'dan user_id).
- ✅ Performans için gerekli aggregation sorguları optimize edilmeli.
- ✅ Cache mekanizması opsiyonel ama Ã¶nerilir (5-10 dk TTL).

**Değişecek dosyalar:**
- `backend/app/api/v1/endpoints/teacher_earnings.py` (veya yeni `reports.py`)
- `backend/app/api/v1/router.py`

---

## ğŸ¨ FRONTEND TASKS – EPIC-8

### [EP8-FE-01] Admin Analiz Dashboard'u

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat

**Açıklama:**
- `/dashboard/admin/analytics`:
  - Üstte KPI kartları (Toplam Ciro, Bu Ay Ciro, Aktif Öğrenci/Eğitmen sayısı).
  - Ortada gelir trend grafiği (line chart – son 6 ay).
  - Altta en çok kazandıran kurslar / eğitmenler tablosu.

**Kriterler:**
- ✅ Chart library (Recharts/Chart.js) ile entegre.
- ✅ Tarih aralığı ve group_by filtreleri.

> [!TIP]
> **GEMINI-COMMENT:** Analiz sayfasında verilerin "Geçen aya gÃ¶re değişim" (% artış/azalış) oranlarının gÃ¶sterilmesi admin için çok kritiktir. Ayrıca tüm grafiklerin ve tabloların PDF/Excel formatında indirilebilmesi raporlama süreçlerini hızlandıracaktır.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. ÖNERİ: Dashboard customization - admin hangi widget'ları gÃ¶receğini seçebilmeli.
2. EDGE CASE: Chart loading states - veri yüklenirken skeleton loader.
3. ÖNERİ: Real-time updates - WebSocket ile canlı veri güncellemesi (opsiyonel).
4. EDGE CASE: Chart responsiveness - mobilde grafikler düzgün gÃ¶rünmeli.
5. ÖNERİ: Goal tracking - "Bu ay hedef: 100K TL" gibi hedef çizgisi.
6. EDGE CASE: No data state - "Bu dÃ¶nemde veri bulunmuyor" uygun gÃ¶sterim.
7. ÖNERİ: Scheduled reports - haftalık/aylık otomatik email raporu.
8. EDGE CASE: Print layout - yazdırma için optimize edilmiş gÃ¶rünüm.
9. ÖNERİ: Bookmark/share - belirli rapor gÃ¶rünümünü URL ile paylaşma.
-->

---

### [EP8-FE-02] Sidebar Navigation Güncelleme (EPIC-8)

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 0.5 saat

**Açıklama:**
- Sidebar güncellemesi:
  - Admin sidebar'a "Analiz / Raporlar" menü Ã¶ğesi eklenmeli (`/dashboard/admin/analytics` linki).
  - Öğretmen sidebar'a "Analizlerim" menü Ã¶ğesi eklenmeli (`/dashboard/teacher/analytics` linki).
  - Uygun ikonlar: BarChart, TrendingUp vb.

**Kriterler:**
- ✅ Mevcut sidebar gruplama yapısına uyumlu.
- ✅ Aktif sayfa vurgulaması doğru çalışmalı.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/layout.tsx`

---

### [EP8-FE-03] Öğretmen Mini Analytics Dashboard

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 3 saat

**Açıklama:**
- Sayfa: `/dashboard/teacher/analytics`
- Eğitmenin kendi performansını takip edebildiği analiz sayfası:
  - KPI kartları: toplam gelir, bu ay gelir (geçen aya gÃ¶re % değişim), toplam öğrenci, ortalama puan.
  - Gelir trend grafiği: son 6 ay çubuk/çizgi grafik (Recharts).
  - En çok satan kurslar tablosu: kurs adı, satış adedi, gelir, ortalama puan.
  - Tarih aralığı filtresi.

**Kriterler:**
- ✅ Chart library (Recharts) ile entegre.
- ✅ Geçen aya gÃ¶re değişim oranı (% artış/azalış) gÃ¶sterilmeli.
- ✅ Responsive tasarım: mobilde kartlar alt alta, grafikler scroll ile gÃ¶rüntülenebilir.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/dashboard/teacher/analytics/page.tsx` (yeni)
- `frontend/src/lib/api.ts` (teacher stats endpoint)

---

### [EP8-FE-04] Admin Dashboard KPI Entegrasyonu

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2 saat

**Açıklama:**
- Mevcut `/dashboard` admin sayfasındaki KPI kartlarını gerçek API verisiyle besleme:
  - Toplam Ciro, Bu Ay Ciro, Aktif Öğrenci, Aktif Eğitmen, Toplam Kurs kartları.
  - Åu anda statik/mock verilerle gÃ¶sterilen kartlar → `GET /api/v1/admin/reports/overview` endpoint'inden gerçek data.
  - Loading state: skeleton loader ile veri yüklenene kadar placeholder.
  - Hata durumu: API başarısız olursa "Veriler yüklenemedi" mesajı.

**Kriterler:**
- ✅ Reports API endpoint'i ile entegre.
- ✅ Geçen aya gÃ¶re değişim oranları kartlarda gÃ¶sterilmeli.
- ✅ Auto-refresh: 5 dakikada bir otomatik yenileme (opsiyonel).

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/dashboard/page.tsx`
- `frontend/src/lib/api.ts` (reportsApi)

---

### 📊 Ek İyileştirmeler – EPIC-8

#### Analitik Suite Genişletmesi

**Durum:** ✅ TAMAMLANDI  
**Tarih:** 2026-02-12

**Backend Geliştirmeleri:**

1. **Öğrenci Analizi Endpoint** (`GET /admin/reports/student-analytics`)
   - Toplam öğrenci, kayıt, gelir ve ortalama tamamlama oranı metrikleri
   - Öğrenci bazlı detaylar: harcama, kayıt sayısı, tamamlanan kurslar, izlenen ders sayısı, izleme süresi
   - Tarih aralığı filtreleme desteği
   - Sıralama: harcama, kayıt sayısı, tamamlama oranı

2. **Eğitmen Performans Endpoint** (`GET /admin/reports/teacher-performance`)
   - Toplam eğitmen, gelir, kurs ve öğrenci metrikleri
   - Eğitmen bazlı detaylar: kurs sayısı (yayında/toplam), öğrenci sayısı, gelir, satış, ortalama puan, yorum sayısı, tamamlama oranı, iade oranı
   - Tarih aralığı filtreleme desteği
   - Sıralama: gelir, öğrenci sayısı, kurs sayısı, ortalama puan

**Frontend Geliştirmeleri:**

1. **Sidebar Restructuring**
   - "Analitik" ayrı bir top-level section olarak eklendi
   - "Finansal" section'ından ayrıldı
   - Alt menüler:
     - Genel Bakış (`/dashboard/admin/analytics`)
     - Kategori Analizi (`/dashboard/admin/analytics/categories`)
     - Kurs Performansı (`/dashboard/admin/analytics/courses`)
     - Öğrenci Analizi (`/dashboard/admin/analytics/students`)
     - Eğitmen Performansı (`/dashboard/admin/analytics/teachers`)
     - Zaman Serisi Analizi (`/dashboard/admin/analytics/timeseries`)

2. **Kategori Analizi Sayfası** (`/dashboard/admin/analytics/categories`)
   - KPI kartları: toplam gelir, kurs sayısı, satış sayısı
   - Gelir dağılımı pie chart
   - Satış sayısı bar chart
   - Detaylı kategori tablosu (sıralama, filtreleme)

3. **Kurs Performansı Sayfası** (`/dashboard/admin/analytics/courses`)
   - KPI kartları: toplam gelir, kurs sayısı, satış sayısı
   - En çok kazandıran kurslar bar chart (top 10)
   - Detaylı kurs tablosu: gelir, satış, kayıt, tamamlama oranı, ortalama puan, iade oranı

4. **Öğrenci Analizi Sayfası** (`/dashboard/admin/analytics/students`)
   - KPI kartları: toplam öğrenci, kayıt, gelir, ortalama tamamlama
   - En çok harcayan öğrenciler bar chart (top 10)
   - Tamamlama oranı dağılımı pie chart
   - Detaylı öğrenci tablosu: harcama, kayıt, tamamlanan, tamamlama %, izlenen ders, izleme süresi, son aktivite

5. **Eğitmen Performansı Sayfası** (`/dashboard/admin/analytics/teachers`)
   - KPI kartları: toplam eğitmen, gelir, kurs, öğrenci
   - En çok kazandıran eğitmenler bar chart (top 10)
   - Ortalama puan dağılımı pie chart
   - Detaylı eğitmen tablosu: gelir, öğrenci, kurs, satış, ortalama puan, yorum, tamamlama %, iade %

6. **Zaman Serisi Analizi Sayfası** (`/dashboard/admin/analytics/timeseries`)
   - KPI kartları: toplam gelir, satış, ortalama gelir
   - Gelir trendi area chart
   - Gelir ve satış adedi composed chart (bar + line)
   - Detaylı veri tablosu
   - Filtreler: tarih aralığı, gruplama (kurs/eğitmen), aralık (günlük/haftalık/aylık)

7. **Ana Analitik Sayfası Güncellemesi**
   - 5 quick link kartı eklendi (Kategori, Kurs, Öğrenci, Eğitmen, Zaman Serisi)
   - Her kart farklı renk teması ile tasarlandı
   - Hover efektleri ve animasyonlar

**Tasarım Özellikleri:**
- Modern glassmorphism efektleri
- Yeşil tonlar (teal-emerald-green) tutarlılığı
- FadeInUp animasyonları
- Responsive tasarım
- Hover efektleri ve geçişler
- Loading states ve error handling

**Değişen Dosyalar:**
- `backend/app/api/v1/endpoints/reports.py` (yeni endpoint'ler)
- `backend/app/schemas/reports.py` (yeni schema'lar)
- `frontend/src/lib/api.ts` (yeni API client metodları)
- `frontend/src/app/(dashboard)/layout.tsx` (sidebar restructuring)
- `frontend/src/app/(dashboard)/dashboard/admin/analytics/page.tsx` (quick links)
- `frontend/src/app/(dashboard)/dashboard/admin/analytics/categories/page.tsx` (mevcut)
- `frontend/src/app/(dashboard)/dashboard/admin/analytics/courses/page.tsx` (mevcut)
- `frontend/src/app/(dashboard)/dashboard/admin/analytics/students/page.tsx` (yeni)
- `frontend/src/app/(dashboard)/dashboard/admin/analytics/teachers/page.tsx` (yeni)
- `frontend/src/app/(dashboard)/dashboard/admin/analytics/timeseries/page.tsx` (yeni)

---

# 📋 EPIC-9 – Not Yönetimi & Site Ayarları

**Amaç:** Admin'in sitede görünen duyuru/notları, genel site ayarlarını, mail sunucusunu ve gelişmiş SEO/Analytics kodlarını yönetebilmesi.  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4–5 gün
**Durum:** ✅ TAMAMLANDI

**Ek İyileştirmeler:**
- ✅ **Maintenance Mode Middleware**: Admin login endpoint'leri (`/api/v1/auth/`) ve public settings endpoint'i (`/api/v1/settings/public`) maintenance modundan muaf tutuldu. OPTIONS (CORS preflight) request'leri de exempt edildi.
- ✅ **Maintenance Page Tasarımı**: Modern, yeşil tonlarında (emerald-teal-cyan) tasarım. Animasyonlu blob backgrounds, geometric pattern overlay, glassmorphism efektleri, çift katmanlı spinning rings, büyük ve belirgin başlık (6xl/7xl, font-black).
- ✅ **Maintenance Page UX**: Admin login butonu kaldırıldı (admin zaten nereye gireceğini biliyor). Maintenance message ve estimated end time sessionStorage'dan alınıyor (API interceptor'dan gelir).
- ✅ **AnnouncementBanner Component**: Öğrenci rolü için düzeltme yapıldı. Backend zaten hem `target_audience` hem de "all" duyurularını döndürüyor, frontend'de query key'e `user?.id` eklendi.
- ✅ **SiteSettingsScripts Component**: SEO kodları (Google Analytics, GTM, Search Console, Bing, Yandex) ve custom code (head HTML, footer HTML, live chat JS) dinamik injection. Script tag'leri güvenli şekilde parse ediliyor (textContent kullanımı).
- ✅ **Admin Sidebar**: Tüm menü grupları varsayılan olarak expand (courses, users, analytics, financial, notifications, announcements, settings, crm).
- ✅ **Public Settings Endpoint**: Platform settings (maintenance_mode, maintenance_message, maintenance_estimated_end) public endpoint'e eklendi. Frontend maintenance mode kontrolü için kullanılıyor.
- ✅ **Homepage Maintenance Mode**: Client-side maintenance mode kontrolü eklendi. Maintenance mode aktifse ve kullanıcı admin değilse, direkt maintenance page content render ediliyor (redirect loop önleme).
- ✅ **Platform Settings Model**: SiteSettings model'ine `platform` JSON field eklendi. Commission rate, currency, tax rate, maintenance mode burada saklanıyor.
- ✅ **Axios Interceptor**: 503 Service Unavailable response'ları yakalanıp, non-admin kullanıcılar maintenance page'e yönlendiriliyor. Maintenance message ve estimated end time sessionStorage'a kaydediliyor.

---

## 🔴 BACKEND TASKS – EPIC-9

### [EP9-BE-01] Announcement / Site Not Modeli

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Model: `SiteAnnouncement`
  - `id`, `title`, `message`, `type` (INFO|WARNING|MAINTENANCE), `is_active`, `starts_at`, `expires_at`, `created_at`, `updated_at`.

**Kriterler:**
- ✅ Frontend, aktif ve tarih aralığı içinde kalan notları header/dashboard'da gösterebilmeli.
- ✅ Tek aktif not veya birden fazla not desteği (config ile belirlenebilir).

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Overlapping dates - aynı tarih aralığında birden fazla aktif duyuru çakışması.
2. ÖNERİ: `target_audience` - sadece öğretmenler, sadece öğrenciler veya herkes için.
3. EDGE CASE: Dismissible flag - kullanıcı duyuruyu kapatabilir mi (localStorage ile track)?
4. ÖNERİ: `priority` alanı - birden fazla aktif duyuru varsa sıralama.
5. EDGE CASE: Rich text support - duyuru mesajında link, bold vb. format desteği.
6. ÖNERİ: Scheduled announcements - ileri tarihli otomatik aktivasyon.
7. EDGE CASE: Long message truncation - çok uzun mesajlar için "devamını oku" linki.
8. ÖNERİ: Analytics - duyuru kaç kez görüntülendi, kaç kez kapatıldı.
-->

---

### [EP9-BE-02] Site Ayarları Modeli (Key-Value / Structured)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- `SiteSettings` tablosu veya JSON config:
  - Genel:
    - `site_title`, `site_url`, `meta_description`, `meta_keywords`, `site_author`, `footer_text`, `logo_path`, `favicon_path`, `contact_email`, `contact_phone`.
  - Platform & Finansal:
    - `platform_commission_rate` (Decimal, 0.0-1.0 arası, örn: 0.35 = %35) - Platform komisyon oranı
    - `currency` (String, default: "TRY") - Para birimi
    - `tax_rate` (Decimal, opsiyonel) - Vergi oranı
  - Email (SMTP):
    - `smtp_host`, `smtp_port`, `smtp_username`, `smtp_password` (encrypted), `smtp_use_tls`.
  - SEO & Analytics:
    - `google_analytics_code`, `gtm_code`, `google_search_console_code`, `bing_webmaster_code`, `yandex_metrica_code`.
  - Custom Code:
    - `custom_head_html`, `custom_footer_html`, `live_chat_js`.

**Kriterler:**
- ✅ Åifre alanları (SMTP password) veritabanında **şifrelenmiş** / maskelenmiş saklanmalı.
- ✅ Settings erişimi caching ile optimize edilmeli (Ã¶rneğin memory cache).

> [!CAUTION]
> **GEMINI-COMMENT:** "Bakım Modu" (Maintenance Mode) ayarı sadece bir veritabanı flag'i olmamalı, backend tarafında bir Middleware ile tüm non-admin isteklerini engelleyen ve 503 dÃ¶ndüren bir yapıya bağlanmalıdır. Ayrıca Logo ve Favicon yüklemelerinde dosya boyutu (max 2MB) ve dosya tipi (png, ico, svg) kontrolü mutlaka yapılmalıdır.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Settings versioning - ayar değişiklik geçmişi (rollback için).
2. ÖNERİ: Environment override - .env dosyasından bazı ayarların override edilebilmesi.
3. EDGE CASE: Sensitive data encryption - SMTP password AES-256 ile şifrelenmeli.
4. ÖNERİ: Settings validation - SMTP port 1-65535 arasında, URL format kontrolü vb.
5. EDGE CASE: Cache invalidation - ayar değiştiğinde cache temizlenmeli.
6. ÖNERİ: Default values - her ayar için sensible default tanımlanmalı.
7. EDGE CASE: Multi-tenant support - ileride birden fazla site için ayrı ayarlar.
8. ÖNERİ: Feature flags - A/B testing için özellik açma/kapama switch'leri.
9. EDGE CASE: Import/Export settings - ayarları JSON olarak yedekleme/geri yükleme.
-->

**Model Taslağı (Ã¶rnek, Pydantic + JSON column):**

```python
class SmtpSettings(BaseModel):
    host: str
    port: int
    username: str
    password_encrypted: str  # DB'de şifreli saklanır
    use_tls: bool = True


class SeoAnalyticsSettings(BaseModel):
    google_analytics_code: str | None = None
    gtm_code: str | None = None
    google_search_console_code: str | None = None
    bing_webmaster_code: str | None = None
    yandex_metrica_code: str | None = None


class CustomCodeSettings(BaseModel):
    custom_head_html: str | None = None
    custom_footer_html: str | None = None
    live_chat_js: str | None = None


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True)
    general = Column(JSON, nullable=False)      # site_title, url, meta vs.
    smtp = Column(JSON, nullable=True)
    seo = Column(JSON, nullable=True)
    custom_code = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

---

### [EP9-BE-03] Site Ayarları API'leri (Admin)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- Endpoint'ler:
  - `GET /api/v1/admin/settings` – tüm ayarları (maskeli şifrelerle).
  - `PUT /api/v1/admin/settings` – ayarları güncelle.
  - `POST /api/v1/admin/settings/email-test` – test mail gÃ¶nder.

**Kriterler:**
- ✅ Sadece admin erişebilir.
- ✅ Åifre alanları GET'te `********` gibi maskelenmiş dÃ¶nmeli.
- ✅ Email test endpoint'i:
  - Parametre: `to_email`.
  - Mevcut SMTP ayarlarıyla basit bir test maili gÃ¶nderir, başarılı/başarısız bilgisini dÃ¶ner.

**API Spesifikasyonu (özet):**

```http
GET /api/v1/admin/settings
Authorization: Bearer <admin-token>
```

```json
{
  "general": {
    "site_title": "Online Eğitim Yazılımı",
    "site_url": "https://onlineegitimyazilimi.fkbsdemo.com.tr/",
    "meta_description": "Türkiye'nin en kapsamlı online eğitim platformu...",
    "meta_keywords": "online eğitim, kurs, sertifika, e-learning, uzaktan eğitim, video eğitim",
    "site_author": "Online Eğitim Platformu",
    "footer_text": "Â© 2025 Online Eğitim Platformu. Tüm hakları saklıdır.",
    "logo_url": "https://cdn.bihocam.com/assets/logo.png",
    "favicon_url": "https://cdn.bihocam.com/assets/favicon.ico",
    "contact_email": "admin@fkbs.com.tr",
    "contact_phone": "+90 212 000 00 00"
  },
  "smtp": {
    "host": "mail.ekasunucu.org",
    "port": 587,
    "username": "info@online-egitimv1.ekayazilim.net",
    "password_masked": "********",
    "use_tls": true
  },
  "seo": {
    "google_analytics_code": "G-XXXX",
    "gtm_code": "GTM-XXXX",
    "google_search_console_code": "google-site-verification=...",
    "bing_webmaster_code": null,
    "yandex_metrica_code": null
  },
  "custom_code": {
    "custom_head_html": "<!-- head extra -->",
    "custom_footer_html": "<!-- footer extra -->",
    "live_chat_js": "<script>/* live chat */</script>"
  }
}
```

```http
PUT /api/v1/admin/settings
Content-Type: application/json
Authorization: Bearer <admin-token>
```

```json
{
  "general": { "...": "..." },
  "smtp": {
    "host": "mail.ekasunucu.org",
    "port": 587,
    "username": "info@online-egitimv1.ekayazilim.net",
    "password": "yeni-sifre-123",   // Opsiyonel, gÃ¶nderilmezse değiştirme
    "use_tls": true
  },
  "seo": { "...": "..." },
  "custom_code": { "...": "..." }
}
```

```http
POST /api/v1/admin/settings/email-test
Content-Type: application/json
Authorization: Bearer <admin-token>
```

```json
{
  "to_email": "test@example.com"
}
```

```json
// 200 OK
{ "success": true, "message": "Test e-postası başarıyla gÃ¶nderildi." }
```

**Hata Durumları:**
- `400` – invalid config (Ã¶rn. port numeric değil, email yanlış format vs.).
- `401/403` – admin olmayan kullanıcı.
- `500` – SMTP bağlantı hatası (email-test için ayrıntılı mesaj log'lara, UI'ye kısa bilgi).

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Partial update - sadece değişen alanları güncelleyebilme (PATCH semantics).
2. ÖNERİ: Audit log - hangi admin ne zaman hangi ayarı değiştirdi.
3. EDGE CASE: SMTP test timeout - bağlantı denemesi için max 10 saniye timeout.
4. ÖNERİ: Connection test - SMTP dışında da DB, Redis, CDN bağlantı test endpoint'leri.
5. EDGE CASE: Password change detection - şifre alanı boş gÃ¶nderilirse mevcut şifreyi koru.
6. ÖNERİ: Bulk settings endpoint - `PUT /api/v1/admin/settings/bulk` ile toplu güncelleme.
7. EDGE CASE: Validation error details - hangi alanın neden geçersiz olduğu detaylı bilgi.
8. ÖNERİ: Public settings endpoint - `GET /api/v1/settings/public` ile site_title, logo gibi public bilgiler.
-->

---

### [EP9-BE-04] Announcement CRUD Endpoint'leri

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Mevcut `SiteAnnouncement` modeli için tam CRUD endpoint'leri:
  - `GET /api/v1/admin/announcements` – Tüm duyuruları listele (aktif/pasif, filtreleme).
  - `POST /api/v1/admin/announcements` – Yeni duyuru oluştur.
  - `PUT /api/v1/admin/announcements/{id}` – Duyuru güncelle.
  - `DELETE /api/v1/admin/announcements/{id}` – Duyuru sil (soft delete).
- Public endpoint: `GET /api/v1/announcements/active` – Aktif ve tarih aralığı içindeki duyuruları dÃ¶ner (auth gereksiz).

**Kriterler:**
- ✅ Admin endpoint'leri sadece admin rolüyle erişilebilir.
- ✅ Public endpoint cache mekanizması ile optimize edilmeli (1-5 dk TTL).
- ✅ Duyuru tip'ine gÃ¶re (INFO/WARNING/MAINTENANCE) filtreleme.

**Değişecek dosyalar:**
- `backend/app/api/v1/endpoints/announcements.py` (yeni)
- `backend/app/api/v1/router.py`

---

### [EP9-BE-05] Public Settings Endpoint

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 1 saat

**Açıklama:**
- Sitenin genel bilgilerini dÃ¶ndüren public endpoint (auth gereksiz):
  - `GET /api/v1/settings/public`
- Response:
  - `site_title`, `logo_url`, `favicon_url`, `footer_text`, `contact_email`, `contact_phone`.
  - SEO alanları: `meta_description`, `meta_keywords`.
- Frontend'in header, footer ve meta tag'leri bu endpoint'ten beslemesi için.

**Kriterler:**
- ✅ Auth gerektirmemeli – public erişim.
- ✅ Hassas bilgiler (SMTP şifre, analytics kodları) kesinlikle dÃ¶nmemeli.
- ✅ Agresif cache: 15-30 dk TTL ile Redis/memory cache.
- ✅ 404 yerine default değerler dÃ¶nmeli (settings tablosu boşsa).

**Değişecek dosyalar:**
- `backend/app/api/v1/endpoints/settings.py` (yeni)
- `backend/app/api/v1/router.py`

---

### [EP9-BE-06] Bakım Modu Middleware

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Site ayarlarında `maintenance_mode` aktif edildiğinde:
  - Tüm non-admin istekler `503 Service Unavailable` dÃ¶nmeli.
  - Admin kullanıcılar normal şekilde erişebilmeli.
  - Frontend'e özel bir maintenance response body dÃ¶nmeli:
    - `{ "maintenance": true, "message": "Site bakım modundadır.", "estimated_end": "..." }`
- Middleware yapısı:
  - FastAPI middleware olarak `main.py`'ye eklenmeli.
  - `SiteSettings`'ten `maintenance_mode` flag'ini kontrol etmeli.
  - Static asset'ler (CSS, JS, images) middleware'den muaf tutulmalı.

**Kriterler:**
- ✅ Admin token ile gelen istekler middleware'den geçmeli.
- ✅ `maintenance_mode` değişikliği anında etkili olmalı (cache invalidation).
- ✅ Health check endpoint (`/health`) maintenance modundan muaf olmalı.

**Değişecek dosyalar:**
- `backend/app/main.py` (middleware ekleme)
- `backend/app/models/site_settings.py` (maintenance_mode flag)

---

## ğŸ¨ FRONTEND TASKS – EPIC-9

### [EP9-FE-01] Not Yönetimi / Duyuru Paneli (Admin)

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:**
- `/dashboard/admin/announcements`:
  - Aktif/pasif notların listesi (başlık, tip, tarih aralığı, durum).
  - Create/Edit form:
    - Başlık, Mesaj, Tip (info/warning/maintenance), Başlangıç/Bitiş tarihleri, Aktif toggle.

**Kriterler:**
- ✅ Dashboard'da bu notların nasıl gÃ¶rüneceğine dair UI bileşeni (banner/alert).
- ✅ Anında aktif/pasif etme (toggle ile).

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. ÖNERİ: Preview mode - duyurunun nasıl gÃ¶rüneceğini oluşturmadan Ã¶nce Ã¶nizleme.
2. EDGE CASE: Date picker validation - bitiş tarihi başlangıçtan Ã¶nce olamaz.
3. ÖNERİ: Template system - sık kullanılan duyuru şablonları (bakım, tatil vb.).
4. EDGE CASE: Emoji support - duyuru başlığında emoji kullanımı.
5. ÖNERİ: Color customization - duyuru tip'ine gÃ¶re özel renk seçimi.
6. EDGE CASE: Duplicate prevention - aynı başlıkta aktif duyuru uyarısı.
7. ÖNERİ: Quick actions - "Åimdi Aktif Et", "Bugün İçin Planla" butonları.
8. EDGE CASE: Timezone display - tarihler kullanıcının timezone'unda gÃ¶sterilmeli.
-->

---

### [EP9-FE-02] Genel Site Ayarları Formu

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:**
- `/dashboard/admin/settings/general`:
  - Alanlar:
    - Site Başlığı, Site URL, Site Açıklaması (Meta), Anahtar Kelimeler, Site Yazarı.
    - Footer Yazısı.
    - Site Logosu, Favicon upload alanları (mevcut logo/ikon preview).
    - İletişim E-posta, İletişim Telefonu.

**Kriterler:**
- ✅ Logo/Favicon için upload component + mevcut gÃ¶rsel Ã¶nizleme.
- ✅ Kaydet butonu sonrası "Ayarlar güncellendi" mesajı.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Logo aspect ratio - yüklenen logo'nun uygun en-boy oranı kontrolü.
2. ÖNERİ: Logo variants - light/dark theme için farklı logo versiyonları.
3. EDGE CASE: Meta description length - SEO için 150-160 karakter önerisi.
4. ÖNERİ: SEO preview - Google arama sonuçlarında nasıl gÃ¶rüneceği preview.
5. EDGE CASE: URL validation - site_url http/https ile başlamalı.
6. ÖNERİ: Character counter - meta alanları için kalan karakter sayısı.
7. EDGE CASE: Favicon sizes - farklı boyutlarda favicon generate etme (16x16, 32x32, apple-touch).
8. ÖNERİ: Undo changes - kaydetmeden Ã¶nce "Değişiklikleri geri al" butonu.
-->

---

### [EP9-FE-03] E-posta Sunucu Ayarları Formu + Test Mail

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- `/dashboard/admin/settings/email`:
  - SMTP Sunucu, Port, Kullanıcı Adı, Åifre (masked input), TLS/SSL seçimi.
  - "Mail Test" bÃ¶lümü:
    - Test E-posta Adresi input'u.
    - "Test Mail GÃ¶nder" butonu → BE test endpoint'ine bağlanır.

**Kriterler:**
- ✅ Åifre alanı masked; sadece değiştirildiğinde yeni değeri gÃ¶nderilir.
- ✅ Test mail sonucu: başarılı/başarısız toast + log detayı.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: Password reveal toggle - şifreyi geçici olarak gÃ¶sterme butonu.
2. ÖNERİ: Connection status indicator - SMTP bağlantısı aktif mi yeşil/kırmızı gÃ¶sterge.
3. EDGE CASE: TLS/SSL terminology - port 465 SSL, port 587 TLS açıklaması.
4. ÖNERİ: Email template preview - gÃ¶nderilen test mailin nasıl gÃ¶ründüğü.
5. EDGE CASE: Error message detail - SMTP hatası için teknik detay (connection refused, auth failed vb.).
6. ÖNERİ: Common providers - Gmail, Outlook, SendGrid için hazır ayar şablonları.
7. EDGE CASE: Rate limit warning - SMTP provider'ın günlük limit bilgisi.
8. ÖNERİ: Test mail to self - admin'in kendi email'ine otomatik test gÃ¶nderme.
-->

---

### [EP9-FE-04] SEO & Analytics / Gelişmiş Ayarlar Formu

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat

**Açıklama:**
- `/dashboard/admin/settings/advanced`:
  - Google Analytics Kod, GTM Kodu, Search Console, Bing/Yandex kodları.
  - Özel HTML/CSS/JS:
    - Head Kodları (textarea – syntax highlight olmasa da monospaced).
    - Footer Kodları.
    - Canlı Destek JS kodu.

**Kriterler:**
- ✅ Tehlikeli alanlar için uyarı ("Yanlış JS kodu siteyi bozabilir").
- ✅ Büyük metin alanları için auto-resize ve satır numaraları (isteğe bağlı).

> [!TIP]
> **GEMINI-COMMENT:** Özel kod (HTML/JS) alanları için `Monaco Editor` veya `react-simple-code-editor` gibi bir bileşen kullanılması, kodun okunabilirliğini ve yazım hatalarının (syntax error) fark edilmesini sağlayacaktır. Ayrıca bu alanlara girilen JS kodunun asenkron (`async/defer`) yüklenmesi için uyarılar eklenebilir.

<!-- CLAUDE-COMMENT
💡 AUDIT NOTLARI:
1. EDGE CASE: XSS prevention - custom HTML/JS alanlarında script injection riski uyarısı.
2. ÖNERİ: Code validation - girilen kodun syntax hatası var mı kontrol.
3. EDGE CASE: Analytics code format - GA/GTM kodu için format validation (G-XXXX, GTM-XXXX).
4. ÖNERİ: Preview sandbox - custom kodu canlıya almadan Ã¶nce izole ortamda test.
5. EDGE CASE: Script loading order - head vs footer kodu execution sırası açıklaması.
6. ÖNERİ: Popular integrations - Hotjar, Intercom, Tawk.to için hazır şablonlar.
7. EDGE CASE: Content Security Policy - custom script'lerin CSP ile uyumluluğu.
8. ÖNERİ: Version history - kod değişikliklerinin geçmişi ve rollback imkanı.
9. EDGE CASE: Empty state handling - kod boşsa script tag'i hiç eklenmemeli.
-->

### [EP9-FE-05] Sidebar Navigation Güncelleme (EPIC-9)

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 1 saat

**Açıklama:**
- Sidebar güncellemesi:
  - Admin sidebar'a "Duyurular" menü Ã¶ğesi eklenmeli (`/dashboard/admin/announcements`).
  - Admin sidebar'daki "Ayarlar" grubuna alt menüler: Genel, E-posta, Gelişmiş.
  - Ayarlar alt menüleri: `/dashboard/admin/settings/general`, `/dashboard/admin/settings/email`, `/dashboard/admin/settings/advanced`.

**Kriterler:**
- ✅ Ayarlar grubu expandable/collapsible alt menü yapısında olmalı.
- ✅ Mevcut sidebar gruplama yapısına uyumlu.
- ✅ Aktif sayfa vurgulaması alt menülerde de çalışmalı.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/layout.tsx`

---

### [EP9-FE-06] Dashboard Duyuru Banner Bileşeni

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2 saat

**Açıklama:**
- Tüm dashboard sayfalarında header altında aktif duyuruları gÃ¶steren banner bileşeni:
  - `AnnouncementBanner` component'i oluşturulacak.
  - `GET /api/v1/announcements/active` endpoint'inden aktif duyuruları çekecek.
  - Duyuru tiplerine gÃ¶re renk kodlaması:
    - INFO: mavi/teal arka plan.
    - WARNING: sarı/turuncu arka plan.
    - MAINTENANCE: kırmızı arka plan.
  - Kapatma (dismiss) butonu: localStorage'da kapatılan duyuru ID'leri saklanarak tekrar gÃ¶sterilmez.
  - Birden fazla aktif duyuru varsa carousel/stack gÃ¶sterimi.

**Kriterler:**
- ✅ Dashboard layout'a entegre edilmeli (header altına).
- ✅ Aktif duyuru yoksa banner gizlenmeli (yer kaplamamalı).
- ✅ Dismiss durumu localStorage ile persist edilmeli.
- ✅ Responsive tasarım.

**Değişecek dosyalar:**
- `frontend/src/components/AnnouncementBanner.tsx` (yeni)
- `frontend/src/app/(dashboard)/layout.tsx` (banner entegrasyonu)

---

### [EP9-FE-07] Bakım Modu 503 Sayfası

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 1.5 saat

**Açıklama:**
- Bakım modu aktif olduğunda kullanıcılara gÃ¶sterilecek özel sayfa:
  - Tasarım: merkezi bir ikon (wrench/cog), "Site Bakım Modundadır" başlığı, açıklama metni.
  - Tahmini bitiş zamanı gÃ¶sterimi (API'den gelen `estimated_end`).
  - Admin giriş linki: bakım modunda bile admin paneline erişim sağlanabilmeli.
- API interceptor: frontend'de tüm API çağrılarında 503 response gelirse otomatik olarak maintenance sayfasına yÃ¶nlendirme.

**Kriterler:**
- ✅ Modern, markalı tasarım (site logosu ve renkleri kullanılmalı).
- ✅ API interceptor (axios/fetch) ile otomatik yÃ¶nlendirme.
- ✅ Admin kullanıcılar yÃ¶nlendirilmemeli.

**Değişecek dosyalar:**
- `frontend/src/app/maintenance/page.tsx` (yeni)
- `frontend/src/lib/api.ts` (503 interceptor)

---

### [EP9-FE-08] Public Layout Site Ayarları Entegrasyonu

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2 saat

**Açıklama:**
- Public layout (header, footer, meta tags) verilerini `/api/v1/settings/public` endpoint'inden çekme:
  - Header: logo, site title dinamik olarak yüklenmeli.
  - Footer: footer_text, iletişim bilgileri dinamik olarak yüklenmeli.
  - Meta tags: `<title>`, `<meta description>`, `<meta keywords>` dinamik olarak set edilmeli.
  - Favicon: dinamik favicon URL.
- React Context veya SWR/React Query ile global state'te tutulmalı (her sayfada tekrar çekilmemeli).

**Kriterler:**
- ✅ Settings verisi uygulama başlangıcında bir kez çekilip cache'lenmeli.
- ✅ Settings yüklenemezse default değerler kullanılmalı (graceful fallback).
- ✅ SEO dostu: Next.js metadata API ile entegre edilmeli.

**Değişecek dosyalar:**
- `frontend/src/components/Header.tsx` veya ilgili header bileşeni
- `frontend/src/components/Footer.tsx` veya ilgili footer bileşeni
- `frontend/src/lib/api.ts` (settingsApi.getPublic)

---

<!-- CLAUDE-COMMENT (EPIC-4 ile EPIC-9 GENEL AUDIT)
💡 GENEL EKSİKLER VE ÖNERİLER:

1. ğŸš¨ EKSİK EPIC: Audit Log / Activity Tracking - tüm admin işlemlerinin loglanması (GDPR compliance).
2. ğŸš¨ EKSİK EPIC: Role & Permission Management - dinamik rol ve yetki tanımlama sistemi.
3. ğŸš¨ EKSİK EPIC: Multi-tenancy / White-label - kurumsal müşteriler için ayrı subdomain/branding.
4. ğŸš¨ EKSİK TASK: 2FA (Two-Factor Auth) - admin hesapları için zorunlu 2FA.
5. ğŸš¨ EKSİK TASK: Session Management - aktif oturumları gÃ¶rme ve sonlandırma.
6. ğŸš¨ EKSİK TASK: IP Whitelist - admin paneline sadece belirli IP'lerden erişim.
7. ğŸš¨ EKSİK TASK: Backup & Restore - otomatik yedekleme ve geri yükleme mekanizması.
8. ğŸš¨ EKSİK TASK: Health Check Endpoint - sistem sağlığı monitoring için.
9. ğŸš¨ EKSİK TASK: Rate Limiting Config - admin panelinden rate limit ayarları.
10. ğŸš¨ EKSİK TASK: Email Templates Management - bildirim email şablonlarını UI'dan düzenleme.
11. ğŸš¨ EKSİK TASK: Webhook Configuration - 3rd party entegrasyonlar için webhook ayarları.
12. ğŸš¨ EKSİK TASK: API Keys Management - external API erişimi için key yönetimi.
-->

---

# 📋 NOTIF-V2 – E-Mail Entegrasyonu

**Amaç:** Mevcut bildirim sistemini gerçek e-mail gönderimi ile genişletmek. SMTP üzerinden şablon bazlı email gönderimi, async worker, log ve retry mekanizması.
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 5–6 gün

---

## 🔴 BACKEND TASKS – NOTIF-V2

### [NOTIFV2-BE-01] Email Service (SMTP GÃ¶nderimi)

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- `email_service.py` modülü oluşturulacak:
  - `aiosmtplib` kütüphanesi ile async SMTP email gönderimi.
  - SiteSettings'ten SMTP config'i (host, port, username, password, tls) okuma.
  - `send_email(to, subject, html_body, plain_body=None)` ana fonksiyon.
  - CC/BCC desteği.
  - Attachment desteği (opsiyonel, ilerisi için).
- Hata yönetimi: SMTP bağlantı hatası, authentication hatası, timeout vb. durumlar loglama ile handle edilmeli.

**Kriterler:**
- ✅ SiteSettings'ten dinamik SMTP konfigürasyon okuma.
- ✅ TLS/SSL otomatik seçim (port'a gÃ¶re).
- ✅ Retry mekanizması ile entegre edilebilir yapı.
- ✅ Email gÃ¶nderilemediğinde exception fırlatmalı (caller'ın handle etmesi için).

**Yeni dosyalar:**
- `backend/app/services/email_service.py`

---

### [NOTIFV2-BE-02] Email Template Engine (Jinja2 HTML Åablonlar)

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 3 saat

**Açıklama:**
- Jinja2 tabanlı HTML email şablon sistemi:
  - Base template: header (logo, site adı), content area, footer (unsubscribe link, iletişim).
  - Åablonlar:
    - `welcome.html` – Hoş geldin emaili (kayıt sonrası).
    - `order_confirmation.html` – Sipariş onay emaili (kurs adı, tutar, fatura linki).
    - `password_reset.html` – Åifre sıfırlama emaili (reset link, süre bilgisi).
    - `review_approved.html` – Yorum onay bildirimi.
    - `review_rejected.html` – Yorum ret bildirimi (sebep ile).
    - `teacher_new_sale.html` – Eğitmene yeni satış bildirimi.
  - `render_template(template_name, context)` fonksiyonu.
  - Tüm şablonlar responsive (mobile-friendly) HTML/CSS ile.

**Kriterler:**
- ✅ Jinja2 template inheritance kullanılmalı (base → child).
- ✅ Inline CSS (email client uyumluluğu için).
- ✅ Site logosu ve renkleri SiteSettings'ten dinamik gelmeli.
- ✅ Plain text fallback her şablon için mevcut olmalı.

**Yeni dosyalar:**
- `backend/app/services/email_templates.py`
- `backend/templates/email/base.html`
- `backend/templates/email/welcome.html`
- `backend/templates/email/order_confirmation.html`
- `backend/templates/email/password_reset.html`
- `backend/templates/email/review_approved.html`
- `backend/templates/email/review_rejected.html`
- `backend/templates/email/teacher_new_sale.html`

---

### [NOTIFV2-BE-03] NotificationService Email Entegrasyonu

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 2 saat

**Açıklama:**
- Mevcut `NotificationService`'e email kanalı entegrasyonu:
  - Bildirim oluşturulduğunda `delivery_channels` alanına gÃ¶re:
    - `in_app` → mevcut bildirim (veritabanı).
    - `email` → EmailService üzerinden gerçek email gönderimi.
    - `both` → hem in_app hem email.
  - Her bildirim tipi için uygun email şablonu seçimi (mapping).
  - Email gÃ¶nderim sonucu (başarılı/başarısız) NotificationLog'a kaydedilmeli.

**Kriterler:**
- ✅ Mevcut NotificationService yapısını bozmadan genişletme.
- ✅ Kullanıcının email tercihine saygı: `user.email_notifications_enabled` kontrolü.
- ✅ Email gönderimi async olmalı (kullanıcıyı bekletmemeli).
- ✅ Template mapping: notification_type → email_template_name.

**Değişecek dosyalar:**
- `backend/app/services/notification_service.py` (mevcut)

---

### [NOTIFV2-BE-04] Email Queue (Arq Worker)

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- Async email gönderimi için background job worker:
  - `Arq` (veya Celery) worker ile email gÃ¶nderim kuyruğu.
  - Redis queue: email gÃ¶nderim talepleri kuyruğa eklenir, worker asenkron olarak işler.
  - İşleme sırası: FIFO (ilk gelen ilk gÃ¶nderilir).
  - Rate limiting: SMTP provider limitlerini aşmamak için dakikada max N email.
  - Worker health check: worker çalışıyor mu monitoring.

**Kriterler:**
- ✅ Email gönderimi ana API thread'ini bloklamamalı.
- ✅ Worker çÃ¶ktüğünde kuyruktaki emailler kaybolmamalı (persistent queue).
- ✅ Konfigürasyon: worker sayısı, batch size, rate limit ayarlanabilir olmalı.

**Yeni dosyalar:**
- `backend/app/workers/email_worker.py`

---

### [NOTIFV2-BE-05] Email Log & Retry

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2 saat

**Açıklama:**
- Email gÃ¶nderim logları ve retry mekanizması:
  - `EmailLog` modeli:
    - `id`, `to_email`, `subject`, `template_name`, `status` (PENDING|SENT|FAILED|RETRYING), `attempt_count`, `last_error`, `sent_at`, `created_at`.
  - Her email gÃ¶nderim denemesi loglanmalı.
  - Başarısız emailler için otomatik retry:
    - Max 3 deneme, exponential backoff (1dk, 5dk, 15dk).
    - 3 denemeden sonra status → FAILED.
  - Admin endpoint'leri:
    - `GET /api/v1/admin/email-logs` – Email loglarını listele (filtreleme: status, tarih, email).
    - `POST /api/v1/admin/email-logs/{id}/retry` – Başarısız emaili manuel tekrar gÃ¶nder.

**Kriterler:**
- ✅ EmailLog modeli migration ile oluşturulmalı.
- ✅ Retry mekanizması worker seviyesinde çalışmalı.
- ✅ Admin log endpoint'i sayfalama (pagination) desteklemeli.

**Yeni dosyalar:**
- `backend/app/models/email_log.py`

---

## ğŸ¨ FRONTEND TASKS – NOTIF-V2

### [NOTIFV2-FE-01] Email Template Preview (Admin)

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2.5 saat

**Açıklama:**
- Sayfa: `/dashboard/admin/email-templates`
- Admin'in email şablonlarını Ã¶nizleyebildiği sayfa:
  - Åablon listesi: şablon adı, açıklama, son güncelleme.
  - Önizleme: şablonu seçince sağda iframe/panel içinde HTML render.
  - Test gönderimi: "Test Mail GÃ¶nder" butonu → belirtilen adrese o şablonla test email.
  - Åablon değişkenleri: her şablon için kullanılan değişkenlerin listesi (user_name, course_title vb.).

**Kriterler:**
- ✅ HTML email güvenli render (sandbox iframe).
- ✅ Test gönderimi sonucu toast bildirimi (başarılı/başarısız).
- ✅ Responsive Ã¶nizleme: desktop ve mobil gÃ¶rünüm toggle.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/dashboard/admin/email-templates/page.tsx` (yeni)
- `frontend/src/lib/api.ts` (emailTemplatesApi)

---

### [NOTIFV2-FE-02] Email Log Sayfası (Admin)

**Durum:** ✅ TAMAMLANDI
**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 2 saat

**Açıklama:**
- Sayfa: `/dashboard/admin/email-logs`
- GÃ¶nderilen emaillerin log listesi:
  - Tablo: alıcı email, konu, şablon, durum (badge), deneme sayısı, gÃ¶nderim tarihi, hata mesajı.
  - Filtreleme: durum (gÃ¶nderildi/başarısız/beklemede), tarih aralığı, email arama.
  - Durum badge renkleri: yeşil (SENT), kırmızı (FAILED), sarı (PENDING/RETRYING).
  - Aksiyonlar: başarısız emaili tekrar gÃ¶nder butonu.
  - Özet kartları: toplam gÃ¶nderilen, başarılı, başarısız, beklemede sayıları.

**Kriterler:**
- ✅ Sayfalama (pagination) desteklemeli.
- ✅ Tekrar gÃ¶nder butonu onay modal'ı ile.
- ✅ Hata mesajı detayı expandable gÃ¶sterim.

**Değişecek dosyalar:**
- `frontend/src/app/(dashboard)/dashboard/admin/email-logs/page.tsx` (yeni)
- `frontend/src/lib/api.ts` (emailLogsApi)

---

# 💡 CLAUDE-EPICS – Yaratıcı Öneriler (Gelecek Yol Haritası)

**Amaç:** BiHocam platformunu rekabetçi bir online eğitim platformuna dÃ¶nüştürecek stratejik özellik Ã¶nerileri. Her EPIC, bağımsız olarak planlanıp implement edilebilir modüler yapıda tasarlanmıştır.

---

## CLAUDE-EPIC-1: Canlı Ders Sistemi

**Öncelik:** 🔴 YÜKSEK
**Tahmini Süre:** 8–10 gün
**Neden Değerli:** Canlı ders desteği, platformu salt video-on-demand'den etkileşimli bir eğitim ortamına taşır. Öğrenci-eğitmen etkileşimini artırır, premium fiyatlandırma imkanı sağlar.

**Backend Task'lar:**
- WebRTC/Jitsi Meet entegrasyonu veya third-party API (Daily.co, Agora) ile canlı video altyapısı.
- `LiveSession` modeli: `id`, `course_id`, `teacher_id`, `title`, `scheduled_at`, `duration_minutes`, `status` (SCHEDULED/LIVE/ENDED), `meeting_url`, `recording_url`.
- Takvim API: `GET /api/v1/live-sessions/upcoming`, `POST /api/v1/live-sessions` (eğitmen oluşturur).
- Otomatik kayıt: ders bittiğinde recording URL'i ilgili kursa ekleme.
- Hatırlatma bildirimi: derse 1 saat / 15 dk kala email + in-app bildirim.

**Frontend Task'lar:**
- Canlı ders takvimi sayfası (öğretmen + öğrenci): aylık/haftalık gÃ¶rünüm.
- Canlı ders odası: video player embed, sohbet paneli, katılımcı listesi.
- Ders planlama formu (öğretmen): tarih seçici, tekrar eden ders ayarı.
- Dashboard'da "Yaklaşan Canlı Dersler" widget'ı.

---

## CLAUDE-EPIC-2: Sertifika Sistemi

**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 4–5 gün
**Neden Değerli:** Kurs tamamlayanlara otomatik sertifika verilmesi, öğrencileri motive eder, tamamlama oranlarını artırır. LinkedIn paylaşımı ile organik pazarlama sağlar.

**Backend Task'lar:**
- `Certificate` modeli: `id`, `user_id`, `course_id`, `certificate_number` (unique), `issued_at`, `pdf_url`.
- PDF oluşturma: `reportlab` veya `weasyprint` ile şablon bazlı PDF sertifika generate etme.
- Otomatik tetikleme: kurs %100 tamamlandığında sertifika oluşturma.
- Doğrulama endpoint'i: `GET /api/v1/certificates/verify/{certificate_number}` (public).

**Frontend Task'lar:**
- Sertifika şablon tasarımcısı (admin): drag-drop alanlar, logo, imza.
- Öğrenci sertifikalarım sayfası: indirme, LinkedIn paylaşma butonu.
- Kurs detay sayfasında "Bu kurs sertifika içerir" badge'i.
- Public sertifika doğrulama sayfası.

---

## CLAUDE-EPIC-3: Mesajlaşma Sistemi

**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 6–7 gün
**Neden Değerli:** Öğretmen-öğrenci arası direkt iletişim kanalı, destek taleplerini azaltır, öğrenci memnuniyetini artırır. Premium feature olarak da konumlandırılabilir.

**Backend Task'lar:**
- `Conversation` ve `Message` modelleri: konuşma thread'leri ve mesajlar.
- WebSocket entegrasyonu: anlık mesaj gÃ¶nderim/alımı (FastAPI WebSocket).
- Mesaj endpoint'leri: `GET /api/v1/messages/conversations`, `POST /api/v1/messages/send`.
- Okundu bilgisi: `read_at` timestamp ile.
- Spam koruması: rate limiting, kelime filtresi.

**Frontend Task'lar:**
- Mesajlar sayfası: sol tarafta konuşma listesi, sağda mesaj detayı (WhatsApp benzeri).
- Real-time mesaj güncellemesi (WebSocket).
- Okundu/okunmadı gÃ¶sterimi, yazıyor... indicator.
- Dosya/gÃ¶rsel paylaşma desteği.

---

## CLAUDE-EPIC-4: AI Öğrenme Asistanı

**Öncelik:** 🟠 ORTA
**Tahmini Süre:** 5–6 gün
**Neden Değerli:** Yapay zeka destekli Ã¶ğrenme asistanı, öğrencilerin kurs içeriğiyle ilgili anında yardım almasını sağlar. Platformu rakiplerinden farklılaştıran unique bir özellik.

**Backend Task'lar:**
- Claude/OpenAI API entegrasyonu: kurs içeriği bazlı soru-cevap chatbot.
- Context yönetimi: kursun ders notları, transkriptleri ve materyallerini RAG (Retrieval-Augmented Generation) ile indexleme.
- `AIChat` modeli: sohbet geçmişi kayıt, kullanıcı başı kullanım limiti.
- Rate limiting: günlük/aylık soru limiti (plan bazlı).

**Frontend Task'lar:**
- Kurs içi chat widget: sağ alt kÃ¶şede floating chatbot penceresi.
- Sohbet geçmişi: Ã¶nceki soruları gÃ¶rme ve devam etme.
- Önerilen sorular: kurs konusuna gÃ¶re hazır soru Ã¶nerileri.
- Admin kullanım dashboard'u: AI kullanım istatistikleri, maliyet takibi.

---

## CLAUDE-EPIC-5: Gamification & Rozetler

**Öncelik:** ğŸŸ¢ DÜÅÜK
**Tahmini Süre:** 5–6 gün
**Neden Değerli:** Oyunlaştırma mekanizmaları öğrenci bağlılığını %40'a kadar artırabilir. Liderlik tablosu ve rozetler sosyal motivasyon sağlar.

**Backend Task'lar:**
- `UserXP` modeli: deneyim puanı sistemi (ders izle +10 XP, quiz çÃ¶z +20 XP, kurs tamamla +100 XP).
- `Badge` modeli: farklı başarı rozetleri (İlk Ders, Hız Ustası, 10 Kurs Tamamlama vb.).
- Liderlik tablosu endpoint: `GET /api/v1/leaderboard?period=weekly|monthly|alltime`.
- Otomatik badge ataması: koşullar sağlandığında bildirim ile.
- Seviye sistemi: XP eşiklerine gÃ¶re seviye atlama.

**Frontend Task'lar:**
- Profil sayfasında rozet koleksiyonu ve XP gÃ¶sterimi.
- Liderlik tablosu sayfası: haftalık/aylık/tüm zamanlar.
- Kurs tamamlama sonrası kutlama animasyonu (confetti).
- Dashboard'da seviye progress bar'ı.

---

## CLAUDE-EPIC-6: Affiliate / Referans Sistemi

**Öncelik:** ğŸŸ¢ DÜÅÜK
**Tahmini Süre:** 5–6 gün
**Neden Değerli:** Referans sistemi, mevcut kullanıcıların yeni müşteri getirmesini teşvik eder. Düşük maliyetli müşteri kazanımı (CAC) sağlar.

**Backend Task'lar:**
- `AffiliateLink` modeli: kullanıcıya özel referans linki, tracking kodu.
- `AffiliateCommission` modeli: referans ile gelen satışlardan komisyon takibi.
- Komisyon hesaplama: satış tutarının %X'i (admin tarafından ayarlanabilir).
- Ã‡erez tracking: referans linki ile gelen ziyaretçinin 30 gün boyunca takibi.
- Ödeme entegrasyonu: banka hesabına komisyon aktarımı (EP5 ile entegre).

**Frontend Task'lar:**
- Referans dashboard'u: link oluşturma, tıklama istatistikleri, kazanç takibi.
- Referans link paylaşma: sosyal medya butonları, kopyala butonu.
- Admin affiliate yÃ¶netim sayfası: komisyon oranları, onay/red, ödeme geçmişi.
- Public referans landing sayfası.

---

## CLAUDE-EPIC-7: Blog / CMS

**Öncelik:** ğŸŸ¢ DÜÅÜK
**Tahmini Süre:** 5–6 gün
**Neden Değerli:** Blog, SEO için en etkili organik trafik kaynağıdır. Eğitmenlerin de yazı yazabilmesi içerik üretimini Ã¶lçeklendirir.

**Backend Task'lar:**
- `BlogPost` modeli: `id`, `title`, `slug`, `content` (rich text), `author_id`, `category`, `tags`, `featured_image`, `status` (DRAFT|PUBLISHED), `published_at`, `seo_title`, `seo_description`.
- Blog CRUD endpoint'leri: admin + eğitmen (kendi yazıları).
- Kategori ve etiket sistemi.
- SEO-friendly URL yapısı: `/blog/{slug}`.
- RSS feed endpoint.

**Frontend Task'lar:**
- Public blog sayfası: liste gÃ¶rünümü (kart/liste), kategori filtresi, arama.
- Blog yazı detay sayfası: rich content render, paylaşma butonları, ilgili yazılar.
- Blog editÃ¶rü: Markdown veya WYSIWYG editor (TipTap/Slate).
- Admin blog yÃ¶netim sayfası: tüm yazılar, onay/red, istatistikler.

---

## CLAUDE-EPIC-8: PWA Mobil Deneyim

**Öncelik:** ğŸŸ¢ DÜÅÜK
**Tahmini Süre:** 4–5 gün
**Neden Değerli:** Progressive Web App desteği, native uygulama geliştirmeden mobil deneyimi iyileştirir. Offline video izleme, push notification ve ana ekrana ekleme özelliği sağlar.

**Backend Task'lar:**
- Service Worker manifest endpoint: `/manifest.json` ile PWA konfigürasyonu.
- Push notification API: Web Push Protocol ile push bildirim gönderimi.
- `PushSubscription` modeli: kullanıcı push abonelik bilgileri.
- Offline sync endpoint: çevrimdışı ilerleme verilerini senkronize etme.

**Frontend Task'lar:**
- Service Worker: asset caching, offline fallback sayfa, background sync.
- PWA manifest: uygulama adı, ikonlar, tema rengi, başlangıç URL'i.
- "Ana Ekrana Ekle" prompts: uygun zamanda (3. ziyaret sonrası) gÃ¶sterme.
- Offline video player: indirilen videoları çevrimdışı izleme.
- Push notification opt-in: kullanıcı tercihine gÃ¶re bildirim izni isteme.

---

## CLAUDE-EPIC-9: Multi-Language (i18n)

**Öncelik:** ğŸŸ¢ DÜÅÜK
**Tahmini Süre:** 5–6 gün
**Neden Değerli:** Ã‡oklu dil desteği, platformun uluslararası pazarlara açılmasını sağlar. Başta Türkçe-İngilizce, ilerisi için Arapça, Almanca vb. genişletilebilir.

**Backend Task'lar:**
- `Translation` modeli: key-value çeviri sistemi veya JSON locale dosyaları.
- API response'larında `Accept-Language` header desteği.
- Kurs içeriklerinin çoklu dil desteği: aynı kursun farklı dil versiyonları.
- Admin çeviri yÃ¶netim endpoint'leri.

**Frontend Task'lar:**
- `next-intl` veya `react-i18next` entegrasyonu.
- Dil seçici: header'da dropdown (bayrak ikonu ile).
- Tüm statik metinlerin locale dosyalarına taşınması.
- RTL (sağdan sola) yazım desteği (Arapça için).
- Admin çeviri yÃ¶netim arayüzü: eksik çevirilerin tespiti ve düzenlenmesi.

---

## CLAUDE-EPIC-10: Gelişmiş Arama

**Öncelik:** ğŸŸ¢ DÜÅÜK
**Tahmini Süre:** 4–5 gün
**Neden Değerli:** Gelişmiş arama, büyüyen kurs kataloğunda keşfedilebilirliği artırır. Autosuggest ve akıllı filtreler dÃ¶nüşüm oranını iyileştirir.

**Backend Task'lar:**
- Elasticsearch veya Meilisearch entegrasyonu: kurs, eğitmen, kategori full-text arama.
- Autosuggest endpoint: `GET /api/v1/search/suggest?q=` (typing sırasında anlık Ã¶neriler).
- Gelişmiş filtreler: fiyat aralığı, puan, süre, dil, seviye, kategori.
- Arama analitiği: en çok aranan terimler, sonuçsuz aramalar loglama.
- Synonyms ve typo tolerance: yazım hatalarına dayanıklı arama.

**Frontend Task'lar:**
- Global arama çubuğu: header'da her sayfadan erişilebilir arama inputu.
- Autosuggest dropdown: kurs, eğitmen, kategori Ã¶nerileri (debounced).
- Arama sonuçları sayfası: sol tarafta filtreler, sağda sonuç kartları.
- Faceted navigation: filtre seçildikçe sonuçlar anlık güncellenmeli.
- "Aramanızla eşleşen sonuç bulunamadı" durumu için akıllı Ã¶neriler.

---

## UPDATE - NOTIFV2 CRM EXTENSIONS (2026-02-06)

- Sistem sablonlarina `crm_starter.html` eklendi ve admin sablon listesinde gorunur hale getirildi.
- CRM template editor alaninda solda HTML yazarken sagda canli iframe onizleme eklendi.
- Kampanya hedefleme akisi genisletildi:
  - Temel segmentler (all_students, active_teachers, verified_users, inactive_users)
  - Kayitli custom segment secimi
  - Secili kullanicilardan yeni segment olusturma ve kaydetme
- Custom campaign segment API endpointleri eklendi:
  - `GET /api/v1/admin/settings/email-campaigns/custom-segments`
  - `POST /api/v1/admin/settings/email-campaigns/custom-segments`
  - `DELETE /api/v1/admin/settings/email-campaigns/custom-segments/{segment_id}`
- Campaign send endpointi `custom_segment_id` parametresini destekler hale getirildi.

## HOTEPIC-CRM (2026-02-06)

### Tamamlananlar
- CRM merkezi tek baslik altinda toplandi (`CRM Merkezi` sekmesi).
- Sistem sablonlari panelinde olusturulan custom sablonlar ayri listede gorunur hale getirildi.
- CRM custom template editorunde solda HTML, sagda canli iframe onizleme aktif.
- Kampanya hedefleme modlari genisletildi:
  - Temel segment
  - Kayitli segment
  - Secili kullanici
- Kayitli segment duzenleme (isim/aciklama/kullanici listesi) eklendi.
- Kampanya gonderiminden once alici dry-run onizleme (toplam + ornek alicilar) eklendi.
- Backend tarafinda segment guncelleme endpointi eklendi:
  - `PUT /api/v1/admin/settings/email-campaigns/custom-segments/{segment_id}`
- Backend tarafinda alici onizleme endpointi eklendi:
  - `POST /api/v1/admin/settings/email-campaigns/preview-recipients`

### Kalanlar / Opsiyonel Iyilestirmeler
- Segment duzenleme ekranina toplu import/export (CSV) eklenebilir.
- Alici onizlemede filtre kirilimi (rol bazli dagilim) eklenebilir.
- Kampanya gonderimi icin zamanlama (schedule send) eklenebilir.
- [2026-02-06 Güncelleme] Sol menüde CRM başlığı açıldı ve altına 3 sayfa taşındı:
  - `/dashboard/admin/crm/audiences/create` (Kitle Oluşturma)
  - `/dashboard/admin/crm/audiences` (Kitle Görüntüleme)
  - `/dashboard/admin/crm/templates` (Mail Template Önizleme)
- Oluşturulan özel şablonlar tıklanabilir hale getirildi; sağ panelde önizleme gösterimi aktif.
- CRM ekranlarında kullanıcı metinleri Türkçe karakterlerle düzenlendi (Ş, Ö, Ü, Ğ, İ, Ç).
- [2026-02-06 Düzeltme] CRM Mail Template Önizleme sayfasına kampanya/kitleye mail gönderim arayüzü geri eklendi (segment seçimi + alıcı önizleme + gönderim).
- [2026-02-06 Düzeltme] Test mail endpointi doğrudan SMTP yerine EmailLog + Queue üzerinden çalışacak şekilde güncellendi; test mailleri artık Email Logları'nda görünür.
- [2026-02-06 Düzeltme-2] CRM içinde ayrı `Kampanya Başlat` sayfası açıldı: `/dashboard/admin/crm/campaigns`.
- [2026-02-06 Düzeltme-2] Mail Template Önizleme sayfası sadeleştirildi, kampanya gönderimi ayrı sayfaya taşındı.
- [2026-02-06 Düzeltme-2] Kampanya sayfasına Worker Durumu kartı eklendi (`/admin/email-logs/worker-health`).
- [2026-02-06 Düzeltme-3] `/admin/users` çağrısında 307/422 sorunu giderildi: endpoint slash'sız yolu da kabul ediyor ve CRM user listelerinde limit 100'e çekildi.
- [2026-02-06 Düzeltme-4] CRM Kitle Oluşturma sonrası liste cache invalidation eklendi; Kitle Görüntüleme ekranında yeni segment anında görünür.
- [2026-02-06 Düzeltme-4] `/admin/email-logs` endpointi slash'sız yolu da destekliyor; gereksiz 307 redirect kaldırıldı.
- [2026-02-06 Düzeltme-5] Kitle oluşturma/görüntüleme tutarsızlığı için SiteSettings tek-kayıt seçimi deterministik hale getirildi (`created_at ASC`).
- [2026-02-06 Düzeltme-5] CRM menüsüne `Mail Şablon Oluşturma` sayfası geri eklendi: `/dashboard/admin/crm/templates/create`.

- [2026-02-06 Duzeltme-6] Kitlelerin tek kayitta kalma kok nedeni giderildi: site_settings.custom_code icindeki email_custom_segments/email_custom_templates artik in-place mutate edilmiyor; immutable kopya ile yazilip SQLAlchemy'nin degisikligi her create/update isleminde kalici kaydetmesi saglandi.

- [2026-02-06 HOTEPIC-CRM-DB-REF] CRM kitle ve ozel mail sablonlari SiteSettings JSON'dan ayrildi; yeni tablolar eklendi: crm_audiences, crm_audience_members, crm_email_templates.
- [2026-02-06 HOTEPIC-CRM-DB-REF] /admin/settings altindaki custom-segment ve custom-template endpointleri API contract bozulmadan yeni CRM tablolara tasindi; legacy JSON veri runtime hydration + Alembic backfill ile korunuyor.
- [2026-02-06 HOTEPIC-CRM-DB-REF] Migration eklendi: backend/alembic/versions/20260211_add_crm_tables.py (schema + legacy backfill).

- [2026-02-06 HOTEPIC-CRM-API-ROOT] CRM endpointleri SiteSettings altindan temizlendi ve yeni root'a tasindi: /api/v1/admin/crm (templates, audiences, campaigns, system-templates).
- [2026-02-06 HOTEPIC-CRM-API-ROOT] SiteSettings altinda sadece site ayarlari ve SMTP test endpointi birakildi (/admin/settings, /admin/settings/email-test).

- [2026-02-06 HOTEPIC-CRM-OPT-1] CSV Import/Export tamamlandi: /api/v1/admin/crm/audiences/{segment_id}/export-csv ve /api/v1/admin/crm/audiences/{segment_id}/import-csv endpointleri eklendi; UI'da Kitle Goruntuleme ekranina baglandi.
- [2026-02-06 HOTEPIC-CRM-OPT-2] Alici onizlemede rol bazli kirilim eklendi (role_breakdown), hem kampanya hem kitle onizleme kartlarinda gosteriliyor.
- [2026-02-06 HOTEPIC-CRM-OPT-3] Kampanya zamanlama (schedule send) eklendi: schedule_at ile gonderimler delayed queue'ya dusuyor; response scheduled_for alaniyla planlanan zaman donuyor.

- [2026-02-06 EPIC5-FIX-1] Ogretmen banka hesabi guncelleme endpoint'i eklendi: `PUT /api/v1/teachers/me/bank-accounts/{account_id}`.
- [2026-02-06 EPIC5-FIX-1] Onayli/reddedilmis hesapta hassas alan degisirse hesap durumu otomatik `PENDING`'e cekiliyor (yeniden inceleme akisi).
- [2026-02-06 EPIC5-FIX-2] Cekim talebinde duplicate aktif talep engeli eklendi: ayni ogretmenin `PENDING/APPROVED` talebi varken yeni talep olusturulamiyor.
- [2026-02-06 EPIC5-FIX-3] Ogretmen profilindeki Banka Hesaplari sekmesine duzenle/sil/varsayilan yap aksiyonlari eklendi ve API'ye baglandi.
- [2026-02-06 EPIC5-FIX-4] Ogretmen profilindeki Cekim Talepleri sekmesine pending talep iptal aksiyonu geri eklendi.
- [2026-02-06 EPIC5-FIX-5] Profil ekraninda withdrawals sekmesi acikken banka hesaplari sorgusu da aktiflestirildi (approved hesap secimi bos gelme sorunu giderildi).

---

## EPIC-10: Eğitim İçerikleri & Storage Modülü

**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 7-10 Gün  
**Durum:** ⏳ PLANLANMIŞ

**Hedef:** Platform genelinde içerik yönetimini profesyonelleştirmek. Şu anda yalnızca video desteği var ve dosyalar yerel diske yazılıyor. Bu EPIC ile:
1. **Storage Abstraction Layer** kurulacak — şu an local disk, ancak tek bir config değişikliğiyle AWS S3 veya Google Cloud Storage'a geçilebilecek.
2. **Çoklu içerik tipi** desteği eklenecek — Video, PDF, DOCX, PPTX/PPT dosyaları yüklenebilecek ve önizlenebilecek.
3. **Ders düzenleme** akışı iyileştirilecek — sürükle-bırak sıralama, toplu içerik yükleme, içerik silme/güncelleme.
4. **Canlı ders** modülü eklenecek — hocalar canlı ders duyurusu yapabilecek, eski canlı derslerin kayıtlarını (video) yükleyebilecek.
5. **Öğrenci içerik deneyimi** iyileştirilecek — PDF/DOCX/PPTX inline önizleme, video player geliştirmeleri.

> [!TIP]
> **GEMINI-COMMENT:** Platform ölçeklendiğinde depolama maliyetlerini kontrol altında tutmak için eğitmen başına veya kurs başına "Storage Quota" (Depolama Kotası) sistemi eklenmesi ürünün sürdürülebilirliği açısından faydalı olacaktır.

---

### 🔴 BACKEND TASKS

---

#### [EP10-BE-01] Storage Abstraction Layer (Service)

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security: Mevcut kodda dosyalar belleğe tamamen alınıyor; yeni servis stream ve chunk desteklemeli, aksi halde büyük dosyada memory exhaustion riski var.
> - Security: Path traversal kontrolü sadece nokta karakteri kontrolüne bırakılmamalı; canonical path kontrolü ile MEDIA_ROOT dışına çıkış kesin engellenmeli.
> - Product: Upload çıktısı sadece path değil storage_key, access_url ve checksum içermeli; S3/GCS geçişinde veri bütünlüğü izlenebilir olur.
> - Product/Operasyon: Storage backend hata tipleri standardize edilmeli (NotFound, PermissionDenied, Transient) ki endpoint tarafında doğru HTTP map yapılabilsin.
> - Quality: Unit test seti traversal, unicode filename, parallel upload ve overwrite senaryolarını içermeli.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** Yok (ilk adım)

**Açıklama:**
Tüm dosya yükleme/indirme/silme işlemleri için tek bir soyutlama katmanı (`StorageService`) oluşturulacak. Mevcut `media.py` endpoint'indeki doğrudan `Path`/`open()` çağrıları bu servis üzerinden yapılacak. İleride S3 veya GCS backend'i eklendiğinde sadece bu servisin implementasyonu değişecek, tüketici kodlar aynen kalacak.

**Dosya:** `backend/app/services/storage_service.py`

**Gereksinimler:**
- `StorageBackend` abstract base class (ABC) tanımla:
  - `async upload(file_content: bytes, destination_path: str, content_type: str) -> str` — dosyayı yükle, erişim URL/path döndür
  - `async download(file_path: str) -> bytes` — dosyayı indir
  - `async delete(file_path: str) -> bool` — dosyayı sil
  - `async exists(file_path: str) -> bool` — dosya var mı kontrol et
  - `async get_url(file_path: str) -> str` — dosyanın erişim URL'ini döndür
  - `async get_signed_url(file_path: str, expires_in: int = 3600) -> str` — geçici erişim URL'i (S3/GCS için, local'de normal URL)
- `LocalStorageBackend(StorageBackend)` implementasyonu:
  - `MEDIA_ROOT` altına dosya yazma/okuma
  - Dizin otomatik oluşturma (`mkdir -p` mantığı)
  - Path traversal koruması (dosya adında `..`, `/`, `\` engelleme)
  - `get_url()` → `/api/v1/media/{subdir}/{filename}` formatında URL döndürme
  - `get_signed_url()` → local'de imzasız URL döndürme (S3/GCS'de gerçek signed URL olacak)
- `S3StorageBackend(StorageBackend)` stub implementasyonu (sadece raise NotImplementedError — ileride doldurulacak):
  - `bucket_name`, `region`, `access_key`, `secret_key` config'leri
  - boto3 entegrasyonu planı (docstring olarak)
- `GCSStorageBackend(StorageBackend)` stub implementasyonu (sadece raise NotImplementedError — ileride doldurulacak):
  - `bucket_name`, `project_id`, `credentials_path` config'leri
  - google-cloud-storage entegrasyonu planı (docstring olarak)
- `get_storage_backend() -> StorageBackend` factory fonksiyonu:
  - `settings.STORAGE_BACKEND` config'ine göre doğru backend'i döndür
  - Default: `"local"` → `LocalStorageBackend`
  - Desteklenen değerler: `"local"`, `"s3"`, `"gcs"`

**Config Değişiklikleri (`backend/app/core/config.py`):**
```python
# Storage settings
STORAGE_BACKEND: str = "local"  # "local", "s3", "gcs"
MEDIA_ROOT: str = "media"
VIDEOS_DIR: str = "videos"
THUMBNAILS_DIR: str = "thumbnails"
AVATARS_DIR: str = "avatars"
DOCUMENTS_DIR: str = "documents"  # YENİ: PDF/DOCX/PPTX dosyaları
LIVE_RECORDINGS_DIR: str = "live_recordings"  # YENİ: Canlı ders kayıtları

# S3 Settings (ileride kullanılacak)
S3_BUCKET_NAME: str = ""
S3_REGION: str = "eu-central-1"
S3_ACCESS_KEY: str = ""
S3_SECRET_KEY: str = ""
S3_ENDPOINT_URL: str | None = None  # MinIO gibi S3-compatible servisler için

# GCS Settings (ileride kullanılacak)
GCS_BUCKET_NAME: str = ""
GCS_PROJECT_ID: str = ""
GCS_CREDENTIALS_PATH: str = ""
```

**Kriterler:**
- ✅ Abstract base class ile polimorfik tasarım
- ✅ LocalStorageBackend tam çalışır durumda
- ✅ S3 ve GCS stub'ları hazır (raise NotImplementedError)
- ✅ Factory fonksiyonu config'e göre doğru backend seçimi
- ✅ **Path traversal koruması: `os.path.abspath` ve `os.path.commonpath` ile canonical path kontrolü (sadece ".." kontrolü yeterli değil)**
- ✅ **Stream ve chunk desteği: Büyük dosyalar için `async def upload_stream(stream: AsyncIterator[bytes], ...)` metodu (memory exhaustion önleme)**
- ✅ **Upload response genişletme: `storage_key`, `access_url`, `checksum` (MD5/SHA256) döndürme**
- ✅ **Standardize edilmiş hata tipleri: `StorageError`, `StorageNotFoundError`, `StoragePermissionDeniedError`, `StorageTransientError` (exception hierarchy)**
- ✅ Async/await uyumlu (asyncio file I/O kullanılmalı: `aiofiles`)
- ✅ **Unit test seti: path traversal (unicode filename, `..`, `/`, `\`), parallel upload, overwrite senaryoları, canonical path bypass denemeleri**
- ✅ Unit test'e uygun (dependency injection ile mock'lanabilir)

> [!IMPORTANT]
> **GEMINI-COMMENT:** `aiofiles` kullanımı async I/O için şart. Ancak güvenlik tarafında `LocalStorageBackend` implementasyonu yapılırken `MEDIA_ROOT` dışına çıkılmadığından emin olmak için `os.path.abspath` ve `os.path.commonpath` kontrolleri eklenmeli. Sadece ".." engellemek yeterli olmayabilir.

> [!IMPORTANT]
> **KONTROL NOTU:** `aiofiles` paketi `requirements.txt`'e eklenmelidir. Local backend'de `aiofiles.open()` kullanılmalı, bloklayan `open()` kullanılMAMALI. S3 backend'de `aioboto3`, GCS backend'de `gcloud-aio-storage` kullanılacak (ileride).

---

#### [EP10-BE-02] Mevcut Media Endpoint'lerini Storage Service'e Migrate Etme

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Critical Security: backend/app/api/v1/endpoints/media.py içinde is_public_course ve not current_user dalı non-preview videolara anonim erişim veriyor; bu EPIC kapsamında kapatılmalı.
> - Critical Security: Aynı dosyada token ve auth header değerleri loglanıyor; production loglarında token sızıntısı riski var, tamamen kaldırılmalı.
> - Security: content_path LIKE ile lesson bulma hatalı eşleşme riski taşır; tekil storage_key üzerinden birebir lookup yapılmalı.
> - Product/Perf: Frontend şu an videoyu blob olarak komple indiriyor; migration ile gerçek range streaming veya signed URL akışına geçilmezse büyük içerikte UX bozulur.
> - Quality: Regression testleri anonim kullanıcı, enrolled user, owner ve admin için video erişim matrisini doğrulamalı.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP10-BE-01

**Açıklama:**
Mevcut `backend/app/api/v1/endpoints/media.py` dosyasındaki tüm dosya I/O işlemleri `StorageService` üzerinden yapılacak şekilde refactor edilecek. Doğrudan `open()`, `Path.unlink()`, `Path.exists()` gibi çağrılar kaldırılacak.

**Etkilenen Fonksiyonlar:**
1. `upload_lesson_video()` → `storage.upload()` kullanacak
2. `stream_video()` → `storage.download()` veya `storage.get_url()` kullanacak
3. `delete_lesson_video()` → `storage.delete()` kullanacak
4. `upload_user_avatar()` → `storage.upload()` kullanacak
5. `get_avatar()` → `storage.get_url()` kullanacak

**Değişiklik Stratejisi:**
- `StorageService` Depends() ile inject edilecek
- Mevcut API contract'ları (request/response formatları) DEĞİŞMEYECEK
- Video streaming mantığı local backend'de `StreamingResponse` ile korunacak; S3'te `get_signed_url()` redirect olacak
- Thumbnail yükleme işlevi de bu migration'a dahil

**Kriterler:**
- ✅ Mevcut tüm video/avatar yükleme-indirme-silme akışları çalışır durumda
- ✅ Hiçbir doğrudan dosya sistemi erişimi kalmamış (tümü StorageService üzerinden)
- ✅ Mevcut API contract'ları korunmuş
- ✅ **CRITICAL: Anonim erişim kapatıldı — `is_public_course` ve `not current_user` dalı kaldırıldı, non-preview videolar sadece enrolled/owner/admin erişebilir**
- ✅ **CRITICAL: Token ve auth header loglama kaldırıldı — production loglarında token sızıntısı riski yok**
- ✅ **Storage key üzerinden lookup — `content_path LIKE` yerine `storage_key` (unique identifier) ile birebir eşleşme**
- ✅ **Range streaming veya signed URL — büyük videolar için blob indirme yerine HTTP Range Request desteği veya signed URL redirect**
- ✅ **Regression testleri: anonim kullanıcı (403), enrolled user (200), owner (200), admin (200) erişim matrisi doğrulandı**
- ✅ Video streaming performansı düşmemiş

---

#### [EP10-BE-03] LessonType Genişletme & İçerik Tipi Desteği

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security: Yeni tiplerle beraber lesson_type ve alan kombinasyonları için server-side kurallar şart (TEXT ise content_text, LIVE_LESSON ise live alanları), aksi halde bozuk veri artar.
> - Security: content_text HTML render edilecekse XSS yüzeyi oluşur; backend tarafında sanitize stratejisi (allowlist) tanımlanmalı.
> - Product: original_filename, mime_type ve file_size_bytes alanları sadece upload anında değil mevcut eski içerikler için de backfill planına ihtiyaç duyuyor.
> - Product: live_lesson_at timezone-aware tutulmalı; aksi halde öğrenci ve hoca saat farkı hataları oluşur.
> - Data Integrity: file_size_bytes >= 0 gibi constraint ve lesson_type indexi migration kapsamına eklenmeli.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-BE-01

**Açıklama:**
Mevcut `LessonType` enum'u genişletilecek ve yeni içerik tipleri eklenecek. Lesson modeline ek alanlar eklenecek.

**Dosya:** `backend/app/models/course.py`

**Mevcut LessonType:**
```python
class LessonType(str, enum.Enum):
    VIDEO = "video"
    PDF = "pdf"
    QUIZ = "quiz"
```

**Yeni LessonType:**
```python
class LessonType(str, enum.Enum):
    VIDEO = "video"          # Video dersi (mp4, webm, mov, avi, ogg)
    PDF = "pdf"              # PDF doküman
    DOCUMENT = "document"    # DOCX/DOC dosyası
    PRESENTATION = "presentation"  # PPTX/PPT sunum
    QUIZ = "quiz"            # Quiz/sınav
    LIVE_LESSON = "live_lesson"    # Canlı ders (henüz yapılmamış/kayıt yüklenecek)
    TEXT = "text"            # Metin/Rich Text içerik (content_text alanında saklanacak)
```

**Lesson Modeline Yeni Alanlar:**
```python
# Mevcut alanlar korunur, yeniler eklenir:
content_text: Mapped[str | None] = mapped_column(Text, nullable=True)  # TEXT tipi için rich text içerik
original_filename: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Orijinal dosya adı
file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Dosya boyutu (byte)
mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)  # MIME tipi (application/pdf, vb.)
thumbnail_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # İçerik önizleme thumbnail'i

# Canlı ders alanları
live_lesson_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Zoom/Meet/Teams linki
live_lesson_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)  # Canlı ders tarihi/saati
live_lesson_recording_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Kayıt dosya yolu
is_live_lesson_ended: Mapped[bool] = mapped_column(Boolean, default=False)  # Canlı ders sona erdi mi
```

**Alembic Migration:**
- Migration dosyası: `20260209_epic10_extend_lesson_types.py`
- Yeni enum değerleri PostgreSQL'e `ALTER TYPE` ile eklenecek (idempotent)
- Yeni kolonlar `ALTER TABLE lessons ADD COLUMN` ile eklenecek
- Mevcut veriler etkilenmeyecek (tüm yeni alanlar nullable)

**Kriterler:**
- ✅ Mevcut `VIDEO`, `PDF`, `QUIZ` tipleri çalışmaya devam ediyor
- ✅ Yeni tipler eklenmiş: `DOCUMENT`, `PRESENTATION`, `LIVE_LESSON`, `TEXT`
- ✅ **Server-side validation kuralları: `TEXT` ise `content_text` zorunlu, `LIVE_LESSON` ise `live_lesson_url` ve `live_lesson_at` zorunlu (Pydantic schema validation)**
- ✅ **XSS koruması: `content_text` için HTML sanitization stratejisi tanımlı (EP10-BE-13 ile entegre)**
- ✅ **Backfill planı: Mevcut eski içerikler için metadata doldurma script'i (EP10-BE-15)**
- ✅ **Timezone-aware datetime: `live_lesson_at` UTC olarak saklanıyor, frontend'de kullanıcı timezone'una göre gösteriliyor**
- ✅ **Data integrity: `file_size_bytes >= 0` constraint, `lesson_type` index eklendi**
- ✅ Migration idempotent (tekrar çalıştırıldığında hata vermez)
- ✅ Yeni alanlar nullable (mevcut dersler etkilenmez)

> [!IMPORTANT]
> **KONTROL NOTU:** PostgreSQL'de enum'a yeni değer eklemek için `ALTER TYPE lessontype ADD VALUE IF NOT EXISTS 'document';` kullanılmalı. Ayrıca LessonType enum'u veritabanında küçük harfle saklanıyor, bu yüzden enum value'ları küçük harf olmalı. Mevcut koddaki `Enum(LessonType)` kullanımı korunmalı.

---

#### [EP10-BE-04] Doküman Yükleme Endpoint'leri (PDF, DOCX, PPTX/PPT)

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Critical Security: Uzantı kontrolü tek başına yeterli değil; magic-byte MIME doğrulama zorunlu olmalı.
> - Security: Özellikle DOC ve DOCX ve PPTX için malware ve macro riski var; antivirus taraması (async) product kararına bağlanmalı.
> - Security: Content-Disposition için filename sanitize edilmeli; header injection ve unicode spoofing riskleri var.
> - Product: Inline ve attachment kararının tutarlı API sözleşmesi olmalı, frontend preview ve download akışları netleşmeli.
> - Quality: Unauthorized erişim, oversize upload, yanlış MIME, eski dosya cleanup ve rollback testleri yazılmalı.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP10-BE-01, EP10-BE-03

**Açıklama:**
Yeni içerik tiplerinin yüklenebilmesi için endpoint'ler oluşturulacak. Mevcut `upload_lesson_video` endpoint'i korunacak, yanına yeni endpoint'ler eklenecek.

**Dosya:** `backend/app/api/v1/endpoints/media.py` (mevcut dosyaya ekleme)

**Yeni Endpoint'ler:**

1. **`POST /api/v1/media/lessons/{lesson_id}/upload-document`** — PDF/DOCX/PPTX/PPT yükleme
   - İzin verilen uzantılar: `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`
   - Max dosya boyutu: `50MB` (config'den okunacak: `MAX_DOCUMENT_SIZE_MB`)
   - `lesson_type` otomatik set edilecek:
     - `.pdf` → `LessonType.PDF`
     - `.doc`, `.docx` → `LessonType.DOCUMENT`
     - `.ppt`, `.pptx` → `LessonType.PRESENTATION`
   - `original_filename`, `file_size_bytes`, `mime_type` kaydedilecek
   - `StorageService.upload()` kullanılacak
   - Ownership kontrolü (kurs sahibi veya admin)
   - Eski dosya varsa silinecek

2. **`GET /api/v1/media/documents/{filename}`** — Doküman indirme/görüntüleme
   - Erişim kontrolü: Enrollment, ownership veya admin
   - Preview dersler herkese açık
   - Content-Disposition header: `inline` (tarayıcıda görüntüleme) veya `attachment` (indirme) — query param ile seçilebilir
   - MIME type doğru set edilecek (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, vb.)
   - Cache headers

3. **`DELETE /api/v1/media/lessons/{lesson_id}/document`** — Doküman silme
   - Ownership kontrolü
   - `StorageService.delete()` kullanılacak
   - `content_path`, `original_filename`, `file_size_bytes`, `mime_type` null'a set edilecek

4. **`POST /api/v1/media/lessons/{lesson_id}/upload-content`** — Genel içerik yükleme (unified)
   - Dosya uzantısına göre otomatik tip belirleme
   - Hem video hem doküman hem sunum kabul eden tek endpoint
   - İzin verilen uzantılar: `.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`, `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`
   - Bu endpoint mevcut `upload-video` endpoint'inin yerini almayacak (backward compatibility), ama yeni UI bu endpoint'i kullanacak

**Config Değişiklikleri (`backend/app/core/config.py`):**
```python
MAX_DOCUMENT_SIZE_MB: int = 50  # 50MB max doküman boyutu
ALLOWED_DOCUMENT_EXTENSIONS: list[str] = [".pdf", ".doc", ".docx", ".ppt", ".pptx"]
ALLOWED_VIDEO_EXTENSIONS: list[str] = [".mp4", ".webm", ".ogg", ".mov", ".avi"]
ALLOWED_ALL_CONTENT_EXTENSIONS: list[str] = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".pdf", ".doc", ".docx", ".ppt", ".pptx"]
```

**MIME Type Mapping:**
```python
MIME_TYPE_MAP = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
}
```

**Kriterler:**
- ✅ PDF yükleme + indirme/görüntüleme çalışıyor
- ✅ DOCX yükleme + indirme çalışıyor
- ✅ PPTX/PPT yükleme + indirme çalışıyor
- ✅ Dosya boyutu limiti uygulanıyor
- ✅ **CRITICAL: Magic-byte MIME doğrulama — `python-magic` veya `libmagic` ile dosya içeriğinden (magic numbers) MIME type doğrulama (uzantı kontrolü tek başına yeterli değil)**
- ✅ **Security: Content-Disposition filename sanitize — header injection ve unicode spoofing önleme**
- ✅ **Security: Antivirus taraması (opsiyonel, async) — DOC/DOCX/PPTX için malware ve macro riski değerlendirmesi**
- ✅ Erişim kontrolü (enrollment/ownership/admin) uygulanıyor
- ✅ Eski dosya yüklendiğinde otomatik silinme
- ✅ `StorageService` üzerinden dosya I/O
- ✅ **Quality: Test suite — unauthorized erişim, oversize upload, yanlış MIME, eski dosya cleanup, rollback testleri**

> [!CAUTION]
> **GEMINI-COMMENT:** Sadece dosya uzantısına güvenmek güvenlik açığı yaratabilir. `python-magic` (veya `libmagic`) kullanarak dosya içeriğinden (magic numbers) MIME type doğrulaması yapmak, "pdf" süsü verilmiş executable veya script dosyalarının yüklenmesini önlemek için kritik öneme sahiptir.

> [!IMPORTANT]
> **KONTROL NOTU:** DOCX ve PPTX dosyaları binary formattır, tarayıcıda doğrudan önizlenemez. Frontend'de bu dosyalar için ya Google Docs Viewer embed'i (`https://docs.google.com/gview?url=...&embedded=true`) ya da bir dönüştürme servisi (LibreOffice headless) kullanılabilir. PDF ise tarayıcıda native olarak görüntülenebilir. Bu detay frontend task'larında ele alınacak.

---

#### [EP10-BE-05] Ders Sıralama & Toplu Güncelleme Endpoint'i

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security/Data Integrity: lesson_ids listesi için duplicate ve eksik veya ekstra ID validasyonu şart; kursun tam setiyle birebir eşleşme aranmalı.
> - Product: Reorder işleminde yarış durumu için optimistic lock veya versioning düşünülmeli; iki sekmede aynı anda sıralama veri kaybı yaratabilir.
> - Product: Ders silmede sadece dosya değil sıralama boşluklarının nasıl normalize edileceği (order reindex) netleştirilmeli.
> - Security: video_url ve live_lesson_url güncellemesi için https ve allowlist doğrulaması yapılmalı.
> - Quality: Transaction rollback testi olmalı (tek kayıt fail olursa tüm reorder geri alınmalı).
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** Yok

**Açıklama:**
Hocaların ders sıralamasını sürükle-bırak ile değiştirebilmesi için toplu sıralama endpoint'i. Ayrıca tek bir ders güncelleme (başlık, açıklama, is_preview, lesson_type, vb.) endpoint'i eklenecek.

**Dosya:** `backend/app/api/v1/endpoints/courses.py` (mevcut dosyaya ekleme)

**Yeni Endpoint'ler:**

1. **`PUT /api/v1/courses/{course_id}/lessons/reorder`** — Ders sıralama
   - Request body: `{"lesson_ids": ["id1", "id2", "id3", ...]}` — sıralı lesson ID listesi
   - Tüm lesson'ların `order` alanı yeni sıraya göre güncellenir
   - Ownership kontrolü (kurs sahibi veya admin)
   - Validasyon: Gönderilen lesson_id'lerin tümü bu kursa ait olmalı
   - Transaction ile atomik güncelleme

2. **`PATCH /api/v1/courses/{course_id}/lessons/{lesson_id}`** — Ders güncelleme
   - Güncellenebilir alanlar: `title`, `description`, `lesson_type`, `is_preview`, `video_url`, `duration_seconds`, `content_text`, `live_lesson_url`, `live_lesson_at`
   - Ownership kontrolü
   - Mevcut `content_path` ve dosyalar etkilenmez (dosya yükleme ayrı endpoint)

3. **`DELETE /api/v1/courses/{course_id}/lessons/{lesson_id}`** — Ders silme
   - Ownership kontrolü
   - İlişkili dosyayı `StorageService.delete()` ile sil
   - İlişkili `LessonProgress` kayıtlarını cascade sil
   - İlişkili `Quiz` kaydını cascade sil

**Pydantic Schema (`backend/app/schemas/course.py`):**
```python
class LessonUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    lesson_type: LessonType | None = None
    is_preview: bool | None = None
    video_url: str | None = None
    duration_seconds: int | None = None
    content_text: str | None = None
    live_lesson_url: str | None = None
    live_lesson_at: datetime | None = None
    order: int | None = None

class LessonReorderRequest(BaseModel):
    lesson_ids: list[str]  # Sıralı lesson ID listesi
```

**Kriterler:**
- ✅ **Data Integrity: `lesson_ids` listesi için duplicate, eksik ve ekstra ID validasyonu — kursun tam lesson setiyle birebir eşleşme kontrolü**
- ✅ **Race condition koruması: Optimistic lock veya versioning (iki sekmede aynı anda sıralama veri kaybı önleme)**
- ✅ **Order reindex: Ders silme sonrası sıralama boşlukları normalize ediliyor (order değerleri yeniden sıralanıyor)**
- ✅ **URL validation: `video_url` ve `live_lesson_url` güncellemesi için HTTPS ve domain allowlist doğrulaması (EP10-BE-13 ile entegre)**
- ✅ Ders sıralama atomik (ya hepsi ya hiçbiri, transaction rollback)
- ✅ Ders güncelleme tüm alanları destekliyor
- ✅ Ders silme ilişkili dosyaları da temizliyor
- ✅ Ownership kontrolü tüm endpoint'lerde
- ✅ Validasyon hataları anlamlı mesajlarla dönüyor
- ✅ **Quality: Transaction rollback testi (tek kayıt fail olursa tüm reorder geri alınmalı)**

---

#### [EP10-BE-06] Canlı Ders Yönetim Endpoint'leri

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security: live_lesson_url için javascript şeması ve phishing domain engeli olan URL validation zorunlu.
> - Product: Sadece create ve end değil reschedule ve cancel akışları da task kapsamına alınmalı; canlı ders operasyonunda bunlar temel ihtiyaç.
> - Product: Notification tipi mevcut modelle uyumlu olmalı (live_lesson_reminder, starting, cancelled zaten var), yeni enum eklemeden önce çakışma kaldırılmalı.
> - Security: Recording upload sadece ders sahibi ve admin ile sınırlandırılmalı, live olmayan derse upload engellenmeli.
> - Quality: Zaman bazlı filtreler (upcoming ve past) için timezone aware test yazılmalı.
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP10-BE-03, EP10-BE-01

**Açıklama:**
Hocaların canlı ders oluşturabilmesi, öğrencilere bildirim gönderebilmesi ve canlı ders sonrası kayıt yükleyebilmesi için endpoint'ler.

**Dosya:** `backend/app/api/v1/endpoints/courses.py` (mevcut dosyaya ekleme)

**Yeni Endpoint'ler:**

1. **`POST /api/v1/courses/{course_id}/lessons/live`** — Canlı ders oluşturma
   - Request body:
     ```json
     {
       "title": "Canlı Ders: Python Temelleri",
       "description": "İlk canlı dersimizde...",
       "live_lesson_url": "https://zoom.us/j/xxxxx",
       "live_lesson_at": "2026-02-15T14:00:00Z",
       "is_preview": false
     }
     ```
   - `lesson_type` otomatik `LIVE_LESSON` olarak set edilecek
   - `order` otomatik kursa ait en son ders sırasının +1'i olarak set edilecek
   - Ownership kontrolü
   - Opsiyonel: Tüm kayıtlı öğrencilere otomatik bildirim gönderme (`notify_students: bool = true`)
   - Bildirim tipi: `NotificationType.LIVE_LESSON` (mevcut notification modeline eklenecek)

2. **`POST /api/v1/media/lessons/{lesson_id}/upload-recording`** — Canlı ders kaydı yükleme
   - Sadece `lesson_type == LIVE_LESSON` olan dersler için
   - İzin verilen uzantılar: video formatları (`.mp4`, `.webm`, `.mov`, `.avi`)
   - `live_lesson_recording_path` alanına kaydedilir
   - `is_live_lesson_ended = True` olarak set edilir
   - `StorageService.upload()` kullanılacak

3. **`PATCH /api/v1/courses/{course_id}/lessons/{lesson_id}/end-live`** — Canlı dersi sonlandırma
   - `is_live_lesson_ended = True` olarak set eder
   - Kayıt yüklenmeden de canlı ders sonlandırılabilir

4. **`GET /api/v1/courses/{course_id}/live-lessons`** — Kursun canlı derslerini listele
   - Sadece `lesson_type == LIVE_LESSON` olan dersleri döndürür
   - Sıralama: `live_lesson_at DESC`
   - Filtreleme: `upcoming` (gelecek), `past` (geçmiş), `all`

**Notification Modeline Ekleme (`backend/app/models/notification.py`):**
```python
class NotificationType(str, enum.Enum):
    # ... mevcut tipler ...
    LIVE_LESSON = "live_lesson"  # YENİ: Canlı ders bildirimi
```

**Kriterler:**
- ✅ **CRITICAL: URL validation — `live_lesson_url` için JavaScript scheme ve phishing domain engeli (EP10-BE-13 ile entegre)**
- ✅ **Reschedule ve cancel akışları — canlı ders yeniden zamanlama ve iptal endpoint'leri (`PATCH /api/v1/courses/{course_id}/lessons/{lesson_id}/reschedule`, `POST /api/v1/courses/{course_id}/lessons/{lesson_id}/cancel`)**
- ✅ **Notification tipi kontrolü — mevcut `NotificationType` enum'unda `live_lesson_reminder`, `live_lesson_starting`, `live_lesson_cancelled` zaten varsa yeni enum eklenmeden kullanılmalı**
- ✅ **Recording upload yetki kontrolü — sadece ders sahibi ve admin, `lesson_type == LIVE_LESSON` kontrolü**
- ✅ Canlı ders oluşturma ve bildirim gönderme
- ✅ Canlı ders kaydı yükleme (video)
- ✅ Canlı ders sonlandırma
- ✅ Canlı ders listeleme (gelecek/geçmiş filtresi)
- ✅ Kayıtlı öğrencilere otomatik bildirim
- ✅ **Quality: Timezone-aware test — `upcoming` ve `past` filtreleri için timezone-aware datetime testleri**

> [!IMPORTANT]
> **KONTROL NOTU:** `NotificationType` enum'una yeni değer eklerken PostgreSQL migration'da `ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'live_lesson';` kullanılmalı. Mevcut `live_lesson` notification tipi zaten `NotificationType` enum'unda tanımlı olabilir — kontrol edilmeli, varsa tekrar eklenmemeli.

---

#### [EP10-BE-07] Ders İçerik Bilgisi Genişletme (Schema & Response)

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security: content_path gibi internal storage pathi direkt expose etmek riskli; clienta content_url veya signed_url dönme modeli tercih edilmeli.
> - Product: Responsea can_access ve requires_enrollment gibi alanlar eklenirse frontend koşullu render sadeleşir.
> - Product: Yeni alanlar optional kalmalı ama null semantiği dokümante edilmeli (boş string ve null ayrımı).
> - Quality: Backward compatibility için schema snapshot testleri eklenmeli.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** EP10-BE-03

**Açıklama:**
Mevcut `LessonResponse` Pydantic schema'sı genişletilerek yeni alanları (original_filename, file_size_bytes, mime_type, content_text, live_lesson_*, thumbnail_path) içerecek şekilde güncellenecek.

**Dosya:** `backend/app/schemas/course.py`

**Güncellenecek Schema:**
```python
class LessonResponse(LessonBase):
    id: str
    course_id: str
    content_path: str | None = None
    original_filename: str | None = None
    file_size_bytes: int | None = None
    mime_type: str | None = None
    content_text: str | None = None
    thumbnail_path: str | None = None
    live_lesson_url: str | None = None
    live_lesson_at: datetime | None = None
    live_lesson_recording_path: str | None = None
    is_live_lesson_ended: bool = False
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
```

**Kriterler:**
- ✅ Tüm yeni alanlar response'ta görünüyor
- ✅ Mevcut API consumer'lar etkilenmez (yeni alanlar optional)
- ✅ `updated_at` alanı eklendi

---

#### [EP10-BE-08] Thumbnail Yükleme Endpoint'i (Kurs & İçerik)

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security: Image decode sırasında decompression bomb koruması (Pillow limitleri) aktif edilmeli.
> - Security: EXIF metadata temizlenmeli; fotoğraflarda konum bilgisi sızıntısı engellenir.
> - Product: Eski thumbnail silme sırası kritik; önce yeni dosya ve DB commit, sonra eski dosya cleanup daha güvenli.
> - Product/Perf: Uzun cache kullanılıyorsa cache busting için versiyonlu filename veya hash şart.
> - Quality: Format dönüşümü (jpg/png -> webp) için kalite ve boyut regresyon testleri tanımlanmalı.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-BE-01

**Açıklama:**
Kurs kapak fotoğrafı (thumbnail) ve ders içerik önizleme görseli yüklemek için endpoint'ler.

**Dosya:** `backend/app/api/v1/endpoints/media.py` (mevcut dosyaya ekleme)

**Yeni Endpoint'ler:**

1. **`POST /api/v1/media/courses/{course_id}/upload-thumbnail`** — Kurs kapak fotoğrafı yükleme
   - İzin verilen uzantılar: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Max boyut: 5MB
   - Otomatik resize: 1280x720 (16:9 aspect ratio)
   - WebP formatına dönüştürme (performans için)
   - `Course.thumbnail_path` güncellenir
   - Eski thumbnail varsa silinir
   - `StorageService.upload()` kullanılacak

2. **`DELETE /api/v1/media/courses/{course_id}/thumbnail`** — Kurs thumbnail silme
   - `Course.thumbnail_path` null'a set edilir
   - Dosya `StorageService.delete()` ile silinir

3. **`GET /api/v1/media/thumbnails/{filename}`** — Thumbnail görüntüleme
   - Public erişim (auth gereksiz)
   - Cache headers (1 yıl)
   - Doğru content-type (`image/webp`)

**Kriterler:**
- ✅ Kurs thumbnail yükleme/silme/görüntüleme
- ✅ Otomatik resize ve format dönüştürme
- ✅ `StorageService` üzerinden dosya I/O
- ✅ Mevcut thumbnail akışı bozulmadan güncelleme

---

#### [EP10-BE-09] İçerik İstatistikleri Endpoint'i

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security: Admin overview endpointi tenant ve role izolasyonunu net korumalı; organization bazlı veri sızıntısı riski var.
> - Product: Bu task içinde quota kullanım metriği özellikle eklenmeli; EPIC hedefindeki storage sürdürülebilirliği için kritik.
> - Product/Perf: Büyük veri setinde realtime aggregate pahalı olur; materialized view veya periyodik precompute planı değerlendirilmeli.
> - Quality: İstatistik endpointleri için tutarlılık testi gerekli (lesson create ve delete sonrası sayıların doğru güncellenmesi).
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-BE-03

**Açıklama:**
Hocalar ve admin için kurs içerik istatistikleri endpoint'i. Toplam içerik sayısı, tip dağılımı, toplam dosya boyutu, vb.

**Dosya:** `backend/app/api/v1/endpoints/courses.py` (mevcut dosyaya ekleme)

**Yeni Endpoint'ler:**

1. **`GET /api/v1/courses/{course_id}/content-stats`** — Kurs içerik istatistikleri
   - Response:
     ```json
     {
       "total_lessons": 12,
       "total_duration_seconds": 7200,
       "total_file_size_bytes": 1073741824,
       "type_breakdown": {
         "video": 8,
         "pdf": 2,
         "document": 1,
         "presentation": 1,
         "live_lesson": 0,
         "quiz": 0,
         "text": 0
       },
       "has_preview_lessons": true,
       "preview_lesson_count": 2,
       "upcoming_live_lessons": 1,
       "completed_live_lessons": 0
     }
     ```
   - Ownership veya admin kontrolü

2. **`GET /api/v1/admin/content-overview`** — Platform geneli içerik istatistikleri (admin)
   - Toplam dosya sayısı ve boyutu (tip bazlı kırılım)
   - Storage kullanım yüzdesi (config'deki limitle karşılaştırma)
   - En çok içerik yükleyen eğitmenler
   - Son 30 gün içerik yükleme trendi

**Kriterler:**
- ✅ Kurs bazlı içerik istatistikleri
- ✅ Platform geneli istatistikler (admin)
- ✅ Tip bazlı kırılım

---

#### [EP10-BE-10] İçerik Arama & Filtreleme

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security: sort_by kesin allowlist ile sınırlandırılmalı; dinamik SQL sıralama injection riskine açık bırakılmamalı.
> - Product: Sadece type filtre yerine text search (title ve description) eklenirse task gerçek arama ihtiyacını karşılar.
> - Product: Pagination zorunlu olmalı; filtre endpointi limitsiz dönerse performans düşer.
> - Quality: Filtre kombinasyon testleri (lesson_type, has_content, is_live) yazılmalı.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** EP10-BE-03

**Açıklama:**
Ders listelerinde içerik tipine göre filtreleme desteği eklenmesi.

**Dosya:** `backend/app/api/v1/endpoints/courses.py` (mevcut dosyaya güncelleme)

**Güncellenecek Endpoint'ler:**

1. **`GET /api/v1/courses/{course_id}/lessons`** — Mevcut endpoint'e filtre ekleme
   - Yeni query parametreleri:
     - `lesson_type: LessonType | None` — tip filtreleme
     - `has_content: bool | None` — içerik yüklenmiş mi
     - `is_live: bool | None` — canlı ders mi
   - Sıralama seçeneği: `sort_by: str = "order"` (`order`, `created_at`, `duration_seconds`)

**Kriterler:**
- ✅ Tip bazlı filtreleme çalışıyor
- ✅ Mevcut endpoint'in backward compatibility'si korunuyor

---

#### [EP10-BE-11] Alembic Migration: EPIC-10 Veritabanı Değişiklikleri

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Data Risk: Tek migration dosyası rollback ve debug açısından zor olabilir; en azından enum ve tablo değişimi adımları açık bölümlere ayrılmalı.
> - Migration Risk: PostgreSQL enum alter işlemleri transaction davranışı nedeniyle dikkat ister; staging dry-run zorunlu.
> - Product: Downgradede enum value kaldırma teknik olarak sınırlı; bu kısıt migration notunda açık yazılmalı.
> - Quality: backend/app/main.py içindeki Base.metadata.create_all yaklaşımı Alembic ile drift yaratabilir; EPIC-10 öncesi strateji netleştirilmeli.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** EP10-BE-03, EP10-BE-06

**Açıklama:**
EPIC-10 kapsamındaki tüm veritabanı değişikliklerini tek bir Alembic migration dosyasında toplama.

**Dosya:** `backend/alembic/versions/20260209_epic10_education_content.py`

**Migration İçeriği:**
1. `LessonType` enum'una yeni değerler ekleme:
   - `ALTER TYPE lessontype ADD VALUE IF NOT EXISTS 'document';`
   - `ALTER TYPE lessontype ADD VALUE IF NOT EXISTS 'presentation';`
   - `ALTER TYPE lessontype ADD VALUE IF NOT EXISTS 'live_lesson';`
   - `ALTER TYPE lessontype ADD VALUE IF NOT EXISTS 'text';`
2. `lessons` tablosuna yeni kolonlar ekleme:
   - `content_text TEXT NULL`
   - `original_filename VARCHAR(500) NULL`
   - `file_size_bytes INTEGER NULL`
   - `mime_type VARCHAR(100) NULL`
   - `thumbnail_path VARCHAR(500) NULL`
   - `live_lesson_url VARCHAR(500) NULL`
   - `live_lesson_at TIMESTAMP NULL`
   - `live_lesson_recording_path VARCHAR(500) NULL`
   - `is_live_lesson_ended BOOLEAN DEFAULT FALSE NOT NULL`
   - `updated_at TIMESTAMP DEFAULT NOW()`
3. `NotificationType` enum'una `live_lesson` ekleme (eğer yoksa)
4. Index'ler:
   - `CREATE INDEX idx_lessons_lesson_type ON lessons(lesson_type);`
   - `CREATE INDEX idx_lessons_live_lesson_at ON lessons(live_lesson_at);`

**Kriterler:**
- ✅ Migration idempotent (tekrar çalıştırıldığında hata vermez)
- ✅ Downgrade fonksiyonu mevcut (rollback desteği)
- ✅ Mevcut veri bütünlüğü korunuyor

---

#### [EP10-BE-12] Doküman Dönüştürme Servisi (Opsiyonel)

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security: LibreOffice çağrısı shell injection riski taşır; komut argümanları sanitize edilmeli ve temp path izole edilmeli.
> - Security: Dönüştürme workerı resource limitli (CPU, RAM, timeout) izole ortamda çalışmalı; DoS riski var.
> - Product: Async task için durum endpointi (pending, processing, failed, done) net API olarak tanımlanmalı.
> - Product: Google Docs Viewer alternatifi veri gizliliği ve compliance etkisi nedeniyle riskli opsiyon olarak işaretlenmeli.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP10-BE-04

**Açıklama:**
DOCX ve PPTX dosyalarının PDF'e dönüştürülmesi (tarayıcıda önizleme için). Bu opsiyonel bir task'tır — Google Docs Viewer embed'i de alternatif olarak kullanılabilir.

**Dosya:** `backend/app/services/document_converter.py`

**Gereksinimler:**
- `python-pptx` ile PPTX okuma
- `python-docx` ile DOCX okuma
- LibreOffice headless (`soffice --headless --convert-to pdf`) ile dönüştürme (production'da Docker image'da LibreOffice olacak)
- Alternatif: `pdf2image` ile ilk sayfa thumbnail oluşturma
- Dönüştürülen PDF'i StorageService ile kaydetme
- Background task olarak çalışma (yükleme sırasında bloklamama)

**API:**
- `POST /api/v1/media/lessons/{lesson_id}/convert-to-pdf` — Dokümanı PDF'e dönüştür
- Async task olarak çalışacak, response: `{"status": "processing", "task_id": "..."}`
- Dönüştürme tamamlandığında `lesson.content_path` güncellenir (orijinal dosya korunur)

**Kriterler:**
- ✅ DOCX → PDF dönüştürme
- ✅ PPTX → PDF dönüştürme
- ✅ Background task (non-blocking)
- ✅ Orijinal dosya korunuyor

> [!IMPORTANT]
> **KONTROL NOTU:** Bu task opsiyoneldir. LibreOffice Docker bağımlılığı getirir. Alternatif olarak frontend'de Google Docs Viewer embed (`<iframe src="https://docs.google.com/gview?url=FILE_URL&embedded=true">`) kullanılabilir. Bu durumda dosyanın public erişilebilir bir URL'de olması gerekir (signed URL ile çözülebilir).

---

#### [EP10-BE-13] Security & Validation Service
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4-5 saat  
**Bağımlılık:** EP10-BE-01, EP10-BE-04

**Açıklama:**
Güvenlik ve validasyon işlemleri için merkezi bir servis oluşturulacak. Magic-byte MIME doğrulama, XSS sanitization, URL validation gibi kritik güvenlik kontrolleri bu servis üzerinden yapılacak.

**Dosya:** `backend/app/services/security_service.py`

**Gereksinimler:**

1. **MIME Type Magic-Byte Doğrulama:**
   - `python-magic` veya `libmagic` entegrasyonu
   - Dosya uzantısı yerine dosya içeriğinden (magic numbers) MIME type tespiti
   - Uzantı-MIME uyumsuzluğu tespiti ve reddetme
   - Whitelist tabanlı MIME type kontrolü

2. **XSS Sanitization:**
   - `content_text` alanı için HTML sanitization (allowlist tabanlı)
   - `bleach` veya `html-sanitizer` kütüphanesi kullanımı
   - İzin verilen HTML tag'leri: `<p>`, `<br>`, `<strong>`, `<em>`, `<ul>`, `<ol>`, `<li>`, `<a>` (href validation ile)
   - Script, iframe, object, embed tag'leri kesinlikle engellenmeli

3. **URL Validation:**
   - `video_url`, `live_lesson_url` için HTTPS zorunluluğu
   - Domain allowlist (Zoom, Google Meet, Microsoft Teams, YouTube, Vimeo)
   - Phishing domain engelleme (benzer domain tespiti)
   - JavaScript scheme engelleme (`javascript:`, `data:`)

4. **Filename Sanitization:**
   - Content-Disposition header için filename sanitization
   - Unicode spoofing önleme (normalize edilmiş filename)
   - Path traversal karakterleri temizleme
   - Max filename length kontrolü

**Kriterler:**
- ✅ Magic-byte MIME doğrulama çalışıyor (uzantı bypass denemeleri reddediliyor)
- ✅ XSS sanitization test edildi (script injection denemeleri temizleniyor)
- ✅ URL validation çalışıyor (phishing domain ve javascript scheme engelleniyor)
- ✅ Filename sanitization Content-Disposition header'ında uygulanıyor
- ✅ Unit test suite: tüm güvenlik bypass denemeleri test edildi

---

#### [EP10-BE-14] Storage Quota System
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP10-BE-01, EP10-BE-09

**Açıklama:**
Eğitmen başına veya kurs başına depolama kotası (storage quota) sistemi. Platform ölçeklendiğinde depolama maliyetlerini kontrol altında tutmak için kritik.

**Dosya:** `backend/app/services/quota_service.py`

**Gereksinimler:**

1. **Quota Model:**
   - `StorageQuota` modeli: `user_id`, `quota_bytes`, `used_bytes`, `reset_at`
   - Kurs bazlı quota (opsiyonel): `course_id`, `quota_bytes`, `used_bytes`
   - Default quota: Config'den (`DEFAULT_STORAGE_QUOTA_MB`)

2. **Quota Service:**
   - `check_quota(user_id: str, file_size: int) -> bool` — quota kontrolü
   - `reserve_quota(user_id: str, file_size: int) -> bool` — quota rezervasyonu
   - `release_quota(user_id: str, file_size: int)` — quota serbest bırakma
   - `get_quota_usage(user_id: str) -> dict` — kullanım bilgisi

3. **Upload Endpoint'lerine Entegrasyon:**
   - Dosya yükleme öncesi quota kontrolü
   - Quota aşıldığında `HTTPException(403, "Storage quota exceeded")`
   - Dosya silme sonrası quota güncelleme

4. **Admin Quota Yönetimi:**
   - `PUT /api/v1/admin/users/{user_id}/storage-quota` — quota güncelleme
   - `GET /api/v1/admin/storage-quotas` — tüm quota kullanımları listesi

**Config Değişiklikleri:**
```python
DEFAULT_STORAGE_QUOTA_MB: int = 1024  # 1GB default quota
MAX_STORAGE_QUOTA_MB: int = 10240  # 10GB max quota
QUOTA_RESET_PERIOD_DAYS: int = 30  # Aylık reset
```

**Kriterler:**
- ✅ Quota kontrolü upload endpoint'lerinde uygulanıyor
- ✅ Quota aşıldığında anlamlı hata mesajı
- ✅ Dosya silme sonrası quota otomatik güncelleniyor
- ✅ Admin quota yönetimi çalışıyor

---

#### [EP10-BE-15] Content Metadata Backfill Script
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP10-BE-03, EP10-BE-11

**Açıklama:**
Mevcut eski içerikler için `original_filename`, `mime_type`, `file_size_bytes` gibi metadata alanlarını dolduran backfill script'i.

**Dosya:** `backend/scripts/backfill_content_metadata.py`

**Gereksinimler:**
- Tüm `Lesson` kayıtlarını tarama
- `content_path` varsa dosyayı `StorageService` üzerinden okuma
- Dosya boyutu, MIME type, orijinal dosya adı (path'ten çıkarma) tespiti
- Batch update (1000'lik gruplar halinde)
- Dry-run modu (sadece rapor, değişiklik yapmama)
- Progress logging

**Kriterler:**
- ✅ Tüm eski içerikler için metadata dolduruldu
- ✅ Dry-run modu çalışıyor
- ✅ Batch update performanslı (timeout yok)
- ✅ Hata durumunda rollback mekanizması

---

#### [EP10-BE-16] Comprehensive Test Suite
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 6-8 saat  
**Bağımlılık:** EP10-BE-01 ~ EP10-BE-15

**Açıklama:**
EPIC-10 kapsamındaki tüm endpoint'ler ve servisler için kapsamlı test suite'i. Güvenlik, performans, veri bütünlüğü testleri.

**Dosya:** `backend/tests/test_epic10_*.py` (birden fazla test dosyası)

**Test Kategorileri:**

1. **Storage Service Tests:**
   - Path traversal denemeleri (unicode, `..`, `/`, `\`)
   - Canonical path bypass denemeleri
   - Parallel upload senaryoları
   - Overwrite senaryoları
   - Unicode filename desteği

2. **Media Endpoint Security Tests:**
   - Anonim erişim matrisi (anonim, enrolled, owner, admin)
   - Token loglama kontrolü (log dosyalarında token yok)
   - Storage key lookup doğruluğu
   - Range streaming doğruluğu

3. **Content Upload Tests:**
   - Magic-byte MIME doğrulama (uzantı bypass)
   - Oversize upload reddetme
   - Yanlış MIME type reddetme
   - Eski dosya cleanup
   - Rollback senaryoları

4. **Lesson Management Tests:**
   - Reorder transaction rollback
   - Duplicate lesson_id validasyonu
   - URL validation (phishing, javascript scheme)
   - Timezone-aware datetime testleri

5. **Live Lesson Tests:**
   - URL validation
   - Reschedule/cancel akışları
   - Notification gönderimi
   - Recording upload yetki kontrolü

6. **Quota System Tests:**
   - Quota aşımı reddetme
   - Quota güncelleme (upload/delete)
   - Admin quota yönetimi

**Kriterler:**
- ✅ Tüm test kategorileri kapsanmış
- ✅ Test coverage > 80%
- ✅ CI/CD pipeline'da otomatik çalışıyor
- ✅ Regression testleri mevcut

---

#### [EP10-BE-17] Performance Optimization (Range Streaming & Caching)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP10-BE-02, EP10-BE-04

**Açıklama:**
Büyük dosyalar için performans iyileştirmeleri: HTTP Range Request desteği, caching stratejisi, signed URL optimizasyonu.

**Gereksinimler:**

1. **Range Streaming:**
   - `StreamingResponse` ile HTTP Range Request desteği (`206 Partial Content`)
   - `Range` header parse ve doğru byte range döndürme
   - Local storage için `aiofiles` ile chunk okuma
   - S3/GCS için presigned URL ile range desteği

2. **Caching Strategy:**
   - Thumbnail ve avatar için agresif cache (1 yıl)
   - Video için conditional request (`ETag`, `Last-Modified`)
   - CDN entegrasyonu hazırlığı (Cache-Control header'ları)

3. **Signed URL Optimization:**
   - S3/GCS signed URL'ler için expiration time ayarlama
   - URL rotation (eski URL'lerin geçersiz olması)
   - Rate limiting (signed URL oluşturma)

**Kriterler:**
- ✅ Range streaming çalışıyor (büyük videolar için)
- ✅ Cache headers doğru set ediliyor
- ✅ Signed URL expiration çalışıyor
- ✅ Performance test: 500MB video için < 2s başlangıç süresi

---

#### [EP10-BE-18] Audit Logging & Monitoring
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP10-BE-01 ~ EP10-BE-17

**Açıklama:**
İçerik yönetimi operasyonları için audit logging ve monitoring. Güvenlik olayları, performans metrikleri, hata takibi.

**Gereksinimler:**

1. **Audit Log Model:**
   - `ContentAuditLog` modeli: `user_id`, `action` (upload, delete, update), `resource_type` (lesson, course), `resource_id`, `metadata` (JSON), `ip_address`, `user_agent`, `created_at`

2. **Logging Integration:**
   - Tüm upload/delete/update operasyonlarında audit log
   - Admin quota değişikliklerinde audit log
   - Güvenlik olayları (quota aşımı, unauthorized erişim, magic-byte mismatch)

3. **Monitoring Endpoints:**
   - `GET /api/v1/admin/audit-logs` — audit log listesi (filtreleme, sayfalama)
   - `GET /api/v1/admin/storage-metrics` — storage kullanım metrikleri (real-time)

4. **Alert System (Opsiyonel):**
   - Quota kullanımı %90'ı aştığında admin'e bildirim
   - Anormal upload aktivitesi tespiti (DoS koruması)

**Kriterler:**
- ✅ Tüm kritik operasyonlar audit log'lanıyor
- ✅ Audit log endpoint'i çalışıyor (filtreleme, sayfalama)
- ✅ Monitoring metrikleri real-time görüntüleniyor

---

### 🟣 FRONTEND TASKS

---

#### [EP10-FE-01] Storage Service API Client Güncellemesi

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Product: Mevcut frontend/src/lib/api.ts içinde lesson_type hala string; union typea geçiş runtime hata riskini ciddi azaltır.
> - Security: content_path string birleştirme yerine backendin döndüğü signed veya public URL kullanılmalı; path manipülasyon riski azalır.
> - Product: Büyük uploadlar için cancel ve retry desteği (AbortController) API client seviyesinde olmalı.
> - Quality: Yeni metotlar için frontend/src/__tests__/lib/api.test.ts kapsamı genişletilmeli.
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** EP10-BE-04, EP10-BE-06

**Açıklama:**
`frontend/src/lib/api.ts` dosyasına yeni endpoint'lerin API client metotlarını ekleme.

**Dosya:** `frontend/src/lib/api.ts`

**Yeni Interface'ler:**
```typescript
// Lesson tipi genişletme
export type LessonType = "video" | "pdf" | "document" | "presentation" | "quiz" | "live_lesson" | "text";

export interface LessonResponse {
  id: string;
  title: string;
  description: string | null;
  lesson_type: LessonType;
  content_path: string | null;
  video_url: string | null;
  duration_seconds: number | null;
  order: number;
  is_preview: boolean;
  course_id: string;
  original_filename: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  content_text: string | null;
  thumbnail_path: string | null;
  live_lesson_url: string | null;
  live_lesson_at: string | null;
  live_lesson_recording_path: string | null;
  is_live_lesson_ended: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface LessonUpdate {
  title?: string;
  description?: string;
  lesson_type?: LessonType;
  is_preview?: boolean;
  video_url?: string;
  duration_seconds?: number;
  content_text?: string;
  live_lesson_url?: string;
  live_lesson_at?: string;
  order?: number;
}

export interface LessonReorderRequest {
  lesson_ids: string[];
}

export interface CreateLiveLessonRequest {
  title: string;
  description?: string;
  live_lesson_url: string;
  live_lesson_at: string;
  is_preview?: boolean;
  notify_students?: boolean;
}

export interface ContentStats {
  total_lessons: number;
  total_duration_seconds: number;
  total_file_size_bytes: number;
  type_breakdown: Record<LessonType, number>;
  has_preview_lessons: boolean;
  preview_lesson_count: number;
  upcoming_live_lessons: number;
  completed_live_lessons: number;
}
```

**Yeni API Metotları (`mediaApi` genişletmesi):**
```typescript
export const mediaApi = {
  // ... mevcut metotlar ...
  uploadDocument: async (lessonId: string, file: File): Promise<UploadResponse> => { ... },
  uploadContent: async (lessonId: string, file: File): Promise<UploadResponse> => { ... },  // Unified
  deleteDocument: async (lessonId: string): Promise<{ message: string }> => { ... },
  uploadCourseThumbnail: async (courseId: string, file: File): Promise<UploadResponse> => { ... },
  deleteCourseThumbnail: async (courseId: string): Promise<{ message: string }> => { ... },
  uploadRecording: async (lessonId: string, file: File): Promise<UploadResponse> => { ... },
  getDocumentUrl: (filename: string) => `${API_URL}/api/v1/media/documents/${filename}`,
};

export const coursesApi = {
  // ... mevcut metotlar ...
  updateLesson: async (courseId: string, lessonId: string, data: LessonUpdate): Promise<LessonResponse> => { ... },
  deleteLesson: async (courseId: string, lessonId: string): Promise<{ message: string }> => { ... },
  reorderLessons: async (courseId: string, data: LessonReorderRequest): Promise<{ message: string }> => { ... },
  createLiveLesson: async (courseId: string, data: CreateLiveLessonRequest): Promise<LessonResponse> => { ... },
  endLiveLesson: async (courseId: string, lessonId: string): Promise<LessonResponse> => { ... },
  getLiveLessons: async (courseId: string, filter?: "upcoming" | "past" | "all"): Promise<LessonResponse[]> => { ... },
  getContentStats: async (courseId: string): Promise<ContentStats> => { ... },
};
```

**Kriterler:**
- ✅ Tüm yeni endpoint'ler için TypeScript interface'ler tanımlı
- ✅ API client metotları tam ve doğru
- ✅ Mevcut interface'ler genişletilmiş (backward compatible)

---

#### [EP10-FE-02] Ders Ekleme/Düzenleme Formu Yenileme

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Product: Mevcut sayfa dersi her zaman lesson_type video ile açıyor; dinamik tip formu bu teknik borcu kapatmalı.
> - Product: Formda tip bazlı validasyon ve unsaved changes koruması şart, aksi halde içerik kaybı yaşanır.
> - Security: Metin içeriği ve rich text alanında XSSe karşı sanitize pipeline frontend ve backend birlikte tasarlanmalı.
> - Quality: Drag and drop reorder için optimistic UI ve rollback senaryosu net olmalı.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4-5 saat  
**Bağımlılık:** EP10-FE-01

**Açıklama:**
Hoca "Kurslarım > Kurs Detay" sayfasındaki ders ekleme/düzenleme bölümünü tamamen yenilemek. Mevcut basit form yerine içerik tipine göre dinamik form.

**Dosya:** `frontend/src/app/(dashboard)/dashboard/my-courses/[id]/page.tsx` (mevcut dosyayı güncelleme)

**Yeni Özellikler:**

1. **İçerik Tipi Seçimi:**
   - Ders eklerken tip seçimi: Video, PDF, Doküman, Sunum, Canlı Ders, Metin, Quiz
   - Her tip için farklı form alanları gösterilecek:
     - **Video:** Video yükleme alanı + YouTube/Vimeo URL inputu + süre inputu
     - **PDF:** PDF yükleme alanı (drag & drop)
     - **Doküman:** DOCX yükleme alanı (drag & drop)
     - **Sunum:** PPTX/PPT yükleme alanı (drag & drop)
     - **Canlı Ders:** URL inputu + tarih/saat seçici + bildirim gönderme toggle'ı
     - **Metin:** Rich text editor (Tiptap veya basit textarea)
     - **Quiz:** Mevcut quiz oluşturma formu

2. **Sürükle-Bırak Sıralama:**
   - `@dnd-kit/core` veya `react-beautiful-dnd` ile ders kartlarını sürükle-bırak ile sıralama
   - Sıralama değiştiğinde otomatik `reorderLessons` API çağrısı
   - Animasyonlu geçiş (smooth reorder)

3. **Ders Kartı Tasarımı:**
   - Her ders kartında: Tip ikonu, başlık, açıklama (kısaltılmış), dosya bilgisi (boyut, format), preview badge, sürükle tutamağı
   - Kartın sağında: Düzenle, Sil, Video/Dosya Yükle/Değiştir butonları
   - Tip bazlı renk kodları:
     - Video: Mavi
     - PDF: Kırmızı
     - Doküman: Yeşil
     - Sunum: Turuncu
     - Canlı Ders: Mor
     - Metin: Gri
     - Quiz: Sarı

4. **Dosya Yükleme UX:**
   - Drag & drop area (dosya sürükle-bırak)
   - Progress bar (yükleme yüzdesi)
   - Dosya boyutu ve format validasyonu (client-side)
   - Yükleme tamamlandığında başarı animasyonu

**Tasarım:**
- Modern glassmorphism tarzında, mevcut yeşil tema ile uyumlu
- Responsive: Mobilde de kullanılabilir

**Kriterler:**
- ✅ 7 farklı içerik tipi için form desteği
- ✅ Sürükle-bırak sıralama
- ✅ Drag & drop dosya yükleme
- ✅ Yükleme progress bar'ı
- ✅ Responsive tasarım
- ✅ Mevcut ders ekleme/düzenleme akışı bozulmamış

---

#### [EP10-FE-03] İçerik Önizleme Bileşenleri

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Critical Product/Perf: Mevcut öğrenci sayfası videoyu fetch ve blob ile tamamen indiriyor; büyük videolarda bellek ve başlangıç süresi açısından kabul edilemez.
> - Security: dangerouslySetInnerHTML kullanılacaksa sanitization zorunlu (allowlist).
> - Security: Google Docs Viewer iframe kullanılırsa sandbox ve referrer policy dikkatle ayarlanmalı.
> - Product: Viewer bileşenleri için tutarlı error state (403, 404, processing) ve retry UX tanımlanmalı.
> - Quality: Her içerik tipi için E2E test eklenmeli (video, pdf, docx, pptx, live, text, quiz).
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4-5 saat  
**Bağımlılık:** EP10-FE-01

**Açıklama:**
Öğrenci ders izleme sayfasında (`/dashboard/courses/[courseId]/[lessonId]`) her içerik tipi için uygun önizleme/görüntüleme bileşeni.

**Dosya:** `frontend/src/app/(dashboard)/dashboard/courses/[courseId]/[lessonId]/page.tsx` (mevcut dosyayı güncelleme) + yeni bileşen dosyaları

**Yeni Bileşenler:**

1. **`frontend/src/components/content/VideoPlayer.tsx`** — Video oynatıcı
   - Mevcut video player mantığı ayrı bileşene taşınacak
   - HTML5 `<video>` player (local video) veya YouTube/Vimeo embed
   - İlerleme takibi (progress API'ye rapor)
   - Kontroller: play/pause, seek, volume, tam ekran, hız ayarı (0.5x, 1x, 1.5x, 2x)
   - Kaldığı yerden devam etme (watched_seconds)

2. **`frontend/src/components/content/PDFViewer.tsx`** — PDF görüntüleyici
   - `<iframe>` ile native PDF görüntüleme (basit ve güvenilir)
   - Alternatif: `react-pdf` kütüphanesi ile sayfa sayfa gösterim
   - Sayfa navigasyonu (ileri/geri)
   - Zoom in/out
   - İndirme butonu
   - Tam ekran görüntüleme

3. **`frontend/src/components/content/DocumentViewer.tsx`** — DOCX görüntüleyici
   - Google Docs Viewer embed: `<iframe src="https://docs.google.com/gview?url=FILE_URL&embedded=true">`
   - Veya: Backend'den PDF'e dönüştürülmüş versiyonu gösterme (EP10-BE-12 tamamlandıysa)
   - İndirme butonu (orijinal DOCX)
   - Dosya bilgisi (ad, boyut, format)

4. **`frontend/src/components/content/PresentationViewer.tsx`** — PPTX/PPT görüntüleyici
   - Google Docs Viewer embed (PPTX desteği var)
   - Veya: Backend'den PDF'e dönüştürülmüş versiyonu gösterme
   - İndirme butonu (orijinal dosya)
   - Dosya bilgisi

5. **`frontend/src/components/content/TextContent.tsx`** — Metin içerik görüntüleyici
   - Rich text render (dangerouslySetInnerHTML veya güvenli HTML parser)
   - Syntax highlighting (kod blokları için)
   - Responsive typography

6. **`frontend/src/components/content/LiveLessonCard.tsx`** — Canlı ders kartı
   - Duruma göre farklı görünüm:
     - **Yaklaşan:** Geri sayım sayacı + "Katıl" butonu (URL'e yönlendirme) + takvime ekle butonu
     - **Canlı (şu an):** Yanıp sönen "CANLI" badge + "Katıl" butonu
     - **Sona Ermiş (kayıt var):** Video player (kayıt)
     - **Sona Ermiş (kayıt yok):** "Kayıt henüz yüklenmedi" mesajı

7. **`frontend/src/components/content/ContentRenderer.tsx`** — Ana bileşen (switch)
   - `lesson.lesson_type`'a göre uygun alt bileşeni render eder
   - Loading state
   - Error state (dosya bulunamadı, erişim yok, vb.)

**Kriterler:**
- ✅ Her içerik tipi için uygun görüntüleme bileşeni
- ✅ Video: kaldığı yerden devam
- ✅ PDF: sayfa navigasyonu + zoom
- ✅ DOCX/PPTX: Google Docs Viewer veya PDF dönüştürme
- ✅ Canlı ders: durum bazlı görünüm
- ✅ Responsive ve modern tasarım

> [!CAUTION]
> **GEMINI-COMMENT:** Google Docs Viewer kullanırken dosyanın internete açık (public) bir URL'e sahip olması gerekir. Eğer kurs içerikleri S3/GCS'de private saklanıyorsa, Google Docs Viewer bu dosyalara erişemez. Bu durumda backend'de PDF'e dönüştürme (BE-12) veya frontend'de `react-doc-viewer` gibi client-side kütüphaneler daha güvenli ve tutarlı bir çözüm olacaktır.

---

#### [EP10-FE-04] Kurs Detay Sayfası Güncelleme (Public)

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Product: Mevcut public sayfa lesson badgei sadece video, pdf, quiz gösteriyor; yeni tipler eklenmezse EPIC hedefi görünmez kalır.
> - Security: Public sayfada preview dışı içerik URL veya meta sızmamalı; sadece erişilebilir öğeler render edilmeli.
> - Product: Canlı ders bölümünde timezone bilgisini kullanıcı locale ile gösterme kuralı netleştirilmeli.
> - Quality: İçerik dağılım özeti backend hesaplarıyla tutarlı olmalı (frontend manuel hesapta drift riski var).
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP10-FE-03

**Açıklama:**
Public kurs detay sayfasında (`/courses/[slug]`) ders listesinde içerik tiplerinin görselleştirilmesi.

**Dosya:** `frontend/src/app/courses/[slug]/page.tsx` (mevcut dosyayı güncelleme)

**Değişiklikler:**
1. Ders listesinde her dersin tipini gösteren ikon/badge
2. Canlı ders varsa öne çıkarma (upcoming live lessons section)
3. İçerik dağılımı özeti: "8 Video • 2 PDF • 1 Sunum • 1 Canlı Ders"
4. Toplam süre hesaplaması (video süreleri + tahmini okuma süreleri)
5. Preview içerikler için inline önizleme (PDF, video player direkt gösterim)

**Kriterler:**
- ✅ İçerik tipi ikonları/badge'leri gösteriliyor
- ✅ Canlı ders bölümü vurgulanmış
- ✅ İçerik dağılım özeti
- ✅ Toplam süre hesaplaması

---

#### [EP10-FE-05] Canlı Ders Yönetim Paneli (Hoca)

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security: Canlı ders URL inputunda sadece https ve bilinen meeting domainleri (Zoom, Meet, Teams) kabul edilmesi önerilir.
> - Product: Sadece create değil reschedule ve cancel akışı ve öğrenciye delta notification desteği de gereklidir.
> - Product: Kayıt yükleme adımında retry ve resume ve yükleme başarısızlığı durum mesajları net olmalı.
> - Quality: Live state hesaplaması client saatine değil backend zamanına dayanmalı.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP10-FE-01

**Açıklama:**
Hoca kurs detay sayfasında (`/dashboard/my-courses/[id]`) canlı ders oluşturma, yönetme ve kayıt yükleme arayüzü.

**Dosya:** `frontend/src/app/(dashboard)/dashboard/my-courses/[id]/page.tsx` (mevcut dosyayı güncelleme) + yeni bileşen

**Yeni Özellikler:**

1. **Canlı Ders Oluşturma Formu:**
   - Başlık inputu
   - Açıklama textarea
   - Platform linki inputu (Zoom/Meet/Teams URL) — URL validasyonu
   - Tarih/saat seçici (`datetime-local`)
   - Öğrencilere bildirim gönder toggle'ı (default: açık)
   - "Canlı Ders Oluştur" butonu

2. **Canlı Dersler Listesi:**
   - Ayrı bir sekme/bölüm: "Canlı Dersler"
   - Kartlarda: Tarih, başlık, platform, durum (yaklaşan/canlı/sona ermiş), kayıt durumu
   - Aksiyonlar:
     - Yaklaşan: Düzenle, İptal Et
     - Canlı: Sonlandır
     - Sona Ermiş (kayıt yok): Kayıt Yükle
     - Sona Ermiş (kayıt var): Kaydı İzle, Kaydı Sil

3. **Kayıt Yükleme:**
   - Sona ermiş canlı dersler için video yükleme
   - Progress bar
   - Yükleme tamamlandığında ders otomatik olarak "kayıtlı canlı ders" olarak işaretlenir

**Tasarım:**
- Mor tema (canlı dersleri diğer içerik tiplerinden ayırmak için)
- Glassmorphism efektleri
- Geri sayım sayacı (yaklaşan canlı dersler için)

**Kriterler:**
- ✅ Canlı ders oluşturma
- ✅ Canlı ders listeleme (durum bazlı)
- ✅ Kayıt yükleme
- ✅ Öğrencilere bildirim gönderme
- ✅ Responsive tasarım

---

#### [EP10-FE-06] Dosya Yükleme Bileşeni (Reusable)

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Product: Büyük dosyalar için chunked upload ve retry tasarımı eklenmezse bileşen yalnız küçük dosyalarda güvenilir olur.
> - Security: Sadece accept yeterli değil; server doğrulaması başarısız olduğunda hata mesajı kullanıcıya açık biçimde yansıtılmalı.
> - Product: Çoklu dosya modunda concurrency limiti tanımlanmalı (aynı anda sınırsız upload istemciyi kilitleyebilir).
> - Quality: Klavye erişilebilirliği ve screen reader etiketleri task kriterine eklenmeli.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** Yok (genel bileşen)

**Açıklama:**
Platform genelinde kullanılacak yeniden kullanılabilir dosya yükleme bileşeni.

**Dosya:** `frontend/src/components/ui/FileUpload.tsx`

**Özellikler:**
- Drag & drop alanı (görsel feedback: hover efekti, dosya tipi ikonu)
- Tıklayarak dosya seçme (native file input)
- Dosya tipi kısıtlama (accept prop ile)
- Dosya boyutu kısıtlama (maxSize prop ile, client-side validasyon)
- Yükleme progress bar'ı (axios onUploadProgress ile)
- Yükleme durumları: idle, uploading, success, error
- Yüklenen dosya önizleme:
  - Görsel dosyalar: küçük resim önizleme
  - PDF: PDF ikonu + dosya adı
  - Video: Video ikonu + dosya adı + boyut
  - Diğer: Genel dosya ikonu + dosya adı + boyut
- Dosya kaldırma butonu (X)
- Çoklu dosya desteği (opsiyonel prop)

**Props Interface:**
```typescript
interface FileUploadProps {
  accept?: string;           // ".pdf,.docx,.pptx"
  maxSizeMB?: number;        // Max dosya boyutu (MB)
  onUpload: (file: File) => Promise<void>;  // Yükleme fonksiyonu
  onRemove?: () => void;     // Dosya kaldırma
  currentFile?: {            // Mevcut yüklü dosya bilgisi
    name: string;
    size: number;
    url?: string;
  };
  disabled?: boolean;
  label?: string;
  description?: string;
  multiple?: boolean;        // Çoklu dosya
  className?: string;
}
```

**Tasarım:**
- Dashed border dropzone (yeşil tema)
- Animasyonlu hover efekti
- İkon: cloud upload
- Progress: linear gradient bar (teal → emerald)
- Success: yeşil check animasyonu
- Error: kırmızı X + hata mesajı

**Kriterler:**
- ✅ Drag & drop çalışıyor
- ✅ Dosya tipi ve boyut validasyonu
- ✅ Progress bar yükleme sırasında görünüyor
- ✅ Durum bazlı görsel feedback
- ✅ Reusable (platform genelinde kullanılabilir)
- ✅ Responsive

---

#### [EP10-FE-07] Öğrenci Ders Sidebar Güncelleme

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Product: Sidebar ikonları backend lesson_type ile birebir eşleşmeli; aksi halde yanlış içerik algısı oluşur.
> - Product: Canlı durum (yaklaşan, canlı, sona ermiş) backend timestamp bazlı hesaplanmalı, client clock drifte bırakılmamalı.
> - Product: Uzun kurslarda sidebar performansı için virtualization düşünülmeli.
> - Quality: Tamamlama durumu mevcut progress sistemiyle regresyon testine alınmalı.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-FE-03

**Açıklama:**
Öğrenci ders izleme sayfasındaki sol sidebar'da (ders listesi) içerik tiplerinin görselleştirilmesi.

**Dosya:** `frontend/src/app/(dashboard)/dashboard/courses/[courseId]/[lessonId]/page.tsx` (mevcut dosyayı güncelleme)

**Değişiklikler:**
1. Her dersin yanında tip ikonu (video, PDF, doküman, sunum, canlı ders, metin, quiz)
2. Dosya boyutu bilgisi (varsa)
3. Canlı dersler için özel görünüm:
   - Yaklaşan: tarih + saat + "Yaklaşan" badge
   - Canlı: yanıp sönen kırmızı nokta + "CANLI" badge
   - Sona ermiş: "Kayıt" veya "Kayıt Yok" badge
4. İçerik indirildi mi göstergesi (future: offline mode)
5. Tamamlanan derslerde yeşil check mark (mevcut özellik korunacak)

**Tip İkonları:**
- 🎬 Video → Film şeridi ikonu
- 📄 PDF → Kırmızı PDF ikonu
- 📝 Doküman → Yeşil doküman ikonu
- 📊 Sunum → Turuncu sunum ikonu
- 🔴 Canlı Ders → Kırmızı yayın ikonu
- ✍️ Metin → Gri metin ikonu
- ❓ Quiz → Sarı soru işareti ikonu

**Kriterler:**
- ✅ Tip ikonları doğru gösteriliyor
- ✅ Canlı ders durumları doğru render ediliyor
- ✅ Tamamlama göstergeleri korunuyor
- ✅ Responsive

---

#### [EP10-FE-08] Admin İçerik Yönetim Sayfası

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Security: Bu sayfada gösterilecek dosya adı ve eğitmen verisi için RBAC ve audit log zorunlu olmalı.
> - Security: CSV export düşünülüyorsa formula injection sanitize edilmeden export edilmemeli.
> - Product: Büyük veri için sayfa ilk yükte tüm metrikleri çekmemeli; lazy ve cacheli sorgu planı gerekli.
> - Product: Storage KPIlarında quota ve limit bilgisi olmadan yönetim değeri düşük kalır.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP10-FE-01

**Açıklama:**
Admin panelinde platform geneli içerik istatistikleri ve yönetim sayfası.

**Dosya:** `frontend/src/app/(dashboard)/dashboard/admin/content/page.tsx` (yeni dosya)

**Sayfanın İçeriği:**

1. **KPI Kartları:**
   - Toplam içerik sayısı
   - Toplam dosya boyutu (GB)
   - Bu ay yüklenen içerik sayısı (değişim yüzdesi)
   - Aktif canlı ders sayısı

2. **İçerik Dağılımı Grafiği:**
   - Pie chart: Tip bazlı içerik dağılımı (Video, PDF, DOCX, PPTX, Canlı Ders, Metin, Quiz)
   - Bar chart: Eğitmen bazlı içerik yükleme dağılımı

3. **Storage Kullanımı:**
   - Toplam kullanılan alan / Limit
   - Tip bazlı kullanım (Video en büyük dilimi alacak muhtemelen)
   - Trend grafiği (son 30 gün)

4. **Son Yüklenen İçerikler Tablosu:**
   - Kolon: Eğitmen, Kurs, Ders, Tip, Dosya Adı, Boyut, Yükleme Tarihi
   - Filtreler: Tip, Eğitmen, Tarih aralığı
   - Sıralama: Tarih, Boyut

**Tasarım:**
- Mevcut analytics sayfaları ile tutarlı glassmorphism tema
- Yeşil tonlar (emerald-teal)

**Kriterler:**
- ✅ KPI kartları doğru veri gösteriyor
- ✅ Grafikler (pie + bar) render ediliyor
- ✅ Storage kullanım bilgisi
- ✅ Tablo filtreleme ve sıralama

---

#### [EP10-FE-09] Kurs Oluşturma Wizard Güncelleme

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Product: Wizard adımlarında tip bazlı zorunlu alan validasyonu net değil; bu eksik kalırsa yarım ve bozuk lesson kayıtları oluşur.
> - Product: Draft autosave eklenmeli; çok adımlı formda veri kaybı ciddi UX problemi.
> - Security: Dosya upload adımı tamamlanmadan final submit engellenmeli, orphan dosya riski azaltılmalı.
> - Quality: Wizardın eski akışla backward compatibility testi yazılmalı.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP10-FE-06

**Açıklama:**
Yeni kurs oluşturma wizard'ındaki (adım 3: İçerik) bölümünü genişletme.

**Dosya:** `frontend/src/app/(dashboard)/dashboard/my-courses/new/page.tsx` (mevcut dosyayı güncelleme)

**Değişiklikler:**
1. "İçerik" adımında ders ekleme formunu genişletme:
   - İçerik tipi seçimi (radio/tab)
   - Seçilen tipe göre dinamik form
2. Thumbnail yükleme adımını (Medya) `FileUpload` bileşeniyle güncelleme
3. Kurs oluşturma sonrasında otomatik ders ekleme akışı:
   - "Kurs oluşturuldu, şimdi ilk dersinizi ekleyin" modal'ı

**Kriterler:**
- ✅ Wizard'da içerik tipi seçimi
- ✅ Thumbnail yükleme FileUpload bileşeni ile
- ✅ Mevcut wizard akışı bozulmamış

---

#### [EP10-FE-10] Dashboard Sidebar Güncelleme (Canlı Dersler Menüsü)

> [!NOTE]
> **CODEX-COMMENTS (Security + Product Audit):**
> - Product: Menü artışı bilgi mimarisini zorlayabilir; feature flag veya rol bazlı gösterim netleştirilmeli.
> - Security: Sidebar linkleri yalnız UI gizleme ile sınırlı kalmamalı, backend endpoint authorization birebir zorlanmalı.
> - Product: Canlı Dersler menüsünde badge count (yaklaşan ders sayısı) eklenirse kullanım değeri artar.
> - Quality: Active state ve nested route davranışı regression testine alınmalı.
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 1 saat  
**Bağımlılık:** EP10-FE-05

**Açıklama:**
Dashboard sidebar'a canlı dersler ile ilgili menü öğeleri ekleme.

**Dosya:** `frontend/src/app/(dashboard)/layout.tsx` (mevcut dosyayı güncelleme)

**Değişiklikler:**

1. **Öğrenci menüsüne:**
   - "Canlı Dersler" → `/dashboard/live-lessons` (opsiyonel — yaklaşan canlı dersler listesi)

2. **Hoca menüsüne:**
   - "Kurslar" grubu altına "Canlı Derslerim" → hoca'nın tüm canlı derslerini gösteren sayfa (opsiyonel)

3. **Admin menüsüne:**
   - "İçerik Yönetimi" → `/dashboard/admin/content` (EP10-FE-08)

**Kriterler:**
- ✅ Yeni menü öğeleri eklendi
- ✅ Active state doğru çalışıyor
- ✅ İkonlar uygun
- ✅ **Badge count (yaklaşan canlı ders sayısı) eklendi**
- ✅ **Backend authorization kontrolü (UI gizleme yeterli değil)**

---

#### [EP10-FE-11] Security & Validation (Client-Side)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP10-FE-01, EP10-FE-06

**Açıklama:**
Client-side güvenlik ve validasyon iyileştirmeleri. XSS koruması, URL validation, dosya validasyonu, form güvenliği.

**Gereksinimler:**

1. **XSS Sanitization (Rich Text):**
   - `content_text` alanı için HTML sanitization (client-side)
   - `DOMPurify` veya `sanitize-html` kütüphanesi
   - Tiptap editor'de sanitization pipeline

2. **URL Validation (Client-Side):**
   - `video_url`, `live_lesson_url` için HTTPS zorunluluğu
   - Domain allowlist kontrolü (Zoom, Meet, Teams, YouTube, Vimeo)
   - JavaScript scheme engelleme (`javascript:`, `data:`)

3. **File Validation (Client-Side):**
   - Dosya uzantısı kontrolü (client-side, server doğrulaması yine de şart)
   - Dosya boyutu kontrolü (max size)
   - MIME type kontrolü (File API ile)

4. **Form Security:**
   - Unsaved changes koruması (beforeunload event)
   - CSRF token kontrolü (axios interceptor)
   - Rate limiting feedback (429 response handling)

**Kriterler:**
- ✅ XSS sanitization çalışıyor (script injection denemeleri temizleniyor)
- ✅ URL validation çalışıyor (phishing domain ve javascript scheme engelleniyor)
- ✅ Dosya validasyonu client-side çalışıyor (server doğrulaması yine de şart)
- ✅ Form güvenliği uygulanmış (unsaved changes, CSRF)

---

#### [EP10-FE-12] Performance Optimization (Chunked Upload & Lazy Loading)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 4-5 saat  
**Bağımlılık:** EP10-FE-06, EP10-FE-03

**Açıklama:**
Büyük dosyalar için performans iyileştirmeleri: chunked upload, lazy loading, video streaming optimizasyonu.

**Gereksinimler:**

1. **Chunked Upload:**
   - Büyük dosyalar (> 50MB) için chunk'lara bölme
   - `FileUpload` bileşenine chunked upload desteği
   - Progress tracking (her chunk için)
   - Retry mekanizması (başarısız chunk'ları yeniden yükleme)
   - Resume desteği (yükleme yarıda kesilirse kaldığı yerden devam)

2. **Lazy Loading:**
   - Ders listelerinde lazy loading (virtual scrolling)
   - İçerik önizleme bileşenleri lazy load (sadece görünür olanlar render)
   - Video player lazy load (sadece aktif ders için)

3. **Video Streaming Optimization:**
   - Mevcut blob indirme yerine range streaming kullanımı
   - Video preloading (sonraki ders için)
   - Adaptive bitrate (gelecekte)

4. **AbortController Integration:**
   - Upload iptal desteği (AbortController)
   - API client seviyesinde cancel mekanizması

**Kriterler:**
- ✅ Chunked upload çalışıyor (500MB+ dosyalar için)
- ✅ Retry ve resume mekanizması çalışıyor
- ✅ Lazy loading uygulanmış (performans iyileşmesi)
- ✅ Video streaming optimize edilmiş (blob indirme yok)
- ✅ Upload iptal çalışıyor

---

#### [EP10-FE-13] Accessibility Improvements
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP10-FE-02, EP10-FE-06, EP10-FE-03

**Açıklama:**
Erişilebilirlik iyileştirmeleri: klavye navigasyonu, screen reader desteği, ARIA etiketleri, renk kontrastı.

**Gereksinimler:**

1. **Keyboard Navigation:**
   - Tüm interaktif elementler klavye ile erişilebilir
   - Tab order mantıklı
   - Focus indicator görünür
   - Escape tuşu ile modal/dropdown kapatma

2. **Screen Reader Support:**
   - ARIA labels ve descriptions
   - Form alanları için `aria-describedby`
   - Hata mesajları için `aria-live` regions
   - Loading state için `aria-busy`

3. **FileUpload Bileşeni:**
   - Drag & drop alanı için `role="button"` ve `aria-label`
   - Progress bar için `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
   - Hata mesajları için `aria-live="polite"`

4. **Color Contrast:**
   - WCAG AA seviyesi kontrast oranları (4.5:1 text, 3:1 UI)
   - Renk körlüğü için ikon + renk kombinasyonu

**Kriterler:**
- ✅ Klavye navigasyonu çalışıyor (tüm sayfalar)
- ✅ Screen reader test edildi (NVDA/JAWS)
- ✅ ARIA etiketleri doğru kullanılmış
- ✅ Renk kontrastı WCAG AA uyumlu

---

### 🔒 SECURITY & QUALITY TASKS

---

#### [EP10-SQ-01] Security Audit & Penetration Testing
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 6-8 saat  
**Bağımlılık:** EP10-BE-01 ~ EP10-BE-18, EP10-FE-01 ~ EP10-FE-13

**Açıklama:**
EPIC-10 kapsamındaki tüm güvenlik açıklarının tespiti ve penetration testing. OWASP Top 10 kontrolü.

**Gereksinimler:**

1. **Security Audit Checklist:**
   - Path traversal denemeleri (tüm endpoint'ler)
   - SQL injection denemeleri (parametreli sorgular kontrolü)
   - XSS denemeleri (content_text, form alanları)
   - CSRF koruması kontrolü
   - Authorization bypass denemeleri (role escalation)
   - File upload güvenlik testleri (malware, oversize, magic-byte bypass)

2. **Penetration Testing:**
   - Burp Suite veya OWASP ZAP ile otomatik tarama
   - Manuel test senaryoları (güvenlik uzmanı ile)
   - Raporlama ve önceliklendirme

3. **Dependency Scanning:**
   - `safety` veya `pip-audit` ile Python dependency güvenlik açıkları
   - `npm audit` ile frontend dependency güvenlik açıkları
   - Güncelleme planı

**Kriterler:**
- ✅ Tüm güvenlik açıkları tespit edildi ve düzeltildi
- ✅ Penetration test raporu hazır
- ✅ Dependency güvenlik açıkları giderildi
- ✅ OWASP Top 10 kontrolü tamamlandı

---

#### [EP10-SQ-02] Performance Testing & Load Testing
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 4-5 saat  
**Bağımlılık:** EP10-BE-17, EP10-FE-12

**Açıklama:**
Performans testleri ve load testing. Büyük dosya yükleme, eşzamanlı kullanıcı senaryoları, storage performansı.

**Gereksinimler:**

1. **Performance Benchmarks:**
   - 500MB video yükleme süresi (< 30s)
   - Range streaming başlangıç süresi (< 2s)
   - 1000 dersli kurs listesi render süresi (< 1s)
   - PDF/DOCX önizleme yükleme süresi (< 3s)

2. **Load Testing:**
   - Locust veya k6 ile load test
   - Senaryolar:
     - 100 eşzamanlı kullanıcı video yükleme
     - 500 eşzamanlı kullanıcı ders izleme
     - 50 eşzamanlı admin içerik yönetimi
   - Bottleneck tespiti ve optimizasyon

3. **Storage Performance:**
   - Local storage I/O performansı
   - S3/GCS performans karşılaştırması (stub test)
   - Quota kontrolü performans etkisi

**Kriterler:**
- ✅ Performance benchmark'lar karşılandı
- ✅ Load test raporu hazır (bottleneck'ler tespit edildi)
- ✅ Storage performansı kabul edilebilir seviyede

---

#### [EP10-SQ-03] Data Integrity & Backup Strategy
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP10-BE-01, EP10-BE-11

**Açıklama:**
Veri bütünlüğü kontrolleri ve yedekleme stratejisi. Orphan dosya temizleme, veri tutarlılığı, backup planı.

**Gereksinimler:**

1. **Data Integrity Checks:**
   - Orphan dosya tespiti (DB'de kayıt yok ama dosya var)
   - Orphan kayıt tespiti (DB'de kayıt var ama dosya yok)
   - Checksum doğrulama (upload edilen dosyaların bütünlüğü)
   - Migration sonrası veri tutarlılık kontrolü

2. **Cleanup Scripts:**
   - Orphan dosya temizleme script'i
   - Eski thumbnail temizleme (kullanılmayan)
   - Temp dosya temizleme

3. **Backup Strategy:**
   - Storage backup planı (local → S3/GCS geçişte)
   - Database backup entegrasyonu (mevcut backup sistemine)
   - Restore test senaryoları

**Kriterler:**
- ✅ Data integrity check script'i çalışıyor
- ✅ Orphan dosya temizleme otomatikleştirildi
- ✅ Backup stratejisi dokümante edildi
- ✅ Restore test başarılı

---

#### [EP10-SQ-04] Compliance & Privacy (GDPR, Data Retention)
**Durum:** ⏳ TODO  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP10-BE-18

**Açıklama:**
GDPR ve veri saklama politikası uyumluluğu. Kişisel veri işleme, veri silme hakkı, audit log saklama.

**Gereksinimler:**

1. **Data Retention Policy:**
   - Silinen içeriklerin ne kadar süre saklanacağı (soft delete)
   - Audit log saklama süresi (config'den)
   - Orphan dosyaların otomatik temizleme süresi

2. **GDPR Compliance:**
   - Kullanıcı veri silme hakkı (tüm içerikler dahil)
   - Export veri hakkı (kullanıcının tüm içerikleri)
   - Privacy policy güncellemesi

3. **Data Processing Documentation:**
   - Hangi verilerin nerede saklandığı
   - Veri işleme amaçları
   - Üçüncü taraf servisler (S3/GCS) ile veri paylaşımı

**Kriterler:**
- ✅ Data retention policy dokümante edildi
- ✅ GDPR uyumluluk kontrolü yapıldı
- ✅ Privacy policy güncellendi

---

#### [EP10-SQ-05] Documentation & Runbook
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP10-BE-01 ~ EP10-BE-18, EP10-FE-01 ~ EP10-FE-13

**Açıklama:**
EPIC-10 için kapsamlı dokümantasyon: API dokümantasyonu, deployment guide, troubleshooting runbook, operasyonel prosedürler.

**Gereksinimler:**

1. **API Documentation:**
   - Yeni endpoint'ler için OpenAPI/Swagger dokümantasyonu
   - Request/response örnekleri
   - Error code'ları ve anlamları

2. **Deployment Guide:**
   - Storage backend geçiş adımları (local → S3/GCS)
   - Config değişiklikleri
   - Migration çalıştırma adımları
   - Rollback prosedürü

3. **Troubleshooting Runbook:**
   - Yaygın sorunlar ve çözümleri
   - Quota aşımı durumu
   - Storage backend hataları
   - Performance sorunları

4. **Operational Procedures:**
   - Quota yönetimi
   - Orphan dosya temizleme
   - Backup ve restore
   - Monitoring ve alerting

**Kriterler:**
- ✅ API dokümantasyonu tamamlandı
- ✅ Deployment guide hazır
- ✅ Troubleshooting runbook hazır
- ✅ Operasyonel prosedürler dokümante edildi

---

### 📝 UYGULAMA NOTLARI

#### Bağımlılık Sırası (Önerilen Uygulama Akışı)

```
EP10-BE-01 (Storage Service)
    ├── EP10-BE-02 (Media Migration)
    ├── EP10-BE-03 (LessonType Genişletme)
    │   ├── EP10-BE-04 (Doküman Endpoint'leri)
    │   │   └── EP10-BE-13 (Security & Validation Service)
    │   ├── EP10-BE-06 (Canlı Ders Endpoint'leri)
    │   ├── EP10-BE-07 (Schema Genişletme)
    │   ├── EP10-BE-09 (İçerik İstatistikleri)
    │   │   └── EP10-BE-14 (Storage Quota System)
    │   └── EP10-BE-15 (Content Metadata Backfill)
    ├── EP10-BE-05 (Ders Sıralama)
    ├── EP10-BE-08 (Thumbnail Endpoint'leri)
    ├── EP10-BE-11 (Alembic Migration) [TÜM BE task'lardan sonra]
    ├── EP10-BE-17 (Performance Optimization)
    └── EP10-BE-18 (Audit Logging & Monitoring)

EP10-FE-06 (FileUpload Bileşeni) [bağımsız]
EP10-FE-01 (API Client) [BE task'lar tamamlandıktan sonra]
    ├── EP10-FE-02 (Ders Ekleme/Düzenleme)
    │   └── EP10-FE-11 (Security & Validation Client)
    ├── EP10-FE-03 (İçerik Önizleme)
    │   ├── EP10-FE-04 (Public Kurs Detay)
    │   ├── EP10-FE-07 (Öğrenci Sidebar)
    │   └── EP10-FE-12 (Performance Optimization)
    ├── EP10-FE-05 (Canlı Ders Paneli)
    ├── EP10-FE-08 (Admin İçerik Yönetim)
    ├── EP10-FE-09 (Wizard Güncelleme)
    ├── EP10-FE-10 (Sidebar Güncelleme)
    └── EP10-FE-13 (Accessibility Improvements)

EP10-BE-12 (Doküman Dönüştürme) [opsiyonel, en son]

EP10-SQ-01 (Security Audit) [TÜM task'lardan sonra]
EP10-SQ-02 (Performance Testing) [EP10-BE-17, EP10-FE-12 sonrası]
EP10-SQ-03 (Data Integrity) [EP10-BE-01, EP10-BE-11 sonrası]
EP10-SQ-04 (Compliance & Privacy) [EP10-BE-18 sonrası]
EP10-SQ-05 (Documentation) [TÜM task'lardan sonra]
```

#### Kullanılacak Yeni Paketler

**Backend:**
- `aiofiles` — Async dosya I/O (LocalStorageBackend için) **[ZORUNLU]**
- `python-magic` veya `libmagic` — Magic-byte MIME type doğrulama (EP10-BE-13) **[ZORUNLU - Güvenlik]**
- `bleach` veya `html-sanitizer` — XSS sanitization (EP10-BE-13) **[ZORUNLU - Güvenlik]**
- `Pillow` — Zaten mevcut (avatar resize için), thumbnail resize için de kullanılacak
- `python-pptx` — PPTX okuma/dönüştürme (opsiyonel, EP10-BE-12)
- `python-docx` — DOCX okuma/dönüştürme (opsiyonel, EP10-BE-12)
- `aioboto3` — S3 async client (ileride, S3 backend için)
- `gcloud-aio-storage` — GCS async client (ileride, GCS backend için)
- `locust` veya `k6` — Load testing (EP10-SQ-02) **[Opsiyonel - Test]**

**Frontend:**
- `@dnd-kit/core` + `@dnd-kit/sortable` — Sürükle-bırak sıralama
- `react-pdf` — PDF görüntüleme (opsiyonel, native iframe ile de yapılabilir)
- `DOMPurify` veya `sanitize-html` — XSS sanitization (EP10-FE-11) **[ZORUNLU - Güvenlik]**
- `react-window` veya `react-virtualized` — Virtual scrolling (EP10-FE-12) **[Opsiyonel - Performans]**

#### Storage Backend Geçiş Stratejisi

```
┌─────────────────┐     config değişikliği     ┌──────────────────┐
│  Local Storage   │  ─────────────────────>    │   AWS S3 / GCS   │
│  (şu an aktif)   │    STORAGE_BACKEND=s3     │   (gelecekte)     │
│                   │    + S3 credentials        │                   │
│  media/           │                            │  s3://bucket/     │
│  ├── videos/      │                            │  ├── videos/      │
│  ├── thumbnails/  │                            │  ├── thumbnails/  │
│  ├── avatars/     │                            │  ├── avatars/     │
│  ├── documents/   │                            │  ├── documents/   │
│  └── live_rec./   │                            │  └── live_rec./   │
└─────────────────┘                             └──────────────────┘
```

Geçiş sırasında:
1. S3/GCS backend implementasyonunu tamamla (stub'ları doldur)
2. `STORAGE_BACKEND=s3` (veya `gcs`) olarak config'i değiştir
3. Mevcut dosyaları migration script ile S3'e taşı
4. URL formatını güncelle (signed URL kullanımı)
5. CDN entegrasyonu (CloudFront / Cloud CDN) — opsiyonel performans iyileştirme

---

## 🎯 EPIC-10-EXTRA-QUIZ: Quiz Sistemi Tamamlama

**Durum:** ⏳ PLANLANMIŞ  
**Öncelik:** 🔴 YÜKSEK  
**Backend:** 0/12 (EP10-QUIZ-BE-01 ~ EP10-QUIZ-BE-12)  
**Frontend:** 0/10 (EP10-QUIZ-FE-01 ~ EP10-QUIZ-FE-10)  
**Açıklama:** Mevcut quiz modelleri ve temel endpoint'ler var, ancak sistem tam olarak tamamlanmamış. Quiz oluşturma, soru yönetimi, öğrenci quiz çözme, sonuç gösterimi ve istatistikler için kapsamlı geliştirme gerekiyor.

**Mevcut Durum:**
- ✅ Quiz, QuizQuestion, QuizAttempt, QuizAttemptAnswer modelleri mevcut
- ✅ Temel CRUD endpoint'leri var (create_quiz, get_quiz, add_question, start_attempt, submit_attempt)
- ❌ Frontend entegrasyonu yok
- ❌ Quiz edit/delete endpoint'leri eksik
- ❌ Soru düzenleme/silme endpoint'leri eksik
- ❌ Quiz istatistikleri ve raporlama eksik
- ❌ Quiz önizleme ve test modu eksik
- ❌ Öğrenci quiz geçmişi ve sonuçları görüntüleme eksik

---

### 🔴 BACKEND TASKS - QUIZ

#### [EP10-QUIZ-BE-01] Quiz CRUD Endpoint'leri Tamamlama
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** Mevcut quiz modelleri

**Açıklama:**
Mevcut `create_quiz` ve `get_quiz` endpoint'lerine ek olarak, quiz güncelleme ve silme endpoint'leri ekle.

**Gereksinimler:**

1. **Update Quiz Endpoint:**
   - `PUT /api/v1/quizzes/{quiz_id}`
   - Quiz ayarlarını güncelle (title, description, passing_score, time_limit_minutes, max_attempts, shuffle_questions, show_correct_answers)
   - Yetki kontrolü: Sadece quiz'in sahibi (course owner) veya admin
   - Validation: passing_score 0-100 arası, time_limit_minutes pozitif, max_attempts pozitif

2. **Delete Quiz Endpoint:**
   - `DELETE /api/v1/quizzes/{quiz_id}`
   - Quiz'i ve tüm ilişkili verileri sil (cascade delete: questions, attempts, answers)
   - Yetki kontrolü: Sadece quiz'in sahibi (course owner) veya admin
   - Soft delete değil, hard delete (veritabanından tamamen kaldır)

3. **List Quizzes Endpoint:**
   - `GET /api/v1/quizzes?course_id={course_id}&lesson_id={lesson_id}`
   - Kurs veya ders bazlı quiz listesi
   - Pagination desteği (skip, limit)
   - Filtreleme: course_id, lesson_id
   - Response: Quiz listesi (id, title, lesson_id, question_count, attempt_count)

**Kriterler:**
- ✅ Update endpoint çalışıyor ve validation yapıyor
- ✅ Delete endpoint cascade delete yapıyor
- ✅ List endpoint pagination ve filtreleme destekliyor
- ✅ Yetki kontrolleri doğru çalışıyor
- ✅ Error handling ve HTTP status kodları doğru

---

#### [EP10-QUIZ-BE-02] Quiz Soru Yönetimi Endpoint'leri
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat  
**Bağımlılık:** EP10-QUIZ-BE-01

**Açıklama:**
Mevcut `add_question` endpoint'ine ek olarak, soru güncelleme, silme, sıralama ve toplu işlem endpoint'leri ekle.

**Gereksinimler:**

1. **Update Question Endpoint:**
   - `PUT /api/v1/quizzes/{quiz_id}/questions/{question_id}`
   - Soru metni, tipi, seçenekleri, doğru cevabı, puanı, açıklamasını güncelle
   - Yetki kontrolü: Quiz sahibi veya admin
   - Validation: question_type geçerli enum değeri, options multiple_choice için gerekli, correct_answer gerekli

2. **Delete Question Endpoint:**
   - `DELETE /api/v1/quizzes/{quiz_id}/questions/{question_id}`
   - Soruyu sil (cascade: attempt_answers silinir)
   - Yetki kontrolü: Quiz sahibi veya admin
   - Silme sonrası diğer soruların order'ını güncelle

3. **Reorder Questions Endpoint:**
   - `PUT /api/v1/quizzes/{quiz_id}/questions/reorder`
   - Soruların sırasını güncelle
   - Request body: `{ "question_ids": ["id1", "id2", ...] }`
   - Order'ı yeni sıraya göre güncelle

4. **Bulk Add Questions Endpoint:**
   - `POST /api/v1/quizzes/{quiz_id}/questions/bulk`
   - Birden fazla soruyu tek seferde ekle
   - Request body: `{ "questions": [QuizQuestionCreate, ...] }`
   - Transaction içinde toplu ekleme

5. **Get Quiz Questions Endpoint:**
   - `GET /api/v1/quizzes/{quiz_id}/questions`
   - Quiz'in tüm sorularını listele (order'a göre sıralı)
   - Öğrenci için: correct_answer ve explanation gizlenebilir (quiz.show_correct_answers kontrolü)
   - Öğretmen/admin için: Tüm detaylar gösterilir

**Kriterler:**
- ✅ Tüm CRUD işlemleri çalışıyor
- ✅ Reorder işlemi doğru çalışıyor
- ✅ Bulk add transaction içinde yapılıyor
- ✅ Öğrenci için doğru cevap gizleme mantığı çalışıyor
- ✅ Validation ve error handling tam

---

#### [EP10-QUIZ-BE-03] Quiz Deneme Yönetimi Geliştirme
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-QUIZ-BE-01

**Açıklama:**
Mevcut `start_attempt` ve `submit_attempt` endpoint'lerini geliştir, eksik özellikleri ekle.

**Gereksinimler:**

1. **Save Attempt Progress Endpoint:**
   - `PUT /api/v1/quizzes/attempts/{attempt_id}/progress`
   - Quiz çözülürken cevapları kaydet (otomatik kaydetme)
   - Request body: `{ "answers": [{"question_id": "...", "answer_text": "..."}, ...] }`
   - Attempt durumu `IN_PROGRESS` kalır, cevaplar güncellenir

2. **Get Attempt with Questions Endpoint:**
   - `GET /api/v1/quizzes/attempts/{attempt_id}?include_questions=true`
   - Deneme detayını sorularla birlikte getir
   - Öğrenci için: Doğru cevaplar sadece tamamlandıktan sonra gösterilir (quiz.show_correct_answers kontrolü)
   - Öğretmen için: Her zaman tüm detaylar gösterilir

3. **Abandon Attempt Endpoint:**
   - `PUT /api/v1/quizzes/attempts/{attempt_id}/abandon`
   - Denemeyi yarıda bırak (status: ABANDONED)
   - Zaman limiti kontrolü yapılır, süre dolmuşsa otomatik abandon

4. **Time Limit Validation:**
   - `start_attempt` ve `submit_attempt` endpoint'lerinde zaman limiti kontrolü
   - Süre dolmuşsa attempt otomatik olarak `ABANDONED` yapılır
   - Frontend'e kalan süre bilgisi döndürülür

5. **List User Attempts Endpoint:**
   - `GET /api/v1/quizzes/{quiz_id}/attempts/my`
   - Kullanıcının bir quiz için tüm denemelerini listele
   - Response: Attempt listesi (id, score_percentage, status, completed_at, time_taken_seconds)
   - Sıralama: completed_at DESC (en yeni önce)

**Kriterler:**
- ✅ Progress kaydetme çalışıyor
- ✅ Zaman limiti kontrolü doğru çalışıyor
- ✅ Abandon işlemi çalışıyor
- ✅ Attempt listesi doğru dönüyor
- ✅ Doğru cevap gizleme mantığı çalışıyor

---

#### [EP10-QUIZ-BE-04] Quiz İstatistikleri ve Raporlama
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat  
**Bağımlılık:** EP10-QUIZ-BE-03

**Açıklama:**
Öğretmenler için quiz performans istatistikleri ve öğrenci bazlı raporlama endpoint'leri.

**Gereksinimler:**

1. **Quiz Statistics Endpoint:**
   - `GET /api/v1/quizzes/{quiz_id}/statistics`
   - Quiz genel istatistikleri
   - Response:
     - `total_attempts`: Toplam deneme sayısı
     - `completed_attempts`: Tamamlanan deneme sayısı
     - `average_score`: Ortalama puan (yüzde)
     - `pass_rate`: Geçme oranı (passing_score'a göre)
     - `average_time_taken`: Ortalama süre (saniye)
     - `question_statistics`: Her soru için doğru/yanlış sayıları

2. **Question Statistics Endpoint:**
   - `GET /api/v1/quizzes/{quiz_id}/questions/{question_id}/statistics`
   - Belirli bir soru için istatistikler
   - Response:
     - `total_answers`: Toplam cevap sayısı
     - `correct_count`: Doğru cevap sayısı
     - `incorrect_count`: Yanlış cevap sayısı
     - `correct_percentage`: Doğru cevap yüzdesi
     - `common_wrong_answers`: En sık verilen yanlış cevaplar

3. **Student Quiz Performance Endpoint:**
   - `GET /api/v1/quizzes/{quiz_id}/students/{user_id}/performance`
   - Belirli bir öğrencinin quiz performansı
   - Response:
     - `attempts`: Tüm denemeler (score, status, completed_at)
     - `best_score`: En yüksek puan
     - `average_score`: Ortalama puan
     - `total_attempts`: Toplam deneme sayısı
     - `passed`: Geçti mi? (best_score >= passing_score)

4. **Course Quiz Summary Endpoint:**
   - `GET /api/v1/courses/{course_id}/quizzes/summary`
   - Kurs içindeki tüm quiz'lerin özeti
   - Response: Quiz listesi (id, title, lesson_id, total_attempts, average_score, pass_rate)

**Kriterler:**
- ✅ Tüm istatistik endpoint'leri çalışıyor
- ✅ Performans optimizasyonu yapıldı (aggregation queries)
- ✅ Yetki kontrolleri doğru (sadece öğretmen/admin)
- ✅ Response formatları tutarlı

---

#### [EP10-QUIZ-BE-05] Quiz Validation ve Business Logic
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-QUIZ-BE-02

**Açıklama:**
Quiz ve soru oluşturma/güncelleme için kapsamlı validation ve business logic.

**Gereksinimler:**

1. **Quiz Validation:**
   - `passing_score`: 0-100 arası integer
   - `time_limit_minutes`: Pozitif integer veya null
   - `max_attempts`: Pozitif integer veya null
   - Quiz en az 1 soru içermeli (submit sırasında kontrol)
   - Quiz title ve description XSS koruması (bleach kullan)

2. **Question Validation:**
   - `question_type`: Geçerli enum değeri (MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER)
   - `question_text`: Boş olamaz, XSS koruması
   - `options`: MULTIPLE_CHOICE için gerekli, en az 2 seçenek olmalı
   - `correct_answer`: Boş olamaz
     - MULTIPLE_CHOICE: options içinde olmalı (A, B, C, ...)
     - TRUE_FALSE: "true" veya "false" olmalı
     - SHORT_ANSWER: Boş olmamalı
   - `points`: Pozitif integer, default 1
   - `explanation`: XSS koruması

3. **Attempt Validation:**
   - Tüm sorulara cevap verilmeli (submit sırasında)
   - Zaman limiti kontrolü
   - Maksimum deneme sayısı kontrolü
   - Attempt ownership kontrolü (sadece attempt sahibi submit edebilir)

4. **Answer Validation:**
   - `answer_text`: Boş olamaz
   - `question_id`: Geçerli question_id olmalı ve quiz'e ait olmalı
   - MULTIPLE_CHOICE: answer_text options içinde olmalı

**Kriterler:**
- ✅ Tüm validation kuralları uygulanıyor
- ✅ XSS koruması çalışıyor
- ✅ Error mesajları açıklayıcı
- ✅ Validation hataları HTTP 400 ile dönüyor

---

#### [EP10-QUIZ-BE-06] Quiz Shuffle ve Randomization
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat  
**Bağımlılık:** EP10-QUIZ-BE-03

**Açıklama:**
Quiz ayarlarına göre soru sıralaması ve seçenek karıştırma.

**Gereksinimler:**

1. **Question Shuffling:**
   - `start_attempt` endpoint'inde `quiz.shuffle_questions = True` ise soruları karıştır
   - Karıştırılmış sıra attempt'a kaydedilmeli (attempt_question_order JSON field eklenebilir)
   - Her attempt için farklı sıralama

2. **Option Shuffling (Gelecek için):**
   - MULTIPLE_CHOICE sorularında seçenekleri karıştır
   - Yeni model field: `shuffle_options: bool` (QuizQuestion)
   - Karıştırılmış seçenek sırası attempt_answer'a kaydedilmeli

3. **Random Question Selection (Gelecek için):**
   - Quiz'ten rastgele N soru seçme özelliği
   - Yeni model field: `random_question_count: int | None` (Quiz)
   - Eğer set edilmişse, quiz'ten sadece bu kadar soru sorulur

**Kriterler:**
- ✅ Shuffle işlemi çalışıyor
- ✅ Her attempt için farklı sıralama
- ✅ Sıralama attempt'a kaydediliyor

---

#### [EP10-QUIZ-BE-07] Quiz Preview ve Test Modu
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-QUIZ-BE-01

**Açıklama:**
Öğretmenler için quiz önizleme ve test modu (deneme sayısına dahil olmayan).

**Gereksinimler:**

1. **Preview Quiz Endpoint:**
   - `GET /api/v1/quizzes/{quiz_id}/preview`
   - Quiz'i önizleme modunda getir (sorular ve doğru cevaplar dahil)
   - Yetki: Sadece quiz sahibi (course owner) veya admin
   - Attempt oluşturmaz, sadece quiz detayını döner

2. **Test Attempt Endpoint:**
   - `POST /api/v1/quizzes/{quiz_id}/test-attempt`
   - Test modunda deneme başlat (deneme sayısına dahil değil)
   - Yetki: Sadece quiz sahibi (course owner) veya admin
   - Test attempt'ları ayrı bir flag ile işaretlenir (`is_test: bool` QuizAttempt modeline eklenebilir)
   - Test attempt'ları istatistiklere dahil edilmez

3. **Submit Test Attempt Endpoint:**
   - `POST /api/v1/quizzes/test-attempts/{attempt_id}/submit`
   - Test denemesini gönder ve puanla
   - Normal submit ile aynı mantık, ancak attempt sayısına dahil değil

**Kriterler:**
- ✅ Preview endpoint çalışıyor
- ✅ Test attempt'ları attempt sayısına dahil değil
- ✅ Test attempt'ları istatistiklerde gösterilmiyor
- ✅ Yetki kontrolleri doğru

---

#### [EP10-QUIZ-BE-08] Lesson-Quiz İlişkisi ve Auto-Creation
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat  
**Bağımlılık:** EP10-QUIZ-BE-01

**Açıklama:**
Lesson type "quiz" olan dersler için otomatik quiz oluşturma ve ilişki yönetimi.

**Gereksinimler:**

1. **Auto-Create Quiz on Lesson Creation:**
   - Lesson type "quiz" olarak oluşturulduğunda otomatik boş quiz oluştur
   - Lesson oluşturma endpoint'inde (courses.py) kontrol ekle
   - Quiz title: Lesson title, Quiz description: Lesson description

2. **Lesson-Quiz Sync:**
   - Lesson title/description güncellendiğinde quiz title/description da güncellenmeli (opsiyonel)
   - Lesson silindiğinde quiz de silinmeli (cascade delete zaten var)

3. **Get Lesson with Quiz Endpoint:**
   - `GET /api/v1/courses/{course_id}/lessons/{lesson_id}` endpoint'ine quiz bilgisi ekle
   - Response'a `quiz: QuizResponse | None` field'ı ekle
   - Eğer lesson type "quiz" ise quiz bilgisi döner

**Kriterler:**
- ✅ Otomatik quiz oluşturma çalışıyor
- ✅ Lesson-Quiz senkronizasyonu çalışıyor
- ✅ Lesson detayında quiz bilgisi gösteriliyor

---

#### [EP10-QUIZ-BE-09] Quiz Completion ve Lesson Progress Entegrasyonu
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-QUIZ-BE-03

**Açıklama:**
Quiz tamamlandığında lesson progress'i güncelleme ve course completion hesaplama.

**Gereksinimler:**

1. **Auto-Complete Lesson on Quiz Pass:**
   - Quiz geçildiğinde (score >= passing_score) lesson'ı otomatik tamamla
   - `submit_attempt` endpoint'inde kontrol ekle
   - LessonProgress API'sini kullanarak lesson'ı complete et
   - Sadece ilk geçişte tamamla (sonraki denemelerde tekrar tamamlamaz)

2. **Quiz Progress Tracking:**
   - Quiz attempt'ları lesson progress'e dahil edilmeli
   - En yüksek puan lesson progress'e kaydedilmeli
   - Quiz tamamlanma durumu lesson progress'te gösterilmeli

3. **Course Completion Calculation:**
   - Course completion hesaplamasına quiz'ler dahil edilmeli
   - Quiz geçilmişse lesson tamamlanmış sayılır
   - Course completion percentage güncellenmeli

**Kriterler:**
- ✅ Quiz geçildiğinde lesson otomatik tamamlanıyor
- ✅ Lesson progress quiz durumunu gösteriyor
- ✅ Course completion doğru hesaplanıyor

---

#### [EP10-QUIZ-BE-10] Quiz Export ve Import
**Durum:** ⏳ TODO  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 3 saat  
**Bağımlılık:** EP10-QUIZ-BE-02

**Açıklama:**
Quiz'leri JSON formatında export/import etme özelliği (öğretmenler için).

**Gereksinimler:**

1. **Export Quiz Endpoint:**
   - `GET /api/v1/quizzes/{quiz_id}/export`
   - Quiz'i JSON formatında export et
   - Response: Quiz detayları, tüm sorular, ayarlar
   - Yetki: Quiz sahibi veya admin

2. **Import Quiz Endpoint:**
   - `POST /api/v1/quizzes/import`
   - JSON formatında quiz import et
   - Request body: Export formatındaki JSON
   - Yeni quiz oluşturur veya mevcut quiz'i günceller
   - Validation: JSON format kontrolü, soru validation

3. **Bulk Import Questions:**
   - `POST /api/v1/quizzes/{quiz_id}/questions/import`
   - JSON formatında toplu soru import et
   - Request body: Soru listesi JSON
   - Mevcut sorulara ekler veya günceller

**Kriterler:**
- ✅ Export endpoint çalışıyor
- ✅ Import endpoint validation yapıyor
- ✅ Bulk import çalışıyor
- ✅ Error handling tam

---

#### [EP10-QUIZ-BE-11] Quiz Notifications
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat  
**Bağımlılık:** EP10-QUIZ-BE-03, EPIC-9 (Notification System)

**Açıklama:**
Quiz ile ilgili bildirimler (yeni quiz, quiz sonuçları, hatırlatmalar).

**Gereksinimler:**

1. **Quiz Created Notification:**
   - Quiz oluşturulduğunda kursa kayıtlı öğrencilere bildirim gönder
   - Notification type: `quiz_created`
   - Data: `{ "quiz_id": "...", "lesson_id": "...", "course_id": "...", "course_title": "..." }`

2. **Quiz Result Notification:**
   - Quiz tamamlandığında öğrenciye sonuç bildirimi gönder
   - Notification type: `quiz_result`
   - Data: `{ "quiz_id": "...", "score": 85, "passed": true, "attempt_id": "..." }`
   - Sadece quiz geçildiğinde veya belirli bir puanın üzerinde gönderilebilir (opsiyonel)

3. **Quiz Reminder Notification (Gelecek için):**
   - Quiz'e başlamamış öğrencilere hatırlatma bildirimi
   - Scheduled job ile çalışır
   - Notification type: `quiz_reminder`

**Kriterler:**
- ✅ Quiz oluşturulduğunda bildirim gönderiliyor
- ✅ Quiz sonuçları bildiriliyor
- ✅ Notification data formatı doğru

---

#### [EP10-QUIZ-BE-12] Quiz Analytics ve Advanced Reporting
**Durum:** ⏳ TODO  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 4 saat  
**Bağımlılık:** EP10-QUIZ-BE-04

**Açıklama:**
Gelişmiş quiz analitiği ve raporlama (zaman serisi, öğrenci karşılaştırması, zorluk analizi).

**Gereksinimler:**

1. **Time Series Analytics:**
   - `GET /api/v1/quizzes/{quiz_id}/analytics/timeseries`
   - Zaman içinde quiz performansı (günlük/haftalık/aylık)
   - Response: Tarih bazlı attempt sayıları, ortalama puanlar

2. **Student Comparison:**
   - `GET /api/v1/quizzes/{quiz_id}/analytics/students`
   - Öğrencilerin quiz performanslarını karşılaştır
   - Response: Öğrenci listesi (user_id, full_name, best_score, average_score, attempt_count)

3. **Difficulty Analysis:**
   - `GET /api/v1/quizzes/{quiz_id}/analytics/difficulty`
   - Soru zorluk analizi (doğru cevap yüzdesine göre)
   - Response: Soru listesi (question_id, correct_percentage, difficulty_level: easy/medium/hard)

4. **Export Analytics Report:**
   - `GET /api/v1/quizzes/{quiz_id}/analytics/export?format=csv|json`
   - Analytics verilerini CSV veya JSON formatında export et
   - Yetki: Sadece quiz sahibi veya admin

**Kriterler:**
- ✅ Tüm analytics endpoint'leri çalışıyor
- ✅ Export formatları doğru
- ✅ Performans optimizasyonu yapıldı

---

### 🎨 FRONTEND TASKS - QUIZ

#### [EP10-QUIZ-FE-01] Quiz Oluşturma ve Düzenleme UI
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4 saat  
**Bağımlılık:** EP10-QUIZ-BE-01, EP10-QUIZ-BE-02

**Açıklama:**
Öğretmenler için quiz oluşturma ve düzenleme sayfası.

**Gereksinimler:**

1. **Quiz Settings Form:**
   - Quiz başlığı, açıklaması
   - Geçme notu (passing_score) slider veya input
   - Zaman limiti (time_limit_minutes) input
   - Maksimum deneme sayısı (max_attempts) input
   - Shuffle questions checkbox
   - Show correct answers checkbox

2. **Question Management:**
   - Soru ekleme formu (question type seçimi: multiple choice, true/false, short answer)
   - Soru listesi (drag & drop ile sıralama)
   - Soru düzenleme modalı
   - Soru silme (onay ile)
   - Toplu soru ekleme (bulk add)

3. **Question Form Fields:**
   - Question type selector
   - Question text (rich text editor veya textarea)
   - Options (multiple choice için: A, B, C, D seçenekleri)
   - Correct answer selector/input
   - Points input
   - Explanation textarea

4. **UI Components:**
   - `QuizForm.tsx`: Quiz ayarları formu
   - `QuestionForm.tsx`: Soru ekleme/düzenleme formu
   - `QuestionList.tsx`: Soru listesi ve sıralama
   - `QuizSettingsCard.tsx`: Quiz ayarları kartı

**Kriterler:**
- ✅ Form validation çalışıyor
- ✅ Drag & drop sıralama çalışıyor
- ✅ Question type'a göre dinamik form gösteriliyor
- ✅ UI modern ve kullanıcı dostu

---

#### [EP10-QUIZ-FE-02] Quiz Çözme UI (Öğrenci)
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 5 saat  
**Bağımlılık:** EP10-QUIZ-BE-03

**Açıklama:**
Öğrenciler için quiz çözme arayüzü.

**Gereksinimler:**

1. **Quiz Start Screen:**
   - Quiz başlığı, açıklaması
   - Quiz ayarları (süre limiti, maksimum deneme, geçme notu)
   - Kullanıcının önceki denemeleri (varsa)
   - "Başla" butonu

2. **Quiz Taking Interface:**
   - Soru listesi (sidebar veya alt kısım)
   - Aktif soru gösterimi
   - Question type'a göre input:
     - Multiple choice: Radio buttons veya select
     - True/False: Toggle veya radio buttons
     - Short answer: Text input
   - İlerleme çubuğu (kaç soru cevaplandı)
   - Zaman sayacı (eğer time_limit varsa)
   - "Kaydet ve Devam Et" butonu (otomatik kaydetme)
   - "Gönder" butonu (tüm sorular cevaplanmalı)

3. **Quiz Result Screen:**
   - Toplam puan, yüzde
   - Geçti/Kaldı durumu
   - Her soru için:
     - Kullanıcının cevabı
     - Doğru cevap (eğer show_correct_answers true ise)
     - Doğru/Yanlış işareti
     - Explanation (varsa)
   - "Tekrar Dene" butonu (eğer max_attempts aşılmadıysa)
   - "Derse Dön" butonu

4. **UI Components:**
   - `QuizStartScreen.tsx`: Quiz başlangıç ekranı
   - `QuizTakingInterface.tsx`: Quiz çözme arayüzü
   - `QuizQuestionCard.tsx`: Soru kartı
   - `QuizResultScreen.tsx`: Sonuç ekranı
   - `QuizTimer.tsx`: Zaman sayacı
   - `QuizProgressBar.tsx`: İlerleme çubuğu

**Kriterler:**
- ✅ Quiz çözme akışı sorunsuz çalışıyor
- ✅ Zaman sayacı doğru çalışıyor
- ✅ Otomatik kaydetme çalışıyor
- ✅ Sonuç ekranı tüm bilgileri gösteriyor
- ✅ Responsive tasarım

---

#### [EP10-QUIZ-FE-03] Quiz Önizleme ve Test Modu
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-QUIZ-BE-07

**Açıklama:**
Öğretmenler için quiz önizleme ve test modu.

**Gereksinimler:**

1. **Quiz Preview:**
   - Quiz detay sayfasında "Önizle" butonu
   - Öğrenci görünümünde quiz gösterimi (sorular ve doğru cevaplar görünür)
   - Test modunda quiz çözme (deneme sayısına dahil değil)

2. **Test Mode:**
   - Quiz ayarları sayfasında "Test Modunda Dene" butonu
   - Normal quiz çözme arayüzü, ancak test attempt olarak işaretlenir
   - Test sonuçları istatistiklere dahil edilmez

**Kriterler:**
- ✅ Preview çalışıyor
- ✅ Test modu çalışıyor
- ✅ Test attempt'ları istatistiklerde gösterilmiyor

---

#### [EP10-QUIZ-FE-04] Quiz İstatistikleri ve Raporlama UI
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 4 saat  
**Bağımlılık:** EP10-QUIZ-BE-04

**Açıklama:**
Öğretmenler için quiz istatistikleri ve raporlama sayfası.

**Gereksinimler:**

1. **Quiz Statistics Dashboard:**
   - Genel istatistikler (toplam deneme, ortalama puan, geçme oranı)
   - Grafikler: Puan dağılımı (histogram), zaman serisi (attempt sayıları)
   - Soru bazlı istatistikler (her soru için doğru/yanlış sayıları)

2. **Question Statistics:**
   - Soru detay sayfası
   - Doğru cevap yüzdesi
   - En sık verilen yanlış cevaplar
   - Zorluk seviyesi göstergesi

3. **Student Performance:**
   - Öğrenci listesi (quiz performanslarına göre sıralı)
   - Her öğrenci için: En yüksek puan, ortalama puan, deneme sayısı
   - Öğrenci detay sayfası (tüm denemeler)

4. **UI Components:**
   - `QuizStatisticsCard.tsx`: İstatistik kartları
   - `QuizScoreDistribution.tsx`: Puan dağılımı grafiği
   - `QuestionStatisticsCard.tsx`: Soru istatistikleri kartı
   - `StudentPerformanceTable.tsx`: Öğrenci performans tablosu

**Kriterler:**
- ✅ Tüm istatistikler gösteriliyor
- ✅ Grafikler doğru çalışıyor
- ✅ Responsive tasarım

---

#### [EP10-QUIZ-FE-05] Lesson Detail'de Quiz Entegrasyonu
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-QUIZ-BE-08, EP10-QUIZ-FE-02

**Açıklama:**
Lesson detay sayfasında quiz gösterimi ve erişimi.

**Gereksinimler:**

1. **Lesson Type Quiz Detection:**
   - Lesson type "quiz" ise quiz içeriğini göster
   - Lesson detay sayfasında quiz bilgisi (soru sayısı, geçme notu, vb.)

2. **Quiz Access:**
   - "Quiz'e Başla" butonu
   - Önceki denemeler varsa göster (en yüksek puan, deneme sayısı)
   - Quiz çözme sayfasına yönlendirme

3. **Quiz Status in Lesson List:**
   - Kurs içeriği listesinde quiz durumu (tamamlandı, geçildi, kaldı)
   - Quiz icon'u ve badge

**Kriterler:**
- ✅ Lesson type quiz doğru algılanıyor
- ✅ Quiz erişimi çalışıyor
- ✅ Quiz durumu gösteriliyor

---

#### [EP10-QUIZ-FE-06] Quiz Geçmişi ve Sonuçlar
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2.5 saat  
**Bağımlılık:** EP10-QUIZ-BE-03

**Açıklama:**
Öğrenciler için quiz geçmişi ve sonuçları görüntüleme.

**Gereksinimler:**

1. **My Quiz Attempts Page:**
   - Kullanıcının tüm quiz denemeleri listesi
   - Filtreleme: Kurs, quiz, durum (tamamlandı, yarıda bırakıldı)
   - Sıralama: Tarih, puan

2. **Attempt Detail:**
   - Deneme detay sayfası
   - Tüm sorular ve cevaplar
   - Doğru cevaplar (eğer show_correct_answers true ise)
   - Explanation'lar
   - Zaman bilgisi

3. **UI Components:**
   - `MyQuizAttemptsPage.tsx`: Quiz geçmişi sayfası
   - `AttemptDetailCard.tsx`: Deneme detay kartı
   - `AttemptResultSummary.tsx`: Sonuç özeti

**Kriterler:**
- ✅ Quiz geçmişi listeleniyor
- ✅ Deneme detayları gösteriliyor
- ✅ Filtreleme ve sıralama çalışıyor

---

#### [EP10-QUIZ-FE-07] Quiz Export/Import UI
**Durum:** ⏳ TODO  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-QUIZ-BE-10

**Açıklama:**
Quiz export/import için UI.

**Gereksinimler:**

1. **Export Quiz:**
   - Quiz ayarları sayfasında "Export" butonu
   - JSON dosyası olarak indirme
   - Export formatı: Quiz + tüm sorular

2. **Import Quiz:**
   - Quiz listesi sayfasında "Import Quiz" butonu
   - JSON dosyası yükleme
   - Preview: Import edilecek quiz önizlemesi
   - Onay ile import

3. **Bulk Import Questions:**
   - Quiz soru yönetimi sayfasında "Toplu Import" butonu
   - JSON dosyası yükleme
   - Soru listesi önizlemesi
   - Onay ile ekleme

**Kriterler:**
- ✅ Export çalışıyor
- ✅ Import validation yapıyor
- ✅ Preview gösteriliyor

---

#### [EP10-QUIZ-FE-08] Quiz Notifications UI
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat  
**Bağımlılık:** EP10-QUIZ-BE-11

**Açıklama:**
Quiz bildirimleri için UI entegrasyonu.

**Gereksinimler:**

1. **Quiz Created Notification:**
   - Bildirim listesinde quiz oluşturuldu bildirimi
   - Quiz'e yönlendirme linki

2. **Quiz Result Notification:**
   - Quiz sonuç bildirimi
   - Puan ve geçti/kaldı durumu
   - Quiz detay sayfasına yönlendirme

3. **Notification Badges:**
   - Quiz ile ilgili yeni bildirimler için badge

**Kriterler:**
- ✅ Bildirimler gösteriliyor
- ✅ Yönlendirme linkleri çalışıyor

---

#### [EP10-QUIZ-FE-09] Quiz Analytics Dashboard
**Durum:** ⏳ TODO  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 3 saat  
**Bağımlılık:** EP10-QUIZ-BE-12

**Açıklama:**
Gelişmiş quiz analitiği dashboard'u.

**Gereksinimler:**

1. **Analytics Dashboard:**
   - Zaman serisi grafikleri (attempt sayıları, ortalama puanlar)
   - Öğrenci karşılaştırma tablosu
   - Soru zorluk analizi

2. **Export Analytics:**
   - Analytics verilerini CSV/JSON olarak export
   - Filtreleme seçenekleri (tarih aralığı, öğrenci, vb.)

**Kriterler:**
- ✅ Analytics dashboard çalışıyor
- ✅ Export çalışıyor
- ✅ Grafikler doğru gösteriliyor

---

#### [EP10-QUIZ-FE-10] Quiz Content Renderer Entegrasyonu
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP10-QUIZ-FE-02, EP10-QUIZ-FE-05

**Açıklama:**
ContentRenderer component'ine quiz desteği ekleme.

**Gereksinimler:**

1. **ContentRenderer Update:**
   - `ContentRenderer.tsx` component'ine quiz case'i ekle
   - Lesson type "quiz" ise `QuizTakingInterface` veya `QuizResultScreen` render et

2. **Quiz State Management:**
   - Quiz attempt durumu yönetimi
   - Progress tracking
   - Auto-save

**Kriterler:**
- ✅ ContentRenderer quiz'i render ediyor
- ✅ Quiz state yönetimi çalışıyor
- ✅ Progress tracking çalışıyor

---

### 📝 UYGULAMA NOTLARI - QUIZ

#### Bağımlılık Sırası (Önerilen Uygulama Akışı)

```
EP10-QUIZ-BE-01 (Quiz CRUD)
    ├── EP10-QUIZ-BE-02 (Question Management)
    │   ├── EP10-QUIZ-BE-05 (Validation)
    │   └── EP10-QUIZ-BE-10 (Export/Import)
    ├── EP10-QUIZ-BE-03 (Attempt Management)
    │   ├── EP10-QUIZ-BE-06 (Shuffle)
    │   ├── EP10-QUIZ-BE-09 (Lesson Progress)
    │   └── EP10-QUIZ-BE-11 (Notifications)
    ├── EP10-QUIZ-BE-04 (Statistics)
    │   └── EP10-QUIZ-BE-12 (Advanced Analytics)
    ├── EP10-QUIZ-BE-07 (Preview/Test Mode)
    └── EP10-QUIZ-BE-08 (Lesson Integration)

EP10-QUIZ-FE-01 (Quiz Creation UI)
    ├── EP10-QUIZ-FE-03 (Preview)
    └── EP10-QUIZ-FE-07 (Export/Import)

EP10-QUIZ-FE-02 (Quiz Taking UI)
    ├── EP10-QUIZ-FE-05 (Lesson Integration)
    ├── EP10-QUIZ-FE-06 (History)
    └── EP10-QUIZ-FE-10 (ContentRenderer)

EP10-QUIZ-FE-04 (Statistics UI)
    └── EP10-QUIZ-FE-09 (Analytics Dashboard)

EP10-QUIZ-FE-08 (Notifications UI)
```

---

#### Öncelik Sırası

1. **Yüksek Öncelik (MVP):**
   - EP10-QUIZ-BE-01, EP10-QUIZ-BE-02, EP10-QUIZ-BE-03, EP10-QUIZ-BE-05, EP10-QUIZ-BE-08, EP10-QUIZ-BE-09
   - EP10-QUIZ-FE-01, EP10-QUIZ-FE-02, EP10-QUIZ-FE-05, EP10-QUIZ-FE-10

2. **Orta Öncelik:**
   - EP10-QUIZ-BE-04, EP10-QUIZ-BE-06, EP10-QUIZ-BE-07, EP10-QUIZ-BE-11
   - EP10-QUIZ-FE-03, EP10-QUIZ-FE-04, EP10-QUIZ-FE-06, EP10-QUIZ-FE-08

3. **Düşük Öncelik:**
   - EP10-QUIZ-BE-10, EP10-QUIZ-BE-12
   - EP10-QUIZ-FE-07, EP10-QUIZ-FE-09

---

#### Test Senaryoları

1. **Quiz Oluşturma:**
   - Quiz oluştur, soru ekle, ayarları güncelle, sil
   - Validation testleri (geçersiz passing_score, vb.)

2. **Quiz Çözme:**
   - Quiz başlat, soruları cevapla, gönder
   - Zaman limiti testi
   - Maksimum deneme testi
   - Otomatik kaydetme testi

3. **Quiz Sonuçları:**
   - Sonuç ekranı doğru gösteriliyor mu?
   - Doğru cevaplar gizleniyor mu? (show_correct_answers false ise)
   - Lesson otomatik tamamlanıyor mu? (geçildiğinde)

4. **İstatistikler:**
   - İstatistikler doğru hesaplanıyor mu?
   - Grafikler doğru gösteriliyor mu?

---

#### Notlar

- Quiz modelleri ve temel endpoint'ler mevcut, ancak frontend entegrasyonu eksik
- Lesson type "quiz" olan dersler için otomatik quiz oluşturma özelliği eklenmeli
- Quiz completion lesson progress'e entegre edilmeli
- Quiz shuffle ve randomization özellikleri eklenmeli
- Quiz export/import özelliği öğretmenler için çok faydalı olacak


# 📋 BiHocam - Kategori Sistemi Kanban Board

**Proje:** Kategori Sistemi Geliştirme  
**Durum:** 🟠 Planlama Aşaması  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2-3 Gün

---

## 📊 Genel Durum

- **Toplam Task:** 26/26 ✅
- **Backend:** 13/13 ✅
- **Frontend:** 13/13 ✅
- **Tamamlanma:** 100%

---

## 🎯 Aktif EPIC'ler ve Durum

### ✅ EPIC-4: Kullanıcı & Rol Yönetimi
- **Durum:** ✅ TAMAMLANDI
- **Backend:** 4/4 ✅
- **Frontend:** 3/3 ✅
- **Ek İyileştirmeler:**
  - ✅ Admin sidebar menüsü gruplandı (Kurslar, Kullanıcılar, Finansal, Bildirim)
  - ✅ Admin için gereksiz menü öğeleri kaldırıldı (Kurslarım, Siparişlerim)
  - ✅ Bildirim logları sayfası eklendi (`/dashboard/admin/notifications/logs`)

### ✅ EPIC-5: Eğitmen Profili, Finans & Ödeme Akışları
- **Durum:** ✅ TAMAMLANDI
- **Backend:** 6/6 ✅
- **Frontend:** 5/5 ✅
- **Ek İyileştirmeler:**
  - ✅ Admin dashboard tasarımı modernize edildi (glassmorphism, gradient efektler)
  - ✅ Bekleyen banka hesabı talepleri dashboard'a eklendi
  - ✅ Admin banka hesabı yönetim sayfası eklendi

### ✅ EPIC-6: Siparişler & Kupon Yönetimi
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK
- **Backend:** 4/4 ✅ (EP6-BE-01 ~ EP6-BE-04)
- **Frontend:** 5/5 ✅ (EP6-FE-01 ~ EP6-FE-05)
- **Not:** Admin sipariş filtreleri + detay/iade, admin kupon CRUD, öğretmen satışları, sidebar + API client tamamlandı.

### ✅ EPIC-7: Öğrenciler, Yorumlar & Moderasyon
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🟠 ORTA
- **Backend:** 5/5 ✅ (EP7-BE-01 ~ EP7-BE-05)
- **Frontend:** 6/6 ✅ (EP7-FE-01 ~ EP7-FE-06)
- **Ek İyileştirmeler:**
  - ✅ Public course page'de eğitmen cevapları gösterimi
  - ✅ Öğrenci için "Yorumlarım" sayfası (`/dashboard/my-reviews`)
  - ✅ Notification type'ları veritabanına eklendi (review_approved, review_rejected, teacher_reply)
  - ✅ Rating recalculation servisi eklendi
  - ✅ Modern glassmorphism tasarım (yeşil tonlar)

### ✅ EPIC-8: Raporlar & İstatistikler
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🟠 ORTA
- **Backend:** 3/3 ✅ (EP8-BE-01 ~ EP8-BE-03)
- **Frontend:** 4/4 ✅ (EP8-FE-01 ~ EP8-FE-04)
- **Ek İyileştirmeler:**
  - ✅ Recharts entegrasyonu (line, bar, pie, area, composed charts)
  - ✅ React Query ile data management ve auto-refresh
  - ✅ Loading/error state handling
  - ✅ TypeScript type safety
  - ✅ Modern glassmorphism tasarım (yeşil tonlar)
  - ✅ **Analitik Suite Genişletmesi:**
    - ✅ Sidebar'da "Analitik" ayrı section olarak eklendi (Finansal'dan ayrıldı)
    - ✅ Kategori Analizi detay sayfası (`/dashboard/admin/analytics/categories`)
    - ✅ Kurs Performansı detay sayfası (`/dashboard/admin/analytics/courses`)
    - ✅ Öğrenci Analizi detay sayfası (`/dashboard/admin/analytics/students`)
    - ✅ Eğitmen Performansı detay sayfası (`/dashboard/admin/analytics/teachers`)
    - ✅ Zaman Serisi Analizi detay sayfası (`/dashboard/admin/analytics/timeseries`)
    - ✅ Backend'e öğrenci analizi endpoint'i (`/admin/reports/student-analytics`)
    - ✅ Backend'e eğitmen performans endpoint'i (`/admin/reports/teacher-performance`)
    - ✅ Ana analitik sayfasına quick link kartları eklendi
    - ✅ Her detay sayfasında KPI kartları, filtreler, grafikler ve detaylı tablolar

### ✅ EPIC-9: Not Yönetimi & Site Ayarları
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK
- **Backend:** 6/6 ✅ (EP9-BE-01 ~ EP9-BE-06)
- **Frontend:** 8/8 ✅ (EP9-FE-01 ~ EP9-FE-08)
- **Ek İyileştirmeler:**
  - ✅ Maintenance mode middleware - admin login ve public settings endpoint'leri exempt edildi
  - ✅ Maintenance page tasarımı - yeşil tonlar (emerald-teal-cyan), animasyonlu blob backgrounds, geometric patterns, glassmorphism
  - ✅ Maintenance page - admin login butonu kaldırıldı (admin zaten nereye gireceğini biliyor)
  - ✅ AnnouncementBanner - öğrenci rolü için düzeltme (target_audience="students" ve "all" duyuruları gösteriliyor)
  - ✅ SiteSettingsScripts - SEO kodları (Google Analytics, GTM, Search Console, Bing, Yandex) ve custom code injection
  - ✅ Admin sidebar - tüm menü grupları varsayılan olarak expand (courses, users, analytics, financial, notifications, announcements, settings, crm)
  - ✅ Public settings endpoint - platform settings (maintenance_mode, maintenance_message, maintenance_estimated_end) dahil
  - ✅ Homepage maintenance mode kontrolü - direkt maintenance page render (redirect loop önleme)
  - ✅ Platform settings - commission_rate, currency, tax_rate, maintenance_mode SiteSettings'e eklendi
  - ✅ SiteSettings model - platform JSON field eklendi
  - ✅ Maintenance mode middleware - OPTIONS (CORS preflight) requests exempt
  - ✅ Axios interceptor - 503 response'ları yakalayıp maintenance page'e yönlendirme

### ✅ EPIC-10: Eğitim İçerikleri & Storage Modülü
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK
- **Backend:** 16/18 ✅ (EP10-BE-01, BE-02, BE-03, BE-04, BE-05, BE-06, BE-07, BE-08, BE-09, BE-10, BE-11, BE-12, BE-13, BE-14, BE-15, BE-17, BE-18)
- **Frontend:** 13/13 ✅ (EP10-FE-01, FE-02, FE-03, FE-04, FE-05, FE-06, FE-07, FE-08, FE-09, FE-10, FE-11, FE-12, FE-13)
- **Security & Quality:** 0/5 (EP10-SQ-01 ~ EP10-SQ-05) - Opsiyonel iyileştirmeler
- **Açıklama:** Storage abstraction layer (local → S3/GCS geçişi), çoklu içerik tipi desteği (Video, PDF, DOCX, PPTX, PPT), ders düzenleme/sıralama, içerik önizleme, canlı ders yönetimi, öğrenci içerik erişimi. **Güvenlik ve kalite iyileştirmeleri dahil.**
- **Tamamlanma Tarihi:** 2026-02-11
- **Not:** Ana özellikler tamamlandı. Kalan task'lar opsiyonel iyileştirmeler (test suite, performance optimization, dokümantasyon).

### ✅ EPIC-11: Sertifika Sistemi
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK
- **Backend:** 8/8 ✅ (EP11-BE-01 ~ EP11-BE-08)
- **Frontend:** 6/6 ✅ (EP11-FE-01 ~ EP11-FE-06)
- **Tahmini Süre:** 3-4 gün
- **Açıklama:** Kurs tamamlama sertifikası sistemi. Sertifika şablonu yönetimi, otomatik sertifika oluşturma, PDF export, QR code ile doğrulama, öğrenci sertifika görüntüleme ve indirme.

### ✅ EPIC-12: Mesajlaşma Sistemi (Lightweight)
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK (KVKK Compliance Required)
- **Backend:** 7/7 ✅ (EP12-BE-01 ~ EP12-BE-07)
- **Frontend:** 5/5 ✅ (EP12-FE-01 ~ EP12-FE-05)
- **Security:** 8/8 ✅ (EP12-SEC-01 ~ EP12-SEC-08 tamamlandı)
- **Tamamlanma Tarihi:** 23 Şubat 2026
- **Açıklama:** Öğrenci-eğitmen mesajlaşma sistemi. Long polling tabanlı lightweight yapı (websocket kullanmadan), conversation thread'leri, mesaj bildirimleri, okundu işaretleme. KVKK uyumlu recipient filtering, attachment desteği, real-time polling.
- **Ek İyileştirmeler:**
  - ✅ Content moderation & XSS protection (sanitize_html_content entegrasyonu)
  - ✅ File upload security (magic-byte validation, size limits, quota management)
  - ✅ Authorization & access control (validate_conversation_access, admin bypass)
  - ✅ Rate limiting & anti-spam protection (database-based sliding window, content spam detection)
  - ✅ User blocking & muting system (block/unblock endpoints, conversation archiving)
  - ✅ Message search & privacy (privacy-aware full-text search, rate limiting)
  - ✅ Conversation export & KVKK (JSON/PDF export, soft delete, audit logging)
  - ✅ Admin moderation & reporting (message reporting, flagged messages panel, auto-moderation)
  - ✅ NotificationType enum'a "new_message" değeri eklendi
  - ✅ JSON DISTINCT hatası düzeltildi (User.id distinct kullanımı)
  - ✅ Mesaj sıralama düzeltildi (frontend'de reverse)
  - ✅ Admin conversation erişim kontrolü eklendi

### ⏳ NOTIF-V2: E-Mail Entegrasyonu
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK
- **Backend:** 5/5 ✅ (NOTIFV2-BE-01 ~ NOTIFV2-BE-05)
- **Frontend:** 2/2 ✅ (NOTIFV2-FE-01 ~ NOTIFV2-FE-02)
- **Açıklama:** SMTP email gönderimi, Jinja2 şablonlar, async worker, log & retry, admin email yönetimi

### 💡 CLAUDE-EPICS: Yaratıcı Öneriler (Gelecek Yol Haritası)
- **Durum:** 💡 ÖNERİ
- **Toplam:** 10 EPIC önerisi
- **İçerik:** Canlı Ders, Sertifika, Mesajlaşma, AI Asistan, Gamification, Affiliate, Blog/CMS, PWA, i18n, Gelişmiş Arama

---

# 📋 EPIC-11 – Sertifika Sistemi

**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3-4 gün  
**Hedef Roller:** Öğrenci, Eğitmen, Admin

**Özet:**
Kurs tamamlama sertifikası sistemi. Öğrenciler kursu tamamladığında otomatik sertifika oluşturulur. Sertifikalar PDF olarak indirilebilir, QR code ile doğrulanabilir. Admin ve eğitmenler sertifika şablonlarını yönetebilir.

**Tamamlanma Tarihi:** 11 Şubat 2026  
**Implementation Notes:** Full-stack certificate system implemented with 5 distinct frontend designs, each with unique aesthetic direction following /frontend-design principles.

---

## 🔴 BACKEND TASKS – EPIC-11

### [EP11-BE-01] Certificate Model & Database Schema
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** Yok

**Açıklama:**
Sertifika model'ini oluşturma. Her öğrenci-kurs kombinasyonu için sertifika kaydı.

**Dosya:** `backend/app/models/certificate.py`

**Model Alanları:**
```python
class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(UUID, primary_key=True, default=uuid4)  # Sertifika ID (aynı zamanda verification code)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID, ForeignKey("courses.id"), nullable=False)
    enrollment_id = Column(UUID, ForeignKey("enrollments.id"), nullable=False, unique=True)
    
    # Certificate details
    certificate_number = Column(String(50), unique=True, nullable=False)  # CERT-YYYY-XXXXXX format
    issued_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Course completion info
    completion_date = Column(DateTime(timezone=True), nullable=False)  # Kurs tamamlama tarihi
    total_lessons = Column(Integer, nullable=False)  # Toplam ders sayısı
    completed_lessons = Column(Integer, nullable=False)  # Tamamlanan ders sayısı
    completion_percentage = Column(Integer, nullable=False)  # Tamamlama yüzdesi (100 olmalı)
    
    # Certificate template reference
    template_id = Column(UUID, ForeignKey("certificate_templates.id"), nullable=True)
    
    # PDF generation
    pdf_path = Column(String(500), nullable=True)  # Storage path for generated PDF
    pdf_generated_at = Column(DateTime(timezone=True), nullable=True)
    
    # QR code for verification
    qr_code_data = Column(Text, nullable=True)  # QR code içeriği (verification URL)
    
    # Revocation (iptal)
    is_revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revoked_by_id = Column(UUID, ForeignKey("users.id"), nullable=True)
    revocation_reason = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    course = relationship("Course")
    enrollment = relationship("Enrollment", back_populates="certificate")
    template = relationship("CertificateTemplate")
    revoked_by = relationship("User", foreign_keys=[revoked_by_id])
    
    # Indexes
    __table_args__ = (
        Index("idx_certificate_user", "user_id"),
        Index("idx_certificate_course", "course_id"),
        Index("idx_certificate_number", "certificate_number"),
        Index("idx_certificate_issued", "issued_at"),
    )
```

**Certificate Template Model:**
```python
class CertificateTemplate(Base):
    __tablename__ = "certificate_templates"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(200), nullable=False)  # Şablon adı
    description = Column(Text, nullable=True)
    
    # Template design
    template_type = Column(String(50), default="default", nullable=False)  # default, premium, modern
    background_image = Column(String(500), nullable=True)  # Background image path
    logo_image = Column(String(500), nullable=True)  # Logo path
    signature_image = Column(String(500), nullable=True)  # İmza görseli
    
    # Template configuration (JSON)
    config = Column(JSON, nullable=True)  # Font, color, layout settings
    # Example config:
    # {
    #   "font_family": "Arial",
    #   "font_size_title": 32,
    #   "font_size_body": 18,
    #   "primary_color": "#0d9488",
    #   "secondary_color": "#14b8a6",
    #   "text_align": "center",
    #   "show_qr_code": true,
    #   "show_logo": true,
    #   "show_signature": true
    # }
    
    # Ownership
    created_by_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    is_system_template = Column(Boolean, default=False)  # System template (admin only)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Usage scope
    course_id = Column(UUID, ForeignKey("courses.id"), nullable=True)  # Specific course template
    # If course_id is NULL, template is global (can be used for any course)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    created_by = relationship("User")
    course = relationship("Course")
    certificates = relationship("Certificate", back_populates="template")
```

**Kriterler:**
- ✅ Models SQLAlchemy Base'den inherit ediyor
- ✅ Proper indexes for performance
- ✅ Relationships doğru tanımlanmış
- ✅ JSON config field for flexible template design
- ✅ Revocation support (iptal mekanizması)

---

### [EP11-BE-02] Enrollment Model Update (Certificate Relationship)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 30 dk  
**Bağımlılık:** EP11-BE-01

**Açıklama:**
`Enrollment` modeline certificate relationship ekleme.

**Dosya:** `backend/app/models/order.py`

**Değişiklik:**
```python
class Enrollment(Base):
    # ... existing fields ...
    
    # Certificate
    certificate = relationship("Certificate", back_populates="enrollment", uselist=False)
```

**Kriterler:**
- ✅ One-to-one relationship tanımlandı
- ✅ Backward compatibility korundu

---

### [EP11-BE-03] Certificate Generation Service
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP11-BE-01, EP11-BE-02

**Açıklama:**
Sertifika oluşturma ve PDF export servisi. ReportLab veya WeasyPrint kullanarak HTML'den PDF oluşturma.

> [!IMPORTANT]
> **GEMINI-COMMENT:** PDF oluşturma kütüphanesi (WeasyPrint veya ReportLab) seçilirken Türkçe karakter desteği (UTF-8) ve custom font yükleme yetenekleri önceden doğrulanmalıdır. Sertifika tasarımı kurumsal bir kimlik taşıyacağı için fontların düzgün render edilmesi kritiktir. Ayrıca büyük dosya boyutlarını önlemek için PDF optimizasyonu yapılmalıdır.

**Dosya:** `backend/app/services/certificate_service.py`

**Fonksiyonlar:**

1. **`async def generate_certificate(enrollment_id: str, db: AsyncSession) -> Certificate`**
   - Enrollment kontrolü (kurs tamamlanmış mı?)
   - Mevcut sertifika kontrolü (duplicate önleme)
   - Certificate number generation (CERT-2026-XXXXXX)
   - QR code data generation (verification URL)
   - Certificate record oluşturma
   - PDF generation trigger

2. **`async def generate_certificate_pdf(certificate_id: str, db: AsyncSession, storage: StorageBackend) -> str`**
   - Certificate template'i al (course-specific veya default)
   - HTML template render (Jinja2)
   - PDF generation (WeasyPrint)
   - QR code embed
   - PDF upload to storage
   - PDF path güncelleme

3. **`async def check_course_completion(enrollment_id: str, db: AsyncSession) -> dict`**
   - LessonProgress kayıtlarını kontrol et
   - Tamamlama yüzdesini hesapla
   - Minimum completion threshold kontrolü (örn: %80)
   - Quiz tamamlama kontrolü (varsa)

4. **`async def revoke_certificate(certificate_id: str, revoked_by_id: str, reason: str, db: AsyncSession) -> Certificate`**
   - Sertifika iptal işlemi
   - Revocation metadata güncelleme

5. **`async def verify_certificate(certificate_id: str, db: AsyncSession) -> dict`**
   - Sertifika doğrulama (QR code verification)
   - Certificate details return

**Dependencies:**
- WeasyPrint: `pip install weasyprint`
- QR Code: `pip install qrcode[pil]`
- Jinja2: Already installed

**HTML Template (Jinja2):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        body {
            font-family: {{ config.font_family | default('Arial') }};
            margin: 0;
            padding: 0;
            background-image: url({{ background_image }});
            background-size: cover;
        }
        .certificate {
            width: 100%;
            height: 100%;
            position: relative;
            text-align: center;
            padding: 60px;
        }
        .title {
            font-size: {{ config.font_size_title | default(32) }}px;
            color: {{ config.primary_color | default('#0d9488') }};
            font-weight: bold;
            margin-bottom: 30px;
        }
        .student-name {
            font-size: {{ config.font_size_body | default(24) }}px;
            margin: 20px 0;
        }
        .course-title {
            font-size: {{ config.font_size_body | default(20) }}px;
            margin: 20px 0;
        }
        .footer {
            position: absolute;
            bottom: 40px;
            width: 100%;
            text-align: center;
        }
        .qr-code {
            position: absolute;
            bottom: 40px;
            right: 40px;
        }
    </style>
</head>
<body>
    <div class="certificate">
        {% if show_logo %}
        <img src="{{ logo_image }}" alt="Logo" style="max-width: 150px; margin-bottom: 20px;">
        {% endif %}
        
        <div class="title">SERTİFİKA</div>
        
        <p class="student-name">
            <strong>{{ student_name }}</strong>
        </p>
        
        <p>aşağıdaki kursu başarıyla tamamladığını belgeleriz:</p>
        
        <p class="course-title">
            <strong>{{ course_title }}</strong>
        </p>
        
        <p>Tamamlanma Tarihi: {{ completion_date }}</p>
        <p>Sertifika No: {{ certificate_number }}</p>
        
        <div class="footer">
            {% if show_signature %}
            <img src="{{ signature_image }}" alt="İmza" style="max-width: 200px;">
            <p>{{ teacher_name }}</p>
            <p>Eğitmen</p>
            {% endif %}
        </div>
        
        {% if show_qr_code %}
        <div class="qr-code">
            <img src="{{ qr_code_image }}" alt="QR Code" style="width: 100px; height: 100px;">
        </div>
        {% endif %}
    </div>
</body>
</html>
```

**Kriterler:**
- ✅ Certificate generation logic çalışıyor
- ✅ PDF export functional
- ✅ QR code generation ve embed
- ✅ Template system flexible
- ✅ Course completion validation
- ✅ Duplicate certificate prevention

---

### [EP11-BE-04] Certificate Template Endpoints
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP11-BE-01

**Açıklama:**
Certificate template CRUD endpoint'leri (Admin/Teacher).

**Dosya:** `backend/app/api/v1/endpoints/certificates.py`

**Endpoint'ler:**

1. **`POST /api/v1/certificates/templates`** - Create template (Admin/Teacher)
2. **`GET /api/v1/certificates/templates`** - List templates (Admin/Teacher)
3. **`GET /api/v1/certificates/templates/{template_id}`** - Get template detail
4. **`PUT /api/v1/certificates/templates/{template_id}`** - Update template
5. **`DELETE /api/v1/certificates/templates/{template_id}`** - Delete template
6. **`POST /api/v1/certificates/templates/{template_id}/upload-background`** - Upload background image
7. **`POST /api/v1/certificates/templates/{template_id}/upload-logo`** - Upload logo
8. **`POST /api/v1/certificates/templates/{template_id}/upload-signature`** - Upload signature

**Authorization:**
- Admin: Tüm template'lere CRUD
- Teacher: Sadece kendi template'lerine CRUD
- System templates: Sadece admin

**Kriterler:**
- ✅ CRUD operations çalışıyor
- ✅ Authorization doğru (RBAC)
- ✅ File upload için storage service entegre
- ✅ Validation (config JSON schema)

---

### [EP11-BE-05] Certificate Generation & Management Endpoints
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP11-BE-03

**Açıklama:**
Sertifika oluşturma, listeleme, verification endpoint'leri.

> [!CAUTION]
> **GEMINI-COMMENT:** Public verification endpoint (`/verify/{certificate_id}`) öğrenci mahremiyetini (PII) korumalıdır. Doğrulama sonucunda sadece öğrencinin adı (belki maskelenmiş: H**** E*), kurs adı ve veriliş tarihi gösterilmelidir. E-posta veya telefon gibi hassas bilgiler kesinlikle sızdırılmamalıdır. Ayrıca, UUID kullanımı ID enumeration saldırılarını engellemek için doğru bir tercihtir.

> [!TIP]
> **GEMINI-COMMENT (Edge Case):** Öğrenci ismini değiştirdiğinde veya hatalı bir isimle sertifika aldığında "Manuel Yeniden Oluşturma" (Regenerate) endpoint'i adminler için can kurtarıcı olacaktır. Eski PDF'in silinip yeni bilgilerle tekrar generate edilmesi gerekebilir.

**Dosya:** `backend/app/api/v1/endpoints/certificates.py`

**Endpoint'ler:**

1. **`POST /api/v1/certificates/generate/{enrollment_id}`** - Generate certificate (Automatic trigger or manual)
   - Authorization: Admin, Teacher (for their courses), or Student (for their enrollments)
   - Validates course completion
   - Generates certificate
   - Returns certificate details

2. **`GET /api/v1/certificates/my-certificates`** - Student: List my certificates
   - Pagination support
   - Filter by course

3. **`GET /api/v1/certificates/{certificate_id}`** - Get certificate details
   - Authorization: Owner, Teacher, Admin
   - Returns certificate metadata

4. **`GET /api/v1/certificates/{certificate_id}/download`** - Download certificate PDF
   - Authorization: Owner, Teacher, Admin
   - Streaming response with PDF

5. **`GET /api/v1/certificates/verify/{certificate_id}`** - Public: Verify certificate (QR code endpoint)
   - No auth required (public verification)
   - Returns certificate details (limited info)
   - Checks revocation status

6. **`POST /api/v1/certificates/{certificate_id}/revoke`** - Admin: Revoke certificate
   - Admin only
   - Requires revocation reason

7. **`GET /api/v1/courses/{course_id}/certificates`** - Teacher/Admin: List course certificates
   - Pagination
   - Filter by student

**Kriterler:**
- ✅ All endpoints functional
- ✅ Proper authorization (RBAC)
- ✅ Public verification endpoint (no auth)
- ✅ PDF download streaming
- ✅ Revocation support

---

### [EP11-BE-06] Automatic Certificate Generation Hook
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** EP11-BE-03, EP11-BE-05

**Açıklama:**
Kurs tamamlandığında otomatik sertifika oluşturma. LessonProgress update hook'u.

**Dosya:** `backend/app/api/v1/endpoints/lessons.py` (lesson progress endpoint'ine ekleme)

**Mantık:**
- `POST /api/v1/lessons/{lesson_id}/progress` endpoint'inde
- Lesson complete işaretlendiğinde
- Tüm derslerin tamamlanma durumunu kontrol et
- Eğer kurs tamamlandıysa → `generate_certificate` trigger
- Async task (background job) olarak çalıştır
- Notification gönder (certificate_earned)

**Implementation:**
```python
@router.post("/{lesson_id}/progress")
async def update_lesson_progress(
    lesson_id: str,
    progress: LessonProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ... existing logic ...
    
    # Check if this lesson completion triggers course completion
    if progress.is_completed:
        enrollment_id = await get_enrollment_id(lesson.course_id, current_user.id, db)
        completion_status = await check_course_completion(enrollment_id, db)
        
        if completion_status["is_completed"] and completion_status["percentage"] >= 80:
            # Check if certificate already exists
            existing_cert = await db.execute(
                select(Certificate).where(Certificate.enrollment_id == enrollment_id)
            )
            if not existing_cert.scalar_one_or_none():
                # Trigger certificate generation (async)
                from app.services.certificate_service import generate_certificate
                certificate = await generate_certificate(enrollment_id, db)
                
                # Send notification
                from app.services.notification_service import send_notification
                await send_notification(
                    user_id=current_user.id,
                    notification_type=NotificationType.CERTIFICATE_EARNED,
                    title="Sertifikanız Hazır!",
                    message=f"{lesson.course.title} kursunu tamamladınız. Sertifikanızı indirebilirsiniz.",
                    data={"certificate_id": str(certificate.id), "course_id": str(lesson.course_id)},
                    db=db
                )
    
    return updated_progress
```

**Kriterler:**
- ✅ Auto-generation çalışıyor
- ✅ Duplicate certificate prevention
- ✅ Async execution (non-blocking)
- ✅ Notification integration

---

### [EP11-BE-07] Certificate Schema Definitions
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat  
**Bağımlılık:** EP11-BE-01

**Açıklama:**
Pydantic schemas for API request/response.

**Dosya:** `backend/app/schemas/certificate.py`

**Schemas:**
```python
class CertificateTemplateCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    template_type: str = Field(default="default", pattern="^(default|premium|modern)$")
    config: Optional[dict] = None
    course_id: Optional[str] = None

class CertificateTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    template_type: Optional[str] = None
    config: Optional[dict] = None
    is_active: Optional[bool] = None

class CertificateTemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    template_type: str
    background_image: Optional[str]
    logo_image: Optional[str]
    signature_image: Optional[str]
    config: Optional[dict]
    created_by_id: str
    is_system_template: bool
    is_active: bool
    course_id: Optional[str]
    created_at: datetime
    updated_at: datetime

class CertificateResponse(BaseModel):
    id: str
    certificate_number: str
    user_id: str
    course_id: str
    issued_at: datetime
    completion_date: datetime
    total_lessons: int
    completed_lessons: int
    completion_percentage: int
    pdf_path: Optional[str]
    pdf_generated_at: Optional[datetime]
    is_revoked: bool
    revoked_at: Optional[datetime]
    revocation_reason: Optional[str]
    # Nested objects
    student_name: str
    course_title: str
    teacher_name: str

class CertificateVerificationResponse(BaseModel):
    is_valid: bool
    certificate_number: Optional[str]
    student_name: Optional[str]
    course_title: Optional[str]
    issued_at: Optional[datetime]
    is_revoked: bool
```

**Kriterler:**
- ✅ Schemas Pydantic BaseModel'den inherit
- ✅ Proper validation rules
- ✅ Response schemas include nested data

---

### [EP11-BE-08] Alembic Migration for Certificate Tables
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat  
**Bağımlılık:** EP11-BE-01, EP11-BE-02

**Açıklama:**
Database migration for certificate tables.

**Komut:**
```bash
cd backend
alembic revision --autogenerate -m "Add certificate and certificate_template tables"
alembic upgrade head
```

**Kriterler:**
- ✅ Migration dosyası oluşturuldu
- ✅ Tables created successfully
- ✅ Foreign keys ve indexes doğru
- ✅ Test data ile validate edildi

---

## 🎨 FRONTEND TASKS – EPIC-11

### [EP11-FE-01] Certificate List Page (Student)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP11-BE-05

**Açıklama:**
Öğrenci için sertifika listesi sayfası.

**Dosya:** `frontend/src/app/(dashboard)/dashboard/my-certificates/page.tsx`

**Özellikler:**
- Kullanıcının tüm sertifikalarını listele
- Sertifika kartları (course thumbnail, title, issue date, certificate number)
- "İndir" butonu (PDF download)
- "Görüntüle" butonu (modal veya yeni tab)
- "Doğrula" butonu (QR code modal)
- Filter by course
- Sort by issue date
- Empty state (henüz sertifika yok)

**Tasarım:**
- Modern glassmorphism cards
- Gradient accents (teal/emerald)
- Certificate icon/badge
- Responsive grid layout

**API Integration:**
```typescript
const { data: certificates, isLoading } = useQuery({
  queryKey: ["my-certificates"],
  queryFn: () => certificatesApi.getMyCertificates(),
});
```

**Kriterler:**
- ✅ Certificate list görüntüleniyor
- ✅ Download butonu çalışıyor
- ✅ Responsive design
- ✅ Loading/error states

---

### [EP11-FE-02] Certificate Detail Modal/Page
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP11-BE-05

**Açıklama:**
Sertifika detay görüntüleme (modal veya dedicated page).

> [!TIP]
> **GEMINI-COMMENT:** Sertifika detay sayfasına "LinkedIn'e Ekle" (Add to Profile) butonu eklenmesi ürün değerini ciddi oranda artırır. LinkedIn API veya simple link üzerinden öğrencilerin bu başarıyı profillerine tek tıkla eklemesi sağlanmalıdır. Bu, hem öğrenci motivasyonu hem de platformun organik reklamı için harika bir UX dokunuşudur.

**Dosya:** `frontend/src/components/certificates/CertificateDetailModal.tsx`

**Özellikler:**
- Certificate preview (PDF embed veya image preview)
- Certificate details (number, issue date, completion info)
- QR code görüntüleme
- "İndir" butonu
- "Paylaş" butonu (social media share)
- "Doğrula" link (public verification)

**Tasarım:**
- Full-screen modal veya dedicated page
- PDF viewer integration (react-pdf)
- Modern certificate frame design

**Kriterler:**
- ✅ Certificate preview çalışıyor
- ✅ QR code görüntüleniyor
- ✅ Download functional
- ✅ Responsive design

---

### [EP11-FE-03] Public Certificate Verification Page
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** EP11-BE-05

**Açıklama:**
Public sertifika doğrulama sayfası (QR code scan sonrası).

**Dosya:** `frontend/src/app/verify-certificate/[certificateId]/page.tsx`

**Özellikler:**
- Certificate ID ile verification
- Certificate details görüntüleme (limited info)
- Geçerlilik durumu (valid/revoked)
- Issue date, student name, course title
- Verification timestamp
- "Bu sertifika geçerlidir" badge (yeşil)
- "Bu sertifika iptal edilmiştir" badge (kırmızı)

**Tasarım:**
- Clean, professional design
- Large verification badge
- Certificate frame mockup
- Responsive

**API Integration:**
```typescript
const { data: verification, isLoading } = useQuery({
  queryKey: ["certificate-verification", certificateId],
  queryFn: () => certificatesApi.verifyCertificate(certificateId),
});
```

**Kriterler:**
- ✅ Public access (no auth required)
- ✅ Verification status görüntüleniyor
- ✅ Clear valid/invalid indication
- ✅ Responsive design

---

### [EP11-FE-04] Certificate Template Management (Admin/Teacher)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP11-BE-04

**Açıklama:**
Sertifika şablonu yönetim sayfası (Admin/Teacher).

> [!NOTE]
> **GEMINI-COMMENT:** Şablon yönetim sayfasında "Canlı Önizleme" (Real-time Preview) özelliği UX açısından vazgeçilmezdir. Kullanıcı renk veya font değiştirdiğinde sertifikanın nasıl göründüğünü anında görebilmelidir. Aksi takdirde, her değişiklikte PDF generate edip indirmek çok zahmetli bir süreç olacaktır.

**Dosya:** `frontend/src/app/(dashboard)/dashboard/certificates/templates/page.tsx`

**Özellikler:**
- Template list
- Create new template form
- Edit template
- Delete template
- Upload background image, logo, signature
- Template preview
- Template configuration (font, color, layout)
- Assign template to course (course-specific)

**Tasarım:**
- Template cards with preview thumbnail
- CRUD modals
- File upload drag & drop
- Color picker for theme colors
- Font selector
- Preview panel (live preview)

**API Integration:**
```typescript
const { data: templates } = useQuery({
  queryKey: ["certificate-templates"],
  queryFn: () => certificatesApi.getTemplates(),
});

const createTemplate = useMutation({
  mutationFn: (data: CertificateTemplateCreate) => 
    certificatesApi.createTemplate(data),
  onSuccess: () => queryClient.invalidateQueries(["certificate-templates"]),
});
```

**Kriterler:**
- ✅ Template CRUD çalışıyor
- ✅ File upload functional
- ✅ Preview panel çalışıyor
- ✅ Config editor functional
- ✅ Responsive design

---

### [EP11-FE-05] Course Completion Certificate Notification
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** EP11-BE-06, EP11-FE-01

**Açıklama:**
Kurs tamamlandığında sertifika bildirimi ve yönlendirme.

> [!TIP]
> **GEMINI-COMMENT:** Kurs tamamlama anı (gamification açısından) en kritik andır. Sertifika bildirimi geldiğinde ekranda "Konfeti" (Confetti) efekti veya benzeri bir kutlama animasyonu gösterilmesi, öğrenciye başarı hissini sonuna kadar yaşatır. Bu küçük detaylar platformun NPS (Net Promoter Score) değerini ciddi ölçüde artırır.

**Dosya:** 
- `frontend/src/components/notifications/NotificationItem.tsx` (update)
- `frontend/src/app/(dashboard)/dashboard/courses/[courseId]/[lessonId]/page.tsx` (completion trigger)

**Özellikler:**
- Notification type: `certificate_earned`
- Notification message: "Tebrikler! [Course Title] kursunu tamamladınız. Sertifikanızı indirebilirsiniz."
- Click action: Redirect to certificate detail
- Confetti animation on course completion
- "Sertifikamı Gör" butonu (prominent CTA)

**Tasarım:**
- Celebration modal on course completion
- Confetti/animation effect
- Certificate badge icon
- CTA button to certificate page

**Kriterler:**
- ✅ Notification görüntüleniyor
- ✅ Click action yönlendirme çalışıyor
- ✅ Celebration animation çalışıyor
- ✅ Responsive design

---

### [EP11-FE-06] API Client & Sidebar Updates (EPIC-11)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** EP11-BE-05, EP11-FE-01

**Açıklama:**
API client ve sidebar menü güncellemeleri.

**Dosya:** 
- `frontend/src/lib/api.ts`
- `frontend/src/app/(dashboard)/layout.tsx`

**API Client Functions:**
```typescript
export const certificatesApi = {
  // Student
  getMyCertificates: async (): Promise<CertificateResponse[]> => {
    const res = await api.get("/certificates/my-certificates");
    return res.data;
  },
  getCertificate: async (id: string): Promise<CertificateResponse> => {
    const res = await api.get(`/certificates/${id}`);
    return res.data;
  },
  downloadCertificate: async (id: string): Promise<Blob> => {
    const res = await api.get(`/certificates/${id}/download`, {
      responseType: "blob",
    });
    return res.data;
  },
  verifyCertificate: async (id: string): Promise<CertificateVerificationResponse> => {
    const res = await api.get(`/certificates/verify/${id}`);
    return res.data;
  },
  
  // Admin/Teacher
  getTemplates: async (): Promise<CertificateTemplateResponse[]> => {
    const res = await api.get("/certificates/templates");
    return res.data;
  },
  createTemplate: async (data: CertificateTemplateCreate): Promise<CertificateTemplateResponse> => {
    const res = await api.post("/certificates/templates", data);
    return res.data;
  },
  updateTemplate: async (id: string, data: CertificateTemplateUpdate): Promise<CertificateTemplateResponse> => {
    const res = await api.put(`/certificates/templates/${id}`, data);
    return res.data;
  },
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/certificates/templates/${id}`);
  },
  uploadTemplateBackground: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/certificates/templates/${id}/upload-background`, formData);
    return res.data.background_image;
  },
  uploadTemplateLogo: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/certificates/templates/${id}/upload-logo`, formData);
    return res.data.logo_image;
  },
  uploadTemplateSignature: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/certificates/templates/${id}/upload-signature`, formData);
    return res.data.signature_image;
  },
  getCertificatesForCourse: async (courseId: string): Promise<CertificateResponse[]> => {
    const res = await api.get(`/courses/${courseId}/certificates`);
    return res.data;
  },
  generateCertificate: async (enrollmentId: string): Promise<CertificateResponse> => {
    const res = await api.post(`/certificates/generate/${enrollmentId}`);
    return res.data;
  },
  revokeCertificate: async (id: string, reason: string): Promise<void> => {
    await api.post(`/certificates/${id}/revoke`, { reason });
  },
};
```

**Sidebar Menu:**
- **Student:**
  - "Sertifikalarım" → `/dashboard/my-certificates`
  - Icon: 🏆 veya certificate icon
  - Badge: Yeni sertifika sayısı (optional)

- **Admin:**
  - "Sertifikalar" grubu altında:
    - "Şablon Yönetimi" → `/dashboard/admin/certificates/templates`
    - "Tüm Sertifikalar" → `/dashboard/admin/certificates`

**Kriterler:**
- ✅ API client functions tanımlandı
- ✅ TypeScript types doğru
- ✅ Sidebar menu items eklendi
- ✅ Proper icons ve labels

---

# 📋 EPIC-12 – Mesajlaşma Sistemi (Lightweight)

**Durum:** ⏳ PLANLANMIŞ  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3-4 gün  
**Hedef Roller:** Öğrenci, Eğitmen, Admin

**Özet:**
Role-based mesajlaşma sistemi. Long polling tabanlı lightweight yapı (websocket kullanmadan). Conversation thread'leri, mesaj bildirimleri, okundu işaretleme. Gerçek zamanlı değil ama yeterince responsive.

**İletişim Kanalları:**
- 👨‍🎓 **Öğrenci <-> Öğretmen** (Kayıtlı olunan kursların öğretmenleri)
- 🛡️ **Admin <-> Öğretmen** (Tüm öğretmenler)
- 🛡️ **Admin <-> Öğrenci** (Support olarak)

**KVKK Compliance:**
- ⚠️ **KRİTİK:** Öğrenciler SADECE kendi öğretmenlerini ve "Support" (admin) görebilir
- ⚠️ Öğrenciler diğer kullanıcıları (başka öğrenciler, başka öğretmenler) göremez
- ⚠️ Öğrenciler sadece kayıtlı oldukları kursların öğretmenleriyle mesajlaşabilir

**Teknik Yaklaşım:**
- Long polling veya SSE (Server-Sent Events) kullanımı (websocket yerine)
- Database-driven messaging (PostgreSQL)
- Role-based visibility filtering (backend & frontend)
- Notification integration (existing notification system)
- Simple REST API endpoints

---

## 🔴 BACKEND TASKS – EPIC-12

### [EP12-BE-01] Message & Conversation Models
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat  
**Bağımlılık:** Yok

**Açıklama:**
Mesajlaşma model'lerini oluşturma. Conversation (thread) ve Message models.

**Dosya:** `backend/app/models/messaging.py`

**Models:**

```python
class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    
    # Participants (generic - supports student<->teacher, admin<->teacher, admin<->student)
    participant1_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    participant2_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    participant1_role = Column(String(20), nullable=False)  # student, teacher, admin
    participant2_role = Column(String(20), nullable=False)  # student, teacher, admin
    
    # Related course (optional - mesajlaşma specific course için olabilir)
    # Sadece student<->teacher konuşmalarında dolu
    course_id = Column(UUID, ForeignKey("courses.id"), nullable=True)
    
    # Conversation metadata
    subject = Column(String(255), nullable=True)  # Konu başlığı (optional)
    conversation_type = Column(String(30), nullable=False)  # student_teacher, admin_teacher, admin_student
    
    # Last message tracking (for sorting)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    last_message_preview = Column(Text, nullable=True)  # İlk 100 karakter
    
    # Read status per participant
    last_read_at_participant1 = Column(DateTime(timezone=True), nullable=True)
    last_read_at_participant2 = Column(DateTime(timezone=True), nullable=True)
    unread_count_participant1 = Column(Integer, default=0, nullable=False)
    unread_count_participant2 = Column(Integer, default=0, nullable=False)
    
    # Conversation status per participant
    is_archived_participant1 = Column(Boolean, default=False)
    is_archived_participant2 = Column(Boolean, default=False)
    is_closed = Column(Boolean, default=False)  # Kapatılan konuşma (yeni mesaj gönderilemez)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    participant1 = relationship("User", foreign_keys=[participant1_id])
    participant2 = relationship("User", foreign_keys=[participant2_id])
    course = relationship("Course")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_conversation_participant1", "participant1_id"),
        Index("idx_conversation_participant2", "participant2_id"),
        Index("idx_conversation_type", "conversation_type"),
        Index("idx_conversation_last_message", "last_message_at"),
        # Unique constraint: aynı iki kişi arasında aynı course için sadece bir konuşma
        # NULL course_id için de unique olmalı (admin konuşmaları için)
        UniqueConstraint("participant1_id", "participant2_id", "course_id", name="uq_conversation_participants"),
        # Check constraint: participant1 ve participant2 farklı olmalı
        CheckConstraint("participant1_id != participant2_id", name="ck_different_participants"),
    )
```

```python
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    conversation_id = Column(UUID, ForeignKey("conversations.id"), nullable=False)
    
    # Sender
    sender_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    sender_role = Column(String(20), nullable=False)  # student or teacher
    
    # Message content
    content = Column(Text, nullable=False)
    
    # Attachments (optional - basit dosya paylaşımı için)
    attachment_url = Column(String(500), nullable=True)
    attachment_filename = Column(String(255), nullable=True)
    attachment_size = Column(BigInteger, nullable=True)
    
    # Read status
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index("idx_message_conversation", "conversation_id"),
        Index("idx_message_sender", "sender_id"),
        Index("idx_message_created", "created_at"),
    )
```

**Kriterler:**
- ✅ Models SQLAlchemy Base'den inherit
- ✅ Proper indexes for performance
- ✅ Unique constraint for conversation participants
- ✅ Read status tracking per user
- ✅ Soft delete support

---

### [EP12-BE-02] Messaging Service (Conversation Management)
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP12-BE-01

**Açıklama:**
Conversation ve message yönetim servisi.

**Dosya:** `backend/app/services/messaging_service.py`

**Fonksiyonlar:**

1. **`async def get_or_create_conversation(participant1_id: str, participant2_id: str, course_id: Optional[str], db: AsyncSession) -> Conversation`**
   - Mevcut conversation kontrolü (her iki yönde de - participant order önemli değil)
   - Yoksa yeni conversation oluştur
   - conversation_type otomatik belirleme (participant role'lerine göre)
   - Return conversation

2. **`async def get_available_message_recipients(user_id: str, user_role: str, db: AsyncSession) -> List[User]`**
   - **KVKK Compliance - KRİTİK FONKSIYON**
   - Kullanıcının mesajlaşabileceği kişileri getir
   - **Student:** Sadece kayıtlı oldukları kursların öğretmenleri + Admin (Support)
   - **Teacher:** Kendi kurslarına kayıtlı öğrenciler + Admin
   - **Admin:** Tüm öğretmenler + tüm öğrenciler
   - Return List[User] with basic info (id, full_name, avatar, role)

3. **`async def send_message(conversation_id: str, sender_id: str, content: str, attachment: Optional[UploadFile], db: AsyncSession, storage: StorageBackend) -> Message`**
   - Mesaj oluştur
   - Attachment upload (if any)
   - Conversation metadata güncelle (last_message_at, last_message_preview)
   - Unread count güncelle (recipient için)
   - Return message

4. **`async def get_conversation_messages(conversation_id: str, limit: int, offset: int, db: AsyncSession) -> List[Message]`**
   - Pagination ile mesajları getir
   - Newest first (created_at DESC)

5. **`async def mark_messages_as_read(conversation_id: str, user_id: str, db: AsyncSession) -> None`**
   - Kullanıcı için okunmamış mesajları "read" yap
   - Unread count sıfırla (participant1 veya participant2 için)
   - last_read_at güncelle

6. **`async def get_user_conversations(user_id: str, user_role: str, include_archived: bool, db: AsyncSession) -> List[Conversation]`**
   - Kullanıcının tüm conversation'larını getir
   - participant1_id veya participant2_id ile match
   - Archived filter (role-based)
   - Sort by last_message_at DESC

7. **`async def archive_conversation(conversation_id: str, user_id: str, db: AsyncSession) -> None`**
   - Conversation'ı kullanıcı için arşivle
   - is_archived_participant1 veya is_archived_participant2 güncelle (user_id'ye göre)

8. **`async def delete_message(message_id: str, user_id: str, db: AsyncSession) -> None`**
   - Soft delete message (is_deleted = True)
   - Sadece sender silebilir

9. **`async def validate_conversation_access(conversation_id: str, user_id: str, db: AsyncSession) -> bool`**
   - Kullanıcının conversation'a erişim yetkisi var mı kontrol et
   - participant1 veya participant2 olmalı
   - Return True/False

**Kriterler:**
- ✅ All functions çalışıyor
- ✅ Proper error handling
- ✅ Attachment upload integration
- ✅ Unread count tracking doğru

---

### [EP12-BE-03] Messaging Endpoints (REST API)
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP12-BE-02

**Açıklama:**
Mesajlaşma REST API endpoint'leri.

> [!CAUTION]
> **GEMINI-COMMENT:** Mesajlaşma sisteminde "Mahremiyet ve İzolasyon" en kritik konudur. Bir öğrenci sadece kayıtlı olduğu kursun eğitmenine mesaj atabilmelidir. Ayrıca `POST /messages/send` endpoint'i üzerinde sıkı bir "Rate Limiting" (örn: dakikada max 10 mesaj) uygulanarak bot/spam saldırıları engellenmelidir. Mesaj içerikleri kaydedilmeden önce backend tarafında mutlaka XSS sanitization işleminden geçirilmelidir.

**Dosya:** `backend/app/api/v1/endpoints/messages.py`

**Endpoint'ler:**

1. **`GET /api/v1/messages/recipients`** - Get available message recipients (KVKK Compliant)
   - **KRİTİK ENDPOINT - Role-based filtering**
   - Query params: `search: str (optional)`
   - Authorization: Any authenticated user
   - **Logic:**
     - Student: Return enrolled course teachers + admin (as "Support")
     - Teacher: Return own course students + admin
     - Admin: Return all teachers + all students
   - Returns: `List[{ id, full_name, avatar, role, label }]`
   - **Note:** Admin görünümünde "Support" olarak label edilecek

2. **`POST /api/v1/messages/conversations`** - Get or create conversation
   - Body: `{ "recipient_id": str, "course_id": str (optional) }`
   - Authorization: Any authenticated user
   - **Validation:** recipient_id, user'ın mesajlaşabileceği kişilerden biri mi kontrol et
   - Returns: Conversation object

3. **`GET /api/v1/messages/conversations`** - List user's conversations
   - Query params: `include_archived: bool`, `limit: int`, `offset: int`
   - Authorization: Any authenticated user
   - Returns: List[Conversation] (with participant info)

4. **`GET /api/v1/messages/conversations/{conversation_id}`** - Get conversation details
   - Authorization: Participant only
   - Returns: Conversation with latest messages

5. **`GET /api/v1/messages/conversations/{conversation_id}/messages`** - Get conversation messages
   - Query params: `limit: int`, `offset: int`
   - Authorization: Participant only
   - Returns: List[Message] (paginated)

6. **`POST /api/v1/messages/conversations/{conversation_id}/messages`** - Send message
   - Body: `{ "content": str, "attachment": file (optional) }`
   - Authorization: Participant only
   - Returns: Created Message

7. **`POST /api/v1/messages/conversations/{conversation_id}/read`** - Mark conversation as read
   - Authorization: Participant only
   - Returns: Success

8. **`POST /api/v1/messages/conversations/{conversation_id}/archive`** - Archive conversation
   - Authorization: Participant only
   - Returns: Success

9. **`DELETE /api/v1/messages/messages/{message_id}`** - Delete message (soft delete)
   - Authorization: Sender only
   - Returns: Success

10. **`GET /api/v1/messages/unread-count`** - Get total unread message count
    - Authorization: Any authenticated user
    - Returns: `{ "unread_count": int }`

**Kriterler:**
- ✅ All endpoints functional
- ✅ Proper authorization (only participants)
- ✅ File upload for attachments
- ✅ Pagination support
- ✅ Unread count tracking

---

### [EP12-BE-04] Long Polling Endpoint for New Messages
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP12-BE-03

**Açıklama:**
Long polling endpoint for "real-time" message updates (websocket yerine).

**Dosya:** `backend/app/api/v1/endpoints/messages.py`

**Endpoint:**

**`GET /api/v1/messages/poll`** - Long polling for new messages
- Query params: 
  - `since: datetime` - Son check timestamp
  - `timeout: int` - Polling timeout (default: 30 seconds)
- Authorization: Any authenticated user
- **KVKK Note:** Sadece kullanıcının participant olduğu conversation'ları döndür
- Returns: `{ "conversations": List[Conversation], "has_new_messages": bool }`

**Mantık:**
```python
@router.get("/poll")
async def poll_new_messages(
    since: datetime,
    timeout: int = Query(30, ge=5, le=60),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start_time = datetime.now(timezone.utc)
    
    while True:
        # Check for new messages
        new_conversations = await db.execute(
            select(Conversation).where(
                or_(
                    and_(Conversation.student_id == current_user.id, Conversation.last_message_at > since),
                    and_(Conversation.teacher_id == current_user.id, Conversation.last_message_at > since),
                )
            )
        )
        conversations = new_conversations.scalars().all()
        
        if conversations:
            # New messages found
            return {
                "conversations": conversations,
                "has_new_messages": True,
            }
        
        # Check timeout
        elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
        if elapsed >= timeout:
            # Timeout, return empty
            return {
                "conversations": [],
                "has_new_messages": False,
            }
        
        # Wait 2 seconds before next check
        await asyncio.sleep(2)
```

**Alternative: Server-Sent Events (SSE)**
- Daha efficient ama biraz daha karmaşık
- Frontend için EventSource API kullanımı gerekir
- Long polling'den daha lightweight

**Kriterler:**
- ✅ Long polling çalışıyor
- ✅ Timeout mekanizması
- ✅ Efficient polling (2-3 saniye interval)
- ✅ No excessive database load

---

### [EP12-BE-05] Messaging Notification Integration
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** EP12-BE-02

**Açıklama:**
Yeni mesaj geldiğinde notification gönderme.

**Dosya:** `backend/app/services/messaging_service.py` (update)

**Mantık:**
```python
async def send_message(...):
    # ... existing message creation logic ...
    
    # Send notification to recipient
    recipient_id = conversation.teacher_id if sender_id == conversation.student_id else conversation.student_id
    
    from app.services.notification_service import send_notification
    from app.models.notification import NotificationType
    
    await send_notification(
        user_id=recipient_id,
        notification_type=NotificationType.NEW_MESSAGE,  # Add to NotificationType enum
        title="Yeni Mesaj",
        message=f"{sender.full_name} size mesaj gönderdi",
        data={
            "conversation_id": str(conversation.id),
            "sender_id": str(sender_id),
            "message_preview": content[:100],
        },
        db=db
    )
    
    return message
```

**NotificationType Ekleme:**
- `backend/app/models/notification.py` içine `NEW_MESSAGE = "new_message"` ekle

**Kriterler:**
- ✅ Notification gönderiliyor
- ✅ Notification click action yönlendirme (conversation detail)
- ✅ Unread message count badge

---

### [EP12-BE-06] Messaging Schema Definitions
**Durum:** ⏳ TODO  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat  
**Bağımlılık:** EP12-BE-01

**Açıklama:**
Pydantic schemas for messaging API.

**Dosya:** `backend/app/schemas/messaging.py`

**Schemas:**
```python
class ConversationCreate(BaseModel):
    recipient_id: str  # Generic recipient (teacher/admin/student based on role)
    course_id: Optional[str] = None
    subject: Optional[str] = None

class MessageRecipient(BaseModel):
    """Available message recipient (KVKK Compliant)"""
    id: str
    full_name: str
    avatar: Optional[str]
    role: str  # student, teacher, admin
    label: str  # Display label (e.g., "Support" for admin in student view)

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_role: str
    content: str
    attachment_url: Optional[str]
    attachment_filename: Optional[str]
    attachment_size: Optional[int]
    is_read: bool
    read_at: Optional[datetime]
    is_deleted: bool
    created_at: datetime
    # Nested sender info
    sender_name: str
    sender_avatar: Optional[str]

class ConversationResponse(BaseModel):
    id: str
    participant1_id: str
    participant2_id: str
    participant1_role: str
    participant2_role: str
    course_id: Optional[str]
    subject: Optional[str]
    conversation_type: str  # student_teacher, admin_teacher, admin_student
    last_message_at: Optional[datetime]
    last_message_preview: Optional[str]
    unread_count: int  # Calculated based on current user
    is_archived: bool  # Calculated based on current user
    is_closed: bool
    created_at: datetime
    # Nested participant info
    participant1_name: str
    participant1_avatar: Optional[str]
    participant2_name: str
    participant2_avatar: Optional[str]
    # Other participant info (kimin ile konuşuyoruz - current user'a göre)
    other_participant_id: str
    other_participant_name: str
    other_participant_avatar: Optional[str]
    other_participant_role: str
    other_participant_label: str  # "Support" if admin, else full_name
    # Course info
    course_title: Optional[str]
    # Latest messages (optional)
    latest_messages: Optional[List[MessageResponse]]

class UnreadCountResponse(BaseModel):
    unread_count: int
```

**Kriterler:**
- ✅ Schemas Pydantic BaseModel'den inherit
- ✅ Validation rules
- ✅ Nested data for better frontend UX

---

### [EP12-BE-07] Alembic Migration for Messaging Tables
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat  
**Bağımlılık:** EP12-BE-01

**Açıklama:**
Database migration for messaging tables.

**Komut:**
```bash
cd backend
alembic revision --autogenerate -m "Add conversations and messages tables"
alembic upgrade head
```

**Kriterler:**
- ✅ Migration dosyası oluşturuldu
- ✅ Tables created successfully
- ✅ Foreign keys ve indexes doğru
- ✅ Unique constraint test edildi

---

## 🔐 SECURITY & EDGE CASE TASKS – EPIC-12

### [EP12-SEC-01] Rate Limiting & Anti-Spam Protection
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP12-BE-03

**Açıklama:**
Mesajlaşma sisteminde spam ve abuse önleme mekanizmaları.

**Dosya:** `backend/app/middleware/messaging_rate_limit.py` veya `backend/app/services/messaging_rate_limit.py`

**Gereksinimler:**

1. **Rate Limiting (Per User)**
   - `POST /messages/conversations/{conversation_id}/messages`: 
     - **10 mesaj/dakika** (normal kullanıcılar)
     - **20 mesaj/dakika** (admin)
     - **5 mesaj/dakika** (yeni hesap, ilk 7 gün)
   - `POST /messages/conversations`: 
     - **5 yeni konuşma/saat** (spam conversation önleme)
   - `GET /messages/poll`: 
     - **30 request/dakika** (long polling abuse önleme)

2. **Content-Based Spam Detection**
   - Aynı içeriğin kısa sürede tekrar gönderilmesi (5 dakika içinde 3+ aynı mesaj)
   - Çok kısa mesajlar (1-2 karakter) spam olarak işaretle
   - Çok uzun mesajlar (10,000+ karakter) rate limit uygula
   - URL spam detection (mesajda 5+ URL varsa flag)

3. **Conversation Spam Detection**
   - Aynı kullanıcıya 1 saat içinde 10+ mesaj → otomatik mute (geçici)
   - Aynı recipient'a 1 saat içinde 5+ yeni konuşma → rate limit

4. **Implementation:**
   ```python
   from datetime import datetime, timedelta
   from collections import defaultdict
   import redis  # veya in-memory cache
   
   # Redis key pattern: "msg_rate_limit:{user_id}:{endpoint}:{time_window}"
   # Example: "msg_rate_limit:user123:send_message:2026-02-20-14:30"
   
   async def check_rate_limit(
       user_id: str,
       endpoint: str,
       max_requests: int,
       window_seconds: int,
       db: AsyncSession,
   ) -> tuple[bool, int]:
       """
       Returns: (is_allowed, remaining_requests)
       """
       # Redis veya database-based rate limiting
       # Sliding window algorithm
   ```

5. **Rate Limit Response:**
   - HTTP 429 (Too Many Requests)
   - Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
   - Body: `{ "error": "Rate limit exceeded", "retry_after": 60 }`

**Edge Cases:**
- ✅ Kullanıcı rate limit'e takıldığında notification gönder (spam şüphesi)
- ✅ Admin rate limit bypass (emergency durumlar için)
- ✅ Rate limit loglama (audit için)
- ✅ Rate limit reset mekanizması (admin tarafından)

**Kriterler:**
- ✅ Rate limiting çalışıyor
- ✅ Redis veya database-based sliding window
- ✅ Proper error responses (429)
- ✅ Rate limit headers
- ✅ Admin bypass mekanizması
- ✅ Audit logging

---

### [EP12-SEC-02] Content Moderation & XSS Protection
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP12-BE-02

**Açıklama:**
Mesaj içeriklerinin güvenli hale getirilmesi ve zararlı içerik filtreleme.

**Dosya:** `backend/app/services/messaging_content_moderation.py`

**Gereksinimler:**

1. **XSS Sanitization**
   - HTML tag'lerini strip et (sadece safe tags: `<b>`, `<i>`, `<u>`, `<br>`, `<p>`)
   - JavaScript injection önleme (`<script>`, `onclick=`, `javascript:`)
   - HTML entity encoding (backend'de sanitize, frontend'de render)
   - Library: `bleach` veya `html-sanitizer`

2. **Content Length Limits**
   - Min: 1 karakter (boş mesaj önleme)
   - Max: 10,000 karakter (database TEXT limit)
   - Truncate uzun mesajlar (10,000+ karakter → 10,000'e kes)

3. **Profanity/Spam Word Filtering (Optional)**
   - Türkçe küfür/spam kelime listesi
   - Configurable (admin panel'den yönetilebilir)
   - Action: Warn, Auto-flag, Auto-delete

4. **URL Validation**
   - URL'lerin geçerli format'ta olduğunu kontrol et
   - Malicious URL detection (phishing, malware)
   - External link warning (frontend'de göster)

5. **Implementation:**
   ```python
   import bleach
   from bleach.css_sanitizer import CSSSanitizer
   
   ALLOWED_TAGS = ['b', 'i', 'u', 'br', 'p', 'a']
   ALLOWED_ATTRIBUTES = {'a': ['href', 'title']}
   
   def sanitize_message_content(content: str) -> str:
       # HTML sanitization
       cleaned = bleach.clean(
           content,
           tags=ALLOWED_TAGS,
           attributes=ALLOWED_ATTRIBUTES,
           strip=True,
       )
       
       # Length check
       if len(cleaned) > 10000:
           cleaned = cleaned[:10000]
       
       # Empty check
       if not cleaned.strip():
           raise ValueError("Mesaj içeriği boş olamaz")
       
       return cleaned
   ```

6. **Content Moderation Flags**
   - `is_flagged`: Boolean (moderasyon gerektiriyor mu)
   - `flag_reason`: String (neden flag edildi)
   - `moderated_at`: DateTime (moderasyon tarihi)
   - `moderated_by_id`: UUID (moderasyon yapan admin)

**Edge Cases:**
- ✅ Unicode emoji ve özel karakterler (sanitize sırasında korunmalı)
- ✅ Code snippets (backtick ile korunmalı, sanitize edilmemeli)
- ✅ Line breaks (preserve edilmeli)
- ✅ Empty content after sanitization (reject)

**Kriterler:**
- ✅ XSS protection çalışıyor
- ✅ HTML sanitization
- ✅ Content length validation
- ✅ Empty content rejection
- ✅ Unicode support
- ✅ Admin moderation flags

---

### [EP12-SEC-03] File Upload Security & Validation
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP12-BE-02

**Açıklama:**
Mesaj eklerinde dosya yükleme güvenliği ve validasyonu.

**Dosya:** `backend/app/services/messaging_attachment_service.py`

**Gereksinimler:**

1. **Allowed File Types**
   - Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` (max 5MB)
   - Documents: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx` (max 10MB)
   - Archives: `.zip`, `.rar` (max 10MB, virus scan gerekli)
   - **NOT ALLOWED:** `.exe`, `.bat`, `.sh`, `.js`, `.html`, `.php`, `.py`, `.jar`

2. **File Validation**
   - **Magic-byte MIME type validation** (uzantı bypass önleme)
   - Filename sanitization (path traversal önleme: `../`, `..\\`)
   - Filename length limit (255 karakter)
   - File size validation (tip bazlı)
   - Virus scanning (ClamAV veya cloud service - optional)

3. **Storage Security**
   - Dosyalar isolated directory'de saklanmalı (`/messages/attachments/{user_id}/{message_id}/`)
   - Public URL'ler signed/expiring olmalı (1 saat geçerli)
   - Direct file access önleme (authentication required)

4. **Quota Management**
   - Per-user attachment quota (100MB total)
   - Per-message attachment limit (5 dosya)
   - Quota exceeded → error + notification

5. **Implementation:**
   ```python
   from pathlib import Path
   from app.services.security_service import validate_mime_type_magic_byte
   
   ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
   ALLOWED_DOCUMENT_TYPES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']
   ALLOWED_ARCHIVE_TYPES = ['.zip', '.rar']
   
   MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
   MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10MB
   MAX_ARCHIVE_SIZE = 10 * 1024 * 1024  # 10MB
   
   async def validate_attachment(
       file: UploadFile,
       user_id: str,
       db: AsyncSession,
   ) -> tuple[bytes, str, int]:
       """
       Returns: (file_content, sanitized_filename, file_size)
       """
       # Filename sanitization
       filename = Path(file.filename).name  # Remove path traversal
       if len(filename) > 255:
           raise ValueError("Dosya adı çok uzun")
       
       # File extension check
       ext = Path(filename).suffix.lower()
       if ext not in ALLOWED_IMAGE_TYPES + ALLOWED_DOCUMENT_TYPES + ALLOWED_ARCHIVE_TYPES:
           raise ValueError(f"İzin verilmeyen dosya tipi: {ext}")
       
       # Read file
       content = await file.read()
       file_size = len(content)
       
       # Size check
       if ext in ALLOWED_IMAGE_TYPES and file_size > MAX_IMAGE_SIZE:
           raise ValueError(f"Görsel boyutu çok büyük (max: 5MB)")
       elif ext in ALLOWED_DOCUMENT_TYPES and file_size > MAX_DOCUMENT_SIZE:
           raise ValueError(f"Doküman boyutu çok büyük (max: 10MB)")
       elif ext in ALLOWED_ARCHIVE_TYPES and file_size > MAX_ARCHIVE_SIZE:
           raise ValueError(f"Arşiv boyutu çok büyük (max: 10MB)")
       
       # Magic-byte validation
       detected_mime = validate_mime_type_magic_byte(content, ext)
       
       # Quota check
       await check_user_attachment_quota(user_id, file_size, db)
       
       return content, filename, file_size
   ```

**Edge Cases:**
- ✅ Double extension bypass (`.exe.jpg` → reject)
- ✅ MIME type spoofing (magic-byte validation)
- ✅ Path traversal (`../../../etc/passwd` → sanitize)
- ✅ Quota exhaustion attack (rate limit + quota check)
- ✅ Large file DoS (size limit + streaming upload)

**Kriterler:**
- ✅ File type validation
- ✅ Magic-byte MIME validation
- ✅ Filename sanitization
- ✅ Size limits
- ✅ Quota management
- ✅ Signed/expiring URLs
- ✅ Virus scanning (optional)

---

### [EP12-SEC-04] Authorization & Access Control Hardening
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP12-BE-02, EP12-BE-03

**Açıklama:**
Mesajlaşma sisteminde yetkilendirme ve erişim kontrolü güçlendirmesi.

**Dosya:** `backend/app/services/messaging_authorization.py`

**Gereksinimler:**

1. **Conversation Access Control**
   - Participant-only access (participant1 veya participant2)
   - Admin override (admin tüm conversation'ları görebilir, ama sadece read-only)
   - Deleted user handling (silinen kullanıcıların conversation'ları archive edilmeli)

2. **Message Access Control**
   - Sadece conversation participant'ları mesajları görebilir
   - Soft-deleted mesajlar sadece sender'a görünür (recipient'e görünmez)
   - Admin moderation access (admin tüm mesajları görebilir)

3. **Recipient Validation (KVKK)**
   - `POST /messages/conversations` endpoint'inde recipient validation
   - Recipient'ın `get_available_message_recipients` listesinde olup olmadığını kontrol et
   - Bypass attempt → 403 + audit log

4. **Conversation Hijacking Prevention**
   - Conversation ID enumeration önleme (UUID kullan, sequential ID yok)
   - Participant order normalization (participant1_id < participant2_id her zaman)
   - Conversation creation race condition önleme (unique constraint)

5. **Implementation:**
   ```python
   async def validate_conversation_access(
       conversation_id: str,
       user_id: str,
       user_role: str,
       db: AsyncSession,
   ) -> Conversation:
       """
       Returns Conversation if user has access, raises 403 otherwise.
       """
       result = await db.execute(
           select(Conversation)
           .where(Conversation.id == conversation_id)
       )
       conversation = result.scalar_one_or_none()
       
       if not conversation:
           raise HTTPException(404, "Conversation bulunamadı")
       
       # Admin can view all (read-only)
       if user_role == "admin":
           return conversation
       
       # Participant check
       if conversation.participant1_id != user_id and conversation.participant2_id != user_id:
           # Audit log: unauthorized access attempt
           await log_security_event(
               db, "UNAUTHORIZED_CONVERSATION_ACCESS",
               user_id=user_id, conversation_id=conversation_id,
           )
           raise HTTPException(403, "Bu conversation'a erişim yetkiniz yok")
       
       return conversation
   
   async def validate_recipient_access(
       sender_id: str,
       sender_role: str,
       recipient_id: str,
       db: AsyncSession,
   ) -> bool:
       """
       KVKK compliant recipient validation.
       """
       available = await get_available_message_recipients(sender_id, sender_role, db)
       recipient_ids = [u.id for u in available]
       
       if recipient_id not in recipient_ids:
           # Audit log: KVKK violation attempt
           await log_security_event(
               db, "KVKK_VIOLATION_ATTEMPT",
               user_id=sender_id, recipient_id=recipient_id,
           )
           return False
       
       return True
   ```

**Edge Cases:**
- ✅ UUID enumeration (brute force önleme)
- ✅ Race condition (conversation creation)
- ✅ Deleted user conversations (archive)
- ✅ Admin read-only access (write permission yok)
- ✅ KVKK violation attempts (audit log)

**Kriterler:**
- ✅ Participant-only access
- ✅ Admin override (read-only)
- ✅ Recipient validation
- ✅ Audit logging
- ✅ Deleted user handling

---

### [EP12-SEC-05] User Blocking & Muting System
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP12-BE-01, EP12-BE-02

**Açıklama:**
Kullanıcı engelleme ve sessize alma sistemi.

**Dosya:** `backend/app/models/user_block.py` (yeni model)

**Gereksinimler:**

1. **User Blocking Model**
   ```python
   class UserBlock(Base):
       __tablename__ = "user_blocks"
       
       id = Column(UUID, primary_key=True, default=uuid4)
       blocker_id = Column(UUID, ForeignKey("users.id"), nullable=False)
       blocked_id = Column(UUID, ForeignKey("users.id"), nullable=False)
       reason = Column(String(255), nullable=True)  # Optional reason
       created_at = Column(DateTime, server_default=func.now())
       
       # Unique constraint: aynı kişi iki kez engellenemez
       __table_args__ = (
           UniqueConstraint("blocker_id", "blocked_id", name="uq_user_block"),
           CheckConstraint("blocker_id != blocked_id", name="ck_block_different_users"),
       )
   ```

2. **Blocking Logic**
   - Blocked user mesaj gönderemez (403 error)
   - Blocked user'ın mesajları blocker'a gösterilmez (filtered)
   - Existing conversation'lar otomatik archive edilir
   - Unblock mekanizması (blocker tarafından)

3. **Muting Logic (Temporary)**
   - Mute: Mesajlar gelir ama bildirim gösterilmez
   - Mute duration: 1 saat, 24 saat, 1 hafta, süresiz
   - Auto-unmute (duration sonunda)

4. **Endpoints:**
   - `POST /messages/users/{user_id}/block` - Block user
   - `DELETE /messages/users/{user_id}/block` - Unblock user
   - `GET /messages/users/blocked` - List blocked users
   - `POST /messages/conversations/{conversation_id}/mute` - Mute conversation
   - `DELETE /messages/conversations/{conversation_id}/mute` - Unmute conversation

**Edge Cases:**
- ✅ Blocked user conversation creation attempt (reject)
- ✅ Blocked user message send attempt (reject)
- ✅ Mutual blocking (her iki taraf da birbirini engellemiş)
- ✅ Admin cannot be blocked (exception)

**Kriterler:**
- ✅ Blocking model created
- ✅ Block/unblock endpoints
- ✅ Message filtering
- ✅ Conversation archiving
- ✅ Mute functionality

---

### [EP12-SEC-06] Message Search & Privacy
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP12-BE-03

**Açıklama:**
Mesaj arama özelliği (privacy-aware).

**Dosya:** `backend/app/api/v1/endpoints/messages.py`

**Gereksinimler:**

1. **Search Endpoint**
   - `GET /messages/search?q={query}&conversation_id={id}&limit={limit}`
   - Sadece kullanıcının participant olduğu conversation'larda arama
   - Full-text search (PostgreSQL `tsvector`)

2. **Privacy Constraints**
   - Sadece kendi mesajlarını ve kendi conversation'larındaki mesajları arayabilir
   - Admin: Tüm conversation'larda arama (moderation için)
   - Soft-deleted mesajlar search sonuçlarında görünmez

3. **Search Indexing**
   - Message content için full-text search index
   - Attachment filename search (optional)

4. **Rate Limiting**
   - Search endpoint: 20 request/dakika (DoS önleme)

**Kriterler:**
- ✅ Full-text search
- ✅ Privacy-aware filtering
- ✅ Rate limiting
- ✅ Index optimization

---

### [EP12-SEC-07] Conversation Export & KVKK Compliance
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP12-BE-03

**Açıklama:**
KVKK uyumluluğu için conversation export ve veri silme.

**Gereksinimler:**

1. **Export Endpoint**
   - `GET /messages/conversations/{conversation_id}/export`
   - Format: JSON veya PDF
   - Sadece kullanıcının kendi conversation'ları export edilebilir
   - Tüm mesajlar, timestamps, attachments (URL'ler)

2. **Data Deletion (KVKK Right to be Forgotten)**
   - `DELETE /messages/conversations/{conversation_id}` - Soft delete (kullanıcı için)
   - `DELETE /messages/messages/{message_id}` - Soft delete (sadece sender)
   - Hard delete (admin only, 30 gün sonra)

3. **Audit Trail**
   - Export ve delete işlemleri loglanmalı
   - KVKK compliance için gerekli

**Kriterler:**
- ✅ Export functionality
- ✅ Soft delete
- ✅ Hard delete (admin)
- ✅ Audit logging

---

### [EP12-SEC-08] Admin Moderation & Reporting
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP12-BE-03, EP12-SEC-02

**Açıklama:**
Admin mesaj moderasyonu ve kullanıcı şikayet sistemi.

**Gereksinimler:**

1. **Message Reporting**
   - `POST /messages/messages/{message_id}/report`
   - Report reason: Spam, Harassment, Inappropriate, Other
   - Report count threshold (5+ report → auto-flag)

2. **Admin Moderation Panel**
   - Flagged messages list
   - Message detail view
   - Actions: Delete, Warn user, Block user, Dismiss

3. **Auto-Moderation**
   - Spam detection → auto-flag
   - Profanity filter → auto-flag
   - Rate limit violation → auto-flag

**Kriterler:**
- ✅ Reporting system
- ✅ Admin moderation panel
- ✅ Auto-moderation
- ✅ Audit logging

---

## 🎨 FRONTEND TASKS – EPIC-12

### [EP12-FE-01] Messaging Inbox Page
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3-4 saat  
**Bağımlılık:** EP12-BE-03

**Açıklama:**
Mesajlaşma inbox sayfası (conversation list).

**Dosya:** `frontend/src/app/(dashboard)/dashboard/messages/page.tsx`

**Özellikler:**
- Conversation list (WhatsApp/Telegram style)
- Her conversation card:
  - Participant avatar & name
  - Last message preview
  - Last message time (relative time)
  - Unread badge
  - Course badge (if related to course)
- Search conversations
- Filter: All / Unread / Archived
- Sort by last message time
- "Yeni Konuşma Başlat" butonu
- Empty state (henüz mesaj yok)

**Tasarım:**
- Two-column layout (conversation list + selected conversation)
- Responsive (mobile: single column)
- Modern chat UI design
- Real-time unread count badge

**API Integration:**
```typescript
const { data: conversations, isLoading } = useQuery({
  queryKey: ["conversations"],
  queryFn: () => messagesApi.getConversations(),
  refetchInterval: 30000, // Poll every 30 seconds
});
```

**Kriterler:**
- ✅ Conversation list görüntüleniyor
- ✅ Search/filter çalışıyor
- ✅ Click action conversation detail açıyor
- ✅ Responsive design

---

### [EP12-FE-02] Conversation Detail & Chat Interface
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4-5 saat  
**Bağımlılık:** EP12-BE-03

**Açıklama:**
Conversation detail sayfası veya panel (chat interface).

> [!TIP]
> **GEMINI-COMMENT:** Chat arayüzünde "Görüldü" (Seen) bilgisi kullanıcı güvenini artırır. Ayrıca, konuşmanın en üstünde ilgili kursun (`course_id`) küçük bir kart olarak gösterilmesi, eğitmenin sorunun hangi bağlamda (hangi dersle ilgili) sorulduğunu anında anlamasını sağlar. Mesajların içine resim/PDF yapıştırma (clipboard copy-paste) desteği de hoca-öğrenci iletişimini çok hızlandıracaktır.

**Dosya:** `frontend/src/components/messages/ConversationDetail.tsx`

**Özellikler:**
- Message list (chat bubbles)
  - Sender/recipient alignment (left/right)
  - Message timestamp
  - Read status indicator (double check mark)
  - Attachment preview/download
- Message input box
  - Text area (auto-expand)
  - Attachment button
  - Send button
  - Emoji picker (optional)
- Scroll to bottom on new message
- Load more messages (pagination)
- Mark as read when viewing
- Real-time message updates (polling)

**Tasarım:**
- Chat bubble style (WhatsApp/iMessage)
- Sender messages: right aligned, primary color
- Recipient messages: left aligned, gray
- Sticky message input at bottom
- Smooth scroll animations

**API Integration:**
```typescript
// Get messages
const { data: messages, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["conversation-messages", conversationId],
  queryFn: ({ pageParam = 0 }) => 
    messagesApi.getMessages(conversationId, { offset: pageParam, limit: 50 }),
  getNextPageParam: (lastPage, allPages) => 
    lastPage.length === 50 ? allPages.length * 50 : undefined,
});

// Send message
const sendMessage = useMutation({
  mutationFn: (data: { content: string; attachment?: File }) =>
    messagesApi.sendMessage(conversationId, data),
  onSuccess: () => {
    queryClient.invalidateQueries(["conversation-messages", conversationId]);
    queryClient.invalidateQueries(["conversations"]);
  },
});

// Polling for new messages
useEffect(() => {
  const interval = setInterval(() => {
    queryClient.invalidateQueries(["conversation-messages", conversationId]);
  }, 10000); // Poll every 10 seconds
  return () => clearInterval(interval);
}, [conversationId]);
```

**Kriterler:**
- ✅ Message list görüntüleniyor
- ✅ Send message çalışıyor
- ✅ File attachment upload çalışıyor
- ✅ Scroll behavior smooth
- ✅ Polling updates çalışıyor
- ✅ Mark as read functional
- ✅ Responsive design

---

### [EP12-FE-03] New Conversation Modal (KVKK Compliant)
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK (KVKK Compliance)  
**Tahmini Süre:** 2-3 saat  
**Bağımlılık:** EP12-BE-03

**Açıklama:**
Yeni konuşma başlatma modal'ı. **KVKK compliant** recipient listing.

**Dosya:** `frontend/src/components/messages/NewConversationModal.tsx`

**Özellikler:**
- **Recipient seçimi (Role-based filtered list)**
  - **Student view:** Sadece kayıtlı kursların öğretmenleri + "Support" (admin)
  - **Teacher view:** Kendi kurslarına kayıtlı öğrenciler + "Support" (admin)
  - **Admin view:** Tüm öğretmenler + tüm öğrenciler
  - Recipient avatar & name & role badge
  - Search/filter
- Course seçimi (optional - dropdown, sadece teacher seçiliyse)
- Subject input (optional)
- "Konuşma Başlat" butonu

**Tasarım:**
- Modal dialog
- Clean, simple form
- Recipient search/filter with role badges
- **"Support" badge** for admin (student görünümünde)
- Course badge (if applicable)

**API Integration:**
```typescript
// Get available recipients (KVKK compliant)
const { data: recipients, isLoading } = useQuery({
  queryKey: ["message-recipients", searchQuery],
  queryFn: () => messagesApi.getAvailableRecipients({ search: searchQuery }),
});

// Create conversation
const createConversation = useMutation({
  mutationFn: (data: ConversationCreate) =>
    messagesApi.createConversation(data),
  onSuccess: (conversation) => {
    queryClient.invalidateQueries(["conversations"]);
    // Redirect to conversation detail
    router.push(`/dashboard/messages?conversation=${conversation.id}`);
  },
});
```

**Kriterler:**
- ✅ Recipient list role-based filtered (KVKK compliant)
- ✅ Student CANNOT see other students/teachers (only enrolled teachers + admin)
- ✅ Admin shown as "Support" in student view
- ✅ Search/filter çalışıyor
- ✅ Create conversation functional
- ✅ Redirect to new conversation
- ✅ Responsive design

---

### [EP12-FE-04] Unread Message Count Badge (Global)
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** EP12-BE-03

**Açıklama:**
Global unread message count badge (header/sidebar).

**Dosya:** 
- `frontend/src/app/(dashboard)/layout.tsx` (sidebar)
- `frontend/src/components/layout/Header.tsx` (header badge)

**Özellikler:**
- Unread count badge on "Mesajlar" menu item
- Real-time updates (polling)
- Badge color: red/orange
- Badge position: top-right corner

**API Integration:**
```typescript
const { data: unreadCount } = useQuery({
  queryKey: ["unread-message-count"],
  queryFn: () => messagesApi.getUnreadCount(),
  refetchInterval: 30000, // Poll every 30 seconds
});
```

**Kriterler:**
- ✅ Badge görüntüleniyor
- ✅ Count doğru
- ✅ Real-time updates (polling)
- ✅ Responsive design

---

### [EP12-FE-05] API Client & Sidebar Updates (EPIC-12)
**Durum:** ⏳ TODO  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1-2 saat  
**Bağımlılık:** EP12-BE-03, EP12-FE-01

**Açıklama:**
API client ve sidebar menü güncellemeleri.

**Dosya:** 
- `frontend/src/lib/api.ts`
- `frontend/src/app/(dashboard)/layout.tsx`

**API Client Functions:**
```typescript
export const messagesApi = {
  // KVKK Compliant recipient listing
  getAvailableRecipients: async (params?: {
    search?: string;
  }): Promise<MessageRecipient[]> => {
    const res = await api.get("/messages/recipients", { params });
    return res.data;
  },
  
  getConversations: async (params?: {
    include_archived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ConversationResponse[]> => {
    const res = await api.get("/messages/conversations", { params });
    return res.data;
  },
  
  getConversation: async (id: string): Promise<ConversationResponse> => {
    const res = await api.get(`/messages/conversations/${id}`);
    return res.data;
  },
  
  getMessages: async (
    conversationId: string,
    params: { limit: number; offset: number }
  ): Promise<MessageResponse[]> => {
    const res = await api.get(
      `/messages/conversations/${conversationId}/messages`,
      { params }
    );
    return res.data;
  },
  
  sendMessage: async (
    conversationId: string,
    data: { content: string; attachment?: File }
  ): Promise<MessageResponse> => {
    const formData = new FormData();
    formData.append("content", data.content);
    if (data.attachment) {
      formData.append("attachment", data.attachment);
    }
    const res = await api.post(
      `/messages/conversations/${conversationId}/messages`,
      formData
    );
    return res.data;
  },
  
  markAsRead: async (conversationId: string): Promise<void> => {
    await api.post(`/messages/conversations/${conversationId}/read`);
  },
  
  archiveConversation: async (conversationId: string): Promise<void> => {
    await api.post(`/messages/conversations/${conversationId}/archive`);
  },
  
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/messages/${messageId}`);
  },
  
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const res = await api.get("/messages/unread-count");
    return res.data;
  },
  
  createConversation: async (
    data: ConversationCreate
  ): Promise<ConversationResponse> => {
    const res = await api.post("/messages/conversations", data);
    return res.data;
  },
  
  pollNewMessages: async (since: string, timeout?: number): Promise<{
    conversations: ConversationResponse[];
    has_new_messages: boolean;
  }> => {
    const res = await api.get("/messages/poll", {
      params: { since, timeout },
    });
    return res.data;
  },
};
```

**Sidebar Menu:**
- **Student, Teacher & Admin:**
  - "Mesajlar" → `/dashboard/messages`
  - Icon: 💬 veya message icon
  - Badge: Unread count (real-time polling)
  - Label: "Mesajlar" (Mesajlaşma)

**Kriterler:**
- ✅ API client functions tanımlandı
- ✅ TypeScript types doğru
- ✅ KVKK compliant recipient filtering implemented
- ✅ Sidebar menu items eklendi (all roles)
- ✅ Unread badge çalışıyor

---

## 📝 Notlar

**EPIC-11 (Sertifika) Öncelik Sırası:**
1. Backend: BE-01 → BE-02 → BE-03 → BE-05 → BE-06 → BE-08 → BE-04 → BE-07
2. Frontend: FE-01 → FE-02 → FE-03 → FE-05 → FE-06 → FE-04

**EPIC-12 (Mesajlaşma) Öncelik Sırası:**
1. Backend: BE-01 → BE-02 → BE-03 → BE-05 → BE-07 → BE-06 → BE-04
2. Frontend: FE-01 → FE-02 → FE-04 → FE-05 → FE-03

**Teknik Detaylar:**
- **Sertifika PDF Generation**: WeasyPrint veya ReportLab kullanılacak
- **QR Code**: `qrcode[pil]` library
- **Mesajlaşma**: Long polling veya SSE (websocket yerine)
- **Real-time Updates**: Frontend polling (10-30 saniye interval)

**Güvenlik:**
- Certificate verification public (no auth)
- Messaging: Only participants can access conversations
- **KVKK Compliance (Messaging):**
  - ⚠️ Students can ONLY see enrolled course teachers + admin (Support)
  - ⚠️ Students CANNOT see other students or non-enrolled teachers
  - ⚠️ Backend validation for recipient access (prevent unauthorized messaging)
  - ⚠️ Role-based filtering on both frontend and backend
- File upload: Size limits ve MIME type validation
- XSS prevention: Message content sanitization

---

## 🔐 KVKK Compliance Implementation Guide (EPIC-12)

**KRİTİK GEREKSINIMLER:**

### 1. Backend Recipient Filtering (`EP12-BE-02: get_available_message_recipients`)
```python
async def get_available_message_recipients(user_id: str, user_role: str, db: AsyncSession) -> List[User]:
    if user_role == "student":
        # Get enrolled course teachers
        enrolled_teachers = await db.execute(
            select(User).distinct()
            .join(Course, Course.teacher_id == User.id)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .where(Enrollment.student_id == user_id)
        )
        teachers = enrolled_teachers.scalars().all()
        
        # Get admins (as "Support")
        admins = await db.execute(
            select(User).where(User.role == "admin")
        )
        admin_users = admins.scalars().all()
        
        return teachers + admin_users
    
    elif user_role == "teacher":
        # Get own course students
        own_students = await db.execute(
            select(User).distinct()
            .join(Enrollment, Enrollment.student_id == User.id)
            .join(Course, Course.id == Enrollment.course_id)
            .where(Course.teacher_id == user_id)
        )
        students = own_students.scalars().all()
        
        # Get admins
        admins = await db.execute(
            select(User).where(User.role == "admin")
        )
        admin_users = admins.scalars().all()
        
        return students + admin_users
    
    elif user_role == "admin":
        # Get all teachers + all students
        all_users = await db.execute(
            select(User).where(User.role.in_(["teacher", "student"]))
        )
        return all_users.scalars().all()
    
    return []
```

### 2. Conversation Creation Validation (`EP12-BE-03: POST /conversations`)
```python
@router.post("/conversations")
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # VALIDATE: Is recipient_id in available recipients?
    available = await get_available_message_recipients(
        current_user.id, current_user.role, db
    )
    if data.recipient_id not in [u.id for u in available]:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to message this user (KVKK violation)"
        )
    
    # Create conversation
    conversation = await get_or_create_conversation(...)
    return conversation
```

### 3. Frontend Recipient Display (`EP12-FE-03: NewConversationModal`)
- **Student view:**
  - Teachers: Show as normal (with teacher badge)
  - Admin: Show as "🛡️ Support" (special label)
- **Teacher view:**
  - Students: Show as normal (with student badge)
  - Admin: Show as "🛡️ Support"
- **Admin view:**
  - Everyone: Show with respective role badges

### 4. Testing KVKK Compliance
- ✅ Test: Student CANNOT see other students in recipient list
- ✅ Test: Student CANNOT see teachers of non-enrolled courses
- ✅ Test: Student CAN see enrolled course teachers
- ✅ Test: Student CAN see admin (as "Support")
- ✅ Test: Backend rejects conversation creation with unauthorized recipient
- ✅ Test: API returns 403 for unauthorized recipient access

---

## 🆕 EPIC-BLOG: Blog Yönetim Sistemi
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🟠 ORTA
- **Tahmini Süre:** 5-7 Gün
- **Açıklama:** Eğitmenler ve adminlerin blog yazıları oluşturabileceği, SEO ayarları yapabileceği, kategoriler ve etiketlerle organize edilebilen tam özellikli blog sistemi.
- **Backend:** 12/12 ✅ (EP13-BE-01 ~ EP13-BE-12)
- **Frontend:** 15/15 ✅ (EP13-FE-01 ~ EP13-FE-15)
- **Durum:** ✅ TAMAMLANDI
- **Ek İyileştirmeler:**
  - ✅ Eğitmen onay sistemi: Eğitmenler yazıları direkt yayınlayamaz, admin onayı gerekir
  - ✅ Admin tüm yazıları görüntüleyebilir ve düzenleyebilir
  - ✅ Onay bekleyen yazılar admin dashboard'a eklendi
  - ✅ Custom contentEditable rich text editor (Tiptap/React Quill yerine)
  - ✅ Blog yazıları için pending_review status eklendi

### 📋 Genel Özellikler
- ✅ Eğitmenler ve adminler blog yazısı oluşturabilir
- ✅ Tam SEO kontrolü (meta title, description, keywords, OG tags, schema.org)
- ✅ Blog kategorileri ve etiketler
- ✅ Rich text editor ile içerik yazımı
- ✅ Öne çıkan görsel yükleme
- ✅ Yayın durumu (draft, published, archived)
- ✅ Görüntülenme sayısı takibi
- ✅ Yayın tarihi planlama
- ✅ Admin moderasyon sistemi
- ✅ Public blog listesi ve detay sayfaları
- ✅ SEO-friendly URL yapısı (slug)
- ✅ Yazar profili entegrasyonu

---

## 🔧 BACKEND TASKS

### EP13-BE-01: Blog Post Model Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Blog yazıları için SQLAlchemy model oluşturulacak.

**Detaylar:**
- `backend/app/models/blog_post.py` dosyası oluştur
- Model alanları:
  - `id`: UUID (primary key)
  - `title`: String(255) - Blog başlığı
  - `slug`: String(255) - SEO-friendly URL (unique, indexed)
  - `excerpt`: Text - Kısa özet (liste görünümü için)
  - `content`: Text - Ana içerik (rich text HTML)
  - `featured_image_url`: String(500) - Öne çıkan görsel URL
  - `author_id`: UUID (ForeignKey to users.id) - Yazar
  - `status`: Enum (DRAFT, PUBLISHED, ARCHIVED) - Yayın durumu
  - `published_at`: DateTime - Yayın tarihi (nullable, planlanmış yayın için)
  - `view_count`: Integer (default=0) - Görüntülenme sayısı
  - `is_featured`: Boolean (default=False) - Öne çıkan yazı
  - `is_pinned`: Boolean (default=False) - Sabitlenmiş yazı
  - `allow_comments`: Boolean (default=True) - Yorumlara izin ver
  - `seo_meta_title`: String(255) - SEO meta title
  - `seo_meta_description`: Text - SEO meta description
  - `seo_meta_keywords`: String(500) - SEO keywords (comma-separated)
  - `seo_og_title`: String(255) - Open Graph title
  - `seo_og_description`: Text - Open Graph description
  - `seo_og_image_url`: String(500) - Open Graph image
  - `seo_twitter_card`: String(50) - Twitter card type (summary, summary_large_image)
  - `seo_canonical_url`: String(500) - Canonical URL
  - `seo_schema_json`: JSON - Schema.org structured data (JSON-LD)
  - `created_at`: DateTime
  - `updated_at`: DateTime
- Relationships:
  - `author`: relationship to User
  - `categories`: many-to-many to BlogCategory
  - `tags`: many-to-many to BlogTag
  - `comments`: one-to-many to BlogComment (opsiyonel, gelecekte)
- Indexes:
  - `slug` (unique)
  - `author_id`
  - `status`
  - `published_at`
  - `created_at` (desc)
- Constraints:
  - `slug` unique constraint
  - `author_id` foreign key constraint

**Kabul Kriterleri:**
- ✅ Model dosyası oluşturuldu
- ✅ Tüm alanlar tanımlandı
- ✅ Relationships kuruldu
- ✅ Indexes eklendi
- ✅ `__init__.py`'ye import edildi
- ✅ Alembic migration oluşturuldu ve test edildi

---

### EP13-BE-02: Blog Category Model Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:** Blog kategorileri için model oluşturulacak.

**Detaylar:**
- `backend/app/models/blog_category.py` dosyası oluştur
- Model alanları:
  - `id`: UUID (primary key)
  - `name`: String(100) - Kategori adı
  - `slug`: String(100) - SEO-friendly URL (unique, indexed)
  - `description`: Text - Kategori açıklaması
  - `icon`: String(50) - İkon (opsiyonel)
  - `color`: String(7) - Hex color code (opsiyonel)
  - `parent_id`: UUID (ForeignKey to blog_categories.id, nullable) - Üst kategori
  - `order`: Integer (default=0) - Sıralama
  - `is_active`: Boolean (default=True) - Aktif mi
  - `seo_meta_title`: String(255) - SEO meta title
  - `seo_meta_description`: Text - SEO meta description
  - `created_at`: DateTime
  - `updated_at`: DateTime
- Relationships:
  - `parent`: self-referential relationship
  - `children`: one-to-many to BlogCategory
  - `posts`: many-to-many to BlogPost (through association table)
- Indexes:
  - `slug` (unique)
  - `parent_id`
  - `order`
- Association table: `blog_post_categories` (post_id, category_id)

**Kabul Kriterleri:**
- ✅ Model dosyası oluşturuldu
- ✅ Self-referential relationship kuruldu
- ✅ Many-to-many association table oluşturuldu
- ✅ `__init__.py`'ye import edildi
- ✅ Alembic migration oluşturuldu

---

### EP13-BE-03: Blog Tag Model Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:** Blog etiketleri için model oluşturulacak.

**Detaylar:**
- `backend/app/models/blog_tag.py` dosyası oluştur
- Model alanları:
  - `id`: UUID (primary key)
  - `name`: String(50) - Etiket adı (unique, indexed)
  - `slug`: String(50) - SEO-friendly URL (unique, indexed)
  - `description`: Text - Etiket açıklaması (opsiyonel)
  - `usage_count`: Integer (default=0) - Kullanım sayısı (otomatik güncellenecek)
  - `created_at`: DateTime
  - `updated_at`: DateTime
- Relationships:
  - `posts`: many-to-many to BlogPost (through association table)
- Indexes:
  - `name` (unique)
  - `slug` (unique)
  - `usage_count` (desc, popüler etiketler için)
- Association table: `blog_post_tags` (post_id, tag_id)

**Kabul Kriterleri:**
- ✅ Model dosyası oluşturuldu
- ✅ Many-to-many association table oluşturuldu
- ✅ `__init__.py`'ye import edildi
- ✅ Alembic migration oluşturuldu

---

### EP13-BE-04: Blog Post Schemas Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Blog post için Pydantic schemas oluşturulacak.

**Detaylar:**
- `backend/app/schemas/blog_post.py` dosyası oluştur
- Schemas:
  - `BlogPostBase`: Temel alanlar (title, excerpt, content, featured_image_url, status, etc.)
  - `BlogPostCreate`: Oluşturma için (author_id otomatik, slug otomatik generate)
  - `BlogPostUpdate`: Güncelleme için (tüm alanlar optional)
  - `BlogPostResponse`: Response için (author bilgisi, categories, tags dahil)
  - `BlogPostListResponse`: Liste için (kısaltılmış bilgiler)
  - `BlogPostSEO`: SEO ayarları için nested schema
- Validations:
  - `title`: min_length=3, max_length=255
  - `slug`: auto-generate from title (lowercase, spaces to hyphens, Turkish chars to ASCII)
  - `excerpt`: max_length=500
  - `content`: min_length=100 (en az 100 karakter içerik)
  - `seo_meta_title`: max_length=60 (SEO best practice)
  - `seo_meta_description`: max_length=160 (SEO best practice)
  - `status`: enum validation (DRAFT, PUBLISHED, ARCHIVED)
  - `published_at`: future dates allowed (planlanmış yayın)
- Helper functions:
  - `generate_slug(title: str) -> str`: Title'dan slug üret
  - `validate_seo_data(data: dict) -> dict`: SEO verilerini validate et

**Kabul Kriterleri:**
- ✅ Tüm schemas oluşturuldu
- ✅ Validations eklendi
- ✅ Slug auto-generation çalışıyor
- ✅ SEO validations eklendi
- ✅ `__init__.py`'ye export edildi

---

### EP13-BE-05: Blog Category & Tag Schemas Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:** Blog category ve tag için Pydantic schemas oluşturulacak.

**Detaylar:**
- `backend/app/schemas/blog_category.py` dosyası oluştur
  - `BlogCategoryBase`
  - `BlogCategoryCreate`
  - `BlogCategoryUpdate`
  - `BlogCategoryResponse`
- `backend/app/schemas/blog_tag.py` dosyası oluştur
  - `BlogTagBase`
  - `BlogTagCreate`
  - `BlogTagUpdate`
  - `BlogTagResponse`
- Validations:
  - Category name: min_length=2, max_length=100
  - Tag name: min_length=2, max_length=50
  - Slug auto-generation
  - Color hex validation (#RRGGBB)

**Kabul Kriterleri:**
- ✅ Category schemas oluşturuldu
- ✅ Tag schemas oluşturuldu
- ✅ Validations eklendi
- ✅ `__init__.py`'ye export edildi

---

### EP13-BE-06: Blog Post Service Layer
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Blog post işlemleri için service layer oluşturulacak.

**Detaylar:**
- `backend/app/services/blog_service.py` dosyası oluştur
- Functions:
  - `create_blog_post(db, post_data, author_id) -> BlogPost`
    - Slug generation (unique check)
    - SEO data validation
    - Categories ve tags ilişkilendirme
  - `update_blog_post(db, post_id, post_data, author_id) -> BlogPost`
    - Author kontrolü (sadece yazar veya admin güncelleyebilir)
    - Slug güncelleme (unique check)
    - Categories ve tags güncelleme
  - `delete_blog_post(db, post_id, user_id, user_role) -> bool`
    - Soft delete veya hard delete (admin için)
    - Author kontrolü
  - `get_blog_post(db, post_id, include_draft=False) -> BlogPost`
    - Status kontrolü (published olmayanlar sadece author/admin görebilir)
  - `get_blog_post_by_slug(db, slug, include_draft=False) -> BlogPost`
    - Public görünüm için slug ile getir
  - `list_blog_posts(db, filters, pagination) -> list[BlogPost]`
    - Filters: status, author_id, category_id, tag_id, search, featured, pinned
    - Pagination: skip, limit
    - Sorting: created_at, published_at, view_count
    - Eager loading: author, categories, tags
  - `increment_view_count(db, post_id) -> int`
    - Görüntülenme sayısını artır (public görünümde)
  - `generate_slug(title: str, existing_slugs: list[str]) -> str`
    - Unique slug üret (duplicate ise -2, -3 ekle)
  - `validate_and_format_seo_data(seo_data: dict) -> dict`
    - SEO verilerini formatla ve validate et

**Kabul Kriterleri:**
- ✅ Tüm service functions oluşturuldu
- ✅ Slug generation çalışıyor
- ✅ SEO validation çalışıyor
- ✅ Eager loading optimize edildi
- ✅ Error handling eklendi

---

### EP13-BE-07: Blog Post API Endpoints (CRUD)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4 saat

**Açıklama:** Blog post için REST API endpoints oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/blog_posts.py` dosyası oluştur
- Endpoints:
  - `POST /api/v1/blog/posts` - Yeni blog yazısı oluştur
    - Auth: Teacher veya Admin
    - Request body: BlogPostCreate
    - Response: BlogPostResponse
  - `GET /api/v1/blog/posts` - Blog yazılarını listele
    - Query params: status, author_id, category_id, tag_id, search, featured, pinned, skip, limit, sort
    - Auth: Public (published), Teacher/Admin (draft/archived kendi yazıları)
    - Response: list[BlogPostListResponse]
  - `GET /api/v1/blog/posts/{post_id}` - Blog yazısı detayı
    - Auth: Public (published), Author/Admin (draft/archived)
    - Response: BlogPostResponse
  - `GET /api/v1/blog/posts/slug/{slug}` - Slug ile blog yazısı getir
    - Auth: Public (published), Author/Admin (draft/archived)
    - Response: BlogPostResponse
    - View count increment (published ise)
  - `PUT /api/v1/blog/posts/{post_id}` - Blog yazısı güncelle
    - Auth: Author veya Admin
    - Request body: BlogPostUpdate
    - Response: BlogPostResponse
  - `DELETE /api/v1/blog/posts/{post_id}` - Blog yazısı sil
    - Auth: Author veya Admin
    - Response: {message: "deleted"}
  - `POST /api/v1/blog/posts/{post_id}/publish` - Blog yazısını yayınla
    - Auth: Author veya Admin
    - Response: BlogPostResponse
  - `POST /api/v1/blog/posts/{post_id}/unpublish` - Blog yazısını taslağa çevir
    - Auth: Author veya Admin
    - Response: BlogPostResponse
  - `GET /api/v1/blog/posts/me` - Kullanıcının kendi yazıları
    - Auth: Teacher veya Admin
    - Query params: status, skip, limit
    - Response: list[BlogPostListResponse]

**Kabul Kriterleri:**
- ✅ Tüm endpoints oluşturuldu
- ✅ Authentication/Authorization kontrolü yapılıyor
- ✅ Error handling eklendi
- ✅ Response models doğru
- ✅ Query params validation
- ✅ Router'a eklendi (`router.py`)

---

### EP13-BE-08: Blog Category API Endpoints
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Blog category için REST API endpoints oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/blog_categories.py` dosyası oluştur
- Endpoints:
  - `POST /api/v1/blog/categories` - Yeni kategori oluştur
    - Auth: Admin only
    - Request body: BlogCategoryCreate
    - Response: BlogCategoryResponse
  - `GET /api/v1/blog/categories` - Kategorileri listele
    - Auth: Public
    - Query params: parent_id, is_active, skip, limit
    - Response: list[BlogCategoryResponse]
  - `GET /api/v1/blog/categories/{category_id}` - Kategori detayı
    - Auth: Public
    - Response: BlogCategoryResponse
  - `GET /api/v1/blog/categories/slug/{slug}` - Slug ile kategori getir
    - Auth: Public
    - Response: BlogCategoryResponse
  - `PUT /api/v1/blog/categories/{category_id}` - Kategori güncelle
    - Auth: Admin only
    - Request body: BlogCategoryUpdate
    - Response: BlogCategoryResponse
  - `DELETE /api/v1/blog/categories/{category_id}` - Kategori sil
    - Auth: Admin only
    - Response: {message: "deleted"}
  - `GET /api/v1/blog/categories/{category_id}/posts` - Kategoriye ait yazılar
    - Auth: Public
    - Query params: status, skip, limit
    - Response: list[BlogPostListResponse]

**Kabul Kriterleri:**
- ✅ Tüm endpoints oluşturuldu
- ✅ Admin-only endpoints korumalı
- ✅ Router'a eklendi

---

### EP13-BE-09: Blog Tag API Endpoints
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Blog tag için REST API endpoints oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/blog_tags.py` dosyası oluştur
- Endpoints:
  - `POST /api/v1/blog/tags` - Yeni etiket oluştur
    - Auth: Teacher veya Admin
    - Request body: BlogTagCreate
    - Response: BlogTagResponse
  - `GET /api/v1/blog/tags` - Etiketleri listele
    - Auth: Public
    - Query params: search, min_usage_count, skip, limit, sort (usage_count, name)
    - Response: list[BlogTagResponse]
  - `GET /api/v1/blog/tags/{tag_id}` - Etiket detayı
    - Auth: Public
    - Response: BlogTagResponse
  - `GET /api/v1/blog/tags/slug/{slug}` - Slug ile etiket getir
    - Auth: Public
    - Response: BlogTagResponse
  - `PUT /api/v1/blog/tags/{tag_id}` - Etiket güncelle
    - Auth: Teacher veya Admin (kendi oluşturduğu) veya Admin (herhangi biri)
    - Request body: BlogTagUpdate
    - Response: BlogTagResponse
  - `DELETE /api/v1/blog/tags/{tag_id}` - Etiket sil
    - Auth: Teacher veya Admin (kendi oluşturduğu) veya Admin (herhangi biri)
    - Response: {message: "deleted"}
  - `GET /api/v1/blog/tags/{tag_id}/posts` - Etikete ait yazılar
    - Auth: Public
    - Query params: status, skip, limit
    - Response: list[BlogPostListResponse]
  - `GET /api/v1/blog/tags/popular` - Popüler etiketler
    - Auth: Public
    - Query params: limit (default=20)
    - Response: list[BlogTagResponse] (sorted by usage_count desc)

**Kabul Kriterleri:**
- ✅ Tüm endpoints oluşturuldu
- ✅ Usage count otomatik güncelleniyor
- ✅ Router'a eklendi

---

### EP13-BE-10: Blog Admin Endpoints (Moderasyon)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Admin için blog moderasyon endpoints oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/blog_admin.py` dosyası oluştur
- Endpoints:
  - `GET /api/v1/admin/blog/posts` - Tüm blog yazılarını listele (admin)
    - Auth: Admin only
    - Query params: status, author_id, category_id, tag_id, search, skip, limit
    - Response: list[BlogPostResponse]
  - `GET /api/v1/admin/blog/posts/{post_id}` - Blog yazısı detayı (admin)
    - Auth: Admin only
    - Response: BlogPostResponse
  - `PUT /api/v1/admin/blog/posts/{post_id}` - Herhangi bir blog yazısını güncelle (admin)
    - Auth: Admin only
    - Request body: BlogPostUpdate
    - Response: BlogPostResponse
  - `DELETE /api/v1/admin/blog/posts/{post_id}` - Blog yazısını sil (admin)
    - Auth: Admin only
    - Response: {message: "deleted"}
  - `POST /api/v1/admin/blog/posts/{post_id}/feature` - Öne çıkar
    - Auth: Admin only
    - Response: BlogPostResponse
  - `POST /api/v1/admin/blog/posts/{post_id}/unfeature` - Öne çıkarmayı kaldır
    - Auth: Admin only
    - Response: BlogPostResponse
  - `POST /api/v1/admin/blog/posts/{post_id}/pin` - Sabitle
    - Auth: Admin only
    - Response: BlogPostResponse
  - `POST /api/v1/admin/blog/posts/{post_id}/unpin` - Sabitlemeyi kaldır
    - Auth: Admin only
    - Response: BlogPostResponse
  - `GET /api/v1/admin/blog/stats` - Blog istatistikleri
    - Auth: Admin only
    - Response: {total_posts, published_posts, draft_posts, total_views, top_posts, top_categories, top_tags}

**Kabul Kriterleri:**
- ✅ Tüm admin endpoints oluşturuldu
- ✅ Admin-only koruma eklendi
- ✅ Stats endpoint çalışıyor
- ✅ Router'a eklendi

---

### EP13-BE-11: Blog SEO Utilities & Helpers
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** SEO için utility functions oluşturulacak.

**Detaylar:**
- `backend/app/utils/seo_utils.py` dosyası oluştur
- Functions:
  - `generate_meta_tags(post: BlogPost) -> dict`
    - Meta title, description, keywords
    - Open Graph tags
    - Twitter Card tags
    - Canonical URL
  - `generate_schema_org_json(post: BlogPost) -> dict`
    - Article schema.org JSON-LD
    - Author schema.org
    - Organization schema.org
  - `generate_sitemap_entries(posts: list[BlogPost]) -> list[dict]`
    - Sitemap XML için entry'ler
  - `validate_seo_data(data: dict) -> tuple[bool, list[str]]`
    - SEO verilerini validate et
    - Hataları listele
  - `optimize_meta_description(text: str, max_length: int = 160) -> str`
    - Meta description'ı optimize et
  - `generate_og_image_url(post: BlogPost, base_url: str) -> str`
    - OG image URL'i oluştur (featured_image veya default)

**Kabul Kriterleri:**
- ✅ Tüm utility functions oluşturuldu
- ✅ Schema.org JSON doğru format
- ✅ Meta tags doğru format
- ✅ Test edildi

---

### EP13-BE-12: Blog Public Endpoints (SEO Optimized)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Public blog görünümü için SEO-optimized endpoints oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/blog_public.py` dosyası oluştur
- Endpoints:
  - `GET /api/v1/public/blog` - Public blog listesi
    - Auth: Public
    - Query params: category_slug, tag_slug, search, featured, skip, limit
    - Response: list[BlogPostListResponse] (sadece published)
    - SEO: Meta tags, pagination
  - `GET /api/v1/public/blog/{slug}` - Public blog detayı
    - Auth: Public
    - Response: BlogPostResponse (sadece published)
    - View count increment
    - SEO: Full meta tags, schema.org JSON
  - `GET /api/v1/public/blog/categories` - Public kategori listesi
    - Auth: Public
    - Response: list[BlogCategoryResponse] (sadece active)
  - `GET /api/v1/public/blog/categories/{slug}` - Public kategori detayı
    - Auth: Public
    - Response: BlogCategoryResponse + posts
    - SEO: Category meta tags
  - `GET /api/v1/public/blog/tags` - Public etiket listesi
    - Auth: Public
    - Query params: popular (boolean)
    - Response: list[BlogTagResponse]
  - `GET /api/v1/public/blog/tags/{slug}` - Public etiket detayı
    - Auth: Public
    - Response: BlogTagResponse + posts
    - SEO: Tag meta tags
  - `GET /api/v1/public/blog/authors/{author_id}` - Yazar sayfası
    - Auth: Public
    - Response: Author info + posts
    - SEO: Author meta tags
  - `GET /api/v1/public/blog/search` - Blog arama
    - Auth: Public
    - Query params: q (search query), category_id, tag_id, skip, limit
    - Response: list[BlogPostListResponse]
    - Full-text search (PostgreSQL)

**Kabul Kriterleri:**
- ✅ Tüm public endpoints oluşturuldu
- ✅ Sadece published posts döndürülüyor
- ✅ SEO meta tags eklendi
- ✅ Schema.org JSON eklendi
- ✅ Full-text search çalışıyor
- ✅ Router'a eklendi

---

## 🎨 FRONTEND TASKS

### EP13-FE-01: Blog Post API Client
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Frontend için blog post API client oluşturulacak.

**Detaylar:**
- `frontend/src/lib/api.ts` dosyasına ekle
- API functions:
  - `blogPostsApi.create(post: BlogPostCreate)`
  - `blogPostsApi.list(params)`
  - `blogPostsApi.get(postId)`
  - `blogPostsApi.getBySlug(slug)`
  - `blogPostsApi.update(postId, data)`
  - `blogPostsApi.delete(postId)`
  - `blogPostsApi.publish(postId)`
  - `blogPostsApi.unpublish(postId)`
  - `blogPostsApi.getMyPosts(params)`
- TypeScript interfaces:
  - `BlogPost`
  - `BlogPostCreate`
  - `BlogPostUpdate`
  - `BlogPostListParams`
  - `BlogPostSEO`

**Kabul Kriterleri:**
- ✅ Tüm API functions oluşturuldu
- ✅ TypeScript types tanımlandı
- ✅ Error handling eklendi
- ✅ Axios interceptor ile auth token eklendi

---

### EP13-FE-02: Blog Category & Tag API Client
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:** Blog category ve tag için API client oluşturulacak.

**Detaylar:**
- `frontend/src/lib/api.ts` dosyasına ekle
- API functions:
  - `blogCategoriesApi.create(category)`
  - `blogCategoriesApi.list(params)`
  - `blogCategoriesApi.get(categoryId)`
  - `blogCategoriesApi.getBySlug(slug)`
  - `blogCategoriesApi.update(categoryId, data)`
  - `blogCategoriesApi.delete(categoryId)`
  - `blogTagsApi.create(tag)`
  - `blogTagsApi.list(params)`
  - `blogTagsApi.get(tagId)`
  - `blogTagsApi.getBySlug(slug)`
  - `blogTagsApi.update(tagId, data)`
  - `blogTagsApi.delete(tagId)`
  - `blogTagsApi.getPopular(limit)`

**Kabul Kriterleri:**
- ✅ Category API client oluşturuldu
- ✅ Tag API client oluşturuldu
- ✅ TypeScript types tanımlandı

---

### EP13-FE-03: Rich Text Editor Component
**Durum:** ✅ TAMAMLANDI (Custom contentEditable editor)  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Blog içeriği için rich text editor component oluşturulacak.

**Detaylar:**
- `frontend/src/components/blog/RichTextEditor.tsx` component oluştur
- Özellikler:
  - WYSIWYG editor (Tiptap veya React Quill)
  - Toolbar: Bold, Italic, Underline, Heading, List, Link, Image, Code, Blockquote
  - Image upload (drag & drop)
  - HTML output
  - Preview mode
  - Character count
  - Auto-save (draft)
- Props:
  - `value: string` - HTML content
  - `onChange: (html: string) => void`
  - `placeholder?: string`
  - `minHeight?: string`
  - `readOnly?: boolean`
- Styling:
  - Tailwind CSS
  - Custom toolbar styling
  - Responsive

**Kabul Kriterleri:**
- ✅ Rich text editor component oluşturuldu
- ✅ Tüm toolbar özellikleri çalışıyor
- ✅ Image upload çalışıyor
- ✅ HTML output doğru format
- ✅ Styling responsive

---

### EP13-FE-04: Blog Post Form Component (Create/Edit)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4 saat

**Açıklama:** Blog yazısı oluşturma/düzenleme formu component oluşturulacak.

**Detaylar:**
- `frontend/src/components/blog/BlogPostForm.tsx` component oluştur
- Form fields:
  - Title (text input, required)
  - Slug (text input, auto-generate from title, editable)
  - Excerpt (textarea, max 500 chars, character count)
  - Content (RichTextEditor, required)
  - Featured Image (image upload, preview)
  - Status (select: Draft, Published, Archived)
  - Published At (date picker, optional, future dates allowed)
  - Is Featured (checkbox)
  - Is Pinned (checkbox)
  - Allow Comments (checkbox, default true)
- SEO Section (collapsible):
  - Meta Title (text input, max 60 chars, character count)
  - Meta Description (textarea, max 160 chars, character count)
  - Meta Keywords (text input, comma-separated)
  - OG Title (text input)
  - OG Description (textarea)
  - OG Image URL (text input, preview)
  - Twitter Card Type (select)
  - Canonical URL (text input)
- Categories Section:
  - Multi-select dropdown (categories listesi)
  - Create new category button (admin only)
- Tags Section:
  - Tag input (autocomplete, create new tags)
  - Popular tags suggestions
- Form validation:
  - Title required, min 3 chars
  - Content required, min 100 chars
  - Slug unique check (async)
  - SEO meta title/description length validation
- Form actions:
  - Save Draft
  - Publish
  - Preview
  - Cancel
- State management:
  - React Hook Form
  - React Query (mutations)
  - Auto-save draft (localStorage veya backend)

**Kabul Kriterleri:**
- ✅ Form component oluşturuldu
- ✅ Tüm fields eklendi
- ✅ SEO section çalışıyor
- ✅ Categories ve tags selection çalışıyor
- ✅ Form validation çalışıyor
- ✅ Auto-save draft çalışıyor
- ✅ Image upload çalışıyor

---

### EP13-FE-05: Blog Post List Page (Admin/Teacher)
**Durum:** ✅ TAMAMLANDI (Admin tüm yazıları görebilir, Teacher sadece kendi yazılarını)  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Admin/Teacher için blog yazıları listesi sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/blog/posts/page.tsx` sayfası oluştur
- Özellikler:
  - Blog yazıları listesi (table veya card view)
  - Filters:
    - Status (Draft, Published, Archived)
    - Category (dropdown)
    - Tag (multi-select)
    - Search (title, content)
  - Sorting: Created At, Published At, View Count, Title
  - Pagination
  - Actions per row:
    - Edit
    - Delete
    - Publish/Unpublish
    - View (public link)
  - Bulk actions:
    - Delete selected
    - Publish selected
    - Archive selected
  - Create new post button
  - Stats cards: Total Posts, Published, Drafts, Total Views
- Layout:
  - Header: Title, Create button, Filters
  - Stats cards row
  - Table/Cards list
  - Pagination footer
- State management:
  - React Query (data fetching)
  - URL query params (filters, pagination)
  - Optimistic updates

**Kabul Kriterleri:**
- ✅ List page oluşturuldu
- ✅ Filters çalışıyor
- ✅ Sorting çalışıyor
- ✅ Pagination çalışıyor
- ✅ Actions çalışıyor
- ✅ Stats cards gösteriliyor
- ✅ Responsive design

---

### EP13-FE-06: Blog Post Create/Edit Page
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Blog yazısı oluşturma/düzenleme sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/blog/posts/new/page.tsx` - Create page
- `frontend/src/app/(dashboard)/dashboard/blog/posts/[id]/edit/page.tsx` - Edit page
- Layout:
  - Header: Back button, Title (Create/Edit), Save/Publish buttons
  - Form: BlogPostForm component
  - Sidebar (optional):
    - Preview
    - SEO preview
    - Publishing options
- Features:
  - Form validation
  - Auto-save draft
  - Preview mode
  - SEO preview (meta tags preview)
  - Image upload
  - Slug generation
- Navigation:
  - Save → redirect to list
  - Cancel → redirect to list
  - Preview → new tab (public URL if published)

**Kabul Kriterleri:**
- ✅ Create page oluşturuldu
- ✅ Edit page oluşturuldu
- ✅ Form çalışıyor
- ✅ Auto-save çalışıyor
- ✅ Preview çalışıyor
- ✅ Navigation çalışıyor

---

### EP13-FE-07: Blog Category Management Page (Admin)
**Durum:** ✅ TAMAMLANDI (Tree view ile parent-child ilişkileri gösteriliyor)  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Admin için blog kategori yönetim sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/admin/blog/categories/page.tsx` sayfası oluştur
- Özellikler:
  - Kategori listesi (tree view, parent-child ilişkileri)
  - Create category button
  - Edit category (modal veya page)
  - Delete category (with confirmation)
  - Category form:
    - Name
    - Slug (auto-generate)
    - Description
    - Icon
    - Color (color picker)
    - Parent category (dropdown)
    - Order
    - Is Active
    - SEO fields
  - Drag & drop reordering (optional)
- Layout:
  - Tree view component
  - Category cards
  - Form modal

**Kabul Kriterleri:**
- ✅ Category management page oluşturuldu
- ✅ Tree view çalışıyor
- ✅ CRUD operations çalışıyor
- ✅ Form validation çalışıyor

---

### EP13-FE-08: Public Blog List Page
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Public blog listesi sayfası oluşturulacak (SEO optimized).

**Detaylar:**
- `frontend/src/app/blog/page.tsx` sayfası oluştur
- Layout:
  - Header: Blog title, description
  - Featured posts section (carousel veya grid)
  - Categories sidebar/filter
  - Blog posts grid/list
  - Pagination
  - Popular tags section
- Features:
  - Blog post cards:
    - Featured image
    - Title
    - Excerpt
    - Author (avatar, name)
    - Published date
    - Categories (badges)
    - Tags (badges)
    - Read time estimate
    - View count
  - Filters:
    - Category (sidebar)
    - Tag (sidebar)
    - Search
  - Sorting: Latest, Popular, Most Viewed
  - Pagination (infinite scroll optional)
- SEO:
  - Meta tags (title, description)
  - Open Graph tags
  - Schema.org JSON-LD
  - Canonical URL
- Styling:
  - Modern, clean design
  - Responsive
  - Loading states
  - Empty states

**Kabul Kriterleri:**
- ✅ Public blog list page oluşturuldu
- ✅ Featured posts section çalışıyor
- ✅ Filters çalışıyor
- ✅ SEO meta tags eklendi
- ✅ Schema.org JSON eklendi
- ✅ Responsive design
- ✅ Loading/empty states

---

### EP13-FE-09: Public Blog Post Detail Page
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4 saat

**Açıklama:** Public blog yazısı detay sayfası oluşturulacak (SEO optimized).

**Detaylar:**
- `frontend/src/app/blog/[slug]/page.tsx` sayfası oluştur
- Layout:
  - Header:
    - Featured image (full width)
    - Title
    - Meta: Author, Published date, Read time, View count
    - Categories, Tags
  - Content:
    - Rich text content (HTML render)
    - Author bio card (sidebar)
  - Footer:
    - Related posts
    - Share buttons (social media)
    - Navigation (prev/next post)
- Features:
  - View count increment (on mount)
  - Share functionality (copy link, social media)
  - Related posts (same category/tags)
  - Author profile link
  - Category/tag links
  - Reading progress indicator (optional)
- SEO:
  - Dynamic meta tags (from post data)
  - Open Graph tags
  - Twitter Card tags
  - Schema.org JSON-LD (Article, Author, Organization)
  - Canonical URL
  - Structured data
- Styling:
  - Typography (readable)
  - Code blocks styling
  - Image styling
  - Responsive
  - Print stylesheet (optional)

**Kabul Kriterleri:**
- ✅ Blog detail page oluşturuldu
- ✅ Content render ediliyor
- ✅ SEO meta tags dinamik
- ✅ Schema.org JSON eklendi
- ✅ Share functionality çalışıyor
- ✅ Related posts gösteriliyor
- ✅ Responsive design

---

### EP13-FE-10: Blog Category & Tag Pages (Public)
**Durum:** ✅ TAMAMLANDI (/blog/category/[slug] ve /blog/tag/[slug] sayfaları oluşturuldu)  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Public kategori ve etiket sayfaları oluşturulacak.

**Detaylar:**
- `frontend/src/app/blog/category/[slug]/page.tsx` - Category page
- `frontend/src/app/blog/tag/[slug]/page.tsx` - Tag page
- Layout:
  - Header: Category/Tag name, description
  - Blog posts list (same as blog list page)
  - Pagination
- Features:
  - Category/Tag info card
  - Posts filtered by category/tag
  - SEO meta tags
  - Breadcrumb navigation
- SEO:
  - Category/Tag meta tags
  - Open Graph tags
  - Schema.org JSON-LD

**Kabul Kriterleri:**
- ✅ Category page oluşturuldu
- ✅ Tag page oluşturuldu
- ✅ Posts filtered correctly
- ✅ SEO meta tags eklendi

---

### EP13-FE-11: Blog Author Page (Public)
**Durum:** ✅ TAMAMLANDI (/blog/author/[authorId] sayfası oluşturuldu)  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Yazar sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/blog/author/[authorId]/page.tsx` sayfası oluştur
- Layout:
  - Header: Author profile card (avatar, name, bio, social links)
  - Author's blog posts list
  - Pagination
- Features:
  - Author info display
  - Author's posts filtered
  - Author stats (post count, total views)
- SEO:
  - Author meta tags
  - Schema.org JSON-LD (Person)

**Kabul Kriterleri:**
- ✅ Author page oluşturuldu
- ✅ Author info gösteriliyor
- ✅ Posts filtered correctly
- ✅ SEO meta tags eklendi

---

### EP13-FE-12: Blog Admin Dashboard & Stats
**Durum:** ✅ TAMAMLANDI (Charts ve grafikler eklendi: Pie chart, Bar charts)  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Admin için blog dashboard ve istatistikler sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/admin/blog/page.tsx` sayfası oluştur
- Features:
  - Stats cards:
    - Total Posts
    - Published Posts
    - Draft Posts
    - Total Views
    - Average Views per Post
  - Charts:
    - Posts by status (pie chart)
    - Views over time (line chart)
    - Top posts (bar chart)
    - Top categories (bar chart)
    - Top tags (bar chart)
  - Recent posts table
  - Quick actions:
    - Create new post
    - Manage categories
    - Manage tags
- Layout:
  - Stats cards row
  - Charts grid
  - Recent posts table

**Kabul Kriterleri:**
- ✅ Admin dashboard oluşturuldu
- ✅ Stats cards gösteriliyor
- ✅ Charts çalışıyor
- ✅ Data fetching çalışıyor

---

### EP13-FE-13: Blog Sidebar Component (Public)
**Durum:** ✅ TAMAMLANDI (Kategoriler, etiketler, son yazılar sidebar component'i oluşturuldu)  
**Öncelik:** 🟡 DÜŞÜK  
**Tahmini Süre:** 1 saat

**Açıklama:** Blog sayfaları için sidebar component oluşturulacak.

**Detaylar:**
- `frontend/src/components/blog/BlogSidebar.tsx` component oluştur
- Sections:
  - Categories list (with post counts)
  - Popular tags (cloud)
  - Recent posts
  - Newsletter signup (optional)
  - Social media links
- Styling:
  - Sticky sidebar (optional)
  - Responsive (hidden on mobile)

**Kabul Kriterleri:**
- ✅ Sidebar component oluşturuldu
- ✅ Tüm sections gösteriliyor
- ✅ Responsive design

---

### EP13-FE-14: Blog Navigation & Menu Integration
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:** Blog menüsü navigation'a entegre edilecek.

**Detaylar:**
- Header navigation'a "Blog" linki ekle
- Dashboard sidebar'a blog menüsü ekle:
  - Blog Posts (Teacher/Admin)
  - Categories (Admin only)
  - Blog Settings (Admin only, optional)
- Footer'a blog linki ekle (optional)
- Breadcrumb navigation (blog pages)

**Kabul Kriterleri:**
- ✅ Navigation'a blog linki eklendi
- ✅ Dashboard sidebar'a menü eklendi
- ✅ Breadcrumb navigation çalışıyor

---

### EP13-FE-15: Blog SEO Components & Utilities
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Blog sayfaları için SEO components oluşturulacak.

**Detaylar:**
- `frontend/src/components/blog/SEOHead.tsx` component oluştur
  - Next.js Head component wrapper
  - Meta tags
  - Open Graph tags
  - Twitter Card tags
  - Schema.org JSON-LD
  - Canonical URL
- `frontend/src/utils/seo.ts` utilities
  - `generateBlogPostMetaTags(post)`
  - `generateBlogCategoryMetaTags(category)`
  - `generateBlogTagMetaTags(tag)`
  - `generateAuthorMetaTags(author)`
  - `generateSchemaOrgArticle(post)`
- Usage:
  - Blog list page
  - Blog detail page
  - Category page
  - Tag page
  - Author page

**Kabul Kriterleri:**
- ✅ SEOHead component oluşturuldu
- ✅ SEO utilities oluşturuldu
- ✅ Tüm blog sayfalarında kullanılıyor
- ✅ Meta tags doğru format

---

## 📝 EK NOTLAR

### Database Migrations
- Alembic migration dosyaları oluşturulacak
- Migration test edilecek (upgrade/downgrade)

### Testing
- Backend unit tests (models, services, endpoints)
- Frontend component tests (optional)
- Integration tests (API endpoints)

### Documentation
- API documentation (OpenAPI/Swagger)
- Component documentation (Storybook optional)

### Performance
- Database indexes optimize edilecek
- Eager loading (relationships)
- Caching (Redis, optional)
- Image optimization (CDN, optional)

### Security
- XSS protection (HTML sanitization)
- CSRF protection
- Rate limiting (API endpoints)
- Input validation

---

## 🆕 EPIC-ADS: Reklam ve Öne Çıkarma Sistemi
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🔴 YÜKSEK
- **Tahmini Süre:** 6-8 Gün
- **Tamamlanma Tarihi:** 2026-02-19
- **Açıklama:** Eğitmenlerin bakiyeleri ile kurslarını öne çıkarabileceği, banner reklamlar verebileceği, admin tarafından fiyatlandırmanın yönetilebileceği tam özellikli reklam sistemi.
- **Backend:** 16/16 ✅
- **Frontend:** 15/15 ✅
- **Ek İyileştirmeler:**
  - ✅ Admin balance management (teacher bakiyelerini yönetme)
  - ✅ Featured courses management (admin tarafından popüler kurs seçimi)
  - ✅ Campaign auto-activation (onaylandıktan sonra otomatik aktif olma)
  - ✅ Background scheduled jobs (her saat kampanya aktivasyon/kapanış kontrolü)
  - ✅ Approval status badges (teacher panelinde onay durumu gösterimi)
  - ✅ Inline ads positioning (kurslar arası reklam yerleşimi)
  - ✅ Dummy ad placeholders (admin/teacher için reklam alanları görünürlüğü)
  - ✅ Course promotion campaign type (kurs promosyonu kampanya tipi)
  - ✅ Enhanced banner design (kurs bilgileri ile zenginleştirilmiş banner tasarımı)

### 📋 Genel Özellikler
- ✅ Eğitmenler bakiyeleri ile kurslarını öne çıkarabilir
- ✅ Banner reklamlar (ana sayfa, kategori sayfaları, vb.)
- ✅ Admin tarafından fiyatlandırma yönetimi
- ✅ Ad placement yönetimi (nerede gösterilecek)
- ✅ Reklam kampanyaları (süre, bütçe, hedefleme)
- ✅ Otomatik ödeme (bakiye ile)
- ✅ Admin onay sistemi
- ✅ Reklam analitikleri (görüntülenme, tıklama, conversion)
- ✅ Otomatik başlatma/bitirme (scheduled)
- ✅ Bütçe kontrolü ve uyarılar

---

## 🔧 BACKEND TASKS

### EP14-BE-01: Ad Placement Model Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Reklam yerleşimleri için SQLAlchemy model oluşturulacak.

**Detaylar:**
- `backend/app/models/ad_placement.py` dosyası oluştur
- Model alanları:
  - `id`: UUID (primary key)
  - `name`: String(100) - Yerleşim adı (örn: "Ana Sayfa Banner", "Kategori Sayfası Sidebar")
  - `code`: String(50) - Unique kod (örn: "homepage_banner", "category_sidebar") (unique, indexed)
  - `description`: Text - Açıklama
  - `placement_type`: Enum (BANNER, FEATURED_COURSE, SIDEBAR, INLINE, POPUP) - Yerleşim tipi
  - `location`: String(100) - Konum (örn: "homepage", "category_page", "course_page")
  - `width`: Integer - Banner genişliği (pixel)
  - `height`: Integer - Banner yüksekliği (pixel)
  - `max_ads`: Integer (default=1) - Aynı anda kaç reklam gösterilebilir
  - `is_active`: Boolean (default=True) - Aktif mi
  - `priority`: Integer (default=0) - Öncelik (yüksek öncelik önce gösterilir)
  - `targeting_options`: JSON - Hedefleme seçenekleri (kategori, etiket, vb.)
  - `created_at`: DateTime
  - `updated_at`: DateTime
- Relationships:
  - `campaigns`: one-to-many to AdCampaign
- Indexes:
  - `code` (unique)
  - `placement_type`
  - `location`
  - `is_active`
- Constraints:
  - `code` unique constraint
  - `width`, `height` > 0`

**Kabul Kriterleri:**
- ✅ Model dosyası oluşturuldu
- ✅ Tüm alanlar tanımlandı
- ✅ Enum types tanımlandı
- ✅ Relationships kuruldu
- ✅ Indexes eklendi
- ✅ `__init__.py`'ye import edildi
- ✅ Alembic migration oluşturuldu

---

### EP14-BE-02: Ad Campaign Model Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Reklam kampanyaları için SQLAlchemy model oluşturulacak.

**Detaylar:**
- `backend/app/models/ad_campaign.py` dosyası oluştur
- Model alanları:
  - `id`: UUID (primary key)
  - `teacher_id`: UUID (ForeignKey to users.id) - Kampanya sahibi
  - `course_id`: UUID (ForeignKey to courses.id) - Reklam verilen kurs
  - `placement_id`: UUID (ForeignKey to ad_placements.id) - Yerleşim
  - `name`: String(255) - Kampanya adı
  - `status`: Enum (DRAFT, PENDING_APPROVAL, ACTIVE, PAUSED, COMPLETED, REJECTED, CANCELLED) - Durum
  - `campaign_type`: Enum (FEATURED_COURSE, BANNER_AD) - Kampanya tipi
  - `banner_image_url`: String(500) - Banner görsel URL (banner ads için)
  - `banner_link_url`: String(500) - Banner tıklama linki (banner ads için)
  - `banner_alt_text`: String(255) - Banner alt text (SEO/accessibility)
  - `start_date`: DateTime - Başlangıç tarihi
  - `end_date`: DateTime - Bitiş tarihi
  - `daily_budget`: Decimal(10,2) - Günlük bütçe (opsiyonel)
  - `total_budget`: Decimal(10,2) - Toplam bütçe
  - `spent_amount`: Decimal(10,2) (default=0) - Harcanan tutar
  - `price_per_day`: Decimal(10,2) - Günlük fiyat (placement pricing'den alınır)
  - `price_per_impression`: Decimal(10,4) - Görüntülenme başına fiyat (opsiyonel)
  - `price_per_click`: Decimal(10,2) - Tıklama başına fiyat (opsiyonel)
  - `pricing_model`: Enum (FIXED_DAILY, PER_IMPRESSION, PER_CLICK, HYBRID) - Fiyatlandırma modeli
  - `target_categories`: JSON - Hedef kategoriler (opsiyonel)
  - `target_tags`: JSON - Hedef etiketler (opsiyonel)
  - `is_targeted`: Boolean (default=False) - Hedefleme aktif mi
  - `approval_status`: Enum (PENDING, APPROVED, REJECTED) - Onay durumu
  - `approved_by_id`: UUID (ForeignKey to users.id, nullable) - Onaylayan admin
  - `approved_at`: DateTime (nullable) - Onay tarihi
  - `rejection_reason`: Text (nullable) - Red sebebi
  - `payment_status`: Enum (PENDING, PAID, REFUNDED) - Ödeme durumu
  - `payment_transaction_id`: String(255) (nullable) - Ödeme transaction ID
  - `impressions`: Integer (default=0) - Görüntülenme sayısı
  - `clicks`: Integer (default=0) - Tıklama sayısı
  - `conversions`: Integer (default=0) - Dönüşüm sayısı (kayıt, satın alma)
  - `ctr`: Decimal(5,2) (default=0) - Click-through rate (%)
  - `created_at`: DateTime
  - `updated_at`: DateTime
- Relationships:
  - `teacher`: relationship to User
  - `course`: relationship to Course
  - `placement`: relationship to AdPlacement
  - `approved_by`: relationship to User (admin)
  - `analytics`: one-to-many to AdCampaignAnalytics
- Indexes:
  - `teacher_id`
  - `course_id`
  - `placement_id`
  - `status`
  - `approval_status`
  - `start_date`, `end_date`
  - `created_at` (desc)
- Constraints:
  - `end_date` > `start_date`
  - `spent_amount` <= `total_budget`
  - `total_budget` > 0

**Kabul Kriterleri:**
- ✅ Model dosyası oluşturuldu
- ✅ Tüm alanlar tanımlandı
- ✅ Enum types tanımlandı
- ✅ Relationships kuruldu
- ✅ Indexes eklendi
- ✅ Constraints eklendi
- ✅ `__init__.py`'ye import edildi
- ✅ Alembic migration oluşturuldu

---

### EP14-BE-03: Ad Pricing Model Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Reklam fiyatlandırması için SQLAlchemy model oluşturulacak (admin tarafından yönetilecek).

**Detaylar:**
- `backend/app/models/ad_pricing.py` dosyası oluştur
- Model alanları:
  - `id`: UUID (primary key)
  - `placement_id`: UUID (ForeignKey to ad_placements.id) - Yerleşim
  - `pricing_model`: Enum (FIXED_DAILY, PER_IMPRESSION, PER_CLICK, HYBRID) - Fiyatlandırma modeli
  - `price_per_day`: Decimal(10,2) - Günlük sabit fiyat (FIXED_DAILY için)
  - `price_per_impression`: Decimal(10,4) - Görüntülenme başına fiyat (PER_IMPRESSION için)
  - `price_per_click`: Decimal(10,2) - Tıklama başına fiyat (PER_CLICK için)
  - `min_daily_budget`: Decimal(10,2) (nullable) - Minimum günlük bütçe
  - `max_daily_budget`: Decimal(10,2) (nullable) - Maksimum günlük bütçe
  - `min_campaign_duration_days`: Integer (default=1) - Minimum kampanya süresi (gün)
  - `max_campaign_duration_days`: Integer (nullable) - Maksimum kampanya süresi (gün)
  - `discount_percentage`: Decimal(5,2) (default=0) - İndirim yüzdesi (opsiyonel)
  - `is_active`: Boolean (default=True) - Aktif mi
  - `effective_from`: DateTime - Geçerlilik başlangıç tarihi
  - `effective_until`: DateTime (nullable) - Geçerlilik bitiş tarihi
  - `created_by_id`: UUID (ForeignKey to users.id) - Oluşturan admin
  - `updated_by_id`: UUID (ForeignKey to users.id, nullable) - Güncelleyen admin
  - `created_at`: DateTime
  - `updated_at`: DateTime
- Relationships:
  - `placement`: relationship to AdPlacement
  - `created_by`: relationship to User
  - `updated_by`: relationship to User
- Indexes:
  - `placement_id`
  - `pricing_model`
  - `is_active`
  - `effective_from`, `effective_until`
- Constraints:
  - `price_per_day` > 0 (FIXED_DAILY için)
  - `price_per_impression` > 0 (PER_IMPRESSION için)
  - `price_per_click` > 0 (PER_CLICK için)
  - `effective_until` > `effective_from` (if not null)

**Kabul Kriterleri:**
- ✅ Model dosyası oluşturuldu
- ✅ Tüm alanlar tanımlandı
- ✅ Relationships kuruldu
- ✅ Indexes eklendi
- ✅ Constraints eklendi
- ✅ `__init__.py`'ye import edildi
- ✅ Alembic migration oluşturuldu

---

### EP14-BE-04: Ad Campaign Analytics Model Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Reklam kampanyası analitikleri için SQLAlchemy model oluşturulacak (günlük/haftalık/aylık özetler).

**Detaylar:**
- `backend/app/models/ad_campaign_analytics.py` dosyası oluştur
- Model alanları:
  - `id`: UUID (primary key)
  - `campaign_id`: UUID (ForeignKey to ad_campaigns.id) - Kampanya
  - `date`: Date - Tarih (günlük özet için)
  - `impressions`: Integer (default=0) - Görüntülenme sayısı
  - `clicks`: Integer (default=0) - Tıklama sayısı
  - `conversions`: Integer (default=0) - Dönüşüm sayısı
  - `spent_amount`: Decimal(10,2) (default=0) - Harcanan tutar
  - `ctr`: Decimal(5,2) (default=0) - Click-through rate (%)
  - `conversion_rate`: Decimal(5,2) (default=0) - Dönüşüm oranı (%)
  - `cpc`: Decimal(10,2) (default=0) - Cost per click
  - `cpm`: Decimal(10,2) (default=0) - Cost per mille (1000 impression)
  - `created_at`: DateTime
  - `updated_at`: DateTime
- Relationships:
  - `campaign`: relationship to AdCampaign
- Indexes:
  - `campaign_id`
  - `date`
  - `campaign_id`, `date` (unique composite)
- Constraints:
  - `campaign_id`, `date` unique constraint (günlük tek kayıt)

**Kabul Kriterleri:**
- ✅ Model dosyası oluşturuldu
- ✅ Tüm alanlar tanımlandı
- ✅ Relationships kuruldu
- ✅ Indexes eklendi
- ✅ Unique constraint eklendi
- ✅ `__init__.py`'ye import edildi
- ✅ Alembic migration oluşturuldu

---

### EP14-BE-05: Ad Campaign Schemas Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Ad campaign için Pydantic schemas oluşturulacak.

**Detaylar:**
- `backend/app/schemas/ad_campaign.py` dosyası oluştur
- Schemas:
  - `AdCampaignBase`: Temel alanlar
  - `AdCampaignCreate`: Oluşturma için
    - `placement_id`: required
    - `course_id`: required
    - `start_date`: required
    - `end_date`: required
    - `banner_image_url`: required (banner ads için)
    - `banner_link_url`: required (banner ads için)
    - `total_budget`: required
  - `AdCampaignUpdate`: Güncelleme için (tüm alanlar optional)
  - `AdCampaignResponse`: Response için (full details)
  - `AdCampaignListResponse`: Liste için (kısaltılmış)
  - `AdCampaignAnalyticsResponse`: Analitik response
- Validations:
  - `end_date` > `start_date`
  - `total_budget` > 0
  - `daily_budget` <= `total_budget` (if provided)
  - `start_date` >= today (future dates)
  - `banner_image_url`: URL validation
  - `banner_link_url`: URL validation
- Helper functions:
  - `calculate_campaign_cost(start_date, end_date, pricing) -> Decimal`
  - `validate_budget(budget, pricing) -> bool`

**Kabul Kriterleri:**
- ✅ Tüm schemas oluşturuldu
- ✅ Validations eklendi
- ✅ Helper functions eklendi
- ✅ `__init__.py`'ye export edildi

---

### EP14-BE-06: Ad Placement & Pricing Schemas
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:** Ad placement ve pricing için Pydantic schemas oluşturulacak.

**Detaylar:**
- `backend/app/schemas/ad_placement.py` dosyası oluştur
  - `AdPlacementBase`
  - `AdPlacementCreate`
  - `AdPlacementUpdate`
  - `AdPlacementResponse`
- `backend/app/schemas/ad_pricing.py` dosyası oluştur
  - `AdPricingBase`
  - `AdPricingCreate`
  - `AdPricingUpdate`
  - `AdPricingResponse`
- Validations:
  - Placement code: unique, alphanumeric + underscore
  - Width, height: > 0
  - Pricing amounts: > 0
  - Date validations

**Kabul Kriterleri:**
- ✅ Placement schemas oluşturuldu
- ✅ Pricing schemas oluşturuldu
- ✅ Validations eklendi
- ✅ `__init__.py`'ye export edildi

---

### EP14-BE-07: Ad Campaign Service Layer
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4 saat

**Açıklama:** Ad campaign işlemleri için service layer oluşturulacak.

**Detaylar:**
- `backend/app/services/ad_campaign_service.py` dosyası oluştur
- Functions:
  - `create_ad_campaign(db, campaign_data, teacher_id) -> AdCampaign`
    - Placement kontrolü
    - Pricing hesaplama (placement pricing'den)
    - Bütçe kontrolü (teacher balance)
    - Kampanya oluşturma (status: PENDING_APPROVAL)
    - TeacherEarning kaydı (AD_SPEND tipinde, negatif, pending)
  - `update_ad_campaign(db, campaign_id, campaign_data, teacher_id) -> AdCampaign`
    - Author kontrolü (sadece owner veya admin)
    - Status kontrolü (ACTIVE kampanyalar sınırlı güncellenebilir)
    - Pricing yeniden hesaplama (if dates changed)
    - Bütçe kontrolü (if budget increased)
  - `delete_ad_campaign(db, campaign_id, teacher_id, user_role) -> bool`
    - Author kontrolü
    - Refund işlemi (if paid)
    - TeacherEarning kaydı (refund)
  - `approve_ad_campaign(db, campaign_id, admin_id, notes=None) -> AdCampaign`
    - Admin kontrolü
    - Status: PENDING_APPROVAL → APPROVED → ACTIVE (if start_date <= today)
    - Payment işlemi (bakiye kontrolü, ödeme)
    - TeacherEarning kaydı (AD_SPEND, confirmed)
    - Notification gönder (teacher'a)
  - `reject_ad_campaign(db, campaign_id, admin_id, reason) -> AdCampaign`
    - Admin kontrolü
    - Status: PENDING_APPROVAL → REJECTED
    - Refund (if paid)
    - Notification gönder (teacher'a)
  - `pause_ad_campaign(db, campaign_id, teacher_id) -> AdCampaign`
    - Author kontrolü
    - Status: ACTIVE → PAUSED
  - `resume_ad_campaign(db, campaign_id, teacher_id) -> AdCampaign`
    - Author kontrolü
    - Status: PAUSED → ACTIVE
  - `get_active_campaigns_for_placement(db, placement_id, filters) -> list[AdCampaign]`
    - Aktif kampanyaları getir (sıralama: priority, created_at)
    - Targeting kontrolü (if applicable)
  - `calculate_campaign_cost(start_date, end_date, pricing) -> Decimal`
    - Kampanya maliyetini hesapla
  - `check_teacher_balance(teacher_id, required_amount, db) -> tuple[bool, Decimal]`
    - Bakiye kontrolü
  - `process_campaign_payment(campaign_id, db) -> bool`
    - Ödeme işlemi
    - TeacherEarning kaydı
  - `increment_impression(campaign_id, db) -> int`
    - Görüntülenme sayısını artır
    - Analytics kaydı (günlük)
  - `increment_click(campaign_id, db) -> int`
    - Tıklama sayısını artır
    - Analytics kaydı (günlük)
    - CTR hesaplama
  - `increment_conversion(campaign_id, db) -> int`
    - Dönüşüm sayısını artır
    - Analytics kaydı
  - `update_campaign_analytics(campaign_id, db) -> AdCampaign`
    - CTR, conversion rate, CPC, CPM hesaplama
  - `check_and_complete_campaigns(db) -> list[AdCampaign]`
    - Scheduled job: end_date geçen kampanyaları COMPLETED yap
    - Bütçe biten kampanyaları PAUSED yap
  - `check_and_activate_campaigns(db) -> list[AdCampaign]`
    - Scheduled job: start_date gelen kampanyaları ACTIVE yap

**Kabul Kriterleri:**
- ✅ Tüm service functions oluşturuldu
- ✅ Payment logic çalışıyor
- ✅ Balance kontrolü çalışıyor
- ✅ Analytics tracking çalışıyor
- ✅ Scheduled jobs hazır
- ✅ Error handling eklendi

---

### EP14-BE-08: Ad Placement Service Layer
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Ad placement işlemleri için service layer oluşturulacak.

**Detaylar:**
- `backend/app/services/ad_placement_service.py` dosyası oluştur
- Functions:
  - `create_ad_placement(db, placement_data, admin_id) -> AdPlacement`
    - Code uniqueness kontrolü
  - `update_ad_placement(db, placement_id, placement_data, admin_id) -> AdPlacement`
    - Admin kontrolü
  - `delete_ad_placement(db, placement_id, admin_id) -> bool`
    - Admin kontrolü
    - Active campaigns kontrolü (varsa silinemez)
  - `get_active_placements(db) -> list[AdPlacement]`
    - Aktif yerleşimleri getir
  - `get_placement_with_pricing(db, placement_id) -> AdPlacement`
    - Yerleşim + aktif pricing bilgisi

**Kabul Kriterleri:**
- ✅ Tüm service functions oluşturuldu
- ✅ Admin kontrolü çalışıyor
- ✅ Error handling eklendi

---

### EP14-BE-09: Ad Pricing Service Layer
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Ad pricing işlemleri için service layer oluşturulacak.

**Detaylar:**
- `backend/app/services/ad_pricing_service.py` dosyası oluştur
- Functions:
  - `create_ad_pricing(db, pricing_data, admin_id) -> AdPricing`
    - Placement kontrolü
    - Pricing model validation
    - Eski pricing'leri deaktif et (if needed)
  - `update_ad_pricing(db, pricing_id, pricing_data, admin_id) -> AdPricing`
    - Admin kontrolü
  - `get_active_pricing_for_placement(db, placement_id, date=None) -> AdPricing`
    - Aktif pricing'i getir (date'e göre)
  - `calculate_campaign_cost(start_date, end_date, placement_id, pricing_model, db) -> Decimal`
    - Kampanya maliyetini hesapla
  - `get_pricing_history(db, placement_id) -> list[AdPricing]`
    - Fiyat geçmişi

**Kabul Kriterleri:**
- ✅ Tüm service functions oluşturuldu
- ✅ Pricing calculation çalışıyor
- ✅ Date-based pricing çalışıyor

---

### EP14-BE-10: Ad Campaign API Endpoints (Teacher)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4 saat

**Açıklama:** Teacher için ad campaign REST API endpoints oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/ad_campaigns.py` dosyası oluştur
- Endpoints:
  - `POST /api/v1/ads/campaigns` - Yeni kampanya oluştur
    - Auth: Teacher
    - Request body: AdCampaignCreate
    - Response: AdCampaignResponse
    - İşlemler:
      - Placement kontrolü
      - Pricing hesaplama
      - Balance kontrolü
      - Kampanya oluşturma (PENDING_APPROVAL)
  - `GET /api/v1/ads/campaigns` - Kampanyaları listele (teacher'ın kendi)
    - Auth: Teacher
    - Query params: status, placement_id, course_id, skip, limit
    - Response: list[AdCampaignListResponse]
  - `GET /api/v1/ads/campaigns/{campaign_id}` - Kampanya detayı
    - Auth: Teacher (own campaigns)
    - Response: AdCampaignResponse
  - `PUT /api/v1/ads/campaigns/{campaign_id}` - Kampanya güncelle
    - Auth: Teacher (own campaigns, status != ACTIVE)
    - Request body: AdCampaignUpdate
    - Response: AdCampaignResponse
  - `DELETE /api/v1/ads/campaigns/{campaign_id}` - Kampanya sil
    - Auth: Teacher (own campaigns, status != ACTIVE)
    - Response: {message: "deleted"}
  - `POST /api/v1/ads/campaigns/{campaign_id}/pause` - Kampanyayı duraklat
    - Auth: Teacher (own campaigns)
    - Response: AdCampaignResponse
  - `POST /api/v1/ads/campaigns/{campaign_id}/resume` - Kampanyayı devam ettir
    - Auth: Teacher (own campaigns)
    - Response: AdCampaignResponse
  - `GET /api/v1/ads/campaigns/{campaign_id}/analytics` - Kampanya analitikleri
    - Auth: Teacher (own campaigns)
    - Query params: date_from, date_to, group_by (day, week, month)
    - Response: AdCampaignAnalyticsResponse
  - `GET /api/v1/ads/placements` - Aktif yerleşimleri listele
    - Auth: Teacher
    - Response: list[AdPlacementResponse] (with pricing info)
  - `GET /api/v1/ads/placements/{placement_id}/pricing` - Yerleşim fiyatlandırması
    - Auth: Teacher
    - Query params: start_date, end_date (kampanya maliyeti hesaplama için)
    - Response: AdPricingResponse (with calculated cost)

**Kabul Kriterleri:**
- ✅ Tüm endpoints oluşturuldu
- ✅ Authentication/Authorization kontrolü yapılıyor
- ✅ Balance kontrolü çalışıyor
- ✅ Error handling eklendi
- ✅ Router'a eklendi

---

### EP14-BE-11: Ad Campaign API Endpoints (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Admin için ad campaign REST API endpoints oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/ad_campaigns_admin.py` dosyası oluştur
- Endpoints:
  - `GET /api/v1/admin/ads/campaigns` - Tüm kampanyaları listele
    - Auth: Admin
    - Query params: status, teacher_id, placement_id, approval_status, skip, limit
    - Response: list[AdCampaignResponse]
  - `GET /api/v1/admin/ads/campaigns/{campaign_id}` - Kampanya detayı
    - Auth: Admin
    - Response: AdCampaignResponse
  - `POST /api/v1/admin/ads/campaigns/{campaign_id}/approve` - Kampanyayı onayla
    - Auth: Admin
    - Request body: {notes?: string}
    - Response: AdCampaignResponse
    - İşlemler:
      - Payment işlemi
      - Status: ACTIVE (if start_date <= today) or APPROVED
  - `POST /api/v1/admin/ads/campaigns/{campaign_id}/reject` - Kampanyayı reddet
    - Auth: Admin
    - Request body: {reason: string}
    - Response: AdCampaignResponse
  - `PUT /api/v1/admin/ads/campaigns/{campaign_id}` - Kampanya güncelle (admin override)
    - Auth: Admin
    - Request body: AdCampaignUpdate
    - Response: AdCampaignResponse
  - `DELETE /api/v1/admin/ads/campaigns/{campaign_id}` - Kampanya sil
    - Auth: Admin
    - Response: {message: "deleted"}
  - `GET /api/v1/admin/ads/campaigns/stats` - Kampanya istatistikleri
    - Auth: Admin
    - Response: {total_campaigns, active_campaigns, pending_approval, total_revenue, etc.}

**Kabul Kriterleri:**
- ✅ Tüm admin endpoints oluşturuldu
- ✅ Admin-only koruma eklendi
- ✅ Approval/rejection çalışıyor
- ✅ Router'a eklendi

---

### EP14-BE-12: Ad Placement API Endpoints (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Admin için ad placement REST API endpoints oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/ad_placements_admin.py` dosyası oluştur
- Endpoints:
  - `POST /api/v1/admin/ads/placements` - Yeni yerleşim oluştur
    - Auth: Admin
    - Request body: AdPlacementCreate
    - Response: AdPlacementResponse
  - `GET /api/v1/admin/ads/placements` - Yerleşimleri listele
    - Auth: Admin
    - Query params: is_active, placement_type, location, skip, limit
    - Response: list[AdPlacementResponse]
  - `GET /api/v1/admin/ads/placements/{placement_id}` - Yerleşim detayı
    - Auth: Admin
    - Response: AdPlacementResponse
  - `PUT /api/v1/admin/ads/placements/{placement_id}` - Yerleşim güncelle
    - Auth: Admin
    - Request body: AdPlacementUpdate
    - Response: AdPlacementResponse
  - `DELETE /api/v1/admin/ads/placements/{placement_id}` - Yerleşim sil
    - Auth: Admin
    - Response: {message: "deleted"}

**Kabul Kriterleri:**
- ✅ Tüm placement endpoints oluşturuldu
- ✅ Admin-only koruma eklendi
- ✅ Router'a eklendi

---

### EP14-BE-13: Ad Pricing API Endpoints (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Admin için ad pricing REST API endpoints oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/ad_pricing_admin.py` dosyası oluştur
- Endpoints:
  - `POST /api/v1/admin/ads/pricing` - Yeni fiyatlandırma oluştur
    - Auth: Admin
    - Request body: AdPricingCreate
    - Response: AdPricingResponse
    - İşlemler:
      - Eski pricing'leri deaktif et (if needed)
  - `GET /api/v1/admin/ads/pricing` - Fiyatlandırmaları listele
    - Auth: Admin
    - Query params: placement_id, is_active, pricing_model, skip, limit
    - Response: list[AdPricingResponse]
  - `GET /api/v1/admin/ads/pricing/{pricing_id}` - Fiyatlandırma detayı
    - Auth: Admin
    - Response: AdPricingResponse
  - `PUT /api/v1/admin/ads/pricing/{pricing_id}` - Fiyatlandırma güncelle
    - Auth: Admin
    - Request body: AdPricingUpdate
    - Response: AdPricingResponse
  - `DELETE /api/v1/admin/ads/pricing/{pricing_id}` - Fiyatlandırma sil
    - Auth: Admin
    - Response: {message: "deleted"}
  - `GET /api/v1/admin/ads/pricing/placement/{placement_id}` - Yerleşim fiyatlandırma geçmişi
    - Auth: Admin
    - Response: list[AdPricingResponse]
  - `POST /api/v1/admin/ads/pricing/calculate` - Kampanya maliyeti hesapla (preview)
    - Auth: Admin
    - Request body: {placement_id, start_date, end_date, pricing_model}
    - Response: {calculated_cost: Decimal, breakdown: dict}

**Kabul Kriterleri:**
- ✅ Tüm pricing endpoints oluşturuldu
- ✅ Admin-only koruma eklendi
- ✅ Cost calculation çalışıyor
- ✅ Router'a eklendi

---

### EP14-BE-14: Ad Display API Endpoints (Public)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Public ad display için API endpoints oluşturulacak (frontend'den çağrılacak).

**Detaylar:**
- `backend/app/api/v1/endpoints/ad_display.py` dosyası oluştur
- Endpoints:
  - `GET /api/v1/public/ads/placement/{placement_code}` - Yerleşim için aktif reklamları getir
    - Auth: Public
    - Query params: category_id (optional, targeting için), limit (default=1)
    - Response: list[AdDisplayResponse]
    - İşlemler:
      - Aktif kampanyaları getir (priority, random)
      - Targeting kontrolü
      - Impression tracking (async)
  - `POST /api/v1/public/ads/click/{campaign_id}` - Reklam tıklaması kaydet
    - Auth: Public (optional, rate limiting)
    - Response: {success: bool}
    - İşlemler:
      - Click tracking
      - Fraud detection (optional)
  - `GET /api/v1/public/ads/featured-courses` - Öne çıkan kurslar
    - Auth: Public
    - Query params: limit (default=6), category_id (optional)
    - Response: list[CourseResponse] (with ad campaign info)
    - İşlemler:
      - Aktif FEATURED_COURSE kampanyaları
      - Priority sorting
      - Impression tracking

**Kabul Kriterleri:**
- ✅ Public endpoints oluşturuldu
- ✅ Ad display logic çalışıyor
- ✅ Tracking çalışıyor
- ✅ Rate limiting eklendi
- ✅ Router'a eklendi

---

### EP14-BE-15: Ad Scheduled Jobs & Background Tasks
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Reklam kampanyaları için scheduled jobs oluşturulacak.

**Detaylar:**
- `backend/app/services/ad_scheduler.py` dosyası oluştur
- Functions:
  - `activate_scheduled_campaigns(db) -> list[AdCampaign]`
    - start_date <= today olan APPROVED kampanyaları ACTIVE yap
    - Payment kontrolü
  - `complete_expired_campaigns(db) -> list[AdCampaign]`
    - end_date < today olan ACTIVE kampanyaları COMPLETED yap
  - `pause_over_budget_campaigns(db) -> list[AdCampaign]`
    - spent_amount >= total_budget olan kampanyaları PAUSED yap
  - `update_daily_analytics(db) -> None`
    - Günlük analytics özetlerini oluştur
- Background tasks (Celery veya FastAPI BackgroundTasks):
  - `process_impression_tracking(campaign_id)`
  - `process_click_tracking(campaign_id)`
  - `update_campaign_metrics(campaign_id)`
- Cron jobs (scheduled):
  - Her saat: `activate_scheduled_campaigns`
  - Her saat: `complete_expired_campaigns`
  - Her saat: `pause_over_budget_campaigns`
  - Her gün (00:00): `update_daily_analytics`

**Kabul Kriterleri:**
- ✅ Scheduled jobs oluşturuldu
- ✅ Background tasks çalışıyor
- ✅ Cron jobs ayarlandı
- ✅ Error handling eklendi

---

### EP14-BE-16: TeacherEarning Integration (AD_SPEND Type)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** TeacherEarning modeline AD_SPEND tipi eklenecek ve entegrasyon yapılacak.

**Detaylar:**
- `backend/app/models/teacher_earning.py` dosyasını güncelle
  - `EarningType` enum'a `AD_SPEND = "ad_spend"` ekle
- `backend/app/services/ad_campaign_service.py` içinde:
  - `create_ad_campaign`: TeacherEarning kaydı oluştur (AD_SPEND, negatif, pending)
  - `approve_ad_campaign`: TeacherEarning kaydını confirm et
  - `reject_ad_campaign`: TeacherEarning kaydını iptal et (refund)
  - `delete_ad_campaign`: TeacherEarning kaydını iptal et (refund)
- Balance calculation güncelle:
  - `calculate_teacher_balance`: AD_SPEND tipindeki pending kayıtları dikkate al

**Kabul Kriterleri:**
- ✅ EarningType'a AD_SPEND eklendi
- ✅ TeacherEarning kayıtları oluşturuluyor
- ✅ Balance calculation güncellendi
- ✅ Refund logic çalışıyor

---

## 🎨 FRONTEND TASKS

### EP14-FE-01: Ad Campaign API Client
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Frontend için ad campaign API client oluşturulacak.

**Detaylar:**
- `frontend/src/lib/api.ts` dosyasına ekle
- API functions:
  - `adCampaignsApi.create(campaign: AdCampaignCreate)`
  - `adCampaignsApi.list(params)`
  - `adCampaignsApi.get(campaignId)`
  - `adCampaignsApi.update(campaignId, data)`
  - `adCampaignsApi.delete(campaignId)`
  - `adCampaignsApi.pause(campaignId)`
  - `adCampaignsApi.resume(campaignId)`
  - `adCampaignsApi.getAnalytics(campaignId, params)`
  - `adCampaignsApi.getPlacements()`
  - `adCampaignsApi.getPlacementPricing(placementId, params)`
- TypeScript interfaces:
  - `AdCampaign`
  - `AdCampaignCreate`
  - `AdCampaignUpdate`
  - `AdPlacement`
  - `AdPricing`
  - `AdCampaignAnalytics`

**Kabul Kriterleri:**
- ✅ Tüm API functions oluşturuldu
- ✅ TypeScript types tanımlandı
- ✅ Error handling eklendi

---

### EP14-FE-02: Ad Campaign Form Component (Create/Edit)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4 saat

**Açıklama:** Ad campaign oluşturma/düzenleme formu component oluşturulacak.

**Detaylar:**
- `frontend/src/components/ads/AdCampaignForm.tsx` component oluştur
- Form fields:
  - Campaign Type (radio: Featured Course, Banner Ad)
  - Placement (select dropdown, with pricing info)
  - Course (select dropdown, teacher'ın kendi kursları)
  - Campaign Name (text input)
  - Start Date (date picker, future dates)
  - End Date (date picker, > start_date)
  - Total Budget (number input, readonly, calculated)
  - Daily Budget (number input, optional)
  - Banner Image URL (text input + image preview, banner ads için)
  - Banner Link URL (text input, banner ads için)
  - Banner Alt Text (text input, banner ads için)
  - Targeting (optional):
    - Target Categories (multi-select)
    - Target Tags (multi-select)
- Features:
  - Real-time cost calculation (placement pricing'den)
  - Balance check (teacher balance display)
  - Budget validation
  - Image preview
  - Date validation
- Form validation:
  - All required fields
  - Date range validation
  - Budget validation
  - URL validation
- Form actions:
  - Save Draft
  - Submit for Approval
  - Cancel

**Kabul Kriterleri:**
- ✅ Form component oluşturuldu
- ✅ Tüm fields eklendi
- ✅ Cost calculation çalışıyor
- ✅ Balance check çalışıyor
- ✅ Form validation çalışıyor

---

### EP14-FE-03: Ad Campaign List Page (Teacher)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Teacher için ad campaign listesi sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/teacher/ads/page.tsx` sayfası oluştur
- Özellikler:
  - Campaign listesi (table/card view)
  - Filters:
    - Status (Draft, Pending, Active, Paused, Completed, Rejected)
    - Placement
    - Course
    - Date range
  - Sorting: Created At, Start Date, End Date, Spent Amount
  - Pagination
  - Actions per row:
    - View Details
    - Edit (if editable)
    - Pause/Resume
    - Delete (if deletable)
  - Stats cards:
    - Total Campaigns
    - Active Campaigns
    - Total Spent
    - Pending Approval
  - Create new campaign button
- Layout:
  - Header: Title, Create button, Filters
  - Stats cards row
  - Campaign list
  - Pagination footer

**Kabul Kriterleri:**
- ✅ List page oluşturuldu
- ✅ Filters çalışıyor
- ✅ Actions çalışıyor
- ✅ Stats cards gösteriliyor
- ✅ Responsive design

---

### EP14-FE-04: Ad Campaign Detail Page (Teacher)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat

**Açıklama:** Teacher için ad campaign detay sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/teacher/ads/[id]/page.tsx` sayfası oluştur
- Layout:
  - Header: Campaign name, Status badge, Actions (Edit, Pause/Resume, Delete)
  - Campaign Info Card:
    - Placement
    - Course
    - Dates
    - Budget info
    - Approval status
  - Analytics Section:
    - Impressions
    - Clicks
    - CTR
    - Conversions
    - Spent Amount
    - Charts (impressions over time, clicks over time)
  - Timeline (status changes, approvals, etc.)

**Kabul Kriterleri:**
- ✅ Detail page oluşturuldu
- ✅ Analytics gösteriliyor
- ✅ Charts çalışıyor
- ✅ Actions çalışıyor

---

### EP14-FE-05: Ad Campaign Analytics Dashboard (Teacher)
**Durum:** ✅ TAMAMLANDI (Detail page içinde analytics gösteriliyor)  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat

**Açıklama:** Teacher için ad campaign analitik dashboard oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/teacher/ads/analytics/page.tsx` sayfası oluştur
- Features:
  - Overview stats:
    - Total Impressions
    - Total Clicks
    - Average CTR
    - Total Spent
    - Total Conversions
  - Charts:
    - Impressions over time (line chart)
    - Clicks over time (line chart)
    - CTR over time (line chart)
    - Campaign performance comparison (bar chart)
  - Filters:
    - Date range
    - Campaign selection
    - Placement selection
  - Export data (CSV, optional)

**Kabul Kriterleri:**
- ✅ Analytics dashboard oluşturuldu
- ✅ Charts çalışıyor
- ✅ Filters çalışıyor
- ✅ Data export çalışıyor (optional)

---

### EP14-FE-06: Ad Placement Management Page (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat

**Açıklama:** Admin için ad placement yönetim sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/admin/ads/placements/page.tsx` sayfası oluştur
- Features:
  - Placement listesi (table)
  - Create placement button
  - Edit placement (modal/page)
  - Delete placement (with confirmation)
  - Placement form:
    - Name
    - Code (unique)
    - Description
    - Type (select)
    - Location
    - Dimensions (width, height)
    - Max Ads
    - Priority
    - Is Active
  - Placement cards with stats (active campaigns, revenue)

**Kabul Kriterleri:**
- ✅ Placement management page oluşturuldu
- ✅ CRUD operations çalışıyor
- ✅ Form validation çalışıyor

---

### EP14-FE-07: Ad Pricing Management Page (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 4 saat

**Açıklama:** Admin için ad pricing yönetim sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/admin/ads/pricing/page.tsx` sayfası oluştur
- Features:
  - Pricing listesi (grouped by placement)
  - Create pricing button
  - Edit pricing (modal/page)
  - Delete pricing (with confirmation)
  - Pricing form:
    - Placement (select)
    - Pricing Model (select: Fixed Daily, Per Impression, Per Click, Hybrid)
    - Price Per Day (if Fixed Daily)
    - Price Per Impression (if Per Impression)
    - Price Per Click (if Per Click)
    - Min/Max Daily Budget
    - Min/Max Campaign Duration
    - Discount Percentage
    - Effective Dates
    - Is Active
  - Pricing history (timeline)
  - Cost calculator (preview for campaigns)

**Kabul Kriterleri:**
- ✅ Pricing management page oluşturuldu
- ✅ CRUD operations çalışıyor
- ✅ Pricing model logic çalışıyor
- ✅ Cost calculator çalışıyor

---

### EP14-FE-08: Ad Campaign Approval Page (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Admin için ad campaign onay sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/admin/ads/approvals/page.tsx` sayfası oluştur
- Features:
  - Pending approval campaigns list
  - Campaign cards with:
    - Teacher info
    - Course info
    - Placement info
    - Budget info
    - Banner preview (if banner ad)
    - Campaign details
  - Actions:
    - Approve (with notes)
    - Reject (with reason)
    - View Details
  - Filters:
    - Placement
    - Teacher
    - Date range
  - Bulk actions (optional)

**Kabul Kriterleri:**
- ✅ Approval page oluşturuldu
- ✅ Approve/Reject çalışıyor
- ✅ Campaign preview çalışıyor

---

### EP14-FE-09: Ad Campaign Management Page (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat

**Açıklama:** Admin için ad campaign yönetim sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/admin/ads/campaigns/page.tsx` sayfası oluştur
- Features:
  - All campaigns list (table)
  - Filters:
    - Status
    - Teacher
    - Placement
    - Approval Status
    - Date range
  - Actions:
    - View Details
    - Edit (admin override)
    - Approve/Reject
    - Delete
  - Stats cards:
    - Total Campaigns
    - Active Campaigns
    - Total Revenue
    - Pending Approvals

**Kabul Kriterleri:**
- ✅ Campaign management page oluşturuldu
- ✅ Filters çalışıyor
- ✅ Actions çalışıyor
- ✅ Stats gösteriliyor

---

### EP14-FE-10: Ad Display Components (Public)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Public sayfalar için ad display components oluşturulacak.

**Detaylar:**
- `frontend/src/components/ads/AdBanner.tsx` component oluştur
  - Props: `placementCode`, `categoryId?`, `className?`
  - Features:
    - API'den aktif reklamları getir
    - Banner render
    - Click tracking
    - Impression tracking (on mount)
    - Loading/empty states
- `frontend/src/components/ads/FeaturedCourses.tsx` component oluştur
  - Props: `limit?`, `categoryId?`, `className?`
  - Features:
    - Featured courses API'den getir
    - Course cards render
    - Impression tracking
    - Click tracking
- `frontend/src/components/ads/AdPlacement.tsx` wrapper component
  - Props: `placementCode`, `categoryId?`, `className?`
  - Features:
    - Placement type'a göre doğru component render
    - Error handling
    - Loading states

**Kabul Kriterleri:**
- ✅ Ad components oluşturuldu
- ✅ Tracking çalışıyor
- ✅ Error handling eklendi
- ✅ Loading/empty states

---

### EP14-FE-11: Homepage Ad Integration
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Ana sayfaya ad components entegre edilecek.

**Detaylar:**
- `frontend/src/app/page.tsx` dosyasını güncelle
- Ad placements:
  - Hero banner (top of page)
  - Featured courses section (after hero)
  - Sidebar ads (if sidebar exists)
  - Inline ads (between content sections)
- Layout:
  - Responsive ad placement
  - Ad spacing
  - Fallback content (if no ads)

**Kabul Kriterleri:**
- ✅ Homepage'a ads entegre edildi
- ✅ Responsive design
- ✅ Fallback content çalışıyor

---

### EP14-FE-12: Course Page Ad Integration
**Durum:** ✅ TAMAMLANDI (Inline ads entegre edildi)  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Kurs sayfalarına ad components entegre edilecek.

**Detaylar:**
- `frontend/src/app/courses/[slug]/page.tsx` dosyasını güncelle
- Ad placements:
  - Sidebar ads
  - Related courses (featured)
  - Inline ads (between sections)

**Kabul Kriterleri:**
- ✅ Course page'a ads entegre edildi
- ✅ Related courses gösteriliyor

---

### EP14-FE-13: Category Page Ad Integration
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟡 DÜŞÜK  
**Tahmini Süre:** 1 saat

**Açıklama:** Kategori sayfalarına ad components entegre edilecek.

**Detaylar:**
- `frontend/src/app/courses/page.tsx` dosyasını güncelle
- Ad placements:
  - Top banner
  - Sidebar ads
  - Featured courses (category-targeted)

**Kabul Kriterleri:**
- ✅ Category page'a ads entegre edildi
- ✅ Category targeting çalışıyor

---

### EP14-FE-14: Teacher Balance Display & Ad Integration
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Teacher dashboard'a balance display ve ad quick actions eklenecek.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/teacher/page.tsx` dosyasını güncelle
- Features:
  - Balance card (with ad spend info)
  - Quick actions:
    - Create Ad Campaign
    - View Active Campaigns
  - Recent ad campaigns widget
  - Ad performance summary

**Kabul Kriterleri:**
- ✅ Balance display eklendi
- ✅ Quick actions çalışıyor
- ✅ Ad widgets gösteriliyor

---

### EP14-FE-15: Ad Analytics Dashboard (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat

**Açıklama:** Admin için ad analytics dashboard oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/admin/ads/analytics/page.tsx` sayfası oluştur
- Features:
  - Overview stats:
    - Total Revenue
    - Active Campaigns
    - Total Impressions
    - Total Clicks
    - Average CTR
  - Charts:
    - Revenue over time
    - Campaigns by status
    - Top placements (revenue)
    - Top teachers (ad spend)
    - CTR trends
  - Filters:
    - Date range
    - Placement
    - Teacher
  - Export data (CSV)

**Kabul Kriterleri:**
- ✅ Analytics dashboard oluşturuldu
- ✅ Charts çalışıyor
- ✅ Filters çalışıyor
- ✅ Export çalışıyor

---

## 📝 EK NOTLAR

### Database Migrations
- Alembic migration dosyaları oluşturulacak
- Migration test edilecek (upgrade/downgrade)

### Background Jobs
- Celery veya FastAPI BackgroundTasks kullanılacak
- Scheduled jobs için cron veya APScheduler

### Payment Integration
- TeacherEarning modeline AD_SPEND tipi eklenecek
- Balance calculation güncellenecek
- Refund logic eklenecek

### Analytics Tracking
- Impression tracking (async, rate limited)
- Click tracking (fraud detection)
- Conversion tracking (enrollment, purchase)

### Security
- Rate limiting (ad display endpoints)
- Fraud detection (click tracking)
- Admin-only endpoints protection
- Teacher balance validation

### Performance
- Ad caching (Redis, optional)
- Database indexes optimize
- Eager loading (relationships)
- Background processing (tracking)

---

## 🆕 EPIC-POPUP: Pop-up Duyuru Sistemi
- **Durum:** ✅ TAMAMLANDI
- **Öncelik:** 🟠 ORTA
- **Tahmini Süre:** 2-3 Gün
- **Tamamlanma Tarihi:** 2026-02-11
- **Açıklama:** Siteye girildiğinde gösterilecek pop-up duyuruları. Admin tarafından yönetilebilir, kullanıcılar kapatabilir veya "tekrar gösterme" seçeneği ile gizleyebilir.
- **Backend:** 5/5 ✅ (EP15-BE-01 ~ EP15-BE-05)
- **Frontend:** 6/6 ✅ (EP15-FE-01 ~ EP15-FE-06)

### 📋 Genel Özellikler
- ✅ Landing page'de pop-up gösterimi
- ✅ Admin tarafından pop-up yönetimi
- ✅ Tarih aralığı kontrolü (başlangıç/bitiş)
- ✅ Hedef kitle seçimi (all, students, teachers, admins)
- ✅ "Tekrar gösterme" seçeneği (localStorage)
- ✅ Kapatılabilir pop-up'lar
- ✅ Öncelik sıralaması (birden fazla aktif pop-up)
- ✅ Rich text içerik desteği
- ✅ CTA (Call-to-Action) butonları
- ✅ Görsel/medya desteği

---

## 🔧 BACKEND TASKS

### EP15-BE-01: Popup Announcement Model Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:** Pop-up duyuruları için SQLAlchemy model oluşturulacak.

**Detaylar:**
- `backend/app/models/popup_announcement.py` dosyası oluştur
- Model alanları:
  - `id`: UUID (primary key)
  - `title`: String(255) - Pop-up başlığı
  - `message`: Text - Pop-up içeriği (rich text HTML destekli)
  - `popup_type`: Enum (INFO, PROMOTION, ANNOUNCEMENT, WARNING) - Pop-up tipi
  - `is_active`: Boolean (default=True) - Aktif mi
  - `starts_at`: DateTime (nullable) - Başlangıç tarihi
  - `expires_at`: DateTime (nullable) - Bitiş tarihi
  - `target_audience`: String(50) (default="all") - Hedef kitle (all, students, teachers, admins)
  - `priority`: Integer (default=0) - Öncelik (yüksek öncelik önce gösterilir)
  - `is_dismissible`: Boolean (default=True) - Kapatılabilir mi
  - `show_once_per_user`: Boolean (default=False) - Kullanıcı başına bir kez göster
  - `dismiss_duration_days`: Integer (nullable) - Kaç gün gizli kalacak (localStorage için)
  - `image_url`: String(500) (nullable) - Pop-up görseli
  - `button_text`: String(100) (nullable) - CTA buton metni
  - `button_link_url`: String(500) (nullable) - CTA buton linki
  - `button_link_target`: String(20) (default="_self") - Link target (_self, _blank)
  - `width`: Integer (default=500) - Pop-up genişliği (pixel)
  - `height`: Integer (nullable) - Pop-up yüksekliği (pixel, auto if null)
  - `position`: String(20) (default="center") - Pop-up pozisyonu (center, top, bottom)
  - `overlay_opacity`: Decimal(3,2) (default=0.5) - Arka plan overlay opaklığı (0-1)
  - `created_by_id`: UUID (ForeignKey to users.id, nullable) - Oluşturan admin
  - `created_at`: DateTime
  - `updated_at`: DateTime
- Relationships:
  - `created_by`: relationship to User
- Indexes:
  - `is_active`
  - `starts_at`, `expires_at`
  - `target_audience`
  - `priority` (desc)
  - `created_at` (desc)
- Constraints:
  - `expires_at` > `starts_at` (if both not null)
  - `width`, `height` > 0 (if not null)
  - `overlay_opacity` between 0 and 1

**Kabul Kriterleri:**
- ✅ Model dosyası oluşturuldu
- ✅ Tüm alanlar tanımlandı
- ✅ Enum types tanımlandı
- ✅ Relationships kuruldu
- ✅ Indexes eklendi
- ✅ Constraints eklendi
- ✅ `__init__.py`'ye import edildi
- ✅ Alembic migration oluşturuldu

---

### EP15-BE-02: Popup Announcement Schemas Oluşturma
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:** Popup announcement için Pydantic schemas oluşturulacak.

**Detaylar:**
- `backend/app/schemas/popup_announcement.py` dosyası oluştur
- Schemas:
  - `PopupAnnouncementBase`: Temel alanlar
  - `PopupAnnouncementCreate`: Oluşturma için
  - `PopupAnnouncementUpdate`: Güncelleme için (tüm alanlar optional)
  - `PopupAnnouncementResponse`: Response için
  - `PopupAnnouncementListResponse`: Liste için
- Validations:
  - `title`: min_length=1, max_length=255
  - `message`: min_length=1
  - `button_text`: max_length=100
  - `button_link_url`: URL validation
  - `dismiss_duration_days`: ge=0 (if provided)
  - `width`, `height`: gt=0 (if provided)
  - `overlay_opacity`: ge=0, le=1
  - `expires_at` > `starts_at` (if both provided)

**Kabul Kriterleri:**
- ✅ Tüm schemas oluşturuldu
- ✅ Validations eklendi
- ✅ `__init__.py`'ye export edildi

---

### EP15-BE-03: Popup Announcement Service Layer
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat

**Açıklama:** Popup announcement işlemleri için service layer oluşturulacak.

**Detaylar:**
- `backend/app/services/popup_announcement_service.py` dosyası oluştur
- Functions:
  - `create_popup_announcement(db, popup_data, admin_id) -> PopupAnnouncement`
    - Admin kontrolü
    - Date validation
  - `update_popup_announcement(db, popup_id, popup_data, admin_id) -> PopupAnnouncement`
    - Admin kontrolü
  - `delete_popup_announcement(db, popup_id, admin_id) -> bool`
    - Admin kontrolü
  - `get_active_popups(db, target_audience=None) -> list[PopupAnnouncement]`
    - Aktif pop-up'ları getir (tarih kontrolü, priority sorting)
    - Target audience filtering
  - `get_popup_for_user(db, user_role, dismissed_popup_ids=None) -> PopupAnnouncement | None`
    - Kullanıcı için gösterilecek pop-up'ı getir
    - Dismissed pop-ups'ı filtrele
    - Priority sorting
    - show_once_per_user kontrolü (optional, frontend'de de yapılabilir)

**Kabul Kriterleri:**
- ✅ Tüm service functions oluşturuldu
- ✅ Date filtering çalışıyor
- ✅ Priority sorting çalışıyor
- ✅ Error handling eklendi

---

### EP15-BE-04: Popup Announcement API Endpoints (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Admin için popup announcement REST API endpoints oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/popup_announcements.py` dosyası oluştur
- Endpoints:
  - `POST /api/v1/admin/popups` - Yeni pop-up oluştur
    - Auth: Admin only
    - Request body: PopupAnnouncementCreate
    - Response: PopupAnnouncementResponse
  - `GET /api/v1/admin/popups` - Pop-up'ları listele
    - Auth: Admin only
    - Query params: is_active, popup_type, target_audience, skip, limit
    - Response: list[PopupAnnouncementListResponse]
  - `GET /api/v1/admin/popups/{popup_id}` - Pop-up detayı
    - Auth: Admin only
    - Response: PopupAnnouncementResponse
  - `PUT /api/v1/admin/popups/{popup_id}` - Pop-up güncelle
    - Auth: Admin only
    - Request body: PopupAnnouncementUpdate
    - Response: PopupAnnouncementResponse
  - `DELETE /api/v1/admin/popups/{popup_id}` - Pop-up sil
    - Auth: Admin only
    - Response: {message: "deleted"}
  - `POST /api/v1/admin/popups/{popup_id}/activate` - Pop-up'ı aktif et
    - Auth: Admin only
    - Response: PopupAnnouncementResponse
  - `POST /api/v1/admin/popups/{popup_id}/deactivate` - Pop-up'ı deaktif et
    - Auth: Admin only
    - Response: PopupAnnouncementResponse

**Kabul Kriterleri:**
- ✅ Tüm admin endpoints oluşturuldu
- ✅ Admin-only koruma eklendi
- ✅ Router'a eklendi

---

### EP15-BE-05: Popup Announcement Public API Endpoint
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:** Public popup announcement API endpoint oluşturulacak.

**Detaylar:**
- `backend/app/api/v1/endpoints/popup_announcements.py` dosyasına ekle
- Endpoints:
  - `GET /api/v1/public/popups/active` - Aktif pop-up'ı getir
    - Auth: Public (optional user role for targeting)
    - Query params: 
      - `target_audience` (optional, auto-detect from user if authenticated)
      - `dismissed_ids` (optional, comma-separated popup IDs)
    - Response: PopupAnnouncementResponse | null
    - İşlemler:
      - Aktif pop-up'ları getir (tarih kontrolü)
      - Target audience filtering
      - Dismissed pop-ups'ı filtrele
      - Priority sorting (en yüksek öncelikli döndür)
      - show_once_per_user kontrolü (optional)

**Kabul Kriterleri:**
- ✅ Public endpoint oluşturuldu
- ✅ Targeting çalışıyor
- ✅ Dismissed filtering çalışıyor
- ✅ Priority sorting çalışıyor

---

## 🎨 FRONTEND TASKS

### EP15-FE-01: Popup Announcement API Client
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:** Frontend için popup announcement API client oluşturulacak.

**Detaylar:**
- `frontend/src/lib/api.ts` dosyasına ekle
- API functions:
  - `popupAnnouncementsApi.create(popup: PopupAnnouncementCreate)`
  - `popupAnnouncementsApi.list(params)`
  - `popupAnnouncementsApi.get(popupId)`
  - `popupAnnouncementsApi.update(popupId, data)`
  - `popupAnnouncementsApi.delete(popupId)`
  - `popupAnnouncementsApi.activate(popupId)`
  - `popupAnnouncementsApi.deactivate(popupId)`
  - `popupAnnouncementsApi.getActive(params)` - Public endpoint
- TypeScript interfaces:
  - `PopupAnnouncement`
  - `PopupAnnouncementCreate`
  - `PopupAnnouncementUpdate`

**Kabul Kriterleri:**
- ✅ Tüm API functions oluşturuldu
- ✅ TypeScript types tanımlandı
- ✅ Error handling eklendi

---

### EP15-FE-02: Popup Component
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Pop-up gösterimi için React component oluşturulacak.

**Detaylar:**
- `frontend/src/components/PopupAnnouncement.tsx` component oluştur
- Features:
  - Modal/popup display
  - Overlay (configurable opacity)
  - Close button (if dismissible)
  - "Don't show again" checkbox (if show_once_per_user)
  - Image display (if image_url)
  - Rich text content (HTML render)
  - CTA button (if button_text)
  - Animations (fade in, slide in)
  - Responsive design
  - Position options (center, top, bottom)
- Props:
  - `popup: PopupAnnouncement`
  - `onClose: () => void`
  - `onDismiss: (popupId: string, dontShowAgain: boolean) => void`
- Styling:
  - Tailwind CSS
  - Custom animations (framer-motion optional)
  - Type-based styling (INFO, PROMOTION, WARNING colors)

**Kabul Kriterleri:**
- ✅ Popup component oluşturuldu
- ✅ Tüm features çalışıyor
- ✅ Animations çalışıyor
- ✅ Responsive design
- ✅ Styling tamamlandı

---

### EP15-FE-03: Popup Manager Hook
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Pop-up yönetimi için custom React hook oluşturulacak.

**Detaylar:**
- `frontend/src/hooks/usePopupAnnouncement.ts` hook oluştur
- Features:
  - Active popup fetching (API call)
  - Dismissed popups tracking (localStorage)
  - show_once_per_user tracking (localStorage)
  - Auto-dismiss after duration (dismiss_duration_days)
  - User role detection (for targeting)
  - Popup display logic
- Return:
  - `activePopup: PopupAnnouncement | null`
  - `dismissPopup: (popupId: string, dontShowAgain: boolean) => void`
  - `isLoading: boolean`
  - `error: Error | null`

**Kabul Kriterleri:**
- ✅ Hook oluşturuldu
- ✅ localStorage tracking çalışıyor
- ✅ Auto-dismiss çalışıyor
- ✅ Targeting çalışıyor

---

### EP15-FE-04: Landing Page Popup Integration
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1 saat

**Açıklama:** Ana sayfaya pop-up entegrasyonu yapılacak.

**Detaylar:**
- `frontend/src/app/page.tsx` dosyasını güncelle
- Features:
  - usePopupAnnouncement hook kullan
  - PopupAnnouncement component render
  - Conditional rendering (if activePopup exists)
  - Page load'da popup check

**Kabul Kriterleri:**
- ✅ Landing page'e popup entegre edildi
- ✅ Conditional rendering çalışıyor
- ✅ Page load'da popup gösteriliyor

---

### EP15-FE-05: Popup Announcement Management Page (Admin)
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat

**Açıklama:** Admin için pop-up yönetim sayfası oluşturulacak.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/admin/popups/page.tsx` sayfası oluştur
- Features:
  - Pop-up listesi (table/card view)
  - Filters:
    - Is Active
    - Popup Type
    - Target Audience
  - Sorting: Created At, Priority, Start Date
  - Actions per row:
    - Edit
    - Delete
    - Activate/Deactivate
    - Preview
  - Create new popup button
  - Stats cards: Total Popups, Active Popups, Scheduled Popups
- Layout:
  - Header: Title, Create button, Filters
  - Stats cards row
  - Popup list
  - Pagination footer

**Kabul Kriterleri:**
- ✅ Management page oluşturuldu
- ✅ CRUD operations çalışıyor
- ✅ Filters çalışıyor
- ✅ Stats cards gösteriliyor

---

### EP15-FE-06: Popup Announcement Form Component
**Durum:** ✅ TAMAMLANDI  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat

**Açıklama:** Pop-up oluşturma/düzenleme formu component oluşturulacak.

**Detaylar:**
- `frontend/src/components/admin/PopupAnnouncementForm.tsx` component oluştur
- Form fields:
  - Title (text input, required)
  - Message (rich text editor, required)
  - Popup Type (select: INFO, PROMOTION, ANNOUNCEMENT, WARNING)
  - Is Active (checkbox)
  - Start Date (date picker, optional)
  - End Date (date picker, optional)
  - Target Audience (select: all, students, teachers, admins)
  - Priority (number input, default=0)
  - Is Dismissible (checkbox, default=true)
  - Show Once Per User (checkbox, default=false)
  - Dismiss Duration Days (number input, optional)
  - Image URL (text input + image preview, optional)
  - Button Text (text input, optional)
  - Button Link URL (text input, optional)
  - Button Link Target (select: _self, _blank)
  - Width (number input, default=500)
  - Height (number input, optional)
  - Position (select: center, top, bottom)
  - Overlay Opacity (slider, 0-1, default=0.5)
- Form validation:
  - All required fields
  - Date range validation
  - URL validation
  - Number validations
- Form actions:
  - Save
  - Cancel
  - Preview

**Kabul Kriterleri:**
- ✅ Form component oluşturuldu
- ✅ Tüm fields eklendi
- ✅ Form validation çalışıyor
- ✅ Preview çalışıyor

---

## 📝 EK NOTLAR

### LocalStorage Keys
- `dismissed_popups`: Dismissed popup IDs (array)
- `shown_popups_once`: show_once_per_user popup IDs (array)
- `popup_dismissed_until_{popupId}`: Dismiss until timestamp

### Popup Display Logic
1. Check if popup is active (is_active, date range)
2. Check target audience match
3. Check if dismissed (localStorage)
4. Check if shown once (if show_once_per_user)
5. Check dismiss duration (if dismissed, check if expired)
6. Sort by priority (highest first)
7. Show first matching popup

### Security
- HTML sanitization (rich text content)
- XSS protection
- URL validation (button links)

---

## 🆕 EPIC-COUPON-SITE-WIDE: Site Geneli Kupon Kampanyası
- **Durum:** 🟡 PLANLAMA
- **Öncelik:** 🟠 ORTA
- **Tahmini Süre:** 2-3 Gün
- **Açıklama:** Kupon sistemine site geneli kampanya desteği. Bütün ürünlerde geçerli otomatik indirim kampanyaları.

### 📋 Genel Özellikler
- ✅ Site geneli kupon kampanyaları
- ✅ Otomatik uygulama (sepet'e eklenince)
- ✅ Tüm kurslarda geçerli
- ✅ Admin tarafından yönetim
- ✅ Tarih aralığı kontrolü
- ✅ Kullanım limitleri
- ✅ Kampanya durumu (aktif/pasif)
- ✅ Kampanya istatistikleri

---

## 🔧 BACKEND TASKS

### EP16-BE-01: Coupon Model Güncelleme (Site-Wide Support)
**Durum:** ⬜ Beklemede  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2 saat

**Açıklama:** Coupon modeline site geneli kampanya desteği eklenecek. Belirli eğitimlerde geçerli olabilme özelliği de eklenecek.

**Detaylar:**
- `backend/app/models/coupon.py` dosyasını güncelle
- Değişiklikler:
  - `CouponTriggerType` enum'a `SITE_WIDE = "site_wide"` ekle
  - `is_auto_apply`: Boolean (default=False) - Otomatik uygulanacak mı (site-wide kampanyalar için)
  - `auto_apply_priority`: Integer (default=0) - Otomatik uygulama önceliği (birden fazla site-wide kampanya varsa)
  - `campaign_name`: String(255) (nullable) - Kampanya adı (site-wide kampanyalar için)
  - `campaign_description`: Text (nullable) - Kampanya açıklaması
  - `target_course_ids`: JSON (nullable) - Hedef kurs ID'leri (site-wide kampanyalar için belirli kurslarda geçerli olabilir)
    - Array of UUID strings: `["course-id-1", "course-id-2", ...]`
    - `null` veya boş array = tüm kurslarda geçerli
    - Dolu array = sadece belirtilen kurslarda geçerli
- Association table (alternatif yaklaşım, opsiyonel):
  - `coupon_target_courses` (coupon_id, course_id) - Many-to-many relationship
  - Eğer JSON yerine relationship tercih edilirse
- Indexes:
  - `is_auto_apply`, `trigger_type` (composite, for site-wide queries)
  - `auto_apply_priority` (desc)
  - `target_course_ids` (GIN index for JSON queries, if using JSON)
- Constraints:
  - `is_auto_apply` = True ise `trigger_type` = SITE_WIDE olmalı
  - `auto_apply_priority` >= 0
  - `target_course_ids` null veya array olmalı (JSON validation)

**Kabul Kriterleri:**
- ✅ Coupon model güncellendi
- ✅ Yeni alanlar eklendi
- ✅ Enum güncellendi
- ✅ Indexes eklendi
- ✅ Constraints eklendi
- ✅ Alembic migration oluşturuldu

---

### EP16-BE-02: Coupon Service Layer Güncelleme
**Durum:** ⬜ Beklemede  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 3 saat

**Açıklama:** Coupon service layer'a site-wide kampanya desteği eklenecek. Belirli kurslarda geçerli olma kontrolü de eklenecek.

**Detaylar:**
- `backend/app/services/coupon_service.py` dosyasını güncelle (veya oluştur)
- Functions:
  - `get_active_site_wide_campaigns(db, course_ids=None) -> list[Coupon]`
    - Aktif site-wide kampanyaları getir
    - Tarih kontrolü
    - Priority sorting
    - Usage limit kontrolü
    - Course filtering: `course_ids` parametresi ile belirli kurslar için filtrele
      - `target_course_ids` null/empty ise tüm kurslarda geçerli
      - `target_course_ids` dolu ise sadece belirtilen kurslarda geçerli
  - `get_best_site_wide_campaign(db, cart_items, cart_total) -> Coupon | None`
    - En iyi site-wide kampanyayı getir (priority, discount amount)
    - Cart total kontrolü (min_cart_value)
    - **Cart items kontrolü**: Sepetteki kursların kampanyanın `target_course_ids` içinde olup olmadığını kontrol et
      - Eğer `target_course_ids` null/empty ise tüm kurslarda geçerli
      - Eğer `target_course_ids` dolu ise, sepet'teki en az bir kurs `target_course_ids` içinde olmalı
  - `apply_site_wide_campaign_to_cart(cart_items, db) -> dict`
    - Sepet'e otomatik site-wide kampanya uygula
    - En iyi kampanyayı seç
    - **Course matching**: Sepetteki kursları kampanyanın hedef kurslarıyla eşleştir
    - Discount hesapla (sadece eşleşen kurslara uygula)
    - Return: {applied_campaign, discount_amount, applicable_course_ids, total_discount}
  - `validate_site_wide_campaign(coupon, cart_items, cart_total) -> tuple[bool, str]`
    - Site-wide kampanya validasyonu
    - **Course validation**: 
      - `target_course_ids` null/empty ise tüm kurslarda geçerli (skip course check)
      - `target_course_ids` dolu ise, sepet'teki en az bir kurs `target_course_ids` içinde olmalı
    - Cart total kontrolü (min_cart_value, sadece eşleşen kursların toplamı)
    - Usage limit kontrolü
    - Date validation
  - `get_applicable_courses_for_campaign(coupon, cart_items) -> list[str]`
    - Kampanyanın sepet'teki hangi kurslarda geçerli olduğunu döndür
    - `target_course_ids` null/empty ise tüm kursları döndür
    - `target_course_ids` dolu ise sadece eşleşen kursları döndür

**Kabul Kriterleri:**
- ✅ Service functions oluşturuldu
- ✅ Site-wide campaign logic çalışıyor
- ✅ Auto-apply logic çalışıyor
- ✅ Priority sorting çalışıyor

---

### EP16-BE-03: Cart Service Güncelleme (Auto-Apply Site-Wide)
**Durum:** ⬜ Beklemede  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:** Cart service'e site-wide kampanya otomatik uygulama eklenecek. Belirli kurslarda geçerli olma kontrolü de eklenecek.

**Detaylar:**
- `backend/app/services/cart_service.py` dosyasını güncelle (veya oluştur)
- Functions:
  - `calculate_cart_total_with_site_wide(cart_items, db) -> dict`
    - Sepet toplamını hesapla
    - Site-wide kampanya uygula (if auto_apply)
    - **Course filtering**: Sadece kampanyanın hedef kurslarına discount uygula
    - Discount hesapla (sadece applicable courses için)
    - Return: {
        subtotal, 
        discount_amount, 
        total, 
        applied_campaign,
        applicable_course_ids,  # Kampanyanın geçerli olduğu kurs ID'leri
        discount_per_course     # Kurs başına discount breakdown (optional)
      }
  - `get_cart_with_discounts(user_id, db) -> dict`
    - Kullanıcının sepetini getir
    - Site-wide kampanya uygula
    - **Course-specific discount**: Her kurs için kampanyanın geçerli olup olmadığını belirle
    - Discount bilgilerini ekle
    - Return: {
        cart_items: [...],
        subtotal,
        discount_amount,
        total,
        applied_campaign,
        campaign_applicable_to: [...]  # Hangi kurslarda geçerli
      }
- Cart API endpoints güncelle:
  - `GET /api/v1/cart` - Site-wide kampanya bilgisi dahil (applicable courses bilgisi ile)
  - `POST /api/v1/cart/add` - Site-wide kampanya kontrolü (yeni eklenen kurs için)
  - `PUT /api/v1/cart/update` - Site-wide kampanya kontrolü (güncellenen kurs için)

**Kabul Kriterleri:**
- ✅ Cart service güncellendi
- ✅ Auto-apply logic çalışıyor
- ✅ Cart endpoints güncellendi
- ✅ Discount calculation çalışıyor

---

### EP16-BE-04: Order Service Güncelleme (Site-Wide Campaign)
**Durum:** ⬜ Beklemede  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 1.5 saat

**Açıklama:** Order service'e site-wide kampanya desteği eklenecek.

**Detaylar:**
- `backend/app/api/v1/endpoints/orders.py` dosyasını güncelle
- Order creation'da:
  - Site-wide kampanya kontrolü
  - CouponUsage kaydı (if site-wide campaign applied)
  - Discount amount hesaplama
- Functions:
  - `apply_site_wide_campaign_to_order(order_items, db) -> Coupon | None`
    - Sipariş için site-wide kampanya uygula
    - CouponUsage kaydı oluştur
    - Return applied campaign

**Kabul Kriterleri:**
- ✅ Order service güncellendi
- ✅ Site-wide campaign application çalışıyor
- ✅ CouponUsage kaydı oluşturuluyor

---

### EP16-BE-05: Coupon API Endpoints Güncelleme
**Durum:** ⬜ Beklemede  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2.5 saat

**Açıklama:** Coupon API endpoints'e site-wide kampanya desteği eklenecek. Belirli kurslarda geçerli olma desteği de eklenecek.

**Detaylar:**
- `backend/app/api/v1/endpoints/coupons.py` dosyasını güncelle
- Endpoints:
  - `GET /api/v1/admin/coupons` - Site-wide filter ekle
    - Query params: `trigger_type` (SITE_WIDE ekle)
    - Query params: `is_auto_apply` (boolean)
  - `POST /api/v1/admin/coupons` - Site-wide kampanya oluşturma
    - Request body: `trigger_type: "site_wide"`, `is_auto_apply: true`, `target_course_ids: [...]`
    - Validation: 
      - Site-wide için category_id null olmalı
      - `target_course_ids` null, empty array veya course ID array olmalı
      - `target_course_ids` içindeki kursların var olduğunu kontrol et
  - `PUT /api/v1/admin/coupons/{coupon_id}` - Site-wide kampanya güncelleme
    - Request body: `target_course_ids` güncellenebilir
    - Validation: Kurs ID'lerinin var olduğunu kontrol et
  - `GET /api/v1/public/coupons/active-site-wide` - Aktif site-wide kampanyalar
    - Auth: Public
    - Query params: `course_id` (optional, belirli bir kurs için filtrele)
    - Response: list[CouponResponse] (aktif site-wide kampanyalar, course_id varsa filtrele)
  - `GET /api/v1/cart/active-campaign` - Sepet için aktif kampanya
    - Auth: User
    - Response: {
        campaign: CouponResponse | null,
        applicable_course_ids: list[str],  # Hangi kurslarda geçerli
        discount_breakdown: dict  # Kurs başına discount (optional)
      }

**Kabul Kriterleri:**
- ✅ Coupon endpoints güncellendi
- ✅ Site-wide filter çalışıyor
- ✅ Public endpoint çalışıyor
- ✅ Cart campaign endpoint çalışıyor

---

### EP16-BE-06: Coupon Schemas Güncelleme
**Durum:** ⬜ Beklemede  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1.5 saat

**Açıklama:** Coupon schemas'a site-wide kampanya alanları eklenecek. Belirli kurslarda geçerli olma alanı da eklenecek.

**Detaylar:**
- `backend/app/schemas/coupon.py` dosyasını güncelle
- Schemas:
  - `CouponBase`: Yeni alanlar ekle
    - `is_auto_apply`: bool (default=False)
    - `auto_apply_priority`: int (default=0)
    - `campaign_name`: str | None
    - `campaign_description`: str | None
    - `target_course_ids`: list[str] | None - Hedef kurs ID'leri (site-wide kampanyalar için)
      - Empty list veya None = tüm kurslarda geçerli
      - Dolu list = sadece belirtilen kurslarda geçerli
  - `CouponResponse`: Response'a ekle
    - `target_course_ids`: list[str] | None
    - `target_courses`: list[CourseSummary] | None (optional, kurs detayları ile)
- Validations:
  - `is_auto_apply` = True ise `trigger_type` = "site_wide" olmalı
  - `auto_apply_priority` >= 0
  - `campaign_name`: max_length=255
  - `target_course_ids`: 
    - List of UUID strings olmalı
    - Her ID valid UUID formatında olmalı
    - Site-wide için category_id null olmalı
- Helper functions:
  - `validate_site_wide_coupon(coupon_data: dict) -> tuple[bool, str]`
  - `validate_target_course_ids(course_ids: list[str], db) -> tuple[bool, list[str]]`
    - Kurs ID'lerinin var olduğunu kontrol et
    - Geçersiz ID'leri döndür

**Kabul Kriterleri:**
- ✅ Schemas güncellendi
- ✅ Validations eklendi
- ✅ Helper functions eklendi

---

## 🎨 FRONTEND TASKS

### EP16-FE-01: Coupon API Client Güncelleme
**Durum:** ⬜ Beklemede  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 1 saat

**Açıklama:** Frontend coupon API client'a site-wide kampanya desteği eklenecek.

**Detaylar:**
- `frontend/src/lib/api.ts` dosyasını güncelle
- API functions:
  - `couponsApi.getActiveSiteWide()` - Aktif site-wide kampanyalar
  - `couponsApi.getCartActiveCampaign()` - Sepet için aktif kampanya
- TypeScript interfaces:
  - `Coupon` interface'ine yeni alanlar ekle:
    - `is_auto_apply?: boolean`
    - `auto_apply_priority?: number`
    - `campaign_name?: string`
    - `campaign_description?: string`

**Kabul Kriterleri:**
- ✅ API client güncellendi
- ✅ TypeScript types güncellendi

---

### EP16-FE-02: Coupon Management Page Güncelleme (Admin)
**Durum:** ⬜ Beklemede  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 2 saat

**Açıklama:** Admin coupon management sayfasına site-wide kampanya desteği eklenecek.

**Detaylar:**
- `frontend/src/app/(dashboard)/dashboard/admin/coupons/page.tsx` dosyasını güncelle
- Features:
  - Trigger Type filter'a "Site-Wide" ekle
  - Site-wide kampanyalar için özel gösterim (badge, icon)
  - Site-wide kampanya oluşturma butonu
  - Auto-apply toggle gösterimi
- Filters:
  - `trigger_type: "site_wide"` filter
  - `is_auto_apply` filter

**Kabul Kriterleri:**
- ✅ Management page güncellendi
- ✅ Site-wide filter çalışıyor
- ✅ UI güncellemeleri yapıldı

---

### EP16-FE-03: Coupon Form Component Güncelleme
**Durum:** ⬜ Beklemede  
**Öncelik:** 🟠 ORTA  
**Tahmini Süre:** 3 saat

**Açıklama:** Coupon form component'ine site-wide kampanya alanları eklenecek. Belirli kurslarda geçerli olma seçimi de eklenecek.

**Detaylar:**
- `frontend/src/components/admin/CouponForm.tsx` component'ini güncelle (veya oluştur)
- Form fields:
  - Trigger Type (select) - "Site-Wide" seçeneği ekle
  - Is Auto-Apply (checkbox, trigger_type="site_wide" ise göster)
  - Auto-Apply Priority (number input, is_auto_apply=true ise göster)
  - Campaign Name (text input, site-wide için)
  - Campaign Description (textarea, site-wide için)
  - **Target Courses (multi-select, site-wide için)**
    - Tüm kursları listele (searchable dropdown veya multi-select)
    - "Tüm Kurslarda Geçerli" seçeneği (default, target_course_ids = null/empty)
    - "Belirli Kurslarda Geçerli" seçeneği (target_course_ids dolu)
    - Kurs seçimi: Searchable multi-select component
    - Seçili kurslar: Chips/tags olarak göster
    - Kurs bilgileri: Kurs adı, fiyat, kategori (dropdown'da göster)
- Conditional logic:
  - Trigger Type = "Site-Wide" ise:
    - Category seçimi gizle
    - Is Auto-Apply göster
    - Campaign Name/Description göster
    - **Target Courses seçimi göster**
  - Is Auto-Apply = true ise:
    - Auto-Apply Priority göster
  - Target Courses:
    - "Tüm Kurslarda Geçerli" seçili ise: Kurs seçimi gizle
    - "Belirli Kurslarda Geçerli" seçili ise: Kurs seçimi göster
- Form validation:
  - Site-wide için category_id null olmalı
  - Auto-apply için priority >= 0
  - Target courses: En az 1 kurs seçilmeli (eğer "Belirli Kurslarda Geçerli" seçili ise)
- UI Components:
  - Multi-select dropdown (React Select veya custom)
  - Course search/filter
  - Selected courses display (chips)

**Kabul Kriterleri:**
- ✅ Form component güncellendi
- ✅ Conditional fields çalışıyor
- ✅ Form validation çalışıyor

---

### EP16-FE-04: Cart Page Site-Wide Campaign Display
**Durum:** ⬜ Beklemede  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 2.5 saat

**Açıklama:** Cart sayfasına site-wide kampanya gösterimi eklenecek. Belirli kurslarda geçerli olma bilgisi de gösterilecek.

**Detaylar:**
- `frontend/src/app/cart/page.tsx` dosyasını güncelle
- Features:
  - Aktif site-wide kampanya gösterimi (banner/card)
  - Kampanya bilgileri (discount, description)
  - **Kampanya geçerliliği bilgisi:**
    - "Tüm Kurslarda Geçerli" veya "Şu Kurslarda Geçerli: [kurs listesi]"
    - Sepet'teki hangi kurslara uygulandığı gösterimi
  - Otomatik uygulanmış kampanya gösterimi
  - Discount breakdown:
    - Subtotal
    - Discount (kampanya indirimi)
    - **Discount per course** (hangi kursa ne kadar indirim uygulandı, optional)
    - Total
  - **Kurs bazlı gösterim:**
    - Her cart item'da kampanyanın geçerli olup olmadığı badge/icon
    - Geçerli kurslarda "Kampanyaya Dahil" badge'i
- Layout:
  - Kampanya banner (top of cart)
    - Kampanya adı, açıklama
    - Geçerli olduğu kurslar listesi (if applicable)
  - Discount info (cart summary'de)
    - Discount amount
    - Applicable courses count
  - Cart items:
    - Her item'da kampanya badge (if applicable)
- API integration:
  - `getCartActiveCampaign()` - Aktif kampanyayı getir (applicable_course_ids ile)
  - Cart total calculation'da kampanya discount'ı dahil et
  - Cart items'ı kampanyanın geçerli olduğu kurslarla eşleştir

**Kabul Kriterleri:**
- ✅ Cart page güncellendi
- ✅ Campaign display çalışıyor
- ✅ Discount calculation çalışıyor

---

### EP16-FE-05: Homepage Site-Wide Campaign Banner
**Durum:** ⬜ Beklemede  
**Öncelik:** 🟡 DÜŞÜK  
**Tahmini Süre:** 1.5 saat

**Açıklama:** Ana sayfaya site-wide kampanya banner'ı eklenecek.

**Detaylar:**
- `frontend/src/app/page.tsx` dosyasını güncelle
- Features:
  - Aktif site-wide kampanya banner (top of page)
  - Kampanya bilgileri (title, description, discount)
  - "Sepete Git" veya "Kampanyayı Gör" butonu
  - Auto-dismiss (optional, after X seconds)
- Component:
  - `SiteWideCampaignBanner.tsx` component oluştur
  - API'den aktif kampanyayı getir
  - Conditional rendering (if active campaign exists)

**Kabul Kriterleri:**
- ✅ Homepage banner eklendi
- ✅ Campaign banner component oluşturuldu
- ✅ Conditional rendering çalışıyor

---

## 📝 EK NOTLAR

### Site-Wide Campaign Logic
1. **Auto-Apply:**
   - Sepet'e ürün eklendiğinde otomatik kontrol
   - En yüksek priority'li aktif kampanya seçilir
   - **Course Matching:**
     - `target_course_ids` null/empty ise: Tüm kurslarda geçerli
     - `target_course_ids` dolu ise: Sadece sepet'teki eşleşen kurslarda geçerli
   - Cart total >= min_cart_value kontrolü (sadece eşleşen kursların toplamı)
   - Usage limit kontrolü
   - Discount otomatik uygulanır (sadece eşleşen kurslara)

2. **Priority:**
   - Birden fazla site-wide kampanya varsa
   - En yüksek priority'li uygulanır
   - Aynı priority'de ise en yüksek discount uygulanır
   - **Course overlap:** Birden fazla kampanya eşleşirse, en iyi olanı seç

3. **Target Courses:**
   - `target_course_ids` null veya empty array = Tüm kurslarda geçerli
   - `target_course_ids` dolu array = Sadece belirtilen kurslarda geçerli
   - Sepet'teki kurslar `target_course_ids` ile eşleşmeli
   - En az bir kurs eşleşmeli (kampanyanın uygulanabilmesi için)

4. **Validation:**
   - Site-wide kampanya için category_id null olmalı
   - Auto-apply için trigger_type = "site_wide" olmalı
   - Cart total >= min_cart_value olmalı (eşleşen kursların toplamı)
   - `target_course_ids` içindeki kursların var olduğu kontrol edilmeli

### Cart Integration
- Cart service'de site-wide kampanya kontrolü
- Cart total calculation'da discount dahil
- Cart API response'unda applied_campaign bilgisi

### Order Integration
- Order creation'da site-wide kampanya uygulanır
- CouponUsage kaydı oluşturulur
- Discount amount order'a eklenir

---

_Bu KANBAN planı EPIC-11, EPIC-12, EPIC-BLOG, EPIC-ADS, EPIC-POPUP ve EPIC-COUPON-SITE-WIDE için detaylı task breakdown içermektedir. Her task bağımsız olarak implement edilebilir._

_Son güncelleme: 2026-02-11_
