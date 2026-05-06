import { http, HttpResponse } from 'msw';
import { mockAdminInfo, mockTables, mockAdminCategories, mockAdminMenus, mockArchivedOrders } from './admin-data';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface MockOrder {
  id: string;
  orderNumber: string;
  tableId: string;
  sessionId: string;
  status: string;
  items: { id: string; menuId: string; menuName: string; quantity: number; unitPrice: number; subtotal: number }[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

function getAllOrders(): MockOrder[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mockTables.flatMap((t) => t.orders as any) as MockOrder[];
}

export const adminHandlers = [
  // Admin Login
  http.post(`${BASE}/api/auth/admin/login`, async ({ request }) => {
    const body = await request.json() as { storeId: string; username: string; password: string };

    // Mock credentials: any storeId + username "admin" + password "admin123"
    if (body.username === 'admin' && body.password === 'admin123') {
      return HttpResponse.json({
        token: 'mock-admin-token-12345',
        expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
        admin: mockAdminInfo,
      });
    }

    return HttpResponse.json(
      { message: '사용자명 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }),

  // Admin Auth Me
  http.get(`${BASE}/api/auth/me`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (auth?.includes('mock-admin-token')) {
      return HttpResponse.json(mockAdminInfo);
    }
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),

  // Admin Logout
  http.post(`${BASE}/api/auth/admin/logout`, () => {
    return HttpResponse.json({ message: 'success' });
  }),

  // Dashboard
  http.get(`${BASE}/api/tables/dashboard`, () => {
    return HttpResponse.json({ tables: mockTables });
  }),

  // Order Detail
  http.get(`${BASE}/api/orders/:id`, ({ params }) => {
    const allOrders = getAllOrders();
    const order = allOrders.find((o) => o.id === params.id);
    if (!order) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const table = mockTables.find((t) => t.id === order.tableId);
    return HttpResponse.json({ ...order, tableNumber: table?.tableNumber });
  }),

  // Update Order Status
  http.patch(`${BASE}/api/orders/:id/status`, async ({ params, request }) => {
    const body = await request.json() as { status: string };
    const allOrders = getAllOrders();
    const order = allOrders.find((o) => o.id === params.id);
    if (!order) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json({ ...order, status: body.status });
  }),

  // Delete Order
  http.delete(`${BASE}/api/orders/:id`, ({ params }) => {
    const allOrders = getAllOrders();
    const order = allOrders.find((o) => o.id === params.id);
    if (!order) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json({ message: 'success' });
  }),

  // Complete Table
  http.post(`${BASE}/api/tables/:id/complete`, () => {
    return HttpResponse.json({ message: 'success' });
  }),

  // Order History
  http.get(`${BASE}/api/orders/history`, () => {
    return HttpResponse.json(mockArchivedOrders);
  }),

  // Categories (Admin format - camelCase)
  http.get(`${BASE}/api/categories`, () => {
    return HttpResponse.json(mockAdminCategories);
  }),

  // Create Category
  http.post(`${BASE}/api/categories`, async ({ request }) => {
    const body = await request.json() as { name: string };
    const newCat = {
      id: `cat-${Date.now()}`,
      name: body.name,
      sortOrder: mockAdminCategories.length + 1,
      menuCount: 0,
    };
    mockAdminCategories.push(newCat);
    return HttpResponse.json(newCat, { status: 201 });
  }),

  // Update Category
  http.put(`${BASE}/api/categories/:id`, async ({ params, request }) => {
    const body = await request.json() as { name?: string; sortOrder?: number };
    const cat = mockAdminCategories.find((c) => c.id === params.id);
    if (!cat) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    if (body.name) cat.name = body.name;
    if (body.sortOrder !== undefined) cat.sortOrder = body.sortOrder;
    return HttpResponse.json(cat);
  }),

  // Delete Category
  http.delete(`${BASE}/api/categories/:id`, ({ params }) => {
    const cat = mockAdminCategories.find((c) => c.id === params.id);
    if (!cat) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    if (cat.menuCount > 0) {
      return HttpResponse.json({ message: '메뉴가 있는 카테고리는 삭제할 수 없습니다' }, { status: 400 });
    }
    return HttpResponse.json({ message: 'success' });
  }),

  // Menus (Admin format)
  http.get(`${BASE}/api/menus`, ({ request }) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('category_id');
    const filtered = categoryId
      ? mockAdminMenus.filter((m) => m.categoryId === categoryId)
      : mockAdminMenus;
    return HttpResponse.json(filtered);
  }),

  // Create Menu
  http.post(`${BASE}/api/menus`, async () => {
    const newMenu = {
      id: `menu-${Date.now()}`,
      name: 'New Menu',
      price: 10000,
      description: '',
      categoryId: 'cat-1',
      categoryName: '메인 메뉴',
      imageUrl: undefined,
      sortOrder: mockAdminMenus.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newMenu, { status: 201 });
  }),

  // Update Menu
  http.put(`${BASE}/api/menus/:id`, async ({ params }) => {
    const menu = mockAdminMenus.find((m) => m.id === params.id);
    if (!menu) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ ...menu, updatedAt: new Date().toISOString() });
  }),

  // Delete Menu
  http.delete(`${BASE}/api/menus/:id`, ({ params }) => {
    const menu = mockAdminMenus.find((m) => m.id === params.id);
    if (!menu) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ message: 'success' });
  }),

  // Menu Sort
  http.patch(`${BASE}/api/menus/:id/sort`, async ({ params }) => {
    const menu = mockAdminMenus.find((m) => m.id === params.id);
    if (!menu) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(menu);
  }),
];
