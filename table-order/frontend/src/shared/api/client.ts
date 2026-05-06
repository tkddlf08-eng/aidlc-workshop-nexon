import axios from 'axios';
import { tokenStorage } from '@/shared/utils/token-storage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: 토큰 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token && !tokenStorage.isExpired()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.remove();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
