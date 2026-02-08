import { Conversation } from '@shared/index';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelect: (id: string) => void;
}

/**
 * 대화 목록 컴포넌트 (사이드바 내부용)
 * - 대화 아이템 렌더링
 * - 활성 대화 하이라이트
 */
const ConversationList = ({
  conversations,
  currentConversationId,
  onSelect,
}: ConversationListProps) => {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-sm text-gray-400">
        대화가 없습니다
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <button
            onClick={() => onSelect(conversation.id)}
            className={`
              flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm
              transition-colors duration-150
              ${
                currentConversationId === conversation.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }
            `}
          >
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="flex-1 truncate">
              {conversation.title || '새 대화'}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ConversationList;
