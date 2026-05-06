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
  items: OrderItem[];
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {
  table_number?: number;
}

export interface ArchivedOrder extends Order {
  archived_at: string;
}

export type SSEEventType = 'new_order' | 'order_status_changed' | 'order_deleted' | 'table_reset';

export interface NewOrderEvent {
  order: Order;
  table_id: number;
}

export interface OrderStatusEvent {
  order_id: number;
  table_id: number;
  new_status: OrderStatus;
}

export interface OrderDeletedEvent {
  order_id: number;
  table_id: number;
}

export interface TableResetEvent {
  table_id: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderHistoryParams {
  table_id: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
