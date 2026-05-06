import type { Order } from '@shared/api/types';

export const mockAdminInfo = {
  id: 'admin-1',
  storeId: 'store-1',
  username: 'admin',
};

export const mockTables = [
  {
    id: 'table-1',
    tableNumber: 1,
    storeId: 'store-1',
    currentSession: { id: 'session-1', tableId: 'table-1', status: 'ACTIVE', startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    orders: [
      {
        id: 'order-1',
        orderNumber: '001',
        tableId: 'table-1',
        sessionId: 'session-1',
        status: 'COMPLETED' as const,
        items: [
          { id: 'oi-1', menuId: 'menu-1', menuName: '불고기 정식', quantity: 1, unitPrice: 12000, subtotal: 12000 },
          { id: 'oi-2', menuId: 'menu-2', menuName: '김치찌개', quantity: 1, unitPrice: 9000, subtotal: 9000 },
        ],
        totalAmount: 21000,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: 'order-2',
        orderNumber: '002',
        tableId: 'table-1',
        sessionId: 'session-1',
        status: 'PREPARING' as const,
        items: [
          { id: 'oi-3', menuId: 'menu-4', menuName: '계란말이', quantity: 1, unitPrice: 5000, subtotal: 5000 },
        ],
        totalAmount: 5000,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      },
    ],
    totalOrderAmount: 26000,
  },
  {
    id: 'table-2',
    tableNumber: 2,
    storeId: 'store-1',
    currentSession: { id: 'session-2', tableId: 'table-2', status: 'ACTIVE', startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    orders: [
      {
        id: 'order-3',
        orderNumber: '003',
        tableId: 'table-2',
        sessionId: 'session-2',
        status: 'PENDING' as const,
        items: [
          { id: 'oi-4', menuId: 'menu-3', menuName: '된장찌개', quantity: 2, unitPrice: 8500, subtotal: 17000 },
          { id: 'oi-5', menuId: 'menu-6', menuName: '콜라', quantity: 2, unitPrice: 2000, subtotal: 4000 },
        ],
        totalAmount: 21000,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ],
    totalOrderAmount: 21000,
  },
  {
    id: 'table-3',
    tableNumber: 3,
    storeId: 'store-1',
    currentSession: undefined,
    orders: [],
    totalOrderAmount: 0,
  },
  {
    id: 'table-4',
    tableNumber: 4,
    storeId: 'store-1',
    currentSession: undefined,
    orders: [],
    totalOrderAmount: 0,
  },
];

export const mockAdminCategories = [
  { id: 'cat-1', name: '메인 메뉴', sortOrder: 1, menuCount: 3 },
  { id: 'cat-2', name: '사이드', sortOrder: 2, menuCount: 2 },
  { id: 'cat-3', name: '음료', sortOrder: 3, menuCount: 2 },
];

export const mockAdminMenus = [
  { id: 'menu-1', name: '불고기 정식', price: 12000, description: '부드러운 불고기와 밥, 반찬 세트', categoryId: 'cat-1', categoryName: '메인 메뉴', imageUrl: undefined, sortOrder: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'menu-2', name: '김치찌개', price: 9000, description: '얼큰한 김치찌개와 밥', categoryId: 'cat-1', categoryName: '메인 메뉴', imageUrl: undefined, sortOrder: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'menu-3', name: '된장찌개', price: 8500, description: '구수한 된장찌개와 밥', categoryId: 'cat-1', categoryName: '메인 메뉴', imageUrl: undefined, sortOrder: 3, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'menu-4', name: '계란말이', price: 5000, description: '부드러운 계란말이', categoryId: 'cat-2', categoryName: '사이드', imageUrl: undefined, sortOrder: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'menu-5', name: '김치전', price: 6000, description: '바삭한 김치전', categoryId: 'cat-2', categoryName: '사이드', imageUrl: undefined, sortOrder: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'menu-6', name: '콜라', price: 2000, description: '시원한 콜라', categoryId: 'cat-3', categoryName: '음료', imageUrl: undefined, sortOrder: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'menu-7', name: '사이다', price: 2000, description: '시원한 사이다', categoryId: 'cat-3', categoryName: '음료', imageUrl: undefined, sortOrder: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
];

export const mockArchivedOrders: (Order & { archivedAt: string })[] = [
  {
    id: 'archived-1',
    order_number: '098',
    table_id: 'table-1',
    session_id: 'session-old-1',
    status: 'COMPLETED',
    total_amount: 30000,
    items: [
      { id: 'aoi-1', menu_id: 'menu-1', menu_name: '불고기 정식', quantity: 2, unit_price: 12000 },
      { id: 'aoi-2', menu_id: 'menu-5', menu_name: '김치전', quantity: 1, unit_price: 6000 },
    ],
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    archivedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];
