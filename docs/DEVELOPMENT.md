# BiHocam - Geliştirme Dokümanı

Bu doküman, BiHocam projesinin teknik mimarisi, geliştirme süreçleri ve önemli kuralları içerir.

## İçindekiler

1. [Proje Yapısı](#proje-yapısı)
2. [Backend Mimarisi](#backend-mimarisi)
3. [Frontend Mimarisi](#frontend-mimarisi)
4. [Yetkilendirme ve Güvenlik](#yetkilendirme-ve-güvenlik)
5. [API Endpoint'leri](#api-endpointleri)
6. [Veritabanı Modelleri](#veritabanı-modelleri)
7. [Test Stratejisi](#test-stratejisi)
8. [Development Workflow](#development-workflow)
9. [Yaygın Buglar ve Çözümleri](#yaygın-buglar-ve-çözümleri)

---

## Proje Yapısı

```
BiHocam/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/v1/endpoints/  # API endpoint'leri
│   │   ├── core/               # Config, security
│   │   ├── db/                 # Database session, base
│   │   ├── models/             # SQLAlchemy modelleri
│   │   ├── schemas/            # Pydantic şemaları
│   │   └── services/           # Business logic
│   ├── alembic/                # Database migrations
│   ├── tests/                  # Backend testleri
│   └── scripts/                # Utility scriptleri
├── frontend/            # Next.js frontend
│   └── src/
│       ├── app/                 # Next.js App Router pages
│       ├── components/          # React componentleri
│       ├── lib/                 # API client, store
│       └── types/               # TypeScript type'ları
└── docs/                # Dokümantasyon
```

---

## Backend Mimarisi

### Teknoloji Stack

- **Framework**: FastAPI
- **ORM**: SQLAlchemy (Async)
- **Database**: PostgreSQL
- **Migrations**: Alembic
- **Authentication**: JWT (OAuth2)
- **Validation**: Pydantic

### Proje Yapısı

#### API Endpoint'leri (`app/api/v1/endpoints/`)

Her endpoint dosyası belirli bir domain'e aittir:

- `auth.py` - Kimlik doğrulama (login, register, me)
- `courses.py` - Kurs yönetimi
- `enrollments.py` - Kurs kayıtları
- `lesson_progress.py` - Ders ilerleme takibi
- `course_reviews.py` - Kurs yorumları
- `cart.py` - Sepet işlemleri
- `orders.py` - Sipariş yönetimi
- `quizzes.py` - Quiz sistemi
- `teachers.py` - Eğitmen profilleri
- `users.py` - Kullanıcı yönetimi (admin)
- `coupons.py` - Kupon yönetimi

#### Modeller (`app/models/`)

SQLAlchemy ORM modelleri:

- `user.py` - Kullanıcılar (Student, Teacher, Admin, etc.)
- `course.py` - Kurslar ve Dersler
- `order.py` - Siparişler ve Kayıtlar (Enrollments)
- `cart.py` - Sepet öğeleri
- `course_review.py` - Kurs yorumları
- `lesson_progress.py` - Ders ilerleme kayıtları
- `quiz.py` - Quiz'ler ve denemeler
- `coupon.py` - Kuponlar

#### Şemalar (`app/schemas/`)

Pydantic validation şemaları:

- Request/Response modelleri
- API validation kuralları
- Type safety

---

## Frontend Mimarisi

### Teknoloji Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

### Proje Yapısı

#### Sayfalar (`src/app/`)

Next.js App Router yapısı:

```
app/
├── (auth)/              # Auth layout
│   ├── login/
│   └── register/
├── (dashboard)/         # Dashboard layout
│   └── dashboard/
│       ├── courses/     # Öğrenci: Kayıtlı kurslar
│       ├── my-courses/  # Öğretmen: Kendi kursları
│       ├── orders/
│       └── settings/
├── courses/             # Public kurs sayfaları
│   └── [slug]/
├── teachers/            # Eğitmen profilleri
│   └── [teacherId]/
└── cart/                # Sepet sayfası
```

#### Componentler (`src/components/`)

- `Header.tsx` - Ana navigasyon
- `Footer.tsx` - Footer
- `ui/` - Reusable UI componentleri

#### State Management (`src/lib/`)

- `store.ts` - Zustand store (auth, UI state)
- `api.ts` - Axios client ve API fonksiyonları
- `providers.tsx` - React Query provider

---

## Yetkilendirme ve Güvenlik

### Kullanıcı Rolleri

```python
class UserRole(str, enum.Enum):
    ADMIN = "admin"           # Platform yöneticisi
    STAFF = "staff"           # Platform çalışanı
    ORGANIZATION = "organization"  # Kurumsal kullanıcı
    TEACHER = "teacher"       # Eğitmen
    STUDENT = "student"       # Öğrenci
```

### Yetkilendirme Kuralları

#### 1. Kurs Erişimi

- **Public Endpoint'ler**:
  - `GET /courses/` - Sadece `PUBLISHED` kurslar listelenir
  - `GET /courses/slug/{slug}` - Sadece `PUBLISHED` kurslar görüntülenir
  - `GET /courses/{course_id}` - Sadece `PUBLISHED` kurslar veya owner/admin

- **Private Endpoint'ler**:
  - `GET /courses/me` - Sadece Teacher/Admin (kendi kursları)
  - `POST /courses/` - Sadece Teacher/Admin/Organization
  - `PATCH /courses/{course_id}` - Sadece course owner veya Admin

#### 2. Ders Erişimi

- **Public**: Sadece `is_preview=true` dersler
- **Enrolled**: Tüm dersler (kayıtlı öğrenciler)
- **Owner/Admin**: Tüm dersler (kurs sahibi veya admin)

#### 3. Quiz Erişimi

- Quiz detayı: Sadece enrolled öğrenciler veya course owner
- Quiz attempt: Sadece enrolled öğrenciler

#### 4. Yorum Erişimi

- Yorum listesi: Public (sadece `is_approved=true`)
- Yorum oluşturma: **Sadece enrolled öğrenciler**

#### 5. Sepet ve Sipariş

- Sepete ekleme: Sadece `PUBLISHED` kurslar
- Sipariş görüntüleme: Sadece kendi siparişleri

### Dependency Injection Pattern

```python
# Auth dependency
from app.api.v1.endpoints.auth import get_current_user

# Role-based dependencies
def require_teacher_or_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Öğretmen veya admin yetkisi gerekli")
    return current_user

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user
```

---

## API Endpoint'leri

### Authentication

```
POST   /api/v1/auth/register     # Kullanıcı kaydı
POST   /api/v1/auth/login         # Giriş (OAuth2)
GET    /api/v1/auth/me            # Mevcut kullanıcı bilgisi
```

### Courses

```
GET    /api/v1/courses/                    # Public: Yayınlanmış kurslar
GET    /api/v1/courses/me                   # Teacher: Kendi kursları
GET    /api/v1/courses/slug/{slug}           # Public: Kurs detay (slug)
GET    /api/v1/courses/{course_id}           # Public/Owner: Kurs detay
POST   /api/v1/courses/                     # Teacher: Kurs oluştur
PATCH  /api/v1/courses/{course_id}           # Owner/Admin: Kurs güncelle
GET    /api/v1/courses/{course_id}/lessons   # Public/Enrolled: Ders listesi
GET    /api/v1/courses/{course_id}/lessons/{lesson_id}  # Enrolled/Owner: Ders detay
POST   /api/v1/courses/{course_id}/lessons   # Owner: Ders ekle
GET    /api/v1/courses/{course_id}/similar   # Public: Benzer kurslar
```

### Enrollments

```
GET    /api/v1/enrollments/me                # Kullanıcının kayıtlı kursları
```

### Lesson Progress

```
GET    /api/v1/courses/{course_id}/lessons/{lesson_id}/progress  # İlerleme getir
POST   /api/v1/courses/{course_id}/lessons/{lesson_id}/progress  # İlerleme kaydet
```

### Course Reviews

```
GET    /api/v1/courses/{course_id}/reviews        # Public: Onaylanmış yorumlar
GET    /api/v1/courses/{course_id}/reviews/stats # Public: Yorum istatistikleri
POST   /api/v1/courses/{course_id}/reviews       # Enrolled: Yorum oluştur
GET    /api/v1/courses/{course_id}/reviews/me    # Kullanıcının yorumu
```

### Cart

```
GET    /api/v1/cart/              # Sepet listesi
POST   /api/v1/cart/              # Sepete ekle (sadece PUBLISHED)
DELETE /api/v1/cart/{item_id}     # Sepetten çıkar
DELETE /api/v1/cart/              # Sepeti temizle
```

### Orders

```
POST   /api/v1/orders/                    # Sipariş oluştur
GET    /api/v1/orders/                     # Kullanıcının siparişleri
GET    /api/v1/orders/{order_id}            # Sipariş detayı
PATCH  /api/v1/orders/{order_id}/complete  # Siparişi tamamla (ödeme sonrası)
```

### Quizzes

```
POST   /api/v1/quizzes/                    # Teacher: Quiz oluştur
GET    /api/v1/quizzes/{quiz_id}            # Enrolled/Owner: Quiz detay
POST   /api/v1/quizzes/{quiz_id}/questions # Owner: Soru ekle
POST   /api/v1/quizzes/{quiz_id}/attempt    # Enrolled: Deneme başlat
POST   /api/v1/quizzes/attempts/{attempt_id}/submit  # Enrolled: Deneme gönder
GET    /api/v1/quizzes/attempts/{attempt_id}          # Owner: Deneme detayı
```

### Teachers

```
GET    /api/v1/teachers/           # Public: Aktif öğretmenler
GET    /api/v1/teachers/{teacher_id}  # Public: Öğretmen profili ve kursları
```

---

## Veritabanı Modelleri

### Önemli İlişkiler

```
User (1) ──< (N) Course (teacher_id)
User (1) ──< (N) Enrollment
Course (1) ──< (N) Enrollment
Course (1) ──< (N) Lesson
Course (1) ──< (N) CourseReview
Lesson (1) ──< (1) Quiz
Enrollment (1) ──< (N) LessonProgress
```

### Kritik Alanlar

#### Course

- `status`: `DRAFT`, `PUBLISHED`, `ARCHIVED`
- `teacher_id`: Kurs sahibi
- Sadece `PUBLISHED` kurslar public görünür

#### Enrollment

- `user_id` + `course_id`: Unique constraint
- `progress_percentage`: 0-100 (otomatik hesaplanır)
- `completed_at`: Kurs tamamlandığında set edilir

#### Lesson

- `is_preview`: Public erişim için
- `order`: Sıralama

#### CourseReview

- `is_approved`: Admin onayı gerekir
- `enrollment_id`: Yorum yapan öğrencinin enrollment'ı

---

## Test Stratejisi

### Backend Testleri

**Konum**: `backend/tests/`

**Test Dosyaları**:
- `test_courses.py` - Kurs endpoint testleri
- `test_enrollments.py` - Kayıt testleri
- `test_lesson_progress.py` - İlerleme testleri
- `test_course_reviews.py` - Yorum testleri
- `test_auth.py` - Kimlik doğrulama testleri

**Test Fixtures** (`conftest.py`):
- `test_user` - Student kullanıcı
- `test_teacher` - Teacher kullanıcı
- `test_admin` - Admin kullanıcı
- `auth_headers_student` - Student auth token
- `auth_headers_teacher` - Teacher auth token
- `auth_headers_admin` - Admin auth token

**Çalıştırma**:
```bash
cd backend
.\venv\Scripts\python.exe -m pytest -v
```

### Frontend Testleri

**Konum**: `frontend/src/__tests__/`

**Test Framework**: Jest + React Testing Library

**Çalıştırma**:
```bash
cd frontend
npm test
```

---

## Development Workflow

### 1. Local Setup

```bash
# Backend
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Database migration
alembic upgrade head

# Seed data
python scripts/seed_mock_data.py

# Run server
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### 2. Yeni Feature Geliştirme

1. **Branch oluştur**: `git checkout -b feature/yeni-ozellik`
2. **Backend**:
   - Model ekle/güncelle (`app/models/`)
   - Schema ekle (`app/schemas/`)
   - Endpoint ekle (`app/api/v1/endpoints/`)
   - Migration oluştur: `alembic revision --autogenerate -m "description"`
   - Test yaz (`backend/tests/`)
3. **Frontend**:
   - Page/Component ekle (`src/app/`, `src/components/`)
   - API client güncelle (`src/lib/api.ts`)
   - Test yaz (`src/__tests__/`)
4. **Test et**: Backend ve frontend testlerini çalıştır
5. **Commit**: `git commit -m "feat: yeni özellik eklendi"`

### 3. Database Migration

```bash
# Yeni migration oluştur
alembic revision --autogenerate -m "migration_description"

# Migration'ı uygula
alembic upgrade head

# Migration'ı geri al
alembic downgrade -1
```

### 4. Environment Variables

**Backend** (`.env`):
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/bihocam
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Yaygın Buglar ve Çözümleri

### 1. **Enrollment Kontrolü Eksik**

**Problem**: Quiz, review, lesson progress gibi endpoint'lerde enrollment kontrolü yapılmıyor.

**Çözüm**: Her endpoint'te enrollment kontrolü ekle:

```python
enrollment_result = await db.execute(
    select(Enrollment).where(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    )
)
enrollment = enrollment_result.scalar_one_or_none()
if not enrollment:
    raise HTTPException(status_code=403, detail="Bu kursa kayıtlı değilsiniz")
```

### 2. **Draft Kurslar Public Görünüyor**

**Problem**: `GET /courses/{course_id}` endpoint'i draft kursları da döndürüyor.

**Çözüm**: Status kontrolü ekle:

```python
if course.status != CourseStatus.PUBLISHED:
    # Owner veya admin değilse 404
    if not _is_course_owner_or_admin(course, current_user):
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
```

### 3. **Frontend Teacher Link Yanlış**

**Problem**: `/users/{id}/profile` linki çalışmıyor.

**Çözüm**: `/teachers/{teacherId}` kullan.

### 4. **Sepete Draft Kurs Eklenebiliyor**

**Problem**: `POST /cart/` endpoint'i draft kursları da kabul ediyor.

**Çözüm**: Status kontrolü ekle:

```python
if course.status != CourseStatus.PUBLISHED:
    raise HTTPException(status_code=400, detail="Bu kurs henüz yayınlanmamış")
```

### 5. **Review Oluşturma Enrollment Kontrolü Yorum Satırında**

**Problem**: `create_course_review` fonksiyonunda enrollment kontrolü yorum satırında.

**Çözüm**: Kontrolü aktif et:

```python
if not enrollment:
    raise HTTPException(status_code=403, detail="Bu kursa kayıtlı değilsiniz")
```

### 6. **Quiz Detayı Public Erişilebilir**

**Problem**: `GET /quizzes/{quiz_id}` endpoint'i herkese açık.

**Çözüm**: Enrollment veya ownership kontrolü ekle.

---

## Güvenlik Best Practices

1. **Her zaman authentication kontrolü yap**: `Depends(get_current_user)`
2. **Role-based access control**: `require_teacher_or_admin`, `require_admin`
3. **Ownership kontrolü**: Course owner veya admin kontrolü
4. **Enrollment kontrolü**: Quiz, review, progress için
5. **Status kontrolü**: Sadece `PUBLISHED` kurslar public
6. **Input validation**: Pydantic şemaları kullan
7. **SQL Injection**: SQLAlchemy ORM kullan (raw SQL'den kaçın)
8. **XSS**: React otomatik escape yapar, ama dikkatli ol

---

## API Response Formatları

### Başarılı Response

```json
{
  "id": "uuid",
  "title": "Kurs Başlığı",
  ...
}
```

### Hata Response

```json
{
  "detail": "Hata mesajı"
}
```

veya

```json
{
  "detail": {
    "code": "ERROR_CODE",
    "message": "Kullanıcı dostu mesaj"
  }
}
```

### HTTP Status Kodları

- `200` - Başarılı
- `201` - Oluşturuldu
- `400` - Bad Request (validation hatası)
- `401` - Unauthorized (authentication gerekli)
- `403` - Forbidden (yetki yok)
- `404` - Not Found
- `500` - Internal Server Error

---

## Önemli Notlar

1. **Async/Await**: Tüm database işlemleri async olmalı
2. **Transaction**: Kritik işlemlerde transaction kullan
3. **Error Handling**: Her endpoint'te uygun error handling
4. **Logging**: Önemli işlemlerde logging ekle
5. **Documentation**: Endpoint'lerde docstring kullan
6. **Type Safety**: TypeScript ve Pydantic kullan
7. **Testing**: Her yeni feature için test yaz

---

## İletişim ve Destek

Sorularınız için:
- GitHub Issues
- Team dokümantasyonu: `docs/team/`

---

**Son Güncelleme**: 2024
