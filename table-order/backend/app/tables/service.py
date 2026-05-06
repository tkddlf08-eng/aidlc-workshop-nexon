"""Table and session business logic."""

from datetime import datetime, timezone

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.security import hash_password
from app.tables.models import SessionRevenue, TableEntity
from app.tables.repository import RevenueRepository, SessionRepository, TableRepository
from app.tables.schemas import CompleteSessionResponse, DashboardResponse, DashboardTableCard, TableResponse

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

    async def get_dashboard(self, store_id: int) -> DashboardResponse:
        """Get dashboard data with tables, sessions, and recent orders."""
        from app.orders.repository import OrderRepository

        tables = await self.table_repo.get_all_by_store(store_id)
        order_repo = OrderRepository(self.db)
        cards = []

        for table in tables:
            session = await self.session_repo.get_active_session(table.id)
            has_active_session = session is not None
            total_amount = 0
            order_count = 0
            recent_orders: list = []

            if session:
                orders, total = await order_repo.get_session_orders(
                    session.id, limit=5, offset=0
                )
                order_count = total
                total_amount = sum(o.total_amount for o in orders)
                for o in orders:
                    items = await order_repo.get_items(o.id)
                    recent_orders.append({
                        "id": o.id,
                        "order_number": o.order_number,
                        "status": o.status,
                        "total_amount": o.total_amount,
                        "created_at": o.created_at.isoformat() if o.created_at else None,
                        "items": [
                            {
                                "id": item.id,
                                "menu_name": item.menu_name,
                                "quantity": item.quantity,
                                "unit_price": item.unit_price,
                                "subtotal": item.subtotal,
                            }
                            for item in items
                        ],
                    })

            cards.append(DashboardTableCard(
                table_id=table.id,
                table_number=table.table_number,
                has_active_session=has_active_session,
                total_order_amount=total_amount,
                order_count=order_count,
                recent_orders=recent_orders,
            ))

        return DashboardResponse(tables=cards)

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
