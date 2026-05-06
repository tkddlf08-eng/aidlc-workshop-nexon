# Table Order Backend API

테이블오더 서비스 Backend API (FastAPI + MySQL)

## 빠른 시작

### 1. 환경 설정
```bash
cp .env.example .env
```

### 2. Docker Compose 실행
```bash
# 프로젝트 루트(table-order/)에서 실행
docker-compose up -d
```

### 3. DB 마이그레이션 + 시드 데이터
```bash
# 컨테이너 내부에서 실행
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed.py
```

### 4. API 확인
- Swagger UI: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## 기본 계정

| 구분 | 매장 코드 | 사용자명 | 비밀번호 |
|------|-----------|----------|----------|
| 관리자 | demo-store | admin | admin1234 |

## 개발

### 로컬 실행 (Docker 없이)
```bash
cd backend
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

### 테스트
```bash
pytest --cov=app tests/
```

### 린트
```bash
ruff check app/
ruff format app/
```

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/admin/login | 관리자 로그인 |
| POST | /api/auth/table/login | 테이블 로그인 |
| GET | /api/auth/me | 현재 인증 정보 |
| POST | /api/orders | 주문 생성 |
| GET | /api/orders?session_id= | 주문 목록 |
| PATCH | /api/orders/{id}/status | 주문 상태 변경 |
| DELETE | /api/orders/{id} | 주문 삭제 |
| GET | /api/categories | 카테고리 목록 |
| POST | /api/categories | 카테고리 생성 |
| GET | /api/menus | 메뉴 목록 |
| POST | /api/menus | 메뉴 등록 |
| POST | /api/tables/setup | 테이블 설정 |
| POST | /api/tables/{id}/complete | 이용 완료 |
