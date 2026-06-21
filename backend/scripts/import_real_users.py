import sys
import os
import sqlite3
import pandas as pd
import uuid
import math
from datetime import datetime

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "bihocam.db"))
CSV_PATH = "C:/Users/Hp/Downloads/users.csv"

def import_users():
    print(f"Connecting to {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print(f"Reading CSV from {CSV_PATH}")
    # Read CSV, replacing bad encoding characters
    df = pd.read_csv(CSV_PATH, encoding_errors="replace")
    
    # We already have an admin, so we will skip 'admin' roles to avoid conflict
    # or just skip if email already exists
    cursor.execute("SELECT email FROM users")
    existing_emails = {row[0] for row in cursor.fetchall()}
    
    count = 0
    for _, row in df.iterrows():
        email = str(row.get('email', '')).strip()
        
        # Skip if invalid email or already exists
        if pd.isna(row.get('email')) or not email or email == 'nan':
            continue
        if email in existing_emails:
            continue
            
        full_name = str(row.get('full_name', 'Bilinmeyen Kullanıcı'))
        
        # Role mapping
        raw_role = str(row.get('role_name', 'student')).lower()
        if raw_role == 'admin':
            # Skip importing existing admins to avoid overwriting the current one
            continue
        elif raw_role in ['instructor', 'teacher']:
            role = 'teacher'
        elif raw_role == 'organization':
            role = 'organization'
        else:
            role = 'student'
            
        password_hash = str(row.get('password', ''))
        # If there is no password, set a dummy hash (though they all should have one)
        if not password_hash or password_hash == 'nan':
            password_hash = "$2b$12$L8v.2gPzYl.xN6eB1R1a8.u5Yt5X7Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8" # dummy bcrypt
            
        mobile = row.get('mobile')
        phone = None
        if not pd.isna(mobile):
            try:
                # remove .0 from floats
                phone = str(int(float(mobile)))
            except:
                phone = str(mobile)
                
        status = str(row.get('status', 'active')).lower()
        is_active = 1 if status == 'active' else 0
        
        verified = row.get('verified')
        is_verified = 1 if verified == 1 else 0
        
        bio = row.get('bio')
        if pd.isna(bio):
            bio = None
            
        # created_at is timestamp in Laravel
        created_ts = row.get('created_at')
        if pd.isna(created_ts):
            created_at = datetime.now()
        else:
            try:
                created_at = datetime.fromtimestamp(int(float(created_ts)))
            except:
                created_at = datetime.now()
                
        user_id = str(uuid.uuid4())
        
        # Insert into database
        cursor.execute("""
            INSERT INTO users (
                id, email, hashed_password, full_name, role, 
                is_active, is_verified, phone, bio, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, email, password_hash, full_name, role,
            is_active, is_verified, phone, bio, created_at, created_at
        ))
        
        existing_emails.add(email)
        count += 1
        
    conn.commit()
    conn.close()
    print(f"Successfully imported {count} users.")

if __name__ == "__main__":
    import_users()
