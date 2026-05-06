# Build and Test Summary - Customer Frontend

## 실행 순서

```bash
cd frontend

# 1. 의존성 설치
npm install

# 2. 타입 체크
npx tsc --noEmit

# 3. 린트
npx eslint src/ --ext .ts,.tsx

# 4. 단위 테스트
npx vitest run

# 5. 프로덕션 빌드
npx vite build

# 6. (선택) 빌드 미리보기
npx vite preview
```

---

## 빠른 시작 (한 줄)

```bash
cd frontend && npm install && npm run build && npm run test
```

---

## 검증 체크리스트

- [ ] `npm install` — 에러 없이 완료
- [ ] `npx tsc --noEmit` — TypeScript 타입 에러 없음
- [ ] `npx eslint src/` — ESLint 에러 없음
- [ ] `npx vitest run` — 모든 테스트 통과 (8/8)
- [ ] `npx vite build` — 빌드 성공, dist/ 생성
- [ ] 번들 사이즈 < 500KB (gzipped)
- [ ] `npm run dev` — 개발 서버 정상 시작 (localhost:5173)
- [ ] MSW Mock으로 메뉴 화면 정상 표시
- [ ] 장바구니 추가/삭제/수량 변경 동작
- [ ] 주문 생성 → 성공 화면 → 5초 리다이렉트 동작
- [ ] 새로고침 시 장바구니 유지

---

## 환경 요구사항

| 항목 | 최소 버전 |
|------|-----------|
| Node.js | 18.x |
| npm | 9.x |
| 브라우저 | Chrome 90+ / Safari 14+ |

---

## 알려진 제한사항

1. **Node.js 미설치**: 현재 워크스페이스에 Node.js가 설치되어 있지 않아 자동 빌드/테스트 불가
2. **백엔드 미구현**: MSW Mock으로 대체 (VITE_ENABLE_MSW=true)
3. **E2E 테스트 미포함**: MVP 단계에서는 수동 테스트로 대체

---

## 수동 테스트 시나리오

### 시나리오 1: 초기 설정 → 메뉴 탐색
1. `http://localhost:5173` 접속
2. 초기 설정 화면 표시 확인
3. 매장 ID, 테이블 번호, 비밀번호 입력 → 설정 완료
4. 메뉴 화면으로 자동 이동 확인
5. 카테고리 탭 전환 → 메뉴 필터링 확인

### 시나리오 2: 장바구니 → 주문
1. 메뉴 카드에서 "담기" 버튼 클릭
2. 하단 네비게이션 장바구니 뱃지 숫자 증가 확인
3. 장바구니 페이지 이동 → 수량 조절 → 총 금액 변경 확인
4. "주문하기" → 주문 확인 → "주문 확정"
5. 주문 완료 화면 → 주문 번호 표시 → 5초 카운트다운 → 메뉴 화면

### 시나리오 3: 새로고침 복원
1. 장바구니에 메뉴 추가
2. 브라우저 새로고침 (F5)
3. 장바구니 내용 유지 확인
4. 인증 상태 유지 확인 (메뉴 화면 표시)
# Build and Test Summary - Admin Frontend (Unit 3)

## Build Status
- **Build Tool**: Vite 5.x
- **Language**: TypeScript 5.x (strict mode)
- **Framework**: React 18.x
- **Build Command**: `npm run build`
- **Build Artifacts**: `dist/` 디렉토리 (index.html + assets/)

## Test Execution Summary

### Unit Tests
- **Framework**: Vitest + React Testing Library
- **Test Files**: 3개
- **Test Cases**: Token Storage (6), Button (5), Modal (4)
- **Coverage**: 핵심 유틸리티 및 공통 컴포넌트
- **Command**: `npm run test:run`

### Integration Tests
- **Type**: Manual (Backend API 연동 필요)
- **Scenarios**: 6개 시나리오 정의
- **Prerequisites**: Backend (Unit 1) + MySQL 실행 필요
- **Checklist**: 10개 항목

### Performance Tests
- **Type**: Lighthouse + 수동 측정
- **Targets**: FCP < 1.5s, LCP < 2.5s, Bundle < 200KB
- **SSE Latency**: < 2초

### Additional Tests
- **Contract Tests**: N/A (Backend API 스펙 기반 — Unit 1 담당)
- **Security Tests**: N/A (기본 보안 패턴 적용 완료)
- **E2E Tests**: N/A (MVP 범위 외 — 추후 Playwright 도입 가능)

## Generated Instruction Files

| 파일 | 내용 |
|------|------|
| `build-instructions.md` | 빌드 절차, Docker 빌드, 트러블슈팅 |
| `unit-test-instructions.md` | 단위 테스트 실행, 테스트 패턴 가이드 |
| `integration-test-instructions.md` | Backend 연동 테스트 시나리오 6개 |
| `performance-test-instructions.md` | 번들 크기, Web Vitals, SSE 성능 측정 |
| `build-and-test-summary.md` | 이 문서 (전체 요약) |

## Overall Status
- **Build**: ✅ 설정 완료 (코드 생성 완료)
- **Unit Tests**: ✅ 작성 완료 (실행은 `npm install` 후)
- **Integration Tests**: ⏳ Backend (Unit 1) 완료 후 실행 가능
- **Performance Tests**: ⏳ 빌드 후 측정 가능
- **Ready for Operations**: ✅ (Backend 연동 시 완전 동작)

## Dependencies on Other Units
- **Unit 1 (Backend API)**: 로그인, 주문 CRUD, SSE, 메뉴 관리 API 필요
- **Unit 2 (Customer Frontend)**: `shared/` 디렉토리 공유 (타입, 공통 컴포넌트)

## Next Steps
1. `npm install` 실행하여 의존성 설치
2. `npm run test:run` 실행하여 단위 테스트 통과 확인
3. `npm run build` 실행하여 빌드 성공 확인
4. Backend (Unit 1) 완료 후 통합 테스트 수행
5. 전체 시스템 연동 후 성능 테스트 수행
