import type { Menu } from '@shared/api/types';
import { Image } from '@shared/components/Image';
import { Button } from '@shared/components/Button';
import { useCartStore } from '@customer/stores/useCartStore';
import toast from 'react-hot-toast';

interface MenuCardProps {
  menu: Menu;
}

export function MenuCard({ menu }: MenuCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem(menu);
    toast.success('장바구니에 추가되었습니다');
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('ko-KR') + '원';

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
      data-testid={`menu-card-${menu.id}`}
    >
      <Image
        src={menu.image_url}
        alt={menu.name}
        className="w-full h-36 object-cover"
      />
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-base mb-1">{menu.name}</h3>
        <p className="text-gray-500 text-xs mb-2 line-clamp-2 flex-1">{menu.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-primary-600">{formatPrice(menu.price)}</span>
          <Button
            size="sm"
            onClick={handleAdd}
            data-testid={`menu-add-button-${menu.id}`}
          >
            담기
          </Button>
        </div>
      </div>
    </div>
  );
}
