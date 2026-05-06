"""Menu and category business logic."""

import structlog
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.storage import LocalStorage, StorageBackend
from app.menus.models import Menu
from app.menus.repository import CategoryRepository, MenuRepository
from app.menus.schemas import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    MenuCreate,
    MenuOrderUpdate,
    MenuResponse,
    MenuUpdate,
)

logger = structlog.get_logger()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB


class MenuService:
    """Service for menu and category management."""

    def __init__(self, db: AsyncSession, storage: StorageBackend | None = None):
        self.db = db
        self.category_repo = CategoryRepository(db)
        self.menu_repo = MenuRepository(db)
        self.storage = storage or LocalStorage()

    # --- Category operations ---

    async def get_categories(self, store_id: int) -> list[CategoryResponse]:
        categories = await self.category_repo.get_all(store_id)
        return [CategoryResponse.model_validate(c) for c in categories]

    async def create_category(
        self, store_id: int, data: CategoryCreate
    ) -> CategoryResponse:
        existing = await self.category_repo.get_by_name(store_id, data.name)
        if existing:
            raise ConflictError(f"'{data.name}' 카테고리가 이미 존재합니다")

        sort_order = data.sort_order
        if sort_order is None:
            sort_order = await self.category_repo.get_max_sort_order(store_id) + 1

        category = await self.category_repo.create(store_id, data.name, sort_order)
        logger.info("category_created", category_id=category.id, name=data.name)
        return CategoryResponse.model_validate(category)

    async def update_category(
        self, category_id: int, store_id: int, data: CategoryUpdate
    ) -> CategoryResponse:
        category = await self.category_repo.get_by_id(category_id)
        if not category or category.store_id != store_id:
            raise NotFoundError("카테고리")

        if data.name and data.name != category.name:
            existing = await self.category_repo.get_by_name(store_id, data.name)
            if existing:
                raise ConflictError(f"'{data.name}' 카테고리가 이미 존재합니다")

        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            await self.category_repo.update(category_id, **update_data)

        updated = await self.category_repo.get_by_id(category_id)
        return CategoryResponse.model_validate(updated)

    async def delete_category(self, category_id: int, store_id: int) -> None:
        category = await self.category_repo.get_by_id(category_id)
        if not category or category.store_id != store_id:
            raise NotFoundError("카테고리")

        has_menus = await self.category_repo.has_active_menus(category_id)
        if has_menus:
            raise ConflictError(
                "카테고리에 메뉴가 존재합니다. 메뉴를 먼저 이동 또는 삭제해주세요"
            )

        await self.category_repo.delete(category_id)
        logger.info("category_deleted", category_id=category_id)

    # --- Menu operations ---

    async def get_menus(self, category_id: int | None = None) -> list[MenuResponse]:
        menus = await self.menu_repo.get_all_active(category_id)
        return [MenuResponse.model_validate(m) for m in menus]

    async def create_menu(
        self, store_id: int, data: MenuCreate
    ) -> MenuResponse:
        # Verify category exists and belongs to store
        category = await self.category_repo.get_by_id(data.category_id)
        if not category or category.store_id != store_id:
            raise NotFoundError("카테고리")

        sort_order = await self.menu_repo.get_max_sort_order(data.category_id) + 1

        menu = await self.menu_repo.create(
            category_id=data.category_id,
            name=data.name,
            price=data.price,
            description=data.description,
            sort_order=sort_order,
        )
        logger.info("menu_created", menu_id=menu.id, name=data.name)
        return MenuResponse.model_validate(menu)

    async def update_menu(
        self, menu_id: int, store_id: int, data: MenuUpdate
    ) -> MenuResponse:
        menu = await self.menu_repo.get_by_id(menu_id)
        if not menu or menu.is_deleted:
            raise NotFoundError("메뉴")

        if data.category_id:
            category = await self.category_repo.get_by_id(data.category_id)
            if not category or category.store_id != store_id:
                raise NotFoundError("카테고리")

        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            await self.menu_repo.update(menu_id, **update_data)

        updated = await self.menu_repo.get_by_id(menu_id)
        return MenuResponse.model_validate(updated)

    async def delete_menu(self, menu_id: int) -> None:
        menu = await self.menu_repo.get_by_id(menu_id)
        if not menu or menu.is_deleted:
            raise NotFoundError("메뉴")

        await self.menu_repo.soft_delete(menu_id)
        logger.info("menu_deleted", menu_id=menu_id)

    async def upload_image(
        self, menu_id: int, file: UploadFile, store_id: int
    ) -> str:
        menu = await self.menu_repo.get_by_id(menu_id)
        if not menu or menu.is_deleted:
            raise NotFoundError("메뉴")

        # Validate file
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise ValidationError(
                f"지원하지 않는 이미지 형식입니다. 허용: JPEG, PNG, WebP"
            )

        content = await file.read()
        if len(content) > MAX_IMAGE_SIZE:
            raise ValidationError("이미지 크기는 5MB 이하여야 합니다")
        await file.seek(0)

        # Delete old image if exists
        if menu.image_url:
            try:
                await self.storage.delete(menu.image_url)
            except Exception:
                pass

        # Upload new image
        image_url = await self.storage.upload(file, store_id)
        await self.menu_repo.update(menu_id, image_url=image_url)

        logger.info("menu_image_uploaded", menu_id=menu_id)
        return image_url

    async def update_menu_order(
        self, category_id: int, store_id: int, data: MenuOrderUpdate
    ) -> list[MenuResponse]:
        category = await self.category_repo.get_by_id(category_id)
        if not category or category.store_id != store_id:
            raise NotFoundError("카테고리")

        # Validate all menu_ids belong to this category
        menus = await self.menu_repo.get_by_category(category_id)
        active_ids = {m.id for m in menus}

        if set(data.menu_ids) != active_ids:
            raise ValidationError(
                "카테고리의 모든 활성 메뉴 ID를 포함해야 합니다"
            )

        await self.menu_repo.update_sort_orders(category_id, data.menu_ids)
        updated_menus = await self.menu_repo.get_by_category(category_id)
        return [MenuResponse.model_validate(m) for m in updated_menus]
