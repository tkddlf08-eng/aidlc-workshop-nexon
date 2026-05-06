"""Order business logic."""

from datetime import datetime, timezone

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.menus.repository import MenuRepository
from app.orders.models import OrderItem
from app.orders.repository import OrderRepository
from app.orders.schemas import (
    OrderCreate,
    OrderItemResponse,
    OrderResponse,
    OrderStatusUpdate,
)
from app.tables.repository import SessionRepository
from app.tables.service import TableService

logger = structlog.get_logger()

VALID_TRANSITIONS = {
    "PENDING": ["PREPARING"],
    "PREPARING": ["COMPLETED"],
    "COMPLETED": [],
}


class OrderService:
    """Service for order management."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.menu_repo = MenuRepository(db)
        self.session_repo = SessionRepository(db)
        self.table_service = TableService(db)

    async def create_order(
        self, table_id: int, table_number: int, data: OrderCreate
    ) -> OrderResponse:
        """Create a new order with validation."""
        # 1. Validate menus
        menu_ids = [item.menu_id for item in data.items]
        menus = await self.menu_repo.get_by_ids(menu_ids)
        menu_map = {m.id: m for m in menus}

        for item in data.items:
            menu = menu_map.get(item.menu_id)
            if not menu or menu.is_deleted:
                raise ValidationError(f"메뉴를 찾을 수 없습니다 (ID: {item.menu_id})")
            if menu.is_sold_out:
                raise ValidationError(f"품절된 메뉴가 포함되어 있습니다: {menu.name}")

        # 2. Get or create session
        session_id = await self.table_service.get_or_create_session(table_id)

        # 3. Generate order number
        today_count = await self.order_repo.get_today_order_count(table_id)
        now = datetime.now(timezone.utc)
        order_number = (
            f"{now.strftime('%y%m%d')}-{table_number:02d}-{today_count + 1:03d}"
        )

        # 4. Calculate total and create order items
        order_items = []
        total_amount = 0
        for item in data.items:
            menu = menu_map[item.menu_id]
            subtotal = menu.price * item.quantity
            total_amount += subtotal
            order_items.append(
                OrderItem(
                    menu_id=menu.id,
                    menu_name=menu.name,
                    quantity=item.quantity,
                    unit_price=menu.price,
                    subtotal=subtotal,
                )
            )

        # 5. Create order
        order = await self.order_repo.create_order(
            session_id=session_id,
            table_id=table_id,
            order_number=order_number,
            total_amount=total_amount,
        )

        # 6. Create order items
        for oi in order_items:
            oi.order_id = order.id
        await self.order_repo.create_items(order_items)

        logger.info(
            "order_created",
            order_id=order.id,
            order_number=order_number,
            table_id=table_id,
            total=total_amount,
        )

        return OrderResponse(
            id=order.id,
            order_number=order.order_number,
            table_id=order.table_id,
            session_id=order.session_id,
            total_amount=order.total_amount,
            status=order.status,
            items=[OrderItemResponse.model_validate(oi) for oi in order_items],
            created_at=order.created_at,
            updated_at=order.updated_at,
        )

    async def get_session_orders(
        self, session_id: int, page: int, limit: int
    ) -> dict:
        """Get paginated orders for a session."""
        offset = (page - 1) * limit
        orders, total = await self.order_repo.get_session_orders(
            session_id, limit, offset
        )

        items = []
        for order in orders:
            order_items = await self.order_repo.get_items(order.id)
            items.append(
                OrderResponse(
                    id=order.id,
                    order_number=order.order_number,
                    table_id=order.table_id,
                    session_id=order.session_id,
                    total_amount=order.total_amount,
                    status=order.status,
                    items=[OrderItemResponse.model_validate(oi) for oi in order_items],
                    created_at=order.created_at,
                    updated_at=order.updated_at,
                )
            )

        total_pages = (total + limit - 1) // limit
        return {
            "items": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_items": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }

    async def update_status(self, order_id: int, data: OrderStatusUpdate) -> OrderResponse:
        """Update order status with transition validation."""
        order = await self.order_repo.get_by_id(order_id)
        if not order or order.is_deleted:
            raise NotFoundError("주문")

        allowed = VALID_TRANSITIONS.get(order.status, [])
        if data.status not in allowed:
            raise ConflictError(
                f"{order.status}에서 {data.status}로 변경할 수 없습니다"
            )

        # Get items before update to avoid session issues
        items = await self.order_repo.get_items(order_id)

        # Capture values before update
        response = OrderResponse(
            id=order.id,
            order_number=order.order_number,
            table_id=order.table_id,
            session_id=order.session_id,
            total_amount=order.total_amount,
            status=data.status,
            items=[OrderItemResponse.model_validate(oi) for oi in items],
            created_at=order.created_at,
            updated_at=order.updated_at,
        )

        await self.order_repo.update_status(order_id, data.status)
        logger.info(
            "order_status_changed",
            order_id=order_id,
            old_status=order.status,
            new_status=data.status,
        )

        return response

    async def delete_order(self, order_id: int) -> None:
        """Soft delete an order."""
        order = await self.order_repo.get_by_id(order_id)
        if not order or order.is_deleted:
            raise NotFoundError("주문")
        if order.is_archived:
            raise ConflictError("이미 이용 완료된 주문은 삭제할 수 없습니다")

        await self.order_repo.soft_delete(order_id)
        logger.info("order_deleted", order_id=order_id)
