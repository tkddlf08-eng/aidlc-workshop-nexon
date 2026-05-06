# Application Design - 통합 설계 문서

## 설계 결정 요약

| 항목 | 결정 |
|------|------|
| API 스타일 | RESTful API |
| 프론트엔드 상태 관리 | Zustand |
| 백엔드 구조 | Feature-based (모듈 내 Layered) |
| 실시간 통신 | Server-Sent Events (SSE) |
| ORM | SQLAlchemy (async) |
| 이미지 저장 | AWS S3 (boto3) |

---

## 시스템 아키텍처

```
+---------------------------------------------------+
|                    Frontend                         |
|  +---------------------+  +---------------------+ |
|  |   Customer App      |  |    Admin App        | |
|  |   (React + Zustand) |  |   (React + Zustand) | |
|  +---------------------+  +---------------------+ |
|            |                        |    ^         |
+------------|------------------------|----|---------+
             | REST                   | REST | SSE
             v                        v    |
+---------------------------------------------------+
|                    Backend (FastAPI)                |
|  +--------+ +--------+ +--------+ +--------+     |
|  |  Auth  | | Orders | | Menus  | | Tables |     |
|  | Module | | Module | | Module | | Module |     |
|  +--------+ +--------+ +--------+ +--------+     |
|       |          |          |          |          |
|  +------------------------------------------------+
|  |              Core Module                       |
|  |  (DB, Config, Security, Middleware)            |
|  +------------------------------------------------+
+---------------------------------------------------+
             |                        |
             v                        v
+-------------------+        +-------------------+
|      MySQL        |        |     AWS S3        |
|   (Data Store)    |        |  (Image Store)    |
+-------------------+        +-------------------+
```

---

## Backend 설계

### Feature Module 내부 구조 (각 모듈 공통)
```
module/
├── router.py       # API 엔드포인트 정의 (Controller 역할)
├── service.py      # 비즈니스 로직
├── repository.py   # 데이터베이스 접근
├── schemas.py      # Pydantic 요청/응답 모델
└── models.py       # SQLAlchemy ORM 모델
```

### 모듈 목록
1. **Auth** — 인증/인가 (JWT, bcrypt, 로그인 제한)
2. **Orders** — 주문 CRUD + SSE 이벤트 발행
3. **Menus** — 메뉴/카테고리 CRUD + S3 이미지
4. **Tables** — 테이블/세션 관리

### 핵심 API 엔드포인트 (총 21개)
- Auth: 4개 (admin login/logout, table login, me)
- Orders: 7개 (CRUD + history + stream)
- Menus: 10개 (category CRUD + menu CRUD + image + sort)
- Tables: 5개 (list, detail, setup, complete, dashboard)

---

## Frontend 설계

### 라우팅 구조
```
/                       → Customer: 메뉴 화면 (홈)
/cart                   → Customer: 장바구니
/order-confirm          → Customer: 주문 확인
/orders                 → Customer: 주문 내역
/setup                  → Customer: 테이블 초기 설정

/admin                  → Admin: 로그인
/admin/dashboard        → Admin: 주문 대시보드
/admin/menus            → Admin: 메뉴 관리
/admin/tables           → Admin: 테이블 관리
```

### 상태 관리 (Zustand Stores)
- **Customer**: `useCartStore`, `useCustomerAuthStore`, `useOrderStore`
- **Admin**: `useAdminAuthStore`, `useAdminOrderStore`, `useMenuStore`

---

## 데이터 모델 (ERD 요약)

```
Store (1) ──── (N) Table (1) ──── (N) TableSession (1) ──── (N) Order (1) ──── (N) OrderItem
                                                                                      |
Category (1) ──── (N) Menu (1) ────────────────────────────────────────────── (N) OrderItem

Admin (1) ──── (1) Store
```

### 핵심 필드
- **Order**: id, table_id, session_id, status, total_amount, is_archived, archived_at, created_at
- **OrderItem**: id, order_id, menu_id, menu_name, quantity, unit_price
- **TableSession**: id, table_id, started_at, ended_at, is_active
- **Menu**: id, category_id, name, price, description, image_url, sort_order, is_available

---

## 상세 설계 문서 참조
- 컴포넌트 정의: `components.md`
- 메서드 시그니처: `component-methods.md`
- 서비스 설계: `services.md`
- 의존성/데이터 흐름: `component-dependency.md`
