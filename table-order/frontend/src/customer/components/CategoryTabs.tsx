import type { Category } from '@shared/api/types';

interface CategoryTabsProps {
  categories: Category[];
  selectedId: string | undefined;
  onSelect: (categoryId: string | undefined) => void;
}

export function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide" data-testid="category-tabs">
      <button
        className={`
          min-w-touch min-h-touch px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
          transition-colors
          ${!selectedId ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}
        `}
        onClick={() => onSelect(undefined)}
        data-testid="category-tab-all"
      >
        전체
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`
            min-w-touch min-h-touch px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
            transition-colors
            ${selectedId === category.id ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}
          `}
          onClick={() => onSelect(category.id)}
          data-testid={`category-tab-${category.id}`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
