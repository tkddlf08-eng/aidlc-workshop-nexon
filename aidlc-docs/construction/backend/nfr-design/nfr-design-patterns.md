# NFR Design Patterns — Unit 1 (Backend API)

## 1. 성능 패턴 (Performance Patterns)

### 1.1 비동기 I/O 패턴
**적용 대상**: 모든 DB 접근, S3 업로드, SSE 이벤트 발행

```python
# 패턴: async/await 기반 비차단 I/O
async def create_order(self, data: OrderCreate) -> Order:
    async with self.db.begin():
        order = await self.repository.create(data)
        await self.sse_manager.broadcast("new_order", order)
    return order
```

**효과**: 단일 워커에서도 동시 요청 처리 가능. I/O 대기 중 다른 요청 처리.

### 1.2 연결 풀링 패턴
**적용 대상**: MySQL 연결 관리

```python
# SQLAlchemy 비동기 엔진 설정
engine = create_async_engine(
    DATABASE_URL,
    pool_size=5,          # 최소 연결
    max_overflow=15,      # 최대 추가 연결 (총 20)
    pool_timeout=30,      # 연결 대기 타임아웃
    pool_recycle=3600,    # 1시간마다 연결 갱신
    pool_pre_ping=True,   # 사용 전 연결 상태 확인
)
```

**효과**: 연결 생성/해제 오버헤드 제거. 최대 20 동시 쿼리 지원.

### 1.3 쿼리 최적화 패턴
**적용 대상**: 대시보드, 주문 목록 조회

```python
# 패턴: Eager Loading (N+1 문제 방지)
stmt = (
    select(Order)
    .options(selectinload(Order.items))  # 주문 항목 한 번에 로드
    .where(Order.session_id == session_id)
    .where(Order.is_deleted == False)
    .order_by(Order.created_at.desc())
    .limit(limit)
    .offset(offset)
)
```

**효과**: N+1 쿼리 방지. 대시보드 조회 시 쿼리 수 최소화.

### 1.4 페이지네이션 패턴
**적용 대상**: 주문 목록, 과거 내역 조회

```python
# 패턴: Offset-based Pagination
class PaginationParams:
    page: int = Query(1, ge=1)
    limit: int = Query(10, ge=1, le=50)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit
```

**효과**: 대량 데이터 조회 시 메모리/응답 시간 제어.

---

## 2. 보안 패턴 (Security Patterns)

### 2.1 미들웨어 인증 패턴
**적용 대상**: 모든 보호된 엔드포인트

```python
# 패턴: FastAPI Dependency Injection 기반 인증
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> UserInfo:
    payload = verify_jwt_token(token)
    if payload is None:
        raise HTTPException(401, "Invalid token")
    return UserInfo(**payload)

# 관리자 전용 엔드포인트
async def get_current_admin(
    user: UserInfo = Depends(get_current_user)
) -> UserInfo:
    if user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return user
```

**효과**: 인증 로직 중앙화. 엔드포인트별 권한 분리 명확.

### 2.2 Rate Limiting 패턴
**적용 대상**: 엔드포인트별 차등 적용

```python
# 패턴: slowapi 미들웨어 + 엔드포인트별 데코레이터
limiter = Limiter(key_func=get_remote_address)

@router.post("/auth/admin/login")
@limiter.limit("10/minute")
async def admin_login(request: Request, ...):
    ...

@router.get("/menus")
@limiter.limit("120/minute")
async def get_menus(request: Request, ...):
    ...
```

**효과**: brute force 방어 + 일반 사용에 영향 없는 차등 제한.

### 2.3 입력 검증 패턴
**적용 대상**: 모든 API 요청

```python
# 패턴: Pydantic 모델 기반 자동 검증
class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(..., min_length=1)

class OrderItemCreate(BaseModel):
    menu_id: int = Field(..., gt=0)
    quantity: int = Field(..., ge=1, le=99)

# FastAPI가 자동으로 422 에러 반환 (검증 실패 시)
```

