# Build Instructions - Admin Frontend (Unit 3)

## Prerequisites
- **Node.js**: v20.x 이상
- **npm**: v10.x 이상
- **OS**: macOS, Linux, Windows

## Build Steps

### 1. Install Dependencies
```bash
cd table-order/frontend
npm install
```

### 2. Configure Environment
```bash
# 개발 환경 (이미 .env.development 존재)
cp .env.example .env.development

# 프로덕션 빌드 시
# VITE_API_BASE_URL=/api
# VITE_SSE_URL=/api/orders/stream
```

### 3. Type Check
```bash
npx tsc --noEmit
```

### 4. Lint
```bash
npx eslint src/
```

### 5. Build (Production)
```bash
npm run build
```

### 6. Verify Build Success
- **Expected Output**: `dist/` 디렉토리 생성
- **Build Artifacts**:
  - `dist/index.html`
  - `dist/assets/main-[hash].js`
  - `dist/assets/vendor-[hash].js`
  - `dist/assets/dashboard-[hash].js`
  - `dist/assets/menus-[hash].js`
  - `dist/assets/main-[hash].css`
- **번들 크기 목표**: gzipped 기준 < 200KB (초기 로드)

## Development Server

```bash
npm run dev
# → http://localhost:5173/admin/login
```

**참고**: 개발 서버는 Backend API (Unit 1)가 localhost:8000에서 실행 중이어야 로그인 등 API 호출이 동작합니다.

## Docker Build

```bash
docker build -t table-order-frontend .
docker run -p 3000:80 table-order-frontend
# → http://localhost:3000/admin/login
```

## Troubleshooting

### Build Fails with Dependency Errors
- **원인**: node_modules 손상 또는 버전 불일치
- **해결**: `rm -rf node_modules package-lock.json && npm install`

### TypeScript Compilation Errors
- **원인**: 타입 불일치 또는 strict mode 위반
- **해결**: `npx tsc --noEmit` 실행 후 에러 메시지 확인 및 수정

### Tailwind CSS Not Applied
- **원인**: content 경로 설정 오류
- **해결**: `tailwind.config.js`의 content 배열에 `./src/**/*.{ts,tsx}` 포함 확인
