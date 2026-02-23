# Mimari Karar Kayıtları (Architecture Decisions)

Bu dosya, BiHocam projesinde seçilen teknolojilerin ve mimari yaklaşımların teknik gerekçelerini (Rationale) içerir.

## 1. Backend: FastAPI Seçimi
**Karar:** Arka uç için Python ve FastAPI kullanılması.
**Gerekçe:** 
- **Performans:** Asenkron (`asyncio`) desteği sayesinde aynı anda binlerce öğrencinin ders izleme verilerini işleyebilir.
- **Tip Güvenliği:** Pydantic entegrasyonu ile veri doğrulama otomatik yapılır, hata payı azalır.
- **Dökümantasyon:** Swagger (OpenAPI) otomatik olarak üretilir, frontend entegrasyonu hızlanır.

## 2. Frontend: Next.js App Router
**Karar:** Next.js 16+ ve App Router mimarisi.
**Gerekçe:**
- **SEO ve Hız:** Kurs sayfalarının Server-Side Rendering (SSR) ile sunulması, Google aramalarında üst sıralarda çıkmayı sağlar.
- **Layout Yönetimi:** Dashboard ve Auth sayfaları gibi farklı arayüzlerin (layout) kolayca ayrıştırılması.
- **Modern React:** React 19 özelliklerinin (Server Components) kullanılarak istemci tarafındaki JavaScript yükünün azaltılması.

## 3. State Management: React Query + Zustand
**Karar:** Veri çekme için React Query, UI durumu için Zustand.
**Gerekçe:**
- **Caching:** React Query, kurs listesi gibi sık değişmeyen verileri bellekte tutarak gereksiz API isteklerini önler.
- **Sadelik:** Zustand, Redux gibi karmaşık yapılara göre çok daha hafif ve performanslıdır. Kullanıcı oturum bilgileri (`useAuthStore`) için idealdir.
- **Persistence:** Zustand `persist` middleware ile kullanıcı login bilgileri tarayıcı kapansa bile korunur.

## 4. Veritabanı: PostgreSQL ve UUID
**Karar:** İlişkisel veritabanı (PostgreSQL) ve Birincil Anahtar olarak UUID kullanımı.
**Gerekçe:**
- **İlişkiler:** Kurs-Ders-Öğrenci arasındaki karmaşık ilişkileri yönetmek için SQL vazgeçilmezdir.
- **Güvenlik (UUID):** Sıralı ID'lerin (1, 2, 3...) kullanılmaması, dışarıdan sistemdeki toplam kullanıcı veya kurs sayısının tahmin edilmesini ve basit ID tarama saldırılarını engeller.
- **Dağıtık Yapı:** Gelecekte veritabanı sharding (bölümleme) yapılırsa UUID'ler çakışma riskini ortadan kaldırır.

## 5. Güvenlik: Refresh Token Mekanizması
**Karar:** Sadece Access Token değil, Refresh Token kullanımı.
**Gerekçe:**
- Access token'ların ömrü kısa (30 dk) tutularak çalınma riski azaltılır.
- Kullanıcı deneyimi bozulmadan (tekrar login olmadan) Refresh token ile yeni Access token alınabilir.

---
*Bilgi Bankası Kaydı - Gemini*
