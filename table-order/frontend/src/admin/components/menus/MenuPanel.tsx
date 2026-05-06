import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import MenuItem from './MenuItem';
import MenuFormModal from './MenuFormModal';
import Button from '@/shared/components/Button';
import EmptyState from '@/shared/components/EmptyState';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { useMenuStore } from '@/admin/stores/useMenuStore';
import { useUIStore } from '@/admin/stores/useUIStore';
import type { Menu } from '@/shared/types/menu';

export default function MenuPanel() {
  const { menus, selectedCategoryId, isLoading, reorderMenu } = useMenuStore();
  const { showToast } = useUIStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | undefined>();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const newIndex = menus.findIndex((m) => m.id === over.id);
    if (newIndex === -1) return;

    try {
      await reorderMenu(String(active.id), newIndex);
    } catch {
      showToast('error', '순서 변경에 실패했습니다');
    }
  };

  const handleEdit = (menu: Menu) => {
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
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={menus.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {menus.map((menu) => (
                  <MenuItem key={menu.id} menu={menu} onEdit={() => handleEdit(menu)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
