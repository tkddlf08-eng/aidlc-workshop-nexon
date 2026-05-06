# Admin Frontend - 컴포넌트 설계

## 1. 페이지 구조 및 라우팅

### 라우팅 맵
```
/admin/login              → LoginPage
/admin/dashboard          → DashboardPage (기본 페이지)
/admin/menus              → MenuManagementPage
/admin/tables/:id/history → OrderHistoryPage
```

### 라우트 보호
- `/admin/login`: 비인증 사용자만 접근 (인증 시 대시보드로 리다이렉트)
- `/admin/*` (나머지): 인증 필수 (비인증 시 로그인으로 리다이렉트)

---

## 2. 컴포넌트 계층 구조

```
App
├── AdminLayout
│   ├── Sidebar
│   │   ├── SidebarLogo
│   │   ├── SidebarNav
│   │   │   ├── NavItem (대시보드)
│   │   │   └── NavItem (메뉴 관리)
│   │   └── SidebarFooter (로그아웃 버튼)
│   ├── Header
│   │   ├── PageTitle
│   │   ├── SSEStatusIndicator
│   │   └── AdminProfile
│   └── MainContent (Outlet)
│       ├── DashboardPage
│       │   ├── DashboardHeader (필터)
│       │   ├── TableGrid
│       │   │   └── TableCard (반복)
│       │   │       ├── TableCardHeader (번호, 총액)
│       │   │       ├── OrderList (미리보기)
│       │   │       │   └── OrderItem (반복)
│       │   │       └── TableCardActions (이용완료)
│       │   └── OrderDrawer (사이드 패널)
│       │       ├── OrderDrawerHeader
│       │       ├── OrderDetailContent
│       │       │   ├── OrderItemList
│       │       │   └── OrderSummary
│       │       └── OrderDrawerActions (상태변경, 삭제)
│       ├── MenuManagementPage
│       │   ├── CategoryPanel (좌측)
│       │   │   ├── CategoryList (DnD)
│       │   │   │   └── CategoryItem (반복)
│       │   │   └── CategoryAddForm
│       │   └── MenuPanel (우측)
│       │       ├── MenuToolbar (추가 버튼)
│       │       ├── MenuList (DnD)
│       │       │   └── MenuItem (반복)
│       │       └── MenuFormModal
│       │           ├── MenuFormFields
│       │           └── ImageUploader
│       └── OrderHistoryPage
│           ├── HistoryHeader (뒤로가기, 테이블 정보)
│           ├── DateFilter
│           └── HistoryOrderList
│               └── HistoryOrderItem (반복)
├── LoginPage
│   └── LoginForm
│       ├── InputField (storeId)
│       ├── InputField (username)
│       ├── InputField (password)
│       └── SubmitButton
└── SharedComponents
    ├── ToastContainer
    │   └── Toast (반복)
    ├── ConfirmDialog
    ├── LoadingSpinner
    ├── Button
    ├── Modal
    └── EmptyState
```

---

## 3. 주요 컴포넌트 Props/State 정의

### 3.1 LoginPage

```typescript
// LoginForm
interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// 내부 상태
// - formData: { storeId, username, password }
// - validationErrors: Record<string, string>
```

### 3.2 DashboardPage

```typescript
// TableGrid
interface TableGridProps {
  tables: Table[];
  onOrderClick: (orderId: string) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onCompleteTable: (tableId: string) => void;
  highlightedOrderIds: Set<string>;
}

// TableCard
interface TableCardProps {
  table: Table;
  onOrderClick: (orderId: string) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onCompleteTable: () => void;
  highlightedOrderIds: Set<string>;
}

// OrderDrawer
interface OrderDrawerProps {
  isOpen: boolean;
  order: OrderDetail | null;
  onClose: () => void;
  onStatusChange: (status: OrderStatus) => void;
  onDelete: () => void;
  isLoading: boolean;
}
```

### 3.3 MenuManagementPage

```typescript
// CategoryPanel
interface CategoryPanelProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
  onCreate: (data: CategoryFormData) => Promise<void>;
  onUpdate: (id: string, data: CategoryFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (id: string, newOrder: number) => Promise<void>;
}

// MenuPanel
interface MenuPanelProps {
  menus: Menu[];
  selectedCategoryId: string | null;
  onCreate: (data: MenuFormData) => Promise<void>;
  onUpdate: (id: string, data: MenuFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (id: string, newOrder: number) => Promise<void>;
}

// MenuFormModal
interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuFormData) => Promise<void>;
  initialData?: Menu; // 수정 시 기존 데이터
  categories: Category[];
  isLoading: boolean;
}

// ImageUploader
interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  maxSize: number; // bytes (5MB = 5242880)
  acceptedFormats: string[]; // ['image/jpeg', 'image/png', 'image/webp']
}
```

### 3.4 OrderHistoryPage

```typescript
// DateFilter
interface DateFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateChange: (from: string, to: string) => void;
}

// HistoryOrderList
interface HistoryOrderListProps {
  orders: ArchivedOrder[];
  isLoading: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
}
```

### 3.5 공통 컴포넌트

```typescript
// Button
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  'data-testid'?: string;
}

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// ConfirmDialog
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

// Toast
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: (id: string) => void;
}

// SSEStatusIndicator
interface SSEStatusIndicatorProps {
  status: 'connected' | 'reconnecting' | 'disconnected';
}
```

