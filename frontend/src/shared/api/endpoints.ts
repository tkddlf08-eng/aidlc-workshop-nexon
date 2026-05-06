export const ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: '/api/auth/admin/login',
    ADMIN_LOGOUT: '/api/auth/admin/logout',
    TABLE_LOGIN: '/api/auth/table/login',
    ME: '/api/auth/me',
  },
  CATEGORIES: '/api/categories',
  MENUS: '/api/menus',
  ORDERS: '/api/orders',
  TABLES: '/api/tables',
} as const;
