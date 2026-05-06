# Tech Stack Decisions — Unit 1 (Backend API)

## 핵심 기술 스택

| 영역 | 기술 | 버전 | 선택 이유 |
|------|------|------|-----------|
| **런타임** | Python | 3.11+ | 비동기 성능 개선, 타입 힌트 완성도 |
| **웹 프레임워크** | FastAPI | 0.100+ | 비동기 네이티브, SSE 지원, 자동 OpenAPI 문서 |
| **ORM** | SQLAlchemy | 2.0+ | 비동기 지원, 타입 안전, Alembic 연동 |
| **DB** | MySQL | 8.0+ | 관계형 데이터, 안정성, 팀 친숙도 |
| **마이그레이션** | Alembic | 1.12+ | SQLAlchemy 공식, autogenerate 지원 |
| **인증** | PyJWT | 2.8+ | 경량 JWT 라이브러리 |
| **해싱** | bcrypt (passlib) | 4.0+ | 업계 표준 비밀번호 해싱 |
| **S3 클라이언트** | boto3 | 1.28+ | AWS 공식 SDK |
| **환경 설정** | pydantic-settings | 2.0+ | 타입 검증 + .env 로딩 |
| **컨테이너** | Docker + Compose | 24+ | 로컬 개발 + 배포 일관성 |

---

## 개발/테스트 도구

| 영역 | 기술 | 용도 |
|------|------|------|
| **테스트** | pytest + pytest-asyncio | 비동기 테스트 지원 |
| **HTTP 테스트** | httpx | FastAPI TestClient 대체 (비동기) |
| **린터/포매터** | ruff | 빠른 린팅 + 포매팅 통합 |
| **타입 체크** | mypy | 정적 타입 분석 (선택) |
| **DB 드라이버** | aiomysql | 비동기 MySQL 드라이버 |
| **커버리지** | pytest-cov | 테스트 커버리지 측정 |

---

## 인프라/운영 도구

| 영역 | 기술 | 용도 |
|------|------|------|
| **Rate Limiting** | slowapi | FastAPI 미들웨어 기반 Rate Limit |
| **로깅** | structlog | 구조화 JSON 로깅 |
| **ASGI 서버** | uvicorn | 프로덕션 ASGI 서버 |
| **프로세스 관리** | gunicorn + uvicorn workers | 멀티 워커 (프로덕션) |
| **스케줄러** | APScheduler | Soft Delete 자동 정리 배치 |
| **헬스체크** | 커스텀 엔드포인트 | /health (DB + S3 확인) |

---

## 프로젝트 구조 (확정)

```
table-order/backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 앱 생성, 미들웨어, 라우터 등록
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # pydantic-settings 환경 설정
│   │   ├── database.py         # SQLAlchemy 엔진, 세션 팩토리
│   │   ├── security.py         # JWT 생성/검증, bcrypt 유틸
│   │   ├── dependencies.py     # FastAPI 의존성 (get_db, get_current_user)
│   │   ├── exceptions.py       # 커스텀 예외 클래스
│   │   ├── logging.py          # structlog 설정
│   │   └── s3.py               # S3 클라이언트 래퍼
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── router.py           # 인증 API 엔드포인트
│   │   ├── service.py          # 인증 비즈니스 로직
│   │   ├── repository.py       # Admin/Table DB 접근
│   │   ├── schemas.py          # Pydantic 요청/응답 모델
│   │   └── models.py           # SQLAlchemy 모델 (Admin, Store)
│   ├── orders/
│   │   ├── __init__.py
│   │   ├── router.py           # 주문 API 엔드포인트
│   │   ├── service.py          # 주문 비즈니스 로직
│   │   ├── repository.py       # Order/OrderItem DB 접근
│   │   ├── schemas.py          # Pydantic 모델
│   │   ├── models.py           # SQLAlchemy 모델 (Order, OrderItem)
│   │   └── sse.py              # SSE 매니저 (연결 관리, 이벤트 발행)
│   ├── menus/
│   │   ├── __init__.py
│   │   ├── router.py           # 메뉴/카테고리 API 엔드포인트
│   │   ├── service.py          # 메뉴 비즈니스 로직
│   │   ├── repository.py       # Menu/Category DB 접근
│   │   ├── schemas.py          # Pydantic 모델
│   │   └── models.py           # SQLAlchemy 모델 (Menu, Category)
│   └── tables/
│       ├── __init__.py
│       ├── router.py           # 테이블 API 엔드포인트
│       ├── service.py          # 테이블/세션 비즈니스 로직
│       ├── repository.py       # Table/Session DB 접근
│       ├── schemas.py          # Pydantic 모델
│       └── models.py           # SQLAlchemy 모델 (Table, TableSession, SessionRevenue)
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # 테스트 픽스처 (DB, 클라이언트)
│   ├── test_auth/
│   ├── test_orders/
│   ├── test_menus/
│   └── test_tables/
├── alembic/
│   ├── env.py
│   ├── versions/               # 마이그레이션 파일
│   └── alembic.ini
├── requirements.txt            # 프로덕션 의존성
├── requirements-dev.txt        # 개발 의존성 (pytest, ruff 등)
├── Dockerfile
├── docker-compose.yml
├── .env.example                # 환경 변수 템플릿
└── README.md
```

---

## 의존성 목록

### requirements.txt (프로덕션)
```
fastapi>=0.100.0
uvicorn[standard]>=0.23.0
gunicorn>=21.2.0
sqlalchemy[asyncio]>=2.0.0
aiomysql>=0.2.0
alembic>=1.12.0
pydantic-settings>=2.0.0
pyjwt>=2.8.0
passlib[bcrypt]>=1.7.4
boto3>=1.28.0
python-multipart>=0.0.6
slowapi>=0.1.9
structlog>=23.1.0
apscheduler>=3.10.0
sse-starlette>=1.6.0
```

### requirements-dev.txt (개발)
```
pytest>=7.4.0
pytest-asyncio>=0.21.0
pytest-cov>=4.1.0
httpx>=0.24.0
ruff>=0.1.0
mypy>=1.5.0
```

---

## Docker 구성

### docker-compose.yml 구조
```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [db]
    env_file: .env
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: mysql:8.0
    ports: ["3306:3306"]
    volumes: [mysql_data:/var/lib/mysql]
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}

volumes:
  mysql_data:
```

---

## 환경 변수 (.env.example)

```bash
# Application
APP_ENV=development
APP_DEBUG=true
APP_HOST=0.0.0.0
APP_PORT=8000

# Database
DB_HOST=db
DB_PORT=3306
DB_NAME=table_order
DB_USER=root
DB_PASSWORD=devpassword
DB_POOL_MIN=5
DB_POOL_MAX=20

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ADMIN_EXPIRE_HOURS=16

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=table-order-images

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_AUTH=10/minute
RATE_LIMIT_GENERAL=120/minute
RATE_LIMIT_MUTATION=60/minute
```
