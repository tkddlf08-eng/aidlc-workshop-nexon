"""Order API endpoints."""

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import (
    PaginationParams,
    UserInfo,
    get_current_admin,
    get_current_table,
    get_current_user,
)
from app.orders.schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from app.orders.service import OrderService

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    data: OrderCreate,
    user: UserInfo = Depends(get_current_table),
    db: AsyncSession = Depends(get_db),
):
    """주문 생성 (고객)."""
    service = OrderService(db)
    return await service.create_order(
        table_id=user.table_id,
        table_number=user.table_number,
        data=data,
    )


@router.get("", response_model=dict)
async def get_orders(
    session_id: int = Query(...),
    pagination: PaginationParams = Depends(),
    user: UserInfo = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """현재 세션 주문 조회."""
    service = OrderService(db)
    return await service.get_session_orders(
        session_id, pagination.page, pagination.limit
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    user: UserInfo = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """주문 상세 조회."""
    from app.core.exceptions import NotFoundError
    from app.orders.repository import OrderRepository
    from app.orders.schemas import OrderItemResponse

    repo = OrderRepository(db)
    order = await repo.get_by_id(order_id)
    if not order or order.is_deleted:
        raise NotFoundError("주문")

    items = await repo.get_items(order_id)
    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        table_id=order.table_id,
        session_id=order.session_id,
        total_amount=order.total_amount,
        status=order.status,
        items=[OrderItemResponse.model_validate(oi) for oi in items],
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """주문 상태 변경 (관리자)."""
    service = OrderService(db)
    return await service.update_status(order_id, data)


@router.delete("/{order_id}")
async def delete_order(
    order_id: int,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """주문 삭제 (관리자, Soft Delete)."""
    service = OrderService(db)
    await service.delete_order(order_id)
    return {"message": "주문이 삭제되었습니다"}


@router.get("/history", response_model=dict)
async def get_order_history(
    table_id: int = Query(...),
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    pagination: PaginationParams = Depends(),
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """과거 주문 내역 조회 (관리자)."""
    from app.orders.repository import OrderRepository
    from app.orders.schemas import OrderItemResponse

    repo = OrderRepository(db)
    orders, total = await repo.get_history(
        table_id, date_from, date_to, pagination.limit, pagination.offset
    )

    items = []
    for order in orders:
        order_items = await repo.get_items(order.id)
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

    total_pages = (total + pagination.limit - 1) // pagination.limit
    return {
        "items": items,
        "pagination": {
            "page": pagination.page,
            "limit": pagination.limit,
            "total_items": total,
            "total_pages": total_pages,
            "has_next": pagination.page < total_pages,
            "has_prev": pagination.page > 1,
        },
    }


@router.get("/stream")
async def order_stream(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """SSE stream for real-time order updates (admin)."""
    from uuid import uuid4

    from sse_starlette.sse import EventSourceResponse

    from app.core.security import decode_access_token
    from app.orders.sse import sse_manager

    # Validate token
    payload = decode_access_token(token)
    if not payload or payload.get("role") != "admin":
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})

    client_id = str(uuid4())

    async def event_generator():
        async for event in sse_manager.subscribe_admin(client_id):
            yield event

    return EventSourceResponse(event_generator())
