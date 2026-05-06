import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '@shared/api/client';
import { ENDPOINTS } from '@shared/api/endpoints';
import type { TableCredentials, TableAuthInfo, LoginResponse } from '@shared/api/types';

interface CustomerAuthState {
  token: string | null;
  tableInfo: TableAuthInfo | null;
  credentials: TableCredentials | null;
  isLoading: boolean;
  error: string | null;
}

interface CustomerAuthActions {
  login: (credentials: TableCredentials) => Promise<void>;
  autoLogin: () => Promise<boolean>;
  getSessionId: () => string | null;
  isAuthenticated: () => boolean;
  clearAuth: () => void;
  setSessionId: (sessionId: string) => void;
}

type CustomerAuthStore = CustomerAuthState & CustomerAuthActions;

export const useCustomerAuthStore = create<CustomerAuthStore>()(
  persist(
    (set, get) => ({
      // State
      token: null,
      tableInfo: null,
      credentials: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: TableCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.TABLE_LOGIN, {
            store_id: credentials.storeId,
            table_number: credentials.tableNumber,
            password: credentials.password,
          });

          const data = response.data;
          const tableInfo: TableAuthInfo = {
            token: data.access_token,
            tableId: data.table_id,
            tableNumber: data.table_number,
            storeId: data.store_id,
            sessionId: data.session_id,
          };

          set({
            token: data.access_token,
            tableInfo,
            credentials,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : '로그인에 실패했습니다';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      autoLogin: async () => {
        const { credentials } = get();
        if (!credentials) return false;

        try {
          await get().login(credentials);
          return true;
        } catch {
          return false;
        }
      },

      getSessionId: () => get().tableInfo?.sessionId || null,

      isAuthenticated: () => !!get().token,

      clearAuth: () => {
        set({
          token: null,
          tableInfo: null,
          credentials: null,
          error: null,
        });
      },

      setSessionId: (sessionId: string) => {
        const { tableInfo } = get();
        if (tableInfo) {
          set({ tableInfo: { ...tableInfo, sessionId } });
        }
      },
    }),
    {
      name: 'table-order-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        tableInfo: state.tableInfo,
        credentials: state.credentials,
      }),
    }
  )
);
