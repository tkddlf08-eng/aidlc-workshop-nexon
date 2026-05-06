import { create } from 'zustand';
import apiClient from '@/shared/api/client';

interface TableState {
  isLoading: boolean;

  completeTable: (tableId: string) => Promise<void>;
}

export const useTableStore = create<TableState>(() => ({
  isLoading: false,

  completeTable: async (tableId: string) => {
    await apiClient.post(`/api/tables/${tableId}/complete`);
  },
}));
