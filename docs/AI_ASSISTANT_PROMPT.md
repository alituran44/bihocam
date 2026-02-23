# 🤖 AI Asistan Yönlendirme Prompt'u

Bu prompt'u yeni bir chat'te kullanarak, önceki asistanın yaklaşımını ve yaptığı işleri anlatabilirsin.

---

## 📋 Önceki Asistanın Yaptığı İşler

### 🔍 Backend-Frontend API Gap Analizi

**Görev:** Backend'de tanımlı olup frontend'den erişilemeyen endpoint'leri tespit etmek ve düzeltmek.

**Yaklaşım:**
1. **Sistematik Analiz:**
   - Backend router dosyasını (`backend/app/api/v1/router.py`) incele
   - Tüm endpoint dosyalarını (`backend/app/api/v1/endpoints/*.py`) tarayarak `@router.get/post/put/patch/delete` decorator'larını bul
   - Frontend API client dosyasını (`frontend/src/lib/api.ts`) incele
   - Her endpoint için frontend'de karşılığı var mı kontrol et

2. **Eksiklik Tespiti:**
   - Backend'de var ama router'da include edilmemiş endpoint'ler
   - Backend'de var ama frontend API client'ında olmayan endpoint'ler
   - Frontend'de kısmen eksik olan API'ler (sadece bazı fonksiyonlar var)

3. **Çözüm Uygulama:**
   - Router'a eksik endpoint'leri ekle
   - Frontend API client'ına eksik fonksiyonları ekle
   - TypeScript interface'lerini tanımla
   - Linter hatalarını kontrol et ve düzelt

4. **Dokümantasyon:**
   - Detaylı analiz raporu oluştur (`BACKEND_FRONTEND_API_GAP_ANALYSIS.md`)
   - Tespit edilen eksiklikleri kategorize et (Kritik, Orta, Düşük öncelik)
   - Çözüm önerileri ve kullanım senaryoları ekle

### 🎯 Tespit Edilen ve Düzeltilen Eksiklikler

#### 1. Quizzes API (Kritik)
- **Sorun:** Backend'de 6 endpoint var ama router'da include edilmemiş
- **Çözüm:**
  - `backend/app/api/v1/router.py`'ye `quizzes.router` eklendi
  - Frontend'e `quizzesApi` client'ı eklendi (create, get, addQuestion, startAttempt, submitAttempt, getAttempt)
  - Tüm TypeScript interface'leri tanımlandı

#### 2. Users API (Kısmen Eksik)
- **Sorun:** `GET /users/{id}` ve `PATCH /users/{id}` frontend'de yoktu
- **Çözüm:** `usersApi.get()` ve `usersApi.update()` eklendi

#### 3. Coupons API (Kısmen Eksik)
- **Sorun:** Sadece `validate` fonksiyonu vardı, CRUD eksikti
- **Çözüm:** `list`, `get`, `create`, `update`, `delete` fonksiyonları eklendi

---

## 🛠️ Çalışma Prensipleri

### 1. Sistematik Yaklaşım
- Önce mevcut durumu analiz et
- Eksiklikleri kategorize et (Kritik, Orta, Düşük)
- Öncelik sırasına göre çöz

### 2. Detaylı Kontrol
- Sadece endpoint isimlerini değil, parametreleri ve response type'larını da kontrol et
- TypeScript interface'lerini backend schema'larla uyumlu tut
- Linter hatalarını mutlaka kontrol et

### 3. Dokümantasyon
- Yapılan değişiklikleri dokümante et
- Analiz raporları oluştur
- Kullanım senaryolarını belirt

### 4. Kod Kalitesi
- TypeScript type safety'ye dikkat et
- Error handling ekle
- Consistent naming conventions kullan

---

## 📝 Örnek Çalışma Akışı

```
1. Kullanıcı: "Backend'de olup frontend'den erişilemeyen bir şey var mı?"

2. Asistan:
   - Backend router'ı oku
   - Tüm endpoint dosyalarını tarayarak endpoint listesi çıkar
   - Frontend API client'ını oku
   - Karşılaştırma yap
   - Eksiklikleri tespit et
   - Analiz raporu oluştur
   - Eksiklikleri düzelt
   - Linter kontrolü yap
   - Özet sun
```

---

## 🎯 Beklenen Çıktılar

1. **Analiz Raporu:**
   - Eksik endpoint'lerin listesi
   - Öncelik sıralaması
   - Kullanım senaryoları
   - Çözüm önerileri

2. **Kod Değişiklikleri:**
   - Backend router güncellemeleri
   - Frontend API client güncellemeleri
   - TypeScript interface tanımları

3. **Dokümantasyon:**
   - Değişiklik özeti
   - Kullanım örnekleri
   - İleride yapılacaklar listesi

---

## 💡 İpuçları

- **Grep kullan:** `grep -r "@router\." backend/app/api/v1/endpoints` gibi komutlarla hızlı tarama yap
- **Codebase search:** Semantic search ile endpoint'leri bul
- **Dosya karşılaştırma:** Backend ve frontend dosyalarını yan yana oku
- **Linter kontrolü:** Her değişiklikten sonra linter çalıştır
- **Türkçe yanıt:** Kullanıcı Türkçe konuşuyor, yanıtlar Türkçe olmalı

---

## 🔗 İlgili Dosyalar

- `backend/app/api/v1/router.py` - Ana router dosyası
- `backend/app/api/v1/endpoints/*.py` - Endpoint tanımları
- `frontend/src/lib/api.ts` - Frontend API client
- `BACKEND_FRONTEND_API_GAP_ANALYSIS.md` - Analiz raporu

---

**Not:** Bu prompt'u kullanarak, yeni bir asistan benzer bir analiz ve düzeltme işlemi yapabilir. Sistematik yaklaşım ve detaylı kontrol önemlidir.
