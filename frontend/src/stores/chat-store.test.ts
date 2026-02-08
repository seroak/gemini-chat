import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './chat-store';
import { Conversation, Message, MessageRole } from '@shared/index';

const mockConversation: Conversation = {
  id: 'conv-1',
  userId: 'user-1',
  title: '테스트 대화',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMessage: Message = {
  id: 'msg-1',
  conversationId: 'conv-1',
  role: MessageRole.USER,
  content: '안녕하세요',
  createdAt: new Date(),
};

describe('ChatStore', () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  describe('setConversations', () => {
    it('대화 목록을 설정한다', () => {
      useChatStore.getState().setConversations([mockConversation]);
      expect(useChatStore.getState().conversations).toHaveLength(1);
      expect(useChatStore.getState().conversations[0].id).toBe('conv-1');
    });
  });

  describe('addConversation', () => {
    it('새 대화를 목록 맨 앞에 추가한다', () => {
      useChatStore.getState().setConversations([mockConversation]);
      const newConv = { ...mockConversation, id: 'conv-2', title: '새 대화' };
      useChatStore.getState().addConversation(newConv);

      const conversations = useChatStore.getState().conversations;
      expect(conversations).toHaveLength(2);
      expect(conversations[0].id).toBe('conv-2');
    });
  });

  describe('removeConversation', () => {
    it('대화를 목록에서 제거한다', () => {
      useChatStore.getState().setConversations([mockConversation]);
      useChatStore.getState().removeConversation('conv-1');
      expect(useChatStore.getState().conversations).toHaveLength(0);
    });

    it('현재 대화가 삭제되면 currentConversation을 null로 설정한다', () => {
      useChatStore.getState().setConversations([mockConversation]);
      useChatStore.getState().setCurrentConversation(mockConversation);
      useChatStore.getState().removeConversation('conv-1');

      expect(useChatStore.getState().currentConversation).toBeNull();
    });
  });

  describe('updateConversationTitle', () => {
    it('대화 제목을 업데이트한다', () => {
      useChatStore.getState().setConversations([mockConversation]);
      useChatStore.getState().updateConversationTitle('conv-1', '새 제목');
      expect(useChatStore.getState().conversations[0].title).toBe('새 제목');
    });
  });

  describe('messages', () => {
    it('메시지를 설정하고 추가할 수 있다', () => {
      useChatStore.getState().setMessages([mockMessage]);
      expect(useChatStore.getState().messages).toHaveLength(1);

      const newMsg = { ...mockMessage, id: 'msg-2', content: '두번째' };
      useChatStore.getState().addMessage(newMsg);
      expect(useChatStore.getState().messages).toHaveLength(2);
    });
  });

  describe('streaming', () => {
    it('스트리밍 콘텐츠를 추가하고 최종 메시지로 확정한다', () => {
      useChatStore.getState().setStreaming(true);
      expect(useChatStore.getState().isStreaming).toBe(true);

      useChatStore.getState().appendStreamingContent('안녕');
      useChatStore.getState().appendStreamingContent('하세요');
      expect(useChatStore.getState().streamingContent).toBe('안녕하세요');

      const finalMsg: Message = {
        id: 'msg-final',
        conversationId: 'conv-1',
        role: MessageRole.ASSISTANT,
        content: '안녕하세요',
        createdAt: new Date(),
      };
      useChatStore.getState().finalizeStreamingMessage(finalMsg);

      expect(useChatStore.getState().isStreaming).toBe(false);
      expect(useChatStore.getState().streamingContent).toBe('');
      expect(useChatStore.getState().messages).toHaveLength(1);
    });
  });

  describe('sidebar', () => {
    it('사이드바를 토글한다', () => {
      expect(useChatStore.getState().isSidebarOpen).toBe(true);
      useChatStore.getState().toggleSidebar();
      expect(useChatStore.getState().isSidebarOpen).toBe(false);
      useChatStore.getState().toggleSidebar();
      expect(useChatStore.getState().isSidebarOpen).toBe(true);
    });
  });
});
