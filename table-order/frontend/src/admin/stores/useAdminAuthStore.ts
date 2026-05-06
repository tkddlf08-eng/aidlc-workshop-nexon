import { create } from 'zustand';
import apiClient from '@/shared/api/client';
import { tokenStorage } from '@/shared/utils/token-storage';
import type { AdminInfo, LoginRequest, LoginResponse } from '@/shared/types/auth';

interface AdminAuthState {
  token: string | null;
  admin: AdminInfo | null;
  isLoading: boolean;
  error: string | null;
  expiresAt: string | null;

  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  token: tokenStorage.get(),
  admin: null,
  isLoading: false,
  error: null,
  expiresAt: tokenStorage.getExpiresAt(),

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/admin/login', credentials);
      const { token, expiresAt, admin } = response.data;

      tokenStorage.set(token, expiresAt);
      set({ token, admin, expiresAt, isLoading: false, error: null });

      // 자동 로그아웃 타이머 설정
      const timeUntilExpiry = new Date(expiresAt).getTime() - Date.now();
      if (timeUntilExpiry > 0) {
        setTimeout(() => {
          get().logout();
        }, timeUntilExpiry);
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '로그인에 실패했습니다. 다시 시도해주세요.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  logout: () => {
    tokenStorage.remove();
    set({ token: null, admin: null, expiresAt: null, error: null });
  },

  restoreSession: async () => {
    const token = tokenStorage.get();
    if (!token || tokenStorage.isExpired()) {
      tokenStorage.remove();
      set({ token: null, admin: null });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await apiClient.get<AdminInfo>('/api/auth/me');
      set({ admin: response.data, isLoading: false });

      // 자동 로그아웃 타이머 설정
      const expiresAt = tokenStorage.getExpiresAt();
      if (expiresAt) {
        const timeUntilExpiry = new Date(expiresAt).getTime() - Date.now();
        if (timeUntilExpiry > 0) {
          setTimeout(() => {
            get().logout();
          }, timeUntilExpiry);
        }
      }
    } catch {
      tokenStorage.remove();
      set({ token: null, admin: null, isLoading: false });
    }
  },

  isAuthenticated: () => {
    const { token } = get();
    return !!token && !tokenStorage.isExpired();
  },
}));
