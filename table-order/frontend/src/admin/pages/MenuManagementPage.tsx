import { useEffect } from 'react';
import Header from '@/admin/components/layout/Header';
import CategoryPanel from '@/admin/components/menus/CategoryPanel';
import MenuPanel from '@/admin/components/menus/MenuPanel';
import { useMenuStore } from '@/admin/stores/useMenuStore';

export default function MenuManagementPage() {
  const loadCategories = useMenuStore((state) => state.loadCategories);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <div className="flex flex-col h-screen">
      <Header title="메뉴 관리" />
      <div className="flex-1 flex overflow-hidden">
        <CategoryPanel />
        <MenuPanel />
      </div>
    </div>
  );
}
