import sqlite3
import os

db_path = 'backend/bihocam.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("PRAGMA table_info(users)")
user_cols = [col[1] for col in c.fetchall()]
if 'group_lesson_prices' not in user_cols:
    c.execute("ALTER TABLE users ADD COLUMN group_lesson_prices TEXT")
    print("Added group_lesson_prices to users")
else:
    print("group_lesson_prices already exists in users")

c.execute("PRAGMA table_info(live_class_reservations)")
res_cols = [col[1] for col in c.fetchall()]
if 'lesson_mode' not in res_cols:
    c.execute("ALTER TABLE live_class_reservations ADD COLUMN lesson_mode VARCHAR(20) DEFAULT 'individual'")
    print("Added lesson_mode to live_class_reservations")
else:
    print("lesson_mode already exists in live_class_reservations")

if 'group_size' not in res_cols:
    c.execute("ALTER TABLE live_class_reservations ADD COLUMN group_size INTEGER")
    print("Added group_size to live_class_reservations")
else:
    print("group_size already exists in live_class_reservations")

if 'group_tier_id' not in res_cols:
    c.execute("ALTER TABLE live_class_reservations ADD COLUMN group_tier_id VARCHAR(50)")
    print("Added group_tier_id to live_class_reservations")
else:
    print("group_tier_id already exists in live_class_reservations")

conn.commit()
conn.close()
print("Migration completed successfully.")
