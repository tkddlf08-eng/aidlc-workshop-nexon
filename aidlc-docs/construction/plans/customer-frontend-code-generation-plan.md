# Code Generation Plan - Unit 2: Customer Frontend

## Unit Context
- **Unit**: Customer Frontend
- **기술 스택**: React 18 + TypeScript + Vite + Zustand + React Query + Tailwind CSS + Axios
- **코드 위치**: `frontend/` (workspace root)
- **스토리**: US-C01, US-C03~C10 (9개)

## Dependencies
- Unit 1 (Backend API): REST API 호출 — MSW로 Mock 처리하여 독립 개발
- Unit 3 (Admin FE): `frontend/src/shared/` 공유

---

## Execution Steps

### Step 1: Project Scaffolding
- [x] Vite + React + TypeScript 프로젝트 초기화
- [x] Tailwind CSS 설정
- [x] ESLint + Prettier 설정
- [x] 디렉토리 구조 생성 (customer/, admin/, shared/)
- [x] package.json 의존성 설정

### Step 2: Shared Infrastructure
- [x] `shared/api/client.ts` — Axios 인스턴스 + 인터셉터 (토큰 첨부, 401 재시도)
- [x] `shared/api/types.ts` — API 요청/응답 타입 정의
- [x] `shared/api/endpoints.ts` — API 엔드포인트 상수
- [x] `shared/constants/config.ts` — 환경 변수 설정
- [x] `shared/hooks/useDelayedLoading.ts` — 지연 로딩 훅
- [x] `shared/hooks/useNetworkStatus.ts` — 네트워크 상태 훅

### Step 3: Shared UI Components
- [x] `shared/components/Button.tsx` — 기본 버튼 (primary/secondary/danger)
- [x] `shared/components/InputField.tsx` — 입력 필드 (label, error)
- [x] `shared/components/Modal.tsx` — 확인 팝업
- [x] `shared/components/Toast.tsx` — react-hot-toast 설정
- [x] `shared/components/LoadingSpinner.tsx` — 로딩 인디케이터
- [x] `shared/components/PageLoadingSpinner.tsx` — 페이지 전환 로딩
- [x] `shared/components/EmptyState.tsx` — 빈 상태 메시지
- [x] `shared/components/Badge.tsx` — 숫자/상태 뱃지
- [x] `shared/components/Image.tsx` — 이미지 (lazy + fallback)

### Step 4: Zustand Stores
- [x] `customer/stores/useCustomerAuthStore.ts` — 인증 상태 (persist)
- [x] `customer/stores/useCartStore.ts` — 장바구니 상태 (persist)
- [x] `customer/stores/useOrderStore.ts` — 주문 상태

### Step 5: React Query Hooks
- [x] `shared/api/queries.ts` — useCategories, useMenus, useSessionOrders
- [x] `shared/api/mutations.ts` — useCreateOrder, useTableLogin

### Step 6: Customer Pages - Auth
- [x] `customer/pages/SetupPage.tsx` — 초기 설정 (US-C01)
- [x] `customer/components/SetupForm.tsx` — 설정 폼
- [x] `customer/components/AuthGuard.tsx` — 인증 래퍼

### Step 7: Customer Pages - Menu
- [x] `customer/pages/MenuPage.tsx` — 메뉴 화면 (US-C03, US-C04)
- [x] `customer/components/CategoryTabs.tsx` — 카테고리 탭
- [x] `customer/components/MenuGrid.tsx` — 메뉴 그리드
- [x] `customer/components/MenuCard.tsx` — 메뉴 카드

### Step 8: Customer Pages - Cart
- [x] `customer/pages/CartPage.tsx` — 장바구니 (US-C05, US-C06)
- [ ] `customer/components/CartItemList.tsx` — 장바구니 목록
- [x] `customer/components/CartItemRow.tsx` — 장바구니 항목
- [x] `customer/components/QuantityControl.tsx` — 수량 조절
- [x] `customer/components/CartSummary.tsx` — 합계 표시

### Step 9: Customer Pages - Order
- [x] `customer/pages/OrderConfirmPage.tsx` — 주문 확인 (US-C07)
- [x] `customer/pages/OrderSuccessPage.tsx` — 주문 완료 (US-C07, US-C08)
- [x] `customer/components/CountdownTimer.tsx` — 5초 카운트다운

### Step 10: Customer Pages - Order History
- [x] `customer/pages/OrderHistoryPage.tsx` — 주문 내역 (US-C09, US-C10)
- [x] `customer/components/OrderCard.tsx` — 주문 카드
- [x] `customer/components/StatusBadge.tsx` — 상태 뱃지

### Step 11: Navigation & Routing
- [x] `customer/components/BottomNavigation.tsx` — 하단 탭 네비게이션
- [x] `customer/components/MainLayout.tsx` — 메인 레이아웃
- [x] `router.tsx` — 라우트 설정
- [x] `App.tsx` — 앱 엔트리 (Suspense + QueryClientProvider)

### Step 12: MSW Mock Handlers
- [x] `mocks/handlers.ts` — API Mock 핸들러 (메뉴, 주문, 인증)
- [x] `mocks/browser.ts` — MSW 브라우저 워커
- [x] `mocks/data.ts` — Mock 데이터 (카테고리, 메뉴, 주문)

### Step 13: Tests
- [x] `customer/stores/__tests__/useCartStore.test.ts` — 장바구니 스토어 테스트
- [ ] `customer/stores/__tests__/useCustomerAuthStore.test.ts` — 인증 스토어 테스트
- [ ] `customer/pages/__tests__/MenuPage.test.tsx` — 메뉴 페이지 테스트
- [ ] `customer/pages/__tests__/CartPage.test.tsx` — 장바구니 페이지 테스트

### Step 14: Configuration & Build
- [x] `vite.config.ts` — Vite 설정
- [x] `tailwind.config.js` — Tailwind 설정
- [x] `tsconfig.json` — TypeScript 설정
- [x] `.env.development` / `.env.production` — 환경 변수
- [ ] `Dockerfile` — 프로덕션 빌드 컨테이너

### Step 15: Documentation
- [x] `frontend/README.md` — 프로젝트 설명, 실행 방법, 구조
- [ ] `aidlc-docs/construction/customer-frontend/code/code-summary.md` — 코드 생성 요약

---

## Story Traceability

| Step | Stories Covered |
|------|----------------|
| Step 6 | US-C01 (자동 로그인) |
| Step 7 | US-C03, US-C04 (메뉴 탐색) |
| Step 8 | US-C05, US-C06 (장바구니) |
| Step 9 | US-C07, US-C08 (주문 생성/추가) |
| Step 10 | US-C09, US-C10 (주문 내역) |

---

## 총 파일 수 예상: ~45개
## 총 Step 수: 15개
