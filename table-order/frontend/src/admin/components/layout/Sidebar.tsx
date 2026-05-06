import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, LogOut } from 'lucide-react';
import { useAdminAuthStore } from '@/admin/stores/useAdminAuthStore';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { to: '/admin/menus', icon: UtensilsCrossed, label: '메뉴 관리' },
];

export default function Sidebar() {
  const logout = useAdminAuthStore((state) => state.logout);

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold text-gray-900">테이블오더</h1>
        <p className="text-xs text-gray-500">관리자</p>
      </div>

      <nav className="flex-1 p-3 space-y-1" aria-label="메인 네비게이션">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
            data-testid={`sidebar-nav-${item.label}`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 w-full transition-colors"
          data-testid="sidebar-logout-button"
        >
          <LogOut className="h-5 w-5" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
