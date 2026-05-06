import { create } from 'zustand';
import { apiClient } from '@shared/api/client';
import { ENDPOINTS } from '@shared/api/endpoints';
import type { CartItem } from '@shared/api/types';

interface CreateOrderResponse {
  id: number;
  order_number: string;
  table_id: number;
  session_id: number;
  total_amount: number;
  status: string;
  items: unknown[];
  created_at: string;
  updated_at: string;
}

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
      // Backend only needs items - table_id and session come from JWT token
      const response = await apiClient.post<CreateOrderResponse>(ENDPOINTS.ORDERS, {
        items: items.map((item) => ({
          menu_id: Number(item.menuId),
          quantity: item.quantity,
        })),
      });

      const data = response.data;
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
