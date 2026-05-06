import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@customer/stores/useCartStore';
import { CartItemRow } from '@customer/components/CartItemRow';
import { CartSummary } from '@customer/components/CartSummary';
import { Button } from '@shared/components/Button';
import { EmptyState } from '@shared/components/EmptyState';

export default function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  if (items.length === 0) {
    return (
      <div className="pt-8">
        <EmptyState
          message="장바구니가 비어있습니다"
          action={
            <Button variant="secondary" onClick={() => navigate('/')} data-testid="cart-go-menu-button">
              메뉴 보러가기
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4 pb-32 px-4" data-testid="cart-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">장바구니</h1>
        <button
          className="text-sm text-red-500 min-w-touch min-h-touch flex items-center"
          onClick={clearCart}
          data-testid="cart-clear-button"
        >
          전체 삭제
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <CartItemRow key={item.menuId} item={item} />
        ))}
      </div>

      <CartSummary />

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <Button
          size="lg"
          className="w-full"
          onClick={() => navigate('/order-confirm')}
          data-testid="cart-order-button"
        >
          주문하기
        </Button>
      </div>
    </div>
  );
}
