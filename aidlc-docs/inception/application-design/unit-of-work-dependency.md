# Unit of Work 의존성

## 의존성 매트릭스

| | Unit 1 (Backend) | Unit 2 (Customer FE) | Unit 3 (Admin FE) |
|---|:---:|:---:|:---:|
| **Unit 1 (Backend)** | - | | |
| **Unit 2 (Customer FE)** | ● API 호출 | - | ○ shared/ 공유 |
| **Unit 3 (Admin FE)** | ● API + SSE | ○ shared/ 공유 | - |

- ● = 직접 의존 (런타임)
- ○ = 코드 공유 (빌드타임)

---

## 의존성 상세

### Unit 2 → Unit 1
- REST API 호출 (메뉴 조회, 주문 생성, 주문 내역)
- 테이블 인증 API

### Unit 3 → Unit 1
- REST API 호출 (주문 관리, 메뉴 CRUD, 테이블 관리)
- SSE 스트림 연결 (실시간 주문 알림)
- 관리자 인증 API

### Unit 2 ↔ Unit 3
- `frontend/src/shared/` 디렉토리 공유
- 공통 타입 정의, API 클라이언트, UI 컴포넌트

---

## 개발 순서 전략

```
Week 1-2:  [Unit 1: API 기본 구조 + DB 스키마]
           [Unit 2: UI 컴포넌트 + Mock 데이터]
           [Unit 3: UI 컴포넌트 + Mock 데이터]

Week 3:    [Unit 1: API 완성]
           [Unit 2: API 연동]
           [Unit 3: API + SSE 연동]

Week 4:    [통합 테스트 + 버그 수정]
```

### 병렬화 전략

**Phase 1 (병렬 가능)**: 3개 유닛 동시 시작
- Unit 1: DB 스키마 + 기본 CRUD API
- Unit 2: 메뉴/장바구니 UI (Mock API 사용)
- Unit 3: 대시보드 레이아웃 (Mock 데이터 사용)

**Phase 2 (부분 의존)**: Unit 1 API 완성 후 연동
- Unit 2: 실제 API 연동 + 주문 플로우
- Unit 3: 실제 API + SSE 연동

**Phase 3 (통합)**: 전체 통합 테스트
- 3개 유닛 통합 동작 확인
- E2E 테스트

---

## 인터페이스 계약 (API Contract)

프론트엔드 유닛이 백엔드 완성 전에 개발을 시작할 수 있도록:

1. **Unit 1이 먼저 제공할 것**:
   - OpenAPI 스펙 (Swagger JSON) — API 계약 정의
   - Pydantic 스키마 — 요청/응답 형식

2. **Unit 2, 3이 사용할 것**:
   - Mock 서버 또는 MSW (Mock Service Worker)로 개발
   - OpenAPI 스펙 기반 타입 자동 생성

---

## 리스크 및 조율 포인트

| 리스크 | 영향 유닛 | 완화 방안 |
|--------|-----------|-----------|
| API 스펙 변경 | Unit 2, 3 | OpenAPI 스펙 먼저 확정, 변경 시 즉시 공유 |
| shared/ 충돌 | Unit 2, 3 | 공통 컴포넌트는 한 명이 주도, PR 리뷰 |
| SSE 구현 지연 | Unit 3 | Polling fallback 준비 |
| DB 스키마 변경 | Unit 1 | Alembic migration으로 관리 |

---

## 커뮤니케이션 포인트

- **Daily**: API 스펙 변경 사항 공유
- **Weekly**: 통합 테스트 실행
- **Shared Repo**: 단일 모노레포 (table-order/) 사용, 브랜치 전략으로 충돌 방지
