# BiHocam - Pitch Deck
## Turkiye'nin AI Destekli Online Egitim Platformu

---

## SLIDE 1: KAPAK

**BiHocam**
Turkiye'nin AI Destekli Online Egitim Platformu

*"Ogretmenler icin gelir, ogrenciler icin bilgi, kurumlar icin buyume"*

www.bihocam.com

---

## SLIDE 2: PROBLEM

### Turkiye'de Online Egitim Pazarinin Sorunlari

- **Ogretmenler icin:** Bilgi ve yeteneklerini paraya donusturecek platform yok. Mevcut platformlar yuksek komisyon kesiyor (%50-70), teknik altyapi kurma zorlugu var.

- **Ogrenciler icin:** Kaliteli, Turkce icerigin bulundugu guvenilir bir platform eksikligi. Yabanci platformlarda dil bariyeri ve odeme zorlugu.

- **Kurumlar icin:** Calisanlarini egitmek icin uygun fiyatli, olceklenebilir bir cozum yok. Kurumsal egitim yazilimlari pahali ve karmasik.

**Pazar Buyuklugu:**
- Turkiye online egitim pazari: 2.8 milyar TL (2025)
- Yillik buyume: %25+
- Global e-learning pazari: $400B+ (2027 tahmini)

---

## SLIDE 3: COZUM

### BiHocam — Hepsi Bir Arada Egitim Ekosistemi

BiHocam, ogretmenlerin kurs olusturup satabildigi, ogrencilerin guvenle satin alip ogrenebildigi, kurumlarin takim egitimlerini yonetebildigi **pazaryeri modelli** bir online egitim platformudur.

**3 Temel Deger Onerisi:**

1. **Ogretmenler icin:** Kurs olustur, fiyatla, sat. Dusuk komisyon (%35). Kazancini takip et, cekim talebi olustur.

2. **Ogrenciler icin:** Binlerce Turkce kurs. Guvenli odeme (PayTR). Sertifika kazan. Ilerleme takibi.

3. **Kurumlar icin:** Ozel kurs atamalari, ekip yonetimi, ilerleme raporlari. Toplu lisanslama.

---

## SLIDE 4: URUN — ANA OZELLIKLER

### Platform Ozellikleri

**Kurs Yonetimi**
- Coklu ders turleri: Video, PDF, Dokuman, Sunum, Quiz, Canli Ders, Metin
- Surukle-birak ders siralama
- Kurs onay akisi (taslak → inceleme → yayin)
- SEO optimizasyonlu kurs sayfalari

**E-Ticaret Altyapisi**
- Sepet sistemi
- PayTR ile guvenli odeme (kredi karti, taksit)
- Kupon ve kampanya sistemi (yuzde, sabit, site geneli, otomatik uygulama)
- Pazaryeri modeli — ogretmene otomatik odeme

**Ogrenme Deneyimi**
- Video oynatici (YouTube/Vimeo/yerel video destegi)
- PDF goruntuleci
- Canli ders entegrasyonu (Zoom, Google Meet, Teams)
- Quiz sistemi (coktan secmeli, dogru/yanlis, kisa cevap)
- Ders ilerleme takibi
- Kurs tamamlama sertifikasi (QR kodlu dogrulama)

**Iletisim ve Bildirim**
- Ogretmen-ogrenci mesajlasma
- 30+ bildirim turu (uygulama ici + email)
- Site geneli ve popup duyurular
- Blog/CMS sistemi

---

## SLIDE 5: URUN — ADMIN PANELI

### Guclu Yonetim Araci

- **Kullanici Yonetimi:** 5 rol (Admin, Personel, Kurum, Ogretmen, Ogrenci)
- **Finans Yonetimi:** Komisyon takibi, ogretmen kazanclari, cekim talepleri, iade islemleri
- **Icerik Moderasyonu:** Kurs onay/red akisi, yorum moderasyonu
- **Analitik Dashboard:** Gelir grafikleri, kullanici buyumesi, kurs performansi, ogretmen analizi
- **Reklam Yonetimi:** Banner, one cikan kurs, sidebar, inline reklam alanlari
- **CRM:** Hedef kitle olusturma, email kampanyalari, sablonlar
- **Site Ayarlari:** Genel ayarlar, SMTP, bakim modu, SEO

---

## SLIDE 6: TEKNOLOJI

