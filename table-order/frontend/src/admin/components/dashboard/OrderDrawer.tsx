import { X } from 'lucide-react';
import { useOrderStore } from '@/admin/stores/useOrderStore';
import { formatPrice, formatDateTime } from '@/shared/utils/format';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

export default function OrderDrawer() {
  const { isDrawerOpen, selectedOrder, closeDrawer } = useOrderStore();

  if (!isDrawerOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={closeDrawer} />
      <div
        className="fixed right-0 top-0 h-full w-[400px] max-w-full bg-white shadow-xl z-50 flex flex-col animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-label="주문 상세"
        data-testid="order-drawer"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">주문 상세</h3>
          <button
            onClick={closeDrawer}
            className="p-1 rounded-lg hover:bg-gray-100"
            aria-label="닫기"
            data-testid="order-drawer-close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!selectedOrder ? (
            <LoadingSpinner className="h-full" />
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">주문 번호</span>
                  <span className="font-medium">#{selectedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">주문 시각</span>
                  <span>{formatDateTime(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">테이블</span>
                  <span>테이블 {selectedOrder.tableNumber}</span>
                </div>
              </div>

              <hr />

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">주문 항목</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.menuName} × {item.quantity}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr />

              <div className="flex justify-between text-base font-semibold">
                <span>총 금액</span>
                <span className="text-primary">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
