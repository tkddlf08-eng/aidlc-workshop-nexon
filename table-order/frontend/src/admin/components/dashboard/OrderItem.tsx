import { Trash2 } from 'lucide-react';
import { useOrderStore } from '@/admin/stores/useOrderStore';
import { useUIStore } from '@/admin/stores/useUIStore';
import { formatPrice, formatTime } from '@/shared/utils/format';
import type { DashboardOrder } from '@/shared/types/table';
import type { OrderStatus } from '@/shared/types/order';

interface OrderItemProps {
  order: DashboardOrder;
  tableId: string;
  isHighlighted: boolean;
}

const statusLabels: Record<string, string> = {
  PENDING: '대기중',
  PREPARING: '준비중',
  COMPLETED: '완료',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const nextStatus: Record<string, OrderStatus | undefined> = {
  PENDING: 'PREPARING',
  PREPARING: 'COMPLETED',
};

const nextStatusLabel: Record<string, string> = {
  PENDING: '준비 시작',
  PREPARING: '완료',
};

export default function OrderItem({ order, tableId, isHighlighted }: OrderItemProps) {
  const { selectOrder, updateOrderStatus, deleteOrder } = useOrderStore();
  const { showToast, showConfirm } = useUIStore();

  const handleStatusChange = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = nextStatus[order.status];
    if (!next) return;
    try {
      await updateOrderStatus(String(order.id), tableId, next);
      showToast('success', `주문 상태가 "${statusLabels[next]}"(으)로 변경되었습니다`);
    } catch {
      showToast('error', '상태 변경에 실패했습니다');
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: '주문 삭제',
      message: '이 주문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      variant: 'danger',
      confirmText: '삭제',
      onConfirm: async () => {
        try {
          await deleteOrder(String(order.id), tableId);
          showToast('success', '주문이 삭제되었습니다');
        } catch {
          showToast('error', '주문 삭제에 실패했습니다');
        }
      },
    });
  };

  return (
    <div
      className={`p-2.5 rounded-lg border cursor-pointer transition-all hover:border-gray-300 ${
        isHighlighted ? 'border-red-300 bg-red-50 animate-pulse' : 'border-gray-100 bg-gray-50'
      }`}
      onClick={() => selectOrder(String(order.id))}
      data-testid={`order-item-${order.id}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">
          #{order.order_number} · {formatTime(order.created_at)}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColors[order.status] || ''}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {order.items.length}개 항목 · {formatPrice(order.total_amount)}
        </span>
        <div className="flex gap-1">
          {nextStatus[order.status] && (
            <button
              onClick={handleStatusChange}
              className="text-xs px-2 py-0.5 rounded bg-primary text-white hover:bg-blue-700 transition-colors"
              data-testid={`order-${order.id}-status-button`}
            >
              {nextStatusLabel[order.status]}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-red-100 transition-colors"
            aria-label="주문 삭제"
            data-testid={`order-${order.id}-delete-button`}
          >
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
