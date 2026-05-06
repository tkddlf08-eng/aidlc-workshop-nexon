# Admin Frontend - Tech Stack Decisions

## 핵심 기술 스택

| 영역 | 기술 | 버전 | 선택 이유 |
|------|------|------|-----------|
| **프레임워크** | React | 18.x | 컴포넌트 기반, 생태계 풍부 |
| **언어** | TypeScript | 5.x | 타입 안전성, 개발 생산성 |
| **빌드 도구** | Vite | 5.x | 빠른 HMR, ESM 기반, 현재 표준 |
| **상태 관리** | Zustand | 4.x | 경량, 보일러플레이트 최소, React 친화적 |
| **스타일링** | Tailwind CSS | 3.x | 유틸리티 퍼스트, 빠른 개발, 번들 최적화 |
| **라우팅** | React Router | 6.x | SPA 라우팅 표준 |
| **HTTP 클라이언트** | Axios | 1.x | 인터셉터, 에러 처리, 타입 지원 |
| **드래그앤드롭** | @dnd-kit/core | 6.x | 경량, 접근성 우수, React 전용 |
| **아이콘** | Lucide React | latest | 경량, 일관된 스타일, Tree-shakeable |
| **날짜 처리** | date-fns | 3.x | 경량, Tree-shakeable, 불변 |

---

## 개발 도구

| 도구 | 용도 |
|------|------|
| **ESLint** | 코드 린팅 (eslint-config-react-app 기반) |
| **Prettier** | 코드 포맷팅 |
| **Vitest** | 단위 테스트 러너 |
| **React Testing Library** | 컴포넌트 테스트 |
| **TypeScript** | 타입 체크 (strict mode) |

---

## 프로젝트 설정

### Vite 설정
```typescript
// vite.config.ts
{
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          state: ['zustand'],
          ui: ['@dnd-kit/core', '@dnd-kit/sortable', 'lucide-react']
        }
      }
    }
  }
}
```

### TypeScript 설정
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Tailwind CSS 설정
```javascript
// tailwind.config.js
{
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        danger: '#DC2626',
        success: '#16A34A',
        warning: '#D97706',
        pending: '#6B7280',
      }
    }
  }
}
```

---

## 의존성 목록

### Production Dependencies
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "react-router-dom": "^6.20.0",
  "zustand": "^4.5.0",
  "axios": "^1.6.0",
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.0",
  "lucide-react": "^0.300.0",
  "date-fns": "^3.0.0"
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.3.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0",
  "eslint": "^8.55.0",
  "prettier": "^3.1.0",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/jest-dom": "^6.1.0",
  "jsdom": "^23.0.0"
}
```

---

## 환경 변수

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SSE_URL=http://localhost:8000/api/orders/stream

# .env.production
VITE_API_BASE_URL=/api
VITE_SSE_URL=/api/orders/stream
```

---

## 코드 분할 전략

| 청크 | 포함 내용 | 로딩 시점 |
|------|-----------|-----------|
| `main` | App shell, Router, Layout | 즉시 |
| `login` | LoginPage | /admin/login 접근 시 |
| `dashboard` | DashboardPage, OrderDrawer | /admin/dashboard 접근 시 |
| `menus` | MenuManagementPage, DnD | /admin/menus 접근 시 |
| `history` | OrderHistoryPage | /admin/tables/:id/history 접근 시 |
| `vendor` | react, react-dom, react-router | 즉시 (캐시) |

---

## Zustand 설정 (미들웨어 없음)

```typescript
// 기본 Zustand 사용 (미들웨어 없음)
// 토큰은 수동으로 localStorage 관리
// 이유: 단순성 유지, 불필요한 자동 직렬화 방지

import { create } from 'zustand';

// 토큰 저장/복원은 명시적으로 처리
const useAdminAuthStore = create<AdminAuthState>((set) => ({
  token: localStorage.getItem('admin_token'),
  // ...
}));
```
