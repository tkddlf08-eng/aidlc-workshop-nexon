# Application Design Plan

## 개요
테이블오더 서비스의 컴포넌트 구조, 서비스 레이어, API 설계를 수행합니다.

---

## Clarification Questions

### Question 1
API 설계 스타일은 어떤 것을 선호하시나요?

A) RESTful API (리소스 기반 URL, HTTP 메서드 활용)
B) GraphQL (단일 엔드포인트, 클라이언트가 필요한 데이터만 요청)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
프론트엔드 상태 관리 라이브러리는 어떤 것을 사용하시겠습니까?

A) Zustand (경량, 간단한 API)
B) Redux Toolkit (표준적, 미들웨어 풍부)
C) React Context + useReducer (라이브러리 없이 내장 기능만)
D) Recoil/Jotai (Atom 기반)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
백엔드 프로젝트 구조는 어떤 패턴을 선호하시나요?

A) Layered Architecture (Controller → Service → Repository 계층 분리)
B) Clean Architecture (Domain 중심, 의존성 역전)
C) Feature-based (기능별 모듈 분리: auth/, orders/, menus/)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Execution Plan

답변 확인 후 아래 단계를 순서대로 실행합니다.

### Phase 1: Component Identification
- [x] 백엔드 컴포넌트 식별 및 책임 정의
- [x] 프론트엔드 컴포넌트 식별 및 책임 정의
- [x] 공통/인프라 컴포넌트 식별
- [x] `aidlc-docs/inception/application-design/components.md` 생성

### Phase 2: Component Methods
- [x] 백엔드 API 엔드포인트 설계
- [x] 서비스 레이어 메서드 시그니처 정의
- [x] 프론트엔드 주요 컴포넌트 인터페이스 정의
- [x] `aidlc-docs/inception/application-design/component-methods.md` 생성

### Phase 3: Service Layer Design
- [x] 서비스 오케스트레이션 패턴 정의
- [x] 서비스 간 통신 방식 정의
- [x] `aidlc-docs/inception/application-design/services.md` 생성

### Phase 4: Dependency & Communication
- [x] 컴포넌트 간 의존성 매트릭스 작성
- [x] 데이터 흐름 다이어그램 작성
- [x] `aidlc-docs/inception/application-design/component-dependency.md` 생성

### Phase 5: Consolidation
- [x] 통합 설계 문서 작성
- [x] `aidlc-docs/inception/application-design/application-design.md` 생성

---

답변을 모두 작성하신 후 알려주세요!
