import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from './chat-input';

describe('ChatInput', () => {
  it('입력 필드를 렌더링한다', () => {
    render(<ChatInput value="" onChange={vi.fn()} onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeInTheDocument();
  });

  it('사용자 입력을 처리한다', () => {
    const onChange = vi.fn();
    render(<ChatInput value="" onChange={onChange} onSend={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('메시지를 입력하세요...'), {
      target: { value: 'hello' },
    });
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('전송 버튼 클릭 시 onSend를 호출한다', () => {
    const onSend = vi.fn();
    render(<ChatInput value="test" onChange={vi.fn()} onSend={onSend} />);
    fireEvent.submit(screen.getByRole('button'));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('빈 입력일 때 전송 버튼이 비활성화된다', () => {
    render(<ChatInput value="" onChange={vi.fn()} onSend={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('isDisabled일 때 입력이 비활성화된다', () => {
    render(<ChatInput value="" onChange={vi.fn()} onSend={vi.fn()} isDisabled />);
    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeDisabled();
  });

  it('Enter 키로 전송한다', () => {
    const onSend = vi.fn();
    render(<ChatInput value="test" onChange={vi.fn()} onSend={onSend} />);
    fireEvent.keyDown(screen.getByPlaceholderText('메시지를 입력하세요...'), {
      key: 'Enter',
      shiftKey: false,
    });
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('Shift+Enter로는 전송하지 않는다 (줄바꿈)', () => {
    const onSend = vi.fn();
    render(<ChatInput value="test" onChange={vi.fn()} onSend={onSend} />);
    fireEvent.keyDown(screen.getByPlaceholderText('메시지를 입력하세요...'), {
      key: 'Enter',
      shiftKey: true,
    });
    expect(onSend).not.toHaveBeenCalled();
  });
});
