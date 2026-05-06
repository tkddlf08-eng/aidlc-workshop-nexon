# Admin Frontend - NFR Requirements Plan

## 개요
Unit 3 (Admin Frontend)의 비기능 요구사항 및 기술 스택 결정을 수행합니다.

## Unit 3 NFR 컨텍스트
- **유형**: React SPA (관리자 인터페이스)
- **핵심 NFR 영역**: 성능, SSE 실시간성, 보안(클라이언트), 사용성, 기술 스택
- **특이사항**: SSE 클라이언트, 이미지 업로드, 드래그앤드롭

## Execution Plan

### Phase 1: 성능 요구사항
- [x] 페이지 로딩 성능 기준 정의
- [x] SSE 실시간 반응 성능 기준 정의
- [x] 번들 크기 및 코드 분할 전략

### Phase 2: 보안 요구사항 (클라이언트)
- [x] 토큰 저장 및 관리 전략
- [x] XSS/CSRF 방어 전략
- [x] 민감 데이터 처리 규칙

### Phase 3: 사용성/접근성 요구사항
- [x] 반응형 디자인 기준
- [x] 접근성 (a11y) 수준 정의
- [x] 브라우저 호환성

### Phase 4: 기술 스택 결정
- [x] 빌드 도구 선택
- [x] 스타일링 방식 결정
- [x] 테스트 프레임워크 선택
- [x] 주요 라이브러리 버전 확정

---

## 질문 (Clarification Questions)

### Q1: 스타일링 방식
Admin Frontend의 CSS 스타일링 방식을 어떻게 할까요?

- A) Tailwind CSS — 유틸리티 퍼스트, 빠른 개발, 번들 최적화 우수
- B) CSS Modules — 스코프 격리, 전통적 CSS 작성 방식
- C) styled-components — CSS-in-JS, 동적 스타일링 용이
- D) Vanilla Extract — 타입 안전 CSS, 빌드 타임 생성

[Answer]: A

---

### Q2: 테스트 전략
프론트엔드 테스트를 어떤 수준으로 진행할까요?

- A) 단위 테스트 위주 (Vitest + React Testing Library) — 컴포넌트/스토어 테스트
- B) 단위 + 통합 테스트 (Vitest + RTL + MSW) — API 모킹 포함
- C) 단위 + 통합 + E2E (Vitest + RTL + Playwright) — 전체 흐름 테스트

[Answer]: A

---

### Q3: 빌드 도구
프론트엔드 빌드 도구를 무엇으로 할까요?

- A) Vite — 빠른 HMR, ESM 기반, 현재 React 생태계 표준
- B) Next.js — SSR/SSG 지원, 풀스택 프레임워크
- C) Create React App — 간단한 설정, 하지만 유지보수 중단

[Answer]: A

---

### Q4: 접근성 수준
접근성(a11y) 준수 수준을 어떻게 할까요?

- A) 기본 — 시맨틱 HTML, 키보드 네비게이션, aria-label 기본 적용
- B) WCAG 2.1 AA — 색상 대비, 스크린 리더 지원, 포커스 관리 포함
- C) 최소 — 기능 구현 우선, 접근성은 추후 개선

[Answer]: A

---

### Q5: 브라우저 지원 범위
지원할 브라우저 범위는?

- A) 모던 브라우저만 (Chrome, Firefox, Safari, Edge 최신 2버전)
- B) IE11 포함 레거시 지원
- C) Chrome만 (관리자 전용이므로 브라우저 지정)

[Answer]: A

---

### Q6: 상태 관리 미들웨어
Zustand에 추가 미들웨어를 사용할까요?

- A) persist (localStorage 자동 저장) + devtools (개발 도구)
- B) devtools만 (개발 도구)
- C) 미들웨어 없이 기본 Zustand만

[Answer]: C

---
