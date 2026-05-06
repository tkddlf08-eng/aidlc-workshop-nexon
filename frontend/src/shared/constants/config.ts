export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  IS_DEV: import.meta.env.DEV,
  ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW === 'true',
} as const;
