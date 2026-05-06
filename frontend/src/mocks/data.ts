import type { Category, Menu, Order } from '@shared/api/types';

export const mockCategories: Category[] = [
  { id: 'cat-1', name: '메인 메뉴', sort_order: 1 },
  { id: 'cat-2', name: '사이드', sort_order: 2 },
  { id: 'cat-3', name: '음료', sort_order: 3 },
];

export const mockMenus: Menu[] = [
  { id: 'menu-1', category_id: 'cat-1', name: '불고기 정식', price: 12000, description: '부드러운 불고기와 밥, 반찬 세트', image_url: null, sort_order: 1, is_available: true },
  { id: 'menu-2', category_id: 'cat-1', name: '김치찌개', price: 9000, description: '얼큰한 김치찌개와 밥', image_url: null, sort_order: 2, is_available: true },
  { id: 'menu-3', category_id: 'cat-1', name: '된장찌개', price: 8500, description: '구수한 된장찌개와 밥', image_url: null, sort_order: 3, is_available: true },
  { id: 'menu-4', category_id: 'cat-2', name: '계란말이', price: 5000, description: '부드러운 계란말이', image_url: null, sort_order: 1, is_available: true },
  { id: 'menu-5', category_id: 'cat-2', name: '김치전', price: 6000, description: '바삭한 김치전', image_url: null, sort_order: 2, is_available: true },
  { id: 'menu-6', category_id: 'cat-3', name: '콜라', price: 2000, description: '시원한 콜라', image_url: null, sort_order: 1, is_available: true },
  { id: 'menu-7', category_id: 'cat-3', name: '사이다', price: 2000, description: '시원한 사이다', image_url: null, sort_order: 2, is_available: true },
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    order_number: '001',
    table_id: 'table-1',
    session_id: 'session-1',
    status: 'COMPLETED',
    total_amount: 21000,
    items: [
      { id: 'oi-1', menu_id: 'menu-1', menu_name: '불고기 정식', quantity: 1, unit_price: 12000 },
      { id: 'oi-2', menu_id: 'menu-2', menu_name: '김치찌개', quantity: 1, unit_price: 9000 },
    ],
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-2',
    order_number: '002',
    table_id: 'table-1',
    session_id: 'session-1',
    status: 'PREPARING',
    total_amount: 5000,
    items: [
      { id: 'oi-3', menu_id: 'menu-4', menu_name: '계란말이', quantity: 1, unit_price: 5000 },
    ],
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];