---

## 4. 사용자 인터랙션 흐름

### 4.1 로그인 → 대시보드 흐름
```
1. 사용자가 /admin/login 접속
2. storeId, username, password 입력
3. "로그인" 버튼 클릭
4. 로딩 표시 (버튼 비활성화 + 스피너)
5. 성공 → /admin/dashboard 리다이렉트
6. 실패 → 에러 메시지 표시 (폼 위)
```

### 4.2 대시보드 주문 관리 흐름
```
1. 대시보드 로드 → 테이블 그리드 표시
2. SSE 연결 → 실시간 업데이트 시작
3. 신규 주문 수신 → 해당 테이블 카드에 추가 + 3초 강조
4. 주문 카드 클릭 → 사이드 패널 열림 (상세 정보)
5. "준비 시작" 클릭 → 상태 변경 (PENDING → PREPARING)
6. "완료" 클릭 → 상태 변경 (PREPARING → COMPLETED)
7. "삭제" 클릭 → 확인 팝업 → 삭제 수행
```

### 4.3 테이블 이용 완료 흐름
```
1. 테이블 카드의 "이용 완료" 버튼 클릭
2. 확인 팝업 표시
3. "확인" 클릭 → API 호출
4. 성공 → 테이블 카드 리셋 (주문 비우기, 총액 0)
5. 성공 토스트 표시
```

### 4.4 메뉴 등록 흐름
```
1. 메뉴 관리 페이지 → 카테고리 선택
2. "메뉴 추가" 버튼 클릭 → 등록 모달 열림
3. 폼 입력 (메뉴명, 가격, 설명, 카테고리, 이미지)
4. 이미지 선택 → 미리보기 표시
5. "등록" 클릭 → 유효성 검증
6. 검증 통과 → API 호출 (multipart/form-data)
7. 성공 → 모달 닫기 + 목록 갱신 + 성공 토스트
8. 실패 → 에러 표시 (필드별 또는 일반)
```

### 4.5 메뉴 순서 변경 흐름
```
1. 메뉴 목록에서 항목 드래그 시작
2. 드래그 중 → 드롭 위치 시각적 표시
3. 드롭 → 새 순서 계산
4. API 호출 (PATCH /api/menus/{id}/sort)
5. 성공 → 새 순서 유지
6. 실패 → 이전 순서로 롤백 + 에러 토스트
```

---

## 5. API 연동 포인트 매핑

### 페이지별 API 사용

| 페이지 | API Endpoint | 시점 |
|--------|-------------|------|
| LoginPage | POST /api/auth/admin/login | 로그인 폼 제출 |
| (앱 초기화) | GET /api/auth/me | 세션 복원 |
| DashboardPage | GET /api/tables/dashboard | 페이지 마운트 |
| DashboardPage | GET /api/orders/stream | SSE 연결 |
| DashboardPage | GET /api/orders/{id} | 주문 상세 클릭 |
| DashboardPage | PATCH /api/orders/{id}/status | 상태 변경 |
| DashboardPage | DELETE /api/orders/{id} | 주문 삭제 |
| DashboardPage | POST /api/tables/{id}/complete | 이용 완료 |
| MenuManagementPage | GET /api/categories | 페이지 마운트 |
| MenuManagementPage | POST /api/categories | 카테고리 추가 |
| MenuManagementPage | PUT /api/categories/{id} | 카테고리 수정 |
| MenuManagementPage | DELETE /api/categories/{id} | 카테고리 삭제 |
| MenuManagementPage | GET /api/menus?category_id= | 카테고리 선택 |
| MenuManagementPage | POST /api/menus | 메뉴 등록 |
| MenuManagementPage | PUT /api/menus/{id} | 메뉴 수정 |
| MenuManagementPage | DELETE /api/menus/{id} | 메뉴 삭제 |
| MenuManagementPage | PATCH /api/menus/{id}/sort | 순서 변경 |
| MenuManagementPage | POST /api/menus/{id}/image | 이미지 업로드 |
| OrderHistoryPage | GET /api/orders/history | 페이지 마운트 + 필터 변경 |

---

## 6. 스타일링 전략

### 기술 선택
- **CSS 방식**: CSS Modules 또는 Tailwind CSS (팀 합의 필요)
- **컴포넌트 라이브러리**: 자체 구현 (shared/ 디렉토리)
- **아이콘**: Lucide React (경량, 일관된 스타일)

### 디자인 토큰
```typescript
const colors = {
  primary: '#2563EB',      // 주요 액션
  danger: '#DC2626',       // 삭제, 위험
  success: '#16A34A',      // 성공, 완료
  warning: '#D97706',      // 경고, 준비중
  pending: '#6B7280',      // 대기중
  background: '#F9FAFB',   // 배경
  surface: '#FFFFFF',      // 카드 배경
  text: '#111827',         // 기본 텍스트
  textSecondary: '#6B7280', // 보조 텍스트
};

const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};
```

### 주문 상태별 색상
| 상태 | 배경색 | 텍스트색 | 배지 |
|------|--------|----------|------|
| PENDING | #FEF3C7 | #92400E | 노란색 |
| PREPARING | #DBEAFE | #1E40AF | 파란색 |
| COMPLETED | #D1FAE5 | #065F46 | 초록색 |
| 신규 주문 강조 | #FEE2E2 | - | 빨간색 테두리 (3초) |
