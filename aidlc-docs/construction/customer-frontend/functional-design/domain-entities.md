# Domain Entities - Customer Frontend

## TypeScript 타입 정의

### 인증 관련

```typescript
interface TableCredentials {
  storeId: string;
  tableNumber: string;
  password: string;
}

interface TableAuthInfo {
  token: string;
  tableId: string;
  tableNumber: string;
  storeId: string;
  sessionId: string | null;
}
```

### 메뉴 관련

```typescript
interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

interface Menu {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
  isAvailable: boolean;
}
```

### 장바구니 관련

```typescript
interface CartItem {
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface CartState {
  items: CartItem[];
}

// Computed values (not stored)
// totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
// totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
```

### 주문 관련

```typescript
type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

interface OrderItem {
  id: string;
  menuId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  sessionId: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string; // ISO 8601
}

interface CreateOrderRequest {
  tableId: string;
  sessionId: string | null;
  items: {
    menuId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  sessionId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}
```

### 페이지네이션

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
```

### API 에러

```typescript
interface ApiError {
  detail: string;
  status: number;
}
```

---

## 상태 관리 (Zustand Stores)

### useCustomerAuthStore

```typescript
interface CustomerAuthStore {
  // State
  token: string | null;
  tableInfo: TableAuthInfo | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: TableCredentials) => Promise<void>;
  autoLogin: () => Promise<boolean>;
  getSessionId: () => string | null;
  isAuthenticated: () => boolean;
  clearAuth: () => void;
}
```

### useCartStore

```typescript
interface CartStore {
  // State
  items: CartItem[];

  // Actions
  addItem: (menu: Menu) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getItemCount: (menuId: string) => number;
}
```

### useOrderStore

```typescript
interface OrderStore {
  // State
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasNext: boolean;

  // Actions
  createOrder: (items: CartItem[]) => Promise<CreateOrderResponse>;
  fetchOrders: (page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}
```
