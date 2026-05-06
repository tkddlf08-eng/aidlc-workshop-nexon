# 테이블오더 - Customer Frontend

고객용 테이블오더 웹 애플리케이션입니다.

## 기술 스택

- **React 18** + TypeScript
- **Vite** (빌드 도구)
- **Zustand** (클라이언트 상태 관리)
- **React Query** (서버 상태 관리)
- **Tailwind CSS** (스타일링)
- **Axios** (HTTP 클라이언트)
- **MSW** (Mock API)
- **Vitest** + React Testing Library (테스트)

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (MSW Mock 활성화)
npm run dev

# 빌드
npm run build

# 테스트
npm run test

# 린트
npm run lint
```

## 프로젝트 구조

```
src/
├── customer/           # 고객용 기능
│   ├── pages/          # 페이지 컴포넌트
│   ├── components/     # 고객 전용 컴포넌트
│   └── stores/         # Zustand stores
├── admin/              # 관리자용 기능 (Unit 3)
├── shared/             # 공통 모듈
│   ├── api/            # API 클라이언트, 타입, 쿼리
│   ├── components/     # 공통 UI 컴포넌트
│   ├── hooks/          # 커스텀 훅
│   └── constants/      # 상수
├── mocks/              # MSW Mock 핸들러
├── App.tsx             # 앱 엔트리
├── router.tsx          # 라우트 설정
└── main.tsx            # 부트스트랩
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_BASE_URL` | 백엔드 API URL | `http://localhost:8000` |
| `VITE_APP_ENV` | 환경 | `development` |
| `VITE_ENABLE_MSW` | MSW 활성화 | `true` |

## 개발 모드

- `VITE_ENABLE_MSW=true`: 백엔드 없이 Mock 데이터로 개발
- `VITE_ENABLE_MSW=false`: 실제 백엔드 API 연동

## 페이지 구성

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/setup` | 초기 설정 | 매장/테이블 정보 입력 |
| `/` | 메뉴 | 카테고리별 메뉴 탐색 (홈) |
| `/cart` | 장바구니 | 담은 메뉴 확인/수정 |
| `/order-confirm` | 주문 확인 | 최종 확인 후 주문 |
| `/order-success` | 주문 완료 | 주문 번호 표시, 5초 후 리다이렉트 |
| `/orders` | 주문 내역 | 현재 세션 주문 목록 |
