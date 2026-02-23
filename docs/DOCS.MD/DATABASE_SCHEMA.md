# BiHocam - Veritabani Sema Dokumantasyonu

## Genel Bakis

BiHocam PostgreSQL veritabani kullanir. Tum tablolar UUID birincil anahtar kullanir ve timestamps (created_at, updated_at) icerirler.

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ email │ hashed_password │ full_name │ role │ organization_id  │
└─────────┬───────────────────────────────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             COURSES                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ title │ slug │ price │ discount_price │ status │ teacher_id   │
└─────────┬───────────────────────────────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             LESSONS                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ title │ lesson_type │ content_path │ video_url │ course_id    │
└─────────┬───────────────────────────────────────────────────────────────┘
          │
          │ 1:1
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              QUIZZES                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ lesson_id │ title │ passing_score │ time_limit_minutes        │
└─────────┬───────────────────────────────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          QUIZ_QUESTIONS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ quiz_id │ question_type │ question_text │ options │ correct   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tablo Detaylari

### 1. USERS

Kullanici bilgilerini saklayan ana tablo.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    organization_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE UNIQUE INDEX ix_users_email ON users(email);
```

**Rol Enum Degerleri:**
- `admin` - Platform yoneticisi
- `staff` - Calisanlar
- `organization` - Kurum hesabi
- `teacher` - Egitmen
- `student` - Ogrenci

**Iliskiler:**
- Self-reference: `organization_id` -> Kurum uyeligi
- `courses` -> Egitmenin kurslari
- `cart_items` -> Sepet ogeleri
- `orders` -> Siparisler
- `enrollments` -> Kurs kayitlari
- `coupon_usages` -> Kupon kullanimlari
- `quiz_attempts` -> Quiz denemeleri
- `lesson_progress` -> Ders ilerlemeleri
- `course_reviews` -> Kurs yorumlari

---

### 2. COURSES

Kurs bilgilerini saklayan tablo.

```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_path VARCHAR(500),
    price DECIMAL(10, 2) DEFAULT 0,
    discount_price DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    teacher_id UUID NOT NULL REFERENCES users(id),
    category_id UUID,
    organization_id UUID REFERENCES users(id),
    is_org_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- Indexler
CREATE UNIQUE INDEX ix_courses_slug ON courses(slug);
CREATE INDEX ix_courses_teacher_id ON courses(teacher_id);
CREATE INDEX ix_courses_status ON courses(status);
```

**Status Enum Degerleri:**
- `draft` - Taslak
- `published` - Yayinda
- `archived` - Arsivlenmis

**Iliskiler:**
- `teacher` -> Egitmen (User)
- `lessons` -> Dersler
- `cart_items` -> Sepet ogeleri
- `order_items` -> Siparis ogeleri
- `enrollments` -> Kayitlar
- `reviews` -> Yorumlar

---

### 3. LESSONS

Ders bilgilerini saklayan tablo.

```sql
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type VARCHAR(20) DEFAULT 'video',
    content_path VARCHAR(500),
    video_url VARCHAR(500),
    duration_seconds INTEGER,
    "order" INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    course_id UUID NOT NULL REFERENCES courses(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE INDEX ix_lessons_course_id ON lessons(course_id);
```

**Lesson Type Enum Degerleri:**
- `video` - Video ders
- `pdf` - PDF dokuman
- `quiz` - Quiz/Test

**Iliskiler:**
- `course` -> Ait oldugu kurs
- `quiz` -> Bagli quiz (1:1)
- `progress` -> Ilerleme kayitlari

---

### 4. QUIZZES

Quiz bilgilerini saklayan tablo.

```sql
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    time_limit_minutes INTEGER,
    max_attempts INTEGER,
    shuffle_questions BOOLEAN DEFAULT FALSE,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE UNIQUE INDEX ix_quizzes_lesson_id ON quizzes(lesson_id);
```

**Iliskiler:**
- `lesson` -> Ait oldugu ders (1:1)
- `questions` -> Sorular
- `attempts` -> Denemeler

---

### 5. QUIZ_QUESTIONS

Quiz sorularini saklayan tablo.

```sql
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer VARCHAR(255) NOT NULL,
    points INTEGER DEFAULT 1,
    "order" INTEGER DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE INDEX ix_quiz_questions_quiz_id ON quiz_questions(quiz_id);
```

**Question Type Enum Degerleri:**
- `multiple_choice` - Coktan secmeli
- `true_false` - Dogru/Yanlis
- `short_answer` - Kisa cevap

**Options JSON Formati (multiple_choice icin):**
```json
{
  "A": "Birinci secenek",
  "B": "Ikinci secenek",
  "C": "Ucuncu secenek",
  "D": "Dorduncu secenek"
}
```

---

### 6. QUIZ_ATTEMPTS

Quiz denemelerini saklayan tablo.

```sql
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'in_progress',
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    score_percentage INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    time_taken_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE INDEX ix_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX ix_quiz_attempts_user_id ON quiz_attempts(user_id);
```

**Status Enum Degerleri:**
- `in_progress` - Devam ediyor
- `completed` - Tamamlandi
- `abandoned` - Birakildi

---

### 7. QUIZ_ATTEMPT_ANSWERS

Quiz cevaplarini saklayan tablo.

```sql
CREATE TABLE quiz_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id),
    question_id UUID NOT NULL REFERENCES quiz_questions(id),
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    answered_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE INDEX ix_quiz_attempt_answers_attempt_id ON quiz_attempt_answers(attempt_id);
```

---

### 8. CART_ITEMS

Sepet ogelerini saklayan tablo.

```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    price_at_add DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE INDEX ix_cart_items_user_id ON cart_items(user_id);
CREATE UNIQUE INDEX ix_cart_items_user_course ON cart_items(user_id, course_id);
```

---

### 9. ORDERS

Siparisleri saklayan tablo.

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(20),
    payment_gateway_transaction_id VARCHAR(255),
    payment_gateway_response TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP
);

-- Indexler
CREATE UNIQUE INDEX ix_orders_order_number ON orders(order_number);
CREATE INDEX ix_orders_user_id ON orders(user_id);
```

