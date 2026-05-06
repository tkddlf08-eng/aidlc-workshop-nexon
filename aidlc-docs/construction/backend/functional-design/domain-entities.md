# Domain Entities — Unit 1 (Backend API)

## 엔티티 관계 다이어그램 (ERD)

```mermaid
erDiagram
    Store ||--o{ Admin : has
    Store ||--o{ TableEntity : has
    Store ||--o{ Category : has
    TableEntity ||--o{ TableSession : has
    TableSession ||--o{ Order : contains
    Category ||--o{ Menu : contains
    Order ||--o{ OrderItem : contains
    Menu ||--o{ OrderItem : references
    Store ||--o{ SessionRevenue : has

    Store {
        int id PK
        string name
        string store_code UK
        datetime created_at
        datetime updated_at
    }

    Admin {
        int id PK
        int store_id FK
        string username
        string password_hash
        int failed_login_attempts
        datetime locked_until
        datetime created_at
        datetime updated_at
    }

    TableEntity {
        int id PK
        int store_id FK
        int table_number
        string password_hash
        boolean is_active
        int failed_login_attempts
        datetime locked_until
        datetime created_at
        datetime updated_at
    }

    TableSession {
        int id PK
        int table_id FK
        string session_token
        datetime started_at
        datetime ended_at
        boolean is_active
    }

    Category {
        int id PK
        int store_id FK
        string name
        int sort_order
        datetime created_at
        datetime updated_at
    }

    Menu {
        int id PK
        int category_id FK
        string name
        int price
        string description
        string image_url
        int sort_order
        boolean is_sold_out
        boolean is_deleted
        datetime created_at
        datetime updated_at
    }

    Order {
        int id PK
        int session_id FK
        int table_id FK
        string order_number
        int total_amount
        string status
        boolean is_archived
        datetime archived_at
        boolean is_deleted
        datetime deleted_at
        datetime created_at
        datetime updated_at
    }

    OrderItem {
        int id PK
        int order_id FK
        int menu_id FK_NULLABLE
        string menu_name
        int quantity
        int unit_price
        int subtotal
    }

    SessionRevenue {
        int id PK
        int store_id FK
        int table_id FK
        int session_id FK
        int total_revenue
        int order_count
        datetime session_started_at
        datetime session_ended_at
        datetime created_at
    }
```

### Text Alternative (ERD)
```
Store (1) --- (*) Admin
Store (1) --- (*) TableEntity
Store (1) --- (*) Category
Store (1) --- (*) SessionRevenue
TableEntity (1) --- (*) TableSession
TableSession (1) --- (*) Order
Category (1) --- (*) Menu
Order (1) --- (*) OrderItem
Menu (1) --- (*) OrderItem
```

---

## 엔티티 상세 정의

### 1. Store (매장)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 매장 고유 ID |
| name | VARCHAR(100) | NOT NULL | 매장명 |
| store_code | VARCHAR(50) | UNIQUE, NOT NULL | 매장 식별 코드 (로그인 시 사용) |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 생성 시각 |
| updated_at | DATETIME | NOT NULL, ON UPDATE NOW | 수정 시각 |

**비고**: 단일 매장 시스템이지만, 확장성을 위해 Store 엔티티 유지

---

### 2. Admin (관리자)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 관리자 고유 ID |
| store_id | INT | FK → Store.id, NOT NULL | 소속 매장 |
| username | VARCHAR(50) | NOT NULL | 사용자명 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 |
| failed_login_attempts | INT | DEFAULT 0 | 연속 로그인 실패 횟수 |
| locked_until | DATETIME | NULLABLE | 계정 잠금 해제 시각 |
| created_at | DATETIME | NOT NULL | 생성 시각 |
| updated_at | DATETIME | NOT NULL | 수정 시각 |

**인덱스**: `UNIQUE(store_id, username)`

---

### 3. TableEntity (테이블)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 테이블 고유 ID |
| store_id | INT | FK → Store.id, NOT NULL | 소속 매장 |
| table_number | INT | NOT NULL | 테이블 번호 |
| password_hash | VARCHAR(255) | NOT NULL | 태블릿 로그인 비밀번호 (bcrypt) |
| is_active | BOOLEAN | DEFAULT true | 활성 상태 |
| failed_login_attempts | INT | DEFAULT 0 | 연속 로그인 실패 횟수 |
| locked_until | DATETIME | NULLABLE | 잠금 해제 시각 |
| created_at | DATETIME | NOT NULL | 생성 시각 |
| updated_at | DATETIME | NOT NULL | 수정 시각 |

**인덱스**: `UNIQUE(store_id, table_number)`

---

### 4. TableSession (테이블 세션)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 세션 고유 ID |
| table_id | INT | FK → TableEntity.id, NOT NULL | 테이블 |
| session_token | VARCHAR(255) | UNIQUE, NOT NULL | 세션 식별 토큰 |
| started_at | DATETIME | NOT NULL, DEFAULT NOW | 세션 시작 시각 |
| ended_at | DATETIME | NULLABLE | 세션 종료 시각 |
| is_active | BOOLEAN | DEFAULT true | 활성 여부 |

**인덱스**: `INDEX(table_id, is_active)` — 활성 세션 빠른 조회

**제약**: 테이블당 활성 세션은 최대 1개

---

### 5. Category (카테고리)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 카테고리 고유 ID |
| store_id | INT | FK → Store.id, NOT NULL | 소속 매장 |
| name | VARCHAR(50) | NOT NULL | 카테고리명 |
| sort_order | INT | NOT NULL, DEFAULT 0 | 노출 순서 |
| created_at | DATETIME | NOT NULL | 생성 시각 |
| updated_at | DATETIME | NOT NULL | 수정 시각 |

