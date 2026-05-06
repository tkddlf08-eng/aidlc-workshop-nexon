import { http, HttpResponse } from 'msw';
import { mockCategories, mockMenus, mockOrders } from './data';
import { CONFIG } from '@shared/constants/config';

const BASE = CONFIG.API_BASE_URL;
let orderCounter = 3;

export const handlers = [
  // Auth - Table Login
  http.post(`${BASE}/api/auth/table/login`, async () => {
    return HttpResponse.json({
      access_token: 'mock-token-12345',
      table_id: 'table-1',
      table_number: '1',
      store_id: 'store-1',
      session_id: 'session-1',
    });
  }),

  // Auth - Me
  http.get(`${BASE}/api/auth/me`, () => {
    return HttpResponse.json({
      table_id: 'table-1',
      table_number: '1',
      store_id: 'store-1',
    });
  }),

  // Categories
  http.get(`${BASE}/api/categories`, () => {
    return HttpResponse.json(mockCategories);
  }),

  // Menus
  http.get(`${BASE}/api/menus`, ({ request }) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('category_id');
    const filtered = categoryId
      ? mockMenus.filter((m) => m.category_id === Number(categoryId))
      : mockMenus;
    return HttpResponse.json(filtered);
  }),

  // Create Order
  http.post(`${BASE}/api/orders`, async () => {
    orderCounter++;
    return HttpResponse.json(
      {
        id: `order-${orderCounter}`,
        order_number: String(orderCounter).padStart(3, '0'),
        session_id: 'session-1',
        total_amount: 0,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Get Orders (session)
  http.get(`${BASE}/api/orders`, () => {
    return HttpResponse.json({
      items: mockOrders,
      total: mockOrders.length,
      page: 1,
      limit: 10,
      has_next: false,
    });
  }),
];
