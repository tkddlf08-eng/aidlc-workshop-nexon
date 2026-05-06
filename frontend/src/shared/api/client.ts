import axios from 'axios';
import { CONFIG } from '@shared/constants/config';

export const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('table-order-auth');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

// Response interceptor: handle 401 with retry limit
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try re-login with stored credentials
      const stored = localStorage.getItem('table-order-auth');
      if (stored) {
        try {
          const { state } = JSON.parse(stored);
          if (state?.credentials) {
            const response = await axios.post(
              `${CONFIG.API_BASE_URL}/api/auth/table/login`,
              {
                store_id: state.credentials.storeId,
                table_number: state.credentials.tableNumber,
                password: state.credentials.password,
              }
            );
            const newToken = response.data.access_token;
            // Update stored token
            const parsed = JSON.parse(stored);
            parsed.state.token = newToken;
            localStorage.setItem('table-order-auth', JSON.stringify(parsed));
            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          // Re-login failed
        }
      }
      // Redirect to setup
      window.location.href = '/setup';
    }

    return Promise.reject(error);
  }
);
