# Unit of Work 정의

## 유닛 분리 전략

3명 팀에서 병렬 개발이 가능하도록 **기능 도메인 기반**으로 3개 유닛으로 분리합니다.

| Unit | 담당 영역 | 핵심 기술 |
|------|-----------|-----------|
| Unit 1 | Backend API | Python, FastAPI, MySQL, SSE |
| Unit 2 | Customer Frontend | React, TypeScript, Zustand |
| Unit 3 | Admin Frontend | React, TypeScript, Zustand, SSE Client |

---

## Unit 1: Backend API

### 책임
- 전체 RESTful API 구현 (21개 엔드포인트)
- 데이터베이스 스키마 설계 및 마이그레이션
- 비즈니스 로직 (주문 상태 관리, 세션 관리)
- SSE 서버 구현
- JWT 인증/인가
- S3 이미지 업로드
- API 문서 (Swagger/OpenAPI 자동 생성)

### 포함 모듈
- `backend/app/core/` — 공통 인프라
- `backend/app/auth/` — 인증 모듈
- `backend/app/orders/` — 주문 모듈
- `backend/app/menus/` — 메뉴 모듈
- `backend/app/tables/` — 테이블 모듈

### 산출물
- FastAPI 애플리케이션
- MySQL 스키마 (SQLAlchemy models + Alembic migrations)
- API 테스트 (pytest)
- Docker 설정 (backend + MySQL)
- 환경 설정 (.env)

---

## Unit 2: Customer Frontend

### 책임
- 고객용 웹 인터페이스 전체 구현
- 메뉴 탐색 UI (카테고리별 카드 레이아웃)
- 장바구니 관리 (로컬 저장, 수량 조절)
- 주문 생성 및 확인 플로우
- 주문 내역 조회
- 테이블 자동 로그인 / 초기 설정
- 터치 친화적 반응형 UI

### 포함 모듈
- `frontend/src/customer/pages/` — 고객 페이지
- `frontend/src/customer/components/` — 고객 전용 컴포넌트
- `frontend/src/customer/stores/` — Zustand stores (cart, auth, order)
- `frontend/src/shared/` — 공통 컴포넌트/유틸 (Unit 3과 공유)

### 산출물
- React SPA (고객 영역)
- 공통 컴포넌트 라이브러리 (shared/)
- API 클라이언트 설정
- 컴포넌트 테스트

---

## Unit 3: Admin Frontend

### 책임
- 관리자용 웹 인터페이스 전체 구현
- 로그인/세션 관리 UI
- 실시간 주문 대시보드 (SSE 클라이언트)
- 주문 상태 변경 UI
- 테이블 관리 (이용 완료, 주문 삭제, 과거 내역)
- 메뉴/카테고리 관리 (CRUD, 이미지 업로드, 순서 조정)

### 포함 모듈
- `frontend/src/admin/pages/` — 관리자 페이지
- `frontend/src/admin/components/` — 관리자 전용 컴포넌트
- `frontend/src/admin/stores/` — Zustand stores (auth, orders, menus)
- `frontend/src/shared/` — 공통 컴포넌트/유틸 (Unit 2와 공유)

### 산출물
- React SPA (관리자 영역)
- SSE 클라이언트 구현
- 대시보드 그리드 레이아웃
- 컴포넌트 테스트

---

## 코드 조직 전략

```
table-order/
├── backend/                    ← Unit 1 담당
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── menus/
│   │   └── tables/
│   ├── tests/
│   ├── alembic/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   ← Unit 2 + Unit 3 공동 (영역 분리)
│   ├── src/
│   │   ├── customer/           ← Unit 2 담당
│   │   ├── admin/              ← Unit 3 담당
│   │   ├── shared/             ← Unit 2 + Unit 3 공동
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml          ← Unit 1 초기 설정
└── README.md
```

---

## 팀원 역할 제안

| 팀원 | Unit | 주요 스킬 요구 |
|------|------|----------------|
| 팀원 A | Unit 1 (Backend) | Python, FastAPI, SQL, AWS |
| 팀원 B | Unit 2 (Customer FE) | React, TypeScript, CSS, UX |
| 팀원 C | Unit 3 (Admin FE) | React, TypeScript, SSE, 대시보드 |
