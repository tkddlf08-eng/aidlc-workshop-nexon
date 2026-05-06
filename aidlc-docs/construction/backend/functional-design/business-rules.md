# Business Rules — Unit 1 (Backend API)

## 1. 인증/인가 규칙 (Authentication & Authorization)

### BR-AUTH-01: 관리자 로그인 검증
| 항목 | 규칙 |
|------|------|
| 입력 | store_code, username, password |
| 검증 순서 | 1) store_code 존재 확인 → 2) username 존재 확인 → 3) password 검증 |
| 에러 메시지 | 보안상 "매장 정보 또는 계정 정보가 올바르지 않습니다" 통합 메시지 사용 |
| 비밀번호 | bcrypt 해시 비교 |

### BR-AUTH-02: 로그인 시도 제한
| 항목 | 규칙 |
|------|------|
| 기준 | 계정(store_id + username) 기반 |
| 임계값 | 연속 5회 실패 |
| 차단 시간 | 15분 |
| 리셋 조건 | 로그인 성공 시 failed_login_attempts = 0 |
| 잠금 확인 | locked_until > NOW() 이면 잠금 상태 |

### BR-AUTH-03: JWT 토큰 정책
| 항목 | 관리자 | 테이블 |
|------|--------|--------|
| 만료 시간 | 16시간 | 만료 없음 |
| 갱신 방식 | 재로그인 | 불필요 |
| 페이로드 | sub, store_id, role | sub, store_id, table_id, table_number, role |
| 알고리즘 | HS256 | HS256 |

### BR-AUTH-04: 테이블 태블릿 로그인
| 항목 | 규칙 |
|------|------|
| 입력 | store_code, table_number, password |
| 검증 | store 존재 + table 존재 + password 일치 |
| 토큰 | 만료 없는 JWT (태블릿 상시 접속) |
| 실패 제한 | 3회 실패 시 5분 차단 (테이블 기반) |

### BR-AUTH-05: 비밀번호 정책
| 항목 | 규칙 |
|------|------|
| 최소 길이 | 8자 |
| 구성 요건 | 영문 + 숫자 포함 (특수문자 선택) |
| 해싱 | bcrypt (rounds=12) |
| 이전 비밀번호 | 현재 비밀번호와 동일 불가 |

---

## 2. 주문 규칙 (Order Rules)

### BR-ORD-01: 주문 생성 검증
| 항목 | 규칙 |
|------|------|
| 최소 항목 | 1개 이상의 OrderItem 필수 |
| 메뉴 상태 | is_deleted=false AND is_sold_out=false |
| 수량 범위 | 1 ~ 99 (항목당) |
| 검증 실패 | 하나라도 실패 시 전체 주문 거부 (원자적) |

### BR-ORD-02: 주문 상태 전이
| 현재 상태 | 허용 전이 | 에러 코드 |
|-----------|-----------|-----------|
| PENDING | PREPARING | - |
| PREPARING | COMPLETED | - |
| PENDING | COMPLETED | 409 (건너뛰기 불가) |
| PREPARING | PENDING | 409 (역방향 불가) |
| COMPLETED | * | 409 (최종 상태) |

### BR-ORD-03: 주문 번호 생성
| 항목 | 규칙 |
|------|------|
| 형식 | `{YYMMDD}-{table_number(2자리)}-{sequence(3자리)}` |
| 예시 | `260506-03-001` |
| sequence | 해당 테이블의 당일 주문 순번 (001부터) |
| 유니크 보장 | DB UNIQUE 제약 + 충돌 시 재시도 |

### BR-ORD-04: 주문 삭제
| 항목 | 규칙 |
|------|------|
| 방식 | Soft Delete (is_deleted=true, deleted_at=NOW()) |
| 권한 | 관리자만 가능 |
| 상태 제한 | 모든 상태에서 삭제 가능 |
| 아카이빙된 주문 | 삭제 불가 (이미 이용 완료 처리됨) |

