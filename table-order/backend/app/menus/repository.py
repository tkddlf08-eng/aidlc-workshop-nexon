"""Menu and category repository for database access."""

from datetime import datetime, timezone

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.menus.models import Category, Menu


class CategoryRepository:
    """Repository for category DB operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, store_id: int) -> list[Category]:
        stmt = (
            select(Category)
            .where(Category.store_id == store_id)
            .order_by(Category.sort_order)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, category_id: int) -> Category | None:
        return await self.db.get(Category, category_id)

    async def get_by_name(self, store_id: int, name: str) -> Category | None:
        stmt = select(Category).where(
            Category.store_id == store_id, Category.name == name
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, store_id: int, name: str, sort_order: int) -> Category:
        category = Category(store_id=store_id, name=name, sort_order=sort_order)
        self.db.add(category)
        await self.db.flush()
        return category

    async def update(self, category_id: int, **kwargs) -> None:
        stmt = update(Category).where(Category.id == category_id).values(**kwargs)
        await self.db.execute(stmt)

    async def delete(self, category_id: int) -> None:
        stmt = delete(Category).where(Category.id == category_id)
        await self.db.execute(stmt)

    async def get_max_sort_order(self, store_id: int) -> int:
        stmt = select(func.coalesce(func.max(Category.sort_order), -1)).where(
            Category.store_id == store_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def has_active_menus(self, category_id: int) -> bool:
        stmt = select(func.count()).where(
            Menu.category_id == category_id, Menu.is_deleted == False
        )
        result = await self.db.execute(stmt)
        return result.scalar_one() > 0


class MenuRepository:
    """Repository for menu DB operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_category(
        self, category_id: int, include_sold_out: bool = True
    ) -> list[Menu]:
        stmt = (
            select(Menu)
            .where(Menu.category_id == category_id, Menu.is_deleted == False)
            .order_by(Menu.sort_order)
        )
        if not include_sold_out:
            stmt = stmt.where(Menu.is_sold_out == False)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_all_active(self, category_id: int | None = None) -> list[Menu]:
        stmt = select(Menu).where(Menu.is_deleted == False).order_by(Menu.sort_order)
        if category_id:
            stmt = stmt.where(Menu.category_id == category_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, menu_id: int) -> Menu | None:
        return await self.db.get(Menu, menu_id)

    async def get_by_ids(self, menu_ids: list[int]) -> list[Menu]:
        stmt = select(Menu).where(Menu.id.in_(menu_ids))
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, **kwargs) -> Menu:
        menu = Menu(**kwargs)
        self.db.add(menu)
        await self.db.flush()
        return menu

    async def update(self, menu_id: int, **kwargs) -> None:
        stmt = update(Menu).where(Menu.id == menu_id).values(**kwargs)
        await self.db.execute(stmt)

    async def soft_delete(self, menu_id: int) -> None:
        stmt = (
            update(Menu)
            .where(Menu.id == menu_id)
            .values(is_deleted=True, deleted_at=datetime.now(timezone.utc))
        )
        await self.db.execute(stmt)

    async def get_max_sort_order(self, category_id: int) -> int:
        stmt = select(func.coalesce(func.max(Menu.sort_order), -1)).where(
            Menu.category_id == category_id, Menu.is_deleted == False
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def update_sort_orders(
        self, category_id: int, menu_ids: list[int]
    ) -> None:
        """Bulk update sort orders based on menu_ids list order."""
        for index, menu_id in enumerate(menu_ids):
            stmt = (
                update(Menu)
                .where(Menu.id == menu_id, Menu.category_id == category_id)
                .values(sort_order=index)
            )
            await self.db.execute(stmt)
