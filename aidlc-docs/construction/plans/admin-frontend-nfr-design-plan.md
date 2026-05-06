# Admin Frontend - NFR Design Plan

## 개요
Unit 3 (Admin Frontend)의 NFR 요구사항을 설계 패턴과 논리적 컴포넌트로 구체화합니다.

## Execution Plan

### Phase 1: 복원력 패턴 설계
- [x] SSE 재연결 패턴 (지수 백오프 + Jitter)
- [x] API 에러 복구 패턴 (Axios Interceptor)
- [x] Error Boundary 패턴 (페이지 단위 격리)

### Phase 2: 성능 패턴 설계
- [x] 코드 분할 전략 (React.lazy + Suspense)
- [x] 선택적 리렌더링 (Zustand selector + React.memo)
- [x] Optimistic Update 패턴
- [x] 이미지 Lazy Loading

### Phase 3: 보안 패턴 설계
- [x] 토큰 관리 패턴 (localStorage + 만료 체크)
- [x] 인증 가드 패턴 (ProtectedRoute)
- [x] API 요청 인증 패턴 (Request Interceptor)

### Phase 4: 논리적 컴포넌트 설계
- [x] Service Layer 구조 (API Client, SSE Manager, Token Storage)
- [x] State Layer 구조 (5개 Zustand Store)
- [x] Component Layer 아키텍처
- [x] 파일 구조 확정
