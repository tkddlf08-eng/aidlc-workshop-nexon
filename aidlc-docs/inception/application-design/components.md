# 컴포넌트 정의 (Components)

## 아키텍처 개요

```
+------------------+         +------------------+         +--------+
|   Frontend       |  REST   |   Backend        |         |        |
|   (React SPA)    | ------> |   (FastAPI)      | ------> | MySQL  |
|                  | <------ |                  | <------ |        |
|   - Customer UI  |   SSE   |   - Auth Module  |         +--------+
|   - Admin UI     |         |   - Orders Module|
|                  |         |   - Menus Module  |         +--------+
+------------------+         |   - Tables Module|         |  AWS   |
                             +------------------+ ------> |  S3    |
                                                          +--------+
```

---

## Backend Components

### 1. Auth Module (`backend/app/auth/`)
**책임**: 인증 및 권한 관리
- 관리자 로그인/로그아웃
- JWT 토큰 발급 및 검증
- 테이블 태블릿 인증
- 로그인 시도 제한

### 2. Orders Module (`backend/app/orders/`)
**책임**: 주문 생성, 조회, 상태 관리
- 주문 생성 (세션 자동 시작 포함)
- 주문 목록 조회 (현재 세션 / 과거 이력)
- 주문 상태 변경
- 주문 삭제
- SSE 실시간 주문 이벤트 발행

### 3. Menus Module (`backend/app/menus/`)
**책임**: 메뉴 및 카테고리 CRUD
- 카테고리 CRUD
- 메뉴 CRUD
- 이미지 업로드 (S3 연동)
- 메뉴/카테고리 순서 관리

### 4. Tables Module (`backend/app/tables/`)
**책임**: 테이블 및 세션 관리
- 테이블 초기 설정
- 테이블 세션 라이프사이클 (시작/종료)
- 테이블 이용 완료 처리
- 테이블 현황 조회

### 5. Core Module (`backend/app/core/`)
**책임**: 공통 인프라 및 설정
- 데이터베이스 연결 관리
- 설정 관리 (환경 변수)
- 공통 예외 처리
- 미들웨어 (CORS, 인증)

---

## Frontend Components

### 6. Customer App (`frontend/src/customer/`)
**책임**: 고객용 주문 인터페이스
- 메뉴 탐색 (카테고리별)
- 장바구니 관리
- 주문 생성 및 확인
- 주문 내역 조회
- 자동 로그인/초기 설정

### 7. Admin App (`frontend/src/admin/`)
**책임**: 관리자용 매장 관리 인터페이스
- 로그인/세션 관리
- 실시간 주문 대시보드 (SSE)
- 테이블 관리
- 메뉴/카테고리 관리
- 과거 주문 내역 조회

### 8. Shared (`frontend/src/shared/`)
**책임**: 공통 UI 컴포넌트 및 유틸리티
- 공통 UI 컴포넌트 (Button, Modal, Toast 등)
- API 클라이언트 (axios 인스턴스)
- 타입 정의
- 유틸리티 함수
