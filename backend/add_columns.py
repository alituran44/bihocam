import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "bihocam.db")
print(f"Connecting to database at {db_path}...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get existing columns in education_programs
cursor.execute("PRAGMA table_info(education_programs)")
columns = [row[1] for row in cursor.fetchall()]

new_columns = [
    ("subtitle", "VARCHAR(255)"),
    ("short_description", "TEXT"),
    ("curriculum_intro", "TEXT"),
    ("kontenjan", "INTEGER DEFAULT 20"),
    ("start_date", "VARCHAR(100)")
]

for col_name, col_type in new_columns:
    if col_name not in columns:
        print(f"Adding column '{col_name}' to education_programs...")
        try:
            cursor.execute(f"ALTER TABLE education_programs ADD COLUMN {col_name} {col_type}")
            print(f"Successfully added column '{col_name}'.")
        except Exception as e:
            print(f"Error adding column '{col_name}': {e}")
    else:
        print(f"Column '{col_name}' already exists.")

conn.commit()
conn.close()
print("Done!")
