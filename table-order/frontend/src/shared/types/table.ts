export type SessionStatus = 'ACTIVE' | 'CLOSED';

export interface TableSession {
  id: string;
  tableId: string;
  status: SessionStatus;
  startedAt: string;
  closedAt?: string;
}

export interface DashboardOrder {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: {
    id: number;
    menu_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}

export interface Table {
  table_id: number;
  table_number: number;
  has_active_session: boolean;
  total_order_amount: number;
  order_count: number;
  recent_orders: DashboardOrder[];
}

export interface DashboardData {
  tables: Table[];
}

export interface TableSetupRequest {
  tableNumber: number;
  password: string;
}
