# Admin Frontend - Logical Components

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Frontend (SPA)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages   │   │
│  │  Login   │  │Dashboard │  │  Menus   │  │ History  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │         │
│  ┌────┴──────────────┴──────────────┴──────────────┴─────┐  │
│  │              Component Layer (UI)                       │  │
│  │  TableCard, OrderDrawer, MenuForm, Toast, Modal...    │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │              State Layer (Zustand Stores)               │  │
│  │  AuthStore | OrderStore | TableStore | MenuStore | UI  │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │              Service Layer                              │  │
│  │  API Client (Axios) | SSE Manager | Token Storage      │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
├───────────────────────────┼──────────────────────────────────┤
│                           ▼                                  │
│              Network (HTTP/SSE)                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │    Backend API (Unit 1)  │
              │    FastAPI + MySQL       │
              └─────────────────────────┘
```

---

## 1. Service Layer Components

### 1.1 API Client
**책임**: HTTP 통신 관리, 인증 헤더 자동 첨부, 에러 인터셉팅

```typescript
// frontend/src/shared/api/client.ts
- Axios 인스턴스 생성 (baseURL, timeout)
- Request Interceptor: Bearer 토큰 자동 첨부
- Response Interceptor: 401 → 로그아웃, 에러 정규화
- 타임아웃: 10초 (기본), 30초 (이미지 업로드)
```

### 1.2 SSE Manager
**책임**: EventSource 연결 관리, 재연결 로직, 이벤트 디스패치

```typescript
// frontend/src/admin/services/sse-manager.ts
- EventSource 생성/해제
- 지수 백오프 재연결 (1s → 2s → 4s → ... → max 30s)
- 연결 상태 관리 (connected/reconnecting/disconnected)
- 이벤트 파싱 및 콜백 디스패치
- 컴포넌트 언마운트 시 정리 (cleanup)
```

### 1.3 Token Storage
**책임**: JWT 토큰 영속화, 만료 체크

```typescript
// frontend/src/shared/utils/token-storage.ts
- localStorage 기반 토큰 저장/조회/삭제
- 만료 시간 체크 유틸리티
- 세션 복원 지원
```

---

## 2. State Layer Components

### 2.1 Store 구조

| Store | 책임 | 주요 상태 |
|-------|------|-----------|
| `useAdminAuthStore` | 인증 상태 관리 | token, admin, isLoading |
| `useOrderStore` | 주문 + SSE 관리 | orders (by table), sseStatus, highlights |
| `useTableStore` | 테이블 데이터 | tables, isLoading |
| `useMenuStore` | 메뉴/카테고리 관리 | categories, menus, selectedCategory |
| `useUIStore` | 공통 UI 상태 | toasts, confirmDialog |

### 2.2 Store 간 의존성

```
useAdminAuthStore ──── (독립)
       │
       ▼ (인증 상태 참조)
useOrderStore ◄──── SSE Manager
       │
       ▼ (테이블 데이터 공유)
useTableStore
       
useMenuStore ──── (독립)

