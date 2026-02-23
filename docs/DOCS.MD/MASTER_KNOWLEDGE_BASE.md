# BiHocam Master Knowledge Base (KB)

Bu belge, BiHocam platformuna ait tüm teknik, işsel ve operasyonel bilginin ana indeksidir. Başka bir bağlamda (başka bir AI asistanı veya kurumsal dokümantasyon) kullanılmak üzere "taşınabilir" (portable) şekilde tasarlanmıştır.

## 📌 İçerik Tablosu

1. [İş Mantığı ve Terimler (Glossary)](./GLOSSARY.md)
2. [Mimari Kararlar (ADR)](./ARCHITECTURE_DECISIONS.md)
3. [Geliştirici Rehberi (Onboarding)](./DEVELOPER_GUIDE.md)
4. [Özellik Listesi (Features)](./FEATURES.md)
5. [Yol Haritası (Roadmap)](./ROADMAP.md)
6. [API Referansı](./API_REFERENCE.md)
7. [Veritabanı Şeması](./DATABASE_SCHEMA.md)

## 🎯 Ürün Özeti
BiHocam, eğitmenlerin kendi kurslarını oluşturup satabildiği, kurumların (dershane/okul) kendi kapalı sistemlerini yönetebildiği yapay zeka destekli bir e-öğrenme pazaryeridir.

## 🛠️ Temel Karakteristikler
- **Language:** Python (Backend), TypeScript (Frontend)
- **Primary Frameworks:** FastAPI, Next.js
- **Business Model:** Komisyon bazlı (%35) + Abonelik (Gelecekte)
- **Target Market:** Türkiye (YKS, LGS, Okul Takviye)

## 🔍 Domain Bilgisi
BiHocam evreninde bir "Kurs", birden fazla "Ders" (Video, PDF, Quiz) içerir. Bir öğrencinin kursa erişmesi için bir "Enrollment" (Kayıt) kaydı olması gerekir. Bu kayıt ya bir "Order" (Siparis) sonrası ya da manuel/kurumsal atama ile oluşur.

---
*Bu Knowledge Base, projenin kaynak kodları ve mevcut dokümanları analiz edilerek Gemini tarafından oluşturulmuştur.*
