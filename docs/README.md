# BiHocam: Modern Eğitim Platformu (Detailed)

## Proje Vizyonu
BiHocam, basit bir video izleme portalından öte, kurumların kendi eğitim süreçlerini yönetebildiği (B2B) ve eğitmenlerin gelişmiş pazarlama araçlarıyla gelir elde edebildiği profesyonel bir ekosistemdir.

## Versiyon Takvimi (Güncellendi)

### V0.1: Temeller
- Kullanıcı Rolleri (Admin, Öğretmen, Öğrenci, Kurum).
- Video Kurs Portalı ve Ödeme Entegrasyonu.
- **Pazarlama**: Kupon ve Sepet İndirimi sistemi.

### V1.0: Akademik Derinlik
- **Eğitim**: Quiz oluşturucu, Ödev yükleme ve Otomatik Sertifika.
- **Kurumlar**: Kurum bazlı öğretmen/öğrenci yönetimi ve özel kurslar.
- **Görüşmeler**: Danışmanlık ve Randevu (Meeting) sistemi.

### V2.0: Otomasyon ve Ölçekleme
- **Pazarlama**: Terk edilmiş sepet kurtarma (Abandoned Cart) ve Cashback.
- **Finans**: Otomatik komisyon hesaplama (Varsayılan %35) ve Payout dashboard.
- **Gamification**: Rozetler ve Forum etkileşim puanları.

## Gelir Modeli Detayları
1. **Pazar Yeri Komisyonu**: Her satışta %35 platform payı (Ayarlanabilir).
2. **Kurumsal SaaS**: Organizasyonlar için aylık/yıllık kullanım bedeli.
3. **Pazarlama Servisleri**: Eğitmenlere özel "Öne Çıkarılan Kurs" veya "Banner Reklam" ücretlendirmesi.

## Uygulama Adımları
1. **Core Architecture**: FastAPI + Next.js projesinin multi-tenant uyumlu kurulması.
2. **Auth & Identity**: SSO (Single Sign-On) ve detaylı RBAC.
3. **Education Engine**: Kurs oluşturma wizard'ı ve içerik dağıtım sistemi.
4. **Marketing & Payouts**: Kupon mantığı ve finansal modülün inşası.
5. **Organizasyon Paneli**: Kurumsal yönetim dashboard'larının tasarımı.
