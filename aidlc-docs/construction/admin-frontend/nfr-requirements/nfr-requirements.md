# Admin Frontend - NFR Requirements

## 1. 성능 요구사항

### NFR-FE-01: 페이지 로딩 성능
| 지표 | 기준 |
|------|------|
| First Contentful Paint (FCP) | < 1.5초 |
| Largest Contentful Paint (LCP) | < 2.5초 |
| Time to Interactive (TTI) | < 3초 |
| 초기 번들 크기 (gzipped) | < 200KB |

### NFR-FE-02: SSE 실시간 반응 성능
| 지표 | 기준 |
|------|------|
| 주문 수신 → UI 반영 | < 2초 (네트워크 지연 포함) |
| SSE 재연결 시간 | 지수 백오프 (1s → 2s → 4s → 8s → max 30s) |
| 동시 SSE 이벤트 처리 | 초당 10건 이상 |
| UI 리렌더링 최적화 | 변경된 테이블 카드만 리렌더 |

### NFR-FE-03: 번들 최적화
- **코드 분할**: React.lazy + Suspense로 페이지별 분할
  - 로그인 페이지: 별도 청크
  - 대시보드 페이지: 별도 청크
  - 메뉴 관리 페이지: 별도 청크
  - 과거 내역 페이지: 별도 청크
- **Tree Shaking**: 사용하지 않는 코드 제거 (Vite 기본 지원)
- **이미지 최적화**: lazy loading, WebP 우선 표시

---

## 2. 보안 요구사항 (클라이언트)

### NFR-FE-04: 토큰 관리
| 항목 | 전략 |
|------|------|
| 저장 위치 | localStorage (16시간 세션, 관리자 전용) |
| 토큰 전송 | Authorization: Bearer 헤더 (axios interceptor) |
| 만료 처리 | 클라이언트 타이머 + 401 응답 시 즉시 로그아웃 |
| 로그아웃 시 | localStorage 토큰 삭제 + 메모리 상태 초기화 |

### NFR-FE-05: XSS 방어
- React의 기본 이스케이핑 활용 (dangerouslySetInnerHTML 사용 금지)
- 사용자 입력 데이터 표시 시 추가 sanitize 불필요 (React 기본 보호)
- 외부 URL 링크: `rel="noopener noreferrer"` 필수
- Content Security Policy (CSP) 헤더 설정 (배포 시)

### NFR-FE-06: 민감 데이터 처리
- 비밀번호 필드: `type="password"` + 자동완성 비활성화
- 토큰: 콘솔 로그 출력 금지
- API 에러 응답: 상세 서버 에러 메시지 사용자에게 노출 금지
- 개발 도구: production 빌드에서 devtools 비활성화

---

## 3. 사용성/접근성 요구사항

### NFR-FE-07: 반응형 디자인
| 브레이크포인트 | 너비 | 대상 |
|---------------|------|------|
| Desktop (기본) | ≥ 1024px | 관리자 PC/노트북 |
| Tablet | 768px ~ 1023px | 태블릿 가로 모드 |
| Mobile | < 768px | 비상 접근 (제한적 지원) |

- 대시보드 그리드: auto-fill, 최소 카드 너비 280px
- 사이드바: 태블릿 이하에서 접기 가능 (토글)
- Drawer: 모바일에서 전체 너비

### NFR-FE-08: 접근성 (기본 수준)
- 시맨틱 HTML 태그 사용 (`<nav>`, `<main>`, `<section>`, `<button>`)
- 키보드 네비게이션 지원 (Tab, Enter, Escape)
- `aria-label` 아이콘 버튼에 적용
- 포커스 표시 (outline) 유지
- 색상만으로 정보 전달하지 않음 (아이콘/텍스트 병행)

### NFR-FE-09: 브라우저 호환성
- **지원**: Chrome, Firefox, Safari, Edge (최신 2버전)
- **미지원**: IE11, 레거시 브라우저
- **ES 타겟**: ES2020 (Vite 기본)
- **Polyfill**: 불필요 (모던 브라우저만 지원)

---

## 4. 안정성 요구사항

### NFR-FE-10: 에러 처리
- **Error Boundary**: 페이지 단위 에러 격리 (전체 앱 크래시 방지)
- **API 에러**: 사용자 친화적 메시지 + 토스트 알림
- **네트워크 에러**: 재시도 안내 또는 자동 재시도
- **SSE 연결 끊김**: 자동 재연결 + 상태 표시

### NFR-FE-11: 로딩 상태 관리
- 모든 비동기 작업에 로딩 인디케이터 표시
- 스켈레톤 UI: 대시보드 초기 로딩 시
- 버튼 비활성화: API 호출 중 중복 클릭 방지
- Optimistic Update: 주문 상태 변경 시 즉시 UI 반영

---

## 5. 유지보수성 요구사항

### NFR-FE-12: 코드 품질
- TypeScript strict mode 활성화
- ESLint + Prettier 설정
- 컴포넌트 단위 테스트 (Vitest + React Testing Library)
- 파일/폴더 네이밍 컨벤션: kebab-case (파일), PascalCase (컴포넌트)

### NFR-FE-13: 개발 경험 (DX)
- Vite HMR (Hot Module Replacement)
- TypeScript 자동 완성 및 타입 체크
- 경로 별칭 (`@/` → `src/`)
- 환경 변수 관리 (`.env`, `.env.development`, `.env.production`)
