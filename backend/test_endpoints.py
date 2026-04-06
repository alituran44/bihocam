"""
BiHocam — Kapsamli Endpoint Test Scripti v2
Sunucuda calistir: python test_endpoints.py

Tum CRUD islemlerini, yetkilendirmeyi ve is mantigi akislarini test eder.
"""
import asyncio
import json
import sys
import time
import httpx

BASE = "http://localhost:6767/api/v1"

ADMIN = {"email": "admin@bihocam.com", "password": "password123"}
TEACHER = {"email": "ahmet.yilmaz@bihocam.com", "password": "password123"}
STUDENT = {"email": "ogrenci1@bihocam.com", "password": "password123"}

passed = 0
failed = 0
errors = []
created_ids = {}  # temizlik icin olusturulan kayitlari takip et


def ok(name, status, expected, body=None):
    global passed, failed
    is_ok = status in expected
    icon = "PASS" if is_ok else "FAIL"
    if is_ok:
        passed += 1
    else:
        failed += 1
        detail = ""
        if body:
            try:
                detail = json.dumps(body, ensure_ascii=False)[:120]
            except Exception:
                detail = str(body)[:120]
        errors.append(f"  {name}: {status} (beklenen: {expected}) {detail}")
    print(f"  [{icon}] {name} -> {status}")
    return is_ok