**인덱스**: `UNIQUE(store_id, name)` — 매장 내 카테고리명 중복 방지

---

### 6. Menu (메뉴)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 메뉴 고유 ID |
| category_id | INT | FK → Category.id, NOT NULL | 소속 카테고리 |
| name | VARCHAR(100) | NOT NULL | 메뉴명 |
| price | INT | NOT NULL, CHECK(price >= 0) | 가격 (원) |
| description | TEXT | NULLABLE | 메뉴 설명 |
| image_url | VARCHAR(500) | NULLABLE | S3 이미지 URL |
| sort_order | INT | NOT NULL, DEFAULT 0 | 카테고리 내 노출 순서 |
| is_sold_out | BOOLEAN | DEFAULT false | 품절 여부 |
| is_deleted | BOOLEAN | DEFAULT false | Soft Delete 플래그 |
| created_at | DATETIME | NOT NULL | 생성 시각 |
| updated_at | DATETIME | NOT NULL | 수정 시각 |

**인덱스**: `INDEX(category_id, is_deleted, sort_order)` — 카테고리별 활성 메뉴 정렬 조회

---

### 7. Order (주문)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 주문 고유 ID |
| session_id | INT | FK → TableSession.id, NOT NULL | 소속 세션 |
| table_id | INT | FK → TableEntity.id, NOT NULL | 테이블 (비정규화, 조회 편의) |
| order_number | VARCHAR(20) | UNIQUE, NOT NULL | 주문 번호 (표시용) |
| total_amount | INT | NOT NULL, DEFAULT 0 | 주문 총액 |
| status | ENUM('PENDING','PREPARING','COMPLETED') | NOT NULL, DEFAULT 'PENDING' | 주문 상태 |
| is_archived | BOOLEAN | DEFAULT false | 이용 완료 아카이빙 플래그 |
| archived_at | DATETIME | NULLABLE | 아카이빙 시각 |
| is_deleted | BOOLEAN | DEFAULT false | Soft Delete 플래그 |
| deleted_at | DATETIME | NULLABLE | 삭제 시각 |
| created_at | DATETIME | NOT NULL | 주문 생성 시각 |
| updated_at | DATETIME | NOT NULL | 수정 시각 |

**인덱스**:
- `INDEX(session_id, is_deleted, is_archived)` — 현재 세션 활성 주문 조회
- `INDEX(table_id, is_archived, created_at)` — 과거 주문 내역 조회
- `INDEX(is_deleted, deleted_at)` — 자동 Hard Delete 배치 대상 조회

**주문 번호 생성 규칙**: `{YYMMDD}-{table_number}-{sequence}` (예: 260506-03-001)

---

### 8. OrderItem (주문 항목)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 항목 고유 ID |
| order_id | INT | FK → Order.id, NOT NULL | 소속 주문 |
| menu_id | INT | FK → Menu.id, NULLABLE, SET NULL ON DELETE | 메뉴 참조 (원본 삭제 시 NULL) |
| menu_name | VARCHAR(100) | NOT NULL | 주문 시점 메뉴명 (스냅샷) |
| quantity | INT | NOT NULL, CHECK(quantity > 0) | 수량 |
| unit_price | INT | NOT NULL | 주문 시점 단가 (스냅샷) |
| subtotal | INT | NOT NULL | 소계 (quantity * unit_price) |

**비고**: menu_name, unit_price는 주문 시점 스냅샷. 메뉴 가격 변경 시에도 기존 주문 금액 유지.  
**FK 정책**: menu_id는 `SET NULL ON DELETE` — Menu가 Hard Delete되어도 OrderItem의 스냅샷 데이터(menu_name, unit_price)로 주문 정보 보존.

---

### 9. SessionRevenue (세션 매출 집계)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 집계 고유 ID |
| store_id | INT | FK → Store.id, NOT NULL | 매장 |
| table_id | INT | FK → TableEntity.id, NOT NULL | 테이블 |
| session_id | INT | FK → TableSession.id, NOT NULL | 세션 |
| total_revenue | INT | NOT NULL | 세션 총 매출 |
| order_count | INT | NOT NULL | 주문 건수 |
| session_started_at | DATETIME | NOT NULL | 세션 시작 시각 |
| session_ended_at | DATETIME | NOT NULL | 세션 종료 시각 |
| created_at | DATETIME | NOT NULL | 기록 생성 시각 |

**인덱스**: `INDEX(store_id, session_ended_at)` — 날짜별 매출 조회

---

## Soft Delete 자동 정리 정책

| 대상 | 보존 기간 | 정리 주기 | 비고 |
|------|-----------|-----------|------|
| Order (is_deleted=true) | 90일 | 매일 02:00 | deleted_at 기준 |
| Menu (is_deleted=true) | 90일 | 매일 02:00 | 참조하는 OrderItem의 menu_name 스냅샷으로 데이터 보존 |

**구현**: APScheduler 또는 Celery Beat로 배치 작업 스케줄링

---

## 테이블 로그인 시도 제한

| 항목 | 규칙 |
|------|------|
| 기준 | 테이블(store_id + table_number) 기반 |
| 임계값 | 연속 3회 실패 |
| 차단 시간 | 5분 |
| 리셋 조건 | 로그인 성공 시 리셋 |
| 목적 | 태블릿 물리 접근 환경이지만 최소한의 brute force 방어 |

**참고**: 관리자 로그인(5회/15분)보다 완화된 정책. 태블릿은 물리적 접근 제어가 1차 보안.
