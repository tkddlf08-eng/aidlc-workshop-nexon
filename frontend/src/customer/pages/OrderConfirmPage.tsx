import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@customer/stores/useCartStore';
import { useOrderStore } from '@customer/stores/useOrderStore';
import { Button } from '@shared/components/Button';
import toast from 'react-hot-toast';

export default function OrderConfirmPage() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const { createOrder, isSubmitting } = useOrderStore();

  const handleConfirm = async () => {
    try {
      const result = await createOrder(items);
      clearCart();
      navigate('/order-success', { state: { orderNumber: result.order_number } });
    } catch {
      toast.error('주문에 실패했습니다. 다시 시도해주세요');
    }
  };

  if (items.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  return (
    <div className="flex flex-col gap-4 pt-4 pb-24 px-4" data-testid="order-confirm-page">
      <h1 className="text-xl font-bold">주문 확인</h1>

      <div className="bg-white rounded-lg shadow-sm p-4">
        {items.map((item) => (
          <div key={item.menuId} className="flex justify-between py-2 border-b last:border-0">
            <div>
              <span className="font-medium">{item.menuName}</span>
              <span className="text-gray-500 ml-2">x{item.quantity}</span>
            </div>
            <span>{(item.price * item.quantity).toLocaleString('ko-KR')}원</span>
          </div>
        ))}
      </div>

      <div className="bg-gray-100 rounded-lg p-4 flex justify-between font-bold text-lg">
        <span>총 결제 금액</span>
        <span className="text-primary-600">{totalPrice.toLocaleString('ko-KR')}원</span>
      </div>

      <Button
        size="lg"
        className="w-full mt-4"
        onClick={handleConfirm}
        isLoading={isSubmitting}
        data-testid="order-confirm-button"
      >
        주문 확정
      </Button>
    </div>
  );
}
