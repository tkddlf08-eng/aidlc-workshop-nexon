# Table Order - Admin Frontend

관리자용 웹 인터페이스 (React SPA)

## 기술 스택

- React 18 + TypeScript 5
- Vite 5 (빌드 도구)
- Tailwind CSS (스타일링)
- Zustand (상태 관리)
- @dnd-kit (드래그앤드롭)
- Axios (HTTP 클라이언트)
- Vitest + React Testing Library (테스트)

## 시작하기

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.development

# 개발 서버 시작
npm run dev
# → http://localhost:5173/admin/login
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run test` | 테스트 실행 (watch) |
| `npm run test:run` | 테스트 1회 실행 |
| `npm run lint` | ESLint 실행 |
| `npm run format` | Prettier 포맷팅 |

## 프로젝트 구조

```
src/
├── admin/              # 관리자 앱
│   ├── pages/          # 페이지 컴포넌트
│   ├── components/     # 관리자 전용 컴포넌트
│   ├── stores/         # Zustand 상태 관리
│   ├── services/       # SSE 등 서비스
│   └── routes.tsx      # 라우팅
├── shared/             # 공통 모듈
│   ├── components/     # 공통 UI 컴포넌트
│   ├── api/            # API 클라이언트
│   ├── types/          # TypeScript 타입
│   └── utils/          # 유틸리티
├── App.tsx             # 앱 엔트리
├── main.tsx            # 메인 엔트리
└── index.css           # 글로벌 스타일
```

## 주요 페이지

- `/admin/login` — 관리자 로그인
- `/admin/dashboard` — 실시간 주문 대시보드
- `/admin/menus` — 메뉴/카테고리 관리
- `/admin/tables/:id/history` — 과거 주문 내역

## Docker

```bash
# 빌드
docker build -t table-order-frontend .

# 실행
docker run -p 3000:80 table-order-frontend
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_SSE_URL` | SSE 스트림 URL | `http://localhost:8000/api/orders/stream` |
