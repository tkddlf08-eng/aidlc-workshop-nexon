# Admin Frontend - Code Generation Plan

## 개요
Unit 3 (Admin Frontend)의 코드 생성 계획입니다. 이 문서가 Code Generation의 단일 진실 소스(Single Source of Truth)입니다.

## Unit 컨텍스트
- **기술 스택**: React 18 + TypeScript 5 + Vite 5 + Tailwind CSS + Zustand
- **코드 위치**: `table-order/frontend/` (workspace root 기준)
- **담당 스토리**: 14개 (Must 12 / Should 2)
- **의존성**: Backend API (Unit 1) — REST + SSE 통신

## 스토리 매핑

| Step | 구현 스토리 |
|------|------------|
| Step 1 | (프로젝트 구조) |
| Step 2 | (공통 인프라) |
| Step 3 | US-A01, US-A02 |
| Step 4 | US-A03, US-A04, US-A05, US-A06, US-A08 |
| Step 5 | US-A11, US-A12, US-A13, US-A14 |
| Step 6 | US-A07, US-A09, US-A10 |
| Step 7 | (테스트) |
| Step 8 | (배포/문서) |

---

## Code Generation Steps

### Step 1: Project Structure Setup
- [x] Vite + React + TypeScript 프로젝트 초기화 (`table-order/frontend/`)
- [x] `package.json` 생성 (모든 의존성 포함)
- [x] `vite.config.ts` 생성 (proxy, alias, 코드 분할)
- [x] `tsconfig.json` 생성 (strict mode, path alias)
- [x] `tailwind.config.js` + `postcss.config.js` 생성
- [x] `.eslintrc.cjs` + `.prettierrc` 생성
- [x] `.env.example` + `.env.development` 생성
- [x] `index.html` 생성
- [x] 디렉토리 구조 생성 (admin/, shared/)

### Step 2: Shared Infrastructure (공통 모듈)
- [x] `src/shared/api/client.ts` — Axios 인스턴스 + 인터셉터
- [x] `src/shared/utils/token-storage.ts` — 토큰 관리 유틸
- [x] `src/shared/utils/format.ts` — 날짜/금액 포맷 유틸
- [x] `src/shared/types/order.ts` — 주문 관련 타입
- [x] `src/shared/types/menu.ts` — 메뉴/카테고리 타입
- [x] `src/shared/types/table.ts` — 테이블 타입
- [x] `src/shared/types/auth.ts` — 인증 타입
- [x] `src/shared/types/api.ts` — API 공통 타입
- [x] `src/shared/components/Button.tsx` — 범용 버튼
- [x] `src/shared/components/Modal.tsx` — 모달 다이얼로그
- [x] `src/shared/components/ConfirmDialog.tsx` — 확인 팝업
- [x] `src/shared/components/Toast.tsx` + `ToastContainer.tsx` — 토스트 알림
- [x] `src/shared/components/LoadingSpinner.tsx` — 로딩 인디케이터
- [x] `src/shared/components/EmptyState.tsx` — 빈 상태
- [x] `src/shared/components/ErrorBoundary.tsx` — 에러 격리

### Step 3: Authentication (인증 모듈) — US-A01, US-A02
- [x] `src/admin/stores/useAdminAuthStore.ts` — 인증 상태 관리
- [x] `src/admin/stores/useUIStore.ts` — 공통 UI 상태 (토스트, 확인 팝업)
- [x] `src/admin/pages/LoginPage.tsx` — 로그인 페이지
- [x] `src/admin/components/layout/ProtectedRoute.tsx` — 인증 가드
- [x] `src/admin/components/layout/AdminLayout.tsx` — 레이아웃 (사이드바+헤더)
- [x] `src/admin/components/layout/Sidebar.tsx` — 좌측 사이드바
- [x] `src/admin/components/layout/Header.tsx` — 상단 헤더
- [x] `src/admin/routes.tsx` — 라우팅 설정
- [x] `src/App.tsx` — 앱 엔트리
- [x] `src/main.tsx` — 메인 엔트리 + CSS import
- [x] `src/index.css` — Tailwind 기본 스타일

### Step 4: Dashboard (대시보드) — US-A03, US-A04, US-A05, US-A06, US-A08
- [x] `src/admin/services/sse-manager.ts` — SSE 연결 관리
- [x] `src/admin/stores/useOrderStore.ts` — 주문 상태 관리 + SSE
- [x] `src/admin/stores/useTableStore.ts` — 테이블 상태 관리
- [x] `src/admin/pages/DashboardPage.tsx` — 대시보드 페이지
- [x] `src/admin/components/dashboard/TableGrid.tsx` — 테이블 그리드
- [x] `src/admin/components/dashboard/TableCard.tsx` — 테이블 카드
- [x] `src/admin/components/dashboard/OrderItem.tsx` — 주문 항목
- [x] `src/admin/components/dashboard/OrderDrawer.tsx` — 주문 상세 패널
- [x] `src/admin/components/dashboard/SSEStatusIndicator.tsx` — 연결 상태

### Step 5: Menu Management (메뉴 관리) — US-A11, US-A12, US-A13, US-A14
- [x] `src/admin/stores/useMenuStore.ts` — 메뉴/카테고리 상태 관리
- [x] `src/admin/pages/MenuManagementPage.tsx` — 메뉴 관리 페이지
- [x] `src/admin/components/menus/CategoryPanel.tsx` — 카테고리 패널 (DnD)
- [x] `src/admin/components/menus/CategoryItem.tsx` — 카테고리 항목
- [x] `src/admin/components/menus/MenuPanel.tsx` — 메뉴 패널 (DnD)
- [x] `src/admin/components/menus/MenuItem.tsx` — 메뉴 항목
- [x] `src/admin/components/menus/MenuFormModal.tsx` — 메뉴 등록/수정 모달
- [x] `src/admin/components/menus/ImageUploader.tsx` — 이미지 업로더

### Step 6: Table Management (테이블 관리) — US-A07, US-A09, US-A10
- [x] `src/admin/pages/OrderHistoryPage.tsx` — 과거 주문 내역 페이지
- [x] `src/admin/components/history/DateFilter.tsx` — 날짜 필터
- [x] `src/admin/components/history/HistoryOrderItem.tsx` — 과거 주문 항목

### Step 7: Unit Testing (단위 테스트)
- [x] `vitest.config.ts` + 테스트 설정
- [x] `src/shared/utils/__tests__/token-storage.test.ts`
- [x] `src/shared/components/__tests__/Button.test.tsx`
- [x] `src/shared/components/__tests__/Modal.test.tsx`

### Step 8: Deployment & Documentation (배포/문서)
- [x] `Dockerfile` (멀티스테이지 빌드)
- [x] `nginx.conf` (SPA 라우팅 + API 프록시)
- [x] `.dockerignore`
- [x] `README.md` (프론트엔드 개발 가이드)

---

## 총 파일 수 예상
- **Application Code**: ~45개 파일
- **Test Files**: ~8개 파일
- **Config/Deploy**: ~12개 파일
- **Documentation**: 1개 파일 (aidlc-docs)
- **합계**: ~66개 파일
