# Unit 1 (Backend API) - Functional Design Questions

아래 질문에 답변해주세요. 각 질문의 [Answer]: 태그 뒤에 선택지 알파벳을 입력하시면 됩니다.
선택지 중 맞는 것이 없으면 마지막 "Other" 옵션을 선택하고 설명을 추가해주세요.

---

## Question 1
주문 생성 시 재고/메뉴 가용성 검증을 어떻게 처리할까요?

A) 주문 시점에 메뉴 활성 상태만 확인 (삭제된 메뉴 주문 불가)
B) 메뉴 활성 상태 + 품절 플래그 확인 (관리자가 품절 설정 가능)
C) 검증 없이 모든 주문 수락 (MVP 단순화)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2
주문 삭제 시 관련 데이터 처리 방식은?

A) Soft Delete — is_deleted 플래그로 표시, DB에 데이터 유지
B) Hard Delete — DB에서 완전 삭제 (CASCADE)
C) Soft Delete + 일정 기간 후 자동 Hard Delete
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 3
테이블 세션 생성 시점은 언제로 할까요?

A) 첫 주문 확정 시 자동 생성 (요구사항 기본안)
B) 테이블 태블릿 로그인 시 자동 생성
C) 관리자가 수동으로 세션 시작
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
SSE (Server-Sent Events) 이벤트 범위는 어디까지 브로드캐스트할까요?

A) 관리자 전용 — 관리자만 SSE 구독 (고객은 polling 또는 수동 새로고침)
B) 관리자 + 고객 — 고객도 자기 테이블 주문 상태 변경을 SSE로 수신
C) 관리자 전용 (MVP) + 고객 SSE는 향후 확장
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5
로그인 시도 제한 정책은 어떻게 설정할까요?

A) 5회 실패 시 15분 차단 (IP 기반)
B) 5회 실패 시 15분 차단 (계정 기반)
C) 3회 실패 시 30분 차단 (계정 기반)
D) 10회 실패 시 5분 차단 (IP 기반)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
카테고리 삭제 시 해당 카테고리에 메뉴가 있는 경우 처리 방식은?

A) 삭제 불가 — 메뉴가 있으면 에러 반환 (요구사항 기본안)
B) 메뉴를 "미분류" 카테고리로 자동 이동 후 삭제
C) 메뉴와 함께 카스케이드 삭제 (확인 팝업 후)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
이미지 업로드 제한 사항은 어떻게 설정할까요?

A) 최대 5MB, JPEG/PNG/WebP만 허용
B) 최대 10MB, JPEG/PNG/WebP/GIF 허용
C) 최대 2MB, JPEG/PNG만 허용
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
API 페이지네이션 기본값은 어떻게 설정할까요?

A) 기본 10개, 최대 50개
B) 기본 20개, 최대 100개
C) 기본 15개, 최대 50개
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9
주문 상태 변경 시 SSE 이벤트에 포함할 데이터 범위는?

A) 최소 — order_id, new_status, table_id만 전송
B) 중간 — 주문 기본 정보 (id, status, table_id, total_amount, updated_at)
C) 전체 — 주문 상세 정보 포함 (메뉴 목록까지)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 10
테이블 이용 완료 시 세션 종료 외 추가 처리가 필요한가요?

A) 세션 종료 + 주문 아카이빙만 (요구사항 기본안)
B) 세션 종료 + 주문 아카이빙 + 테이블 비밀번호 리셋
C) 세션 종료 + 주문 아카이빙 + 총 매출 집계 로그 기록
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 11
관리자 계정 관리 방식은?

A) DB 직접 등록 (단일 관리자, seed 스크립트 제공)
B) DB 직접 등록 + 비밀번호 변경 API 제공
C) 초기 설정 API로 첫 관리자 등록 (이후 추가 등록 불가)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 12
메뉴 순서 변경 API 설계 방식은?

A) 단일 메뉴 sort_order 값 변경 (PATCH /menus/{id}/sort)
B) 카테고리 내 전체 메뉴 순서 일괄 업데이트 (PUT /categories/{id}/menu-order)
C) 두 메뉴 간 위치 교환 (PATCH /menus/swap)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---
