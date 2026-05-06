import { useState } from 'react';
import { useCategories, useMenus } from '@shared/api/queries';
import { CategoryTabs } from '@customer/components/CategoryTabs';
import { MenuGrid } from '@customer/components/MenuGrid';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import { EmptyState } from '@shared/components/EmptyState';

export default function MenuPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: menus = [], isLoading: menusLoading } = useMenus(selectedCategoryId);

  const isLoading = categoriesLoading || menusLoading;

  return (
    <div className="flex flex-col gap-4 pt-4" data-testid="menu-page">
      <CategoryTabs
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : menus.length === 0 ? (
        <EmptyState message="등록된 메뉴가 없습니다" />
      ) : (
        <MenuGrid menus={menus} />
      )}
    </div>
  );
}
