import { useEffect } from 'react';
import Header from '@/admin/components/layout/Header';
import CategoryPanel from '@/admin/components/menus/CategoryPanel';
import MenuPanel from '@/admin/components/menus/MenuPanel';
import { useMenuStore } from '@/admin/stores/useMenuStore';
import { useAdminAuthStore } from '@/admin/stores/useAdminAuthStore';

export default function MenuManagementPage() {
  const loadCategories = useMenuStore((state) => state.loadCategories);
  const setStoreId = useMenuStore((state) => state.setStoreId);
  const admin = useAdminAuthStore((state) => state.admin);

  useEffect(() => {
    if (admin?.storeId) {
      setStoreId(Number(admin.storeId));
      loadCategories();
    }
  }, [admin?.storeId, setStoreId, loadCategories]);

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
