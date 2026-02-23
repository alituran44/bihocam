# BiHocam - Detayli Ozellik Listesi

## Tamamlanan Ozellikler

### 1. Kullanici Yonetimi

#### 1.1 Kayit Sistemi
- [x] Email ile kayit
- [x] Sifre guvenligi (bcrypt hash)
- [x] Rol secimi (ogrenci/ogretmen)
- [x] Email dogrulama altyapisi (hazir, aktif degil)

#### 1.2 Giris Sistemi
- [x] Email/sifre ile giris
- [x] JWT token tabanli oturum
- [x] Access Token (15 dakika)
- [x] Refresh Token (7 gun)
- [x] Demo hesap destegi
- [x] "Beni hatirla" secenegi

#### 1.3 Rol Tabanli Erisim
- [x] Admin rolu - Tam yetki
- [x] Staff rolu - Operasyon yetkileri
- [x] Organization rolu - Kurum yonetimi
- [x] Teacher rolu - Kurs yonetimi
- [x] Student rolu - Ogrenci erisimi

### 2. Kurs Yonetimi

#### 2.1 Kurs Olusturma
- [x] 5 adimli wizard arayuzu
- [x] Otomatik slug uretimi (Turkce karakter destegi)
- [x] Kurs aciklamasi
- [x] SEO meta bilgileri (title, description)
- [x] Thumbnail URL destegi
- [x] Demo video URL (YouTube/Vimeo)

#### 2.2 Fiyatlandirma
- [x] Normal fiyat belirleme
- [x] Indirimli fiyat
- [x] Ucretsiz kurs secenegi
- [x] Indirim yuzdesi hesaplama

#### 2.3 Kurs Durumlari
- [x] DRAFT - Taslak (sadece egitmen gorebilir)
- [x] PUBLISHED - Yayinda (herkes gorebilir)
- [x] ARCHIVED - Arsivlenmis

#### 2.4 Ders Yonetimi
- [x] Video dersi (yerel dosya)
- [x] Video dersi (YouTube URL)
- [x] Video dersi (Vimeo URL)
- [x] PDF dersi
- [x] Quiz dersi
- [x] Ders siralama (order)
- [x] Onizleme dersi (ucretsiz)
- [x] Ders suresi belirleme

#### 2.5 Video Oynatici
- [x] YouTube embed
- [x] Vimeo embed
- [x] Yerel video oynatma
- [x] Responsive tasarim

### 3. Quiz Sistemi

#### 3.1 Quiz Olusturma
- [x] Derse bagli quiz
- [x] Quiz basligi ve aciklamasi
- [x] Gecme notu belirleme (%0-100)
- [x] Zaman limiti (dakika)
- [x] Maksimum deneme sayisi
- [x] Soru karistirma secenegi
- [x] Dogru cevaplari gosterme secenegi

#### 3.2 Soru Tipleri
- [x] Coktan Secmeli (A, B, C, D)
- [x] Dogru/Yanlis
- [x] Kisa Cevap

#### 3.3 Soru Ozellikleri
- [x] Soru metni
- [x] Secenekler (JSON format)
- [x] Dogru cevap
- [x] Puan degeri
- [x] Siralama (order)
- [x] Aciklama (explanation)

#### 3.4 Quiz Deneme
- [x] Deneme baslatma
- [x] Cevap gonderme
- [x] Otomatik puanlama
- [x] Sonuc gosterimi
- [x] Deneme suresi takibi
- [x] Deneme gecmisi

### 4. E-Ticaret

#### 4.1 Sepet
- [x] Kursu sepete ekleme
- [x] Sepetten cikarma
- [x] Sepet temizleme
- [x] Mukerrer ekleme engeli
- [x] Kayitli kursu ekleme engeli
- [x] Fiyat kontrolu

#### 4.2 Siparis
- [x] Sepetten siparis olusturma
- [x] Siparis numarasi (ORD-YYYYMMDD-XXXX)
- [x] Siparis durumlari (PENDING, PAID, FAILED, REFUNDED, CANCELLED)
- [x] Siparis detayi goruntuleme
- [x] Siparis gecmisi

