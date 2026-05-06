# Build Instructions - Customer Frontend

## 사전 요구사항

- **Node.js**: 18.x 이상
- **npm**: 9.x 이상

### Node.js 설치 확인
```bash
node --version   # v18.x.x 이상
npm --version    # 9.x.x 이상
```

### Node.js 미설치 시
- Windows: https://nodejs.org/ 에서 LTS 버전 다운로드
- 또는 nvm-windows 사용: https://github.com/coreybutler/nvm-windows

---

## 빌드 단계

### 1. 의존성 설치
```bash
cd frontend
npm install
```

### 2. TypeScript 타입 체크
```bash
npx tsc --noEmit
```
- 에러 없이 완료되어야 함
- 타입 에러 발생 시 해당 파일 수정 필요

### 3. ESLint 린트 체크
```bash
npx eslint src/ --ext .ts,.tsx
```
- 경고(warning)는 허용, 에러(error)는 수정 필요

### 4. 프로덕션 빌드
```bash
npx vite build
```
- `dist/` 디렉토리에 빌드 결과물 생성
- 번들 사이즈 확인: 500KB (gzipped) 이하 목표

### 5. 빌드 결과 확인
```bash
npx vite preview
```
- http://localhost:4173 에서 프로덕션 빌드 미리보기

---

## 개발 서버 실행

```bash
cd frontend
npm run dev
```
- http://localhost:5173 에서 개발 서버 시작
- MSW Mock이 활성화되어 백엔드 없이 동작
- Hot Module Replacement (HMR) 지원

---

## 예상 빌드 출력

```
vite v5.x.x building for production...
✓ 40 modules transformed.
dist/index.html                  0.5 kB
dist/assets/vendor-xxxxx.js      ~150 kB (gzip)
dist/assets/state-xxxxx.js       ~30 kB (gzip)
dist/assets/index-xxxxx.js       ~80 kB (gzip)
dist/assets/index-xxxxx.css      ~20 kB (gzip)
✓ built in x.xxs
```

---

## 트러블슈팅

| 문제 | 해결 방법 |
|------|-----------|
| `Cannot find module '@shared/...'` | tsconfig.json의 paths 설정 확인, vite.config.ts의 alias 확인 |
| `Module not found: msw` | `npm install` 재실행 |
| 포트 5173 사용 중 | `npx vite --port 3000` |
| Tailwind 스타일 미적용 | `tailwind.config.js`의 content 경로 확인 |
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