**Status Enum Degerleri:**
- `pending` - Bekliyor
- `paid` - Odendi
- `failed` - Basarisiz
- `refunded` - Iade edildi
- `cancelled` - Iptal edildi

**Payment Method Enum Degerleri:**
- `credit_card` - Kredi karti
- `eft` - EFT/Havale
- `manual` - Manuel

---

### 10. ORDER_ITEMS

Siparis ogelerini saklayan tablo.

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    final_price DECIMAL(10, 2) NOT NULL,
    platform_commission_rate DECIMAL(5, 2) DEFAULT 0.35,
    platform_commission DECIMAL(10, 2) NOT NULL,
    teacher_earnings DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE INDEX ix_order_items_order_id ON order_items(order_id);
```

---

### 11. ENROLLMENTS

Kurs kayitlarini saklayan tablo.

```sql
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    order_id UUID REFERENCES orders(id),
    progress_percentage INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP,
    completed_at TIMESTAMP,
    enrolled_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_user_course_enrollment UNIQUE (user_id, course_id)
);

-- Indexler
CREATE INDEX ix_enrollments_user_id ON enrollments(user_id);
CREATE INDEX ix_enrollments_course_id ON enrollments(course_id);
```

---

### 12. LESSON_PROGRESS

Ders ilerleme kayitlarini saklayan tablo.

```sql
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    lesson_id UUID NOT NULL REFERENCES lessons(id),
    enrollment_id UUID REFERENCES enrollments(id),
    watched_seconds INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_user_lesson_progress UNIQUE (user_id, lesson_id)
);

-- Indexler
CREATE INDEX ix_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX ix_lesson_progress_lesson_id ON lesson_progress(lesson_id);
```

---

### 13. COUPONS

Kuponlari saklayan tablo.

```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    coupon_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    max_discount DECIMAL(10, 2),
    trigger_type VARCHAR(20) DEFAULT 'manual',
    min_cart_value DECIMAL(10, 2),
    category_id UUID,
    usage_limit INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE UNIQUE INDEX ix_coupons_code ON coupons(code);
```

**Coupon Type Enum Degerleri:**
- `percentage` - Yuzde indirim
- `fixed` - Sabit tutar

**Trigger Type Enum Degerleri:**
- `first_purchase` - Ilk alisveris
- `cart_value` - Sepet tutari
- `category` - Kategori bazli
- `manual` - Manuel

---

### 14. COUPON_USAGES

Kupon kullanimlarini saklayan tablo.

```sql
CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE INDEX ix_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX ix_coupon_usages_user_id ON coupon_usages(user_id);
```

---

### 15. COURSE_REVIEWS

Kurs yorumlarini saklayan tablo.

```sql
CREATE TABLE course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    user_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_user_course_review UNIQUE (user_id, course_id)
);

-- Indexler
CREATE INDEX ix_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX ix_course_reviews_user_id ON course_reviews(user_id);
```

---

## Index Stratejisi

### Birincil Indexler
- Tum `id` alanlari (Primary Key)
- Tum `*_id` Foreign Key alanlari

### Benzersizlik Indexleri
- `users.email`
- `courses.slug`
- `coupons.code`
- `orders.order_number`
- `enrollments(user_id, course_id)`
- `course_reviews(user_id, course_id)`

### Performans Indexleri
- `courses.status` - Filtreleme
- `courses.teacher_id` - Egitmen sorgusu
- `lessons.course_id` - Kurs dersleri
- `orders.user_id` - Kullanici siparisleri

---

## Migration Stratejisi

Alembic kullanilarak migration yonetimi yapilir:

```bash
# Yeni migration olustur
alembic revision --autogenerate -m "Add new table"

# Migration uygula
alembic upgrade head

# Geri al
alembic downgrade -1
```

---

*Son Guncelleme: Subat 2026*