### Modern ve Olceklenebilir Mimari

**Backend**
- Python FastAPI (async/await — yuksek performans)
- PostgreSQL 16 (guvenilir veritabani)
- SQLAlchemy 2.0 (modern ORM)
- Redis (onbellek ve kuyruk yonetimi)
- JWT Authentication (guvenli kimlik dogrulama)

**Frontend**
- Next.js 16 (React 19, App Router)
- TypeScript 5 (tip guvenligi)
- Tailwind CSS 4 (modern tasarim)
- Zustand + React Query (durum yonetimi)

**Altyapi**
- Docker konteynerizasyon
- Nginx reverse proxy
- SSL/TLS sifreleme
- Rate limiting ve CORS korumasi

**Guvenlik (Denetlenmis)**
- 36 maddelik guvenlik denetimi tamamlandi (%78 cozum orani)
- OWASP Top 10 uyumlulugu
- HttpOnly cookie tabanli kimlik dogrulama
- HMAC-SHA256 odeme imzalama
- XSS, CSRF, SQL Injection korumalari

---

## SLIDE 7: IS MODELI

### Gelir Akislari

**1. Platform Komisyonu (%35)**
Her kurs satisinda platform %35 komisyon alir. Ogretmen %65 kazanir.
- Ornek: 100 TL kurs → Platform 35 TL, Ogretmen 65 TL

**2. Reklam Geliri**
Ogretmenler kurslarini one cikarabilen reklam kampanyalari olusturabilir.
- Banner reklamlar
- One cikan kurs yerlesimleri
- Gunluk sabit, goruntulenme basina, tiklanma basina fiyatlandirma

**3. Kurumsal Lisanslama (Gelecek)**
Sirketlere ozel egitim paketleri, toplu kurs atamasi, ilerleme raporlari.

**4. Premium Abonelik (Gelecek)**
Aylik/yillik abonelik ile tum kurslara erisim modeli.

---

## SLIDE 8: PAZARYERI MODELI

### PayTR Entegrasyonu ile Guvenli Odeme

```
Ogrenci odeme yapar
    ↓
PayTR guvenli odeme altyapisi (iFrame — PCI-DSS uyumlu)
    ↓
Odeme basarili → Kurs erisimi acilir
    ↓
Platform komisyonu otomatik hesaplanir
    ↓
Ogretmen cekim talebi olusturur
    ↓
Admin onaylar → PayTR Platform Transfer API
    ↓
Ogretmenin IBAN'ina para gider
```

- Kredi karti ve taksit destegi (12 aya kadar)
- Kismi ve tam iade destegi
- Test modu ile guvenli gelistirme
- TL, USD, EUR, GBP para birimi destegi

---

## SLIDE 9: GELECEK PLANLARI — AI ENTEGRASYONU

### BiHocam AI — Yapay Zeka ile Egitimi Donusturmek

**Faz 1: AI Icerik Asistani (Q3 2026)**
- Ogretmenler icin AI destekli kurs olusturma sihirbazi
- Kurs aciklamasi, SEO basliklari, ders plani otomatik onerisi
- Quiz sorulari otomatik olusturma (kurs iceriginden)
- Video transkripsiyon ve alt yazi olusturma

**Faz 2: Kisisellestirilmis Ogrenme (Q4 2026)**
- AI destekli ogrenme yolu onerisi (ogrenci seviyesine gore)
- Akilli quiz — zorluk seviyesi otomatik ayarlama
- Ogrenci performans tahmini ve erken uyari sistemi
- Konu bazli zayif nokta analizi ve ek icerik onerisi

**Faz 3: AI Ogretmen Asistani (Q1 2027)**
- Her kursa ozel AI chatbot — ogrenciler ders hakkinda soru sorabilir
- Canli ders sirasinda AI destekli soru-cevap
- Otomatik odev degerlendirme (metin bazli)
- Ogretmene ogrenci sorulari ozet raporu

**Faz 4: Tam Otonom Egitim (Q2 2027)**
- AI tarafindan olusturulan mikro-kurslar
- Ses ve goruntu tabanli interaktif dersler
- Gercek zamanli dil ceviri (Turkce → Ingilizce, Arapca vb.)
- AI mentor — 7/24 kisisel ogretmen
- Sirketler icin AI destekli yetkinlik degerlendirmesi

---

## SLIDE 10: REKABET ANALIZI

