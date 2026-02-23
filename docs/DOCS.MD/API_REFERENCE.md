# BiHocam - API Referans Dokumantasyonu

## Genel Bilgiler

### Base URL
```
Development: http://localhost:8000/api/v1
Production: https://api.bihocam.com/api/v1
```

### Kimlik Dogrulama
Tum korumali endpoint'ler Bearer token gerektirir:
```
Authorization: Bearer <access_token>
```

### Hata Formati
```json
{
  "detail": "Hata mesaji"
}
```

veya

```json
{
  "detail": {
    "code": "HATA_KODU",
    "message": "Detayli hata aciklamasi"
  }
}
```

---

## Authentication API

### POST /auth/register
Yeni kullanici kaydı

**Request Body:**
```json
{
  "email": "ornek@email.com",
  "password": "guvenli_sifre123",
  "full_name": "Ahmet Yilmaz",
  "role": "student"  // "student" veya "teacher"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "ornek@email.com",
  "full_name": "Ahmet Yilmaz",
  "role": "student",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-02-04T10:00:00Z"
}
```

---

### POST /auth/login
Kullanici girisi (OAuth2 form)

**Request Body (form-urlencoded):**
```
username=ornek@email.com
password=guvenli_sifre123
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

---

### GET /auth/me
Mevcut kullanici bilgisi

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "ornek@email.com",
  "full_name": "Ahmet Yilmaz",
  "role": "student",
  "is_active": true,
  "is_verified": false,
  "organization_id": null,
  "created_at": "2026-02-04T10:00:00Z",
  "updated_at": "2026-02-04T10:00:00Z"
}
```

---

## Courses API

### GET /courses
Yayinlanmis kurslari listele

**Query Parameters:**
| Parametre | Tip | Varsayilan | Aciklama |
|-----------|-----|------------|----------|
| skip | int | 0 | Atlanacak kayit sayisi |
| limit | int | 20 | Maksimum kayit sayisi |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Python ile Programlama",
    "slug": "python-ile-programlama",
    "description": "Baslangictan ileri seviyeye Python",
    "thumbnail_path": "https://...",
    "price": 299.00,
    "discount_price": 199.00,
    "status": "published",
    "is_featured": false,
    "teacher": {
      "id": "uuid",
      "full_name": "Mehmet Hoca",
      "email": "mehmet@bihocam.com"
    },
    "lessons": [
      {
        "id": "uuid",
        "title": "Giris",
        "lesson_type": "video",
        "order": 1,
        "is_preview": true,
        "duration_seconds": 600
      }
    ],
    "created_at": "2026-01-15T10:00:00Z"
  }
]
```

---

### GET /courses/{course_id}
Kurs detayi

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Python ile Programlama",
  "slug": "python-ile-programlama",
  "description": "...",
  "thumbnail_path": "...",
  "price": 299.00,
  "discount_price": 199.00,
  "status": "published",
  "meta_title": "Python Kursu",
  "meta_description": "...",
  "teacher": {...},
  "lessons": [...],
  "created_at": "...",
  "published_at": "..."
}
```

**Not:** Kayitli olmayan kullanicilar sadece `is_preview: true` dersleri gorebilir.

---

### GET /courses/slug/{slug}
Slug ile kurs detayi

---

### GET /courses/me
Egitmenin kendi kurslari (Yetki: Teacher/Admin)

---

### POST /courses
Yeni kurs olustur (Yetki: Teacher/Admin)

**Request Body:**
```json
{
  "title": "Yeni Kurs",
  "slug": "yeni-kurs",
  "description": "Kurs aciklamasi",
  "price": 199.00,
  "discount_price": null,
  "meta_title": null,
  "meta_description": null
}
```

---

### PATCH /courses/{course_id}
Kurs guncelle (Yetki: Owner/Admin)

**Request Body:**
```json
{
  "title": "Guncellenmis Baslik",
  "status": "published"
}
```

---

