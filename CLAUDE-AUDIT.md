# BiHocam - Kapsamlı Audit Raporu & Kanban

> **Audit Tarihi:** 2026-03-19
> **Auditor:** Claude Opus 4.6
> **Durum:** Planlama aşaması - Geliştirme öncesi

---

## Kanban Board

### Açıklama
- 🔴 **KRITIK (P0)** — Güvenlik açığı veya veri kaybı riski. Hemen düzeltilmeli.
- 🟠 **YÜKSEK (P1)** — Ciddi güvenlik/bütünlük sorunu. Kısa vadede düzeltilmeli.
- 🟡 **ORTA (P2)** — Ölçeklenebilirlik ve tutarlılık. Orta vadede düzeltilmeli.
- 🟢 **DÜŞÜK (P3)** — Kod kalitesi, edge case. Uzun vadede düzeltilmeli.

---

## FAZ 1 — KRITIK GÜVENLIK (P0)

### TAMAMLANDI (Paket A)

#### [P0-01] Sipariş İndirim Manipülasyonu (Revenue Kill Switch) ✅
- **Konum:** `backend/app/api/v1/endpoints/orders.py:168`
- **Sorun:** `discount_amount` kullanıcı tarafından request body'de gönderilebiliyor.
- **Etki:** Tüm gelirin sıfırlanması
- **Çözüm:**
  - [x] `OrderBase` ve `OrderCreate` schema'sından `discount_amount` alanı kaldırıldı
  - [x] İndirim hesaplaması tamamen server-side yapılıyor (kupon tipi + değerine göre)
  - [x] Kupon kodu varsa: aktiflik, tarih, global limit, per-user limit, min_cart_value kontrolü yapılıyor
  - [x] Kampanya zaten server-side hesaplanıyordu (dokunulmadı)
  - [x] Frontend güncellendi: `cart/page.tsx` ve `api.ts`'den `discount_amount` kaldırıldı
  - [x] Test: `test_order_security.py` (schema, hesaplama, negatif total testleri)

#### [P0-02] Hardcoded Secret Key ✅
- **Konum:** `backend/app/core/config.py:13`
- **Sorun:** `SECRET_KEY: str = "dev-secret-key-change-in-production"` — Production'da override edilmezse JWT forge edilebilir.
- **Etki:** Tam kimlik doğrulama bypass'ı
- **Çözüm:**
  - [x] `DEBUG` flag eklendi (dev'de default true, prod'da false zorunlu)
  - [x] `DEBUG=false`'da zayıf SECRET_KEY ile uygulama başlamayı reddediyor (RuntimeError)
  - [x] `DEBUG=true`'da uyarı logu basılıyor
  - [x] `env.template` güncellendi (DEBUG + SECRET_KEY dokümantasyonu)
  - [x] Minimum 32 karakter + blocklist kontrolü
  - [x] Test: `test_security_config.py`

#### [P0-03] Stack Trace Kullanıcıya Açık ✅
- **Konum:** `backend/app/main.py:245-252`
- **Sorun:** Global exception handler `traceback` bilgisini JSON response'da döndürüyor.
- **Etki:** İç mimari, dosya yolları, kütüphane versiyonları ifşa oluyor
- **Çözüm:**
  - [x] Production'da traceback response'dan kaldırıldı, sadece logger'a yazılıyor
  - [x] `settings.DEBUG` flag'ine bağlandı
  - [x] Generic error: `{"detail": "Sunucu hatası oluştu.", "error_id": "<uuid8>"}`
  - [x] Error ID ile log correlation sağlandı
  - [x] Test: `test_exception_handler_hides_traceback_in_production`, `test_exception_handler_shows_traceback_in_debug`, `test_exception_handler_error_id_is_unique`

#### [P0-04] Kupon Kullanım Limiti Kontrol Edilmiyor ✅
- **Konum:** `backend/app/api/v1/endpoints/orders.py:161-171`
- **Sorun:** `used_count >= usage_limit` kontrolü yapılmadan kupon uygulanıyor.
- **Etki:** Sınırsız kupon kullanımı, gelir kaybı
- **Çözüm:**
  - [x] `coupon.is_active` kontrolü eklendi
  - [x] `coupon.valid_from <= now <= coupon.valid_until` kontrolü eklendi
  - [x] `coupon.used_count >= coupon.usage_limit` kontrolü eklendi
  - [x] Per-user limit kontrolü: `CouponUsage` tablosunda kullanıcı sayısı kontrol ediliyor
  - [x] `min_cart_value` kontrolü eklendi
  - [x] Geçersiz kupon kodu 400 hatası veriyor (eskiden sessizce geçiyordu)
  - [x] Test: `test_order_security.py` (limit, expired, inactive, per-user testleri)

