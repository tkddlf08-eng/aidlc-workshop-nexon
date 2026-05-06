"""Table and session repository for database access."""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.tables.models import SessionRevenue, TableEntity, TableSession


class TableRepository:
    """Repository for table-related DB operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, table_id: int) -> TableEntity | None:
        return await self.db.get(TableEntity, table_id)

    async def get_by_store_and_number(
        self, store_id: int, table_number: int
    ) -> TableEntity | None:
        stmt = select(TableEntity).where(
            TableEntity.store_id == store_id,
            TableEntity.table_number == table_number,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_by_store(self, store_id: int) -> list[TableEntity]:
        stmt = (
            select(TableEntity)
            .where(TableEntity.store_id == store_id)
            .order_by(TableEntity.table_number)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create(
        self, store_id: int, table_number: int, password_hash: str
    ) -> TableEntity:
        table = TableEntity(
            store_id=store_id,
            table_number=table_number,
            password_hash=password_hash,
        )
        self.db.add(table)
        await self.db.flush()
        return table

    async def increment_failed_attempts(self, table_id: int) -> None:
        stmt = (
            update(TableEntity)
            .where(TableEntity.id == table_id)
            .values(failed_login_attempts=TableEntity.failed_login_attempts + 1)
        )
        await self.db.execute(stmt)

    async def lock_table(self, table_id: int, until: datetime) -> None:
        stmt = (
            update(TableEntity)
            .where(TableEntity.id == table_id)
            .values(locked_until=until)
        )
        await self.db.execute(stmt)

    async def reset_failed_attempts(self, table_id: int) -> None:
        stmt = (
            update(TableEntity)
            .where(TableEntity.id == table_id)
            .values(failed_login_attempts=0, locked_until=None)
        )
        await self.db.execute(stmt)


class SessionRepository:
    """Repository for table session DB operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_session(self, table_id: int) -> TableSession | None:
        stmt = select(TableSession).where(
            TableSession.table_id == table_id,
            TableSession.is_active == True,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_session(self, table_id: int) -> TableSession:
        session = TableSession(
            table_id=table_id,
            session_token=str(uuid4()),
        )
        self.db.add(session)
        await self.db.flush()
        return session

    async def close_session(self, session_id: int) -> None:
        stmt = (
            update(TableSession)
            .where(TableSession.id == session_id)
            .values(is_active=False, ended_at=datetime.now(timezone.utc))
        )
        await self.db.execute(stmt)


class RevenueRepository:
    """Repository for session revenue records."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, revenue: SessionRevenue) -> SessionRevenue:
        self.db.add(revenue)
        await self.db.flush()
        return revenue
