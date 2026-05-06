# NFR Requirements — Unit 1 (Backend API)

## 1. 성능 요구사항 (Performance)

### NFR-PERF-01: API 응답 시간
| 항목 | 목표 |
|------|------|
| 일반 REST API (CRUD) | P95 < 200ms |
| 복합 조회 (대시보드, 히스토리) | P95 < 500ms |
| SSE 이벤트 전달 | < 2초 (주문 생성 → 관리자 화면 반영) |
| 이미지 업로드 | < 3초 (5MB 기준) |

### NFR-PERF-02: 동시 처리 용량
| 항목 | 목표 |
|------|------|
| 최대 동시 연결 | 20 |
| SSE 동시 연결 | 11 (10 테이블 + 1 관리자) |
| 초당 요청 처리 | 50 RPS (피크 타임) |
| DB 동시 쿼리 | 20 (연결 풀 최대) |

### NFR-PERF-03: 데이터베이스 성능
| 항목 | 목표 |
|------|------|
| 연결 풀 | 최소 5, 최대 20 (탄력적) |
| 쿼리 타임아웃 | 5초 |
| 슬로우 쿼리 기준 | 1초 이상 → 로깅 |
| 인덱스 전략 | 자주 조회되는 필터 조건에 복합 인덱스 |

---

## 2. 가용성 요구사항 (Availability)

### NFR-AVAIL-01: 운영 시간
| 항목 | 목표 |
|------|------|
| 목표 가용성 | 99% (매장 영업 시간 기준) |
| 허용 다운타임 | 월 7시간 (비영업 시간 유지보수) |
| 재시작 시간 | < 30초 (Docker 컨테이너 재시작) |

### NFR-AVAIL-02: 장애 복구
| 항목 | 전략 |
|------|------|
| 애플리케이션 장애 | Docker restart policy: always |
| DB 장애 | Docker volume 영속화 + 일일 백업 |
| SSE 연결 끊김 | 클라이언트 자동 재연결 (5초 간격) |
| 데이터 손실 방지 | MySQL binlog + 일일 mysqldump |

---

## 3. 보안 요구사항 (Security)

### NFR-SEC-01: 인증/인가
| 항목 | 구현 |
|------|------|
| 인증 방식 | JWT (HS256) |
| 관리자 토큰 만료 | 16시간 |
| 테이블 토큰 만료 | 없음 (물리적 접근 제어) |
| 비밀번호 해싱 | bcrypt (rounds=12) |
| 로그인 제한 | 관리자 5회/15분, 테이블 3회/5분 |

### NFR-SEC-02: API 보안
| 항목 | 구현 |
|------|------|
| Rate Limiting | 엔드포인트별 차등 적용 |
| CORS | 환경별 분리 (개발: 전체, 프로덕션: 특정 도메인) |
| 입력 검증 | Pydantic 모델 기반 자동 검증 |
| SQL Injection | SQLAlchemy ORM (파라미터 바인딩) |
| XSS 방지 | 응답 Content-Type 명시 + 입력 이스케이프 |

### NFR-SEC-03: Rate Limiting 상세
| 엔드포인트 그룹 | 제한 |
|----------------|------|
| 로그인 (`/auth/*`) | IP당 분당 10회 |
| 주문 생성 (`POST /orders`) | 테이블당 분당 20회 |
| 일반 조회 (`GET /*`) | IP당 분당 120회 |
| 관리자 변경 (`POST/PUT/DELETE`) | IP당 분당 60회 |
| SSE 연결 | 동시 연결 1개/클라이언트 |

### NFR-SEC-04: 데이터 보호
| 항목 | 구현 |
|------|------|
| 전송 암호화 | HTTPS (TLS 1.2+) — 프로덕션 |
| 저장 암호화 | 비밀번호 bcrypt, 기타 평문 (MVP) |
| 민감 정보 로깅 | 비밀번호, 토큰 로그 제외 |
| S3 접근 | IAM Role 기반, Presigned URL |

---

## 4. 신뢰성 요구사항 (Reliability)

