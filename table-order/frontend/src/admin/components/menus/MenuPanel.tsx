import { useState } from 'react';
import { Plus } from 'lucide-react';
import MenuItem from './MenuItem';
import MenuFormModal from './MenuFormModal';
import Button from '@/shared/components/Button';
import EmptyState from '@/shared/components/EmptyState';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { useMenuStore, type DisplayMenu } from '@/admin/stores/useMenuStore';

export default function MenuPanel() {
  const { menus, selectedCategoryId, isLoading } = useMenuStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<DisplayMenu | undefined>();

  const handleEdit = (menu: DisplayMenu) => {
    setEditingMenu(menu);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMenu(undefined);
  };

  if (!selectedCategoryId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState title="카테고리를 선택해주세요" description="좌측에서 카테고리를 선택하면 메뉴가 표시됩니다" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" data-testid="menu-panel">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">메뉴 목록</h3>
        <Button
          size="sm"
          onClick={() => setIsFormOpen(true)}
          data-testid="menu-add-button"
        >
          <Plus className="h-4 w-4 mr-1" />
          메뉴 추가
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <LoadingSpinner className="h-40" />
        ) : menus.length === 0 ? (
          <EmptyState title="메뉴가 없습니다" description="메뉴를 추가해주세요" />
        ) : (
          <div className="space-y-2">
            {menus.map((menu) => (
              <MenuItem key={menu.id} menu={menu} onEdit={() => handleEdit(menu)} />
            ))}
          </div>
        )}
      </div>

      <MenuFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        initialData={editingMenu}
      />
    </div>
  );
}
