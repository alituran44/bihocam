import httpx
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_endpoints():
    client = httpx.Client()
    
    print("1. Logging in as Admin...")
    login_payload = {
        "username": "admin@bihocam.com",
        "password": "admin123456"
    }
    
    r = client.post(f"{BASE_URL}/auth/login", data=login_payload)
    if r.status_code != 200:
        print(f"Login failed: {r.status_code} - {r.text}")
        return
        
    login_data = r.json()
    token = login_data["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    print("Login successful.")

    # Get a list of courses to test assignment
    print("2. Fetching courses list...")
    courses_r = client.get(f"{BASE_URL}/courses")
    courses = courses_r.json()
    course_id = courses[0]["id"] if courses else None
    print(f"Using course ID for course-specific exam: {course_id}")

    # Log in as Student to get student user ID and check enrollment
    print("\n3. Logging in as Student...")
    student_login = {
        "username": "beritankorkusuz@icloud.com",
        "password": "student123456"
    }
    
    student_client = httpx.Client()
    sr = student_client.post(f"{BASE_URL}/auth/login", data=student_login)
    if sr.status_code != 200:
        print(f"Student login failed: {sr.status_code} - {sr.text}")
        return
    student_token = sr.json()["access_token"]
    student_client.headers.update({"Authorization": f"Bearer {student_token}"})
    print("Student login successful.")

    # Get student profile
    me_r = student_client.get(f"{BASE_URL}/auth/me")
    student_data = me_r.json()
    student_id = student_data["id"]
    print(f"Student User ID: {student_id}")

    # Create 3 mock exams to verify visibility filtering
    print("\n4. Creating test mock exams...")
    start_date = (datetime.now() - timedelta(hours=1)).isoformat()
    end_date = (datetime.now() + timedelta(days=5)).isoformat()
    
    # EXAM A: General mock exam (both None) -> Should be visible to Student
    exam_a_payload = {
        "title": "Test Genel Deneme (Herkes Gorebilir)",
        "description": "Genel erisim testi.",
        "exam_type": "YKS",
        "pdf_path": "/uploads/mock-exams/genel.pdf",
        "duration_minutes": 120,
        "number_of_options": 5,
        "is_active": True,
        "start_date": start_date,
        "end_date": end_date,
        "course_id": None,
        "student_id": None,
        "questions": [
            {"question_number": 1, "subject_name": "Turkce", "correct_answer": "A", "points": 1.0},
            {"question_number": 2, "subject_name": "Turkce", "correct_answer": None, "points": 1.0}
        ]
    }
    
    # EXAM B: Directly assigned mock exam -> Should be visible to Student
    exam_b_payload = {
        "title": "Test Ozel Deneme (Munferit Ogrenciye Ozel)",
        "description": "Ogrenciye ozel erisim testi.",
        "exam_type": "LGS",
        "pdf_path": "/uploads/mock-exams/ozel.pdf",
        "duration_minutes": 90,
        "number_of_options": 4,
        "is_active": True,
        "start_date": start_date,
        "end_date": end_date,
        "course_id": None,
        "student_id": student_id,
        "questions": [
            {"question_number": 1, "subject_name": "Matematik", "correct_answer": "B", "points": 2.0}
        ]
    }

    # EXAM C: Assigned to course (unregistered/unknown course status) -> Visibility depends on enrollment
    exam_c_payload = {
        "title": "Test Sinif Denemesi",
        "description": "Sinifa ozel erisim testi.",
        "exam_type": "YKS",
        "pdf_path": "/uploads/mock-exams/sinif.pdf",
        "duration_minutes": 100,
        "number_of_options": 5,
        "is_active": True,
        "start_date": start_date,
        "end_date": end_date,
        "course_id": course_id,
        "student_id": None,
        "questions": [
            {"question_number": 1, "subject_name": "Fizik", "correct_answer": "C", "points": 3.0}
        ]
    }

    created_exams = []
    for idx, payload in enumerate([exam_a_payload, exam_b_payload, exam_c_payload], start=1):
        c_r = client.post(f"{BASE_URL}/mock-exams", json=payload)
        if c_r.status_code not in [200, 201]:
            print(f"Failed to create Exam {idx}: {c_r.status_code} - {c_r.text}")
            return
        exam_data = c_r.json()
        created_exams.append(exam_data)
        print(f"Created Exam {idx} ({payload['title']}) with ID: {exam_data['id']}")

    # 5. List Mock Exams as Student and verify visibility
    print("\n5. Listing Mock Exams as Student...")
    list_r = student_client.get(f"{BASE_URL}/mock-exams")
    student_exams = list_r.json()
    student_exam_ids = [x["id"] for x in student_exams]
    print(f"Student sees {len(student_exams)} mock exams in total.")

    # Exam A (General) should be visible
    if created_exams[0]["id"] in student_exam_ids:
        print("SUCCESS: Student can see General mock exam.")
    else:
        print("FAILURE: General mock exam is NOT visible to the student!")

    # Exam B (Directly assigned) should be visible
    if created_exams[1]["id"] in student_exam_ids:
        print("SUCCESS: Student can see Direct-Assigned mock exam.")
    else:
        print("FAILURE: Direct-Assigned mock exam is NOT visible to the student!")

    # Exam C visibility depends on student enrollment
    if created_exams[2]["id"] in student_exam_ids:
        print("INFO: Student can see the Course mock exam (enrolled).")
    else:
        print("INFO: Student cannot see the Course mock exam (not enrolled, expected if not in course).")

    # 6. Start, submit and verify an attempt on the General exam
    print("\n6. Starting a mock exam attempt as Student on General Exam...")
    exam_id = created_exams[0]["id"]
    attempt_r = student_client.post(f"{BASE_URL}/mock-exams/{exam_id}/attempts")
    if attempt_r.status_code != 200:
        print(f"Failed to start attempt: {attempt_r.status_code} - {attempt_r.text}")
        return
    attempt = attempt_r.json()
    attempt_id = attempt["id"]
    print(f"Attempt started. Attempt ID: {attempt_id}")

    # Submit answers
    print("7. Submitting attempt answers...")
    submit_payload = {
        "answers": [
            {
                "question_number": 1,
                "selected_answer": "A" # Correct
            },
            {
                "question_number": 2,
                "selected_answer": "B" # Ignored (correct answer is None/empty)
            }
        ]
    }
    
    submit_r = student_client.post(f"{BASE_URL}/mock-exams/attempts/{attempt_id}/submit", json=submit_payload)
    if submit_r.status_code != 200:
        print(f"Failed to submit attempt: {submit_r.status_code} - {submit_r.text}")
        return
    results = submit_r.json()
    print("Attempt submitted. Results:")
    print(f"  Total Correct: {results['total_correct']}")
    print(f"  Total Wrong: {results['total_wrong']}")
    print(f"  Total Empty/Ungraded: {results['total_empty']}")
    print(f"  Total Net: {results['total_net']}")
    
    # Get detailed analysis
    print("\n8. Fetching attempt detailed analysis...")
    analysis_r = student_client.get(f"{BASE_URL}/mock-exams/attempts/{attempt_id}/analysis")
    analysis = analysis_r.json()
    print("Analysis Comparisons:")
    for comp in analysis["comparisons"]:
        print(f"  Q{comp['question_number']}: selected='{comp['selected_answer']}', correct='{comp['correct_answer']}', is_correct={comp['is_correct']}")

    # 8.5 Test updating the mock exam using PUT endpoint
    print("\n8.5 Testing PUT /mock-exams/{id} update endpoint...")
    update_payload = {
        "title": "Test Genel Deneme (Guncellenmis)",
        "description": "Guncellenmis genel erisim testi.",
        "exam_type": "YKS",
        "pdf_path": "/uploads/mock-exams/genel_guncel.pdf",
        "duration_minutes": 150,
        "number_of_options": 5,
        "is_active": True,
        "start_date": start_date,
        "end_date": end_date,
        "course_id": None,
        "student_id": None,
        "questions": [
            {"question_number": 1, "subject_name": "Turkce", "correct_answer": "B", "points": 1.5},
            {"question_number": 2, "subject_name": "Turkce", "correct_answer": "C", "points": 1.5}
        ]
    }
    update_r = client.put(f"{BASE_URL}/mock-exams/{exam_id}", json=update_payload)
    if update_r.status_code != 200:
        print(f"Failed to update mock exam: {update_r.status_code} - {update_r.text}")
        return
    updated_exam = update_r.json()
    print(f"SUCCESS: Mock Exam updated. New Title: '{updated_exam['title']}', Duration: {updated_exam['duration_minutes']}")

    # 9. Clean up all created test mock exams
    print("\n9. Cleaning up test mock exams...")
    for idx, exam in enumerate(created_exams, start=1):
        del_r = client.delete(f"{BASE_URL}/mock-exams/{exam['id']}")
        if del_r.status_code in [200, 204]:
            print(f"Test Mock Exam {idx} successfully deleted.")
        else:
            print(f"Failed to delete mock exam {idx}: {del_r.status_code}")

if __name__ == "__main__":
    test_endpoints()

