export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

export interface OrderItem {
  id: string;
  menuId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  sessionId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends Order {
  tableNumber: number;
}

export interface ArchivedOrder extends Order {
  archivedAt: string;
}

export type SSEEventType = 'new_order' | 'order_status_changed' | 'order_deleted' | 'table_reset';

export interface NewOrderEvent {
  order: Order;
  tableId: string;
}

export interface OrderStatusEvent {
  orderId: string;
  tableId: string;
  newStatus: OrderStatus;
}

export interface OrderDeletedEvent {
  orderId: string;
  tableId: string;
  newTotalAmount: number;
}

export interface TableResetEvent {
  tableId: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderHistoryParams {
  tableId: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
