import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConversationList from './conversation-list';
import { Conversation } from '@shared/index';

const mockConversations: Conversation[] = [
  { id: 'conv-1', userId: 'u1', title: '첫 번째 대화', createdAt: new Date(), updatedAt: new Date() },
  { id: 'conv-2', userId: 'u1', title: '두 번째 대화', createdAt: new Date(), updatedAt: new Date() },
];

describe('ConversationList', () => {
  it('대화 목록을 렌더링한다', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('첫 번째 대화')).toBeInTheDocument();
    expect(screen.getByText('두 번째 대화')).toBeInTheDocument();
  });

  it('빈 목록일 때 안내 메시지를 표시한다', () => {
    render(
      <ConversationList
        conversations={[]}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('대화가 없습니다')).toBeInTheDocument();
  });

  it('대화 클릭 시 onSelect를 호출한다', () => {
    const onSelect = vi.fn();
    render(
      <ConversationList
        conversations={mockConversations}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText('첫 번째 대화'));
    expect(onSelect).toHaveBeenCalledWith('conv-1');
  });

  it('현재 대화를 하이라이트한다', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        currentConversationId="conv-1"
        onSelect={vi.fn()}
      />,
    );
    const activeButton = screen.getByText('첫 번째 대화').closest('button');
    expect(activeButton).toHaveClass('bg-gray-700');
  });
});
