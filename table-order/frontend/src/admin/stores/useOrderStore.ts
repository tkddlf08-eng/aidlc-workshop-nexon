import { create } from 'zustand';
import apiClient from '@/shared/api/client';
import { SSEManager } from '@/admin/services/sse-manager';
import type { Table, DashboardData } from '@/shared/types/table';

type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';
type SSEConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
type SSEEventType = 'new_order' | 'order_status_changed' | 'order_deleted' | 'table_reset';

interface OrderState {
  tables: Table[];
  selectedOrder: unknown | null;
  isDrawerOpen: boolean;
  isLoading: boolean;
  sseStatus: SSEConnectionStatus;
  highlightedOrderIds: Set<string>;
  sseManager: SSEManager | null;

  loadDashboard: () => Promise<void>;
  subscribeToOrders: () => void;
  unsubscribeFromOrders: () => void;
  updateOrderStatus: (orderId: string, tableId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string, tableId: string) => Promise<void>;
  selectOrder: (orderId: string) => Promise<void>;
  closeDrawer: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  tables: [],
  selectedOrder: null,
  isDrawerOpen: false,
  isLoading: false,
  sseStatus: 'disconnected',
  highlightedOrderIds: new Set(),
  sseManager: null,

  loadDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get<DashboardData>('/api/tables/dashboard');
      set({ tables: response.data.tables, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  subscribeToOrders: () => {
    const manager = new SSEManager(
      (_type: SSEEventType, _data: unknown) => {
        // Handle SSE events - reload dashboard on any event
        get().loadDashboard();
      },
      (status) => {
        set({ sseStatus: status });
      }
    );
    manager.connect();
    set({ sseManager: manager });
  },

  unsubscribeFromOrders: () => {
    const { sseManager } = get();
    sseManager?.disconnect();
    set({ sseManager: null, sseStatus: 'disconnected' });
  },

  updateOrderStatus: async (orderId, _tableId, status) => {
    try {
      await apiClient.patch(`/api/orders/${orderId}/status`, { status });
      await get().loadDashboard();
    } catch {
      throw new Error('상태 변경에 실패했습니다');
    }
  },

  deleteOrder: async (orderId, _tableId) => {
    try {
      await apiClient.delete(`/api/orders/${orderId}`);
      await get().loadDashboard();
    } catch {
      throw new Error('주문 삭제에 실패했습니다');
    }
  },

  selectOrder: async (orderId) => {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}`);
      set({ selectedOrder: response.data, isDrawerOpen: true });
    } catch {
      throw new Error('주문 상세 조회에 실패했습니다');
    }
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false, selectedOrder: null });
  },
}));
