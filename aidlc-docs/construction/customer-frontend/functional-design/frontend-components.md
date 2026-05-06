# Frontend Components - Customer Frontend

## 페이지 구조

```
App
├── AuthGuard (인증 래퍼)
│   ├── SetupPage (초기 설정)
│   └── MainLayout (인증 완료 후)
│       ├── MenuPage (홈/기본 화면)
│       ├── CartPage (장바구니)
│       ├── OrderConfirmPage (주문 확인)
│       ├── OrderSuccessPage (주문 완료)
│       └── OrderHistoryPage (주문 내역)
└── Navigation (하단 탭 네비게이션)
```

---

## 페이지별 컴포넌트 분해

### 1. SetupPage (`/setup`)

```
SetupPage
├── SetupForm
│   ├── InputField (매장 식별자)
│   ├── InputField (테이블 번호)
│   ├── InputField (비밀번호)
│   └── SubmitButton
└── ErrorMessage
```

**Props/State**:
- Local state: storeId, tableNumber, password, isLoading, error
- Action: handleSubmit → useCustomerAuthStore.login()

---

### 2. MenuPage (`/` - 홈)

```
MenuPage
├── CategoryTabs
│   └── CategoryTab[] (카테고리 탭 목록)
├── MenuGrid
│   └── MenuCard[] (메뉴 카드 목록)
│       ├── MenuImage
│       ├── MenuInfo (이름, 가격, 설명)
│       └── AddToCartButton
└── CartFloatingButton (장바구니 바로가기)
```

**Props/State**:
- API: GET /api/categories, GET /api/menus?category_id=
- Local state: selectedCategoryId, menus[], categories[], isLoading
- Action: selectCategory, addToCart → useCartStore.addItem()

---

### 3. CartPage (`/cart`)

```
CartPage
├── CartHeader (장바구니 타이틀 + 전체 삭제)
├── CartItemList
│   └── CartItemRow[]
│       ├── ItemInfo (이름, 단가)
│       ├── QuantityControl (-, 수량, +)
│       └── RemoveButton
├── CartSummary
│   ├── TotalItems
│   └── TotalPrice
├── OrderButton (주문하기)
└── EmptyCartMessage (장바구니 비었을 때)
```

**Props/State**:
- Store: useCartStore (items, totalPrice, totalItems)
- Actions: updateQuantity, removeItem, clearCart
- Navigation: OrderButton → /order-confirm

---

### 4. OrderConfirmPage (`/order-confirm`)

```
OrderConfirmPage
├── OrderSummary
│   └── OrderItemRow[] (메뉴명, 수량, 소계)
├── TotalAmount
└── ConfirmButton (주문 확정)
```

**Props/State**:
- Store: useCartStore (items, totalPrice)
- Store: useOrderStore.createOrder()
- Local state: isSubmitting
- Action: handleConfirm → createOrder → navigate to /order-success

---

### 5. OrderSuccessPage (`/order-success`)

```
OrderSuccessPage
├── SuccessIcon
├── OrderNumber
├── CountdownTimer (5초 카운트다운)
└── GoToMenuButton (즉시 이동)
```

**Props/State**:
- Route params: orderNumber
- Local state: countdown (5 → 0)
- Effect: countdown 완료 시 navigate to /
- Action: GoToMenuButton → navigate to /

---

### 6. OrderHistoryPage (`/orders`)

```
OrderHistoryPage
├── OrderList
│   └── OrderCard[]
│       ├── OrderHeader (주문번호, 시각)
│       ├── OrderItems (메뉴 목록 축약)
│       ├── OrderTotal (금액)
│       └── StatusBadge (대기중/준비중/완료)
├── LoadMoreButton / InfiniteScroll
└── EmptyOrderMessage
```

**Props/State**:
- Store: useOrderStore (orders, isLoading, hasNext)
- Actions: fetchOrders, loadMore
- Effect: 페이지 진입 시 fetchOrders()

---

### 7. Navigation (하단 탭)

```
BottomNavigation
├── NavItem (메뉴 - 홈 아이콘)
├── NavItem (장바구니 - 카트 아이콘 + 뱃지)
└── NavItem (주문내역 - 리스트 아이콘)
```

**Props/State**:
- Store: useCartStore.getTotalItems() → 뱃지 숫자
- Active tab: 현재 라우트 기반

---

## 공통 컴포넌트 (shared/)

| 컴포넌트 | 용도 |
|----------|------|
| Button | 기본 버튼 (primary, secondary, danger) |
| InputField | 텍스트 입력 필드 (label, error 포함) |
| Modal | 확인 팝업 |
| Toast | 알림 메시지 (성공/에러) |
| LoadingSpinner | 로딩 인디케이터 |
| EmptyState | 데이터 없음 상태 |
| Badge | 숫자/상태 뱃지 |
| Image | 이미지 (fallback 포함) |

---

## API 연동 매핑

| 페이지 | API Endpoint | 시점 |
|--------|-------------|------|
| SetupPage | POST /api/auth/table/login | 폼 제출 시 |
| AuthGuard | GET /api/auth/me | 앱 시작 시 |
| MenuPage | GET /api/categories | 페이지 로드 시 |
| MenuPage | GET /api/menus?category_id= | 카테고리 변경 시 |
| OrderConfirmPage | POST /api/orders | 주문 확정 시 |
| OrderHistoryPage | GET /api/orders?session_id=&page= | 페이지 로드/더보기 시 |

---

## 라우팅 설정

```typescript
const routes = [
  { path: '/setup', element: <SetupPage />, auth: false },
  { path: '/', element: <MenuPage />, auth: true },
  { path: '/cart', element: <CartPage />, auth: true },
  { path: '/order-confirm', element: <OrderConfirmPage />, auth: true },
  { path: '/order-success', element: <OrderSuccessPage />, auth: true },
  { path: '/orders', element: <OrderHistoryPage />, auth: true },
];
```

- `auth: true` → AuthGuard가 인증 확인, 미인증 시 /setup으로 리다이렉트
- `auth: false` → 인증 없이 접근 가능