### BR-ORD-05: 주문 총액 계산
| 항목 | 규칙 |
|------|------|
| 계산식 | `total_amount = SUM(quantity * unit_price)` |
| 시점 | 주문 생성 시 계산, 이후 변경 없음 |
| 스냅샷 | unit_price는 주문 시점의 Menu.price |
| 통화 | 원(KRW), 정수 (소수점 없음) |

---

## 3. 세션 규칙 (Session Rules)

### BR-SES-01: 세션 생성
| 항목 | 규칙 |
|------|------|
| 시점 | 첫 주문 확정 시 자동 생성 |
| 조건 | 해당 테이블에 is_active=true인 세션이 없을 때 |
| 토큰 | UUID4 기반 session_token 생성 |
| 제약 | 테이블당 동시 활성 세션 최대 1개 |

### BR-SES-02: 세션 종료 (이용 완료)
| 항목 | 규칙 |
|------|------|
| 권한 | 관리자만 가능 |
| 처리 순서 | 1) 주문 아카이빙 → 2) 매출 집계 → 3) 세션 종료 |
| 아카이빙 | 세션 내 모든 주문: is_archived=true, archived_at=NOW() |
| 삭제된 주문 | 매출 집계에서 제외 (is_deleted=true인 주문) |
| 세션 상태 | is_active=false, ended_at=NOW() |

### BR-SES-03: 세션 매출 집계
| 항목 | 규칙 |
|------|------|
| 대상 | 세션 내 is_deleted=false인 주문만 |
| total_revenue | SUM(order.total_amount) |
| order_count | COUNT(orders) |
| 기록 시점 | 세션 종료 시 즉시 |

---

## 4. 메뉴 규칙 (Menu Rules)

### BR-MNU-01: 메뉴 필드 검증
| 필드 | 규칙 |
|------|------|
| name | 필수, 1~100자 |
| price | 필수, 0 이상 정수 (무료 메뉴 허용) |
| description | 선택, 최대 500자 |
| category_id | 필수, 존재하는 카테고리 |
| image | 선택, 5MB 이하, JPEG/PNG/WebP |

### BR-MNU-02: 메뉴 삭제
| 항목 | 규칙 |
|------|------|
| 방식 | Soft Delete (is_deleted=true) |
| 영향 | 삭제된 메뉴는 고객 메뉴 목록에서 제외 |
| 기존 주문 | OrderItem.menu_name 스냅샷으로 보존 |
| 복구 | 관리자가 is_deleted=false로 복구 가능 (향후 기능) |

### BR-MNU-03: 품절 관리
| 항목 | 규칙 |
|------|------|
| 설정 | 관리자가 is_sold_out 토글 |
| 영향 | 품절 메뉴는 고객 화면에 표시되나 주문 불가 |
| 표시 | 고객 화면에서 "품절" 라벨 표시 |

### BR-MNU-04: 메뉴 순서 관리
| 항목 | 규칙 |
|------|------|
| 범위 | 카테고리 내 메뉴 순서 |
| API | PUT /categories/{id}/menu-order |
| 입력 | 해당 카테고리의 모든 활성 메뉴 ID 배열 (순서대로) |
| 검증 | 누락/중복/타 카테고리 메뉴 포함 시 422 에러 |
| 할당 | 배열 인덱스를 sort_order로 설정 (0부터) |

---

## 5. 카테고리 규칙 (Category Rules)

### BR-CAT-01: 카테고리 필드 검증
| 필드 | 규칙 |
|------|------|
| name | 필수, 1~50자, 매장 내 중복 불가 |
| sort_order | 선택, 미지정 시 마지막 순서 자동 부여 |

### BR-CAT-02: 카테고리 삭제 제약
| 항목 | 규칙 |
|------|------|
| 조건 | 해당 카테고리에 활성 메뉴(is_deleted=false)가 없어야 함 |
| 위반 시 | 409 Conflict ("카테고리에 메뉴가 존재합니다. 메뉴를 먼저 이동 또는 삭제해주세요") |

