# Admin Frontend - 도메인 엔티티

## 1. TypeScript 인터페이스 정의

### 1.1 인증 관련

```typescript
// 관리자 정보
interface AdminInfo {
  id: string;
  storeId: string;
  username: string;
}

// 로그인 요청
interface LoginRequest {
  storeId: string;
  username: string;
  password: string;
}

// 로그인 응답
interface LoginResponse {
  token: string;
  expiresAt: string; // ISO 8601
  admin: AdminInfo;
}
```

### 1.2 주문 관련

```typescript
// 주문 상태
type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

// 주문 항목
interface OrderItem {
  id: string;
  menuId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// 주문
interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  sessionId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

// 주문 상세 (상세 보기용)
interface OrderDetail extends Order {
  tableNumber: number;
}

// 과거 주문 (아카이브된)
interface ArchivedOrder extends Order {
  archivedAt: string; // ISO 8601
}
```

### 1.3 테이블 관련

```typescript
// 테이블 세션 상태
type SessionStatus = 'ACTIVE' | 'CLOSED';

// 테이블 세션
interface TableSession {
  id: string;
  tableId: string;
  status: SessionStatus;
  startedAt: string;
  closedAt?: string;
}

// 테이블
interface Table {
  id: string;
  tableNumber: number;
  storeId: string;
  currentSession?: TableSession;
  orders: Order[];
  totalOrderAmount: number;
}

// 대시보드 데이터
interface DashboardData {
  tables: Table[];
  totalActiveOrders: number;
  totalRevenue: number;
}

// 테이블 설정 요청
interface TableSetupRequest {
  tableNumber: number;
  password: string;
}
```

### 1.4 메뉴 관련

```typescript
// 카테고리
interface Category {
  id: string;
  name: string;
  sortOrder: number;
  menuCount: number;
}

// 메뉴
interface Menu {
  id: string;
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  categoryName: string;
  imageUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 메뉴 생성/수정 요청
interface MenuFormData {
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  image?: File;
}

// 카테고리 생성/수정 요청
interface CategoryFormData {
  name: string;
  sortOrder?: number;
}
```

### 1.5 SSE 이벤트 타입

```typescript
// SSE 이벤트 종류
type SSEEventType = 'new_order' | 'order_status_changed' | 'order_deleted' | 'table_reset';

// SSE 이벤트 페이로드
interface SSEEvent {
  type: SSEEventType;
  data: NewOrderEvent | OrderStatusEvent | OrderDeletedEvent | TableResetEvent;
}

interface NewOrderEvent {
  order: Order;
  tableId: string;
}

interface OrderStatusEvent {
  orderId: string;
  tableId: string;
  newStatus: OrderStatus;
}

interface OrderDeletedEvent {
  orderId: string;
  tableId: string;
  newTotalAmount: number;
}

interface TableResetEvent {
  tableId: string;
}
```

---

## 2. Zustand Store 구조

### 2.1 useAdminAuthStore

```typescript
interface AdminAuthState {
  // State
  token: string | null;
  admin: AdminInfo | null;
  isLoading: boolean;
  error: string | null;
  expiresAt: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  isAuthenticated: () => boolean;
  getTimeUntilExpiry: () => number;
}
```

### 2.2 useOrderStore

```typescript
interface OrderState {
  // State
  orders: Record<string, Order[]>; // tableId → orders
  selectedOrder: OrderDetail | null;
  isDrawerOpen: boolean;
  isLoading: boolean;
  sseConnected: boolean;
  highlightedOrderIds: Set<string>; // 신규 주문 강조용

  // Actions
  loadDashboard: () => Promise<void>;
  subscribeToOrders: () => void;
  unsubscribeFromOrders: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  selectOrder: (orderId: string) => Promise<void>;
  closeDrawer: () => void;
  handleSSEEvent: (event: SSEEvent) => void;
}
```

### 2.3 useTableStore

```typescript
interface TableState {
  // State
  tables: Table[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTables: () => Promise<void>;
  completeTable: (tableId: string) => Promise<void>;
  getTableById: (tableId: string) => Table | undefined;
}
```

### 2.4 useMenuStore

```typescript
interface MenuState {
  // State
  categories: Category[];
  menus: Menu[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCategories: () => Promise<void>;
  loadMenus: (categoryId?: string) => Promise<void>;
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (id: string, data: CategoryFormData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createMenu: (data: MenuFormData) => Promise<void>;
  updateMenu: (id: string, data: MenuFormData) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;
  reorderCategory: (id: string, newOrder: number) => Promise<void>;
  reorderMenu: (id: string, newOrder: number) => Promise<void>;
  selectCategory: (categoryId: string) => void;
}
```

### 2.5 useUIStore (공통 UI 상태)

```typescript
interface UIState {
  // State
  toasts: Toast[];
  confirmDialog: ConfirmDialogConfig | null;

  // Actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showConfirm: (config: ConfirmDialogConfig) => void;
  closeConfirm: () => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // ms, default 3000
}

interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'default';
}
```

---

## 3. API 요청/응답 타입

### 3.1 공통 응답 래퍼

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

interface ApiError {
  statusCode: number;
  message: string;
  detail?: string;
}
```

### 3.2 주문 관련 API 타입

```typescript
// 주문 상태 변경
interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// 과거 주문 조회 파라미터
interface OrderHistoryParams {
  tableId: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  page?: number;
  limit?: number;
}
```

### 3.3 메뉴 관련 API 타입

```typescript
// 메뉴 순서 변경
interface UpdateSortOrderRequest {
  sortOrder: number;
}

// 이미지 업로드 응답
interface ImageUploadResponse {
  imageUrl: string;
}
```
