# BiHocam Frontend Remake Planı

Bu doküman, BiHocam arayüzünü baştan, modern ve profesyonel bir eğitim platformu seviyesine çıkarmak için yapılacak işleri özetler. Referans alınan platformlar:

- Sorbil (`https://www.sorbil.org/`)
- Udemy (`https://www.udemy.com`)
- BTK Akademi (`https://www.btkakademi.gov.tr/`)

## 1. Genel Tasarım Prensipleri

- **Odak**: Kurs keşfi, güven (sosyal kanıt), dönüşüm (kayıt ol / kursa başla), eğitmen tarafı ve kurumlar.
- **Stil**:
  - Temiz, airy layout (bol whitespace), net görsel hiyerarşi.
  - 1 ana accent rengi (örn. mavi) + 1 secondary (mor/yeşil) + nötr gri paleti.
  - Sorbil/BTK’daki gibi yumuşak gradient’ler, kartlar ve section arkaplan blokları.
- **Tipografi**:
  - Başlıklar için kalın, net bir sans-serif (mevcut Geist uygun).
  - Gövde metinleri 16–18px, satır aralıkları rahat.
- **Bileşen dili**:
  - Kartlar, butonlar, etiketler, rozetler, ikonlu listeler.
  - Tutarlı border-radius (örn. 0.75rem), shadow seviyeleri, hover efektleri.
- **Responsiveness**:
  - Mobile-first, 3 breakpoint: mobil, tablet, desktop.
  - Header/nav mobilde sade, hamburger menü ile.

## 2. Yeni Landing (Ana Sayfa) Bilgi Mimarisi

Landing, Sorbil / Udemy / BTK Akademi karışımı, ancak BiHocam’a özel bir akışla tasarlanacak.

### 2.1. Global Yapı

- **Yeni Header** (tüm public sayfalarda ortak):
  - Sol: BiHocam logosu (metin + küçük logomark).
  - Orta: Ana navigasyon (Kurslar, Kategoriler, Eğitmenler, Kurumsal, Fiyatlandırma).
  - Sağ: Arama ikonlu buton, “Giriş Yap”, “Ücretsiz Kaydol” (primary CTA).
  - Üst kampanya bandı (isteğe bağlı): Sorbil’deki gibi “%30 indirim / yıllık abonelik” vb.
- **Footer**:
  - Kategoriler, Kurumsal, Yasal, Destek, Sosyal medya, kısa value proposition.

### 2.2. Landing Bölümleri

1. **Hero Section (Yeni tasarım)**
   - Sol:
     - Büyük value proposition: “Canlı ve kayıtlı derslerle sınavlara ve kariyerine hazırlan.”
     - Kısa açıklama + 2 ana segment butonu: “Öğrenci İçin”, “Eğitmen İçin”.
     - Ana CTA: “Kursları Keşfet”, secondary CTA: “Ücretsiz Kaydol”.
   - Sağ:
     - Kurs kartları / canlı ders / video player mockup içeren illüstrasyon veya UI preview.
   - Alt satır: Güven rozetleri (ör. “X+ öğrenci”, “Y+ ders”, “7/24 destek”).

2. **Arama + Kategori Kısayolları**
   - Geniş arama barı: “Ne öğrenmek istiyorsun?” (Udemy tarzı).
   - Altında popüler kategori butonları (YKS, LGS, Matematik, Yazılım, Dil vb.).

3. **Öne Çıkan Kategoriler / Öğrenim Yolları**
   - Sorbil ve BTK gibi grid veya horizontal scroll:
     - “Sınav Hazırlık”, “Lise/Ortaokul”, “Üniversite Destek”, “Yazılım & Veri”, “Dil Kursları”.
   - Her kartta kısa açıklama + kurs sayısı + CTA: “Yolu Gör”.

4. **Öne Çıkan Kurslar / Kampanyalı Kurslar**
   - Udemy benzeri kurs kartları:
     - Thumbnail, başlık, eğitmen adı, rating (şimdilik static), fiyat/indirim etiketi.
   - Sekmeler: “Popüler”, “Yeni Eklenenler”, “İndirimdekiler”.