### GET /courses/{course_id}/lessons
Kurs derslerini listele

---

### POST /courses/{course_id}/lessons
Derse ders ekle (Yetki: Owner/Admin)

**Request Body:**
```json
{
  "title": "Yeni Ders",
  "description": "Ders aciklamasi",
  "lesson_type": "video",
  "video_url": "https://youtube.com/watch?v=...",
  "duration_seconds": 1200,
  "order": 1,
  "is_preview": false
}
```

---

### GET /courses/{course_id}/similar
Benzer kurslari getir

---

## Quizzes API

### POST /quizzes
Quiz olustur (Yetki: Teacher/Admin)

**Request Body:**
```json
{
  "lesson_id": "uuid",
  "title": "Bolum 1 Testi",
  "description": "10 soruluk test",
  "passing_score": 70,
  "time_limit_minutes": 15,
  "max_attempts": 3,
  "shuffle_questions": true,
  "show_correct_answers": true
}
```

---

### GET /quizzes/{quiz_id}
Quiz detayi (Yetki: Enrolled/Owner)

**Response (200):**
```json
{
  "id": "uuid",
  "lesson_id": "uuid",
  "title": "Bolum 1 Testi",
  "passing_score": 70,
  "time_limit_minutes": 15,
  "questions": [
    {
      "id": "uuid",
      "question_type": "multiple_choice",
      "question_text": "Python hangi dil?",
      "options": {"A": "Yorumlanan", "B": "Derlenen"},
      "points": 10,
      "order": 1
    }
  ]
}
```

---

### POST /quizzes/{quiz_id}/questions
Soru ekle (Yetki: Owner/Admin)

**Request Body:**
```json
{
  "question_type": "multiple_choice",
  "question_text": "Python hangi tur bir dil?",
  "options": {
    "A": "Yorumlanan",
    "B": "Derlenen",
    "C": "Makine dili",
    "D": "Assembly"
  },
  "correct_answer": "A",
  "points": 10,
  "explanation": "Python yorumlanan bir dildir."
}
```

---

### POST /quizzes/{quiz_id}/attempt
Quiz denemesi baslat (Yetki: Enrolled)

**Response (200):**
```json
{
  "id": "uuid",
  "quiz_id": "uuid",
  "user_id": "uuid",
  "status": "in_progress",
  "total_questions": 10,
  "started_at": "2026-02-04T10:00:00Z"
}
```

---

### POST /quizzes/attempts/{attempt_id}/submit
Cevaplari gonder

**Request Body:**
```json
[
  {
    "question_id": "uuid",
    "answer_text": "A"
  },
  {
    "question_id": "uuid",
    "answer_text": "true"
  }
]
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "completed",
  "correct_answers": 8,
  "score_percentage": 80,
  "points_earned": 80,
  "time_taken_seconds": 420,
  "completed_at": "2026-02-04T10:07:00Z"
}
```

---

## Cart API

