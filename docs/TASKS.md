# BiHocam - Aktif Görevler ve Yapılacaklar

Bu dosya, BiHocam projesinin aktif geliştirme görevlerini ve öncelikli yapılacakları içerir.

**Son Güncelleme**: 2025-01-23

---

## 🎯 Öncelikli Görevler (Yüksek Öncelik)

### 1. Video Player ve Local Video Upload Entegrasyonu 🎥

**Durum**: 🔴 Yüksek Öncelik (Aktif)  
**Tahmini Süre**: 3-4 gün

**Not**: Test işi ertelendi, uygulama geliştirmesine odaklanılıyor.

#### Backend Görevleri
- [ ] Video upload endpoint (`POST /api/v1/lessons/{lesson_id}/upload-video`)
- [ ] Local file storage yapısı (media/videos/ klasörü)
- [ ] Video streaming endpoint (`GET /api/v1/media/videos/{filename}`)
- [ ] Video dosya validasyonu (format, boyut)
- [ ] Video metadata extraction (duration, vb.)
- [ ] Lesson'a video path kaydetme (`content_path` field)

#### Frontend Görevleri
- [ ] Video upload formu (eğitmen için ders ekleme/düzenleme)
- [ ] Video player component (HTML5 video veya react-player)
- [ ] Video kontrolleri (play, pause, seek, volume, fullscreen)
- [ ] Hız ayarlama (0.5x - 2x)
- [ ] İlerleme takibi (her 10 saniyede backend'e gönder)
- [ ] Otomatik oynatma (kullanıcı tercihi)
- [ ] Klavye kısayolları (space, arrow keys)
- [ ] Loading ve error state'leri
- [ ] Video streaming (local file'dan)

#### Backend Gereksinimleri
- [ ] `POST /api/v1/lessons/{lesson_id}/upload-video` - Video upload
- [ ] `GET /api/v1/media/videos/{filename}` - Video streaming
- [ ] `POST /api/v1/courses/{course_id}/lessons/{lesson_id}/progress` - Mevcut ✅
- [ ] Config: `MEDIA_ROOT` path (local storage için)

**Sayfalar**: 
- `/dashboard/courses/[courseId]/[lessonId]` - Video izleme
- `/dashboard/my-courses/[id]` - Video upload (eğitmen)

**Not**: Şimdilik local file storage kullanılacak. İleride S3/Google Cloud entegrasyonu yapılacak.

---

### 3. Quiz UI Geliştirmeleri 📝

**Durum**: 🟡 Orta Öncelik  
**Tahmini Süre**: 2-3 gün

#### Görevler
- [ ] Quiz başlangıç ekranı (kurallar, önceki denemeler)
- [ ] Quiz çözme arayüzü:
  - [ ] Soru gösterimi (metin, görsel, video)
  - [ ] Çoktan seçmeli cevap seçenekleri
  - [ ] Soru navigasyonu (önceki/sonraki)
  - [ ] Soru listesi (tüm sorular, cevaplanan işaretli)
  - [ ] Süre sayacı (geri sayım)
- [ ] Quiz sonuç ekranı:
  - [ ] Toplam puan ve yüzde
  - [ ] Geçti/Kaldı durumu
  - [ ] Her soru için detaylı sonuç
  - [ ] Doğru cevap gösterimi
- [ ] Quiz geçmişi (önceki denemeler)

#### Backend Gereksinimleri
- [ ] `GET /api/v1/quizzes/{quiz_id}` - Mevcut ✅
- [ ] `POST /api/v1/quizzes/{quiz_id}/attempt` - Mevcut ✅
- [ ] `POST /api/v1/quizzes/attempts/{attempt_id}/submit` - Mevcut ✅
- [ ] `GET /api/v1/quizzes/attempts/{attempt_id}` - Mevcut ✅

**Sayfa**: `/dashboard/quizzes/[quizId]`

---

### 4. Eğitmen Paneli İyileştirmeleri 👨‍🏫

**Durum**: 🟡 Orta Öncelik  
**Tahmini Süre**: 4-5 gün

#### Kurs Düzenleme
- [ ] Kurs düzenleme sayfası (`/dashboard/my-courses/[id]/edit`)
- [ ] Thumbnail yükleme/değiştirme
- [ ] Kurs durumu değiştirme (draft → published → archived)
- [ ] Kurs yayınlama/arşivleme butonları

#### Ders Yönetimi
- [ ] Ders ekleme formu (mevcut endpoint var ✅)
- [ ] Ders düzenleme (`PATCH /api/v1/lessons/{lesson_id}` - **Eksik**)
- [ ] Ders silme (`DELETE /api/v1/lessons/{lesson_id}` - **Eksik**)
- [ ] Ders sıralama (drag & drop)

#### Kazanç ve Analiz
- [ ] Kazanç sayfası (`/dashboard/earnings`)
- [ ] Toplam kazanç gösterimi
- [ ] Aylık/haftalık kazanç grafikleri
- [ ] Kurs bazında kazanç listesi
- [ ] Satış istatistikleri
- [ ] Komisyon detayları

#### Backend Gereksinimleri
- [ ] `PATCH /api/v1/lessons/{lesson_id}` - Ders güncelleme
- [ ] `DELETE /api/v1/lessons/{lesson_id}` - Ders silme
- [ ] `GET /api/v1/teachers/{teacher_id}/earnings` - Kazançlar
- [ ] `GET /api/v1/teachers/{teacher_id}/statistics` - İstatistikler
- [ ] `GET /api/v1/courses/{course_id}/students` - Öğrenci listesi

---

### 5. Arama ve Filtreleme Geliştirmeleri 🔍

**Durum**: 🟢 Düşük Öncelik  
**Tahmini Süre**: 1-2 gün

#### Görevler
- [ ] Backend'de full-text search (PostgreSQL)
- [ ] Kategori filtreleme (çoklu seçim)
- [ ] Fiyat aralığı slider'ı
- [ ] Eğitmen filtreleme (dropdown)
- [ ] Puan filtreleme (yıldız bazlı)
- [ ] Sıralama seçenekleri:
  - [ ] En yeni
  - [ ] En popüler
  - [ ] En ucuz / En pahalı
  - [ ] En yüksek puan
- [ ] Filtreleri temizleme butonu
- [ ] Aktif filtrelerin gösterimi (badge'ler)

#### Backend Gereksinimleri
- [ ] `GET /api/v1/courses/?search=...&category=...&price_min=...&price_max=...&sort=...`
- [ ] PostgreSQL full-text search index'leri

**Sayfa**: `/courses`

---

## 🚀 Production Hazırlığı (Kritik)

### 6. Environment ve Config Yönetimi ⚙️

**Durum**: 🔴 Yüksek Öncelik  
**Tahmini Süre**: 1 gün

#### Görevler
- [ ] `.env.example` dosyaları (backend ve frontend)
- [ ] Environment variable validation
- [ ] Config dosyalarını dokümante et
- [ ] Production/staging/development config ayrımı
- [ ] Secret management (production için)

---

### 7. Logging ve Monitoring 📊

**Durum**: 🔴 Yüksek Öncelik  
**Tahmini Süre**: 2-3 gün

#### Backend
- [ ] Structured logging (JSON format)
- [ ] Log levels (DEBUG, INFO, WARNING, ERROR)
- [ ] Request/response logging middleware
- [ ] Error tracking (Sentry veya benzeri)
- [ ] Performance monitoring (APM)

#### Frontend
- [ ] Error boundary'ler
- [ ] Client-side error tracking
- [ ] Performance monitoring
- [ ] User analytics (opsiyonel)

---

### 8. Rate Limiting ve Güvenlik 🔒

**Durum**: 🔴 Yüksek Öncelik  
**Tahmini Süre**: 1-2 gün

#### Görevler
- [ ] API rate limiting (FastAPI middleware)
- [ ] CORS yapılandırması (production için)
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] SQL injection prevention (SQLAlchemy zaten var ✅)
- [ ] XSS prevention (React otomatik escape ✅)

---

### 9. Email Doğrulama ve Bildirimler 📧

**Durum**: 🟡 Orta Öncelik  
**Tahmini Süre**: 2-3 gün

#### Görevler
- [ ] Email doğrulama sistemi (kayıt sonrası)
- [ ] Email template'leri
- [ ] Email servis entegrasyonu (SendGrid, AWS SES, vb.)
- [ ] Bildirim sistemi:
  - [ ] Kurs güncellemeleri
  - [ ] Yeni mesajlar
  - [ ] Ödeme bildirimleri
  - [ ] Sertifika kazanımı
- [ ] Bildirim merkezi (frontend dropdown)
- [ ] Bildirim geçmişi sayfası

#### Backend Gereksinimleri
- [ ] Email service integration
- [ ] Notification model ve endpoints
- [ ] Background job queue (Celery veya benzeri)

---

### 10. Redis Cache ve Queue 🗄️

**Durum**: 🟢 Düşük Öncelik (Scale için)  
**Tahmini Süre**: 2-3 gün

#### Görevler
- [ ] Redis cache entegrasyonu
- [ ] Cache stratejisi (course list, stats, vb.)
- [ ] Background job queue (Celery + Redis)
- [ ] Cache invalidation stratejisi

**Not**: Şu an için gerekli değil, scale edildiğinde eklenebilir.

---

## 💳 Ödeme Entegrasyonu (En Sona Atıldı)

### 11. Ödeme Gateway Entegrasyonu 💰

**Durum**: 🟢 Düşük Öncelik (En sona atıldı)  
**Tahmini Süre**: 3-4 gün

#### Görevler
- [ ] Ödeme gateway seçimi (İyzico, Stripe, vb.)
- [ ] Checkout sayfası (`/checkout`)
- [ ] Ödeme formu (kredi kartı)
- [ ] Ödeme işlemi (backend)
- [ ] Ödeme başarılı/başarısız durumları
- [ ] Webhook handling (ödeme callback)
- [ ] Fatura oluşturma (PDF)
- [ ] Sipariş onay sayfası (`/orders/[orderId]`)

#### Backend Gereksinimleri
- [ ] `POST /api/v1/orders/{order_id}/checkout` - Ödeme işlemi
- [ ] Webhook endpoint
- [ ] Invoice generation

**Not**: Şu an order sistemi var, sadece ödeme entegrasyonu eksik.

---

## 🎨 UI/UX İyileştirmeleri

### 12. Kullanıcı Profil Sayfası 👤

**Durum**: 🟢 Düşük Öncelik  
**Tahmini Süre**: 1 gün

#### Görevler
- [ ] Profil bilgileri görüntüleme
- [ ] Profil düzenleme (ad, soyad, e-posta, telefon, profil fotoğrafı)
- [ ] Şifre değiştirme
- [ ] Bildirim tercihleri
- [ ] Hesap silme

**Sayfa**: `/dashboard/settings`

---

### 13. Sertifika Sistemi 🏆

**Durum**: 🟢 Düşük Öncelik  
**Tahmini Süre**: 2 gün

#### Görevler
- [ ] Sertifika modeli (backend)
- [ ] Sertifika oluşturma (kurs tamamlandığında)
- [ ] Sertifika görüntüleme sayfası
- [ ] Sertifika indirme (PDF)
- [ ] Sertifika doğrulama (QR kod)
- [ ] Sertifika paylaşma (sosyal medya)

#### Backend Gereksinimleri
- [ ] Certificate model
- [ ] PDF generation
- [ ] QR code generation

---

### 14. Loading ve Error State İyileştirmeleri ⚡

**Durum**: 🟡 Orta Öncelik  
**Tahmini Süre**: 1 gün

#### Görevler
- [ ] Loading skeleton'ları (tüm sayfalarda)
- [ ] Error boundary'ler (React)
- [ ] Toast notification sistemi
- [ ] Form validation mesajları
- [ ] 404 sayfası iyileştirme
- [ ] 500 sayfası (error page)

---

## 🐛 Bug Fixes ve İyileştirmeler

### Tamamlanan Bug Fixes ✅

- ✅ Course reviews enrollment kontrolü aktif edildi
- ✅ Quiz attempts enrollment kontrolü eklendi
- ✅ Quiz detay enrollment kontrolü eklendi
- ✅ Cart'ta draft kurs kontrolü eklendi
- ✅ Frontend teacher link'leri düzeltildi
- ✅ My course detail route'ları düzeltildi
- ✅ Course detail'de published kontrolü eklendi
- ✅ Lesson access kontrolü (enrolled/owner) eklendi

### Bekleyen İyileştirmeler

- [ ] Session yönetimi iyileştirmeleri
- [ ] Form validasyonları (client-side)
- [ ] Accessibility (a11y) iyileştirmeleri
- [ ] SEO optimizasyonları (meta tags, structured data)
- [ ] Dark mode desteği (opsiyonel)

---

## 📋 Öncelik Sıralaması

### Faz 1: Kritik (Hemen Yapılmalı)
1. ✅ **Yetkilendirme ve Güvenlik Audit** - Tamamlandı
2. 🔴 **Video Player ve Local Video Upload** - Yüksek öncelik (Aktif)
3. 🔴 **Environment ve Config Yönetimi** - Yüksek öncelik
4. 🔴 **Logging ve Monitoring** - Yüksek öncelik
5. 🔴 **Rate Limiting ve Güvenlik** - Yüksek öncelik

### Faz 2: Önemli (Yakın Zamanda)
6. 🟢 **Test Kapsamı Genişletme** - Ertelendi (uygulama geliştirmesine odaklanılıyor)
7. 🟡 **Quiz UI Geliştirmeleri** - Orta öncelik
8. 🟡 **Eğitmen Paneli İyileştirmeleri** - Orta öncelik
9. 🟡 **Email Doğrulama ve Bildirimler** - Orta öncelik
10. 🟡 **Loading ve Error State İyileştirmeleri** - Orta öncelik

### Faz 3: İyileştirmeler (Daha Sonra)
11. 🟢 **Arama ve Filtreleme Geliştirmeleri** - Düşük öncelik
12. 🟢 **Kullanıcı Profil Sayfası** - Düşük öncelik
13. 🟢 **Sertifika Sistemi** - Düşük öncelik
14. 🟢 **Redis Cache ve Queue** - Düşük öncelik (scale için)
15. 🟢 **Ödeme Gateway Entegrasyonu** - En sona atıldı

---

## 📊 İlerleme Takibi

### Tamamlanan Görevler ✅
- ✅ Backend yetkilendirme audit ve bug fixes
- ✅ Frontend route ve link düzeltmeleri
- ✅ Geliştirme dokümantasyonu (DEVELOPMENT.md)

### Devam Eden Görevler 🔄
- 🔄 Video Player ve Local Video Upload (aktif geliştirme)

### Bekleyen Görevler ⏳
- ⏳ Quiz UI geliştirmeleri
- ⏳ Quiz UI geliştirmeleri
- ⏳ Eğitmen paneli iyileştirmeleri
- ⏳ Production hazırlığı

---

## 📝 Notlar

- **Ödeme entegrasyonu**: En sona atıldı, şu an order sistemi var, sadece gateway entegrasyonu eksik
- **Test coverage**: Şu an temel testler var, kritik akışlar için daha fazla test gerekli
- **Production**: Henüz production'a hazır değil, önce logging, monitoring, rate limiting eklenmeli
- **Scale**: Redis cache ve queue şu an için gerekli değil, scale edildiğinde eklenebilir

---

## 🔗 İlgili Dokümantasyon

- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Geliştirme dokümantasyonu
- [README.md](README.md) - Proje genel bilgileri
- [TODO.md](TODO.md) - Frontend odaklı detaylı TODO listesi

---

**Son Güncelleme**: 2025-01-23  
**Toplam Tahmini Süre (Faz 1 + Faz 2)**: 20-30 gün
