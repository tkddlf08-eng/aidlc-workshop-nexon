import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useMenuStore } from '@/admin/stores/useMenuStore';
import { useUIStore } from '@/admin/stores/useUIStore';
import { formatPrice } from '@/shared/utils/format';
import type { Menu } from '@/shared/types/menu';

interface MenuItemProps {
  menu: Menu;
  onEdit: () => void;
}

export default function MenuItem({ menu, onEdit }: MenuItemProps) {
  const deleteMenu = useMenuStore((state) => state.deleteMenu);
  const { showToast, showConfirm } = useUIStore();

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: menu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    showConfirm({
      title: '메뉴 삭제',
      message: `"${menu.name}" 메뉴를 삭제하시겠습니까?`,
      variant: 'danger',
      confirmText: '삭제',
      onConfirm: async () => {
        try {
          await deleteMenu(menu.id);
          showToast('success', '메뉴가 삭제되었습니다');
        } catch {
          showToast('error', '메뉴 삭제에 실패했습니다');
        }
      },
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-gray-300 transition-colors"
      data-testid={`menu-item-${menu.id}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="드래그하여 순서 변경"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </button>

      {menu.imageUrl ? (
        <img
          src={menu.imageUrl}
          alt={menu.name}
          className="h-12 w-12 rounded-lg object-cover"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
        />
      ) : (
        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
          <span className="text-xs text-gray-400">No img</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{menu.name}</p>
        <p className="text-sm text-primary font-semibold">{formatPrice(menu.price)}</p>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-gray-100"
          aria-label="수정"
          data-testid={`menu-${menu.id}-edit-button`}
        >
          <Pencil className="h-4 w-4 text-gray-500" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg hover:bg-red-50"
          aria-label="삭제"
          data-testid={`menu-${menu.id}-delete-button`}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}
