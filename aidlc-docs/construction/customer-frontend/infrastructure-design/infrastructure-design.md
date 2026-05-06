# Infrastructure Design - Customer Frontend

## 1. 배포 아키텍처

```
+------------------+       +-------------------+       +------------------+
|   Developer      |       |    AWS S3         |       |   CloudFront     |
|   (빌드 후 업로드) | ----> |   (Static Host)   | ----> |   (CDN)          |
+------------------+       +-------------------+       +------------------+
                                                              |
                                                              v
                                                       +------------------+
                                                       |   고객 태블릿     |
                                                       |   (브라우저)      |
                                                       +------------------+
                                                              |
                                                              | REST / SSE
                                                              v
                                                       +------------------+
                                                       |   Backend API    |
                                                       |   (Unit 1)       |
                                                       +------------------+
```

---

## 2. 호스팅 전략

### 정적 파일 호스팅 (AWS S3 + CloudFront)

| 항목 | 설정 |
|------|------|
| **S3 Bucket** | `table-order-frontend` (정적 웹 호스팅 활성화) |
| **CloudFront** | S3 Origin, HTTPS 강제, gzip 압축 |
| **도메인** | CloudFront 기본 도메인 (MVP) 또는 커스텀 도메인 |
| **캐시 정책** | HTML: no-cache / JS,CSS,이미지: max-age=1년 (해시 파일명) |
| **SPA 라우팅** | 404 → index.html 리다이렉트 (CloudFront Error Pages) |

### 선택 이유
- React SPA는 정적 파일 → S3가 가장 단순하고 저렴
- CloudFront로 HTTPS + 캐싱 + 글로벌 엣지 (국내 매장이라 큰 의미 없지만 HTTPS 필수)
- 서버 관리 불필요

---

## 3. 빌드 및 배포 파이프라인

### 빌드 프로세스
```bash
# 1. 의존성 설치
npm ci

# 2. 타입 체크
npx tsc --noEmit

# 3. 린트
npx eslint src/ --ext .ts,.tsx

# 4. 테스트
npx vitest run

# 5. 프로덕션 빌드
npx vite build

# 6. 결과물: dist/ 디렉토리
```

### 배포 프로세스
```bash
# S3에 업로드
aws s3 sync dist/ s3://table-order-frontend --delete

# CloudFront 캐시 무효화 (HTML만)
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/index.html"
```

---

## 4. 환경 설정

### 환경 변수 (.env)
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_ENV=development

# .env.production
VITE_API_BASE_URL=https://api.table-order.example.com
VITE_APP_ENV=production
```

### Vite 환경 변수 접근
```typescript
// shared/constants/config.ts
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  APP_ENV: import.meta.env.VITE_APP_ENV,
  IS_DEV: import.meta.env.DEV,
};
```

---

## 5. 개발 환경

### 로컬 개발 구성
```yaml
# docker-compose.dev.yml (프론트엔드 개발 시)
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"    # Vite dev server
    volumes:
      - ./frontend/src:/app/src
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
```

### MSW (Mock Service Worker) 개발 모드
```typescript
// src/main.tsx
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
  const { worker } = await import('./mocks/browser');
  await worker.start();
}
```

- 백엔드 없이 독립 개발 시: `VITE_ENABLE_MSW=true`
- 백엔드 연동 시: MSW 비활성화

---

## 6. 모니터링 (MVP 최소)

| 항목 | 도구 | 용도 |
|------|------|------|
| 에러 추적 | 브라우저 console (MVP) | 클라이언트 에러 확인 |
| 성능 측정 | Lighthouse CI (빌드 시) | LCP, FCP, 번들 사이즈 |
| 가용성 | CloudFront 기본 메트릭 | 요청 수, 에러율 |

---

## 7. CORS 설정

프론트엔드(CloudFront)와 백엔드(별도 도메인)가 분리되므로:

- **Backend (Unit 1)에서 설정**:
  ```python
  # FastAPI CORS 미들웨어
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://table-order-frontend.cloudfront.net"],
      allow_methods=["*"],
      allow_headers=["*"],
      allow_credentials=True,
  )
  ```

- **개발 환경**: `allow_origins=["http://localhost:5173"]`

---

## 8. 비용 예측 (MVP)

| 서비스 | 예상 비용 | 비고 |
|--------|-----------|------|
| S3 | ~$0.5/월 | 정적 파일 수 MB |
| CloudFront | ~$1/월 | 소규모 트래픽 (단일 매장) |
| **합계** | **~$1.5/월** | 프론트엔드 호스팅 비용 |