### BiHocam'in Farki

| Ozellik | BiHocam | Udemy | BTK Akademi | Khanacademy |
|---------|---------|-------|-------------|-------------|
| Turkce icerik odagi | ✅ | ❌ | ✅ | ❌ |
| Dusuk komisyon | %35 | %63 | — | — |
| Pazaryeri modeli | ✅ | ✅ | ❌ | ❌ |
| Kurumsal cozum | ✅ | ✅ | ❌ | ❌ |
| AI entegrasyonu | ✅ (planlanan) | Sinirli | ❌ | Sinirli |
| Canli ders | ✅ | ❌ | ❌ | ❌ |
| Reklam platformu | ✅ | ❌ | ❌ | ❌ |
| Yerel odeme (PayTR) | ✅ | ❌ | — | ❌ |
| Sertifika (QR kodlu) | ✅ | ✅ | ✅ | ❌ |
| Blog/CMS | ✅ | ❌ | ❌ | ❌ |
| Mesajlasma | ✅ | ✅ | ❌ | ❌ |

**Temel Rekabet Avantajlari:**
1. Turkiye pazarina ozel tasarim (dil, odeme, yasal uyumluluk)
2. Dusuk komisyon orani — ogretmenler icin cazip
3. AI-first yaklasim — gelecege yatirim
4. Hem B2C hem B2B model destegi

---

## SLIDE 11: YATIRIM IHTIYACI

### Yatirim Turu: Tohum (Seed)

**Talep Edilen Yatirim:** [TUTAR]

**Kullanim Alanlari:**
- %40 — Urun gelistirme (AI entegrasyonu, mobil uygulama)
- %25 — Pazarlama ve kullanici edinimi
- %20 — Ekip buyutme (yazilimci, icerik uzmani, satis)
- %15 — Altyapi ve isletme giderleri

**Hedef Kilometre Taslari (12 ay):**
- 500+ aktif ogretmen
- 2.000+ kurs
- 50.000+ kayitli ogrenci
- 10+ kurumsal musteri
- AI icerik asistani lansmanı
- Mobil uygulama (iOS + Android)
- Aylik 500K TL GMV (Brut Mal Degeri)

---

## SLIDE 12: EKIP

### Summarify

BiHocam, **Summarify** bunyesinde gelistirilen bir urundir.

[Ekip uyeleri ve deneyimleri buraya eklenecek]

**Teknik Altyapi:**
- 400+ kaynak kodu dosyasi
- 30+ veritabani tablosu
- 40+ API modulu
- 76 otomatik test
- Uretim ortamina hazir mimari

---

## SLIDE 13: KAPANIŞ

### BiHocam — Turkiye'nin Egitim Devriminin Baslangici

**Vizyon:** Turkiye'nin en buyuk AI destekli online egitim ekosistemi olmak.

**Misyon:** Her ogretmenin bilgisini paraya donusturebildigi, her ogrencinin kaliteli egitime ulasabildigi, her kurumun ekibini gelistirebildigi bir platform yaratmak.

*"Egitim degisirse, Turkiye degisir."*

📧 [email]
🌐 www.bihocam.com
📱 [telefon]

---

## EK SLIDE: TEKNIK DETAYLAR (Sorulursa)

### Platform Istatistikleri

- **Backend:** 140+ Python dosyasi, FastAPI async framework
- **Frontend:** 141 TypeScript/React dosyasi, Next.js 16
- **Veritabani:** 30+ tablo, 27 migration dosyasi
- **API:** 40+ endpoint modulu, Swagger/ReDoc dokumantasyonu
- **Guvenlik:** 28/36 audit maddesi tamamlandi
- **Test:** 76 otomatik test (unit + integration)
- **Odeme:** PayTR iFrame API (kredi karti, taksit, iade, transfer)
- **Bildirim:** 30+ bildirim turu, email + uygulama ici
- **Icerik:** Video, PDF, Quiz, Canli Ders, Metin, Sunum, Dokuman

### Mimari Diyagram

```
[Ogrenci/Ogretmen/Admin]
        ↓
[Next.js 16 Frontend — React 19, Tailwind CSS]
        ↓ (HTTPS API)
[FastAPI Backend — Python Async]
        ↓
[PostgreSQL 16] [Redis 7] [PayTR API]
        ↓
[Docker] [Nginx] [SSL/TLS]
```