#### 4.3 Komisyon Sistemi
- [x] Platform komisyonu (%35 varsayilan)
- [x] Egitmen kazanci hesaplama
- [x] Siparis basina komisyon kaydi

#### 4.4 Kupon Sistemi
- [x] Kupon kodu olusturma
- [x] Yuzde indirim
- [x] Sabit tutar indirimi
- [x] Maksimum indirim limiti
- [x] Kullanim limiti (global)
- [x] Kullanim limiti (kullanici basina)
- [x] Gecerlilik tarihi (baslangic/bitis)
- [x] Kupon dogrulama
- [x] Kupon kullanim kaydi

### 5. Kayit (Enrollment)

#### 5.1 Kurs Kaydi
- [x] Siparis sonrasi otomatik kayit
- [x] Kurs erisim kontrolu
- [x] Benzersiz kullanici-kurs kaydi

#### 5.2 Ilerleme Takibi
- [x] Ilerleme yuzdesi (%0-100)
- [x] Son erisim zamani
- [x] Tamamlanma tarihi
- [x] Ders bazli ilerleme

#### 5.3 Ders Ilerlemesi
- [x] Izlenen sure (saniye)
- [x] Ders tamamlama durumu
- [x] Kaldigi yerden devam

### 6. Degerlendirme

#### 6.1 Kurs Yorumlari
- [x] 1-5 yildiz puanlama
- [x] Yorum basligi
- [x] Yorum metni
- [x] Yorum sahibi bilgisi
- [x] Bir kullanici = bir yorum kurali

#### 6.2 Istatistikler
- [x] Ortalama puan
- [x] Toplam yorum sayisi
- [x] Yorum listesi

### 7. Egitmen Modulu

#### 7.1 Egitmen Paneli
- [x] Kurs listesi
- [x] Kurs olusturma
- [x] Kurs duzenleme
- [x] Ders yonetimi
- [x] Ogrenci sayisi goruntuleme

#### 7.2 Istatistikler
- [x] Toplam kurs sayisi
- [x] Aktif kurs sayisi
- [x] Bekleyen (taslak) kurs sayisi
- [x] Toplam ogrenci
- [x] Kazanc bilgileri

#### 7.3 Egitmen Profili
- [x] Herkese acik profil sayfasi
- [x] Egitmen kurslari
- [x] Egitmen bilgileri

### 8. Ogrenci Modulu

#### 8.1 Ogrenci Paneli
- [x] Kayitli kurslar
- [x] Devam eden kurslar
- [x] Tamamlanan kurslar
- [x] Ilerleme istatistikleri
- [x] Siparis gecmisi

#### 8.2 Kurs Izleme
- [x] Ders listesi goruntuleme
- [x] Video izleme
- [x] PDF goruntuleme
- [x] Quiz cozme
- [x] Ilerleme kaydi

### 9. Arayuz (UI/UX)

#### 9.1 Tasarim Sistemi
- [x] Tailwind CSS
- [x] Glassmorphism efektleri
- [x] Gradient renkler
- [x] Responsive tasarim
- [x] Mobile-first yaklasim

#### 9.2 Bilesenler
- [x] Header (navigasyon)
- [x] Footer
- [x] Kurs karti
- [x] Skeleton loading
- [x] Butonlar
- [x] Form elemanlari
- [x] Modallar
- [x] Toast bildirimleri

#### 9.3 Sayfalar
- [x] Ana sayfa (landing)
- [x] Kurs listesi
- [x] Kurs detayi
- [x] Egitmen listesi
- [x] Egitmen profili
- [x] Giris sayfasi
- [x] Kayit sayfasi
- [x] Sepet
- [x] Dashboard (ogrenci)
- [x] Dashboard (egitmen)
- [x] Kurs izleme
- [x] Ayarlar

---

