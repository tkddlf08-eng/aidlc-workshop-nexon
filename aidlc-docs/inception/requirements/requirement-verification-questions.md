# Requirements Verification Questions

테이블오더 서비스 요구사항을 분석했습니다. 아래 질문에 답변해 주세요.
각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.

---

## Question 1
백엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) Node.js + Express (JavaScript/TypeScript)
B) Python + FastAPI
C) Java + Spring Boot
D) Go + Gin/Echo
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2
프론트엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) React (JavaScript/TypeScript)
B) Vue.js
C) Next.js (React 기반 풀스택)
D) Svelte/SvelteKit
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
데이터베이스로 어떤 것을 사용하시겠습니까?

A) PostgreSQL (관계형)
B) MySQL/MariaDB (관계형)
C) MongoDB (NoSQL Document)
D) DynamoDB (AWS NoSQL)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 4
배포 환경은 어디를 대상으로 하시겠습니까?

A) AWS (EC2, ECS, Lambda 등)
B) 로컬/온프레미스 서버 (Docker Compose 등)
C) Vercel/Netlify (프론트) + AWS/GCP (백엔드)
D) 배포 환경은 나중에 결정 (개발 환경만 우선 구성)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
프로젝트 아키텍처 패턴은 어떤 것을 선호하시겠습니까?

A) 모놀리식 (프론트엔드 + 백엔드 하나의 프로젝트)
B) 프론트엔드/백엔드 분리 (별도 프로젝트)
C) 풀스택 프레임워크 (Next.js, Nuxt.js 등 하나의 프로젝트에서 프론트+백엔드)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
매장(Store) 관리 범위는 어떻게 되나요? 이 시스템은 단일 매장용인가요, 다중 매장(멀티테넌트)용인가요?

A) 단일 매장 전용 (하나의 매장만 관리)
B) 다중 매장 지원 (여러 매장이 각각 독립적으로 사용)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
메뉴 이미지 관리는 어떻게 하시겠습니까?

A) 외부 이미지 URL 직접 입력 (별도 이미지 호스팅 사용)
B) 서버에 이미지 파일 업로드 기능 포함
C) AWS S3 등 클라우드 스토리지에 업로드
D) MVP에서는 이미지 URL 직접 입력만 지원
E) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 8
관리자 계정 관리 범위는 어떻게 되나요?

A) 사전 설정된 단일 관리자 계정 (DB에 직접 등록)
B) 관리자 회원가입 기능 포함
C) 슈퍼 관리자가 하위 관리자 계정을 생성/관리
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9
테이블 수는 매장당 어느 정도를 예상하시나요? (성능 설계 기준)

A) 소규모 (1~10개 테이블)
B) 중규모 (11~30개 테이블)
C) 대규모 (31~100개 테이블)
D) 규모 무관 (확장 가능하게 설계)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 10
주문 상태 변경 흐름은 요구사항에 "대기중/준비중/완료" 3단계로 명시되어 있습니다. 이 흐름이 맞나요?

A) 맞습니다 (대기중 → 준비중 → 완료, 3단계)
B) "접수" 단계를 추가하고 싶습니다 (대기중 → 접수 → 준비중 → 완료)
C) "취소" 상태도 필요합니다 (대기중/준비중/완료/취소)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 11: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes — 모든 SECURITY 규칙을 blocking constraint로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 모든 SECURITY 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 12: Property-Based Testing Extension
이 프로젝트에 Property-Based Testing (PBT) 규칙을 적용하시겠습니까?

A) Yes — 모든 PBT 규칙을 blocking constraint로 적용 (비즈니스 로직, 데이터 변환이 있는 프로젝트에 권장)
B) Partial — 순수 함수와 직렬화 round-trip에만 PBT 규칙 적용
C) No — 모든 PBT 규칙 건너뛰기 (단순 CRUD, UI 전용 프로젝트에 적합)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

답변을 모두 작성하신 후 알려주세요!
