# Business Logic Model - Customer Frontend

## 1. 고객 주문 플로우

```
[앱 시작] → 자동 로그인 확인
    ├── 성공 → [메뉴 화면]
    └── 실패 → [초기 설정 화면] → 설정 완료 → [메뉴 화면]

[메뉴 화면] → 카테고리 탐색 → 메뉴 선택 → 장바구니 추가
    └── 장바구니 아이콘 → [장바구니 화면]

[장바구니 화면] → 수량 조절/삭제 → 주문하기 버튼
    └── [주문 확인 화면]

[주문 확인 화면] → 주문 확정
    ├── 성공 → [주문 완료 화면] → 5초 후 → [메뉴 화면]
    └── 실패 → 에러 표시 → [장바구니 화면]

[주문 내역] → 현재 세션 주문 목록 조회
```

---

## 2. 인증/세션 로직

### 자동 로그인 플로우
```
1. 앱 시작
2. localStorage에서 인증 정보 확인 (store_id, table_number, token)
3. IF 정보 있음:
   3.1 토큰 유효성 검증 (GET /api/auth/me)
   3.2 IF 유효 → 메뉴 화면으로 이동
   3.3 IF 만료 → 저장된 credentials로 재로그인 시도
   3.4 IF 재로그인 성공 → 새 토큰 저장 → 메뉴 화면
   3.5 IF 재로그인 실패 → 초기 설정 화면
4. IF 정보 없음 → 초기 설정 화면
```

### 초기 설정 플로우
```
1. 매장 식별자 입력
2. 테이블 번호 입력
3. 테이블 비밀번호 입력
4. POST /api/auth/table/login
5. IF 성공:
   5.1 토큰 + credentials를 localStorage에 저장
   5.2 메뉴 화면으로 이동
6. IF 실패:
   6.1 에러 메시지 표시
   6.2 재시도 가능
```

---

## 3. 장바구니 로직

### 상태 구조
```typescript
CartState = {
  items: CartItem[]      // 장바구니 항목 목록
  // 파생 값 (computed)
  totalItems: number     // 총 항목 수
  totalPrice: number     // 총 금액
}

CartItem = {
  menuId: string
  menuName: string
  price: number
  quantity: number
  imageUrl: string
}
```

### 핵심 연산
- **addItem(menu)**: 이미 있으면 quantity + 1, 없으면 새 항목 추가
- **removeItem(menuId)**: 항목 완전 삭제
- **updateQuantity(menuId, qty)**: 수량 변경, qty ≤ 0이면 삭제
- **clearCart()**: 전체 비우기
- **getTotalPrice()**: Σ(item.price × item.quantity)

### 영속성
- 모든 변경 시 localStorage에 자동 동기화
- 앱 시작 시 localStorage에서 복원
- 주문 성공 시 localStorage + state 모두 클리어

---

## 4. 주문 생성 로직

### 주문 확정 플로우
```
1. 장바구니 items → 주문 요청 데이터 변환
2. POST /api/orders 호출
   - body: { table_id, session_id, items: [{menu_id, quantity, unit_price}] }
3. IF 성공 (201):
   3.1 주문 번호 저장 (표시용)
   3.2 장바구니 클리어
   3.3 주문 완료 화면 표시
   3.4 5초 타이머 시작
   3.5 타이머 완료 → 메뉴 화면으로 리다이렉트
4. IF 실패 (4xx/5xx):
   4.1 에러 메시지 표시
   4.2 장바구니 유지 (변경 없음)
   4.3 재시도 가능
```

### 세션 관리
- 프론트엔드는 session_id를 직접 관리하지 않음
- 백엔드가 첫 주문 시 세션을 자동 생성하고 응답에 포함
- 프론트엔드는 받은 session_id를 이후 주문 내역 조회에 사용

---

## 5. 주문 내역 조회 로직

### 조회 플로우
```
1. GET /api/orders?session_id={current_session_id}&page={page}&limit={limit}
2. 응답 데이터를 시간 순 정렬하여 표시
3. 각 주문: 번호, 시각, 메뉴/수량, 금액, 상태 표시
4. 페이지네이션: 다음 페이지 로드 (무한 스크롤 또는 페이지 버튼)
```

### 상태 표시
- PENDING → "대기중" (회색/노란색)
- PREPARING → "준비중" (파란색)
- COMPLETED → "완료" (초록색)
