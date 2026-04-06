"""
BiHocam — Uctan Uca Endpoint Test Scripti
Sunucuda calistir: python test_endpoints.py

Tum ana endpoint'leri test eder, sonuclari raporlar.
"""
import asyncio
import json
import sys
import httpx

# Sunucu adresi
BASE = "http://localhost:6767/api/v1"

# Test kullanicilari
ADMIN = {"email": "admin@bihocam.com", "password": "password123"}
TEACHER = {"email": "ahmet.yilmaz@bihocam.com", "password": "password123"}
STUDENT = {"email": "ogrenci1@bihocam.com", "password": "password123"}

passed = 0
failed = 0
errors = []


async def login(client: httpx.AsyncClient, creds: dict) -> str:
    r = await client.post(f"{BASE}/auth/login", data={"username": creds["email"], "password": creds["password"]})
    if r.status_code == 200:
        return r.json()["access_token"]
    return ""


def report(name: str, status: int, expected: list[int], detail: str = ""):
    global passed, failed
    ok = status in expected
    icon = "PASS" if ok else "FAIL"
    if ok:
        passed += 1
    else:
        failed += 1
        errors.append(f"  {name}: {status} (beklenen: {expected}) {detail[:100]}")
    print(f"  [{icon}] {name} -> {status}")


