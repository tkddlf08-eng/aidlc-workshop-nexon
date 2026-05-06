"""Table and session request/response schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class TableSetupRequest(BaseModel):
    """Table initial setup request."""

    table_number: int = Field(..., ge=1, le=99)
    password: str = Field(..., min_length=4)


class TableResponse(BaseModel):
    """Table info response."""

    id: int
    store_id: int
    table_number: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TableDetailResponse(BaseModel):
    """Table detail with current session info."""

    id: int
    table_number: int
    is_active: bool
    has_active_session: bool
    total_order_amount: int = 0
    recent_orders: list = []


class DashboardTableCard(BaseModel):
    """Dashboard table card data."""

    table_id: int
    table_number: int
    has_active_session: bool
    total_order_amount: int = 0
    order_count: int = 0
    recent_orders: list = []


class DashboardResponse(BaseModel):
    """Dashboard data response."""

    tables: list[DashboardTableCard]


class CompleteSessionResponse(BaseModel):
    """Session completion response."""

    message: str
    total_revenue: int
    order_count: int
