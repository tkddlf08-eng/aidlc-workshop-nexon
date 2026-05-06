"""Seed script to create initial store and admin account."""

import asyncio
import sys
sys.path.insert(0, ".")

from app.core.config import settings
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import hash_password
from app.auth.models import Admin, Store


async def seed():
    """Create initial data: store + admin."""
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if store already exists
        from sqlalchemy import select
        result = await db.execute(
            select(Store).where(Store.store_code == "demo-store")
        )
        if result.scalar_one_or_none():
            print("Seed data already exists. Skipping.")
            return

        # Create store
        store = Store(name="데모 매장", store_code="demo-store")
        db.add(store)
        await db.flush()

        # Create admin
        admin = Admin(
            store_id=store.id,
            username="admin",
            password_hash=hash_password("admin1234"),
        )
        db.add(admin)
        await db.commit()

        print(f"Store created: {store.name} (code: {store.store_code})")
        print(f"Admin created: {admin.username} (password: admin1234)")
        print("Done!")


if __name__ == "__main__":
    asyncio.run(seed())
