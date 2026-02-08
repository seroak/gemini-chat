# Frontend Test Patterns (Vitest)

## 컴포넌트 테스트 기본 구조

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ComponentName from './component-name';

describe('ComponentName', () => {
  const defaultProps = {
    // 기본 props
  };

  it('올바르게 렌더링된다', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

## 사용자 상호작용 테스트

```tsx
it('버튼 클릭 시 핸들러가 호출된다', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();

  render(<Button onClick={handleClick}>클릭</Button>);
  await user.click(screen.getByRole('button', { name: /클릭/ }));

  expect(handleClick).toHaveBeenCalledTimes(1);
});

it('입력 후 폼 제출 시 올바른 값이 전달된다', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<ChatInput onSubmit={handleSubmit} />);
  await user.type(screen.getByRole('textbox'), '안녕하세요');
  await user.click(screen.getByRole('button', { name: /전송/ }));

  expect(handleSubmit).toHaveBeenCalledWith('안녕하세요');
});
```

## Zustand 스토어 테스트

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import useAuthStore from '@/stores/auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    // 스토어 초기화
    const { result } = renderHook(() => useAuthStore());
    act(() => result.current.logout());
  });

  it('setUser 호출 시 인증 상태가 true가 된다', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser(mockUser, 'mock-token');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('logout 호출 시 인증 상태가 초기화된다', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser(mockUser, 'mock-token');
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

## API 서비스 모킹

```tsx
// vi.mock으로 모듈 모킹
vi.mock('@/services/auth-service', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
  },
}));

// 또는 MSW (Mock Service Worker) 사용
```

## Zustand 스토어 모킹 (컴포넌트 테스트에서)

```tsx
vi.mock('@/stores/auth-store', () => ({
  default: vi.fn(() => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
  })),
}));
```

## 조건부 렌더링 테스트

```tsx
it('로딩 중이면 스피너를 표시한다', () => {
  render(<Component isLoading={true} />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});

it('에러가 있으면 에러 메시지를 표시한다', () => {
  render(<Component error="서버 오류" />);
  expect(screen.getByText('서버 오류')).toBeInTheDocument();
});

it('데이터가 없으면 빈 상태를 표시한다', () => {
  render(<Component items={[]} />);
  expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
});
```

## 쿼리 우선순위

1. `getByRole` — 접근성 역할 (가장 선호)
2. `getByLabelText` — 라벨 텍스트
3. `getByPlaceholderText` — 플레이스홀더
4. `getByText` — 텍스트 콘텐츠
5. `getByTestId` — data-testid (최후 수단)
