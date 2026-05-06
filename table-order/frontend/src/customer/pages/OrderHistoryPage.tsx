import { useState } from 'react';
import { useSessionOrders } from '@shared/api/queries';
import { useCustomerAuthStore } from '@customer/stores/useCustomerAuthStore';
import { OrderCard } from '@customer/components/OrderCard';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import { EmptyState } from '@shared/components/EmptyState';
import { Button } from '@shared/components/Button';

export default function OrderHistoryPage() {
  const sessionId = useCustomerAuthStore((state) => state.tableInfo?.sessionId || null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSessionOrders(sessionId, page);

  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="pt-8">
        <EmptyState message="아직 주문이 없습니다" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-4 pb-24 px-4" data-testid="order-history-page">
      <h1 className="text-xl font-bold">주문 내역</h1>

      {data.items.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}

      {data.has_next && (
        <Button
          variant="secondary"
          onClick={() => setPage((p) => p + 1)}
          className="w-full"
          data-testid="order-load-more"
        >
          더 보기
        </Button>
      )}
    </div>
  );
}
