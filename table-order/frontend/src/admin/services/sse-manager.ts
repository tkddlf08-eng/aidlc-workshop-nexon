import { tokenStorage } from '@/shared/utils/token-storage';

type SSEEventType = 'new_order' | 'order_status_changed' | 'order_deleted' | 'table_reset';
type SSEStatus = 'connected' | 'reconnecting' | 'disconnected';
type SSEEventHandler = (type: SSEEventType, data: unknown) => void;
type SSEStatusHandler = (status: SSEStatus) => void;

export class SSEManager {
  private eventSource: EventSource | null = null;
  private retryCount = 0;
  private maxRetryDelay = 30000;
  private baseDelay = 1000;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private onEvent: SSEEventHandler;
  private onStatusChange: SSEStatusHandler;

  constructor(onEvent: SSEEventHandler, onStatusChange: SSEStatusHandler) {
    this.onEvent = onEvent;
    this.onStatusChange = onStatusChange;
  }

  connect(): void {
    const token = tokenStorage.get();
    if (!token) return;

    const sseUrl = import.meta.env.VITE_SSE_URL || '/api/orders/stream';
    const url = `${sseUrl}?token=${encodeURIComponent(token)}`;

    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.retryCount = 0;
      this.onStatusChange('connected');
    };

    this.eventSource.addEventListener('new_order', (event) => {
      const data = JSON.parse(event.data);
      this.onEvent('new_order', data);
    });

    this.eventSource.addEventListener('order_status_changed', (event) => {
      const data = JSON.parse(event.data);
      this.onEvent('order_status_changed', data);
    });

    this.eventSource.addEventListener('order_deleted', (event) => {
      const data = JSON.parse(event.data);
      this.onEvent('order_deleted', data);
    });

    this.eventSource.addEventListener('table_reset', (event) => {
      const data = JSON.parse(event.data);
      this.onEvent('table_reset', data);
    });

    this.eventSource.onerror = () => {
      this.eventSource?.close();
      this.eventSource = null;
      this.onStatusChange('reconnecting');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    const delay = this.getRetryDelay();
    this.retryCount++;

    if (delay >= this.maxRetryDelay) {
      this.onStatusChange('disconnected');
    }

    this.retryTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private getRetryDelay(): number {
    const delay = Math.min(this.baseDelay * Math.pow(2, this.retryCount), this.maxRetryDelay);
    const jitter = delay * 0.25 * Math.random();
    return delay + jitter;
  }

  disconnect(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.retryCount = 0;
  }
}