async def main():
    global passed, failed

    async with httpx.AsyncClient(timeout=15) as c:
        print("=" * 60)
        print("BiHocam Endpoint Test Scripti")
        print("=" * 60)

        # ====== AUTH ======
        print("\n--- AUTH ---")

        r = await c.post(f"{BASE}/auth/login", data={"username": ADMIN["email"], "password": ADMIN["password"]})
        report("POST /auth/login (admin)", r.status_code, [200])
        admin_token = r.json().get("access_token", "") if r.status_code == 200 else ""

        r = await c.post(f"{BASE}/auth/login", data={"username": TEACHER["email"], "password": TEACHER["password"]})
        report("POST /auth/login (teacher)", r.status_code, [200])
        teacher_token = r.json().get("access_token", "") if r.status_code == 200 else ""

        r = await c.post(f"{BASE}/auth/login", data={"username": STUDENT["email"], "password": STUDENT["password"]})
        report("POST /auth/login (student)", r.status_code, [200])
        student_token = r.json().get("access_token", "") if r.status_code == 200 else ""

        admin_h = {"Authorization": f"Bearer {admin_token}"}
        teacher_h = {"Authorization": f"Bearer {teacher_token}"}
        student_h = {"Authorization": f"Bearer {student_token}"}

        r = await c.get(f"{BASE}/auth/me", headers=admin_h)
        report("GET /auth/me (admin)", r.status_code, [200])
        admin_id = r.json().get("id", "") if r.status_code == 200 else ""

        r = await c.get(f"{BASE}/auth/me", headers=teacher_h)
        report("GET /auth/me (teacher)", r.status_code, [200])
        teacher_id = r.json().get("id", "") if r.status_code == 200 else ""

        r = await c.get(f"{BASE}/auth/me", headers=student_h)
        report("GET /auth/me (student)", r.status_code, [200])

        r = await c.get(f"{BASE}/auth/me")
        report("GET /auth/me (no token)", r.status_code, [401])

        r = await c.post(f"{BASE}/auth/logout", headers=student_h)
        report("POST /auth/logout", r.status_code, [200])

        # ====== COURSES ======
        print("\n--- COURSES ---")

        r = await c.get(f"{BASE}/courses", params={"skip": 0, "limit": 5})
        report("GET /courses (public list)", r.status_code, [200])
        courses = r.json() if r.status_code == 200 else []
        course_id = courses[0]["id"] if courses else ""
        course_slug = courses[0]["slug"] if courses else ""

        if course_slug:
            r = await c.get(f"{BASE}/courses/slug/{course_slug}")
            report(f"GET /courses/slug/{course_slug}", r.status_code, [200])

        if course_id:
            r = await c.get(f"{BASE}/courses/{course_id}")
            report(f"GET /courses/{{id}}", r.status_code, [200])

            r = await c.get(f"{BASE}/courses/{course_id}/similar", params={"limit": 3})
            report("GET /courses/{{id}}/similar", r.status_code, [200])

            r = await c.get(f"{BASE}/courses/{course_id}/reviews", params={"skip": 0, "limit": 5})
            report("GET /courses/{{id}}/reviews", r.status_code, [200])

            r = await c.get(f"{BASE}/courses/{course_id}/reviews/stats")
            report("GET /courses/{{id}}/reviews/stats", r.status_code, [200])

        # Teacher: kurs olusturma
        import time
        unique_slug = f"test-kurs-{int(time.time())}"
        r = await c.post(f"{BASE}/courses", headers=teacher_h, json={
            "title": "Test Kurs Endpoint",
            "slug": unique_slug,
            "description": "Bu bir test kursudur",
            "price": 99.90,
        })
        report("POST /courses (teacher create)", r.status_code, [200, 201])
        new_course_id = r.json().get("id", "") if r.status_code in [200, 201] else ""

        if new_course_id:
            r = await c.get(f"{BASE}/courses/me", headers=teacher_h)
            report("GET /courses/me (teacher)", r.status_code, [200])

            # Ders ekle
            r = await c.post(f"{BASE}/courses/{new_course_id}/lessons", headers=teacher_h, json={
                "title": "Test Ders 1",
                "lesson_type": "video",
                "order": 1,
            })
            report("POST /courses/{{id}}/lessons", r.status_code, [200, 201])

        # ====== CATEGORIES ======
        print("\n--- CATEGORIES ---")

        r = await c.get(f"{BASE}/categories", params={"is_active": "true"})
        report("GET /categories", r.status_code, [200])
        categories = r.json() if r.status_code == 200 else []

        r = await c.get(f"{BASE}/categories/tree")
        report("GET /categories/tree", r.status_code, [200])

        # ====== CART ======
        print("\n--- CART ---")

        r = await c.get(f"{BASE}/cart", headers=student_h)
        report("GET /cart (student)", r.status_code, [200])

        if course_id:
            r = await c.post(f"{BASE}/cart", headers=student_h, json={"course_id": course_id})
            report("POST /cart (add to cart)", r.status_code, [200, 201, 400])

        r = await c.get(f"{BASE}/cart", headers=student_h)
        report("GET /cart (after add)", r.status_code, [200])

        # ====== ENROLLMENTS ======
        print("\n--- ENROLLMENTS ---")

        r = await c.get(f"{BASE}/enrollments/me", headers=student_h, params={"skip": 0, "limit": 5})
        report("GET /enrollments/me (student)", r.status_code, [200])

        # ====== ORDERS ======
        print("\n--- ORDERS ---")

        r = await c.get(f"{BASE}/orders", headers=student_h, params={"skip": 0, "limit": 5})
        report("GET /orders (student)", r.status_code, [200])

        # ====== NOTIFICATIONS ======
        print("\n--- NOTIFICATIONS ---")

        r = await c.get(f"{BASE}/notifications", headers=student_h, params={"skip": 0, "limit": 5})
        report("GET /notifications", r.status_code, [200])

        r = await c.get(f"{BASE}/notifications/unread-count", headers=student_h)
        report("GET /notifications/unread-count", r.status_code, [200])

        r = await c.get(f"{BASE}/notifications/preferences", headers=student_h)
        report("GET /notifications/preferences", r.status_code, [200])

        # ====== TEACHERS ======
        print("\n--- TEACHERS ---")

        r = await c.get(f"{BASE}/teachers", params={"skip": 0, "limit": 5})
        report("GET /teachers (public)", r.status_code, [200])
        teachers = r.json() if r.status_code == 200 else []

        if teacher_id:
            r = await c.get(f"{BASE}/teachers/{teacher_id}")
            report(f"GET /teachers/{{id}}", r.status_code, [200])

        r = await c.get(f"{BASE}/teachers/me/profile", headers=teacher_h)
        report("GET /teachers/me/profile", r.status_code, [200])

        # ====== TEACHER BANK ACCOUNTS ======
        print("\n--- TEACHER BANK ACCOUNTS ---")

        r = await c.get(f"{BASE}/teachers/me/bank-accounts", headers=teacher_h)
        report("GET /teachers/me/bank-accounts", r.status_code, [200])

        # ====== TEACHER EARNINGS ======
        print("\n--- TEACHER EARNINGS ---")

        r = await c.get(f"{BASE}/teachers/me/earnings", headers=teacher_h)
        report("GET /teachers/me/earnings", r.status_code, [200])

        r = await c.get(f"{BASE}/teachers/me/balance", headers=teacher_h)
        report("GET /teachers/me/balance", r.status_code, [200])

        # ====== WITHDRAWALS ======
        print("\n--- WITHDRAWALS ---")

        r = await c.get(f"{BASE}/teachers/me/withdrawals", headers=teacher_h)
        report("GET /teachers/me/withdrawals", r.status_code, [200])

        # ====== COUPONS ======
        print("\n--- COUPONS ---")

        r = await c.get(f"{BASE}/coupons", headers=admin_h, params={"skip": 0, "limit": 5})
        report("GET /coupons (admin)", r.status_code, [200])

        r = await c.get(f"{BASE}/coupons/public/active-site-wide")
        report("GET /coupons/public/active-site-wide", r.status_code, [200])

        # ====== PAYMENTS ======
        print("\n--- PAYMENTS ---")

        r = await c.post(f"{BASE}/payments/checkout", headers=student_h)
        report("POST /payments/checkout (no cart)", r.status_code, [400])

        # ====== ADMIN — USERS ======
        print("\n--- ADMIN ---")

        r = await c.get(f"{BASE}/admin/users", headers=admin_h, params={"skip": 0, "limit": 5})
        report("GET /admin/users", r.status_code, [200])

        r = await c.get(f"{BASE}/admin/students", headers=admin_h, params={"skip": 0, "limit": 5})
        report("GET /admin/students", r.status_code, [200])

        # admin/teachers route'u yok, teachers admin listesi /teachers endpoint'inde
        # r = await c.get(f"{BASE}/admin/teachers", headers=admin_h, params={"skip": 0, "limit": 5})

        # ====== ADMIN — ORDERS ======
        r = await c.get(f"{BASE}/admin/orders", headers=admin_h, params={"skip": 0, "limit": 5})
        report("GET /admin/orders", r.status_code, [200])

        # ====== ADMIN — SETTINGS ======
        r = await c.get(f"{BASE}/admin/settings", headers=admin_h)
        report("GET /admin/settings", r.status_code, [200])

        # ====== ADMIN — EMAIL LOGS ======
        r = await c.get(f"{BASE}/admin/email-logs", headers=admin_h, params={"skip": 0, "limit": 5})
        report("GET /admin/email-logs", r.status_code, [200])

        # ====== ADMIN — REPORTS ======
        r = await c.get(f"{BASE}/admin/reports/overview", headers=admin_h)
        report("GET /admin/reports/overview", r.status_code, [200])

        # ====== ADMIN — WITHDRAWALS ======
        r = await c.get(f"{BASE}/admin/withdrawals", headers=admin_h)
        report("GET /admin/withdrawals", r.status_code, [200])

        # ====== PUBLIC ======
        print("\n--- PUBLIC ---")

        r = await c.get(f"{BASE}/settings/public")
        report("GET /settings/public", r.status_code, [200])

        r = await c.get(f"{BASE}/announcements/active")
        report("GET /announcements/active", r.status_code, [200])

        r = await c.get(f"{BASE}/public/popups/active")
        report("GET /public/popups/active", r.status_code, [200])

        r = await c.get(f"{BASE}/public/featured-courses", params={"limit": 5})
        report("GET /public/featured-courses", r.status_code, [200])

        r = await c.get(f"{BASE}/public/ads/featured-courses", params={"limit": 5})
        report("GET /public/ads/featured-courses", r.status_code, [200])

        # ====== BLOG ======
        print("\n--- BLOG ---")

        r = await c.get(f"{BASE}/blog/posts", params={"skip": 0, "limit": 5})
        report("GET /blog/posts", r.status_code, [200])

        r = await c.get(f"{BASE}/blog/categories")
        report("GET /blog/categories", r.status_code, [200])

        # ====== CERTIFICATES ======
        print("\n--- CERTIFICATES ---")

        r = await c.get(f"{BASE}/certificates/my-certificates", headers=student_h)
        report("GET /certificates/my-certificates", r.status_code, [200])

        # ====== MESSAGES ======
        print("\n--- MESSAGES ---")

        r = await c.get(f"{BASE}/messages/conversations", headers=student_h)
        report("GET /messages/conversations", r.status_code, [200])

        # ====== QUIZZES ======
        print("\n--- QUIZZES ---")

        r = await c.get(f"{BASE}/quizzes", headers=teacher_h)
        report("GET /quizzes (teacher)", r.status_code, [200])

        # ====== HEALTH ======
        print("\n--- HEALTH ---")

        r = await c.get("http://localhost:6767/health")
        report("GET /health", r.status_code, [200])

        # ====== CLEANUP ======
        if new_course_id:
            # Kurs silme (admin)
            pass  # silme endpoint'i yok, draft olarak kalir

        # ====== RAPOR ======
        print("\n" + "=" * 60)
        print(f"SONUC: {passed} PASSED, {failed} FAILED")
        print("=" * 60)

        if errors:
            print("\nBASARISIZ ENDPOINT'LER:")
            for e in errors:
                print(e)

        if failed == 0:
            print("\nTum endpoint'ler calisiyor!")
        else:
            print(f"\n{failed} endpoint sorunlu — yukardaki listeye bak.")

        sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    asyncio.run(main())
