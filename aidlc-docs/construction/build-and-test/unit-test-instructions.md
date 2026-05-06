# Unit Test Instructions - Customer Frontend

## 테스트 실행

### 전체 테스트 실행 (단일 실행)
```bash
cd frontend
npx vitest run
```

### 테스트 감시 모드 (개발 중)
```bash
npx vitest
```

---

## 테스트 설정

### vitest.config.ts 추가 필요
```typescript
// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@customer': path.resolve(__dirname, './src/customer'),
      '@admin': path.resolve(__dirname, './src/admin'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
```

### test-setup.ts 추가 필요
```typescript
// frontend/src/test-setup.ts
import '@testing-library/jest-dom';
```

---

## 테스트 파일 목록

### 현재 작성된 테스트
| 파일 | 대상 | 테스트 수 |
|------|------|-----------|
| `customer/stores/__tests__/useCartStore.test.ts` | 장바구니 스토어 | 8개 |

### 추가 권장 테스트
| 파일 | 대상 | 우선순위 |
|------|------|----------|
| `customer/stores/__tests__/useCustomerAuthStore.test.ts` | 인증 스토어 | High |
| `customer/pages/__tests__/MenuPage.test.tsx` | 메뉴 페이지 렌더링 | Medium |
| `customer/pages/__tests__/CartPage.test.tsx` | 장바구니 페이지 | Medium |
| `customer/components/__tests__/MenuCard.test.tsx` | 메뉴 카드 인터랙션 | Medium |

---

## 테스트 커버리지 확인

```bash
npx vitest run --coverage
```

### 목표 커버리지
| 영역 | 목표 |
|------|------|
| Zustand Stores | 80% |
| 유틸리티 함수 | 80% |
| 컴포넌트 (주요 플로우) | 60% |

---

## 예상 테스트 결과

```
 ✓ customer/stores/__tests__/useCartStore.test.ts (8 tests)
   ✓ should add item to cart
   ✓ should increase quantity when adding existing item
   ✓ should remove item from cart
   ✓ should update quantity
   ✓ should remove item when quantity is 0
   ✓ should calculate total price
   ✓ should calculate total items
   ✓ should clear cart

 Test Files  1 passed (1)
      Tests  8 passed (8)
```
# Unit Test Execution - Admin Frontend (Unit 3)

## Run Unit Tests

### 1. Execute All Unit Tests
```bash
cd table-order/frontend
npm run test:run
```

### 2. Watch Mode (개발 중)
```bash
npm run test
```

### 3. Review Test Results
- **Expected**: 모든 테스트 통과
- **Test Coverage**: 핵심 유틸리티 및 공통 컴포넌트 커버
- **Test Report**: 터미널 출력

## Test Files

| 테스트 파일 | 대상 | 검증 내용 |
|------------|------|-----------|
| `token-storage.test.ts` | Token Storage 유틸 | 토큰 저장/조회/삭제/만료 체크 |
| `Button.test.tsx` | Button 컴포넌트 | 렌더링, 클릭, 로딩, 비활성화, variant |
| `Modal.test.tsx` | Modal 컴포넌트 | 열기/닫기, ESC 키, 외부 클릭 |

## Test Configuration

- **Runner**: Vitest
- **Environment**: jsdom
- **Setup**: `src/test-setup.ts` (@testing-library/jest-dom)
- **Path Alias**: `@/` → `./src/`

## Fix Failing Tests

1. 테스트 출력에서 실패 원인 확인
2. 해당 컴포넌트/유틸 코드 수정
3. `npm run test:run`으로 재실행
4. 모든 테스트 통과 확인

## 추가 테스트 작성 가이드

### Store 테스트 패턴
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAdminAuthStore } from '@/admin/stores/useAdminAuthStore';

describe('useAdminAuthStore', () => {
  beforeEach(() => {
    // Store 초기화
    useAdminAuthStore.setState({ token: null, admin: null });
    localStorage.clear();
  });

  it('should start unauthenticated', () => {
    const { isAuthenticated } = useAdminAuthStore.getState();
    expect(isAuthenticated()).toBe(false);
  });
});
```

### Component 테스트 패턴
```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from './MyComponent';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}
```