**효과**: 비즈니스 로직 진입 전 잘못된 데이터 차단. SQL Injection 원천 방지.

### 2.4 비밀번호 보안 패턴
**적용 대상**: 관리자/테이블 비밀번호

```python
# 패턴: passlib + bcrypt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

**효과**: 타이밍 공격 방지 (constant-time 비교). 레인보우 테이블 무력화.

---

## 3. 신뢰성 패턴 (Reliability Patterns)

### 3.1 트랜잭션 패턴
**적용 대상**: 주문 생성, 이용 완료 등 복합 작업

```python
# 패턴: Context Manager 기반 트랜잭션
async def complete_table_session(self, table_id: int):
    async with self.db.begin():  # 자동 commit/rollback
        # 1. 주문 아카이빙
        await self.order_repo.archive_session_orders(session_id)
        # 2. 매출 집계
        revenue = await self.order_repo.calculate_session_revenue(session_id)
        await self.revenue_repo.create(revenue)
        # 3. 세션 종료
        await self.session_repo.close_session(session_id)
    # 트랜잭션 성공 후 SSE 이벤트 발행
    await self.sse_manager.broadcast("table_reset", {"table_id": table_id})
```

**효과**: 부분 실패 방지. 데이터 일관성 보장.

### 3.2 재시도 패턴
**적용 대상**: DB 연결 실패, S3 업로드 실패

```python
# 패턴: Exponential Backoff 재시도
async def upload_with_retry(self, file, key: str, max_retries: int = 2):
    for attempt in range(max_retries + 1):
        try:
            return await self.s3_client.upload_fileobj(file, self.bucket, key)
        except ClientError as e:
            if attempt == max_retries:
                raise
            await asyncio.sleep(2 ** attempt)  # 1초, 2초 대기
```

**효과**: 일시적 네트워크 오류 자동 복구. 사용자 경험 개선.

### 3.3 Graceful Degradation 패턴
**적용 대상**: SSE 연결, S3 접근

```python
# 패턴: 핵심 기능은 유지, 부가 기능 실패 허용
async def create_order(self, data: OrderCreate) -> Order:
    # 핵심: 주문 생성 (실패 시 에러 반환)
    order = await self.repository.create(data)

    # 부가: SSE 알림 (실패해도 주문은 성공)
    try:
        await self.sse_manager.broadcast("new_order", order)
    except Exception as e:
        logger.warning("SSE broadcast failed", error=str(e))

    return order
```

**효과**: SSE 장애가 주문 생성을 막지 않음. 핵심 비즈니스 보호.

### 3.4 헬스체크 패턴
**적용 대상**: 애플리케이션 상태 모니터링

```python
# 패턴: 의존성별 상태 확인
@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    checks = {"status": "healthy", "db": "ok", "s3": "ok"}
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        checks["db"] = "error"
        checks["status"] = "unhealthy"
    try:
        await s3_client.head_bucket(Bucket=settings.S3_BUCKET)
    except Exception:
        checks["s3"] = "error"
        checks["status"] = "degraded"
    status_code = 200 if checks["status"] == "healthy" else 503
    return JSONResponse(checks, status_code=status_code)
```

**효과**: Docker healthcheck + 로드밸런서 연동. 장애 자동 감지.

---

## 4. 관측성 패턴 (Observability Patterns)

### 4.1 구조화 로깅 패턴
**적용 대상**: 전체 애플리케이션

```python
# 패턴: structlog + request_id 추적
import structlog

logger = structlog.get_logger()

