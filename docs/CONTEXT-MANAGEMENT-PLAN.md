# Cursor 컨텍스트 관리 & 스킬 최적화 계획

> 작성일: 2026-02-07
> 목적: Cursor 에이전트의 컨텍스트 효율을 극대화하고, 세션이 거듭될수록 똑똑해지는 에이전트를 구축

---

## 목차

1. [현황 진단](#1-현황-진단)
2. [Phase 1: Rules 정리 (즉시)](#2-phase-1-rules-정리)
3. [Phase 2: Skills 도입 (1주차)](#3-phase-2-skills-도입)
4. [Phase 3: Sub-agent 활용 패턴 (2주차)](#4-phase-3-sub-agent-활용-패턴)
5. [Phase 4: 지속적 개선 루프 (상시)](#5-phase-4-지속적-개선-루프)
6. [도구별 비교표](#6-도구별-비교표)
7. [체크리스트](#7-체크리스트)

---

## 1. 현황 진단

### 현재 Rules 구성 (11개 파일, 약 900줄)

| 파일 | 적용 방식 | 줄 수 | 문제 |
|------|-----------|-------|------|
| `project-overview.mdc` | alwaysApply | ~60 | 축소 필요 |
| `coding-standards.mdc` | alwaysApply | ~70 | 적절 |
| `security.mdc` | alwaysApply | ~15 | 적절 |
| `nestjs-conventions.mdc` | globs | ~302 | **너무 거대** — 분리 필요 |
| `nestjs-testing.mdc` | globs | ~60 | TDD 부분이 testing-tdd.mdc와 중복 |
| `react-conventions.mdc` | globs | ~120 | React Query 관련 내용이 미사용 기술 |
| `react-testing.mdc` | globs | ~60 | TDD 부분이 testing-tdd.mdc와 중복 |
| `testing-tdd.mdc` | globs | ~60 | 위 2개와 중복 |
| `gemini-integration.mdc` | globs | ~40 | 적절 |
| `swagger-guidelines.mdc` | globs | ~90 | nestjs-conventions와 부분 중복 |
| `dev-commands.mdc` | manual | ~60 | 적절 |

### 핵심 문제 요약

- **중복**: TDD 규칙 3곳 반복 / Swagger ↔ NestJS 겹침
- **과대**: nestjs-conventions.mdc 302줄 (권장 50줄 이하)
- **부재**: Tailwind v4, WebSocket, 인증 초기화, 디자인 시스템, Docker 규칙 없음
- **유령 규칙**: React Query를 강조하지만 실제 프로젝트에서 미사용

---

## 2. Phase 1: Rules 정리

> 목표: alwaysApply 총량 70줄 이하, 개별 Rule 50줄 이하, 중복 제거

### 2-1. project-overview.mdc 축소

기술 스택 표 제거. 폴더 구조 + DB 스키마 + 핵심 요약만 유지 (~20줄).

### 2-2. nestjs-conventions.mdc 분리

| 새 파일 | 내용 | globs | 줄 수 |
|---------|------|-------|-------|
| `nestjs-module-patterns.mdc` | 모듈 구조, Controller/Service 패턴, DTO, Swagger | `backend/src/modules/**/*.ts` | ~50 |
| `nestjs-auth.mdc` | JWT 전략, Guard, 인증 패턴 | `backend/src/modules/auth/**/*.ts` | ~30 |
| `nestjs-database.mdc` | Entity, 마이그레이션, 시드, 인덱스 규칙 | `backend/src/**/*.entity.ts`, `**/database/**/*.ts` | ~30 |

기존 `nestjs-conventions.mdc`와 `swagger-guidelines.mdc` 삭제.

### 2-3. TDD 규칙 통합

| 새 파일 | 내용 | globs |
|---------|------|-------|
| `testing-common.mdc` | TDD 원칙, AAA 패턴, 커버리지 목표 (공통) | `**/*.{spec,test}.*` |
| `nestjs-testing.mdc` | Jest 모킹 패턴, Repository 모킹 (백엔드 특화만) | `backend/**/*.spec.ts` |
| `react-testing.mdc` | Vitest, RTL, userEvent 패턴 (프론트 특화만) | `frontend/**/*.test.*` |

기존 `testing-tdd.mdc` 삭제 (내용을 `testing-common.mdc`로 이동).

### 2-4. 누락 규칙 추가

| 새 파일 | 내용 | globs | 줄 수 |
|---------|------|-------|-------|
| `tailwind-v4.mdc` | @tailwindcss/vite 설정, @theme, PostCSS 충돌 방지 | `frontend/**/*.{css,tsx}` | ~15 |
| `auth-patterns.mdc` | AuthInitializer, ProtectedRoute, 토큰 복원 패턴 | `frontend/src/**/*.{ts,tsx}` | ~20 |
| `websocket-patterns.mdc` | Socket.IO 이벤트 네이밍, 연결 관리, 에러 처리 | `**/*.gateway.ts`, `**/use-streaming.ts` | ~20 |

### 2-5. React Query 규칙 정리

`react-conventions.mdc`에서 React Query 관련 내용(~40줄) 제거.
실제 사용 중인 Zustand + 커스텀 훅 패턴으로 대체.
향후 React Query 도입 시 별도 Rule로 추가.

### 정리 후 예상 구조

```
.cursor/rules/ (총 ~280줄, 현재 ~900줄에서 70% 감소)
├── project-overview.mdc        # 20줄 (alwaysApply)
├── coding-standards.mdc        # 30줄 (alwaysApply, 축소)
├── security.mdc                # 15줄 (alwaysApply)
├── nestjs-module-patterns.mdc  # 50줄 (globs)
├── nestjs-auth.mdc             # 30줄 (globs)
├── nestjs-database.mdc         # 30줄 (globs)
├── react-conventions.mdc       # 40줄 (globs, React Query 제거)
├── gemini-integration.mdc      # 40줄 (globs, 유지)
├── testing-common.mdc          # 25줄 (globs)
├── nestjs-testing.mdc          # 25줄 (globs, TDD 중복 제거)
├── react-testing.mdc           # 25줄 (globs, TDD 중복 제거)
├── tailwind-v4.mdc             # 15줄 (globs, 신규)
├── auth-patterns.mdc           # 20줄 (globs, 신규)
├── websocket-patterns.mdc      # 20줄 (globs, 신규)
└── dev-commands.mdc            # 60줄 (manual, 유지)

삭제 대상:
- nestjs-conventions.mdc (분리됨)
- swagger-guidelines.mdc (nestjs-module-patterns에 통합)
- testing-tdd.mdc (testing-common으로 이동)
```

---

## 3. Phase 2: Skills 도입

> 목표: 반복 워크플로를 Skill로 캡슐화하여 "요청 시에만" 로드

### Skills vs Rules 사용 기준

```
질문: "이 지식이 코드 작성 규칙인가, 작업 수행 절차인가?"
├── 코드 작성 규칙 → Rule
│   예: "함수명은 camelCase", "any 타입 금지"
└── 작업 수행 절차 → Skill
    예: "새 NestJS 모듈을 만드는 순서", "디자인 리뉴얼 절차"
```

### 도입 우선순위

#### P0: 즉시 생성 (자주 사용하는 워크플로)

**Skill 1: `nestjs-feature-scaffold`**

```
~/.cursor/skills/nestjs-feature-scaffold/
├── SKILL.md
└── references/
    └── module-template.md
```

```yaml
# SKILL.md frontmatter
---
name: nestjs-feature-scaffold
description: >
  NestJS에서 새 기능 모듈을 생성하는 워크플로. Module → Controller →
  Service → Entity → DTO → Spec 순서로 scaffolding. "새 모듈 추가",
  "API 추가", "기능 개발" 요청 시 트리거.
---
```

SKILL.md 본문 핵심:
- 생성 순서 체크리스트
- 파일 네이밍 규칙
- 필수 데코레이터 목록
- 상세 코드 템플릿은 `references/module-template.md`로 분리

---

**Skill 2: `ui-design-system`**

```
~/.cursor/skills/ui-design-system/
├── SKILL.md
└── references/
    ├── color-palette.md
    ├── component-patterns.md
    └── tailwind-v4-guide.md
```

```yaml
---
name: ui-design-system
description: >
  프로젝트 UI 디자인 시스템 가이드. 색상 팔레트, 간격, 타이포그래피,
  컴포넌트 스타일 규칙 포함. "디자인 수정", "UI 개선", "스타일 변경",
  "예쁘게 만들어줘" 요청 시 트리거.
---
```

SKILL.md 본문 핵심:
- 색상 체계 (primary/secondary/accent)
- 간격 규칙 (4px 단위)
- 글래스모피즘/그라데이션 사용 가이드
- 컴포넌트별 상세 패턴은 `references/`로 분리

---

#### P1: 1주 내 생성

**Skill 3: `project-deployment`**

```
~/.cursor/skills/project-deployment/
├── SKILL.md
└── references/
    ├── docker-patterns.md
    └── env-checklist.md
```

```yaml
---
name: project-deployment
description: >
  Docker 멀티스테이지 빌드, docker-compose 설정, 환경변수 관리,
  프로덕션 배포 워크플로. "배포", "Docker", "프로덕션" 요청 시 트리거.
---
```

---

**Skill 4: `test-suite-generator`**

```
~/.cursor/skills/test-suite-generator/
├── SKILL.md
└── references/
    ├── backend-test-patterns.md
    └── frontend-test-patterns.md
```

```yaml
---
name: test-suite-generator
description: >
  기존 코드에 대한 테스트 스위트를 체계적으로 생성. 백엔드(Jest)와
  프론트엔드(Vitest) 패턴 포함. "테스트 작성", "테스트 추가",
  "커버리지 올려줘" 요청 시 트리거.
---
```

---

#### P2: 필요 시 생성

| Skill | 트리거 | 우선순위 |
|-------|--------|----------|
| `db-migration-manager` | "마이그레이션 생성", "스키마 변경" | 필요 시 |
| `code-reviewer` | "코드 리뷰", "PR 리뷰" | 필요 시 |
| `performance-optimizer` | "성능 개선", "최적화" | 필요 시 |
| `error-debugger` | "에러 해결", "디버깅" | 필요 시 |

### Skill 작성 원칙 (체크리스트)

- [ ] SKILL.md 본문 500줄 이하
- [ ] description에 "무엇을" + "언제" 모두 포함
- [ ] description에 한국어 트리거 키워드 포함
- [ ] 상세 내용은 `references/`로 분리 (Progressive Disclosure)
- [ ] 참조 파일은 1단계 깊이만 (SKILL.md → references/x.md)
- [ ] 불필요한 README.md, CHANGELOG.md 등 생성 금지
- [ ] 스크립트 포함 시 실행 테스트 완료

---

## 4. Phase 3: Sub-agent 활용 패턴

> 목표: 메인 컨텍스트를 보호하면서 복잡한 탐색/분석을 효율적으로 수행

### Sub-agent 타입별 사용 가이드

| 타입 | 용도 | 예시 |
|------|------|------|
| `explore` | 코드베이스 탐색, 구조 파악 | "auth 모듈이 어떻게 동작하는지 파악해줘" |
| `generalPurpose` | 복잡한 멀티스텝 조사 | "이 에러의 원인을 찾아줘" |
| `shell` | 명령어 실행, git 작업 | "테스트 실행하고 결과 알려줘" |

### 언제 Sub-agent를 사용해야 하는가

```
판단 기준:
├── 파일 1-2개만 읽으면 되나? → 직접 Read tool 사용
├── 특정 심볼 검색인가? → 직접 Grep 사용
├── 여러 디렉토리를 탐색해야 하나? → Sub-agent (explore)
├── 병렬로 여러 영역을 조사해야 하나? → Sub-agent 복수 (최대 4개)
└── 긴 명령어 실행이 필요한가? → Sub-agent (shell)
```

### 효과적인 Sub-agent 패턴

#### 패턴 1: 병렬 탐색

```
사용자: "인증 시스템을 리팩토링해줘"

→ Sub-agent 1 (explore): "backend/src/modules/auth/ 구조 분석"
→ Sub-agent 2 (explore): "frontend/src/에서 인증 관련 코드 전부 찾기"
→ Sub-agent 3 (explore): "shared/src/types/ 공유 타입 확인"
→ 결과 종합 후 메인 에이전트가 리팩토링 실행
```

#### 패턴 2: 빌드/테스트 위임

```
사용자: "전체 테스트 돌려줘"

→ Sub-agent (shell): "pnpm test 실행 후 결과 요약"
→ 실패한 테스트만 메인 에이전트가 수정
```

#### 패턴 3: 디버깅 위임

```
사용자: "이 에러 해결해줘"

→ Sub-agent 1 (explore): "에러 관련 코드 탐색"
→ Sub-agent 2 (explore): "비슷한 패턴이 다른 곳에도 있는지 확인"
→ 메인 에이전트가 수정
```

---

## 5. Phase 4: 지속적 개선 루프

> 목표: 매 세션마다 에이전트가 학습하는 구조 구축

### 세션 후 회고 프로세스

```
작업 완료 후 자문:
1. 이번 세션에서 예상 못한 문제가 있었나?
   → YES → 방지 규칙(Rule) 추가
2. 같은 작업을 3번 이상 반복했나?
   → YES → Skill로 캡슐화
3. 기존 Rule이 방해가 됐나? (잘못된 가이드, 과도한 정보)
   → YES → Rule 수정/삭제
4. 사용하지 않는 기술의 Rule이 있나?
   → YES → 제거 또는 alwaysApply: false로 변경
```

### 버전 관리

Rules와 Skills도 git으로 관리합니다.

```bash
# .cursor/rules/ 는 프로젝트에 포함 (팀 공유)
git add .cursor/rules/

# ~/.cursor/skills/ 는 별도 dotfiles 저장소로 관리 (개인)
# 또는 프로젝트별 Skills는 .cursor/skills/에 저장 (팀 공유)
```

### 학습 기록 양식

세션에서 중요한 발견이 있을 때 이 파일에 기록:

```markdown
### [날짜] 세션 학습 기록

**문제**: (어떤 문제가 발생했는지)
**원인**: (왜 발생했는지)
**해결**: (어떻게 해결했는지)
**조치**: (어떤 Rule/Skill을 추가/수정했는지)
```

#### 기존 세션 학습 기록

### 2026-02-07 세션 1

**문제**: Tailwind CSS v4에서 프로덕션 빌드 실패
**원인**: `@tailwindcss/vite` 플러그인과 PostCSS의 `tailwindcss` 플러그인이 충돌
**해결**: `postcss.config.js`에서 `tailwindcss: {}` 제거
**조치**: `tailwind-v4.mdc` Rule 추가 예정

### 2026-02-07 세션 2

**문제**: ProtectedRoute에서 무한 로딩 (isLoading이 영원히 true)
**원인**: 앱 시작 시 인증 상태 복원 로직 부재
**해결**: `App.tsx`에 `AuthInitializer` 컴포넌트 추가
**조치**: `auth-patterns.mdc` Rule 추가 예정

### 2026-02-07 세션 3

**문제**: 백엔드 GeminiService 테스트에서 "GEMINI_API_KEY is not defined" 에러
**원인**: 서비스 생성자가 모듈 초기화 시 호출되는데, ConfigService 모킹이 불완전
**해결**: `createMockConfigService` 헬퍼로 테스트 컨텍스트 내에서 직접 인스턴스 생성
**조치**: `nestjs-testing.mdc`에 ConfigService 모킹 패턴 추가 예정

---

## 6. 도구별 비교표

| 기준 | Rules | Skills | Sub-agents |
|------|-------|--------|------------|
| **컨텍스트 비용** | alwaysApply: 항상 / globs: 조건부 | 트리거 시에만 | 별도 공간 (0) |
| **적합한 내용** | 코드 규칙, 컨벤션 | 워크플로, 절차 | 탐색, 실행 위임 |
| **크기 권장** | ~50줄/파일 | ~500줄 (SKILL.md) | N/A |
| **Progressive Disclosure** | 불가 | 가능 (references/) | 가능 (결과만 반환) |
| **팀 공유** | .cursor/rules/ (O) | .cursor/skills/ (O) | N/A |
| **개인 전용** | N/A | ~/.cursor/skills/ | N/A |
| **수정 빈도** | 프로젝트 초기에 집중 | 워크플로 변경 시 | 매 세션 |

### 결정 플로우차트

```
새로운 지식/패턴을 저장하고 싶다
│
├── "항상 적용되어야 하나?"
│   ├── YES → alwaysApply Rule (50줄 이하로!)
│   └── NO ↓
│
├── "특정 파일 작업 시에만 필요한가?"
│   ├── YES → globs Rule
│   └── NO ↓
│
├── "절차/워크플로인가? (여러 단계)"
│   ├── YES → Skill
│   └── NO ↓
│
├── "일회성 탐색/실행인가?"
│   ├── YES → Sub-agent (저장 불필요)
│   └── NO → Rule (가장 간단한 형태)
```

---

## 7. 체크리스트

### Phase 1: Rules 정리 (즉시) — ✅ 2026-02-08 완료

- [x] project-overview.mdc 축소 (~20줄)
- [x] nestjs-conventions.mdc → 3개 파일로 분리
- [x] swagger-guidelines.mdc → nestjs-module-patterns.mdc에 통합 후 삭제
- [x] testing-tdd.mdc → testing-common.mdc로 이름 변경, 중복 내용 정리
- [x] nestjs-testing.mdc에서 TDD 원칙 부분 제거 (testing-common에서 커버)
- [x] react-testing.mdc에서 TDD 원칙 부분 제거 (testing-common에서 커버)
- [x] react-conventions.mdc에서 React Query 관련 내용 제거
- [x] tailwind-v4.mdc 신규 생성
- [x] auth-patterns.mdc 신규 생성
- [x] websocket-patterns.mdc 신규 생성
- [x] 각 Rule이 50줄 이하인지 확인 (nestjs-module-patterns만 52줄, 나머지 모두 50줄 이하)
- [x] alwaysApply Rules 총합이 70줄 이하인지 확인 (69줄)

### Phase 2: Skills 도입 (1주차) — ✅ 2026-02-08 완료

- [x] `nestjs-feature-scaffold` Skill 생성 (119줄)
- [x] `ui-design-system` Skill 생성 (86줄)
- [x] `project-deployment` Skill 생성 (146줄)
- [x] `test-suite-generator` Skill 생성 (95줄)
- [x] `context-usage-tracker` Skill 생성 — Rules/Skills/Sub-agent 사용률 추적 (2026-02-08)
- [x] 각 Skill의 SKILL.md가 500줄 이하인지 확인
- [x] 각 Skill의 description에 트리거 키워드가 포함되어 있는지 확인

### Phase 3: Sub-agent 패턴 (2주차)

- [ ] 코드베이스 탐색 시 explore Sub-agent 사용 습관화
- [ ] 병렬 조사가 필요한 경우 복수 Sub-agent 활용
- [ ] 빌드/테스트 실행은 shell Sub-agent로 위임

### Phase 4: 지속적 개선 (상시)

- [x] `context-usage-tracker` Skill 생성 — 사용률 추적 및 월간 분석 자동화 (2026-02-08)
- [ ] 매 세션 종료 시 "세션 기록해줘" 요청 → `context-usage-tracker` 워크플로 1 실행
- [ ] 월 1회 "월간 리포트" 요청 → `context-usage-tracker` 워크플로 2 실행
- [ ] 리포트 기반 최적화 실행 → `context-usage-tracker` 워크플로 3 실행
- [ ] 새로운 반복 패턴 발견 시 Skill 생성 검토
- [ ] Rule/Skill 변경 시 git 커밋

> **참고**: 세션 학습 기록은 `docs/context-usage/logs/YYYY-MM.md`로 이관됨.
> 이전 기록(2026-02-07 세션 1~3)은 `docs/context-usage/logs/2026-02.md`에서 확인.

---

## 부록: 참고 자료

- [Cursor Rules 문서](https://docs.cursor.com)
- Skills 생성 가이드: `~/.cursor/skills-cursor/create-skill/SKILL.md`
- Rule 생성 가이드: `~/.cursor/skills-cursor/create-rule/SKILL.md`