## Yapilacak Ozellikler

### Faz 1: Temel Iyilestirmeler

#### 1.1 AI Asistan
- [ ] OpenAI/Claude API entegrasyonu
- [ ] Konu bazli soru-cevap
- [ ] Ders ozeti olusturma
- [ ] Soru uretme
- [ ] Chat arayuzu

#### 1.2 Canli Ders
- [ ] WebRTC entegrasyonu
- [ ] Video konferans
- [ ] Ekran paylasimi
- [ ] Interaktif whiteboard
- [ ] Ders kaydi
- [ ] Kayit tekrar izleme

#### 1.3 Bildirim Sistemi
- [ ] Email bildirimleri
- [ ] Push notifications (web)
- [ ] SMS entegrasyonu
- [ ] Bildirim tercihleri

#### 1.4 Odeme Entegrasyonu
- [ ] Iyzico entegrasyonu
- [ ] PayTR entegrasyonu
- [ ] 3D Secure odeme
- [ ] Taksit secenekleri
- [ ] Fatura kesimi

### Faz 2: Gelismis Ozellikler

#### 2.1 Oyunlastirma
- [ ] Rozet sistemi
- [ ] Liderlik tablosu
- [ ] Gunluk seri (streak)
- [ ] Puan sistemi
- [ ] Seviye sistemi
- [ ] Basarimlar

#### 2.2 Sosyal Ozellikler
- [ ] Forum/Tartisma alani
- [ ] Ogrenci gruplari
- [ ] Ozel mesajlasma
- [ ] Icerik paylasimi
- [ ] Begeni/Kaydet

#### 2.3 Gelismis Analitik
- [ ] Ogrenci davranis analizi
- [ ] Kurs performans metrikleri
- [ ] Egitmen dashboard analitikleri
- [ ] A/B test altyapisi
- [ ] Heatmap analizi

#### 2.4 Icerik Ozellikleri
- [ ] Rich text editor (TipTap/Lexical)
- [ ] Ders notlari
- [ ] Ders eki (dosya)
- [ ] Altyazi destegi
- [ ] Coklu dil destegi

### Faz 3: Kurumsal Ozellikler

#### 3.1 Multi-Tenant
- [ ] White-label portal
- [ ] Ozel subdomain
- [ ] Marka ozellestirme
- [ ] Ozel tema/renkler
- [ ] Ozel logo

#### 3.2 Kurum Yonetimi
- [ ] Bulk kullanici davet
- [ ] CSV import
- [ ] Grup yonetimi
- [ ] Departman yapisi
- [ ] Raporlama

#### 3.3 Entegrasyonlar
- [ ] SCORM uyumlulugu
- [ ] xAPI (Tin Can)
- [ ] LTI entegrasyonu
- [ ] SSO (SAML/OAuth)
- [ ] API marketplace

### Faz 4: Mobil ve Genisletme

#### 4.1 Mobil Uygulama
- [ ] React Native app
- [ ] iOS uygulamasi
- [ ] Android uygulamasi
- [ ] Cevrimdisi izleme
- [ ] Push bildirimler

#### 4.2 TV Uygulamalari
- [ ] Android TV
- [ ] Apple TV
- [ ] Fire TV

#### 4.3 Diger
- [ ] Chrome extension
- [ ] Desktop app (Electron)

---

## Ozellik Onceliklendirme

| Ozellik | Oncelik | Etki | Efor |
|---------|---------|------|------|
| Iyzico Entegrasyonu | Kritik | Yuksek | Orta |
| AI Asistan | Yuksek | Yuksek | Yuksek |
| Canli Ders | Yuksek | Yuksek | Yuksek |
| Bildirim Sistemi | Orta | Orta | Dusuk |
| Oyunlastirma | Orta | Yuksek | Orta |
| White-label | Dusuk | Yuksek | Yuksek |
| Mobil App | Dusuk | Yuksek | Yuksek |

---

*Son Guncelleme: Subat 2026*
