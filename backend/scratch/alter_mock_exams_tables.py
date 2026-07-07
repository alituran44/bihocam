import sqlite3
import os

db_path = "bihocam.db"

def migrate():
    print(f"Connecting to database: {db_path}...")
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    columns_to_add = [
        ("start_date", "DATETIME"),
        ("end_date", "DATETIME"),
        ("course_id", "VARCHAR(36)"),
        ("student_id", "VARCHAR(36)")
    ]

    for col_name, col_type in columns_to_add:
        try:
            print(f"Adding column '{col_name}' ({col_type}) to 'mock_exams' table...")
            cursor.execute(f"ALTER TABLE mock_exams ADD COLUMN {col_name} {col_type};")
            print(f"Successfully added '{col_name}'.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column '{col_name}' already exists. Skipping.")
            else:
                print(f"Error adding column '{col_name}': {e}")
                
    conn.commit()
    conn.close()
    print("Migration finished successfully.")

if __name__ == "__main__":
    migrate()