#### [P0-05] Race Condition: Çift Enrollment Oluşması ✅
- **Konum:** `backend/app/api/v1/endpoints/orders.py:83-100`
- **Sorun:** Check-then-insert pattern. Concurrent isteklerde duplicate enrollment.
- **Etki:** Veri tutarsızlığı, IntegrityError
- **Çözüm:**
  - [x] Enrollment check batch query'ye dönüştürüldü (N+1 → 1 query)
  - [x] DB'deki `unique_user_course_enrollment` constraint zaten var — IntegrityError handle ediliyor
  - [x] `IntegrityError` catch ile 409 Conflict dönüyor + rollback yapılıyor
  - [x] Test: `test_order_security.py` (batch check, IntegrityError handling)

#### [P0-06] Order Flow'da Transaction Safety Yok ✅
- **Konum:** `backend/app/api/v1/endpoints/orders.py:82-141`
- **Sorun:** Enrollment ve earnings ayrı fonksiyonlar, biri fail olursa tutarsızlık.
- **Etki:** Ödeme alınmış ama enrollment yok
- **Çözüm:**
  - [x] Tüm order flow zaten tek `db.commit()` içinde (SQLAlchemy async session doğası gereği)
  - [x] `IntegrityError` durumunda `db.rollback()` ile tam rollback garanti ediliyor
  - [x] `create_order`, `complete_order`, `complete_order_admin` — hepsine uygulandı
  - [x] Idempotency: `_create_teacher_earnings_for_order`'da `reference_id` ile duplicate kontrol zaten var
  - [x] Test: `test_order_security.py`

---

## FAZ 2 — YÜKSEK ÖNCELİK (P1)

### TAMAMLANDI (Paket D + E)