5. **Eğitmen / Kurumsal Değer Önerisi**
   - İki kolon:
     - Sol: “Eğitmenler için” – BiHocam ile kendi akademini kur, gelir paylaşımı, analitikler.
     - Sağ: “Kurumlar için” – Çalışan eğitimleri, özel panel, raporlama.
   - Her birinde ikonlu maddeler + CTA: “Eğitmen Ol”, “Kurumsal Demo Al”.

6. **Nasıl Çalışır? (3–4 adımlı şema)**
   - 1) Kayıt Ol, 2) Kurs Seç, 3) İzle ve Test Çöz, 4) Sertifikanı Al.

7. **Sosyal Kanıt & Yorumlar**
   - Örnek öğrenci yorumları (placeholder), yıldızlar, kısa success story kartları.

8. **SSS + Son CTA Bloğu**
   - 5–6 maddelik SSS (Sorbil’in SSS alanı gibi).
   - Altında geniş CTA: “Hemen Ücretsiz Kaydol” butonu.

## 3. Platform (Dashboard + Kurs Sayfaları) Remake Çerçevesi

Bu sprintte öncelik landing; fakat genel remake için çerçeve:

- **Dashboard Layout**:
  - Daha sade sidebar (ikon + label), üstte rol switch / profil menüsü.
  - Ana içerikte kartlar, grafikler, hızlı aksiyonlar (Udemy Instructor panel + Sorbil admin miks).
- **Kurs Detay Sayfası**:
  - Sağda sabit “Bu kursa başla” kartı, solda video/hero + içerik.
  - Sorbil/BTK’deki gibi “Bu kursta neler öğreneceksiniz”, seviye, süre, alt başlıklar.
- **Oynatıcı / Ders Sayfası**:
  - Sol: Ders listesi (accordion), orta: video + notlar, sağ: quiz/ek dosyalar (ileride).

Bu bölümdeki detaylı görevler daha sonra ayrı tasklara açılacak.

## 4. Teknik ve Tasarım Sistemi

- **Design Tokens**:
  - `colors`: primary, secondary, success, warning, danger, neutral tonları.
  - `font-sizes`, `spacing`, `radius`, `shadow` seviyeleri.
- **UI Kit (React bileşen seviyesinde)**:
  - `Button`, `Input`, `Badge`, `Card`, `SectionHeader`, `StatsCard`, `CourseCard`, `CategoryPill`.
- **Uygulama**:
  - Tailwind config’te renk ve font değişiklikleri.
  - Ortak layout bileşenleri: `PublicLayout`, `DashboardLayout`.

## 5. Yapılacaklar (Remake Odaklı)

### 5.1. Landing Remake (İlk Öncelik)

- [ ] `Header` bileşenini yeniden tasarla:
  - Daha sade kampanya bandı (opsiyonel), net ana navigation, arama ikonu/buton.
- [ ] `page.tsx` için yeni layout:
  - Yeni hero, arama + kategori kısayolları, kategori blokları, öne çıkan kurslar, eğitmen/kurumsal blok, SSS, güçlü CTA.
- [ ] “dummy” metrik ve yorum içerikleri ile gerçek bir ürün hissi ver.
- [ ] Mobile ve tablet için özel layout düzenlemeleri.

### 5.2. Tasarım Sistemi

- [ ] Tailwind üzerinden yeni renk paletini tanımla (light theme).
- [ ] Button / Card / Section başlığı gibi tekrarlayan pattern’leri ortak bileşene çek.
- [ ] Header / Footer bileşenlerini tüm public sayfalarda yeniden kullan.

### 5.3. Sonraki Adımlar (Dashboard + Kurs Ekranları)

- [ ] Öğrenci dashboard’unu yeni design system’e göre yeniden giydir.
- [ ] Eğitmen dashboard’unu (kurs, gelir, öğrenci) Sorbil/Udemy kıvamında profesyonel hale getir.
- [ ] Kurs detay ve ders izleme sayfalarını yeni kart/section diline göre güncelle.

