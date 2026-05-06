import type { CartItem } from '@shared/api/types';
import { QuantityControl } from './QuantityControl';
import { useCartStore } from '@customer/stores/useCartStore';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = item.price * item.quantity;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3" data-testid={`cart-item-${item.menuId}`}>
      <div className="flex-1">
        <h3 className="font-medium">{item.menuName}</h3>
        <p className="text-sm text-gray-500">{item.price.toLocaleString('ko-KR')}원</p>
      </div>
      <QuantityControl
        quantity={item.quantity}
        onIncrease={() => updateQuantity(item.menuId, item.quantity + 1)}
        onDecrease={() => updateQuantity(item.menuId, item.quantity - 1)}
      />
      <div className="text-right min-w-[70px]">
        <p className="font-bold">{subtotal.toLocaleString('ko-KR')}원</p>
        <button
          className="text-xs text-red-400 mt-1"
          onClick={() => removeItem(item.menuId)}
          data-testid={`cart-remove-${item.menuId}`}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
