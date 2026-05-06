"""Order request/response schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    menu_id: int = Field(..., gt=0)
    quantity: int = Field(..., ge=1, le=99)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderItemResponse(BaseModel):
    id: int
    menu_id: int | None
    menu_name: str
    quantity: int
    unit_price: int
    subtotal: int

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    order_number: str
    table_id: int
    session_id: int
    total_amount: int
    status: str
    items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    pagination: dict


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(PREPARING|COMPLETED)$")


class PaginatedResponse(BaseModel):
    items: list[OrderResponse]
    pagination: dict
