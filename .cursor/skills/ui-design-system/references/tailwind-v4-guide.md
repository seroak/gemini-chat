# Tailwind CSS v4 Guide

## 설정

### Vite 플러그인 (권장)

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**주의**: PostCSS에 `tailwindcss` 플러그인을 추가하면 충돌 발생. `postcss.config.js`에서 제거.

### CSS 진입점

```css
/* src/styles/index.css */
@import 'tailwindcss';

@theme {
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-secondary: #f3f4f6;
  --color-secondary-hover: #e5e7eb;
}
```

## v3 → v4 주요 변경

| v3 | v4 | 비고 |
|----|-----|------|
| `@tailwind base/components/utilities` | `@import 'tailwindcss'` | 단일 import |
| `tailwind.config.js` | `@theme { }` 블록 | CSS 내 설정 |
| `theme.extend.colors` | `--color-{name}: value` | CSS 변수 |
| PostCSS 플러그인 | Vite 플러그인 | 빌드 도구 |

## 커스텀 유틸리티 정의

```css
@utility glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
}

@utility text-gradient {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 자주 하는 실수

1. `tailwind.config.js` 파일 생성 → v4에서는 불필요 (`@theme` 사용)
2. PostCSS에 tailwindcss 추가 → Vite 플러그인과 충돌
3. `@tailwind` 지시어 사용 → `@import 'tailwindcss'`로 대체
4. `theme.extend` 문법 사용 → CSS 변수 (`--color-*`)로 대체