---

## 6. 테이블 규칙 (Table Rules)

### BR-TBL-01: 테이블 초기 설정
| 항목 | 규칙 |
|------|------|
| 입력 | table_number, password |
| table_number | 1~99 범위, 매장 내 중복 불가 |
| password | 최소 4자 (태블릿 간편 비밀번호) |
| 결과 | 테이블 생성 + 비밀번호 bcrypt 해시 저장 |

### BR-TBL-02: 대시보드 데이터
| 항목 | 규칙 |
|------|------|
| 포함 정보 | 테이블별: table_number, 활성 세션 여부, 총 주문액, 최신 주문 3건 |
| 총 주문액 | 현재 세션의 is_deleted=false 주문 합계 |
| 정렬 | table_number 오름차순 |

---

## 7. 이미지 업로드 규칙 (Image Upload Rules)

### BR-IMG-01: 파일 검증
| 항목 | 규칙 |
|------|------|
| 최대 크기 | 5MB (5,242,880 bytes) |
| 허용 형식 | JPEG, PNG, WebP |
| MIME 검증 | Content-Type 헤더 + 파일 매직 바이트 이중 확인 |
| 파일명 | UUID4로 재생성 (원본 파일명 무시) |

### BR-IMG-02: S3 저장 규칙
| 항목 | 규칙 |
|------|------|
| 키 형식 | `{store_id}/menus/{uuid}.{ext}` |
| ACL | private (Presigned URL 또는 CloudFront로 접근) |
| 기존 이미지 | 메뉴 이미지 변경 시 기존 S3 객체 삭제 |

---

## 8. 페이지네이션 규칙 (Pagination Rules)

### BR-PAG-01: 기본 설정
| 항목 | 규칙 |
|------|------|
| 기본 페이지 크기 | 10 |
| 최대 페이지 크기 | 50 |
| 페이지 번호 | 1부터 시작 |
| 초과 요청 | 빈 배열 반환 (에러 아님) |

### BR-PAG-02: 응답 형식
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_items": 45,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 9. Soft Delete 자동 정리 규칙 (Auto Cleanup Rules)

### BR-CLN-01: 정리 정책
| 항목 | 규칙 |
|------|------|
| 보존 기간 | 90일 (deleted_at 기준) |
| 실행 시간 | 매일 02:00 KST |
| 대상 | Order (is_deleted=true), Menu (is_deleted=true) |
| 순서 | OrderItem → Order → Menu (참조 무결성) |
| Menu 조건 | 무조건 Hard Delete 가능 (OrderItem.menu_id는 SET NULL ON DELETE로 FK 안전) |
| OrderItem | menu_id가 NULL이 되어도 menu_name/unit_price 스냅샷으로 데이터 보존 |

---

## 10. API 공통 규칙 (Common API Rules)

### BR-API-01: 에러 응답 형식
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "가격은 0 이상이어야 합니다",
    "details": [
      {
        "field": "price",
        "message": "0 이상의 정수를 입력해주세요"
      }
    ]
  }
}
```

### BR-API-02: HTTP 상태 코드 규칙
| 상태 코드 | 사용 상황 |
|-----------|-----------|
| 200 | 조회/수정/삭제 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 (비밀번호 불일치 등) |
| 401 | 인증 실패/토큰 만료 |
| 403 | 권한 없음/계정 잠금 |
| 404 | 리소스 없음 |
| 409 | 상태 충돌 (상태 전이 오류, 카테고리 삭제 제약) |
| 422 | 검증 실패 (필드 유효성, 품절, 파일 형식) |
| 500 | 서버 내부 오류 |

### BR-API-03: 타임스탬프 형식
| 항목 | 규칙 |
|------|------|
| 형식 | ISO 8601 (UTC) |
| 예시 | `2026-05-06T12:30:00Z` |
| DB 저장 | UTC 기준 |
| 응답 | UTC로 반환 (프론트에서 KST 변환) |
