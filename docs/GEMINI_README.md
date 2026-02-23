# BiHocam - Proje Genel Bakış (Gemini Review)

Bu dosya, BiHocam projesinin teknik ve iş mantığı mimarisini tek bir noktadan anlamak isteyen geliştiriciler ve paydaşlar için hazırlanmıştır.

## 🚀 Proje Vizyonu
BiHocam, Türkiye pazarındaki sınav hazırlık (YKS, LGS vb.) odağını yapay zeka ve modern bir SAAS altyapısıyla birleştirmeyi amaçlayan kapsamlı bir LMS (Learning Management System) platformudur.

## 🏗️ Teknik Mimari Özeti

### Backend (Python/FastAPI)
- **Performans:** Asenkron (`async/await`) mimari ile yüksek eşzamanlılık.
- **Güvenlik:** OAuth2 (JWT) tabanlı Access/Refresh token mekanizması.
- **Veritabanı:** PostgreSQL + SQLAlchemy 2.0 (Modern Mapped modelleri).
- **Test:** Pytest ile %80+ kritik kod kapsamı (In-memory SQLite testleri).

### Frontend (Next.js/TypeScript)
- **Rendering:** Next.js 16+ App Router ile sunucu taraflı hız ve SEO.
- **State Management:** 
    - **Sunucu Durumu:** React Query (Veri çekme, önbellekleme).
    - **İstemci Durumu:** Zustand (Auth, UI tercihleri).
- **Styling:** Tailwind CSS + Framer Motion (Modern ve akıcı UI).

## 🧩 Kritik İş Mantığı (Domain Knowledge)

1.  **Multi-Tenant Hazırlığı:** Veritabanında `organization_id` yapısı hazırdır. Bu, platformun gelecekte dershanelere ve okullara özel portallar (white-label) açabileceğinin kanıtıdır.
2.  **Komisyon Sistemi:** Platform, her satıştan varsayılan **%35** pay alır. Bu oran `backend/app/services/commission.py` üzerinden merkezi olarak yönetilir.
3.  **Kurs Erişim Kontrolü:** Dersler `is_preview` bayrağına sahiptir. Satın alım öncesi sadece bu dersler izlenebilir; satın alım (Enrollment) sonrası tüm kurs açılır.

## 📁 Bilgi Kaynakları (Knowledge Base)

Detaylı teknik ve iş dökümanları için `DOCS.MD/` klasörüne göz atın:
- [Ana Bilgi Bankası](./DOCS.MD/MASTER_KNOWLEDGE_BASE.md)
- [Geliştirici Rehberi](./DOCS.MD/DEVELOPER_GUIDE.md)
- [Teknik Kararlar](./DOCS.MD/ARCHITECTURE_DECISIONS.md)
- [Terimler Sözlüğü](./DOCS.MD/GLOSSARY.md)

---
*Son Güncelleme: Şubat 2026*
