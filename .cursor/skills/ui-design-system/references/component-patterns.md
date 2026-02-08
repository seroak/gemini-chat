# Component Style Patterns (Dark Theme)

## 버튼

### Primary 버튼
```tsx
<button className="rounded-xl bg-gradient-to-r from-primary to-accent-purple px-4 py-2 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
  전송
</button>
```

### Secondary 버튼
```tsx
<button className="rounded-xl bg-white/10 px-4 py-2 text-gray-200 border border-white/10 hover:bg-white/15 hover:text-white transition-all">
  취소
</button>
```

### Ghost 버튼
```tsx
<button className="rounded-xl bg-transparent px-4 py-2 text-gray-400 hover:bg-white/10 hover:text-gray-200 transition-colors">
  옵션
</button>
```

### Danger 버튼
```tsx
<button className="rounded-xl bg-red-500/10 px-4 py-2 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
  삭제
</button>
```

## 입력 필드

```tsx
<input
  type="text"
  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
  placeholder="메시지를 입력하세요"
/>
```

## 카드 (Glass)

```tsx
<div className="glass-card rounded-2xl p-6">
  <h3 className="text-lg font-medium text-gray-100">제목</h3>
  <p className="mt-2 text-sm text-gray-400">설명</p>
</div>
```

또는 Tailwind 유틸리티로:
```tsx
<div className="rounded-2xl bg-background-lighter/50 p-6 border border-white/5 backdrop-blur-sm">
  <h3 className="text-lg font-medium text-gray-100">제목</h3>
  <p className="mt-2 text-sm text-gray-400">설명</p>
</div>
```

## 사이드바

```tsx
<aside className="flex h-screen w-72 flex-col bg-background-lighter/80 backdrop-blur-xl border-r border-white/5">
  {/* 사이드바 내용 */}
</aside>
```

## 로딩 스피너

```tsx
<div className="flex items-center justify-center">
  <svg className="h-8 w-8 animate-spin text-primary">...</svg>
</div>
```

## 채팅 메시지 레이아웃

```tsx
{/* 사용자 메시지 */}
<div className="flex justify-end">
  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary-600/80 to-accent-purple/80 px-5 py-3 text-white shadow-lg">
    {message.content}
  </div>
</div>

{/* AI 메시지 */}
<div className="flex justify-start">
  <div className="max-w-[85%] text-gray-300">
    <MarkdownRenderer content={message.content} />
  </div>
</div>
```

## 에러 메시지

```tsx
<div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
  에러 내용
</div>
```

## 모달

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
  <div className="glass-card w-full max-w-md rounded-2xl p-6 animate-fade-in">
    {/* 모달 내용 */}
  </div>
</div>
```

## 공통 패턴

- **Transition**: `transition-colors`, `transition-all duration-200`
- **Round**: `rounded-xl` (기본), `rounded-2xl` (카드/모달), `rounded-3xl` (인증 카드)
- **Shadow**: `shadow-lg shadow-primary/20` (주요), `shadow-2xl` (모달)
- **Focus ring**: `focus:ring-4 focus:ring-primary/10 focus:outline-none`
- **Border**: `border border-white/10` (기본), `ring-1 ring-white/10` (강조)
- **Glass**: `bg-white/5 backdrop-blur-sm` 또는 `.glass-card` 클래스
- **Hover**: `hover:bg-white/10` (기본), `hover:bg-white/5` (서브틀)
