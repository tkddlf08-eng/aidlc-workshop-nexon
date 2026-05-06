import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import type { LoginResponse, CreateOrderRequest, CreateOrderResponse } from './types';

export function useTableLogin() {
  return useMutation({
    mutationFn: async (data: { store_code: string; table_number: number; password: string }) => {
      const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.TABLE_LOGIN, data);
      return response.data;
    },
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const response = await apiClient.post<CreateOrderResponse>(ENDPOINTS.ORDERS, data);
      return response.data;
    },
  });
}
