import { useEffect, useRef } from 'react';
import { Message, MessageRole } from '@shared/index';
import ChatMessage from './chat-message';

interface ChatMessagesListProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  currentConversationId?: string;
}

const ChatMessagesList = ({
  messages,
  streamingContent,
  isStreaming,
  currentConversationId,
}: ChatMessagesListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.length, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="pb-32">
        {(messages ?? []).map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isStreaming && streamingContent && currentConversationId && (
          <ChatMessage
            message={{
              id: 'streaming',
              conversationId: currentConversationId,
              role: MessageRole.ASSISTANT,
              content: streamingContent,
              createdAt: new Date(),
            }}
            isStreaming
          />
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};

export default ChatMessagesList;
