import { useEffect } from 'react';
import Header from '@/admin/components/layout/Header';
import TableGrid from '@/admin/components/dashboard/TableGrid';
import OrderDrawer from '@/admin/components/dashboard/OrderDrawer';
import SSEStatusIndicator from '@/admin/components/dashboard/SSEStatusIndicator';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { useOrderStore } from '@/admin/stores/useOrderStore';

export default function DashboardPage() {
  const { tables, isLoading, sseStatus, loadDashboard, subscribeToOrders, unsubscribeFromOrders } =
    useOrderStore();

  useEffect(() => {
    loadDashboard();
    subscribeToOrders();
    return () => {
      unsubscribeFromOrders();
    };
  }, [loadDashboard, subscribeToOrders, unsubscribeFromOrders]);

  if (isLoading && tables.length === 0) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-6 h-14 border-b bg-white">
        <Header title="주문 대시보드" />
        <SSEStatusIndicator status={sseStatus} />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <TableGrid />
      </div>
      <OrderDrawer />
    </div>
  );
}
