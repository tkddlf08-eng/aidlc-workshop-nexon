# 컴포넌트 의존성 (Component Dependencies)

## 의존성 매트릭스

### Backend Module Dependencies

| Module | Auth | Orders | Menus | Tables | Core |
|--------|:----:|:------:|:-----:|:------:|:----:|
| **Auth** | - | | | ○ | ● |
| **Orders** | ● | - | | ● | ● |
| **Menus** | ● | | - | | ● |
| **Tables** | ● | ○ | | - | ● |
| **Core** | | | | | - |

- ● = 직접 의존 (import)
- ○ = 간접 의존 (서비스 호출)

### Frontend Dependencies

| Component | Customer App | Admin App | Shared |
|-----------|:-----------:|:---------:|:------:|
| **Customer App** | - | | ● |
| **Admin App** | | - | ● |
| **Shared** | | | - |

---

## 데이터 흐름

### 고객 주문 흐름
```
Customer UI                    Backend                         Database
    |                             |                              |
    |-- POST /api/orders -------->|                              |
    |                             |-- get_or_create_session ---->|
    |                             |<-- session ------------------|
    |                             |-- create order ------------->|
    |                             |<-- order --------------------|
    |                             |-- SSE broadcast ------------>| (Admin)
    |<-- 201 + order -------------|                              |
    |                             |                              |
```

### 관리자 실시간 모니터링 흐름
```
Admin UI                       Backend                         Database
    |                             |                              |
    |-- GET /api/orders/stream -->|                              |
    |<== SSE connection ==========>|                              |
    |                             |                              |
    |   [Customer creates order]  |                              |
    |                             |-- save order --------------->|
    |<== SSE: new_order ==========>|                              |
    |                             |                              |
    |-- PATCH /orders/{id}/status->|                              |
    |                             |-- update status ------------>|
    |<-- 200 + updated order -----|                              |
    |                             |                              |
```

### 이미지 업로드 흐름
```
Admin UI                    Backend                    AWS S3
    |                          |                         |
    |-- POST /menus/{id}/image->|                         |
    |                          |-- upload file --------->|
    |                          |<-- S3 URL --------------|
    |                          |-- save URL to DB        |
    |<-- 200 + image_url ------|                         |
    |                          |                         |
```

---

## 통신 패턴

| 통신 | 방식 | 용도 |
|------|------|------|
| Frontend → Backend | REST (HTTP) | CRUD 작업, 인증 |
| Backend → Frontend (Admin) | SSE (단방향) | 실시간 주문 알림 |
| Backend → Database | SQLAlchemy ORM | 데이터 영속화 |
| Backend → S3 | AWS SDK (boto3) | 이미지 업로드/URL 생성 |

---

## 프로젝트 디렉토리 구조

```
table-order/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── core/
│   │   │   ├── config.py        # 환경 설정
│   │   │   ├── database.py      # DB 연결
│   │   │   ├── security.py      # JWT, 해싱
│   │   │   └── exceptions.py    # 공통 예외
│   │   ├── auth/
│   │   │   ├── router.py        # API endpoints
│   │   │   ├── service.py       # Business logic
│   │   │   ├── repository.py    # DB queries
│   │   │   ├── schemas.py       # Pydantic models
│   │   │   └── models.py        # SQLAlchemy models
│   │   ├── orders/
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   ├── schemas.py
│   │   │   ├── models.py
│   │   │   └── sse.py           # SSE manager
│   │   ├── menus/
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   ├── schemas.py
│   │   │   ├── models.py
│   │   │   └── s3.py            # S3 upload
│   │   └── tables/
│   │       ├── router.py
│   │       ├── service.py
│   │       ├── repository.py
│   │       ├── schemas.py
│   │       └── models.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── customer/
│   │   │   ├── pages/           # 고객 페이지
│   │   │   ├── components/      # 고객 전용 컴포넌트
│   │   │   └── stores/          # Zustand stores
│   │   ├── admin/
│   │   │   ├── pages/           # 관리자 페이지
│   │   │   ├── components/      # 관리자 전용 컴포넌트
│   │   │   └── stores/          # Zustand stores
│   │   ├── shared/
│   │   │   ├── components/      # 공통 UI
│   │   │   ├── api/             # API client
│   │   │   ├── types/           # TypeScript types
│   │   │   └── utils/           # 유틸리티
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```