### GET /cart
Sepeti getir (Yetki: Authenticated)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "course_id": "uuid",
    "price_at_add": 199.00,
    "course": {
      "id": "uuid",
      "title": "Python Kursu",
      "slug": "python-kursu",
      "price": 299.00,
      "discount_price": 199.00,
      "thumbnail_path": "...",
      "teacher": {...}
    },
    "created_at": "2026-02-04T10:00:00Z"
  }
]
```

---

### POST /cart
Sepete ekle

**Request Body:**
```json
{
  "course_id": "uuid"
}
```

---

### DELETE /cart/{item_id}
Sepetten cikar

---

### DELETE /cart
Sepeti temizle

---

## Orders API

### POST /orders
Siparis olustur (Yetki: Authenticated)

**Request Body:**
```json
{
  "coupon_code": "INDIRIM20",
  "discount_amount": 40.00,
  "payment_method": "credit_card",
  "notes": null
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "order_number": "ORD-20260204-ABCD1234",
  "subtotal": 199.00,
  "discount_amount": 40.00,
  "total": 159.00,
  "status": "pending",
  "payment_method": "credit_card",
  "order_items": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "price": 299.00,
      "discount_price": 199.00,
      "final_price": 199.00,
      "platform_commission": 69.65,
      "teacher_earnings": 129.35
    }
  ],
  "created_at": "2026-02-04T10:00:00Z"
}
```

---

### GET /orders
Siparis listesi

---

### GET /orders/{order_id}
Siparis detayi

---

### PATCH /orders/{order_id}/complete
Siparisi tamamla (odeme sonrasi)

**Query Parameters:**
```
payment_gateway_transaction_id=iyzico_123456
```

---

## Coupons API

### POST /coupons/validate
Kupon dogrula

**Request Body:**
```json
{
  "code": "INDIRIM20",
  "cart_total": 199.00
}
```

**Response (200):**
```json
{
  "is_valid": true,
  "coupon_code": "INDIRIM20",
  "discount_type": "percentage",
  "discount_value": 20,
  "discount_amount": 39.80,
  "message": "Kupon basariyla uygulandi"
}
```

---

## Enrollments API

### GET /enrollments/me
Kayitli kurslarim

**Response (200):**
```json
[
  {
    "id": "uuid",
    "course_id": "uuid",
    "progress_percentage": 45,
    "last_accessed_at": "2026-02-04T10:00:00Z",
    "completed_at": null,
    "enrolled_at": "2026-01-15T10:00:00Z",
    "course": {
      "id": "uuid",
      "title": "Python Kursu",
      "slug": "python-kursu",
      "thumbnail_path": "..."
    }
  }
]
```

---

## Lesson Progress API

### GET /courses/{course_id}/lessons/{lesson_id}/progress
Ders ilerlemesi

---

### POST /courses/{course_id}/lessons/{lesson_id}/progress
Ilerleme guncelle

**Request Body:**
```json
{
  "watched_seconds": 450,
  "is_completed": false
}
```

---

## Course Reviews API

### GET /courses/{course_id}/reviews
Kurs yorumlari

---

### GET /courses/{course_id}/reviews/stats
Yorum istatistikleri

**Response (200):**
```json
{
  "average_rating": 4.5,
  "total_reviews": 128
}
```

---

### POST /courses/{course_id}/reviews
Yorum ekle (Yetki: Enrolled)

**Request Body:**
```json
{
  "rating": 5,
  "title": "Harika bir kurs!",
  "comment": "Cok detayli ve aciklayici."
}
```

---

### GET /courses/{course_id}/reviews/me
Kendi yorumum

---

## Teachers API

### GET /teachers
Egitmen listesi

---

### GET /teachers/{teacher_id}
Egitmen profili

**Response (200):**
```json
{
  "id": "uuid",
  "full_name": "Mehmet Hoca",
  "email": "mehmet@bihocam.com",
  "courses": [...],
  "total_students": 1250,
  "average_rating": 4.8
}
```

---

## Media API

### POST /media/lessons/{lesson_id}/upload-video
Video yukle (multipart/form-data)

---

### GET /media/videos/{filename}
Video stream

---

### DELETE /media/lessons/{lesson_id}/video
Video sil

---

## HTTP Durum Kodlari

| Kod | Anlam |
|-----|-------|
| 200 | Basarili |
| 201 | Olusturuldu |
| 400 | Gecersiz istek |
| 401 | Yetkisiz (token yok/gecersiz) |
| 403 | Yasakli (yetki yok) |
| 404 | Bulunamadi |
| 422 | Validasyon hatasi |
| 500 | Sunucu hatasi |

---

## Rate Limiting (Planlanan)

| Endpoint | Limit |
|----------|-------|
| /auth/login | 5/dakika |
| /coupons/validate | 10/dakika |
| Diger | 100/dakika |

---

*API Versiyonu: v1*
*Son Guncelleme: Subat 2026*
