import { Message, MessageRole } from '@shared/index';
import Avatar from '@/components/common/avatar';
import MarkdownRenderer from './markdown-renderer';
import { useAuthStore } from '@/stores/auth-store';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

const ChatMessage = ({ message, isStreaming = false }: ChatMessageProps) => {
  const userName = useAuthStore((state) => state.user?.name);
  const isUser = message.role === MessageRole.USER;

  return (
    <div
      className={`message-appear w-full px-4 py-8 group ${
        isUser
          ? 'bg-transparent'
          : 'bg-background-lighter/30 backdrop-blur-sm border-y border-white/5'
      }`}
    >
      <div className={`mx-auto flex max-w-3xl gap-6 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className="shrink-0 pt-1">
          {isUser ? (
            <Avatar name={userName || 'U'} size="sm" className="ring-2 ring-white/10" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-purple shadow-lg shadow-primary/20 ring-1 ring-white/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div
          className={`flex min-w-0 max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-200">
              {isUser ? userName || 'You' : 'Anti-Gravity AI'}
            </span>
            {!isUser && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary-300">
                BOT
              </span>
            )}
          </div>

          <div
            className={`
              prose prose-invert max-w-none text-[15px] leading-7
              ${
                isUser
                  ? 'bg-gradient-to-br from-primary-600/80 to-accent-purple/80 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-lg'
                  : 'text-gray-300'
              }
            `}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
            {isStreaming && (
              <span className="ml-2 inline-flex items-center gap-1 align-middle">
                <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
                <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-accent-purple" />
                <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-accent-pink" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
