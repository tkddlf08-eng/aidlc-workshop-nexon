"""Table and session business logic."""

from datetime import datetime, timezone

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.security import hash_password
from app.tables.models import SessionRevenue, TableEntity
from app.tables.repository import RevenueRepository, SessionRepository, TableRepository
from app.tables.schemas import CompleteSessionResponse, TableResponse

logger = structlog.get_logger()


class TableService:
    """Service for table management and session lifecycle."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.table_repo = TableRepository(db)
        self.session_repo = SessionRepository(db)
        self.revenue_repo = RevenueRepository(db)

    async def setup_table(
        self, store_id: int, table_number: int, password: str
    ) -> TableResponse:
        """Create or update table initial setup."""
        existing = await self.table_repo.get_by_store_and_number(
            store_id, table_number
        )
        if existing:
            raise ConflictError(
                f"테이블 {table_number}번은 이미 등록되어 있습니다"
            )

        password_hashed = hash_password(password)
        table = await self.table_repo.create(store_id, table_number, password_hashed)
        logger.info("table_setup", table_id=table.id, table_number=table_number)
        return TableResponse.model_validate(table)

    async def get_tables(self, store_id: int) -> list[TableResponse]:
        """Get all tables for a store."""
        tables = await self.table_repo.get_all_by_store(store_id)
        return [TableResponse.model_validate(t) for t in tables]

    async def get_or_create_session(self, table_id: int) -> int:
        """Get active session or create new one. Returns session_id."""
        session = await self.session_repo.get_active_session(table_id)
        if session:
            return session.id
        new_session = await self.session_repo.create_session(table_id)
        logger.info("session_created", table_id=table_id, session_id=new_session.id)
        return new_session.id

    async def complete_session(
        self, table_id: int, store_id: int
    ) -> CompleteSessionResponse:
        """Complete table session: archive orders, record revenue, close session."""
        from app.orders.repository import OrderRepository

        order_repo = OrderRepository(self.db)

        # 1. Check active session exists
        session = await self.session_repo.get_active_session(table_id)
        if not session:
            raise NotFoundError("활성 세션")

        # 2. Archive orders and calculate revenue
        revenue_data = await order_repo.archive_and_calculate(session.id)

        # 3. Record revenue
        revenue = SessionRevenue(
            store_id=store_id,
            table_id=table_id,
            session_id=session.id,
            total_revenue=revenue_data["total_revenue"],
            order_count=revenue_data["order_count"],
            session_started_at=session.started_at,
            session_ended_at=datetime.now(timezone.utc),
        )
        await self.revenue_repo.create(revenue)

        # 4. Close session
        await self.session_repo.close_session(session.id)

        logger.info(
            "session_completed",
            table_id=table_id,
            session_id=session.id,
            revenue=revenue_data["total_revenue"],
        )

        return CompleteSessionResponse(
            message="테이블 이용 완료 처리되었습니다",
            total_revenue=revenue_data["total_revenue"],
            order_count=revenue_data["order_count"],
        )
