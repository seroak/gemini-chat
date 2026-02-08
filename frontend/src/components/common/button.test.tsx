import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './button';

describe('Button', () => {
  it('텍스트를 렌더링한다', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByText('클릭')).toBeInTheDocument();
  });

  it('클릭 이벤트를 처리한다', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    fireEvent.click(screen.getByText('클릭'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서는 클릭되지 않는다', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>클릭</Button>);
    fireEvent.click(screen.getByText('클릭'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('isLoading일 때 로딩 스피너를 표시하고 비활성화된다', () => {
    render(<Button isLoading>클릭</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('variant에 따라 적절한 스타일을 적용한다', () => {
    const { rerender } = render(<Button variant="primary">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('from-indigo-600');

    rerender(<Button variant="danger">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-50');
  });

  it('size에 따라 적절한 패딩을 적용한다', () => {
    const { rerender } = render(<Button size="sm">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3');

    rerender(<Button size="lg">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6');
  });
});