useUIStore ──── (모든 Store에서 사용)
```

---

## 3. Component Layer Architecture

### 3.1 레이아웃 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `AdminLayout` | 사이드바 + 헤더 + 메인 콘텐츠 영역 |
| `Sidebar` | 좌측 네비게이션 (접기 가능) |
| `Header` | 페이지 제목 + SSE 상태 + 프로필 |
| `ProtectedRoute` | 인증 가드 (미인증 시 리다이렉트) |

### 3.2 공통 UI 컴포넌트 (Shared)

| 컴포넌트 | 역할 | NFR 패턴 |
|----------|------|----------|
| `Button` | 범용 버튼 | 로딩 상태, disabled 처리 |
| `Modal` | 모달 다이얼로그 | ESC 닫기, 포커스 트랩 |
| `ConfirmDialog` | 확인 팝업 | 위험 작업 보호 |
| `Toast` / `ToastContainer` | 알림 메시지 | 큐 관리, 자동 제거 |
| `LoadingSpinner` | 로딩 인디케이터 | 비동기 상태 표시 |
| `EmptyState` | 빈 상태 표시 | UX 가이드 |
| `ErrorBoundary` | 에러 격리 | 페이지 단위 복구 |

### 3.3 페이지별 핵심 컴포넌트

| 페이지 | 핵심 컴포넌트 | NFR 고려사항 |
|--------|-------------|-------------|
| Dashboard | `TableGrid`, `TableCard`, `OrderDrawer` | 선택적 리렌더, SSE 실시간 |
| Menus | `CategoryPanel`, `MenuPanel`, `MenuFormModal` | DnD 성능, 이미지 업로드 |
| History | `DateFilter`, `HistoryOrderList` | 페이지네이션, 날짜 필터 |
| Login | `LoginForm` | 에러 표시, 로딩 상태 |

---

## 4. 라우팅 구조

```typescript
// frontend/src/admin/routes.tsx
<Routes>
  <Route path="/admin/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
    <Route path="/admin/dashboard" element={<DashboardPage />} />
    <Route path="/admin/menus" element={<MenuManagementPage />} />
    <Route path="/admin/tables/:id/history" element={<OrderHistoryPage />} />
    <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
  </Route>
</Routes>
```

---

## 5. 데이터 흐름 다이어그램

### 5.1 실시간 주문 흐름
```
Backend SSE ──► SSE Manager ──► useOrderStore ──► TableCard (리렌더)
                    │                                    │
                    ▼                                    ▼
              연결 상태 업데이트              신규 주문 강조 (3초)
              (Header 표시)                  총 주문액 재계산
```

### 5.2 주문 상태 변경 흐름
```
User Click ──► useOrderStore.updateOrderStatus()
                    │
                    ├──► 즉시 UI 업데이트 (Optimistic)
                    │
                    └──► API PATCH /orders/{id}/status
                              │
                              ├── 성공: 유지
                              └── 실패: 롤백 + 에러 토스트
```

### 5.3 메뉴 CRUD 흐름
```
User Action ──► useMenuStore.createMenu(data)
                    │
                    ├──► API POST /menus (multipart)
                    │         │
                    │         ├── 성공: 목록 갱신 + 성공 토스트
                    │         └── 실패: 에러 토스트 (폼 유지)
                    │
                    └──► 이미지 있으면: POST /menus/{id}/image
```

---

## 6. 파일 구조 (최종)

```
frontend/src/admin/
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── MenuManagementPage.tsx
│   └── OrderHistoryPage.tsx
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/
│   │   ├── TableGrid.tsx
│   │   ├── TableCard.tsx
│   │   ├── OrderItem.tsx
│   │   ├── OrderDrawer.tsx
│   │   └── SSEStatusIndicator.tsx
│   ├── menus/
│   │   ├── CategoryPanel.tsx
│   │   ├── CategoryItem.tsx
│   │   ├── MenuPanel.tsx
│   │   ├── MenuItem.tsx
│   │   ├── MenuFormModal.tsx
│   │   └── ImageUploader.tsx
│   └── history/
│       ├── DateFilter.tsx
│       └── HistoryOrderItem.tsx
├── stores/
│   ├── useAdminAuthStore.ts
│   ├── useOrderStore.ts
│   ├── useTableStore.ts
│   └── useMenuStore.ts
├── services/
│   └── sse-manager.ts
└── routes.tsx

frontend/src/shared/
├── components/
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── ConfirmDialog.tsx
│   ├── Toast.tsx
│   ├── ToastContainer.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── ErrorBoundary.tsx
├── api/
│   └── client.ts
├── types/
│   ├── order.ts
│   ├── menu.ts
│   ├── table.ts
│   └── auth.ts
└── utils/
    ├── token-storage.ts
    └── format.ts
```
