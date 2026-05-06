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
  token_type: string;
  table_id: number;
  store_id: number;
  table_number: number;
}

// Menu
export interface Category {
  id: number;
  store_id: number;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Menu {
  id: number;
  category_id: number;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_sold_out: boolean;
  created_at: string;
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
  id: number;
  menu_id: number | null;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  table_id: number;
  session_id: number;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  items: {
    menu_id: number;
    quantity: number;
  }[];
}

export interface CreateOrderResponse {
  id: number;
  order_number: string;
  table_id: number;
  session_id: number;
  total_amount: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
