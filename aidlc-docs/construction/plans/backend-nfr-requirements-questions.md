# Unit 1 (Backend API) - NFR Requirements Questions

아래 질문에 답변해주세요. 각 질문의 [Answer]: 태그 뒤에 선택지 알파벳을 입력하시면 됩니다.

---

## Question 1
API 응답 시간 목표는 어떻게 설정할까요?

A) 일반 API 200ms 이내, SSE 이벤트 전달 2초 이내 (요구사항 기본)
B) 일반 API 100ms 이내, SSE 이벤트 전달 1초 이내 (고성능)
C) 일반 API 500ms 이내, SSE 이벤트 전달 3초 이내 (여유 있게)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
동시 접속 처리 규모는?

A) 최대 20 동시 연결 (10 테이블 + 관리자 + SSE 연결)
B) 최대 50 동시 연결 (향후 확장 고려)
C) 최대 100 동시 연결 (다중 매장 확장 대비)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
데이터베이스 연결 풀 설정은?

A) 최소 5, 최대 10 연결 (소규모 매장 적합)
B) 최소 10, 최대 20 연결 (여유 있게)
C) 최소 5, 최대 20 연결 (탄력적)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 4
로깅 전략은 어떻게 할까요?

A) 구조화 로깅 (JSON) + 로그 레벨 분리 (DEBUG/INFO/WARNING/ERROR)
B) 단순 텍스트 로깅 + 파일 로테이션
C) 구조화 로깅 + 외부 로그 수집 서비스 연동 (CloudWatch 등)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
에러 모니터링/알림은 어떻게 할까요?

A) 로그 파일 기반 수동 확인 (MVP 수준)
B) Sentry 등 에러 트래킹 서비스 연동
C) CloudWatch Alarms + SNS 알림
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6
API Rate Limiting은 적용할까요?

A) 적용하지 않음 (내부 네트워크 + 소규모)
B) 기본 적용 — IP당 분당 60회 제한
C) 엔드포인트별 차등 적용 (로그인 엄격, 조회 느슨)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 7
CORS (Cross-Origin Resource Sharing) 정책은?

A) 프론트엔드 도메인만 허용 (프로덕션 도메인 + localhost 개발용)
B) 모든 origin 허용 (개발 편의)
C) 환경별 분리 — 개발은 전체 허용, 프로덕션은 특정 도메인만
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 8
테스트 전략은 어떻게 할까요?

A) 단위 테스트 + 통합 테스트 (pytest, 커버리지 80% 목표)
B) 단위 테스트만 (pytest, 핵심 로직 위주)
C) 단위 + 통합 + E2E 테스트 (pytest + httpx)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9
환경 설정 관리 방식은?

A) .env 파일 + pydantic-settings (환경별 분리)
B) .env 파일만 (단순)
C) AWS Secrets Manager + .env 조합
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 10
DB 마이그레이션 도구는?

A) Alembic (SQLAlchemy 공식 마이그레이션 도구)
B) 수동 SQL 스크립트 관리
C) Alembic + 자동 마이그레이션 생성 (autogenerate)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---
