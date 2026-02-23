# Geliştirici Rehberi (Developer Onboarding)

Bu rehber, BiHocam projesine yeni katılan geliştiriciler veya sistemi analiz eden teknik sistemler için hazırlanmıştır.

## 🛠️ Kurulum Adımları

### 1. Backend (FastAPI)
- **Gereksinimler:** Python 3.10+, PostgreSQL.
- **Kurulum:**
  ```bash
  cd backend
  python -m venv venv
  source venv/bin/activate  # Windows: venv\Scripts\activate
  pip install -r requirements.txt
  ```
- **Veritabanı:** `.env` dosyasını oluşturun ve `DATABASE_URL`'i ayarlayın. Ardından migrationları çalıştırın:
  ```bash
  alembic upgrade head
  ```
- **Çalıştırma:**
  ```bash
  uvicorn app.main:app --reload
  ```

### 2. Frontend (Next.js)
- **Gereksinimler:** Node.js 18+, npm/yarn.
- **Kurulum:**
  ```bash
  cd frontend
  npm install
  ```
- **Çalıştırma:**
  ```bash
  npm run dev
  ```

## 📐 Kod Standartları

### Backend Standartları
- **Tip Belirtme:** Tüm fonksiyonlarda Type Hinting zorunludur.
- **Modeller:** SQLAlchemy 2.0 `Mapped` ve `mapped_column` sözdizimi kullanılır.
- **Endpointler:** Yanıtlar için her zaman Pydantic şemaları (`response_model`) kullanılmalıdır.
- **Hata Yönetimi:** Custom exceptionlar `HTTPException` üzerinden, önceden tanımlanmış hata kodlarıyla (`COURSE_SLUG_EXISTS` vb.) dönülmelidir.

### Frontend Standartları
- **Bileşenler:** Fonksiyonel bileşenler ve Tailwind CSS kullanılır.
- **Data Fetching:** API çağrıları `src/lib/api.ts` içindeki merkezi servisler üzerinden, `react-query` ile yapılmalıdır.
- **Dosya Yapısı:** Rota bazlı sayfalar `src/app` altında, genel bileşenler `src/components` altında toplanır.

## 🧪 Test Stratejisi
- **Backend:** `pytest` ile test edilir. Testler `backend/tests` altındadır.
- **Frontend:** `jest` ve `react-testing-library` kurulu durumdadır.

## 🚀 Deployment Notları
- **Docker:** Proje Dockerize edilmeye hazırdır. `backend/` ve `frontend/` içinde Dockerfile hazırlıkları mevcuttur.
- **Media:** Videolar ve görseller şimdilik `backend/media` altında tutulur. Production'da S3/GCS entegrasyonu önerilir.

---
*Geliştirici Bilgi Bankası - Gemini*
