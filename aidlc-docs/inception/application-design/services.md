# 서비스 설계 (Services)

## 서비스 레이어 개요

각 Feature Module 내부에서 Layered 패턴을 적용합니다:
```
Router (API Endpoint) → Service (Business Logic) → Repository (DB Access)
```

---

## 서비스 정의

### 1. AuthService
**책임**: 인증/인가 로직 처리
- 관리자 자격 증명 검증
- 테이블 태블릿 자격 증명 검증
- JWT 토큰 생성/검증/갱신
- 로그인 시도 횟수 관리 및 차단

**의존성**: AdminRepository, TableRepository, JWTUtil, PasswordHasher

---

### 2. OrderService
**책임**: 주문 비즈니스 로직 처리
- 주문 생성 (세션 확인/생성 포함)
- 주문 상태 전이 검증 (단방향: PENDING → PREPARING → COMPLETED)
- 주문 삭제 및 총액 재계산
- 과거 주문 이력 조회
- SSE 이벤트 발행

**의존성**: OrderRepository, TableSessionService, SSEManager

---

### 3. MenuService
**책임**: 메뉴/카테고리 관리 로직
- 메뉴 CRUD 및 검증 (필수 필드, 가격 범위)
- 카테고리 CRUD 및 검증 (중복명, 삭제 제약)
- 이미지 업로드 처리 (S3)
- 노출 순서 관리

**의존성**: MenuRepository, CategoryRepository, S3Client

---

### 4. TableService
**책임**: 테이블 및 세션 관리 로직
- 테이블 초기 설정
- 세션 라이프사이클 관리 (생성/종료)
- 이용 완료 처리 (주문 아카이빙)
- 대시보드 데이터 집계

**의존성**: TableRepository, TableSessionRepository, OrderRepository

---

### 5. SSEManager
**책임**: Server-Sent Events 연결 관리
- 클라이언트 연결 등록/해제
- 이벤트 브로드캐스트
- 연결 상태 모니터링
- 재연결 지원

**의존성**: 없음 (인메모리 연결 관리)

---

## 서비스 오케스트레이션 패턴

### 주문 생성 흐름
```
1. OrderRouter.create_order() 호출
2. AuthMiddleware → 테이블 인증 확인
3. OrderService.create_order()
   3.1 TableService.get_or_create_session(table_id) → session
   3.2 OrderRepository.create(order_data) → order
   3.3 SSEManager.broadcast("new_order", order)
4. Response → 201 Created + order data
```

### 테이블 이용 완료 흐름
```
1. TableRouter.complete_table() 호출
2. AuthMiddleware → 관리자 인증 확인
3. TableService.complete_table_session(table_id)
   3.1 OrderRepository.archive_session_orders(session_id)
   3.2 TableSessionRepository.close_session(session_id)
   3.3 SSEManager.broadcast("table_reset", table_id)
4. Response → 200 OK
```

### SSE 실시간 스트림 흐름
```
1. Client → GET /api/orders/stream (EventSource)
2. AuthMiddleware → 관리자 인증 확인
3. SSEManager.register_client(client_id)
4. [Event Loop] SSEManager → yield events to client
5. On disconnect → SSEManager.unregister_client(client_id)
```

---

## 에러 처리 전략

| 에러 유형 | HTTP Status | 처리 방식 |
|-----------|-------------|-----------|
| 인증 실패 | 401 | 토큰 만료/무효 → 재로그인 유도 |
| 권한 없음 | 403 | 접근 불가 리소스 |
| 리소스 없음 | 404 | 존재하지 않는 주문/메뉴/테이블 |
| 검증 실패 | 422 | 필수 필드 누락, 가격 범위 초과 |
| 상태 전이 오류 | 409 | 잘못된 주문 상태 변경 시도 |
| 서버 오류 | 500 | 예상치 못한 에러 → 로깅 |
