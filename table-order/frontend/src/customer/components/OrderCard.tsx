import type { Order } from '@shared/api/types';
import { StatusBadge } from './StatusBadge';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const itemsSummary = order.items
    .map((item) => `${item.menu_name} x${item.quantity}`)
    .join(', ');

  return (
    <div className="bg-white rounded-lg shadow-sm p-4" data-testid={`order-card-${order.id}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold">#{order.order_number}</span>
          <StatusBadge status={order.status} />
        </div>
        <span className="text-sm text-gray-400">{formatTime(order.created_at)}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2 line-clamp-1">{itemsSummary}</p>
      <p className="font-bold text-right">{order.total_amount.toLocaleString('ko-KR')}원</p>
    </div>
  );
}
