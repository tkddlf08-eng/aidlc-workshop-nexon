import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useMenuStore } from '@/admin/stores/useMenuStore';
import { useUIStore } from '@/admin/stores/useUIStore';
import type { DisplayCategory } from '@/admin/stores/useMenuStore';

interface CategoryItemProps {
  category: DisplayCategory;
  isSelected: boolean;
  onSelect: () => void;
}

export default function CategoryItem({ category, isSelected, onSelect }: CategoryItemProps) {
  const { updateCategory, deleteCategory } = useMenuStore();
  const { showToast, showConfirm } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleUpdate = async () => {
    if (!editName.trim() || editName === category.name) {
      setIsEditing(false);
      return;
    }
    try {
      await updateCategory(category.id, { name: editName.trim() });
      setIsEditing(false);
      showToast('success', '카테고리가 수정되었습니다');
    } catch {
      showToast('error', '카테고리 수정에 실패했습니다');
    }
  };

  const handleDelete = () => {
    showConfirm({
      title: '카테고리 삭제',
      message: `"${category.name}" 카테고리를 삭제하시겠습니까?`,
      variant: 'danger',
      confirmText: '삭제',
      onConfirm: async () => {
        try {
          await deleteCategory(category.id);
          showToast('success', '카테고리가 삭제되었습니다');
        } catch {
          showToast('error', '카테고리 삭제에 실패했습니다');
        }
      },
    });
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="p-2">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdate();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          onBlur={handleUpdate}
          className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-primary outline-none"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-700'
      }`}
      onClick={onSelect}
      data-testid={`category-item-${category.id}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-0.5 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="드래그하여 순서 변경"
      >
        <GripVertical className="h-3.5 w-3.5 text-gray-400" />
      </button>
      <span className="flex-1 text-sm font-medium truncate">{category.name}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditName(category.name); }}
          className="p-1 rounded hover:bg-gray-200"
          aria-label="수정"
        >
          <Pencil className="h-3 w-3 text-gray-500" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="p-1 rounded hover:bg-red-100"
          aria-label="삭제"
        >
          <Trash2 className="h-3 w-3 text-red-500" />
        </button>
      </div>
    </div>
  );
}
