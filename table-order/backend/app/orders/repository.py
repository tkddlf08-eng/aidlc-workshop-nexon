"""Order repository for database access."""

from datetime import datetime, timezone

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.orders.models import Order, OrderItem


class OrderRepository:
    """Repository for order DB operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_order(
        self, session_id: int, table_id: int, order_number: str, total_amount: int
    ) -> Order:
        order = Order(
            session_id=session_id,
            table_id=table_id,
            order_number=order_number,
            total_amount=total_amount,
        )
        self.db.add(order)
        await self.db.flush()
        await self.db.refresh(order)
        return order

    async def create_items(self, items: list[OrderItem]) -> None:
        self.db.add_all(items)
        await self.db.flush()

    async def get_by_id(self, order_id: int) -> Order | None:
        stmt = select(Order).where(Order.id == order_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_items(self, order_id: int) -> list[OrderItem]:
        stmt = select(OrderItem).where(OrderItem.order_id == order_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_session_orders(
        self, session_id: int, limit: int = 10, offset: int = 0
    ) -> tuple[list[Order], int]:
        """Get orders for a session with pagination."""
        base = select(Order).where(
            Order.session_id == session_id,
            Order.is_deleted == False,
            Order.is_archived == False,
        )
        # Count
        count_stmt = select(func.count()).select_from(base.subquery())
        total = (await self.db.execute(count_stmt)).scalar_one()

        # Data
        stmt = base.order_by(Order.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(stmt)
        orders = list(result.scalars().all())

        return orders, total

    async def update_status(self, order_id: int, status: str) -> None:
        stmt = (
            update(Order)
            .where(Order.id == order_id)
            .values(status=status)
        )
        await self.db.execute(stmt)

    async def soft_delete(self, order_id: int) -> None:
        stmt = (
            update(Order)
            .where(Order.id == order_id)
            .values(is_deleted=True, deleted_at=datetime.now(timezone.utc))
        )
        await self.db.execute(stmt)

    async def archive_and_calculate(self, session_id: int) -> dict:
        """Archive all orders in session and return revenue summary."""
        now = datetime.now(timezone.utc)

        # Get revenue before archiving
        revenue_stmt = select(
            func.coalesce(func.sum(Order.total_amount), 0),
            func.count(Order.id),
        ).where(
            Order.session_id == session_id,
            Order.is_deleted == False,
        )
        result = await self.db.execute(revenue_stmt)
        row = result.one()
        total_revenue = row[0]
        order_count = row[1]

        # Archive orders
        stmt = (
            update(Order)
            .where(Order.session_id == session_id, Order.is_deleted == False)
            .values(is_archived=True, archived_at=now)
        )
        await self.db.execute(stmt)

        return {"total_revenue": total_revenue, "order_count": order_count}

    async def get_history(
        self, table_id: int, date_from: datetime | None, date_to: datetime | None,
        limit: int = 10, offset: int = 0,
    ) -> tuple[list[Order], int]:
        """Get archived orders for a table with date filtering."""
        base = select(Order).where(
            Order.table_id == table_id,
            Order.is_archived == True,
            Order.is_deleted == False,
        )
        if date_from:
            base = base.where(Order.archived_at >= date_from)
        if date_to:
            base = base.where(Order.archived_at <= date_to)

        count_stmt = select(func.count()).select_from(base.subquery())
        total = (await self.db.execute(count_stmt)).scalar_one()

        stmt = base.order_by(Order.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(stmt)
        orders = list(result.scalars().all())

        return orders, total

    async def get_today_order_count(self, table_id: int) -> int:
        """Get today's order count for order number generation."""
        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        stmt = select(func.count()).where(
            Order.table_id == table_id,
            Order.created_at >= today_start,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()
