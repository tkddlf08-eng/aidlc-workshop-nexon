"""Authentication repository for database access."""

from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import Admin, Store


class AuthRepository:
    """Repository for authentication-related DB operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_store_by_code(self, store_code: str) -> Store | None:
        """Find store by store_code."""
        stmt = select(Store).where(Store.store_code == store_code)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_admin(self, store_id: int, username: str) -> Admin | None:
        """Find admin by store_id and username."""
        stmt = select(Admin).where(
            Admin.store_id == store_id,
            Admin.username == username,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_admin_by_id(self, admin_id: int) -> Admin | None:
        """Find admin by ID."""
        return await self.db.get(Admin, admin_id)

    async def increment_failed_attempts(self, admin_id: int) -> None:
        """Increment failed login attempts counter."""
        stmt = (
            update(Admin)
            .where(Admin.id == admin_id)
            .values(failed_login_attempts=Admin.failed_login_attempts + 1)
        )
        await self.db.execute(stmt)

    async def lock_account(self, admin_id: int, until: datetime) -> None:
        """Lock admin account until specified time."""
        stmt = (
            update(Admin)
            .where(Admin.id == admin_id)
            .values(locked_until=until)
        )
        await self.db.execute(stmt)

    async def reset_failed_attempts(self, admin_id: int) -> None:
        """Reset failed attempts on successful login."""
        stmt = (
            update(Admin)
            .where(Admin.id == admin_id)
            .values(failed_login_attempts=0, locked_until=None)
        )
        await self.db.execute(stmt)

    async def update_password(self, admin_id: int, password_hash: str) -> None:
        """Update admin password."""
        stmt = (
            update(Admin)
            .where(Admin.id == admin_id)
            .values(password_hash=password_hash)
        )
        await self.db.execute(stmt)
