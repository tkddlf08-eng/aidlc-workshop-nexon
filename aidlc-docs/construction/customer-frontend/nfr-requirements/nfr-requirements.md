# NFR Requirements - Customer Frontend

## 1. 성능 (Performance)

| ID | 요구사항 | 목표값 | 측정 방법 |
|----|----------|--------|-----------|
| PERF-01 | 초기 페이지 로딩 | < 3초 (LCP) | Lighthouse |
| PERF-02 | 카테고리 전환 | < 300ms | 사용자 체감 |
| PERF-03 | 장바구니 조작 | 즉시 (< 50ms) | 클라이언트 사이드 연산 |
| PERF-04 | 주문 API 응답 대기 | < 2초 | 네트워크 요청 시간 |
| PERF-05 | 번들 사이즈 | < 500KB (gzipped) | 빌드 분석 |

### 최적화 전략
- React.lazy + Suspense로 코드 스플리팅 (페이지 단위)
- 이미지 lazy loading (메뉴 카드)
- Zustand의 selector 패턴으로 불필요한 리렌더링 방지
- API 응답 캐싱 (메뉴/카테고리는 자주 변경되지 않음)

---

## 2. 가용성 (Availability)

| ID | 요구사항 | 설명 |
|----|----------|------|
| AVAIL-01 | 오프라인 장바구니 | 네트워크 끊겨도 장바구니 조작 가능 (localStorage) |
| AVAIL-02 | 새로고침 복원 | 브라우저 새로고침 시 장바구니 + 인증 상태 유지 |
| AVAIL-03 | API 실패 대응 | API 에러 시 사용자에게 명확한 피드백 + 재시도 가능 |
| AVAIL-04 | 자동 재연결 | 네트워크 복구 시 자동으로 데이터 갱신 |

---

## 3. 사용성 (Usability)

| ID | 요구사항 | 기준 |
|----|----------|------|
| USE-01 | 터치 타겟 | 모든 인터랙티브 요소 최소 44x44px |
| USE-02 | 시각적 피드백 | 모든 사용자 액션에 즉각적 피드백 (< 100ms) |
| USE-03 | 에러 메시지 | 사용자 친화적 한국어 에러 메시지 |
| USE-04 | 로딩 상태 | 500ms 이상 대기 시 로딩 인디케이터 표시 |
| USE-05 | 접근성 | WCAG 2.1 AA 수준 (색상 대비, 키보드 접근) |

---

## 4. 보안 (Security)

| ID | 요구사항 | 구현 방법 |
|----|----------|-----------|
| SEC-01 | 토큰 저장 | localStorage에 JWT 저장 (HttpOnly 쿠키 대안 고려) |
| SEC-02 | 토큰 만료 처리 | 401 응답 시 자동 재로그인 또는 설정 화면 이동 |
| SEC-03 | XSS 방지 | React의 기본 이스케이핑 + dangerouslySetInnerHTML 미사용 |
| SEC-04 | API 통신 | HTTPS 전용 |

---

## 5. 유지보수성 (Maintainability)

| ID | 요구사항 | 구현 방법 |
|----|----------|-----------|
| MAINT-01 | 타입 안전성 | TypeScript strict mode |
| MAINT-02 | 코드 품질 | ESLint + Prettier 설정 |
| MAINT-03 | 컴포넌트 테스트 | Vitest + React Testing Library |
| MAINT-04 | 디렉토리 구조 | Feature-based (customer/admin/shared 분리) |
| MAINT-05 | API 클라이언트 | 중앙화된 axios 인스턴스 + 인터셉터 |

---

## 6. 호환성 (Compatibility)

| ID | 요구사항 | 대상 |
|----|----------|------|
| COMPAT-01 | 브라우저 | Chrome 90+, Safari 14+ (태블릿 기준) |
| COMPAT-02 | 화면 크기 | 태블릿 (768px ~ 1024px) 최적화, 모바일 지원 |
| COMPAT-03 | 터치 입력 | 터치 이벤트 우선, 마우스 이벤트 호환 |
