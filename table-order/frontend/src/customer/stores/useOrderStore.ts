import { create } from 'zustand';
import { apiClient } from '@shared/api/client';
import { ENDPOINTS } from '@shared/api/endpoints';
import type { CartItem, CreateOrderResponse } from '@shared/api/types';
import { useCustomerAuthStore } from './useCustomerAuthStore';

interface OrderState {
  lastOrderNumber: string | null;
  isSubmitting: boolean;
  error: string | null;
}

interface OrderActions {
  createOrder: (items: CartItem[]) => Promise<CreateOrderResponse>;
  reset: () => void;
}

type OrderStore = OrderState & OrderActions;

export const useOrderStore = create<OrderStore>((set) => ({
  // State
  lastOrderNumber: null,
  isSubmitting: false,
  error: null,

  // Actions
  createOrder: async (items: CartItem[]) => {
    set({ isSubmitting: true, error: null });
    try {
      const authStore = useCustomerAuthStore.getState();
      const tableId = authStore.tableInfo?.tableId;
      const sessionId = authStore.getSessionId();

      const response = await apiClient.post<CreateOrderResponse>(ENDPOINTS.ORDERS, {
        table_id: tableId,
        session_id: sessionId,
        items: items.map((item) => ({
          menu_id: item.menuId,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      });

      const data = response.data;

      // Update session ID if new session was created
      if (data.session_id && data.session_id !== sessionId) {
        authStore.setSessionId(data.session_id);
      }

      set({ lastOrderNumber: data.order_number, isSubmitting: false });
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '주문에 실패했습니다. 다시 시도해주세요';
      set({ isSubmitting: false, error: message });
      throw error;
    }
  },

  reset: () => set({ lastOrderNumber: null, error: null }),
}));
