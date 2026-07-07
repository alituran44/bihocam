import asyncio
import sys

sys.path.insert(0, ".")

from sqlalchemy import select
from app.db.session import engine
from app.models.user import User


async def main():
    async with engine.connect() as conn:
        result = await conn.execute(select(User.email, User.role, User.is_active))
        users = result.all()
        print("Users in DB:")
        for email, role, is_active in users:
            print(f"  Email: {email}, Role: {role}, Active: {is_active}")


if __name__ == "__main__":
    asyncio.run(main())
