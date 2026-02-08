---
name: ui-design-system
description: >
  프로젝트 UI 디자인 시스템 가이드. 색상 팔레트, 간격, 타이포그래피,
  컴포넌트 스타일 규칙 포함. "디자인 수정", "UI 개선", "스타일 변경",
  "예쁘게 만들어줘", "색상 변경" 요청 시 트리거.
---

# UI Design System

이 프로젝트의 디자인 시스템 가이드. Tailwind CSS v4 기반.

## 디자인 원칙

1. **일관성**: 동일한 색상/간격/타이포그래피 체계 사용
2. **가독성**: 충분한 대비, 적절한 간격
3. **반응성**: 모바일 우선 접근 (Tailwind의 `sm:`, `md:`, `lg:` 브레이크포인트)
4. **접근성**: 시맨틱 HTML, aria 속성, 키보드 네비게이션

## 색상 체계 (다크 테마)

### 커스텀 테마 색상 (`@theme` 블록)

```css
@theme {
  --color-primary: #6366f1;        /* Indigo - 주요 액션, CTA */
  --color-primary-hover: #4f46e5;  /* Indigo 진하게 - 호버 */
  --color-primary-light: #818cf8;  /* Indigo 밝게 - 텍스트/링크 */
  --color-secondary: #1e293b;      /* Slate 800 - 보조 배경 */
  --color-secondary-hover: #334155; /* Slate 700 - 보조 호버 */
  --color-accent-purple: #a855f7;  /* Purple - 강조 */
  --color-accent-pink: #ec4899;    /* Pink - 강조 */
  --color-accent-cyan: #06b6d4;    /* Cyan - 강조 */
}
```

### 사용 가이드

| 용도 | 색상 클래스 | 사용처 |
|------|-------------|--------|
| 주요 버튼/링크 | `bg-primary`, `text-primary` | CTA, 활성 상태 |
| 주요 호버 | `hover:bg-primary-hover` | 버튼 호버 |
| 그라데이션 버튼 | `bg-gradient-to-r from-primary to-accent-purple` | 주요 CTA |
| 보조 배경 | `bg-secondary`, `bg-white/5` | 사이드바, 카드 배경 |
| 텍스트 기본 | `text-gray-100`, `text-gray-200` | 본문 텍스트 |
| 텍스트 보조 | `text-gray-400` | 설명 |
| 텍스트 약한 | `text-gray-500` | 시간, 캡션 |
| 배경 | `bg-background` (#0f172a) | 페이지 배경 |
| 위험/에러 | `text-red-400`, `bg-red-500/10` | 에러 메시지 |
| 성공 | `text-green-400`, `bg-green-500/10` | 성공 메시지 |
| 보더 | `border-white/10` | 기본 보더 |

## 간격 규칙

- **기본 단위**: 4px (Tailwind의 1 단위)
- **컴포넌트 내부 패딩**: `p-3` ~ `p-4` (12~16px)
- **컴포넌트 간 간격**: `gap-2` ~ `gap-4` (8~16px)
- **섹션 간 간격**: `space-y-6` ~ `space-y-8` (24~32px)
- **페이지 여백**: `px-4 md:px-6` (반응형)

## 타이포그래피

| 용도 | 클래스 | 크기 |
|------|--------|------|
| 페이지 제목 | `text-2xl font-bold` | 24px |
| 섹션 제목 | `text-xl font-semibold` | 20px |
| 카드 제목 | `text-lg font-medium` | 18px |
| 본문 | `text-base` (기본) | 16px |
| 보조 텍스트 | `text-sm text-gray-500` | 14px |
| 캡션 | `text-xs text-gray-400` | 12px |

## 글래스모피즘 / 특수 효과

프로젝트에서 사용하는 커스텀 유틸리티:

- `.glass`: 반투명 유리 효과 (사이드바, 모달 배경)
- `.text-gradient`: 그라데이션 텍스트
- `.typing-dot`: 타이핑 애니메이션 도트

## 컴포넌트 스타일 가이드

상세 컴포넌트별 패턴은 다음 참조 파일 확인:

- [색상 팔레트 상세](references/color-palette.md)
- [컴포넌트 패턴](references/component-patterns.md)
- [Tailwind v4 가이드](references/tailwind-v4-guide.md)

## 핵심 규칙

- 인라인 스타일 금지 — Tailwind 유틸리티 사용
- 커스텀 CSS는 `src/styles/index.css`의 `@theme` 또는 `@utility`로 정의
- 색상 하드코딩 금지 — 테마 변수 또는 Tailwind 색상 사용
- 반응형 우선: 모바일 → 태블릿 → 데스크톱 순서
