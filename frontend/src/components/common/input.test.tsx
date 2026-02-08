import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './input';

describe('Input', () => {
  it('라벨을 렌더링한다', () => {
    render(<Input label="이메일" />);
    expect(screen.getByText('이메일')).toBeInTheDocument();
  });

  it('placeholder를 표시한다', () => {
    render(<Input placeholder="입력하세요" />);
    expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
  });

  it('입력 이벤트를 처리한다', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('에러 메시지를 표시한다', () => {
    render(<Input error="필수 입력 항목입니다" />);
    expect(screen.getByText('필수 입력 항목입니다')).toBeInTheDocument();
  });

  it('에러 시 빨간 테두리 스타일을 적용한다', () => {
    render(<Input error="에러" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300');
  });

  it('disabled 상태를 지원한다', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
