# NFR Design - Customer Frontend

## 1. 성능 패턴 설계

### 1.1 코드 스플리팅
```typescript
// App.tsx - 페이지 단위 lazy loading
const MenuPage = lazy(() => import('./customer/pages/MenuPage'));
const CartPage = lazy(() => import('./customer/pages/CartPage'));
const OrderConfirmPage = lazy(() => import('./customer/pages/OrderConfirmPage'));
const OrderSuccessPage = lazy(() => import('./customer/pages/OrderSuccessPage'));
const OrderHistoryPage = lazy(() => import('./customer/pages/OrderHistoryPage'));
const SetupPage = lazy(() => import('./customer/pages/SetupPage'));

// Suspense fallback
<Suspense fallback={<PageLoadingSpinner />}>
  <Routes>...</Routes>
</Suspense>

// shared/components/PageLoadingSpinner.tsx
// - 중앙 정렬 스피너 + "로딩 중..." 텍스트
// - 최소 높이 100vh로 레이아웃 시프트 방지
```

### 1.2 이미지 최적화
```typescript
// shared/components/Image.tsx
// - loading="lazy" 기본 적용
// - onError 시 플레이스홀더 표시
// - Intersection Observer로 뷰포트 진입 시 로드
```

### 1.3 API 캐싱 전략 (React Query)

서버 상태는 `@tanstack/react-query`로 관리하고, 클라이언트 상태(장바구니, 인증)는 Zustand으로 관리합니다.

```typescript
// shared/api/queries.ts
export const useCategories = () => useQuery({
  queryKey: ['categories'],
  queryFn: () => apiClient.get('/api/categories'),
  staleTime: 5 * 60 * 1000, // 5분
});

export const useMenus = (categoryId?: string) => useQuery({
  queryKey: ['menus', categoryId],
  queryFn: () => apiClient.get('/api/menus', { params: { category_id: categoryId } }),
  staleTime: 2 * 60 * 1000, // 2분
});

export const useSessionOrders = (sessionId: string, page: number) => useQuery({
  queryKey: ['orders', sessionId, page],
  queryFn: () => apiClient.get('/api/orders', { params: { session_id: sessionId, page } }),
  staleTime: 0, // 항상 최신 데이터
});
```

| 데이터 | 관리 도구 | 캐시 전략 | TTL |
|--------|-----------|-----------|-----|
| 카테고리 목록 | React Query | staleTime | 5분 |
| 메뉴 목록 | React Query | staleTime | 2분 |
| 주문 내역 | React Query | staleTime: 0 | 항상 최신 |
| 장바구니 | Zustand (persist) | localStorage | 영구 |
| 인증 토큰 | Zustand (persist) | localStorage | 영구 |

### 1.4 리렌더링 최적화
```typescript
// Zustand selector 패턴으로 필요한 상태만 구독
const totalItems = useCartStore((state) => state.items.length);
const totalPrice = useCartStore((state) => 
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
```

---

## 2. 가용성 패턴 설계

### 2.1 localStorage 영속성 (Zustand persist)
```typescript
// customer/stores/cartStore.ts
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (menu) => { /* ... */ },
      // ...
    }),
    {
      name: 'table-order-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 2.2 API 에러 핸들링 (Axios 인터셉터)
```typescript
// shared/api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 + 아직 재시도 안 한 경우에만 재로그인 시도 (무한 루프 방지)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const success = await authStore.getState().autoLogin();
      if (success) {
        // 새 토큰으로 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${authStore.getState().token}`;
        return apiClient(originalRequest);
      }
      // 재로그인 실패 → 설정 화면으로
      window.location.href = '/setup';
    }
    return Promise.reject(error);
  }
);
```

### 2.3 네트워크 상태 감지
```typescript
// shared/hooks/useNetworkStatus.ts
// - navigator.onLine 감지
// - 오프라인 시 배너 표시
// - 온라인 복구 시 자동 데이터 갱신
```

---

## 3. 보안 패턴 설계

### 3.1 토큰 관리
```typescript
// shared/api/client.ts
apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3.2 입력 검증
- React의 기본 XSS 방지 (JSX 자동 이스케이핑)
- `dangerouslySetInnerHTML` 사용 금지
- 사용자 입력은 항상 controlled component로 관리

---

## 4. 사용성 패턴 설계

### 4.1 로딩 상태 패턴
```typescript
// 500ms 이상 대기 시에만 로딩 표시 (깜빡임 방지)
const useDelayedLoading = (isLoading: boolean, delay = 500) => {
  const [showLoading, setShowLoading] = useState(false);
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoading(true), delay);
      return () => clearTimeout(timer);
    }
    setShowLoading(false);
  }, [isLoading, delay]);
  return showLoading;
};
```

### 4.2 토스트 알림 패턴
| 상황 | 타입 | 메시지 예시 | 지속 시간 |
|------|------|-------------|-----------|
| 장바구니 추가 | success | "장바구니에 추가되었습니다" | 2초 |
| 주문 성공 | success | "주문이 완료되었습니다" | 3초 |
| API 에러 | error | "주문에 실패했습니다. 다시 시도해주세요" | 4초 |
| 네트워크 에러 | error | "네트워크 연결을 확인해주세요" | 5초 |

### 4.3 빈 상태 패턴
| 화면 | 빈 상태 메시지 | 액션 |
|------|----------------|------|
| 장바구니 | "장바구니가 비어있습니다" | "메뉴 보러가기" 버튼 |
| 주문 내역 | "아직 주문이 없습니다" | "메뉴에서 주문해보세요" |

---

## 5. 프로젝트 구조 패턴

### 5.1 디렉토리 컨벤션
```
frontend/src/
├── customer/
│   ├── pages/          # 페이지 컴포넌트 (라우트 단위)
│   ├── components/     # 페이지 전용 컴포넌트
│   └── stores/         # Zustand stores
├── admin/              # (Unit 3 영역)
├── shared/
│   ├── api/            # API 클라이언트 + 타입
│   │   ├── client.ts   # axios 인스턴스
│   │   ├── types.ts    # API 요청/응답 타입
│   │   └── endpoints.ts # 엔드포인트 상수
│   ├── components/     # 공통 UI 컴포넌트
│   ├── hooks/          # 공통 커스텀 훅
│   ├── utils/          # 유틸리티 함수
│   └── constants/      # 상수 정의
├── App.tsx
├── main.tsx
└── router.tsx          # 라우트 설정
```

### 5.2 네이밍 컨벤션
| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 컴포넌트 파일 | PascalCase | `MenuCard.tsx` |
| 훅 파일 | camelCase (use 접두사) | `useCartStore.ts` |
| 유틸리티 | camelCase | `formatPrice.ts` |
| 타입 파일 | camelCase | `types.ts` |
| 상수 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| CSS 클래스 | Tailwind 유틸리티 | `className="flex items-center"` |

---

## 6. 테스트 전략

| 레벨 | 도구 | 대상 | 커버리지 목표 |
|------|------|------|---------------|
| Unit | Vitest | Zustand stores, 유틸리티 함수 | 80% |
| Component | RTL | 페이지/컴포넌트 렌더링 + 인터랙션 | 주요 플로우 |
| Integration | MSW + RTL | API 연동 플로우 | 핵심 시나리오 |
| E2E | (선택) Playwright | 전체 사용자 플로우 | Happy path |
