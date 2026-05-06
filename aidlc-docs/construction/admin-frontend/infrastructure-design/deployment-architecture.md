# Admin Frontend - Deployment Architecture

## 배포 환경 구성

### 환경 분리

| 환경 | 용도 | 배포 방식 |
|------|------|-----------|
| Local | 개발 | Vite Dev Server (포트 5173) |
| Production | 운영 | S3 + CloudFront |

> **참고**: MVP 단계에서는 Staging 환경 생략. 필요 시 추후 추가.

---

## Docker 설정 (개발 환경 통합)

### Dockerfile (멀티스테이지 빌드)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 설정 (SPA 라우팅)

```nginx
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA 라우팅 — 모든 경로를 index.html로
    location /admin {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시 (Docker Compose 환경)
    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        
        # SSE 지원
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }

    # 정적 파일 캐싱
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker Compose (전체 시스템 로컬 실행)

```yaml
# docker-compose.yml (Unit 1이 관리, Unit 3 참조용)
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mysql://...
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: tableorder
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

---

## CI/CD 파이프라인 (GitHub Actions 예시)

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Admin Frontend

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: frontend
        run: npm ci
      
      - name: Type check
        working-directory: frontend
        run: npx tsc --noEmit
      
      - name: Lint
        working-directory: frontend
        run: npx eslint src/
      
      - name: Test
        working-directory: frontend
        run: npx vitest run
      
      - name: Build
        working-directory: frontend
        run: npm run build
      
      - name: Deploy to S3
        run: aws s3 sync frontend/dist/ s3://${{ secrets.S3_BUCKET }}/ --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} \
            --paths "/index.html" "/admin/*"
```

---

## 롤백 전략

### 즉시 롤백
1. S3 버전 관리 활성화 → 이전 버전으로 복원
2. `aws s3 cp s3://{bucket}/{previous-version}/ s3://{bucket}/ --recursive`
3. CloudFront 캐시 무효화

### 블루-그린 배포 (추후)
- 두 개의 S3 경로 (`/v1/`, `/v2/`)
- CloudFront Origin Path 전환으로 무중단 배포

---

## 개발 환경 설정 가이드

### 로컬 개발 시작

```bash
# 1. 프로젝트 클론
git clone {repo-url}
cd table-order/frontend

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.development

# 4. 개발 서버 시작
npm run dev
# → http://localhost:5173/admin/login

# 5. (선택) Backend와 함께 실행
cd ..
docker-compose up -d backend db
```

### 주요 스크립트

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/"
  }
}
```