### NFR-REL-01: 에러 처리
| 항목 | 전략 |
|------|------|
| 예상 에러 | 구조화된 에러 응답 (code, message, details) |
| 예상치 못한 에러 | 500 + 일반 메시지 + 상세 로깅 |
| DB 연결 실패 | 3회 재시도 (exponential backoff) |
| S3 업로드 실패 | 2회 재시도 후 에러 반환 |
| SSE 연결 끊김 | 서버: 클라이언트 목록에서 제거, 클라이언트: 자동 재연결 |

### NFR-REL-02: 데이터 일관성
| 항목 | 전략 |
|------|------|
| 주문 생성 | DB 트랜잭션 (원자적) |
| 이용 완료 | DB 트랜잭션 (아카이빙 + 집계 + 세션 종료) |
| 동시 수정 | Optimistic Locking (updated_at 비교) |
| SSE 이벤트 순서 | 이벤트 ID 순차 부여 (Last-Event-ID 지원) |

---

## 5. 운영/관측성 요구사항 (Observability)

### NFR-OBS-01: 로깅
| 항목 | 구현 |
|------|------|
| 형식 | 구조화 JSON |
| 레벨 | DEBUG, INFO, WARNING, ERROR, CRITICAL |
| 출력 | stdout (Docker logs 수집) |
| 포함 정보 | timestamp, level, module, message, request_id |
| 민감 정보 | 마스킹 (비밀번호, 토큰) |

### NFR-OBS-02: 헬스체크
| 항목 | 구현 |
|------|------|
| 엔드포인트 | `GET /health` |
| 확인 항목 | 앱 상태, DB 연결, S3 접근 |
| 응답 형식 | `{"status": "healthy", "db": "ok", "s3": "ok"}` |
| 주기 | Docker healthcheck 30초 간격 |

### NFR-OBS-03: 모니터링 (MVP)
| 항목 | 구현 |
|------|------|
| 에러 모니터링 | 로그 파일 기반 수동 확인 |
| 성능 모니터링 | 슬로우 쿼리 로깅 (1초 이상) |
| SSE 연결 상태 | 연결 수 로깅 (INFO 레벨) |
| 향후 확장 | Sentry, CloudWatch 연동 예정 |

---

## 6. 유지보수성 요구사항 (Maintainability)

### NFR-MAINT-01: 코드 품질
| 항목 | 기준 |
|------|------|
| 린터 | ruff (Python linter + formatter) |
| 타입 힌트 | 모든 함수 시그니처에 타입 명시 |
| 문서화 | 공개 API에 docstring |
| 코드 구조 | Feature-based 모듈 분리 |

### NFR-MAINT-02: 테스트
| 항목 | 기준 |
|------|------|
| 프레임워크 | pytest + pytest-asyncio |
| HTTP 클라이언트 | httpx (AsyncClient) |
| DB 테스트 | 테스트용 DB + 트랜잭션 롤백 |
| 커버리지 목표 | 80% (핵심 비즈니스 로직 100%) |
| CI 연동 | GitHub Actions (향후) |

### NFR-MAINT-03: 환경 설정
| 항목 | 구현 |
|------|------|
| 관리 도구 | pydantic-settings |
| 환경 분리 | .env.development, .env.production |
| 필수 설정 | DB URL, JWT Secret, S3 설정 |
| 기본값 | 개발 환경 기본값 제공 (로컬 실행 즉시 가능) |

### NFR-MAINT-04: DB 마이그레이션
| 항목 | 구현 |
|------|------|
| 도구 | Alembic + autogenerate |
| 워크플로우 | 모델 변경 → `alembic revision --autogenerate` → 리뷰 → `alembic upgrade head` |
| 버전 관리 | 마이그레이션 파일 Git 추적 |
| 롤백 | `alembic downgrade -1` 지원 |

---

## 7. 확장성 고려사항 (Scalability Notes)

### 현재 (MVP)
- 단일 서버, 단일 DB
- 인메모리 SSE 연결 관리
- 인메모리 Rate Limiting (slowapi)

### 향후 확장 시
| 현재 | 확장 시 |
|------|---------|
| 인메모리 SSE | Redis Pub/Sub |
| 인메모리 Rate Limit | Redis 기반 분산 Rate Limit |
| 단일 DB | Read Replica 분리 |
| Docker Compose | ECS/Kubernetes |
| 로그 파일 | CloudWatch + Sentry |
| .env 시크릿 | AWS Secrets Manager |
