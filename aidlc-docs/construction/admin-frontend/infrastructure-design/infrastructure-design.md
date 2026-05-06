# Admin Frontend - Infrastructure Design

## 개요

Unit 3 (Admin Frontend)는 React SPA로, 빌드된 정적 파일을 호스팅하는 구조입니다.
Backend API (Unit 1)와는 HTTP/SSE로 통신하며, 프론트엔드 자체는 서버 사이드 로직이 없습니다.

---

## 1. 인프라 구성 요소

### 1.1 개발 환경 (Local Development)

| 구성 요소 | 도구 | 설명 |
|-----------|------|------|
| Dev Server | Vite Dev Server | HMR, 포트 5173 |
| API Proxy | Vite proxy 설정 | `/api` → `http://localhost:8000` |
| 환경 변수 | `.env.development` | `VITE_API_BASE_URL=http://localhost:8000/api` |

```typescript
// vite.config.ts - 개발 환경 프록시
{
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
}
```

### 1.2 프로덕션 환경 (AWS)

| 구성 요소 | AWS 서비스 | 설명 |
|-----------|-----------|------|
| 정적 파일 호스팅 | S3 Bucket | 빌드된 SPA 파일 저장 |
| CDN | CloudFront | 글로벌 캐싱, HTTPS |
| DNS | Route 53 (선택) | 커스텀 도메인 |
| API 라우팅 | CloudFront Origin | `/api/*` → Backend ALB |

---

## 2. 배포 아키텍처

```
                    ┌─────────────────┐
                    │   CloudFront    │
                    │   (CDN/HTTPS)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │  S3 Bucket │  │  Backend   │  │  Backend   │
     │  (Static)  │  │  ALB/API   │  │  SSE       │
     │            │  │  /api/*    │  │  /api/     │
     │  *.html    │  │            │  │  orders/   │
     │  *.js      │  │            │  │  stream    │
     │  *.css     │  │            │  │            │
     └────────────┘  └────────────┘  └────────────┘
         /admin/*       /api/*         /api/orders/
                                        stream
```

### 2.1 CloudFront 설정

| 설정 | 값 |
|------|-----|
| Default Origin | S3 Bucket (정적 파일) |
| API Origin | Backend ALB (`/api/*`) |
| Default Root Object | `index.html` |
| Error Pages | 403/404 → `/index.html` (SPA 라우팅) |
| Cache Policy (Static) | 1년 (파일명에 해시 포함) |
| Cache Policy (API) | No Cache (Pass-through) |
| SSE 설정 | `/api/orders/stream` → TTL 0, 스트리밍 허용 |

### 2.2 S3 Bucket 설정

| 설정 | 값 |
|------|-----|
| Bucket Name | `{project}-admin-frontend-{env}` |
| Static Website Hosting | 비활성화 (CloudFront OAI 사용) |
| Public Access | 차단 (CloudFront OAI만 허용) |
| Versioning | 활성화 (롤백 지원) |
| Lifecycle | 이전 버전 30일 후 삭제 |

---

## 3. 빌드 및 배포 파이프라인

### 3.1 빌드 프로세스

```bash
# 1. 의존성 설치
npm ci

# 2. 타입 체크
npx tsc --noEmit

# 3. 린트
npx eslint src/

# 4. 테스트
npx vitest run

# 5. 프로덕션 빌드
npx vite build

# 6. 빌드 결과물
# dist/
#   ├── index.html
#   ├── assets/
#   │   ├── main-[hash].js
#   │   ├── vendor-[hash].js
#   │   ├── dashboard-[hash].js
#   │   ├── menus-[hash].js
#   │   └── main-[hash].css
#   └── favicon.ico
```

### 3.2 배포 프로세스

```bash
# 1. S3에 빌드 결과물 업로드
aws s3 sync dist/ s3://{bucket-name}/ --delete

# 2. CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id {distribution-id} \
  --paths "/index.html" "/admin/*"
```

### 3.3 환경별 설정

| 환경 | API URL | 빌드 명령 |
|------|---------|-----------|
| Development | `http://localhost:8000/api` | `vite dev` |
| Staging | `https://staging-api.example.com/api` | `vite build --mode staging` |
| Production | `/api` (same origin via CloudFront) | `vite build` |

---

## 4. 모니터링 및 로깅

### 4.1 프론트엔드 모니터링 (MVP 범위)

| 항목 | 방식 |
|------|------|
| 에러 추적 | `window.onerror` + Error Boundary 로깅 |
| 성능 측정 | Web Vitals (FCP, LCP, TTI) 콘솔 로그 |
| SSE 연결 상태 | UI 인디케이터 (사용자 확인용) |

> **참고**: Sentry, DataDog 등 외부 모니터링 도구는 MVP 이후 도입 검토

### 4.2 CloudFront 모니터링

| 항목 | 도구 |
|------|------|
| 요청 수/에러율 | CloudFront 기본 메트릭 (CloudWatch) |
| 캐시 히트율 | CloudFront 통계 |
| 4xx/5xx 에러 | CloudWatch Alarms |

---

## 5. 보안 설정

### 5.1 HTTPS
- CloudFront에서 HTTPS 강제 (HTTP → HTTPS 리다이렉트)
- ACM (AWS Certificate Manager) 무료 SSL 인증서

### 5.2 보안 헤더 (CloudFront Response Headers Policy)
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://*.s3.amazonaws.com data:; connect-src 'self' https://api.example.com
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 5.3 S3 접근 제어
- Public Access 완전 차단
- CloudFront OAI (Origin Access Identity)로만 접근 허용
- Bucket Policy에 OAI만 허용

---

## 6. 비용 예측 (소규모 매장 기준)

| 서비스 | 예상 월 비용 | 비고 |
|--------|-------------|------|
| S3 | < $1 | 정적 파일 수 MB |
| CloudFront | < $5 | 소규모 트래픽 |
| Route 53 | $0.50 | 호스팅 존 (선택) |
| **합계** | **< $7/월** | |

> **참고**: Backend (Unit 1) 인프라 비용은 별도
