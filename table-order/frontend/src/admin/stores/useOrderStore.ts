import { create } from 'zustand';
import apiClient from '@/shared/api/client';
import { SSEManager } from '@/admin/services/sse-manager';
import type {
  OrderDetail,
  OrderStatus,
  SSEEventType,
  NewOrderEvent,
  OrderStatusEvent,
  OrderDeletedEvent,
  TableResetEvent,
} from '@/shared/types/order';
import type { Table } from '@/shared/types/table';

type SSEConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

interface OrderState {
  tables: Table[];
  selectedOrder: OrderDetail | null;
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
      const response = await apiClient.get<{ tables: Table[] }>('/tables/dashboard');
      set({ tables: response.data.tables, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  subscribeToOrders: () => {
    const manager = new SSEManager(
      (type: SSEEventType, data: unknown) => {
        const state = get();
        switch (type) {
          case 'new_order': {
            const event = data as NewOrderEvent;
            const tables = state.tables.map((table) => {
              if (table.id === event.tableId) {
                return {
                  ...table,
                  orders: [...table.orders, event.order],
                  totalOrderAmount: table.totalOrderAmount + event.order.totalAmount,
                };
              }
              return table;
            });
            const highlighted = new Set(state.highlightedOrderIds);
            highlighted.add(event.order.id);
            set({ tables, highlightedOrderIds: highlighted });
            setTimeout(() => {
              set((s) => {
                const h = new Set(s.highlightedOrderIds);
                h.delete(event.order.id);
                return { highlightedOrderIds: h };
              });
            }, 3000);
            break;
          }
          case 'order_status_changed': {
            const event = data as OrderStatusEvent;
            const tables = state.tables.map((table) => {
              if (table.id === event.tableId) {
                return {
                  ...table,
                  orders: table.orders.map((order) =>
                    order.id === event.orderId ? { ...order, status: event.newStatus } : order
                  ),
                };
              }
              return table;
            });
            set({ tables });
            break;
          }
          case 'order_deleted': {
            const event = data as OrderDeletedEvent;
            const tables = state.tables.map((table) => {
              if (table.id === event.tableId) {
                return {
                  ...table,
                  orders: table.orders.filter((order) => order.id !== event.orderId),
                  totalOrderAmount: event.newTotalAmount,
                };
              }
              return table;
            });
            set({ tables });
            break;
          }
          case 'table_reset': {
            const event = data as TableResetEvent;
            const tables = state.tables.map((table) => {
              if (table.id === event.tableId) {
                return { ...table, orders: [], totalOrderAmount: 0, currentSession: undefined };
              }
              return table;
            });
            set({ tables });
            break;
          }
        }
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

  updateOrderStatus: async (orderId, tableId, status) => {
    const previousTables = get().tables;
    // Optimistic update
    set((state) => ({
      tables: state.tables.map((table) => {
        if (table.id === tableId) {
          return {
            ...table,
            orders: table.orders.map((order) =>
              order.id === orderId ? { ...order, status } : order
            ),
          };
        }
        return table;
      }),
    }));

    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status });
    } catch {
      set({ tables: previousTables });
      throw new Error('상태 변경에 실패했습니다');
    }
  },

  deleteOrder: async (orderId, tableId) => {
    try {
      await apiClient.delete(`/orders/${orderId}`);
      set((state) => ({
        tables: state.tables.map((table) => {
          if (table.id === tableId) {
            const remainingOrders = table.orders.filter((o) => o.id !== orderId);
            const newTotal = remainingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            return { ...table, orders: remainingOrders, totalOrderAmount: newTotal };
          }
          return table;
        }),
      }));
    } catch {
      throw new Error('주문 삭제에 실패했습니다');
    }
  },

  selectOrder: async (orderId) => {
    try {
      const response = await apiClient.get<OrderDetail>(`/orders/${orderId}`);
      set({ selectedOrder: response.data, isDrawerOpen: true });
    } catch {
      throw new Error('주문 상세 조회에 실패했습니다');
    }
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false, selectedOrder: null });
  },
}));
