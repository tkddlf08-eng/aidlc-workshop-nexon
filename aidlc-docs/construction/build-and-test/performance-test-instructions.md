# Performance Test Instructions - Admin Frontend (Unit 3)

## Performance Requirements (NFR)
- **FCP (First Contentful Paint)**: < 1.5초
- **LCP (Largest Contentful Paint)**: < 2.5초
- **TTI (Time to Interactive)**: < 3초
- **초기 번들 크기 (gzipped)**: < 200KB
- **SSE 이벤트 → UI 반영**: < 2초

## Bundle Size Analysis

### 1. 빌드 후 번들 크기 확인
```bash
cd table-order/frontend
npm run build

# Vite 빌드 출력에서 파일 크기 확인
# dist/assets/main-[hash].js     → 메인 번들
# dist/assets/vendor-[hash].js   → 라이브러리 번들
```

### 2. 번들 분석 (선택)
```bash
# vite-plugin-visualizer 설치 후
npx vite-bundle-visualizer
```

### 3. 크기 기준
| 청크 | 목표 (gzipped) |
|------|---------------|
| main | < 50KB |
| vendor | < 80KB |
| dashboard | < 30KB |
| menus | < 30KB |
| 합계 (초기) | < 200KB |

## Web Vitals 측정

### 1. Lighthouse 실행
```bash
# Chrome DevTools → Lighthouse 탭
# 또는 CLI:
npx lighthouse http://localhost:5173/admin/dashboard --output=json
```

### 2. 측정 항목
| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| FCP | < 1.5s | Lighthouse |
| LCP | < 2.5s | Lighthouse |
| TTI | < 3s | Lighthouse |
| CLS | < 0.1 | Lighthouse |

## SSE 실시간 성능 측정

### 1. 수동 측정
```
1. 대시보드 열기
2. Chrome DevTools → Network 탭 → EventStream 필터
3. Backend에서 주문 생성 API 호출 (타임스탬프 기록)
4. 대시보드에 주문 표시되는 시점 확인
5. 차이 = SSE 지연 시간
```

### 2. 기준
- 정상: < 1초
- 허용: < 2초
- 실패: > 2초

## 리렌더링 성능

### React DevTools Profiler
1. React DevTools 설치
2. Profiler 탭 → Record
3. SSE 이벤트 수신 시 리렌더링 범위 확인
4. 변경된 테이블 카드만 리렌더되는지 확인 (memo 동작 검증)

## Performance Optimization Checklist

- [ ] 코드 분할 동작 확인 (Network 탭에서 lazy 로딩 확인)
- [ ] 이미지 lazy loading 동작 확인
- [ ] Zustand selector로 불필요한 리렌더 방지 확인
- [ ] React.memo 적용된 컴포넌트 리렌더 최소화 확인
- [ ] 번들 크기 목표 달성 확인
