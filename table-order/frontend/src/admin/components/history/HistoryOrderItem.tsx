import { formatPrice, formatDateTime } from '@/shared/utils/format';
import type { ArchivedOrder } from '@/shared/types/order';

interface HistoryOrderItemProps {
  order: ArchivedOrder;
}

export default function HistoryOrderItem({ order }: HistoryOrderItemProps) {
  return (
    <div
      className="bg-white border rounded-lg p-4"
      data-testid={`history-order-${order.id}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">#{order.order_number}</span>
        <span className="text-xs text-gray-500">{formatDateTime(order.created_at)}</span>
      </div>

      <div className="space-y-1 mb-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-gray-600">
            <span>{item.menu_name} × {item.quantity}</span>
            <span>{formatPrice(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-sm font-semibold text-gray-900">
          합계: {formatPrice(order.total_amount)}
        </span>
        <span className="text-xs text-gray-400">
          이용 완료: {formatDateTime(order.archived_at)}
        </span>
      </div>
    </div>
  );
}
