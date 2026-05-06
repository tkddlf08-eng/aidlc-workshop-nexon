import { useCartStore } from '@customer/stores/useCartStore';

export function CartSummary() {
  const totalPrice = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <div className="bg-gray-100 rounded-lg p-4" data-testid="cart-summary">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>총 수량</span>
        <span>{totalItems}개</span>
      </div>
      <div className="flex justify-between font-bold text-lg">
        <span>총 금액</span>
        <span className="text-primary-600" data-testid="cart-total-price">
          {totalPrice.toLocaleString('ko-KR')}원
        </span>
      </div>
    </div>
  );
}
