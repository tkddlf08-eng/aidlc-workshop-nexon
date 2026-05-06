# Unit 1 (Backend API) - Code Generation Plan

## Unit Context
- **Unit**: Backend API (Unit 1)
- **기술 스택**: Python 3.11, FastAPI, SQLAlchemy 2.0, MySQL 8.0, Alembic
- **코드 위치**: `table-order/backend/`
- **스토리 수**: 19개 (Must 16 / Should 3)
- **로컬 개발**: Docker Compose (S3 대신 로컬 파일 저장)

## 생성 순서

---

### Step 1: 프로젝트 구조 및 설정 파일 생성
- [ ] `table-order/backend/` 디렉토리 구조 생성
- [ ] `requirements.txt`, `requirements-dev.txt`
- [ ] `Dockerfile`, `Dockerfile.prod`
- [ ] `table-order/docker-compose.yml`
- [ ] `.env.example`
- [ ] `app/__init__.py`, `app/main.py` (FastAPI 앱 초기화)
- [ ] `app/core/config.py` (pydantic-settings)
- [ ] `app/core/database.py` (SQLAlchemy 엔진, 세션)
- [ ] `app/core/logging.py` (structlog 설정)
- [ ] `app/core/exceptions.py` (커스텀 예외)
- [ ] `app/core/dependencies.py` (공통 의존성)

**커버 스토리**: 전체 인프라 기반

---

### Step 2: 인증/보안 모듈 생성
- [ ] `app/core/security.py` (JWT 생성/검증, bcrypt)
- [ ] `app/auth/models.py` (Admin, Store SQLAlchemy 모델)
- [ ] `app/auth/schemas.py` (Pydantic 요청/응답 모델)
- [ ] `app/auth/repository.py` (Admin/Store DB 접근)
- [ ] `app/auth/service.py` (인증 비즈니스 로직, 로그인 제한)
- [ ] `app/auth/router.py` (인증 API 엔드포인트)

**커버 스토리**: US-C01, US-A01, US-A02

---

### Step 3: 인증 모듈 테스트
- [ ] `tests/conftest.py` (테스트 픽스처, DB, 클라이언트)
- [ ] `tests/test_auth/test_admin_login.py`
- [ ] `tests/test_auth/test_table_login.py`
- [ ] `tests/test_auth/test_login_attempts.py`

---

### Step 4: 테이블/세션 모듈 생성
- [ ] `app/tables/models.py` (TableEntity, TableSession, SessionRevenue)
- [ ] `app/tables/schemas.py`
- [ ] `app/tables/repository.py`
- [ ] `app/tables/service.py` (세션 관리, 이용 완료, 대시보드)
- [ ] `app/tables/router.py`

**커버 스토리**: US-A07, US-A09, US-A10

---

### Step 5: 테이블 모듈 테스트
- [ ] `tests/test_tables/test_setup.py`
- [ ] `tests/test_tables/test_session.py`
- [ ] `tests/test_tables/test_complete.py`

---

### Step 6: 메뉴/카테고리 모듈 생성
- [ ] `app/menus/models.py` (Menu, Category)
- [ ] `app/menus/schemas.py`
- [ ] `app/menus/repository.py`
- [ ] `app/menus/service.py` (CRUD, 이미지 업로드, 순서 관리)
- [ ] `app/menus/router.py`
- [ ] `app/core/storage.py` (LocalStorage + S3 인터페이스)

**커버 스토리**: US-C03, US-C04, US-A11, US-A12, US-A13, US-A14

---

### Step 7: 메뉴 모듈 테스트
- [ ] `tests/test_menus/test_categories.py`
- [ ] `tests/test_menus/test_menus_crud.py`
- [ ] `tests/test_menus/test_menu_order.py`
- [ ] `tests/test_menus/test_image_upload.py`

---

### Step 8: 주문 모듈 생성
- [ ] `app/orders/models.py` (Order, OrderItem)
- [ ] `app/orders/schemas.py`
- [ ] `app/orders/repository.py`
- [ ] `app/orders/service.py` (주문 생성, 상태 전이, 삭제)
- [ ] `app/orders/router.py`

**커버 스토리**: US-C07, US-C08, US-C09, US-C10, US-A05, US-A08

---

### Step 9: 주문 모듈 테스트
- [ ] `tests/test_orders/test_create_order.py`
- [ ] `tests/test_orders/test_status_transition.py`
- [ ] `tests/test_orders/test_delete_order.py`
- [ ] `tests/test_orders/test_order_list.py`

---

### Step 10: SSE 실시간 이벤트 모듈 생성
- [ ] `app/orders/sse.py` (SSEManager — 채널 관리, 브로드캐스트)
- [ ] SSE 엔드포인트 (`GET /api/orders/stream`)
- [ ] 고객 SSE 엔드포인트 (`GET /api/orders/table-stream`)

**커버 스토리**: US-A04

---

### Step 11: SSE 모듈 테스트
- [ ] `tests/test_orders/test_sse.py`

---

### Step 12: 배치 작업 (Scheduler) 생성
- [ ] `app/core/scheduler.py` (APScheduler 설정)
- [ ] `app/core/tasks.py` (cleanup_deleted_orders, cleanup_deleted_menus)

---

### Step 13: DB 마이그레이션 설정
- [ ] `alembic.ini`
- [ ] `alembic/env.py`
- [ ] 초기 마이그레이션 생성 (전체 스키마)
- [ ] `scripts/seed.py` (초기 데이터: Store + Admin)

---

### Step 14: 통합 및 최종 설정
- [ ] `app/main.py` 완성 (모든 라우터 등록, 미들웨어, lifespan)
- [ ] 헬스체크 엔드포인트 (`GET /health`)
- [ ] CORS 설정
- [ ] Rate Limiting 설정
- [ ] `README.md` (실행 방법, API 문서 링크)

---

### Step 15: 코드 생성 요약 문서
- [ ] `aidlc-docs/construction/backend/code/code-generation-summary.md`

---

## 스토리 커버리지 매핑

| Step | 커버 스토리 |
|------|------------|
| 1 | (인프라 기반) |
| 2-3 | US-C01, US-A01, US-A02 |
| 4-5 | US-A07, US-A09, US-A10 |
| 6-7 | US-C03, US-C04, US-A11, US-A12, US-A13, US-A14 |
| 8-9 | US-C07, US-C08, US-C09, US-C10, US-A05, US-A08 |
| 10-11 | US-A04 |
| 12 | (운영 기능) |
| 13 | (DB 인프라) |
| 14 | (통합) |

**전체 19개 스토리 100% 커버리지**
