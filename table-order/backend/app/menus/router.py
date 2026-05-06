"""Menu and category API endpoints."""

from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import UserInfo, get_current_admin
from app.menus.schemas import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    MenuCreate,
    MenuOrderUpdate,
    MenuResponse,
    MenuUpdate,
)
from app.menus.service import MenuService

router = APIRouter(tags=["Menus"])


# --- Category endpoints ---

@router.get("/api/categories", response_model=list[CategoryResponse])
async def get_categories(
    store_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """카테고리 목록 조회."""
    service = MenuService(db)
    return await service.get_categories(store_id)


@router.post("/api/categories", response_model=CategoryResponse, status_code=201)
async def create_category(
    data: CategoryCreate,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """카테고리 생성."""
    service = MenuService(db)
    return await service.create_category(user.store_id, data)


@router.put("/api/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """카테고리 수정."""
    service = MenuService(db)
    return await service.update_category(category_id, user.store_id, data)


@router.delete("/api/categories/{category_id}", status_code=200)
async def delete_category(
    category_id: int,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """카테고리 삭제."""
    service = MenuService(db)
    await service.delete_category(category_id, user.store_id)
    return {"message": "카테고리가 삭제되었습니다"}


@router.put(
    "/api/categories/{category_id}/menu-order",
    response_model=list[MenuResponse],
)
async def update_menu_order(
    category_id: int,
    data: MenuOrderUpdate,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """카테고리 내 메뉴 순서 일괄 업데이트."""
    service = MenuService(db)
    return await service.update_menu_order(category_id, user.store_id, data)


# --- Menu endpoints ---

@router.get("/api/menus", response_model=list[MenuResponse])
async def get_menus(
    category_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """메뉴 목록 조회."""
    service = MenuService(db)
    return await service.get_menus(category_id)


@router.post("/api/menus", response_model=MenuResponse, status_code=201)
async def create_menu(
    data: MenuCreate,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """메뉴 등록."""
    service = MenuService(db)
    return await service.create_menu(user.store_id, data)


@router.put("/api/menus/{menu_id}", response_model=MenuResponse)
async def update_menu(
    menu_id: int,
    data: MenuUpdate,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """메뉴 수정."""
    service = MenuService(db)
    return await service.update_menu(menu_id, user.store_id, data)


@router.delete("/api/menus/{menu_id}")
async def delete_menu(
    menu_id: int,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """메뉴 삭제 (Soft Delete)."""
    service = MenuService(db)
    await service.delete_menu(menu_id)
    return {"message": "메뉴가 삭제되었습니다"}


@router.post("/api/menus/{menu_id}/image")
async def upload_menu_image(
    menu_id: int,
    file: UploadFile = File(...),
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """메뉴 이미지 업로드."""
    service = MenuService(db)
    image_url = await service.upload_image(menu_id, file, user.store_id)
    return {"image_url": image_url}
