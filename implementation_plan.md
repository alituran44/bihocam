# BiHocam Eksik Kısımların GStack + ECC Standartlarına Göre Tamamlanması

Bu plan, projede Faz 3 (P2) ve Faz 4 (P3) kapsamında eksik bırakılan veya ertelenen kritik backend bileşenlerini, veri şeması tutarsızlıklarını, N+1 sorgu problemlerini ve eksik admin yönetim API'lerini temiz, güvenli ve test edilebilir bir şekilde tamamlamayı hedefler.

## User Review Required

> [!IMPORTANT]
> **Geriye Dönük Uyumluluk (Backward Compatibility):**
> * **`cart.py` Sepet API'si:** Sepet GET isteği eskiden `with_campaign` parametresi `False` iken düz `list[CartItemResponse]` listesi, `True` iken ise `CartWithCampaignResponse` nesnesi dönüyordu. Bu durum frontend tarafında dinamik tip kontrolü zorunluluğu (mixed response type) yaratıyordu. Bu planda API'yi her zaman tek ve tutarlı bir nesne olan `CartWithCampaignResponse` döndürecek şekilde güncelliyoruz.
> * **`CourseReviewResponse` Şeması:** Yorum yanıtlarında `user` alanı serbest formatta bir `dict` olarak dönüyordu. Bunu `ReviewUserResponse` adında tip korumalı bir alt şema ile değiştiriyoruz.

---

## Proposed Changes

### 1. Şemalar (Schemas)

#### [NEW] [student.py](file:///C:/Users/Hp/Desktop/GitHub/bihocam/backend/app/schemas/student.py)
* Admin paneli öğrenci listeleme işlemleri için tip korumalı şemalar oluşturulacaktır.
```python
from datetime import datetime
from pydantic import BaseModel, EmailStr

class StudentListItem(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login_at: datetime | None = None
    enrollment_count: int
    order_count: int
    last_activity_at: datetime | None = None

    class Config:
        from_attributes = True

class StudentListResponse(BaseModel):
    total: int
    items: list[StudentListItem]
    skip: int
    limit: int
```

#### [MODIFY] [course_review.py](file:///C:/Users/Hp/Desktop/GitHub/bihocam/backend/app/schemas/course_review.py)
* `CourseReviewResponse` içerisindeki `user: dict | None = None` alanını `ReviewUserResponse` tipiyle güncelleyeceğiz.
```python
class ReviewUserResponse(BaseModel):
    id: str
    full_name: str

    class Config:
        from_attributes = True

# CourseReviewResponse güncellenecek:
# user: ReviewUserResponse | None = None
```

#### [MODIFY] [enrollment.py](file:///C:/Users/Hp/Desktop/GitHub/bihocam/backend/app/schemas/enrollment.py)
* Admin tarafındaki tüm kayıtları listelemek için `AdminEnrollmentListResponse` şeması eklenecektir.

---

### 2. API Uç Noktaları (Endpoints)

#### [MODIFY] [students.py](file:///C:/Users/Hp/Desktop/GitHub/bihocam/backend/app/api/v1/endpoints/students.py)
* `GET /api/v1/students` endpoint'inin dönüş tipi `StudentListResponse` olarak değiştirilecektir.
* **N+1 Sorgu Optimizasyonu:** Döngü içerisinde her öğrenci için tek tek SQL çeken `enrollment_count`, `order_count` ve `last_activity` sorguları, ana sorguda SQLAlchemy `select` üzerinde `func.count` ve subquery/join mantığıyla birleştirilerek tek sorguya indirilecektir.

#### [MODIFY] [cart.py](file:///C:/Users/Hp/Desktop/GitHub/bihocam/backend/app/api/v1/endpoints/cart.py)
* `GET /api/v1/cart` endpoint'inin dönüş tipi her zaman `CartWithCampaignResponse` olacak şekilde güncellenecektir. `with_campaign=False` ise indirimler ve kuponlar boş/sıfır olarak doldurulacaktır.

#### [MODIFY] [enrollments.py](file:///C:/Users/Hp/Desktop/GitHub/bihocam/backend/app/api/v1/endpoints/enrollments.py)
* Admin yetkilendirmesiyle çalışan **iki yeni endpoint** eklenecektir:
  * `GET /admin/enrollments` — Tüm sistem kayıtlarını sayfalayarak (skip/limit) ve filtreleyerek (`user_id`, `course_id`) listeler.
  * `DELETE /enrollments/{id}` — Adminlerin manuel kayıt silmesi veya iade süreçlerinde kaydı iptal etmesi için DELETE endpoint'i.

#### [MODIFY] [withdrawals.py](file:///C:/Users/Hp/Desktop/GitHub/bihocam/backend/app/api/v1/endpoints/withdrawals.py)
* `GET /me/withdrawals` endpoint'ine `skip: int = Query(0)` ve `limit: int = Query(50)` pagination parametreleri eklenecektir.
* **N+1 Sorgu Optimizasyonu:** Her talep için döngü içinde banka hesabı getiren yapı, `select(WithdrawalRequest).options(joinedload(WithdrawalRequest.bank_account))` eager load ile optimize edilip tek sorguda tamamlanacaktır.

#### [MODIFY] [course_reviews.py](file:///C:/Users/Hp/Desktop/GitHub/bihocam/backend/app/api/v1/endpoints/course_reviews.py)
* `get_course_reviews` içindeki manuel `review_dict` oluşturma mantığı ve `user` dönüş yapısı yeni `ReviewUserResponse` modeline göre uyarlanacaktır.

---

## Verification Plan

### Automated Tests
Geliştirilen ve güncellenen API uç noktalarının doğruluğunu test etmek için yeni test senaryoları yazılacaktır.
* `pytest backend/tests/test_enrollments.py -v` (yeni admin endpoint testleri dahil)
* `pytest backend/tests/test_faz3.py -v` (mevcut P2 testlerinin geçerliliği kontrol edilecek)
* Yeni bir `test_students_cart_review_fixes.py` oluşturularak şema dönüşümleri, N+1 optimizasyonları ve sepet birleştirmeleri doğrulanacaktır:
  `pytest backend/tests/test_students_cart_review_fixes.py -v`

### Manual Verification
* `GET /api/v1/cart` çağrısının her iki `with_campaign` parametresi durumunda da tutarlı şema döndürdüğü doğrulanacak.
* Admin kullanıcısıyla `/api/v1/enrollments/admin/enrollments` (veya `/api/v1/enrollments/admin`) ve `/api/v1/students` endpoint'lerinin çağrıları Swagger UI üzerinden denetlenecektir.
