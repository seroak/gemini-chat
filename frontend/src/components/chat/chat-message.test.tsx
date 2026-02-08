import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from './chat-message';
import { MessageRole } from '@shared/index';

// useAuthStore 모킹
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ user: { name: '테스트 사용자' } }),
}));

describe('ChatMessage', () => {
  it('사용자 메시지를 렌더링한다', () => {
    render(
      <ChatMessage
        message={{
          id: 'msg-1',
          conversationId: 'conv-1',
          role: MessageRole.USER,
          content: '안녕하세요',
          createdAt: new Date(),
        }}
      />,
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
    expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
  });

  it('AI 메시지를 렌더링한다', () => {
    render(
      <ChatMessage
        message={{
          id: 'msg-2',
          conversationId: 'conv-1',
          role: MessageRole.ASSISTANT,
          content: '반갑습니다!',
          createdAt: new Date(),
        }}
      />,
    );
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('사용자 메시지는 흰색 배경이다', () => {
    const { container } = render(
      <ChatMessage
        message={{
          id: 'msg-1',
          conversationId: 'conv-1',
          role: MessageRole.USER,
          content: '안녕',
          createdAt: new Date(),
        }}
      />,
    );
    expect(container.firstChild).toHaveClass('bg-white');
  });

  it('AI 메시지는 회색 배경이다', () => {
    const { container } = render(
      <ChatMessage
        message={{
          id: 'msg-2',
          conversationId: 'conv-1',
          role: MessageRole.ASSISTANT,
          content: '안녕하세요',
          createdAt: new Date(),
        }}
      />,
    );
    expect(container.firstChild).toHaveClass('bg-[#f8fafc]/50');
  });

  it('스트리밍 중일 때 타이핑 인디케이터를 표시한다', () => {
    const { container } = render(
      <ChatMessage
        message={{
          id: 'streaming',
          conversationId: 'conv-1',
          role: MessageRole.ASSISTANT,
          content: '생성 중...',
          createdAt: new Date(),
        }}
        isStreaming
      />,
    );
    expect(container.querySelector('.typing-dot')).toBeInTheDocument();
  });
});
