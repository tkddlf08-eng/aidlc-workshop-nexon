import { useState } from 'react';
import { Plus } from 'lucide-react';
import CategoryItem from './CategoryItem';
import Button from '@/shared/components/Button';
import { useMenuStore } from '@/admin/stores/useMenuStore';
import { useUIStore } from '@/admin/stores/useUIStore';

export default function CategoryPanel() {
  const { categories, selectedCategoryId, selectCategory, createCategory } =
    useMenuStore();
  const { showToast } = useUIStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory({ name: newName.trim() });
      setNewName('');
      setIsAdding(false);
      showToast('success', '카테고리가 추가되었습니다');
    } catch {
      showToast('error', '카테고리 추가에 실패했습니다');
    }
  };

  return (
    <div className="w-64 border-r bg-white flex flex-col" data-testid="category-panel">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">카테고리</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 rounded hover:bg-gray-100"
          aria-label="카테고리 추가"
          data-testid="category-add-button"
        >
          <Plus className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {isAdding && (
        <div className="p-2 border-b">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-primary outline-none"
            placeholder="카테고리명"
            autoFocus
            data-testid="category-name-input"
          />
          <div className="flex gap-1 mt-1">
            <Button size="sm" onClick={handleAdd} data-testid="category-save-button">
              추가
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
              취소
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            isSelected={category.id === selectedCategoryId}
            onSelect={() => selectCategory(category.id)}
          />
        ))}
      </div>
    </div>
  );
}
