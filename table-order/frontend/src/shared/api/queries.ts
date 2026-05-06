import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import type { Category, Menu, Order, PaginatedResponse } from './types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<Category[]>(ENDPOINTS.CATEGORIES);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMenus(categoryId?: string) {
  return useQuery({
    queryKey: ['menus', categoryId],
    queryFn: async () => {
      const params = categoryId ? { category_id: categoryId } : {};
      const response = await apiClient.get<Menu[]>(ENDPOINTS.MENUS, { params });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSessionOrders(sessionId: string | null, page = 1, limit = 10) {
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
