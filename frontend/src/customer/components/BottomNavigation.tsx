import { NavLink } from 'react-router-dom';
import { useCartStore } from '@customer/stores/useCartStore';
import { Badge } from '@shared/components/Badge';

export function BottomNavigation() {
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const navItems = [
    { to: '/', label: '메뉴', icon: '🍽️' },
    { to: '/cart', label: '장바구니', icon: '🛒', badge: totalItems },
    { to: '/orders', label: '주문내역', icon: '📋' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex" data-testid="bottom-navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 min-h-touch
            ${isActive ? 'text-primary-600' : 'text-gray-400'}`
          }
          data-testid={`nav-${item.label}`}
        >
          <span className="text-xl relative">
            {item.icon}
            {item.badge ? (
              <span className="absolute -top-1 -right-2">
                <Badge count={item.badge} variant="danger" />
              </span>
            ) : null}
          </span>
          <span className="text-xs mt-0.5">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
