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
      const { access_token, admin_id, store_id, username } = response.data;

      // Backend doesn't return expiresAt, calculate from JWT_ADMIN_EXPIRE_HOURS (16h)
      const expiresAt = new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString();
      const admin: AdminInfo = { id: String(admin_id), storeId: String(store_id), username };

      tokenStorage.set(access_token, expiresAt);
      set({ token: access_token, admin, expiresAt, isLoading: false, error: null });

      // 자동 로그아웃 타이머 설정
      const timeUntilExpiry = new Date(expiresAt).getTime() - Date.now();
      if (timeUntilExpiry > 0) {
        setTimeout(() => {
          get().logout();
        }, timeUntilExpiry);
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string; detail?: string } } })?.response?.data?.message ||
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
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
      const response = await apiClient.get<{ sub: string; store_id: number; role: string }>('/api/auth/me');
      const data = response.data;
      // sub format: "admin:{id}"
      const adminId = data.sub.split(':')[1] || '0';
      const admin: AdminInfo = { id: adminId, storeId: String(data.store_id), username: '' };
      set({ admin, isLoading: false });

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
