import sqlite3

def main():
    conn = sqlite3.connect("bihocam.db")
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    
    user_cols = {
        'user_id', 'student_id', 'teacher_id', 'created_by_id', 'author_id',
        'follower_id', 'followed_id', 'sender_id', 'recipient_id',
        'user1_id', 'user2_id', 'created_by', 'user'
    }
    
    found = {}
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table})")
        cols = [col[1] for col in cursor.fetchall()]
        matching = [c for c in cols if c in user_cols]
        if matching:
            found[table] = matching
            
    print("User-related tables and columns:")
    for table, cols in found.items():
        print(f"  {table}: {cols}")
        
    conn.close()

if __name__ == "__main__":
    main()
