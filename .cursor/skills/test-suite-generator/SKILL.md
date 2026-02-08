---
name: test-suite-generator
description: >
  기존 코드에 대한 테스트 스위트를 체계적으로 생성. 백엔드(Jest)와
  프론트엔드(Vitest) 패턴 포함. "테스트 작성", "테스트 추가",
  "커버리지 올려줘", "spec 만들어줘", "테스트 코드" 요청 시 트리거.
---

# Test Suite Generator

기존 코드에 대한 테스트를 체계적으로 생성하는 워크플로.

## 워크플로

```
Task Progress:
- [ ] Step 1: 대상 코드 분석
- [ ] Step 2: 테스트 케이스 도출
- [ ] Step 3: 테스트 파일 생성
- [ ] Step 4: 테스트 실행 및 검증
```

## Step 1: 대상 코드 분석

테스트 대상 파일을 읽고 다음을 파악:

- **공개 메서드/함수**: 테스트해야 할 인터페이스
- **외부 의존성**: 모킹이 필요한 서비스/리포지토리
- **분기점**: if/else, switch, try/catch
- **Edge cases**: null, 빈 배열, 경계값

## Step 2: 테스트 케이스 도출

각 메서드/함수에 대해:

1. **정상 케이스** (Happy path)
2. **예외 케이스** (에러, 잘못된 입력)
3. **경계값** (빈 값, 최대/최소)
4. **부수효과** (DB 저장, 이벤트 발생)

### 테스트 이름 규칙

한국어로 행위 중심 작성:
- `'유효한 데이터로 사용자를 생성한다'`
- `'이메일이 중복되면 ConflictException을 던진다'`
- `'존재하지 않는 ID로 조회 시 NotFoundException을 던진다'`

## Step 3: 파일 타입별 패턴

### 백엔드 (Jest) — `*.spec.ts`

대상 판별:
- `*.service.ts` → Service 테스트 패턴
- `*.controller.ts` → Controller 테스트 패턴 (선택)
- `*.gateway.ts` → Gateway 테스트 패턴

상세: [references/backend-test-patterns.md](references/backend-test-patterns.md)

### 프론트엔드 (Vitest) — `*.test.tsx`

대상 판별:
- `*.tsx` (컴포넌트) → 렌더링 + 상호작용 테스트
- `*.ts` (훅) → `renderHook` 테스트
- `*-store.ts` → Zustand 스토어 테스트

상세: [references/frontend-test-patterns.md](references/frontend-test-patterns.md)

## Step 4: 실행 및 검증

```bash
# 백엔드
pnpm --filter backend test -- --testPathPattern={파일경로}

# 프론트엔드
pnpm --filter frontend test -- --run {파일경로}

# 커버리지 확인
pnpm --filter backend test:cov
```

## 커버리지 목표

| 대상 | 목표 |
|------|------|
| 서비스 레이어 | 90%+ |
| 핵심 비즈니스 로직 | 80%+ |
| 유틸리티 함수 | 100% |

## 핵심 원칙

- **AAA 패턴**: Arrange (준비) → Act (실행) → Assert (검증)
- **독립성**: 각 테스트는 독립 실행 가능
- **모킹**: 외부 의존성(DB, API)은 반드시 모킹
- **afterEach**: `jest.clearAllMocks()` (Jest) 호출
- **변수 네이밍**: `mockX`, `inputX`, `expectedX`