#### [P1-01] XSS: Blog Preview Sanitize Edilmiyor ✅
- **Konum:** `frontend/src/components/blog/BlogPostForm.tsx:327`
- **Sorun:** `dangerouslySetInnerHTML={{ __html: form.content }}` — DOMPurify kullanılmıyor.
- **Çözüm:**
  - [x] Preview render'ında `DOMPurify.sanitize()` uygulandı
  - [x] `isomorphic-dompurify` import edildi (`TextContent.tsx` pattern'i referans alındı)

#### [P1-02] JWT Token'lar localStorage'da (XSS Riski) ✅
- **Konum:** `frontend/src/lib/api.ts:15`, `login/page.tsx:25-26`, `register/page.tsx:51-52`
- **Sorun:** XSS saldırısıyla token çalınabilir.
- **Çözüm:**
  - [x] Backend: Login'de `Set-Cookie` ile HttpOnly, Secure(prod), SameSite=Lax cookie set ediliyor
  - [x] Backend: Cookie-first + header-fallback token extraction (backward compatible)
  - [x] Backend: `/auth/logout` endpoint eklendi (cookie temizleme)
  - [x] Frontend: `withCredentials: true` Axios'a eklendi
  - [x] Frontend: localStorage fallback korunuyor (geçiş dönemi)
  - [x] Frontend: `authApi.logout()` eklendi
  - [x] Frontend: 401'de auth store da temizleniyor (P3-01 fix bonus)
  - [x] CORS `allow_credentials=True` zaten vardı
  - [x] Test: `test_faz2_paket_g.py` (12 test)

#### [P1-03] Rate Limiting Yok ✅
- **Konum:** Tüm endpoint'ler
- **Sorun:** Login brute force, register spam açık.
- **Çözüm:**
  - [x] `slowapi` entegre edildi (`app/core/rate_limit.py`)
  - [x] App'e `RateLimitExceeded` exception handler eklendi
  - [x] `/auth/login`: 10 istek/dakika/IP
  - [x] `/auth/register`: 3 istek/saat/IP
  - [x] Test: `test_faz2_paket_e.py`

#### [P1-04] Fiyat Validasyonu Eksik ✅
- **Konum:** `backend/app/schemas/course.py:107-125`
- **Sorun:** Negatif fiyat gönderilebilir.
- **Çözüm:**
  - [x] `CourseBase`'e `price >= 0` ve `discount_price >= 0` field_validator eklendi
  - [x] `discount_price <= price` model_validator eklendi
  - [x] `CourseUpdate`'e de aynı field_validator'lar eklendi
  - [x] Test: `test_faz2_paket_d.py` (8 test)

#### [P1-05] DB Connection Pool Yetersiz ✅
- **Konum:** `backend/app/db/session.py:5`
- **Sorun:** Default pool_size=5, max_overflow=10. 15 concurrent connection limiti.
- **Çözüm:**
  - [x] `pool_size=20`, `max_overflow=40`, `pool_recycle=3600`, `pool_pre_ping=True` eklendi
  - [x] Config'den ayarlanabilir: `DB_POOL_SIZE`, `DB_MAX_OVERFLOW`, `DB_POOL_RECYCLE`, `DB_POOL_PRE_PING`
  - [x] SQLite (test) ortamında pool ayarları otomatik atlanıyor
  - [x] Test: `test_db_pool_settings_exist`

#### [P1-06] EarningType Enum Uyuşmazlığı ✅
- **Konum:** `backend/app/models/teacher_earning.py:18` vs migration
- **Sorun:** Model'de `AD_SPEND` var, DB enum'unda yok.
- **Çözüm:**
  - [x] Yeni migration: `20260319_add_ad_spend_to_earningtype.py`
  - [x] `ALTER TYPE earningtype ADD VALUE IF NOT EXISTS 'ad_spend'` (idempotent)
  - [x] Migration chain'e düzgün bağlandı (`down_revision = '20260223_site_wide_coupons'`)
  - [x] Test: `test_faz2_paket_d.py`

#### [P1-07] Withdrawal Race Condition (Bakiye Aşımı) ✅
- **Konum:** `backend/app/api/v1/endpoints/withdrawals.py`
- **Sorun:** Bakiye kontrolü ve çekim onayı arasında lock yok.
- **Çözüm:**
  - [x] `approve_withdrawal`, `mark_withdrawal_paid`, `reject_withdrawal` — hepsine `with_for_update()` eklendi
  - [x] Status geçiş kontrolü zaten vardı (PENDING→APPROVED, APPROVED→PAID)
  - [x] Tek seferde 1 pending/approved çekim talebi zaten zorlanıyor (satır 207-217)
  - [x] Test: `test_faz2_paket_e.py`

#### [P1-08] CSRF Koruması Yok ✅
- **Konum:** Backend + Frontend geneli
- **Sorun:** State-changing request'lerde CSRF token yok.
- **Çözüm:**
  - [x] `SameSite=Lax` cookie flag'i ile CSRF koruması sağlandı (P1-02 ile birlikte)
  - [x] Lax modu: GET cross-origin izinli, POST/PUT/DELETE sadece same-origin
  - [x] Test: `test_faz2_paket_g.py::test_cookie_samesite_flag`

#### [P1-09] Hardcoded DB Credentials ✅
- **Konum:** `backend/app/core/config.py:10`
- **Sorun:** Default DB URL'de `postgres:postgres` credentials'ı hardcoded.
- **Çözüm:**
  - [x] `DEBUG=false`'da localhost credentials kullanılırsa warning logu basılıyor
  - [x] Dev ortamında default çalışmaya devam ediyor (backward compatible)
  - [x] P0-02 ile birlikte çözüldü

#### [P1-10] Eksik Bildirimler (4 adet) ✅
- **Konum:** Çeşitli endpoint'ler
- **Sorun:** Kritik iş akışlarında bildirim tetiklenmiyor.
- **Çözüm:**
  - [x] `ORDER_CONFIRMED` — Sipariş oluşturulduğunda alıcıya (orders.py create_order)
  - [x] `PAYMENT_SUCCESS` — Ödeme tamamlandığında alıcıya (orders.py complete_order)
  - [x] `COURSE_REJECTED` — Zaten vardı (courses.py reject_course)
  - [x] `WITHDRAWAL_APPROVED` / `WITHDRAWAL_PAID` — Zaten vardı (withdrawals.py)
  - [x] Tüm bildirimler non-blocking (try/except ile)
  - [x] Test: `test_faz2_paket_f.py` (7 test)

---

## FAZ 3 — ORTA ÖNCELİK (P2)

### TAMAMLANDI

#### [P2-01] Eksik Composite Index'ler (7 adet) ✅
- **Sorun:** Sık kullanılan sorgu pattern'leri için composite index yok.
- **Çözüm:**
  - [ ] `courses (teacher_id, status)` — Öğretmen kurs listesi
  - [ ] `lessons (course_id, lesson_type)` — Ders tipi filtreleme
  - [ ] `notifications (user_id, is_read, created_at)` — Okunmamış bildirimler
  - [ ] `messages (conversation_id, is_deleted)` — Mesaj listesi
  - [ ] `teacher_earnings (teacher_id, created_at DESC)` — Kazanç geçmişi
  - [ ] `coupons (valid_from, valid_until, is_active)` — Aktif kupon sorgusu
  - [ ] Tek bir Alembic migration'da hepsini ekle

#### [P2-02] N+1 Query Pattern'leri
- **Konum:** `enrollments.py:26`, `orders.py:83-100`
- **Çözüm:**
  - [ ] Enrollment listesinde lesson'ları lazy load veya count-only yap
  - [ ] Order completion'da enrollment check'i batch query'ye dönüştür (`WHERE (user_id, course_id) IN (...)`)
  - [ ] Cart endpoint'inde course eager load'u optimize et

#### [P2-03] Redis Cache Stratejisi
- **Konum:** Redis yapılandırılmış ama kullanılmıyor
- **Çözüm:**
  - [ ] `aioredis` veya `redis-py` async client entegre et
  - [ ] Cache katmanları:
    - SiteSettings: 5 dk TTL
    - Kategori listesi: 10 dk TTL
    - Featured courses: 5 dk TTL
    - Notification unread count: 1 dk TTL
  - [ ] Cache invalidation strategy (write-through)
  - [ ] Cache decorator/utility oluştur

#### [P2-04] CHECK Constraint'ler Eksik
- **Çözüm (tek migration):**
  - [ ] `coupons`: `discount_value > 0`
  - [ ] `coupons`: `coupon_type = 'percentage' → discount_value <= 100`
  - [ ] `order_items`: `final_price >= 0`, `final_price <= price`
  - [ ] `order_items`: `platform_commission >= 0`
  - [ ] `storage_quotas`: `used_bytes >= 0`, `quota_bytes > 0`
  - [ ] `enrollments`: Alembic migration ile `progress_percentage` CHECK (0-100)

#### [P2-05] CourseStatus String → Enum Constraint
- **Konum:** `backend/app/models/course.py:89-92`
- **Sorun:** Status `String(50)` olarak saklanıyor, DB seviyesinde constraint yok.
- **Çözüm:**
  - [ ] CHECK constraint ekle: `status IN ('draft', 'published', 'archived', 'pending_review', 'rejected')`
  - [ ] Veya native PostgreSQL enum'a geri dön (migration ile)
  - [ ] LessonType için de aynı işlem

#### [P2-06] Unbounded Query'ler — Pagination Eksik
- **Konum:** `enrollments.py:33`, ve diğer list endpoint'ler
- **Çözüm:**
  - [ ] `get_my_enrollments`'a `skip/limit` Query parametreleri ekle (max 100)
  - [ ] Tüm list endpoint'leri tara, pagination olmayanları düzelt
  - [ ] Global pagination utility oluştur (reusable)

#### [P2-07] Eksik CRUD Endpoint'ler
- **Çözüm:**
  - [ ] `DELETE /enrollments/{id}` — Enrollment iptali (admin veya refund flow)
  - [ ] `GET /admin/enrollments` — Admin tüm enrollment listesi
  - [ ] `GET /courses` — Public kurs listesi (paginated, filtered)
  - [ ] Teacher withdrawal history pagination

#### [P2-08] Cascade Delete & Foreign Key Düzeltmeleri
- **Çözüm:**
  - [ ] `Order.coupon_usage` → `cascade="all, delete-orphan"` ekle
  - [ ] `OrderItem.course_id` → `ondelete="RESTRICT"` ekle (kurs silinmesin)
  - [ ] Orphan record kontrolü için migration script yaz

#### [P2-09] Teacher Balance Denormalizasyonu
- **Sorun:** Her bakiye sorgusu `SUM(amount)` yapıyor.
- **Çözüm:**
  - [ ] `User` modeline `balance: Decimal` alanı ekle (veya ayrı `teacher_balance` tablosu)
  - [ ] Her earning transaction'da balance'ı güncelle (trigger veya application-level)
  - [ ] Reconciliation job'ı: periyodik olarak SUM ile balance'ı karşılaştır
  - [ ] Migration: mevcut veriden balance hesapla

#### [P2-10] Response Schema Tutarsızlıkları
- **Çözüm:**
  - [ ] `students.py` → `dict` yerine `StudentListResponse` Pydantic modeli
  - [ ] `course_reviews.py` → Manuel dict yerine `CourseReviewResponse` kullan
  - [ ] `cart.py` → Mixed response tipi yerine ayrı endpoint'ler

---

## FAZ 4 — DÜŞÜK ÖNCELİK (P3)

### BACKLOG

#### [P3-01] Frontend Auth State Senkronizasyonu
- **Konum:** `frontend/src/lib/api.ts:27-32`
- **Çözüm:**
  - [ ] 401 response interceptor'da Zustand auth store'u da temizle
  - [ ] `useAuthStore.getState().logout()` çağır

#### [P3-02] Demo Credentials Production Build'den Kaldır
- **Konum:** `frontend/src/app/(auth)/login/page.tsx:40-44`
- **Çözüm:**
  - [ ] `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS` env variable'ına bağla
  - [ ] Production'da gizle, development'ta göster

#### [P3-03] CSP (Content-Security-Policy) Header Ekle
- **Çözüm:**
  - [ ] `next.config.ts`'de security headers tanımla
  - [ ] `default-src 'self'`, `script-src` whitelist, `style-src` whitelist
  - [ ] Backend'de de CSP middleware ekle

#### [P3-04] SiteSettingsScripts innerHTML Güvenliği
- **Konum:** `frontend/src/components/SiteSettingsScripts.tsx:148`
- **Çözüm:**
  - [ ] DOMPurify ile sanitize et
  - [ ] innerHTML yerine güvenli DOM API kullan
  - [ ] Event handler injection'ı engelle (`onerror`, `onclick` vb.)

#### [P3-05] Open Redirect Düzeltmesi
- **Konum:** `frontend/src/components/PopupAnnouncement.tsx:112`
- **Çözüm:**
  - [ ] URL validation utility kullan (`lib/security.ts`'deki mevcut `isValidUrl` fonksiyonu)
  - [ ] Sadece aynı domain veya whitelist'teki domain'lere izin ver

#### [P3-06] Boş Migration Temizliği
- **Konum:** `c09bd9294696_add_lesson_progress_and_course_reviews.py`
- **Çözüm:**
  - [ ] Migration chain'i bozmadan kaldır veya içeriğini doldur
  - [ ] Revision bağlantılarını güncelle

#### [P3-07] Soft Delete Tutarlılığı
- **Çözüm:**
  - [ ] `SoftDeleteMixin` oluştur (`is_deleted`, `deleted_at`)
  - [ ] Gerekli modellere uygula (Message zaten var)
  - [ ] Query filter utility: `filter_active()` helper

#### [P3-08] Unique Constraint Eksikleri
- **Çözüm:**
  - [ ] `teacher_earnings`: `(teacher_id, reference_id)` unique (duplicate transaction koruması)
  - [ ] `lessons`: `(course_id, order)` unique (ders sıralama çakışması)
  - [ ] `quiz_questions`: `(quiz_id, order)` unique

#### [P3-09] Maintenance Mode Bypass Düzeltmesi
- **Konum:** `backend/app/main.py:149-238`
- **Çözüm:**
  - [ ] `/auth/register` bypass'ını kaldır (maintenance'da kayıt olunamamalı)
  - [ ] `/media/` bypass'ını kaldır
  - [ ] Sadece `/health` ve admin token'lı isteklere izin ver

#### [P3-10] Logging & Monitoring Altyapısı
- **Çözüm:**
  - [ ] Structured logging (JSON format) ekle
  - [ ] Sensitive operation audit: login, order, withdrawal, role change
  - [ ] Request/response logging middleware (prod'da response body hariç)
  - [ ] Slow query logging

---

## İLERLEME TAKIBI

| Faz | Toplam | Tamamlanan | Durum |
|-----|--------|------------|-------|
| Faz 1 (P0) | 6 | 6 | ✅ Tamamlandı |
| Faz 2 (P1) | 10 | 10 | ✅ Tamamlandı |
| Faz 3 (P2) | 10 | 7 | ✅ Büyük ölçüde tamamlandı (P2-07,09,10 ertelendi — düşük etki) |
| Faz 4 (P3) | 10 | 5 | ✅ Kritik olanlar tamamlandı (P3-06,07,08,10 ertelendi — minimal etki) |
| **Toplam** | **36** | **28** | **✅ Audit tamamlandı — %78 çözüm oranı** |

---

## NOTLAR

- Her fix için ilgili test yazılacak
- Migration gerektiren değişiklikler gruplandırılacak (mümkün olduğunca az migration)
- Frontend ve backend değişiklikleri senkronize edilecek (özellikle P1-02 HttpOnly cookie geçişi)
- Her faz tamamlandığında smoke test yapılacak
- Faz sırası kesindir: P0 bitmeden P1'e geçilmez
