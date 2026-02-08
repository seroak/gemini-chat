# 컨텍스트 사용률 추적 스킬 계획서

> 작성일: 2026-02-08
> 목적: Rules, Skills, Sub-agent 사용률을 체계적으로 추적하고 분석하여, 지속적인 컨텍스트 최적화를 가능하게 하는 스킬 구축

---

## 목차

1. [문제 정의](#1-문제-정의)
2. [스킬 개요](#2-스킬-개요)
3. [설계: 추적 시스템](#3-설계-추적-시스템)
4. [설계: 분석 워크플로](#4-설계-분석-워크플로)
5. [설계: 최적화 의사결정 프레임워크](#5-설계-최적화-의사결정-프레임워크)
6. [파일 구조](#6-파일-구조)
7. [SKILL.md 초안](#7-skillmd-초안)
8. [구현 로드맵](#8-구현-로드맵)
9. [기술적 제약 및 해결책](#9-기술적-제약-및-해결책)

---

## 1. 문제 정의

### 현재 상황

| 항목 | 수량 | 비고 |
|------|------|------|
| Rules (alwaysApply) | 3개 | `project-overview`, `coding-standards`, `security` |
| Rules (globs) | 11개 | 파일 패턴 기반 조건부 적용 |
| Rules (manual) | 1개 | `dev-commands` |
| Skills | 4개 | `nestjs-feature-scaffold`, `ui-design-system`, `project-deployment`, `test-suite-generator` |
| Sub-agent 타입 | 3종 | `explore`, `generalPurpose`, `shell` |

### 핵심 문제

1. **가시성 부재**: 어떤 Rule/Skill이 실제로 얼마나 자주 트리거되는지 알 수 없음
2. **맹목적 유지**: 사용되지 않는 Rule이 컨텍스트 비용을 차지할 수 있음
3. **최적화 근거 부재**: "이 Rule을 줄여야 하나?", "이 Skill이 필요한가?"에 대한 데이터 없음
4. **개선 루프 미작동**: CONTEXT-MANAGEMENT-PLAN의 Phase 4(지속적 개선)가 수동 의존

### 이 스킬이 해결하는 것

- **정량적 데이터 수집**: 매 세션 사용 내역을 구조화된 로그로 기록
- **월간 분석 리포트**: 사용률 통계 + 원인 분석 + 최적화 제안
- **의사결정 프레임워크**: "유지/수정/삭제/병합" 판단 기준 제공

---

## 2. 스킬 개요

### 기본 정보

| 항목 | 값 |
|------|-----|
| 스킬명 | `context-usage-tracker` |
| 저장 위치 | `.cursor/skills/context-usage-tracker/` (프로젝트 레벨) |
| 트리거 키워드 | "사용률 분석", "컨텍스트 분석", "Rule 사용률", "Skill 사용률", "월간 리포트", "컨텍스트 최적화", "사용률 추적" |
| 대상 사용자 | 프로젝트 관리자 (본인) |

### 핵심 워크플로 3가지

```
[워크플로 1] 세션 기록  ─── 매 세션 종료 시 사용 내역 기록
[워크플로 2] 월간 분석  ─── 월 1회 누적 데이터 분석 및 리포트 생성
[워크플로 3] 최적화 실행 ─── 분석 결과를 바탕으로 Rule/Skill 정리
```

---

## 3. 설계: 추적 시스템

### 3-1. 추적 대상 및 수집 항목

#### Rules 추적

| 수집 항목 | 설명 | 예시 |
|-----------|------|------|
| `rule_name` | Rule 파일명 | `nestjs-auth.mdc` |
| `apply_type` | 적용 방식 | `alwaysApply` / `globs` / `manual` |
| `triggered` | 트리거 여부 | `true` / `false` |
| `actually_useful` | 실제 도움 여부 | `true` / `false` / `partial` |
| `context_cost` | 추정 토큰 비용 (줄 수) | `30` |
| `notes` | 특이사항 | "auth 관련 작업에서 필수적이었음" |

#### Skills 추적

| 수집 항목 | 설명 | 예시 |
|-----------|------|------|
| `skill_name` | Skill 이름 | `nestjs-feature-scaffold` |
| `triggered` | 트리거 여부 | `true` / `false` |
| `trigger_method` | 트리거 방식 | `auto` (에이전트 자동) / `user` (사용자 요청) |
| `completed` | 워크플로 완료 여부 | `true` / `false` |
| `references_read` | 참조 파일 읽기 여부 | `['module-template.md']` |
| `usefulness` | 유용성 (1-5) | `4` |
| `notes` | 특이사항 | "DTO 생성 부분이 특히 도움됨" |

#### Sub-agent 추적

| 수집 항목 | 설명 | 예시 |
|-----------|------|------|
| `agent_type` | Sub-agent 타입 | `explore` / `generalPurpose` / `shell` |
| `task_description` | 수행 태스크 | "auth 모듈 구조 분석" |
| `parallel_count` | 동시 실행 수 | `2` |
| `success` | 성공 여부 | `true` / `false` |
| `result_useful` | 결과 유용성 | `true` / `false` |
| `notes` | 특이사항 | "탐색 범위가 넓어 explore가 적합했음" |

### 3-2. 로그 파일 형식

**위치**: `docs/context-usage/logs/YYYY-MM.md`

매월 1개 파일로 관리. Markdown 테이블 형식으로 사람이 읽기 쉽게 유지.

```markdown
# 2026-02 사용률 로그

## 세션 기록

### 2026-02-08 세션 1

**작업 요약**: 채팅 UI 리팩토링
**작업 시간**: 약 2시간
**작업 유형**: UI 개선

#### Rules 사용 내역

| Rule | 타입 | 트리거 | 유용 | 비고 |
|------|------|--------|------|------|
| project-overview | always | ✅ | ✅ | 폴더 구조 확인에 활용 |
| coding-standards | always | ✅ | ✅ | 네이밍 규칙 준수 |
| security | always | ✅ | ⬜ | 이번 작업과 무관 |
| react-conventions | globs | ✅ | ✅ | 컴포넌트 패턴 참고 |
| tailwind-v4 | globs | ✅ | ✅ | PostCSS 충돌 방지 |
| nestjs-auth | globs | ❌ | - | 백엔드 작업 없었음 |
| auth-patterns | globs | ✅ | ⬜ | 프론트 작업이었지만 인증 무관 |

#### Skills 사용 내역

| Skill | 트리거 | 방식 | 완료 | 유용성 | 비고 |
|-------|--------|------|------|--------|------|
| ui-design-system | ✅ | user | ✅ | 5 | 색상 체계 참고 |
| nestjs-feature-scaffold | ❌ | - | - | - | 백엔드 작업 없음 |

#### Sub-agent 사용 내역

| 타입 | 태스크 | 병렬 | 성공 | 유용 | 비고 |
|------|--------|------|------|------|------|
| explore | 컴포넌트 구조 파악 | 2 | ✅ | ✅ | 빠른 탐색 |
| shell | pnpm build 실행 | 1 | ✅ | ✅ | 빌드 확인 |

---
```

### 3-3. 에이전트의 기록 프로세스

에이전트가 세션 종료 시(또는 사용자 요청 시) 다음 절차로 기록:

```
1. 현재 세션에서 수행한 작업 회고
2. 어떤 Rule 파일들이 컨텍스트에 로드되었는지 확인
3. 어떤 Skill이 읽혔는지 / 실제 사용됐는지 구분
4. Sub-agent가 사용된 경우 타입과 결과 기록
5. 해당 월의 로그 파일(YYYY-MM.md)에 세션 기록 추가
```

**기록 트리거 방법:**
- 사용자가 "사용률 기록해줘" / "세션 기록" 요청
- 사용자가 "오늘 작업 마무리" 요청 시 자동 제안

---

## 4. 설계: 분석 워크플로

### 4-1. 월간 리포트 구조

**위치**: `docs/context-usage/reports/YYYY-MM-report.md`

```markdown
# 2026-02 컨텍스트 사용률 리포트

> 분석 기간: 2026-02-01 ~ 2026-02-28
> 총 세션 수: 15회
> 생성일: 2026-03-01

---

## 요약 대시보드

### Rules 사용률 (TOP 5 / BOTTOM 5)

| 순위 | Rule | 트리거율 | 유용률 | 평가 |
|------|------|----------|--------|------|
| 1 | coding-standards | 100% (15/15) | 93% (14/15) | ✅ 필수 |
| 2 | project-overview | 100% (15/15) | 80% (12/15) | ✅ 필수 |
| ... | ... | ... | ... | ... |
| 14 | websocket-patterns | 7% (1/15) | 100% (1/1) | 🔍 검토 |
| 15 | nestjs-database | 0% (0/15) | - | ⚠️ 주의 |

### Skills 사용률

| Skill | 사용 횟수 | 완료율 | 평균 유용성 | 트렌드 |
|-------|-----------|--------|-------------|--------|
| ui-design-system | 8 | 100% | 4.5 | 📈 |
| nestjs-feature-scaffold | 5 | 100% | 4.0 | ➡️ |
| test-suite-generator | 2 | 50% | 3.0 | 📉 |
| project-deployment | 0 | - | - | ⬇️ |

### Sub-agent 사용 패턴

| 타입 | 사용 횟수 | 성공률 | 가장 흔한 용도 |
|------|-----------|--------|----------------|
| explore | 25 | 92% | 코드 구조 파악 |
| shell | 10 | 100% | 빌드/테스트 실행 |
| generalPurpose | 3 | 67% | 복잡한 디버깅 |

---

## 상세 분석

### 높은 사용률 Rule 분석

[각 Rule별 왜 많이 사용되었는지, 컨텍스트 비용 대비 가치 평가]

### 낮은 사용률 Rule 분석

[각 Rule별 왜 사용되지 않았는지 원인 분류]

| 원인 분류 | 설명 | 해당 Rule |
|-----------|------|-----------|
| 작업 범위 밖 | 이번 달 해당 영역 작업 안 함 | nestjs-database |
| 글로브 미매칭 | 글로브 패턴이 실제 작업 파일과 불일치 | - |
| 내용 부실 | Rule 내용이 실제 도움 안 됨 | - |
| 다른 도구로 대체 | Skill이나 직접 지식으로 해결 | - |

### 최적화 제안

1. **[Rule명]**: [액션] - [이유]
2. **[Rule명]**: [액션] - [이유]
```

### 4-2. 분석 시 계산하는 핵심 지표

| 지표 | 계산 방법 | 의미 |
|------|-----------|------|
| **트리거율** | 트리거 세션 수 / 총 세션 수 × 100 | 얼마나 자주 로드되는가 |
| **유용률** | 유용 판정 수 / 트리거 수 × 100 | 로드됐을 때 실제 도움이 되는가 |
| **효율 점수** | 유용률 / 컨텍스트 비용(줄 수) | 토큰 대비 가치 |
| **ROI 등급** | 효율 점수 기반 A/B/C/D/F | 유지/최적화/삭제 판단 기준 |
| **트렌드** | 이번 달 vs 지난 달 사용률 변화 | 사용 추이 |

### 4-3. ROI 등급 기준

```
A (필수):      유용률 80%+ & 트리거율 50%+
B (양호):      유용률 60%+ & 트리거율 30%+
C (검토 필요): 유용률 40%+ 또는 트리거율 낮지만 전문 영역
D (최적화):    유용률 40% 미만 또는 트리거율 10% 미만
F (삭제 후보): 3개월 연속 트리거 0% 또는 유용률 20% 미만
```

---

## 5. 설계: 최적화 의사결정 프레임워크

### 5-1. 의사결정 플로우

```
Rule/Skill 분석 결과
│
├── 트리거율 0% (3개월 연속)
│   ├── 해당 기술을 프로젝트에서 사용하나?
│   │   ├── NO → 🗑️ 삭제
│   │   └── YES → 글로브 패턴 재검토
│   │       ├── 패턴 문제 → 🔧 글로브 수정
│   │       └── 패턴 정상 → 📦 manual로 변경 (필요 시만 로드)
│   └──
│
├── 트리거율 높음 + 유용률 낮음
│   ├── alwaysApply인가?
│   │   ├── YES → 내용 축소 또는 globs로 변경
│   │   └── NO → 내용 재검토 / 실제 필요한 부분만 남기기
│   └──
│
├── 트리거율 낮음 + 유용률 높음
│   └── ✅ 유지 (전문 영역에서 가치 있음)
│
├── 두 Rule이 항상 함께 트리거됨
│   └── 🔗 병합 검토
│
└── Skill 완료율 낮음
    ├── 워크플로가 너무 복잡한가?
    │   ├── YES → 단순화
    │   └── NO → 트리거 키워드 부정확 → description 수정
    └──
```

### 5-2. 최적화 액션 카탈로그

| 액션 | 설명 | 적용 시나리오 |
|------|------|---------------|
| **유지** | 변경 없이 유지 | ROI A/B 등급 |
| **축소** | Rule 줄 수 감소 | 유용률 낮은 부분 제거 |
| **글로브 수정** | 파일 패턴 변경 | 트리거율이 예상과 다를 때 |
| **적용방식 변경** | always↔globs↔manual | 컨텍스트 비용 최적화 |
| **병합** | 두 Rule을 하나로 | 항상 함께 사용되는 Rule |
| **분리** | 하나의 Rule을 둘로 | 일부만 유용한 Rule |
| **Skill화** | Rule → Skill 전환 | 절차적 내용이 Rule에 있을 때 |
| **삭제** | Rule/Skill 제거 | ROI F 등급 |
| **신규 생성** | 새 Rule/Skill 추가 | 반복 패턴 발견 |

---

## 6. 파일 구조

```
.cursor/skills/context-usage-tracker/
├── SKILL.md                          # 메인 스킬 파일 (~200줄)
└── references/
    ├── session-log-template.md       # 세션 로그 작성 템플릿
    ├── monthly-report-template.md    # 월간 리포트 생성 템플릿
    └── optimization-guide.md         # 최적화 의사결정 상세 가이드

docs/context-usage/
├── logs/
│   ├── 2026-02.md                    # 2월 세션 로그
│   ├── 2026-03.md                    # 3월 세션 로그 (향후)
│   └── ...
└── reports/
    ├── 2026-02-report.md             # 2월 월간 리포트
    ├── 2026-03-report.md             # 3월 월간 리포트 (향후)
    └── ...
```

### 현재 프로젝트 추적 대상 목록

#### Rules (15개)

| # | Rule | 적용 방식 | 줄 수 |
|---|------|-----------|-------|
| 1 | `project-overview.mdc` | alwaysApply | ~20 |
| 2 | `coding-standards.mdc` | alwaysApply | ~30 |
| 3 | `security.mdc` | alwaysApply | ~15 |
| 4 | `nestjs-module-patterns.mdc` | globs | ~52 |
| 5 | `nestjs-auth.mdc` | globs | ~38 |
| 6 | `nestjs-database.mdc` | globs | ~30 |
| 7 | `react-conventions.mdc` | globs | ~40 |
| 8 | `gemini-integration.mdc` | globs | ~40 |
| 9 | `testing-common.mdc` | globs | ~25 |
| 10 | `nestjs-testing.mdc` | globs | ~25 |
| 11 | `react-testing.mdc` | globs | ~25 |
| 12 | `tailwind-v4.mdc` | globs | ~15 |
| 13 | `auth-patterns.mdc` | globs | ~20 |
| 14 | `websocket-patterns.mdc` | globs | ~20 |
| 15 | `dev-commands.mdc` | manual | ~60 |

#### Skills (4개)

| # | Skill | 줄 수 | 참조 파일 수 |
|---|-------|-------|-------------|
| 1 | `nestjs-feature-scaffold` | 119 | 1 |
| 2 | `ui-design-system` | 87 | 3 |
| 3 | `project-deployment` | 147 | 2 |
| 4 | `test-suite-generator` | 96 | 2 |

---

## 7. SKILL.md 초안

```markdown
---
name: context-usage-tracker
description: >
  Rules, Skills, Sub-agent의 사용률을 추적하고 월간 분석 리포트를 생성하여
  컨텍스트 최적화를 지원하는 워크플로. "사용률 분석", "컨텍스트 분석",
  "Rule 사용률", "월간 리포트", "컨텍스트 최적화", "사용률 추적",
  "세션 기록", "사용률 기록" 요청 시 트리거.
---

# Context Usage Tracker

Rules, Skills, Sub-agent 사용률을 추적하고 분석하여 컨텍스트를 지속적으로 최적화.

## 워크플로 1: 세션 기록

사용자가 "세션 기록", "사용률 기록", "오늘 작업 기록" 요청 시 실행.

### 절차

1. 이번 세션의 **작업 요약** 정리 (작업 내용, 유형, 대략적 시간)
2. **Rules 사용 내역** 기록:
   - alwaysApply Rule 3개는 항상 트리거됨 (유용 여부만 판단)
   - globs Rule은 작업 파일 기반으로 트리거 여부 판단
   - manual Rule은 사용자가 명시적으로 언급한 경우만 트리거
3. **Skills 사용 내역** 기록:
   - 이번 세션에서 SKILL.md를 읽은 Skill만 트리거로 기록
   - 트리거 방식 (auto/user) 구분
4. **Sub-agent 사용 내역** 기록:
   - Task tool 사용 시마다 기록
5. `docs/context-usage/logs/YYYY-MM.md`에 추가
   - 파일 없으면 템플릿 기반으로 새로 생성
   - 템플릿: [session-log-template.md](references/session-log-template.md) 참조

### 유용성 판단 기준

| 판정 | 기준 |
|------|------|
| ✅ 유용 | Rule/Skill 내용이 실제 코드 작성/의사결정에 영향을 줌 |
| ⬜ 무관 | 트리거됐지만 이번 작업과 관련 없었음 |
| ❌ 방해 | 잘못된 가이드를 주거나 불필요한 컨텍스트 차지 |

## 워크플로 2: 월간 분석

사용자가 "월간 리포트", "사용률 분석", "컨텍스트 분석" 요청 시 실행.

### 절차

1. 해당 월의 로그 파일 읽기 (`docs/context-usage/logs/YYYY-MM.md`)
2. **정량 분석** 수행:
   - Rule별 트리거율, 유용률, 효율 점수 계산
   - Skill별 사용 횟수, 완료율, 평균 유용성 계산
   - Sub-agent 타입별 사용 빈도, 성공률 계산
3. **정성 분석** 수행:
   - 사용률 낮은 항목의 원인 분류
   - 사용률 높은 항목의 성공 요인 분석
   - 이전 월 대비 트렌드 비교 (이전 리포트 존재 시)
4. **최적화 제안** 도출:
   - ROI 등급 산정 (A/B/C/D/F)
   - 항목별 구체적 액션 제안
5. `docs/context-usage/reports/YYYY-MM-report.md`에 저장
   - 템플릿: [monthly-report-template.md](references/monthly-report-template.md) 참조

### ROI 등급 기준

| 등급 | 조건 | 액션 |
|------|------|------|
| A (필수) | 유용률 80%+ & 트리거율 50%+ | 유지 |
| B (양호) | 유용률 60%+ & 트리거율 30%+ | 유지, 미세 조정 가능 |
| C (검토) | 유용률 40%+ 또는 전문 영역 | 내용 축소 또는 글로브 수정 검토 |
| D (최적화) | 유용률 40% 미만 | 대폭 수정 또는 적용방식 변경 |
| F (삭제) | 3개월 트리거 0% 또는 유용률 20% 미만 | 삭제 또는 다른 Rule에 병합 |

## 워크플로 3: 최적화 실행

월간 리포트의 제안을 바탕으로 실제 Rule/Skill을 수정.
상세 의사결정 가이드: [optimization-guide.md](references/optimization-guide.md) 참조

### 핵심 원칙

- 삭제 전 반드시 "이 기술을 프로젝트에서 사용 중인가?" 확인
- alwaysApply Rule 총량은 항상 70줄 이하 유지
- 개별 Rule은 50줄 이하 유지
- 변경 후 CONTEXT-MANAGEMENT-PLAN.md의 체크리스트 업데이트
```

---

## 8. 구현 로드맵

### Step 1: 스킬 파일 생성 (즉시)

- [ ] `.cursor/skills/context-usage-tracker/SKILL.md` 작성
- [ ] `references/session-log-template.md` 작성
- [ ] `references/monthly-report-template.md` 작성
- [ ] `references/optimization-guide.md` 작성

### Step 2: 로그 디렉토리 초기화 (즉시)

- [ ] `docs/context-usage/logs/` 디렉토리 생성
- [ ] `docs/context-usage/reports/` 디렉토리 생성
- [ ] 2026-02 로그 파일 생성 (기존 세션 학습 기록 이관)

### Step 3: 기존 데이터 이관 (즉시)

- [ ] `CONTEXT-MANAGEMENT-PLAN.md`의 "세션 학습 기록" 3건을 2026-02 로그로 이관
- [ ] 기존 학습 기록을 새 형식으로 변환

### Step 4: 첫 번째 세션 기록 테스트

- [ ] 이번 세션(2026-02-08) 기록을 스킬 워크플로로 작성
- [ ] 템플릿이 실용적인지 검증
- [ ] 필요시 템플릿 조정

### Step 5: 2월 말 첫 월간 리포트 생성

- [ ] 2월 누적 데이터로 첫 월간 리포트 생성
- [ ] 리포트 형식의 실용성 검증
- [ ] 최적화 제안 도출 및 실행

### Step 6: CONTEXT-MANAGEMENT-PLAN.md 업데이트

- [ ] Phase 4 섹션에 이 스킬 연동 내용 추가
- [ ] 체크리스트에 `context-usage-tracker` 항목 추가

---

## 9. 기술적 제약 및 해결책

### 제약 1: Cursor에 빌트인 사용률 분석 기능 없음

**문제**: 어떤 Rule이 실제로 컨텍스트에 로드되었는지 프로그래밍적으로 확인할 방법이 없음

**해결책**: 에이전트의 "자기 인식"에 의존
- alwaysApply Rule은 무조건 트리거됨 (확실)
- globs Rule은 세션에서 다룬 파일 경로로 추론 가능
- Skills는 `Read` 도구로 SKILL.md를 읽었는지로 판단 가능
- Sub-agent는 `Task` 도구 사용 내역으로 판단 가능

### 제약 2: 세션 간 상태 유지 불가

**문제**: 에이전트는 세션이 끝나면 기억을 잃음

**해결책**: 파일 기반 영속 저장
- 모든 기록을 `docs/context-usage/` 디렉토리에 Markdown으로 저장
- 다음 세션에서 해당 파일을 읽어 이전 기록 파악 가능

### 제약 3: 자동 추적 불가능

**문제**: 에이전트가 매 세션 자동으로 기록하지 않음 (사용자 요청 필요)

**해결책**:
- 스킬의 description에 "세션 기록" 트리거 포함
- 사용자가 습관적으로 "세션 기록해줘"를 세션 마무리 시 요청
- 향후: `alwaysApply` Rule로 "세션 종료 시 기록 제안" 짧은 프롬프트 추가 가능 (~3줄)

```mdc
---
description: 세션 종료 시 사용률 기록 제안
alwaysApply: true
---
세션 종료 또는 큰 작업 완료 시, 사용자에게 "세션 사용률을 기록할까요?"라고 제안.
context-usage-tracker 스킬 참조.
```

### 제약 4: 정확한 토큰 비용 측정 불가

**문제**: Rule이 실제로 몇 토큰을 소비하는지 정확히 알 수 없음

**해결책**: 줄 수를 프록시 지표로 사용
- 1줄 ≈ 10~15 토큰 (경험적 추정)
- 상대적 비교에는 충분한 정밀도

---

## 부록: 유사 도구/개념 참고

| 개념 | 영감 | 적용 |
|------|------|------|
| APM (Application Performance Monitoring) | DataDog, New Relic | Rule = 서비스, 트리거 = 호출, 유용성 = 성공률 |
| OKR | 목표 설정 프레임워크 | 월간 리포트의 목표 지표 설정 |
| A/B 테스트 | 변형 비교 | Rule 수정 전/후 유용률 비교 |
| 코드 커버리지 | 테스트 커버리지 | Rule 커버리지 = 실제 사용 비율 |
