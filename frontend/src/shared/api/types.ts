// Auth
export interface TableCredentials {
  storeId: string;
  tableNumber: string;
  password: string;
}

export interface TableAuthInfo {
  token: string;
  tableId: string;
  tableNumber: string;
  storeId: string;
  sessionId: string | null;
}

export interface LoginResponse {
  access_token: string;
  table_id: string;
  table_number: string;
  store_id: string;
  session_id: string | null;
}

// Menu
export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface Menu {
  id: string;
  category_id: string;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  sort_order: number;
  is_available: boolean;
}

// Cart
export interface CartItem {
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

// Order
export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

export interface OrderItem {
  id: string;
  menu_id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  table_id: string;
  session_id: string;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
}

export interface CreateOrderRequest {
  table_id: string;
  session_id: string | null;
  items: {
    menu_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface CreateOrderResponse {
  id: string;
  order_number: string;
  session_id: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

// Error
export interface ApiError {
  detail: string;
  status: number;
}
