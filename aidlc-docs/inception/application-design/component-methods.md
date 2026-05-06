# 컴포넌트 메서드 (Component Methods)

## Backend API Endpoints

### Auth Module

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/auth/admin/login` | 관리자 로그인 | store_id, username, password | JWT token |
| POST | `/api/auth/admin/logout` | 관리자 로그아웃 | - | success |
| POST | `/api/auth/table/login` | 테이블 태블릿 로그인 | store_id, table_number, password | table_token |
| GET | `/api/auth/me` | 현재 인증 정보 확인 | - | user_info |

### Orders Module

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/orders` | 주문 생성 | table_id, items[], session_id | order |
| GET | `/api/orders?session_id=` | 현재 세션 주문 조회 | session_id, page, limit | orders[] |
| GET | `/api/orders/{id}` | 주문 상세 조회 | order_id | order_detail |
| PATCH | `/api/orders/{id}/status` | 주문 상태 변경 | status | order |
| DELETE | `/api/orders/{id}` | 주문 삭제 | order_id | success |
| GET | `/api/orders/history` | 과거 주문 내역 | table_id, date_from, date_to | orders[] |
| GET | `/api/orders/stream` | SSE 실시간 주문 스트림 | - | SSE events |

### Menus Module

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | `/api/categories` | 카테고리 목록 조회 | - | categories[] |
| POST | `/api/categories` | 카테고리 생성 | name, sort_order | category |
| PUT | `/api/categories/{id}` | 카테고리 수정 | name, sort_order | category |
| DELETE | `/api/categories/{id}` | 카테고리 삭제 | category_id | success |
| GET | `/api/menus?category_id=` | 메뉴 목록 조회 | category_id (optional) | menus[] |
| POST | `/api/menus` | 메뉴 등록 | name, price, description, category_id, image | menu |
| PUT | `/api/menus/{id}` | 메뉴 수정 | name, price, description, category_id, image | menu |
| DELETE | `/api/menus/{id}` | 메뉴 삭제 | menu_id | success |
| PATCH | `/api/menus/{id}/sort` | 메뉴 순서 변경 | sort_order | menu |
| POST | `/api/menus/{id}/image` | 메뉴 이미지 업로드 | file | image_url |

### Tables Module

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | `/api/tables` | 테이블 목록 조회 | - | tables[] |
| GET | `/api/tables/{id}` | 테이블 상세 (현재 주문 포함) | table_id | table_detail |
| POST | `/api/tables/{id}/setup` | 테이블 초기 설정 | table_number, password | table |
| POST | `/api/tables/{id}/complete` | 테이블 이용 완료 | table_id | success |
| GET | `/api/tables/dashboard` | 대시보드 데이터 (전체 테이블 현황) | - | dashboard |

---

## Backend Service Methods

### AuthService
- `authenticate_admin(store_id, username, password) → JWT`
- `authenticate_table(store_id, table_number, password) → TableToken`
- `verify_token(token) → UserInfo`
- `check_login_attempts(identifier) → bool`

### OrderService
- `create_order(table_id, items, session_id) → Order`
- `get_session_orders(session_id, page, limit) → List[Order]`
- `get_order_detail(order_id) → OrderDetail`
- `update_order_status(order_id, new_status) → Order`
- `delete_order(order_id) → bool`
- `get_order_history(table_id, date_from, date_to) → List[Order]`
- `publish_order_event(event_type, order) → None`

### MenuService
- `get_categories() → List[Category]`
- `create_category(name, sort_order) → Category`
- `update_category(id, name, sort_order) → Category`
- `delete_category(id) → bool`
- `get_menus(category_id?) → List[Menu]`
- `create_menu(data) → Menu`
- `update_menu(id, data) → Menu`
- `delete_menu(id) → bool`
- `upload_image(file) → str (S3 URL)`

### TableService
- `get_tables() → List[Table]`
- `get_table_detail(id) → TableDetail`
- `setup_table(id, number, password) → Table`
- `complete_table_session(id) → bool`
- `get_dashboard() → DashboardData`
- `get_or_create_session(table_id) → TableSession`

---

## Frontend Key Interfaces

### Customer App - Stores (Zustand)

```typescript
// useCartStore
interface CartStore {
  items: CartItem[];
  addItem(menu: Menu): void;
  removeItem(menuId: string): void;
  updateQuantity(menuId: string, quantity: number): void;
  clearCart(): void;
  getTotalPrice(): number;
}

// useAuthStore (Customer)
interface CustomerAuthStore {
  tableToken: string | null;
  tableInfo: TableInfo | null;
  login(storeId: string, tableNumber: string, password: string): Promise<void>;
  isAuthenticated(): boolean;
}
```

### Admin App - Stores (Zustand)

```typescript
// useAdminAuthStore
interface AdminAuthStore {
  token: string | null;
  admin: AdminInfo | null;
  login(storeId: string, username: string, password: string): Promise<void>;
  logout(): void;
  isAuthenticated(): boolean;
}

// useOrderStore
interface OrderStore {
  orders: Order[];
  subscribeToOrders(): void;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  deleteOrder(orderId: string): Promise<void>;
}
```
