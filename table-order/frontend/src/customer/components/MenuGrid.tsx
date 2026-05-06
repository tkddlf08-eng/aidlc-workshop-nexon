import type { Menu } from '@shared/api/types';
import { MenuCard } from './MenuCard';

interface MenuGridProps {
  menus: Menu[];
}

export function MenuGrid({ menus }: MenuGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-24" data-testid="menu-grid">
      {menus.map((menu) => (
        <MenuCard key={menu.id} menu={menu} />
      ))}
    </div>
  );
}
