"""Menu and category request/response schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


# Category schemas
class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    sort_order: int | None = None


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50)
    sort_order: int | None = None


class CategoryResponse(BaseModel):
    id: int
    store_id: int
    name: str
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


# Menu schemas
class MenuCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: int = Field(..., ge=0)
    description: str | None = Field(None, max_length=500)
    category_id: int = Field(..., gt=0)


class MenuUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    price: int | None = Field(None, ge=0)
    description: str | None = Field(None, max_length=500)
    category_id: int | None = Field(None, gt=0)
    is_sold_out: bool | None = None


class MenuResponse(BaseModel):
    id: int
    category_id: int
    name: str
    price: int
    description: str | None
    image_url: str | None
    sort_order: int
    is_sold_out: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MenuOrderUpdate(BaseModel):
    """Bulk menu order update for a category."""
    menu_ids: list[int] = Field(..., min_length=1)
