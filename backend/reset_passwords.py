import asyncio
import sys
from pathlib import Path

# Ensure app modules are importable
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash

async def reset():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        for user in users:
            user.hashed_password = get_password_hash("password123")
            print(f"Password reset for: {user.email}")
        await db.commit()
        print("All passwords reset to 'password123' successfully!")

if __name__ == "__main__":
    asyncio.run(reset())
