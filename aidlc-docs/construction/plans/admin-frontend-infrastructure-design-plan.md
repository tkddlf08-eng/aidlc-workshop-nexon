# Admin Frontend - Infrastructure Design Plan

## 개요
Unit 3 (Admin Frontend)의 인프라 설계를 수행합니다.

## Execution Plan

### Phase 1: 호스팅 인프라
- [x] 개발 환경 설정 (Vite Dev Server + Proxy)
- [x] 프로덕션 환경 설정 (S3 + CloudFront)
- [x] 환경별 설정 분리

### Phase 2: 배포 아키텍처
- [x] Docker 설정 (멀티스테이지 빌드)
- [x] Nginx SPA 라우팅 + API 프록시
- [x] CI/CD 파이프라인 (GitHub Actions)
- [x] 롤백 전략

### Phase 3: 보안 및 모니터링
- [x] HTTPS 설정 (CloudFront + ACM)
- [x] 보안 헤더 (CSP, X-Frame-Options 등)
- [x] S3 접근 제어 (OAI)
- [x] 모니터링 전략 (MVP 수준)
