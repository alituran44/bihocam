import asyncio
import sys

sys.path.insert(0, ".")

from sqlalchemy import select, update
from app.db.session import engine
from app.models.user import User
from app.core.security import get_password_hash


async def main():
    print("Resetting passwords for testing...")
    async with engine.begin() as conn:
        # Reset admin password
        admin_hash = get_password_hash("admin123456")
        await conn.execute(
            update(User)
            .where(User.email == "admin@bihocam.com")
            .values(hashed_password=admin_hash)
        )
        print("Updated admin@bihocam.com password to 'admin123456'")

        # Reset student password
        student_hash = get_password_hash("student123456")
        await conn.execute(
            update(User)
            .where(User.email == "beritankorkusuz@icloud.com")
            .values(hashed_password=student_hash)
        )
        print("Updated beritankorkusuz@icloud.com password to 'student123456'")
        
        # Reset teacher password for testing
        teacher_hash = get_password_hash("teacher123456")
        await conn.execute(
            update(User)
            .where(User.email == "bilgi@bihocam.com")
            .values(hashed_password=teacher_hash)
        )
        print("Updated bilgi@bihocam.com password to 'teacher123456'")

    print("Passwords reset successfully.")


if __name__ == "__main__":
    asyncio.run(main())
