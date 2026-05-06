import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@shared/components/Button';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderNumber = (location.state as { orderNumber?: string })?.orderNumber || '';
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" data-testid="order-success-page">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">주문이 완료되었습니다</h1>
      <p className="text-gray-500 mb-2">주문번호</p>
      <p className="text-3xl font-bold text-primary-600 mb-6" data-testid="order-number">
        {orderNumber}
      </p>
      <p className="text-sm text-gray-400 mb-4">
        {countdown}초 후 메뉴 화면으로 이동합니다
      </p>
      <Button
        variant="secondary"
        onClick={() => navigate('/', { replace: true })}
        data-testid="order-success-go-menu"
      >
        바로 이동
      </Button>
    </div>
  );
}
