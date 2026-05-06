# Unit of Work - Story Map

## 스토리 할당 매핑

### Unit 1: Backend API

| Story ID | Story Name | Priority |
|----------|-----------|----------|
| US-C01 | 태블릿 자동 로그인 (API) | Must |
| US-C03 | 카테고리별 메뉴 탐색 (API) | Must |
| US-C04 | 메뉴 상세 정보 (API) | Must |
| US-C07 | 주문 확정 (API + 세션 생성) | Must |
| US-C08 | 추가 주문 (API) | Must |
| US-C09 | 현재 세션 주문 내역 (API) | Must |
| US-C10 | 주문 목록 페이지네이션 (API) | Should |
| US-A01 | 관리자 로그인 (API) | Must |
| US-A02 | 세션 유지/자동 로그아웃 (API) | Must |
| US-A04 | 실시간 주문 알림 (SSE 서버) | Must |
| US-A05 | 주문 상태 변경 (API) | Must |
| US-A07 | 테이블 초기 설정 (API) | Must |
| US-A08 | 주문 삭제 (API) | Must |
| US-A09 | 테이블 이용 완료 (API) | Must |
| US-A10 | 과거 주문 내역 (API) | Should |
| US-A11 | 카테고리 관리 (API) | Must |
| US-A12 | 메뉴 등록 (API + S3) | Must |
| US-A13 | 메뉴 수정/삭제 (API) | Must |
| US-A14 | 메뉴 순서 관리 (API) | Should |

**총 19개 스토리** (Must 16 / Should 3)

---

### Unit 2: Customer Frontend

| Story ID | Story Name | Priority |
|----------|-----------|----------|
| US-C01 | 태블릿 자동 로그인 (UI + 로컬 저장) | Must |
| US-C03 | 카테고리별 메뉴 탐색 (UI) | Must |
| US-C04 | 메뉴 상세 정보 확인 (UI) | Must |
| US-C05 | 메뉴를 장바구니에 추가 (UI) | Must |
| US-C06 | 장바구니 수정 및 관리 (UI + 로컬 저장) | Must |
| US-C07 | 주문 확정 (UI + API 호출) | Must |
| US-C08 | 추가 주문 (UI 흐름) | Must |
| US-C09 | 현재 세션 주문 내역 (UI) | Must |
| US-C10 | 주문 목록 페이지네이션 (UI) | Should |

**총 9개 스토리** (Must 8 / Should 1)

---

### Unit 3: Admin Frontend

| Story ID | Story Name | Priority |
|----------|-----------|----------|
| US-A01 | 관리자 로그인 (UI) | Must |
| US-A02 | 세션 유지/자동 로그아웃 (UI) | Must |
| US-A03 | 테이블별 주문 대시보드 (UI) | Must |
| US-A04 | 실시간 주문 알림 (SSE 클라이언트) | Must |
| US-A05 | 주문 상태 변경 (UI) | Must |
| US-A06 | 주문 상세 보기 (UI) | Must |
| US-A07 | 테이블 초기 설정 (UI) | Must |
| US-A08 | 주문 삭제 (UI) | Must |
| US-A09 | 테이블 이용 완료 (UI) | Must |
| US-A10 | 과거 주문 내역 조회 (UI) | Should |
| US-A11 | 카테고리 관리 (UI) | Must |
| US-A12 | 메뉴 등록 (UI + 이미지 업로드) | Must |
| US-A13 | 메뉴 수정/삭제 (UI) | Must |
| US-A14 | 메뉴 순서 관리 (UI 드래그앤드롭) | Should |

**총 14개 스토리** (Must 12 / Should 2)

---

## 커버리지 검증

| Story ID | Unit 1 | Unit 2 | Unit 3 | 커버리지 |
|----------|:------:|:------:|:------:|:--------:|
| US-C01 | ✅ | ✅ | | ✅ |
| US-C03 | ✅ | ✅ | | ✅ |
| US-C04 | ✅ | ✅ | | ✅ |
| US-C05 | | ✅ | | ✅ (FE only) |
| US-C06 | | ✅ | | ✅ (FE only) |
| US-C07 | ✅ | ✅ | | ✅ |
| US-C08 | ✅ | ✅ | | ✅ |
| US-C09 | ✅ | ✅ | | ✅ |
| US-C10 | ✅ | ✅ | | ✅ |
| US-A01 | ✅ | | ✅ | ✅ |
| US-A02 | ✅ | | ✅ | ✅ |
| US-A03 | | | ✅ | ✅ (FE only) |
| US-A04 | ✅ | | ✅ | ✅ |
| US-A05 | ✅ | | ✅ | ✅ |
| US-A06 | | | ✅ | ✅ (FE only) |
| US-A07 | ✅ | | ✅ | ✅ |
| US-A08 | ✅ | | ✅ | ✅ |
| US-A09 | ✅ | | ✅ | ✅ |
| US-A10 | ✅ | | ✅ | ✅ |
| US-A11 | ✅ | | ✅ | ✅ |
| US-A12 | ✅ | | ✅ | ✅ |
| US-A13 | ✅ | | ✅ | ✅ |
| US-A14 | ✅ | | ✅ | ✅ |

**전체 23개 스토리 100% 커버리지 확인** ✅

---

## 작업량 균형 분석

| Unit | 스토리 수 | Must | Should | 예상 복잡도 |
|------|-----------|------|--------|-------------|
| Unit 1 (Backend) | 19 | 16 | 3 | 높음 (DB + API + SSE + S3) |
| Unit 2 (Customer FE) | 9 | 8 | 1 | 중간 (UI + 로컬 저장 + API 연동) |
| Unit 3 (Admin FE) | 14 | 12 | 2 | 높음 (대시보드 + SSE + CRUD UI) |

**참고**: Unit 1이 스토리 수가 많지만, 대부분 CRUD API로 패턴이 반복됩니다. Unit 3은 스토리 수는 적지만 SSE 클라이언트와 대시보드 UI 복잡도가 높습니다. 전체적으로 균형 잡힌 분배입니다.
