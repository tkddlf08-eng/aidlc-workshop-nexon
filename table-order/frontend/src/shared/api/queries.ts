import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import type { Category, Menu, Order, PaginatedResponse } from './types';

export function useCategories(storeId?: number) {
  return useQuery({
    queryKey: ['categories', storeId],
    queryFn: async () => {
      const response = await apiClient.get<Category[]>(ENDPOINTS.CATEGORIES, {
        params: { store_id: storeId },
      });
      return response.data;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMenus(categoryId?: number) {
  return useQuery({
    queryKey: ['menus', categoryId],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (categoryId) params.category_id = categoryId;
      const response = await apiClient.get<Menu[]>(ENDPOINTS.MENUS, { params });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSessionOrders(sessionId: number | null, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['orders', sessionId, page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Order>>(ENDPOINTS.ORDERS, {
        params: { session_id: sessionId, page, limit },
      });
      return response.data;
    },
    enabled: !!sessionId,
    staleTime: 0, // Always fresh
  });
}
