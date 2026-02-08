import { useCallback } from 'react';
import { useChatStore } from '@/stores/chat-store';
import * as chatService from '@/services/chat-service';
import { MessageRole } from '@shared/index';

interface UseChatReturn {
  conversations: ReturnType<typeof useChatStore.getState>['conversations'];
  currentConversation: ReturnType<typeof useChatStore.getState>['currentConversation'];
  messages: ReturnType<typeof useChatStore.getState>['messages'];
  isStreaming: boolean;
  streamingContent: string;
  loadConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<string>;
  selectConversation: (id: string) => Promise<void>;
  updateTitle: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

/**
 * 채팅 기능 커스텀 훅
 * - 대화 CRUD
 * - 메시지 전송 (비스트리밍 REST)
 * - 현재 대화 상태 관리
 */
export const useChat = (): UseChatReturn => {
  const {
    conversations,
    currentConversation,
    messages,
    isStreaming,
    streamingContent,
    setConversations,
    addConversation,
    removeConversation,
    updateConversationTitle,
    setCurrentConversation,
    setMessages,
    addMessage,
    setStreaming,
  } = useChatStore();

  // 대화 목록 불러오기
  const loadConversations = useCallback(async () => {
    try {
      const result = await chatService.getConversations();
      setConversations(result.items ?? []);
    } catch (err) {
      // 에러 시 빈 목록 유지
    }
  }, [setConversations]);

  // 새 대화 생성
  const createConversation = useCallback(
    async (title?: string): Promise<string> => {
      const conversation = await chatService.createConversation({ title });
      addConversation(conversation);
      setCurrentConversation(conversation);
      setMessages([]);
      return conversation.id;
    },
    [addConversation, setCurrentConversation, setMessages],
  );

  // 대화 선택 (메시지 포함 조회)
  const selectConversation = useCallback(
    async (id: string) => {
      try {
        const conversationWithMessages = await chatService.getConversation(id);
        const { messages: msgs, ...conversation } = conversationWithMessages;
        setCurrentConversation(conversation);
        setMessages(msgs ?? []);
      } catch {
        // 대화를 찾을 수 없는 경우
      }
    },
    [setCurrentConversation, setMessages],
  );

  // 대화 제목 수정
  const updateTitle = useCallback(
    async (id: string, title: string) => {
      await chatService.updateConversation(id, { title });
      updateConversationTitle(id, title);
    },
    [updateConversationTitle],
  );

  // 대화 삭제
  const deleteConversation = useCallback(
    async (id: string) => {
      await chatService.deleteConversation(id);
      removeConversation(id);
    },
    [removeConversation],
  );

  // 메시지 전송 (비스트리밍 REST — 폴백용)
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentConversation || isStreaming) return;

      setStreaming(true);
      try {
        const result = await chatService.sendMessage(
          currentConversation.id,
          content,
        );

        addMessage({
          id: result.userMessage.id,
          conversationId: currentConversation.id,
          role: MessageRole.USER,
          content: result.userMessage.content,
          createdAt: new Date(result.userMessage.createdAt),
        });

        addMessage({
          id: result.assistantMessage.id,
          conversationId: currentConversation.id,
          role: MessageRole.ASSISTANT,
          content: result.assistantMessage.content,
          createdAt: new Date(result.assistantMessage.createdAt),
        });

        // 제목이 '새 대화'이면 업데이트될 수 있으므로 대화 목록 새로고침
        await loadConversations();
      } finally {
        setStreaming(false);
      }
    },
    [currentConversation, isStreaming, setStreaming, addMessage, loadConversations],
  );

  return {
    conversations,
    currentConversation,
    messages,
    isStreaming,
    streamingContent,
    loadConversations,
    createConversation,
    selectConversation,
    updateTitle,
    deleteConversation,
    sendMessage,
  };
};
