# BiHocam - Proje Geliştirme Rehberi

Bu proje, bir Next.js frontend ve FastAPI backend uygulamasından oluşur. Projede Y Combinator GStack yapay zeka mühendislik ekipleri ve iş akışları entegre edilmiştir.

## Çalıştırma Komutları

### Backend (FastAPI)
- Sunucuyu Başlatma: `.\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload` (Cwd: `backend`)
- Migrasyon Çalıştırma: `.\venv\Scripts\python run_migration_manual.py` (Cwd: `backend`)
- Kullanıcı Import: `.\venv\Scripts\python scripts/import_real_users.py` (Cwd: `backend`)

### Frontend (Next.js)
- Sunucuyu Başlatma: `npm run dev` (Cwd: `frontend`)
- Yapı Derleme: `npm run build` (Cwd: `frontend`)

## GStack Entegrasyonu

GStack komutları bu projede kullanılabilir.
- Web tarama işlemleri için her zaman GStack'in `/browse` yeteneğini kullanın.
- `mcp__claude-in-chrome__*` araçlarını kullanmayın.

### Kullanılabilir GStack Komutları (Slash Commands)
- `/office-hours` : Ürün planlama soruları ve mimari tasarım
- `/plan-ceo-review` : Kapsam genişletme/daraltma ve stratejik değerlendirme
- `/plan-eng-review` : Veri akışı, durum makineleri ve test planı çıkarma
- `/plan-design-review` : Tasarım sistemini ve AI slop kontrolünü gerçekleştirme
- `/review` : Kod kalitesi, bug tespiti ve standart kontrolü
- `/investigate` : Sistematik hata tespiti ve hata giderme
- `/qa` : Playwright tabanlı gerçek tarayıcı testleri
- `/ship` : Testleri doğrulama, commit mesajları yazma ve PR oluşturma
- `/learn` : Öğrenilen davranışları gelecek oturumlar için kaydetme
