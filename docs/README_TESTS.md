# Test Dokümantasyonu

Bu dokümantasyon, BiHocam projesi için backend ve frontend testlerini açıklar.

## Backend Testleri

### Kurulum

```bash
cd backend
pip install -r requirements.txt
```

### Test Çalıştırma

```bash
# Tüm testleri çalıştır
pytest

# Verbose mod
pytest -v

# Belirli bir test dosyası
pytest tests/test_auth.py

# Coverage ile
pytest --cov=app --cov-report=html
```

### Test Yapısı

- **conftest.py**: Pytest fixtures ve test yapılandırması
  - `db_session`: Her test için yeni database session
  - `client`: FastAPI test client
  - `test_user`, `test_teacher`, `test_admin`: Test kullanıcıları
  - `auth_headers_*`: Authentication headers

- **test_auth.py**: Authentication endpoint testleri
  - Kayıt (student/teacher)
  - Giriş
  - Me endpoint

- **test_courses.py**: Courses endpoint testleri
  - Kurs listeleme
  - Kurs oluşturma
  - Kurs güncelleme
  - Yetki kontrolleri

- **test_lesson_progress.py**: Lesson progress testleri
  - İlerleme getirme
  - İlerleme güncelleme
  - Ders tamamlama

- **test_course_reviews.py**: Course reviews testleri
  - Yorum listeleme
  - Yorum oluşturma
  - İstatistikler

- **test_enrollments.py**: Enrollment testleri
  - Kayıt listeleme

### Test Database

Testler in-memory SQLite database kullanır. Her test için yeni bir database oluşturulur ve test sonunda temizlenir.

## Frontend Testleri

### Kurulum

```bash
cd frontend
npm install
```

### Test Çalıştırma

```bash
# Tüm testleri çalıştır
npm test

# Watch mod
npm run test:watch

# Coverage ile
npm run test:coverage
```

### Test Yapısı

- **jest.config.js**: Jest yapılandırması
- **jest.setup.js**: Test setup ve mock'lar

- **__tests__/lib/api.test.ts**: API client testleri
- **__tests__/lib/store.test.ts**: Zustand store testleri
- **__tests__/components/Header.test.tsx**: Component testleri
- **__tests__/app/courses/page.test.tsx**: Page component testleri

### Mock'lar

- `next/navigation`: Next.js router
- `localStorage`: Browser storage
- `window.matchMedia`: Media queries
- `axios`: HTTP client

## Test Kapsamı

### Backend

✅ Authentication API
✅ Courses API
✅ Lesson Progress API
✅ Course Reviews API
✅ Enrollments API
✅ Yetki kontrolleri
✅ Error handling

### Frontend

✅ API client
✅ Zustand store
✅ Component rendering
✅ User interactions (kısmi)

## Coverage Hedefleri

- Backend: %80+ coverage
- Frontend: %70+ coverage

## CI/CD Entegrasyonu

Testler CI/CD pipeline'ında otomatik çalıştırılabilir:

```yaml
# GitHub Actions örneği
- name: Run Backend Tests
  run: |
    cd backend
    pytest --cov=app --cov-report=xml

- name: Run Frontend Tests
  run: |
    cd frontend
    npm test -- --coverage
```

## Sorun Giderme

### Backend

- **Database connection errors**: Test database URL'ini kontrol edin
- **Import errors**: `__init__.py` dosyalarını kontrol edin
- **Async errors**: `pytest-asyncio` yüklü olduğundan emin olun

### Frontend

- **Jest not found**: `npm install` çalıştırın
- **Type errors**: `@types/jest` yüklü olduğundan emin olun
- **Module resolution**: `tsconfig.json` paths'i kontrol edin
