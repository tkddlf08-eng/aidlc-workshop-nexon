import type { Order } from './order';

export type SessionStatus = 'ACTIVE' | 'CLOSED';

export interface TableSession {
  id: string;
  tableId: string;
  status: SessionStatus;
  startedAt: string;
  closedAt?: string;
}

export interface Table {
  id: string;
  tableNumber: number;
  storeId: string;
  currentSession?: TableSession;
  orders: Order[];
  totalOrderAmount: number;
}

export interface DashboardData {
  tables: Table[];
  totalActiveOrders: number;
  totalRevenue: number;
}

export interface TableSetupRequest {
  tableNumber: number;
  password: string;
}
