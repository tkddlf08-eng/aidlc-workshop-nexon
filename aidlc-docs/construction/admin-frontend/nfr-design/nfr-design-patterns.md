# Admin Frontend - NFR Design Patterns

## 1. 복원력 패턴 (Resilience Patterns)

### 1.1 SSE 재연결 패턴 (Exponential Backoff with Jitter)
```typescript
// SSE 연결 관리 패턴
class SSEConnectionManager {
  private retryCount = 0;
  private maxRetryDelay = 30000; // 30초
  private baseDelay = 1000; // 1초

  getRetryDelay(): number {
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.retryCount),
      this.maxRetryDelay
    );
    // Jitter 추가 (0~25% 랜덤 변동)
    const jitter = delay * 0.25 * Math.random();
    return delay + jitter;
  }

  onConnect(): void {
    this.retryCount = 0; // 성공 시 리셋
  }

  onDisconnect(): void {
    this.retryCount++;
  }
}
```

**적용 위치**: `frontend/src/admin/stores/useOrderStore.ts` (SSE 구독)

### 1.2 API 에러 복구 패턴
```typescript
// Axios Interceptor 기반 에러 복구
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
});

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 → 즉시 로그아웃
      useAdminAuthStore.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

**적용 위치**: `frontend/src/shared/api/client.ts`

### 1.3 Error Boundary 패턴
```typescript
// 페이지 단위 에러 격리
<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<PageSkeleton />}>
    <Outlet />
  </Suspense>
</ErrorBoundary>
```

**적용 위치**: `frontend/src/admin/components/AdminLayout.tsx`

---

## 2. 성능 패턴 (Performance Patterns)

### 2.1 코드 분할 (Code Splitting)
```typescript
// React.lazy + Suspense 페이지별 분할
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MenuManagementPage = lazy(() => import('./pages/MenuManagementPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
```

**효과**: 초기 번들 크기 감소, 필요 시점에만 로딩

### 2.2 선택적 리렌더링 (Selective Re-rendering)
```typescript
// Zustand selector 패턴으로 불필요한 리렌더 방지
const tableOrders = useOrderStore(
  (state) => state.orders[tableId] // 특정 테이블 주문만 구독
);

// React.memo로 테이블 카드 메모이제이션
const TableCard = memo(({ table, ...props }: TableCardProps) => {
  // 해당 테이블 데이터 변경 시에만 리렌더
});
```

**적용 위치**: `frontend/src/admin/components/TableCard.tsx`

### 2.3 Optimistic Update 패턴
```typescript
// 주문 상태 변경 시 즉시 UI 반영
async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  // 1. 이전 상태 백업
  const previousOrders = get().orders;
  
  // 2. 즉시 UI 업데이트 (낙관적)
  set((state) => ({
    orders: updateOrderInState(state.orders, orderId, newStatus)
  }));
  
  // 3. API 호출
  try {
    await api.patch(`/orders/${orderId}/status`, { status: newStatus });
  } catch (error) {
    // 4. 실패 시 롤백
    set({ orders: previousOrders });
    showErrorToast('상태 변경에 실패했습니다');
  }
}
```

**적용 위치**: `frontend/src/admin/stores/useOrderStore.ts`

### 2.4 이미지 Lazy Loading
```typescript
// 메뉴 이미지 지연 로딩
<img
  src={menu.imageUrl}
  loading="lazy"
  alt={menu.name}
  onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
/>
```

**적용 위치**: 메뉴 관련 컴포넌트

---

## 3. 보안 패턴 (Security Patterns)

### 3.1 토큰 관리 패턴
```typescript
// 토큰 저장/조회/삭제 유틸리티
const TOKEN_KEY = 'admin_token';
const EXPIRES_KEY = 'admin_token_expires';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string, expiresAt: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_KEY, expiresAt);
  },
  remove: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  },
  isExpired: () => {
    const expires = localStorage.getItem(EXPIRES_KEY);
    if (!expires) return true;
    return new Date(expires).getTime() < Date.now();
  }
};
```

### 3.2 인증 가드 패턴
```typescript
// Protected Route 컴포넌트
function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated());
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
```

### 3.3 API 요청 인증 패턴
```typescript
// Axios 요청 인터셉터 — 자동 토큰 첨부
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token && !tokenStorage.isExpired()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 4. 사용성 패턴 (Usability Patterns)

### 4.1 로딩 상태 패턴
```typescript
// 스켈레톤 UI (대시보드 초기 로딩)
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48" />
      ))}
    </div>
  );
}

// 버튼 로딩 상태
<Button isLoading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? <Spinner /> : '저장'}
</Button>
```

### 4.2 토스트 알림 패턴
```typescript
// 토스트 큐 관리 (최대 3개, 자동 제거)
function useToastManager() {
  const MAX_TOASTS = 3;
  const DEFAULT_DURATION = 3000;
  const ERROR_DURATION = 5000;

  const addToast = (toast: ToastInput) => {
    const id = crypto.randomUUID();
    const duration = toast.type === 'error' ? ERROR_DURATION : DEFAULT_DURATION;
    
    set((state) => {
      const toasts = [...state.toasts, { ...toast, id }];
      // 최대 개수 초과 시 가장 오래된 것 제거
      return { toasts: toasts.slice(-MAX_TOASTS) };
    });

    setTimeout(() => removeToast(id), duration);
  };
}
```

### 4.3 확인 팝업 패턴
```typescript
// 위험 작업 확인 패턴
const handleDelete = () => {
  showConfirm({
    title: '주문 삭제',
    message: '이 주문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    variant: 'danger',
    confirmText: '삭제',
    onConfirm: () => deleteOrder(orderId),
  });
};
```

---

## 5. 실시간 데이터 패턴 (Real-time Patterns)

### 5.1 SSE 이벤트 처리 패턴
```typescript
// SSE 이벤트 → Zustand Store 업데이트
function handleSSEEvent(event: SSEEvent) {
  switch (event.type) {
    case 'new_order':
      // 해당 테이블에 주문 추가 + 강조 표시
      addOrderToTable(event.data.tableId, event.data.order);
      highlightOrder(event.data.order.id, 3000); // 3초 강조
      break;
    case 'order_status_changed':
      updateOrderInStore(event.data.orderId, event.data.newStatus);
      break;
    case 'order_deleted':
      removeOrderFromStore(event.data.orderId, event.data.tableId);
      break;
    case 'table_reset':
      resetTableInStore(event.data.tableId);
      break;
  }
}
```

### 5.2 연결 상태 표시 패턴
```typescript
// SSE 연결 상태 3단계 관리
type SSEStatus = 'connected' | 'reconnecting' | 'disconnected';

// 상태 전이:
// 초기 → connected (연결 성공)
// connected → reconnecting (연결 끊김, 재시도 중)
// reconnecting → connected (재연결 성공)
// reconnecting → disconnected (최대 재시도 초과)
```
