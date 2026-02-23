# BiHocam - Kapsamli SAAS Urun Dokumantasyonu

## Icerik

1. [Urun Tanimi](#1-urun-tanimi)
2. [Hedef Kitle ve Kullanici Personlari](#2-hedef-kitle-ve-kullanici-personlari)
3. [Teknik Mimari](#3-teknik-mimari)
4. [Mevcut Ozellikler (Tamamlanan)](#4-mevcut-ozellikler-tamamlanan)
5. [Gelistirilecek Ozellikler (Roadmap)](#5-gelistirilecek-ozellikler-roadmap)
6. [Is Modeli ve Gelir Akislari](#6-is-modeli-ve-gelir-akislari)
7. [Rekabet Analizi ve Pazar Firsatlari](#7-rekabet-analizi-ve-pazar-firsatlari)
8. [Teknik Detaylar](#8-teknik-detaylar)
9. [API Referansi](#9-api-referansi)
10. [Veritabani Semasi](#10-veritabani-semasi)
11. [Guvenlik ve Uyumluluk](#11-guvenlik-ve-uyumluluk)
12. [Olceklendirme Stratejisi](#12-olceklendirme-stratejisi)

---

## 1. Urun Tanimi

### 1.1 BiHocam Nedir?

**BiHocam**, Turkiye'nin egitim sektorune odaklanan, yapay zeka destekli, kapsamli bir cevrimici ogrenme platformudur (LMS - Learning Management System). Platform, ozellikle YKS, LGS ve diger sinav hazirlik sureclerinde ogrencilere, egitmenlere ve kurumlara hizmet vermek uzere tasarlanmistir.

### 1.2 Vizyon

> "Turkiye'nin en kapsamli ve teknoloji odakli egitim platformu olarak, her ogrencinin potansiyeline ulasmasini saglamak."

### 1.3 Misyon

- Kaliteli egitimi herkes icin erisilebilir kilmak
- Yapay zeka ile kisisellestirilmis ogrenme deneyimi sunmak
- Egitmenlere gelir elde etme ve kitlelerine ulasma firsati sunmak
- Kurumlara markalastirilmis egitim portalleri saglamak

### 1.4 Temel Deger Onerileri

| Hedef Kitle | Deger Onerisi |
|-------------|---------------|
| **Ogrenciler** | 7/24 AI destekli asistan, kisisel ogrenme plani, sertifika sistemi |
| **Egitmenler** | Kolay kurs olusturma, gelir paylasimi, ogrenci analitikleri |
| **Kurumlar** | White-label portal, merkezi yonetim, ozel icerik |
| **Veliler** | Cocuklarin ilerlemesini takip, bildirim sistemi |

---

## 2. Hedef Kitle ve Kullanici Personlari

### 2.1 Birincil Kullanicilar

#### 2.1.1 Ogrenci (Student)
- **Yas Araligi**: 14-25
- **Ihtiyaclar**: Sinav hazirligi, ders tekrari, pratik sorular
- **Davranis**: Mobil agirlikli, sosyal medya kullanicisi
- **Beklentiler**: Hizli erisim, interaktif icerik, oyunlastirma

#### 2.1.2 Egitmen (Teacher)
- **Profil**: Ozel ders ogretmenleri, dershane hocalari, akademisyenler
- **Ihtiyaclar**: Gelir elde etme, ogrencilere ulasma, icerik yonetimi
- **Beklentiler**: Duzenli odeme, detayli analitikler, kolay kurs olusturma

#### 2.1.3 Kurum (Organization)
- **Profil**: Ozel okullar, dershaneler, sirket egitim departmanlari
- **Ihtiyaclar**: Merkezi yonetim, marka kimligi, raporlama
- **Beklentiler**: White-label cozum, bulk kullanici yonetimi, API entegrasyonu

### 2.2 Rol Tabanli Erisim Kontrolu (RBAC)

```
ADMIN
  |-- Tam sistem erisimi
  |-- Kullanici yonetimi
  |-- Platform ayarlari
  |-- Finansal islemler

STAFF
  |-- Marketing erisimi
  |-- Destek islemleri
  |-- Icerik moderasyonu

ORGANIZATION
  |-- Kendi portal yonetimi
  |-- Uye yonetimi
  |-- Ozel icerik

TEACHER
  |-- Kurs olusturma/duzenleme
  |-- Ogrenci takibi
  |-- Kazanc goruntuleme

STUDENT
  |-- Kurs satin alma/izleme
  |-- Quiz cozme
  |-- Sertifika alma
```

---

## 3. Teknik Mimari

### 3.1 Teknoloji Stack

#### Frontend
| Teknoloji | Amac | Versiyon |
|-----------|------|----------|
| Next.js | App Router, Server Actions | 14/15 |
| React | UI Framework | 18+ |
| TypeScript | Type Safety | 5.x |
| Tailwind CSS | Styling | 3.x |
| Framer Motion | Animasyonlar | - |
| React Query | Server State | v5 |
| Zustand | Client State | - |

#### Backend
| Teknoloji | Amac | Versiyon |
|-----------|------|----------|
| FastAPI | API Framework | 0.100+ |
| PostgreSQL | Veritabani | 15+ |
| SQLAlchemy | ORM (Async) | 2.0+ |
| Alembic | Migrations | - |
| JWT/OAuth2 | Authentication | - |
| Pydantic | Validation | v2 |

#### Altyapi (Planlanan)
| Teknoloji | Amac |
|-----------|------|
| AWS S3 / GCS | Dosya depolama |
| Redis | Caching, Real-time |
| Celery/Arq | Background Jobs |
| Docker | Containerization |
| Kubernetes | Orchestration |

### 3.2 Mimari Diyagram

```
                    [CDN/Cloudflare]
                          |
                    [Load Balancer]
                     /         \
          [Next.js Pod 1]  [Next.js Pod 2]
                     \         /
                    [API Gateway]
                          |
                    [FastAPI Pods]
                    /     |     \
            [PostgreSQL] [Redis] [S3]
                    \     |     /
                [Background Workers]
```

---

## 4. Mevcut Ozellikler (Tamamlanan)

### 4.1 Kimlik Dogrulama Sistemi

#### 4.1.1 Kullanici Kayit ve Giris
- **Email/Sifre ile kayit**
- **JWT Token tabanli kimlik dogrulama**
- **Access Token** (kisa sureli) + **Refresh Token** (uzun sureli)
- **Demo hesaplar** (Admin, Ogretmen, Ogrenci)

```typescript
// Frontend API Kullanimi
const tokens = await authApi.login(email, password);
localStorage.setItem("access_token", tokens.access_token);
const user = await authApi.getMe();
```

#### 4.1.2 Rol Tabanli Erisim
- 5 farkli rol: ADMIN, STAFF, ORGANIZATION, TEACHER, STUDENT
- Endpoint bazinda yetkilendirme
- Middleware ile guvenlik kontrolu

### 4.2 Kurs Yonetim Sistemi

#### 4.2.1 Kurs CRUD Islemleri
- **Olusturma**: 5 adimli wizard arayuzu
  1. Temel Bilgiler (Baslik, Slug, Aciklama, SEO)
  2. Medya (Thumbnail, Demo Video)
  3. Icerik (Ders listesi)
  4. Fiyatlandirma
  5. Sertifika

- **Kurs Durumlari**:
  - `DRAFT`: Taslak (sadece sahibi gorebilir)
  - `PUBLISHED`: Yayinda (herkes gorebilir)
  - `ARCHIVED`: Arsivlenmis

#### 4.2.2 Ders Yonetimi
- **Ders Tipleri**:
  - `VIDEO`: Video icerik (YouTube, Vimeo, yerel)
  - `PDF`: PDF dokumanlar
  - `QUIZ`: Interaktif quizler

- **Onizleme Sistemi**: `is_preview` ile ucretsiz ders paylasimlari

```python
# Backend Model
class Lesson(Base):
    id: str
    title: str
    lesson_type: LessonType  # VIDEO, PDF, QUIZ
    content_path: str | None  # Yerel dosya
    video_url: str | None     # YouTube/Vimeo
    duration_seconds: int | None
    is_preview: bool = False
    order: int
```

### 4.3 Quiz Sistemi

#### 4.3.1 Soru Tipleri
- **Coktan Secmeli** (Multiple Choice)
- **Dogru/Yanlis** (True/False)
- **Kisa Cevap** (Short Answer)

#### 4.3.2 Quiz Ozellikleri
- Gecme notu belirleme (varsayilan %70)
- Zaman limiti
- Maksimum deneme sayisi
- Soru karistirma
- Dogru cevaplari gosterme

```python
class Quiz(Base):
    passing_score: int = 70
    time_limit_minutes: int | None
    max_attempts: int | None
    shuffle_questions: bool = False
    show_correct_answers: bool = True
```

#### 4.3.3 Quiz Deneme Akisi
1. `POST /quizzes/{quiz_id}/attempt` - Deneme baslat
2. `POST /quizzes/attempts/{attempt_id}/submit` - Cevaplari gonder
3. Otomatik puanlama ve sonuc

### 4.4 E-Ticaret Modulu

#### 4.4.1 Sepet Sistemi
- Kursu sepete ekleme
- Sepetten cikarma
- Sepet temizleme
- Fiyat kontrolu (indirimli fiyat varsa onu kullanma)

#### 4.4.2 Siparis Sistemi
- **Siparis Durumlari**:
  - `PENDING`: Odeme bekleniyor
  - `PAID`: Odendi
  - `FAILED`: Basarisiz
  - `REFUNDED`: Iade edildi
  - `CANCELLED`: Iptal

- **Odeme Yontemleri**:
  - Kredi Karti
  - EFT/Havale
  - Manuel

#### 4.4.3 Komisyon Sistemi
```python
# Platform komisyon orani: %35
def calculate_commission(course_price, commission_rate=0.35):
    platform_commission = course_price * commission_rate
    teacher_earnings = course_price - platform_commission
    return platform_commission, teacher_earnings
```

#### 4.4.4 Kupon Sistemi
- **Kupon Tipleri**:
  - `PERCENTAGE`: Yuzde indirim
  - `FIXED`: Sabit tutar

- **Tetikleyici Tipler**:
  - `FIRST_PURCHASE`: Ilk alisveris
  - `CART_VALUE`: Sepet tutarina gore
  - `CATEGORY`: Kategoriye ozel
  - `MANUAL`: Manuel kullanim

```python
class Coupon(Base):
    code: str  # "HOSGELDIN20"
    coupon_type: CouponType
    discount_value: Decimal
    max_discount: Decimal | None
    usage_limit: int | None
    usage_limit_per_user: int = 1
    valid_from: datetime
    valid_until: datetime
```

### 4.5 Kayit (Enrollment) Sistemi

#### 4.5.1 Kurs Kaydi
- Siparis tamamlandiginda otomatik kayit
- Ilerleme yuzdesi takibi
- Son erisim zamani
- Tamamlanma tarihi

```python
class Enrollment(Base):
    user_id: str
    course_id: str
    order_id: str | None
    progress_percentage: int = 0  # 0-100
    last_accessed_at: datetime | None
    completed_at: datetime | None
```

#### 4.5.2 Ders Ilerlemesi
- Izlenen sure takibi
- Ders tamamlama durumu
- Kaldigi yerden devam etme

### 4.6 Degerlendirme Sistemi

#### 4.6.1 Kurs Yorumlari
- 1-5 yildiz puanlama
- Baslik ve yorum metni
- Kullanici bilgisi ile gosterim
- Istatistikler (ortalama puan, toplam yorum)

```typescript
// Yorum Olusturma
await courseReviewsApi.create(courseId, {
  rating: 5,
  title: "Harika bir kurs!",
  comment: "Cok faydali icerikler..."
});
```

### 4.7 Egitmen Modulu

#### 4.7.1 Egitmen Paneli
- Kurs yonetimi
- Ogrenci takibi
- Kazanc goruntuleme
- Son yorumlar

#### 4.7.2 Egitmen Profilleri
- Herkese acik profil sayfasi
- Kurs listesi
- Iletisim bilgileri

### 4.8 Ogrenci Paneli

#### 4.8.1 Dashboard
- Kayitli kurslar
- Devam eden kurslar
- Tamamlanan kurslar
- Ilerleme istatistikleri

#### 4.8.2 Ozellikler
- Kaldigi yerden devam
- Izleme suresi takibi
- Sertifika goruntuleme

---

## 5. Gelistirilecek Ozellikler (Roadmap)

### 5.1 Faz 1: Temel Iyilestirmeler (Kisa Vadeli)

#### 5.1.1 AI Asistan
```
- ChatGPT/Claude entegrasyonu
- Konu bazli soru-cevap
- Ozet olusturma
- Soru uretme
```

#### 5.1.2 Canli Dersler
```
- WebRTC entegrasyonu
- Interaktif whiteboard
- Ekran paylasimi
- Kayit ve tekrar izleme
```

#### 5.1.3 Bildirim Sistemi
```
- Email bildirimleri
- Push notifications
- SMS entegrasyonu (Netgsm, Twilio)
```

### 5.2 Faz 2: Gelismis Ozellikler (Orta Vadeli)

#### 5.2.1 Oyunlastirma (Gamification)
```
- Rozet sistemi
- Liderlik tablosu
- Gunluk seri (streak)
- Puan sistemi
- Basarim odulleri
```

#### 5.2.2 Sosyal Ozellikler
```
- Forum/Tartisma alani
- Ogrenci gruplari
- Mesajlasma
- Icerik paylasimi
```

#### 5.2.3 Gelismis Analitik
```
- Ogrenci davranis analizi
- Kurs performans metrikleri
- Egitmen raporlari
- A/B test altyapisi
```

### 5.3 Faz 3: Kurumsal Ozellikler (Uzun Vadeli)

#### 5.3.1 Multi-Tenant White-Label
```
- Ozel subdomain (kurum.bihocam.com)
- Marka ozelleştirmesi
- Ozel tema/renkler
- Ozel logo
```

#### 5.3.2 SCORM/xAPI Uyumlulugu
```
- Harici icerik entegrasyonu
- Standart uyumluluk
- LTI entegrasyonu
```

#### 5.3.3 API Marketplace
```
- Ucuncu parti entegrasyonlar
- Webhook sistemi
- OAuth provider
```

### 5.4 Odeme Entegrasyonlari (Oncelikli)

#### 5.4.1 Iyzico Entegrasyonu
```python
# Planlanan Iyzico Akisi
class IyzicoPayment:
    def create_checkout_form(self, order):
        # 3D Secure odeme
        pass

    def handle_callback(self, token):
        # Odeme sonucu isleme
        pass
```

#### 5.4.2 PayTR Entegrasyonu
```python
# Planlanan PayTR Akisi
class PayTRPayment:
    def create_iframe_token(self, order):
        pass
```

---

## 6. Is Modeli ve Gelir Akislari

### 6.1 Gelir Modelleri

#### 6.1.1 Marketplace Komisyonu
```
- Platform Komisyonu: %35 (varsayilan)
- Egitmen Kazanci: %65
- Dinamik komisyon oranlari (premium egitmenler icin)
```

#### 6.1.2 Abonelik Modeli (Planlanan)
```
OGRENCI PLANLARI:
- Ucretsiz: Sinirli erisim
- Basic: 49 TL/ay - Tum kurslar
- Premium: 99 TL/ay - AI asistan + Canli dersler

EGITMEN PLANLARI:
- Starter: Ucretsiz - %35 komisyon
- Pro: 199 TL/ay - %25 komisyon
- Enterprise: Ozel fiyatlandirma
```

#### 6.1.3 Kurumsal Lisanslama
```
- Kullanici basina fiyatlandirma
- Yillik sozlesmeler
- Ozel SLA
- Dedicated destek
```

### 6.2 Odeme Sistemi Akisi

```
[Ogrenci Sepeti]
       |
[Kupon Uygula (opsiyonel)]
       |
[Siparis Olustur]
       |
[Odeme Gateway (Iyzico/PayTR)]
       |
   [Basarili?]
    /      \
 [Evet]   [Hayir]
   |         |
[Enrollment] [Hata Mesaji]
   |
[Kurs Erisimi]
```

### 6.3 Komisyon Dagilimi

```python
# Ornek: 100 TL'lik kurs
kurs_fiyati = 100
platform_komisyonu = kurs_fiyati * 0.35  # 35 TL
egitmen_kazanci = kurs_fiyati * 0.65      # 65 TL

# Indirimli kurs (20 TL indirim)
indirimli_fiyat = 80
platform_komisyonu = 80 * 0.35  # 28 TL
egitmen_kazanci = 80 * 0.65     # 52 TL
```

---

## 7. Rekabet Analizi ve Pazar Firsatlari

### 7.1 Turkiye Pazari

| Platform | Guc | Zayiflik |
|----------|-----|----------|
| Udemy | Global marka, genis icerik | Yerel odak yok, Turkce destek zayif |
| BTK Akademi | Ucretsiz, resmi | Sinirli icerik, interaktivite yok |
| Turkcell Akademi | Buyuk kitle | Kurumsal odakli |
| Doping Hafiza | Sinav odakli | Dar kapsam |

### 7.2 BiHocam'in Farkliliklari

1. **Yerel Odak**: YKS, LGS ve Turkiye mufredatina ozel
2. **AI Entegrasyonu**: 7/24 yapay zeka asistani
3. **Egitmen Dostu**: Yuksek gelir payi, kolay araclar
4. **Modern Teknoloji**: Hizli, responsive, mobil uyumlu
5. **Kurumsal Cozumler**: White-label, multi-tenant

### 7.3 Pazar Buyuklugu (TAM/SAM/SOM)

```
TAM (Total Addressable Market):
- Turkiye Online Egitim Pazari: ~5 Milyar TL

SAM (Serviceable Addressable Market):
- K-12 + Universite Hazirligi: ~1.5 Milyar TL

SOM (Serviceable Obtainable Market):
- Ilk 3 yil hedef: ~50 Milyon TL
```

---

## 8. Teknik Detaylar

### 8.1 Frontend Mimari

#### 8.1.1 Dosya Yapisi
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth route grubu
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Dashboard route grubu
│   │   │   └── dashboard/
│   │   │       ├── courses/
│   │   │       ├── my-courses/
│   │   │       ├── orders/
│   │   │       └── settings/
│   │   ├── courses/            # Public kurs sayfalari
│   │   ├── teachers/           # Egitmen profilleri
│   │   └── cart/               # Sepet
│   ├── components/             # Yeniden kullanilabilir bilesenler
│   │   ├── ui/                 # Temel UI bilesenleri
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── lib/                    # Utility fonksiyonlar
│       ├── api.ts              # API istemcisi
│       ├── store.ts            # Zustand store
│       └── providers.tsx       # React Query provider
```

#### 8.1.2 State Yonetimi

```typescript
// Zustand Store - Auth State
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// React Query - Server State
const { data: courses } = useQuery({
  queryKey: ["courses"],
  queryFn: () => coursesApi.list(),
});
```

### 8.2 Backend Mimari

#### 8.2.1 Dosya Yapisi
```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   ├── users.py
│   │       │   ├── courses.py
│   │       │   ├── quizzes.py
│   │       │   ├── cart.py
│   │       │   ├── orders.py
│   │       │   ├── coupons.py
│   │       │   ├── enrollments.py
│   │       │   └── teachers.py
│   │       └── router.py
│   ├── core/
│   │   ├── config.py           # Ayarlar
│   │   └── security.py         # JWT islemleri
│   ├── db/
│   │   ├── base.py             # SQLAlchemy Base
│   │   └── session.py          # DB Session
│   ├── models/                 # SQLAlchemy modelleri
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── quiz.py
│   │   ├── order.py
│   │   ├── cart.py
│   │   └── coupon.py
│   ├── schemas/                # Pydantic schemalar
│   ├── services/               # Is mantigi servisleri
│   │   ├── commission.py
│   │   └── user_service.py
│   └── main.py                 # FastAPI app
```

#### 8.2.2 Async Pattern

```python
# Async Database Session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Async Endpoint
@router.get("/courses")
async def list_courses(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.lessons))
        .where(Course.status == CourseStatus.PUBLISHED)
    )
    return result.scalars().all()
```

---

## 9. API Referansi

### 9.1 Authentication

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| `/api/v1/auth/register` | POST | Kullanici kaydi |
| `/api/v1/auth/login` | POST | Giris (OAuth2 form) |
| `/api/v1/auth/me` | GET | Mevcut kullanici |

### 9.2 Courses

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| `/api/v1/courses` | GET | Kurs listesi |
| `/api/v1/courses` | POST | Kurs olustur |
| `/api/v1/courses/{id}` | GET | Kurs detayi |
| `/api/v1/courses/{id}` | PATCH | Kurs guncelle |
| `/api/v1/courses/slug/{slug}` | GET | Slug ile kurs |
| `/api/v1/courses/me` | GET | Egitmenin kurslari |
| `/api/v1/courses/{id}/lessons` | GET | Ders listesi |
| `/api/v1/courses/{id}/lessons` | POST | Ders ekle |
| `/api/v1/courses/{id}/similar` | GET | Benzer kurslar |

### 9.3 Quizzes

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| `/api/v1/quizzes` | POST | Quiz olustur |
| `/api/v1/quizzes/{id}` | GET | Quiz detayi |
| `/api/v1/quizzes/{id}/questions` | POST | Soru ekle |
| `/api/v1/quizzes/{id}/attempt` | POST | Deneme baslat |
| `/api/v1/quizzes/attempts/{id}/submit` | POST | Deneme gonder |

### 9.4 E-Commerce

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| `/api/v1/cart` | GET | Sepeti getir |
| `/api/v1/cart` | POST | Sepete ekle |
| `/api/v1/cart/{id}` | DELETE | Sepetten cikar |
| `/api/v1/orders` | POST | Siparis olustur |
| `/api/v1/orders` | GET | Siparis listesi |
| `/api/v1/orders/{id}/complete` | PATCH | Siparisi tamamla |
| `/api/v1/coupons/validate` | POST | Kupon dogrula |

### 9.5 Enrollments

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| `/api/v1/enrollments/me` | GET | Kayitli kurslar |

---

## 10. Veritabani Semasi

### 10.1 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │     │   Course    │     │   Lesson    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │────<│ teacher_id  │     │ id (PK)     │
│ email       │     │ id (PK)     │────<│ course_id   │
│ password    │     │ title       │     │ title       │
│ full_name   │     │ slug        │     │ lesson_type │
│ role        │     │ price       │     │ order       │
│ org_id (FK) │     │ status      │     │ is_preview  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Enrollment  │     │   Order     │     │    Quiz     │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ user_id     │     │ user_id     │     │ lesson_id   │
│ course_id   │     │ total       │     │ title       │
│ progress    │     │ status      │     │ passing_sc  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 10.2 Tablo Detaylari

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin','staff','organization','teacher','student'),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    organization_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Courses
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_path VARCHAR(500),
    price DECIMAL(10,2) DEFAULT 0,
    discount_price DECIMAL(10,2),
    status ENUM('draft','published','archived'),
    teacher_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES users(id),
    is_org_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);
```

---

## 11. Guvenlik ve Uyumluluk

### 11.1 Kimlik Dogrulama Guvenligi

- **JWT Token**: Access (15dk) + Refresh (7 gun)
- **Sifre Hashleme**: bcrypt
- **Rate Limiting**: Login ve hassas endpointler
- **CORS**: Kontrollü origin'ler

### 11.2 Yetkilendirme

```python
# Endpoint Korumalari
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Admin yetkisi gerekli")
    return current_user

def require_teacher_or_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(403, "Yetki gerekli")
    return current_user
```

### 11.3 KVKK Uyumlulugu (Planlanan)

- Acik riza mekanizmasi
- Veri silme hakki
- Veri tasima hakki
- Cerez politikasi
- Gizlilik sozlesmesi

### 11.4 Veri Guvenligi

- HTTPS zorunlulugu
- SQL Injection korumalari (ORM)
- XSS korumalari
- CSRF token (gerekli yerlerde)

---

## 12. Olceklendirme Stratejisi

### 12.1 Kisa Vadeli (0-10K Kullanici)

```
- Single server deployment
- PostgreSQL standard
- Basit CDN kullanimi
- Manuel backup
```

### 12.2 Orta Vadeli (10K-100K Kullanici)

```
- Kubernetes cluster
- PostgreSQL read replicas
- Redis caching layer
- Auto-scaling pods
- Prometheus + Grafana monitoring
```

### 12.3 Uzun Vadeli (100K+ Kullanici)

```
- Multi-region deployment
- Database sharding
- Microservices mimari
- Event-driven architecture
- Dedicated video CDN
```

### 12.4 Performans Metrikleri

| Metrik | Hedef |
|--------|-------|
| Sayfa Yukleme | < 2 saniye |
| API Response | < 200ms |
| Uptime | %99.9 |
| Video Baslama | < 1 saniye |

---

## Sonuc

BiHocam, Turkiye'nin egitim teknolojisi alaninda onemli bir boslugu doldurmak uzere tasarlanmis, modern ve olceklenebilir bir SAAS platformudur. Mevcut MVP ozellikleri saglamdir ve gelecek roadmap ile tam kapsamli bir ogrenme ekosistemi haline gelecektir.

### Anahtar Basari Faktorleri

1. **Kullanici Deneyimi**: Modern, hizli, mobil-first tasarim
2. **Egitmen Ekosistemi**: Cezbedici gelir modeli
3. **Teknoloji**: Olceklenebilir, guvenli altyapi
4. **Yerellesme**: Turkiye pazarina odakli icerik
5. **AI Entegrasyonu**: Rekabet avantaji

---

*Bu dokuman BiHocam gelistirme ekibi tarafindan hazirlanmistir.*
*Son Guncelleme: Subat 2026*
