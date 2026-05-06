import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/admin/components/layout/Header';
import DateFilter from '@/admin/components/history/DateFilter';
import HistoryOrderItem from '@/admin/components/history/HistoryOrderItem';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import EmptyState from '@/shared/components/EmptyState';
import apiClient from '@/shared/api/client';
import { formatDate } from '@/shared/utils/format';
import type { ArchivedOrder } from '@/shared/types/order';

export default function OrderHistoryPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ArchivedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(formatDate(new Date().toISOString()));
  const [dateTo, setDateTo] = useState(formatDate(new Date().toISOString()));

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<ArchivedOrder[]>('/api/orders/history', {
          params: { table_id: tableId, date_from: dateFrom, date_to: dateTo },
        });
        setOrders(response.data);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (tableId) fetchHistory();
  }, [tableId, dateFrom, dateTo]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-6 h-14 border-b bg-white">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-1.5 rounded-lg hover:bg-gray-100"
          aria-label="대시보드로 돌아가기"
          data-testid="history-back-button"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <Header title="과거 주문 내역" />
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-auto">
        <DateFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
        />

        {isLoading ? (
          <LoadingSpinner className="h-40" />
        ) : orders.length === 0 ? (
          <EmptyState title="과거 주문 내역이 없습니다" description="선택한 기간에 해당하는 주문이 없습니다" />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <HistoryOrderItem key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
