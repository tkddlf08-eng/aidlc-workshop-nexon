# Integration Test Instructions - Admin Frontend (Unit 3)

## Purpose
Admin Frontend와 Backend API (Unit 1) 간의 통합을 검증합니다.

## Prerequisites
- Backend API (Unit 1)가 실행 중이어야 합니다
- MySQL 데이터베이스에 테스트 데이터가 있어야 합니다
- 관리자 계정이 DB에 등록되어 있어야 합니다

## Setup Integration Test Environment

### 1. Start Backend Services
```bash
cd table-order
docker-compose up -d backend db
# Backend: http://localhost:8000
# MySQL: localhost:3306
```

### 2. Start Frontend Dev Server
```bash
cd table-order/frontend
npm run dev
# Frontend: http://localhost:5173
```

### 3. Seed Test Data (Backend 팀 제공)
```bash
# Backend 팀이 제공하는 시드 스크립트 실행
cd table-order/backend
python scripts/seed_test_data.py
```

## Test Scenarios

### Scenario 1: 관리자 로그인 → 대시보드 접근
- **Setup**: DB에 관리자 계정 존재
- **Steps**:
  1. `/admin/login` 접속
  2. 매장 식별자, 사용자명, 비밀번호 입력
  3. 로그인 버튼 클릭
- **Expected**: 대시보드 페이지로 리다이렉트, 테이블 그리드 표시

### Scenario 2: SSE 실시간 주문 수신
- **Setup**: 로그인 완료, 대시보드 표시
- **Steps**:
  1. 대시보드에서 SSE 연결 상태 "실시간 연결됨" 확인
  2. 고객 앱 (Unit 2) 또는 API 직접 호출로 주문 생성
  3. 대시보드에서 신규 주문 표시 확인
- **Expected**: 2초 이내 신규 주문 카드 표시 + 빨간색 강조

### Scenario 3: 주문 상태 변경
- **Setup**: 대시보드에 PENDING 상태 주문 존재
- **Steps**:
  1. 주문 항목의 "준비 시작" 버튼 클릭
  2. 상태 변경 확인
  3. "완료" 버튼 클릭
- **Expected**: 상태 배지 색상 변경 (노란색 → 파란색 → 초록색)

### Scenario 4: 메뉴 CRUD
- **Setup**: 로그인 완료
- **Steps**:
  1. `/admin/menus` 이동
  2. 카테고리 추가 → 메뉴 등록 (이미지 포함) → 메뉴 수정 → 메뉴 삭제
- **Expected**: 각 작업 후 목록 갱신 + 성공 토스트

### Scenario 5: 테이블 이용 완료
- **Setup**: 테이블에 주문이 있는 상태
- **Steps**:
  1. 테이블 카드의 "이용 완료" 클릭
  2. 확인 팝업에서 "이용 완료" 클릭
- **Expected**: 테이블 주문 목록 비우기, 총액 0 리셋

### Scenario 6: 과거 주문 내역 조회
- **Setup**: 이용 완료 처리된 주문 존재
- **Steps**:
  1. 테이블 카드의 과거 내역 아이콘 클릭
  2. 날짜 필터 조정
- **Expected**: 아카이브된 주문 목록 표시

## Manual Testing Checklist

- [ ] 로그인 성공/실패 시나리오
- [ ] 16시간 세션 만료 후 자동 로그아웃
- [ ] SSE 연결/재연결 동작
- [ ] 주문 상태 변경 (단방향만 가능)
- [ ] 주문 삭제 + 총액 재계산
- [ ] 카테고리 CRUD + 순서 변경 (DnD)
- [ ] 메뉴 CRUD + 이미지 업로드
- [ ] 메뉴 순서 변경 (DnD)
- [ ] 반응형 레이아웃 (데스크톱/태블릿)
- [ ] 에러 상태 처리 (네트워크 끊김 등)