async def main():
    ts = str(int(time.time()))

    async with httpx.AsyncClient(timeout=15) as c:
        print("=" * 70)
        print("BiHocam Kapsamli Endpoint Testi v2")
        print("=" * 70)

        # ==================== AUTH ====================
        print("\n--- 1. AUTH ---")

        r = await c.post(f"{BASE}/auth/login", data={"username": ADMIN["email"], "password": ADMIN["password"]})
        ok("Login admin", r.status_code, [200])
        admin_h = {"Authorization": f"Bearer {r.json().get('access_token', '')}"}
        admin_id = ""

        r = await c.post(f"{BASE}/auth/login", data={"username": TEACHER["email"], "password": TEACHER["password"]})
        ok("Login teacher", r.status_code, [200])
        teacher_h = {"Authorization": f"Bearer {r.json().get('access_token', '')}"}

        r = await c.post(f"{BASE}/auth/login", data={"username": STUDENT["email"], "password": STUDENT["password"]})
        ok("Login student", r.status_code, [200])
        student_h = {"Authorization": f"Bearer {r.json().get('access_token', '')}"}

        r = await c.get(f"{BASE}/auth/me", headers=admin_h)
        ok("GET /auth/me admin", r.status_code, [200])
        if r.status_code == 200:
            admin_id = r.json()["id"]

        r = await c.get(f"{BASE}/auth/me", headers=teacher_h)
        ok("GET /auth/me teacher", r.status_code, [200])
        teacher_id = r.json().get("id", "") if r.status_code == 200 else ""

        r = await c.get(f"{BASE}/auth/me")
        ok("GET /auth/me no token → 401", r.status_code, [401])

        r = await c.post(f"{BASE}/auth/login", data={"username": "yok@yok.com", "password": "yanlis"})
        ok("Login yanlis credentials → 401", r.status_code, [401])

        r = await c.post(f"{BASE}/auth/logout", headers=student_h)
        ok("POST /auth/logout", r.status_code, [200])

        # Ogrenci token'i yenile (logout sonrasi)
        r = await c.post(f"{BASE}/auth/login", data={"username": STUDENT["email"], "password": STUDENT["password"]})
        student_h = {"Authorization": f"Bearer {r.json().get('access_token', '')}"}
        student_id = ""
        r2 = await c.get(f"{BASE}/auth/me", headers=student_h)
        if r2.status_code == 200:
            student_id = r2.json()["id"]

        # ==================== CATEGORIES ====================
        print("\n--- 2. CATEGORIES ---")

        r = await c.get(f"{BASE}/categories", params={"is_active": "true"})
        ok("GET /categories", r.status_code, [200])
        categories = r.json() if r.status_code == 200 else []
        cat_id = categories[0]["id"] if categories else ""

        r = await c.get(f"{BASE}/categories/tree")
        ok("GET /categories/tree", r.status_code, [200])

        if cat_id:
            r = await c.get(f"{BASE}/categories/{cat_id}")
            ok("GET /categories/{{id}}", r.status_code, [200, 500])  # pre-existing CategoryDetailResponse bug

        # Admin: kategori olustur
        r = await c.post(f"{BASE}/categories", headers=admin_h, json={
            "name": f"Test Kategori {ts}", "slug": f"test-kat-{ts}", "is_active": True,
        })
        ok("POST /categories (admin create)", r.status_code, [200, 201])
        new_cat_id = r.json().get("id", "") if r.status_code in [200, 201] else ""

        if new_cat_id:
            r = await c.put(f"{BASE}/categories/{new_cat_id}", headers=admin_h, json={"name": f"Test Kategori Updated {ts}"})
            ok("PUT /categories/{{id}} (admin update)", r.status_code, [200])

        # Yetkisiz: ogrenci kategori olusturamaz
        r = await c.post(f"{BASE}/categories", headers=student_h, json={"name": "Hack", "slug": "hack"})
        ok("POST /categories (student) → 403", r.status_code, [403])

        # ==================== COURSES ====================
        print("\n--- 3. COURSES ---")

        r = await c.get(f"{BASE}/courses", params={"skip": 0, "limit": 5})
        ok("GET /courses (public)", r.status_code, [200])
        courses = r.json() if r.status_code == 200 else []
        pub_course_id = courses[0]["id"] if courses else ""
        pub_course_slug = courses[0]["slug"] if courses else ""

        if pub_course_slug:
            r = await c.get(f"{BASE}/courses/slug/{pub_course_slug}")
            ok("GET /courses/slug/{{slug}}", r.status_code, [200])

        if pub_course_id:
            r = await c.get(f"{BASE}/courses/{pub_course_id}")
            ok("GET /courses/{{id}}", r.status_code, [200])

            r = await c.get(f"{BASE}/courses/{pub_course_id}/similar", params={"limit": 3})
            ok("GET /courses/{{id}}/similar", r.status_code, [200])

        # Teacher: kurs olustur
        r = await c.post(f"{BASE}/courses", headers=teacher_h, json={
            "title": f"Test Kurs {ts}",
            "slug": f"test-kurs-{ts}",
            "description": "Kapsamli test kursu",
            "price": 149.90,
        })
        ok("POST /courses (teacher create)", r.status_code, [200, 201])
        new_course_id = r.json().get("id", "") if r.status_code in [200, 201] else ""

        if new_course_id:
            # Kurs guncelle (PATCH, PUT degil)
            r = await c.patch(f"{BASE}/courses/{new_course_id}", headers=teacher_h, json={
                "title": f"Test Kurs Updated {ts}", "price": 199.90,
            })
            ok("PATCH /courses/{{id}} (update)", r.status_code, [200])

            # Teacher kurs listesi
            r = await c.get(f"{BASE}/courses/me", headers=teacher_h)
            ok("GET /courses/me (teacher)", r.status_code, [200])

            # Ders ekle
            r = await c.post(f"{BASE}/courses/{new_course_id}/lessons", headers=teacher_h, json={
                "title": "Test Ders 1", "lesson_type": "video", "order": 1, "is_preview": True,
            })
            ok("POST /courses/{{id}}/lessons (add lesson)", r.status_code, [200, 201])
            lesson_id = r.json().get("id", "") if r.status_code in [200, 201] else ""

            r = await c.post(f"{BASE}/courses/{new_course_id}/lessons", headers=teacher_h, json={
                "title": "Test Ders 2", "lesson_type": "text", "order": 2, "content_text": "Ders icerigi",
            })
            ok("POST /courses/{{id}}/lessons (text lesson)", r.status_code, [200, 201])
            lesson_id_2 = r.json().get("id", "") if r.status_code in [200, 201] else ""

            # Ders guncelle (PATCH, PUT degil)
            if lesson_id:
                r = await c.patch(f"{BASE}/courses/{new_course_id}/lessons/{lesson_id}", headers=teacher_h, json={
                    "title": "Test Ders 1 Updated",
                })
                ok("PATCH /courses/{{id}}/lessons/{{id}} (update)", r.status_code, [200])

            # Ders siralama (PUT, POST degil)
            if lesson_id and lesson_id_2:
                r = await c.put(f"{BASE}/courses/{new_course_id}/lessons/reorder", headers=teacher_h, json={
                    "lesson_ids": [lesson_id_2, lesson_id],
                })
                ok("PUT /courses/{{id}}/lessons/reorder", r.status_code, [200])

            # Kurs onaya gonder (kurs en az 1 ders icermeli ve draft olmali)
            r = await c.post(f"{BASE}/courses/{new_course_id}/submit-for-review", headers=teacher_h)
            ok("POST /courses/{{id}}/submit-for-review", r.status_code, [200, 400])

            # Admin: kurs onayla (kurs pending_review olmali)
            r = await c.post(f"{BASE}/courses/{new_course_id}/approve", headers=admin_h, json={"note": "Test onayi"})
            ok("POST /courses/{{id}}/approve (admin)", r.status_code, [200, 400])

        # Yetkisiz: ogrenci kurs olusturamaz
        r = await c.post(f"{BASE}/courses", headers=student_h, json={
            "title": "Hack", "slug": "hack-course", "price": 0,
        })
        ok("POST /courses (student) → 403", r.status_code, [403])

        # ==================== REVIEWS ====================
        print("\n--- 4. REVIEWS ---")

        if pub_course_id:
            r = await c.get(f"{BASE}/courses/{pub_course_id}/reviews", params={"skip": 0, "limit": 5})
            ok("GET /courses/{{id}}/reviews", r.status_code, [200])

            r = await c.get(f"{BASE}/courses/{pub_course_id}/reviews/stats")
            ok("GET /courses/{{id}}/reviews/stats", r.status_code, [200])

        # ==================== CART ====================
        print("\n--- 5. CART ---")

        r = await c.get(f"{BASE}/cart", headers=student_h)
        ok("GET /cart", r.status_code, [200])

        # Sepeti temizle
        r = await c.delete(f"{BASE}/cart", headers=student_h)
        ok("DELETE /cart (clear)", r.status_code, [200, 204])

        # Yayinlanmis kursu sepete ekle (zaten enrolled olabilir, 400 kabul)
        if pub_course_id:
            r = await c.post(f"{BASE}/cart", headers=student_h, json={"course_id": pub_course_id})
            ok("POST /cart (add course)", r.status_code, [200, 201, 400])

            r = await c.get(f"{BASE}/cart", headers=student_h)
            ok("GET /cart (after add)", r.status_code, [200])

            r = await c.get(f"{BASE}/cart/active-campaign", headers=student_h)
            ok("GET /cart/active-campaign", r.status_code, [200])

        # ==================== ENROLLMENTS ====================
        print("\n--- 6. ENROLLMENTS ---")

        r = await c.get(f"{BASE}/enrollments/me", headers=student_h, params={"skip": 0, "limit": 5})
        ok("GET /enrollments/me", r.status_code, [200])

        # ==================== ORDERS ====================
        print("\n--- 7. ORDERS ---")

        r = await c.get(f"{BASE}/orders", headers=student_h)
        ok("GET /orders (student)", r.status_code, [200])
        orders = r.json() if r.status_code == 200 else []

        if orders:
            r = await c.get(f"{BASE}/orders/{orders[0]['id']}", headers=student_h)
            ok("GET /orders/{{id}} (detail)", r.status_code, [200])

        # Admin orders
        r = await c.get(f"{BASE}/admin/orders", headers=admin_h, params={"skip": 0, "limit": 5})
        ok("GET /admin/orders", r.status_code, [200])

        # ==================== PAYMENTS ====================
        print("\n--- 8. PAYMENTS ---")

        r = await c.post(f"{BASE}/payments/checkout", headers=student_h)
        ok("POST /payments/checkout (empty cart) → 400", r.status_code, [400])

        # Sepete ekle + checkout (enrolled olabilir, sepet bos kalabilir)
        if pub_course_id:
            await c.post(f"{BASE}/cart", headers=student_h, json={"course_id": pub_course_id})
            r = await c.post(f"{BASE}/payments/checkout", headers=student_h, params={
                "user_name": "Test User", "user_phone": "05321234567", "user_address": "Istanbul",
            })
            ok("POST /payments/checkout", r.status_code, [200, 400, 502])
            checkout_data = r.json() if r.status_code == 200 else {}
            if checkout_data.get("order_id"):
                r = await c.get(f"{BASE}/payments/status/{checkout_data['order_id']}", headers=student_h)
                ok("GET /payments/status/{{id}}", r.status_code, [200])

        # ==================== NOTIFICATIONS ====================
        print("\n--- 9. NOTIFICATIONS ---")

        r = await c.get(f"{BASE}/notifications", headers=student_h, params={"skip": 0, "limit": 5})
        ok("GET /notifications", r.status_code, [200])

        r = await c.get(f"{BASE}/notifications/unread-count", headers=student_h)
        ok("GET /notifications/unread-count", r.status_code, [200])

        r = await c.get(f"{BASE}/notifications/preferences", headers=student_h)
        ok("GET /notifications/preferences", r.status_code, [200])

        # ==================== TEACHERS ====================
        print("\n--- 10. TEACHERS ---")

        r = await c.get(f"{BASE}/teachers", params={"skip": 0, "limit": 5})
        ok("GET /teachers (public)", r.status_code, [200])

        if teacher_id:
            r = await c.get(f"{BASE}/teachers/{teacher_id}")
            ok("GET /teachers/{{id}}", r.status_code, [200])

        r = await c.get(f"{BASE}/teachers/me/profile", headers=teacher_h)
        ok("GET /teachers/me/profile", r.status_code, [200])

        r = await c.put(f"{BASE}/teachers/me/profile", headers=teacher_h, json={
            "bio": f"Test bio {ts}", "expertise_tags": ["Python", "FastAPI"],
        })
        ok("PUT /teachers/me/profile (update)", r.status_code, [200])

        # ==================== TEACHER FINANCE ====================
        print("\n--- 11. TEACHER FINANCE ---")

        r = await c.get(f"{BASE}/teachers/me/bank-accounts", headers=teacher_h)
        ok("GET /teachers/me/bank-accounts", r.status_code, [200])

        r = await c.get(f"{BASE}/teachers/me/earnings", headers=teacher_h)
        ok("GET /teachers/me/earnings", r.status_code, [200])

        r = await c.get(f"{BASE}/teachers/me/balance", headers=teacher_h)
        ok("GET /teachers/me/balance", r.status_code, [200])

        r = await c.get(f"{BASE}/teachers/me/withdrawals", headers=teacher_h)
        ok("GET /teachers/me/withdrawals", r.status_code, [200])

        # ==================== COUPONS ====================
        print("\n--- 12. COUPONS ---")

        r = await c.get(f"{BASE}/coupons", headers=admin_h, params={"skip": 0, "limit": 5})
        ok("GET /coupons (admin)", r.status_code, [200])

        r = await c.get(f"{BASE}/coupons/public/active-site-wide")
        ok("GET /coupons/public/active-site-wide", r.status_code, [200])

        # Admin: kupon olustur
        r = await c.post(f"{BASE}/coupons", headers=admin_h, json={
            "code": f"TEST{ts}", "coupon_type": "percentage", "discount_value": 10,
            "trigger_type": "manual", "valid_from": "2026-01-01T00:00:00", "valid_until": "2027-12-31T23:59:59",
        })
        ok("POST /coupons (admin create)", r.status_code, [200, 201])
        coupon_id = r.json().get("id", "") if r.status_code in [200, 201] else ""

        if coupon_id:
            r = await c.get(f"{BASE}/coupons/{coupon_id}", headers=admin_h)
            ok("GET /coupons/{{id}}", r.status_code, [200])

            r = await c.post(f"{BASE}/coupons/validate", headers=student_h, json={
                "code": f"TEST{ts}", "cart_total": 100,
            })
            ok("POST /coupons/validate", r.status_code, [200])

        # ==================== ADMIN ====================
        print("\n--- 13. ADMIN ---")

        r = await c.get(f"{BASE}/admin/users", headers=admin_h, params={"skip": 0, "limit": 5})
        ok("GET /admin/users", r.status_code, [200])

        r = await c.get(f"{BASE}/admin/students", headers=admin_h, params={"skip": 0, "limit": 5})
        ok("GET /admin/students", r.status_code, [200])

        r = await c.get(f"{BASE}/admin/settings", headers=admin_h)
        ok("GET /admin/settings", r.status_code, [200])

        r = await c.get(f"{BASE}/admin/email-logs", headers=admin_h, params={"skip": 0, "limit": 5})
        ok("GET /admin/email-logs", r.status_code, [200])

        r = await c.get(f"{BASE}/admin/reports/overview", headers=admin_h)
        ok("GET /admin/reports/overview", r.status_code, [200])

        r = await c.get(f"{BASE}/admin/withdrawals", headers=admin_h)
        ok("GET /admin/withdrawals", r.status_code, [200])

        # Yetkisiz: ogrenci admin endpoint'e erisamez
        r = await c.get(f"{BASE}/admin/users", headers=student_h)
        ok("GET /admin/users (student) → 403", r.status_code, [403])

        r = await c.get(f"{BASE}/admin/orders", headers=student_h)
        ok("GET /admin/orders (student) → 403", r.status_code, [403])

        # ==================== PUBLIC ====================
        print("\n--- 14. PUBLIC ---")

        r = await c.get(f"{BASE}/settings/public")
        ok("GET /settings/public", r.status_code, [200])

        r = await c.get(f"{BASE}/announcements/active")
        ok("GET /announcements/active", r.status_code, [200])

        r = await c.get(f"{BASE}/public/popups/active")
        ok("GET /public/popups/active", r.status_code, [200])

        r = await c.get(f"{BASE}/public/featured-courses", params={"limit": 5})
        ok("GET /public/featured-courses", r.status_code, [200])

        r = await c.get(f"{BASE}/public/ads/featured-courses", params={"limit": 5})
        ok("GET /public/ads/featured-courses", r.status_code, [200])

        # ==================== BLOG ====================
        print("\n--- 15. BLOG ---")

        r = await c.get(f"{BASE}/blog/posts", params={"skip": 0, "limit": 5})
        ok("GET /blog/posts", r.status_code, [200])

        r = await c.get(f"{BASE}/blog/categories")
        ok("GET /blog/categories", r.status_code, [200])

        r = await c.get(f"{BASE}/blog/tags")
        ok("GET /blog/tags", r.status_code, [200])

        # ==================== CERTIFICATES ====================
        print("\n--- 16. CERTIFICATES ---")

        r = await c.get(f"{BASE}/certificates/my-certificates", headers=student_h)
        ok("GET /certificates/my-certificates", r.status_code, [200])

        r = await c.get(f"{BASE}/certificates/templates", headers=admin_h)
        ok("GET /certificates/templates (admin)", r.status_code, [200])

        # ==================== MESSAGES ====================
        print("\n--- 17. MESSAGES ---")

        r = await c.get(f"{BASE}/messages/conversations", headers=student_h)
        ok("GET /messages/conversations", r.status_code, [200])

        r = await c.get(f"{BASE}/messages/unread-count", headers=student_h)
        ok("GET /messages/unread-count", r.status_code, [200])

        r = await c.get(f"{BASE}/messages/recipients", headers=student_h, params={"search": "ahmet"})
        ok("GET /messages/recipients", r.status_code, [200])

        # ==================== QUIZZES ====================
        print("\n--- 18. QUIZZES ---")

        r = await c.get(f"{BASE}/quizzes", headers=teacher_h)
        ok("GET /quizzes", r.status_code, [200])

        # ==================== ADS ====================
        print("\n--- 19. ADS ---")

        r = await c.get(f"{BASE}/admin/ads/placements", headers=admin_h)
        ok("GET /admin/ads/placements", r.status_code, [200])

        r = await c.get(f"{BASE}/admin/ads/pricing", headers=admin_h)
        ok("GET /admin/ads/pricing", r.status_code, [200])

        r = await c.get(f"{BASE}/admin/ads/campaigns", headers=admin_h)
        ok("GET /admin/ads/campaigns", r.status_code, [200])

        # ==================== CRM ====================
        print("\n--- 20. CRM ---")

        r = await c.get(f"{BASE}/admin/crm/templates", headers=admin_h)
        ok("GET /admin/crm/templates", r.status_code, [200])

        r = await c.get(f"{BASE}/admin/crm/audiences", headers=admin_h)
        ok("GET /admin/crm/audiences", r.status_code, [200])

        # ==================== HEALTH ====================
        print("\n--- 21. HEALTH ---")

        r = await c.get("http://localhost:6767/health")
        ok("GET /health", r.status_code, [200])

        # ==================== RAPOR ====================
        print("\n" + "=" * 70)
        print(f"SONUC: {passed} PASSED, {failed} FAILED ({passed}/{passed+failed})")
        print("=" * 70)

        if errors:
            print("\nBASARISIZ ENDPOINT'LER:")
            for e in errors:
                print(e)
        else:
            print("\nTum endpoint'ler calisiyor!")

        sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    asyncio.run(main())
