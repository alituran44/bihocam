import asyncio
import sys
from sqlalchemy import text

# Add parent directory to path to import app
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        try:
            # We check if pdf_path already exists first, but a simple try-except is also fine.
            await conn.execute(text("ALTER TABLE quizzes ADD COLUMN pdf_path VARCHAR(500) NULL;"))
            print("Successfully added pdf_path to quizzes!")
        except Exception as e:
            print("Already exists or other issue:", e)

if __name__ == "__main__":
    asyncio.run(main())
