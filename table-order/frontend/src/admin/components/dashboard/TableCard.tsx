import { memo } from 'react';
import OrderItem from './OrderItem';
import Button from '@/shared/components/Button';
import { useOrderStore } from '@/admin/stores/useOrderStore';
import { useTableStore } from '@/admin/stores/useTableStore';
import { useUIStore } from '@/admin/stores/useUIStore';
import { formatPrice } from '@/shared/utils/format';
import type { Table } from '@/shared/types/table';

interface TableCardProps {
  table: Table;
}

const TableCard = memo(function TableCard({ table }: TableCardProps) {
  const highlightedOrderIds = useOrderStore((state) => state.highlightedOrderIds);
  const completeTable = useTableStore((state) => state.completeTable);
  const { showToast, showConfirm } = useUIStore();

  const handleComplete = () => {
    showConfirm({
      title: '테이블 이용 완료',
      message: `테이블 ${table.table_number} 이용을 완료하시겠습니까? 주문 내역이 과거 이력으로 이동됩니다.`,
      variant: 'warning',
      confirmText: '이용 완료',
      onConfirm: async () => {
        try {
          await completeTable(String(table.table_id));
          showToast('success', `테이블 ${table.table_number} 이용 완료 처리되었습니다`);
        } catch {
          showToast('error', '이용 완료 처리에 실패했습니다');
        }
      },
    });
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      data-testid={`table-card-${table.table_number}`}
    >
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-gray-900">
            테이블 {table.table_number}
          </span>
          <p className="text-xs text-gray-500 mt-0.5">
            총 {formatPrice(table.total_order_amount)} ({table.order_count}건)
          </p>
        </div>
        {table.has_active_session && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
            이용중
          </span>
        )}
      </div>

      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
        {table.recent_orders.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">주문 없음</p>
        ) : (
          table.recent_orders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              tableId={String(table.table_id)}
              isHighlighted={highlightedOrderIds.has(String(order.id))}
            />
          ))
        )}
      </div>

      {table.has_active_session && table.recent_orders.length > 0 && (
        <div className="p-3 border-t">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={handleComplete}
            data-testid={`table-${table.table_number}-complete-button`}
          >
            이용 완료
          </Button>
        </div>
      )}
    </div>
  );
});

export default TableCard;