# 미들웨어에서 request_id 주입
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid4())
    structlog.contextvars.bind_contextvars(request_id=request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# 사용
logger.info("order_created", order_id=order.id, table_id=table_id)
```

**출력 예시**:
```json
{"event": "order_created", "order_id": 1, "table_id": 3, "request_id": "abc-123", "timestamp": "2026-05-06T12:30:00Z", "level": "info"}
```

**효과**: 요청 추적 가능. JSON 파싱으로 검색/필터링 용이.

### 4.2 슬로우 쿼리 감지 패턴
**적용 대상**: 모든 DB 쿼리

```python
# 패턴: SQLAlchemy 이벤트 리스너
from sqlalchemy import event

@event.listens_for(engine.sync_engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, ...):
    conn.info["query_start_time"] = time.time()

@event.listens_for(engine.sync_engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, ...):
    elapsed = time.time() - conn.info["query_start_time"]
    if elapsed > 1.0:
        logger.warning("slow_query", duration=elapsed, query=statement[:200])
```

**효과**: 1초 이상 쿼리 자동 감지. 성능 병목 조기 발견.

---

## 5. SSE 패턴 (Real-time Communication)

### 5.1 채널 기반 SSE 매니저 패턴
**적용 대상**: 실시간 주문 알림

```python
# 패턴: 인메모리 채널 관리
class SSEManager:
    def __init__(self):
        self._admin_clients: dict[str, asyncio.Queue] = {}
        self._table_clients: dict[int, asyncio.Queue] = {}

    async def subscribe_admin(self, client_id: str) -> AsyncGenerator:
        queue = asyncio.Queue()
        self._admin_clients[client_id] = queue
        try:
            while True:
                event = await queue.get()
                yield event
        finally:
            del self._admin_clients[client_id]

    async def subscribe_table(self, table_id: int) -> AsyncGenerator:
        queue = asyncio.Queue()
        self._table_clients[table_id] = queue
        try:
            while True:
                event = await queue.get()
                yield event
        finally:
            del self._table_clients[table_id]

    async def broadcast_admin(self, event_type: str, data: dict):
        for queue in self._admin_clients.values():
            await queue.put(ServerSentEvent(data=json.dumps(data), event=event_type))

    async def notify_table(self, table_id: int, event_type: str, data: dict):
        if table_id in self._table_clients:
            await self._table_clients[table_id].put(
                ServerSentEvent(data=json.dumps(data), event=event_type)
            )
```

**효과**: 관리자 전체 브로드캐스트 + 고객 테이블별 격리. 메모리 효율적.

### 5.2 Heartbeat 패턴
**적용 대상**: SSE 연결 유지

```python
# 패턴: 주기적 ping으로 연결 상태 확인
async def sse_stream(self, client_id: str) -> AsyncGenerator:
    async for event in self.subscribe_admin(client_id):
        yield event
    # 별도 태스크로 30초마다 ping
    # 클라이언트가 응답 없으면 연결 정리
```

**효과**: 프록시/로드밸런서 타임아웃 방지. 죽은 연결 자동 정리.

---

## 6. 환경 설정 패턴 (Configuration)

### 6.1 계층형 설정 패턴
**적용 대상**: 환경별 설정 관리

```python
# 패턴: pydantic-settings + 환경별 오버라이드
class Settings(BaseSettings):
    # Application
    app_env: str = "development"
    app_debug: bool = True

    # Database
    db_host: str = "localhost"
    db_port: int = 3306
    db_pool_min: int = 5
    db_pool_max: int = 20

    # JWT
    jwt_secret_key: str = "dev-secret-change-me"
    jwt_admin_expire_hours: int = 16

    # S3
    s3_bucket_name: str = "table-order-images"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

settings = Settings()
```

**효과**: 환경 변수 우선 → .env 파일 → 기본값 순서. 타입 자동 검증.

---

## 7. 에러 처리 패턴 (Error Handling)

### 7.1 계층형 예외 패턴
**적용 대상**: 전체 애플리케이션

```python
# 패턴: 도메인 예외 → HTTP 예외 변환
class AppException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

class OrderStatusError(AppException):
    def __init__(self, current: str, target: str):
        super().__init__(
            code="INVALID_STATUS_TRANSITION",
            message=f"{current}에서 {target}로 변경할 수 없습니다",
            status_code=409
        )

# 글로벌 예외 핸들러
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}}
    )
```

**효과**: 비즈니스 예외와 HTTP 응답 분리. 일관된 에러 형식.
