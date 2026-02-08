import { useCallback, useEffect, useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import ChatMessagesList from '@/components/chat/chat-messages-list';
import ChatInput from '@/components/chat/chat-input';
import WelcomeScreen from '@/components/chat/welcome-screen';
import { useChat } from '@/hooks/use-chat';
import { useStreaming } from '@/hooks/use-streaming';
import { useChatStore } from '@/stores/chat-store';
import { useAuth } from '@/hooks/use-auth';

/**
 * 채팅 메인 페이지
 * - 사이드바 + 채팅 영역 레이아웃
 * - 대화 선택/전환 로직
 * - 새 대화 생성 플로우
 * - 스트리밍 메시지 처리
 * - 반응형 디자인 (모바일/데스크탑)
 */
const ChatPage = () => {
  const { logout } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    streamingContent,
    loadConversations,
    createConversation,
    selectConversation,
    updateTitle,
    deleteConversation,
  } = useChat();

  const { isConnected, isStreaming, sendStreamMessage } = useStreaming();
  const { isSidebarOpen, toggleSidebar } = useChatStore();

  const [inputValue, setInputValue] = useState('');

  // 초기 대화 목록 로드
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 메시지 전송 핸들러
  const handleSendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;

    let conversationId = currentConversation?.id;

    // 현재 대화가 없으면 새 대화 생성
    if (!conversationId) {
      try {
        conversationId = await createConversation();
      } catch {
        return;
      }
    }

    setInputValue('');

    // WebSocket 스트리밍 사용 (연결 시)
    if (isConnected) {
      sendStreamMessage(conversationId, trimmed);
    }
  }, [
    inputValue,
    isStreaming,
    currentConversation,
    createConversation,
    isConnected,
    sendStreamMessage,
  ]);

  // 예시 프롬프트 클릭 핸들러
  const handleExamplePrompt = useCallback(
    async (prompt: string) => {
      let conversationId = currentConversation?.id;

      if (!conversationId) {
        try {
          conversationId = await createConversation();
        } catch {
          return;
        }
      }

      if (isConnected) {
        sendStreamMessage(conversationId, prompt);
      }
    },
    [currentConversation, createConversation, isConnected, sendStreamMessage],
  );

  // 새 대화 생성 핸들러
  const handleCreateConversation = useCallback(async () => {
    try {
      await createConversation();
    } catch {
      // 에러 무시
    }
  }, [createConversation]);

  const sidebar = (
    <Sidebar
      conversations={conversations}
      currentConversationId={currentConversation?.id}
      isOpen={isSidebarOpen}
      onSelectConversation={selectConversation}
      onCreateConversation={handleCreateConversation}
      onDeleteConversation={deleteConversation}
      onUpdateTitle={updateTitle}
      onToggleSidebar={toggleSidebar}
      onLogout={logout}
    />
  );

  const hasMessages = (messages?.length ?? 0) > 0 || (isStreaming && streamingContent);

  return (
    <MainLayout sidebar={sidebar}>
      <Header
        title={currentConversation?.title}
        onToggleSidebar={toggleSidebar}
      />

      {hasMessages ? (
        <ChatMessagesList
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          currentConversationId={currentConversation?.id}
        />
      ) : (
        <WelcomeScreen onSendPrompt={handleExamplePrompt} />
      )}

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        isDisabled={isStreaming}
        placeholder={
          isConnected
            ? '메시지를 입력하세요...'
            : '연결 중...'
        }
      />
    </MainLayout>
  );
};

export default ChatPage;
