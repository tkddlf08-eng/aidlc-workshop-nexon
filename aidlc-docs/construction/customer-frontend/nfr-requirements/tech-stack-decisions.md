# Tech Stack Decisions - Customer Frontend

## 핵심 기술 스택

| 영역 | 기술 | 버전 | 선택 이유 |
|------|------|------|-----------|
| **UI 프레임워크** | React | 18.x | 컴포넌트 기반, 생태계 풍부, 팀 숙련도 |
| **언어** | TypeScript | 5.x | 타입 안전성, IDE 지원, 리팩토링 용이 |
| **상태 관리** | Zustand | 4.x | 경량, 보일러플레이트 최소, persist 미들웨어 |
| **라우팅** | React Router | 6.x | SPA 라우팅 표준 |
| **HTTP 클라이언트** | Axios | 1.x | 인터셉터, 에러 핸들링, 타입 지원 |
| **빌드 도구** | Vite | 5.x | 빠른 HMR, 번들 최적화, 설정 간단 |
| **스타일링** | Tailwind CSS | 3.x | 유틸리티 퍼스트, 빠른 UI 개발, 일관성 |
| **테스트** | Vitest + RTL | - | Vite 네이티브, React Testing Library |
| **린팅** | ESLint + Prettier | - | 코드 품질 + 포맷팅 자동화 |
| **Mock API** | MSW | 2.x | 개발 시 백엔드 독립, 테스트 재사용 |

---

## 주요 라이브러리

| 라이브러리 | 용도 | 선택 이유 |
|-----------|------|-----------|
| `zustand/middleware` | persist (localStorage 동기화) | 장바구니 영속성 |
| `axios` | HTTP 요청 | 인터셉터로 토큰 자동 첨부, 에러 핸들링 |
| `react-router-dom` | 클라이언트 라우팅 | 표준 SPA 라우팅 |
| `react-hot-toast` | 토스트 알림 | 경량, 커스터마이징 용이 |
| `@tanstack/react-query` | 서버 상태 관리 | API 캐싱, 자동 재요청, 로딩/에러 상태 자동 관리 |

---

## 개발 환경 설정

### package.json 핵심 의존성
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "react-hot-toast": "^2.4.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "msw": "^2.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

---

## 대안 검토 및 기각 사유

| 대안 | 기각 사유 |
|------|-----------|
| Next.js | SSR 불필요 (태블릿 SPA), 복잡도 증가 |
| Redux Toolkit | 이 규모에 과도한 보일러플레이트 |
| CSS Modules | Tailwind 대비 개발 속도 느림 |
| Styled Components | 런타임 CSS-in-JS 성능 오버헤드 |
| Webpack | Vite 대비 설정 복잡, HMR 느림 |
| Jest | Vitest가 Vite 프로젝트에 네이티브 통합 |
