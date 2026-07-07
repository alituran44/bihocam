import sqlite3
import os

DB_PATH = r"C:\Users\Hp\Desktop\GitHub\bihocam\backend\bihocam.db"

def main():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Disable foreign keys to allow cleanup of users and courses without constraint blockage
        cursor.execute("PRAGMA foreign_keys = OFF")

        # 1. Identify users to keep
        emails_to_keep = ["admin@bihocam.com", "bilgi@bihocam.com", "beritankorkusuz@icloud.com"]
        cursor.execute("SELECT id, email, role FROM users WHERE email IN (?, ?, ?)", emails_to_keep)
        keep_users = cursor.fetchall()
        
        print("Users to keep:")
        keep_ids = set()
        for uid, email, role in keep_users:
            print(f"  {email} (Role: {role}, ID: {uid})")
            keep_ids.add(uid)

        if len(keep_ids) < 3:
            print("WARNING: Could not find all three demo users in the database!")

        # Get all other user IDs to delete
        cursor.execute("SELECT id, email, role FROM users")
        all_users = cursor.fetchall()
        delete_users = []
        for uid, email, role in all_users:
            if uid not in keep_ids:
                delete_users.append((uid, email, role))

        delete_ids = [u[0] for u in delete_users]
        print(f"\nFound {len(delete_ids)} users to delete.")

        if not delete_ids:
            print("No users to delete. Database is already clean.")
            conn.close()
            return

        # 2. Identify courses to delete (belonging to deleted teachers)
        placeholders = ",".join("?" for _ in delete_ids)
        cursor.execute(f"SELECT id, title FROM courses WHERE teacher_id IN ({placeholders})", delete_ids)
        delete_courses = cursor.fetchall()
        delete_course_ids = [c[0] for c in delete_courses]
        print(f"Found {len(delete_course_ids)} courses to delete.")

        # 3. Identify quizzes to delete (belonging to deleted lessons or deleted teachers)
        cursor.execute(f"SELECT id FROM quizzes WHERE teacher_id IN ({placeholders})", delete_ids)
        delete_quizzes_by_teacher = [row[0] for row in cursor.fetchall()]
        
        # Get lessons associated with deleted courses
        delete_lesson_ids = []
        if delete_course_ids:
            course_placeholders = ",".join("?" for _ in delete_course_ids)
            cursor.execute(f"SELECT id FROM lessons WHERE course_id IN ({course_placeholders})", delete_course_ids)
            delete_lesson_ids = [row[0] for row in cursor.fetchall()]

        delete_quizzes_by_lesson = []
        if delete_lesson_ids:
            lesson_placeholders = ",".join("?" for _ in delete_lesson_ids)
            cursor.execute(f"SELECT id FROM quizzes WHERE lesson_id IN ({lesson_placeholders})", delete_lesson_ids)
            delete_quizzes_by_lesson = [row[0] for row in cursor.fetchall()]
            
        delete_quiz_ids = list(set(delete_quizzes_by_teacher + delete_quizzes_by_lesson))
        print(f"Found {len(delete_quiz_ids)} quizzes to delete.")

        # 4. Identify mock exams to delete (belonging to deleted courses or deleted teachers)
        cursor.execute(f"SELECT id FROM mock_exams WHERE created_by_id IN ({placeholders})", delete_ids)
        delete_mock_exams_by_creator = [row[0] for row in cursor.fetchall()]
        
        delete_mock_exams_by_course = []
        if delete_course_ids:
            cursor.execute(f"SELECT id FROM mock_exams WHERE course_id IN ({course_placeholders})", delete_course_ids)
            delete_mock_exams_by_course = [row[0] for row in cursor.fetchall()]
            
        delete_mock_exam_ids = list(set(delete_mock_exams_by_creator + delete_mock_exams_by_course))
        print(f"Found {len(delete_mock_exam_ids)} mock exams to delete.")

        # 5. Identify conversations to delete
        cursor.execute(f"SELECT id FROM conversations WHERE participant1_id IN ({placeholders}) OR participant2_id IN ({placeholders})", delete_ids + delete_ids)
        delete_conversation_ids = [row[0] for row in cursor.fetchall()]
        print(f"Found {len(delete_conversation_ids)} conversations to delete.")

        # 6. Start deleting dependent records
        print("\nDeleting dependent records...")

        # 6a. Messages in conversations
        if delete_conversation_ids:
            conv_placeholders = ",".join("?" for _ in delete_conversation_ids)
            cursor.execute(f"DELETE FROM messages WHERE conversation_id IN ({conv_placeholders})", delete_conversation_ids)
            print(f"  Deleted {cursor.rowcount} messages.")
            cursor.execute(f"DELETE FROM conversations WHERE id IN ({conv_placeholders})", delete_conversation_ids)
            print(f"  Deleted {cursor.rowcount} conversations.")

        # 6b. Quiz attempt answers and quiz attempts
        if delete_quiz_ids:
            quiz_placeholders = ",".join("?" for _ in delete_quiz_ids)
            cursor.execute(f"SELECT id FROM quiz_attempts WHERE quiz_id IN ({quiz_placeholders})", delete_quiz_ids)
            attempt_ids = [row[0] for row in cursor.fetchall()]
            if attempt_ids:
                att_placeholders = ",".join("?" for _ in attempt_ids)
                cursor.execute(f"DELETE FROM quiz_attempt_answers WHERE attempt_id IN ({att_placeholders})", attempt_ids)
                print(f"  Deleted {cursor.rowcount} quiz attempt answers.")
                cursor.execute(f"DELETE FROM quiz_attempts WHERE id IN ({att_placeholders})", attempt_ids)
                print(f"  Deleted {cursor.rowcount} quiz attempts.")
            
            cursor.execute(f"DELETE FROM quiz_questions WHERE quiz_id IN ({quiz_placeholders})", delete_quiz_ids)
            print(f"  Deleted {cursor.rowcount} quiz questions.")
            cursor.execute(f"DELETE FROM quizzes WHERE id IN ({quiz_placeholders})", delete_quiz_ids)
            print(f"  Deleted {cursor.rowcount} quizzes.")

        # 6c. Mock exam student answers, attempts, and questions
        if delete_mock_exam_ids:
            mock_placeholders = ",".join("?" for _ in delete_mock_exam_ids)
            cursor.execute(f"SELECT id FROM mock_exam_attempts WHERE mock_exam_id IN ({mock_placeholders})", delete_mock_exam_ids)
            mock_attempt_ids = [row[0] for row in cursor.fetchall()]
            if mock_attempt_ids:
                ma_placeholders = ",".join("?" for _ in mock_attempt_ids)
                cursor.execute(f"DELETE FROM mock_exam_student_answers WHERE attempt_id IN ({ma_placeholders})", mock_attempt_ids)
                print(f"  Deleted {cursor.rowcount} mock exam student answers.")
                cursor.execute(f"DELETE FROM mock_exam_attempts WHERE id IN ({ma_placeholders})", mock_attempt_ids)
                print(f"  Deleted {cursor.rowcount} mock exam attempts.")
                
            cursor.execute(f"DELETE FROM mock_exam_questions WHERE mock_exam_id IN ({mock_placeholders})", delete_mock_exam_ids)
            print(f"  Deleted {cursor.rowcount} mock exam questions.")
            cursor.execute(f"DELETE FROM mock_exams WHERE id IN ({mock_placeholders})", delete_mock_exam_ids)
            print(f"  Deleted {cursor.rowcount} mock exams.")

        # 6d. Course-related child tables
        if delete_course_ids:
            cursor.execute(f"DELETE FROM lessons WHERE course_id IN ({course_placeholders})", delete_course_ids)
            print(f"  Deleted {cursor.rowcount} lessons.")
            cursor.execute(f"DELETE FROM course_reviews WHERE course_id IN ({course_placeholders})", delete_course_ids)
            print(f"  Deleted {cursor.rowcount} course reviews.")
            cursor.execute(f"DELETE FROM cart_items WHERE course_id IN ({course_placeholders})", delete_course_ids)
            print(f"  Deleted {cursor.rowcount} cart items.")
            cursor.execute(f"DELETE FROM enrollments WHERE course_id IN ({course_placeholders})", delete_course_ids)
            print(f"  Deleted {cursor.rowcount} enrollments.")
            cursor.execute(f"DELETE FROM homeworks WHERE course_id IN ({course_placeholders})", delete_course_ids)
            print(f"  Deleted {cursor.rowcount} homeworks.")
            cursor.execute(f"DELETE FROM courses WHERE id IN ({course_placeholders})", delete_course_ids)
            print(f"  Deleted {cursor.rowcount} courses.")

        # 7. Delete user records from user-specific tables
        user_tables_cols = [
            ("coupons", "created_by_id"),
            ("orders", "user_id"),
            ("notifications", "user_id"),
            ("notifications", "sender_id"),
            ("notification_preferences", "user_id"),
            ("teacher_bank_accounts", "teacher_id"),
            ("crm_email_templates", "created_by"),
            ("crm_audiences", "created_by"),
            ("popup_announcements", "created_by_id"),
            ("ad_pricing", "created_by_id"),
            ("blog_posts", "author_id"),
            ("content_audit_logs", "user_id"),
            ("storage_quotas", "user_id"),
            ("cart_items", "user_id"),
            ("coupon_usages", "user_id"),
            ("enrollments", "user_id"),
            ("withdrawal_requests", "teacher_id"),
            ("crm_audience_members", "user_id"),
            ("certificate_templates", "created_by_id"),
            ("ad_campaigns", "teacher_id"),
            ("lesson_progress", "user_id"),
            ("course_reviews", "user_id"),
            ("teacher_earnings", "teacher_id"),
            ("certificates", "user_id"),
            ("messages", "sender_id"),
            ("quiz_attempts", "user_id"),
            ("teacher_applications", "user_id"),
            ("homeworks", "teacher_id"),
            ("homeworks", "student_id"),
            ("teacher_availability", "teacher_id"),
            ("teacher_library_items", "teacher_id"),
            ("homework_submissions", "student_id"),
            ("exam_attempts", "user_id"),
            ("live_class_reservations", "teacher_id"),
            ("live_class_reservations", "student_id"),
            ("quiz_assignments", "teacher_id"),
            ("quiz_assignments", "student_id"),
            ("social_posts", "user_id"),
            ("user_follows", "follower_id"),
            ("user_follows", "following_id"),
            ("post_likes", "user_id"),
            ("saved_posts", "user_id"),
            ("popcasts", "teacher_id"),
            ("popcast_favorites", "user_id"),
            ("quizzes", "teacher_id"),
            ("mock_exams", "created_by_id"),
            ("mock_exams", "student_id"),
            ("mock_exam_attempts", "student_id")
        ]

        for table, col in user_tables_cols:
            cursor.execute(f"DELETE FROM {table} WHERE {col} IN ({placeholders})", delete_ids)
            if cursor.rowcount > 0:
                print(f"  Deleted {cursor.rowcount} rows from {table} ({col}).")

        # 8. Finally delete from users table
        cursor.execute(f"DELETE FROM users WHERE id IN ({placeholders})", delete_ids)
        print(f"\nSuccessfully deleted {cursor.rowcount} users from the database.")

        conn.commit()
        print("Transaction committed successfully.")

    except Exception as e:
        conn.rollback()
        print(f"ERROR: Transaction rolled back due to error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
