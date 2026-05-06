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
