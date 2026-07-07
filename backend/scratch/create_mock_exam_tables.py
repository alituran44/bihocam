import asyncio
import sys

sys.path.insert(0, ".")

from app.db.session import engine
from app.db.base import Base
import app.models  # Import models to register them in metadata


async def main():
    print("Creating mock exam database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")


if __name__ == "__main__":
    asyncio.run(main())
