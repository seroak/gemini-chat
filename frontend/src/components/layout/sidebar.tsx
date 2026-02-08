import { useState } from 'react';
import { Conversation } from '@shared/index';
import Avatar from '@/components/common/avatar';
import { useAuthStore } from '@/stores/auth-store';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  isOpen: boolean;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const Sidebar = ({
  conversations,
  currentConversationId,
  isOpen,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onUpdateTitle,
  onToggleSidebar,
  onLogout,
}: SidebarProps) => {
  const user = useAuthStore((state) => state.user);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdateTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') handleSaveEdit(id);
    else if (e.key === 'Escape') setEditingId(null);
  };

  const handleDelete = (id: string) => {
    onDeleteConversation(id);
    setDeletingId(null);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-72 flex-col
          bg-background-lighter/80 backdrop-blur-xl border-r border-white/5
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header: Logo & New Chat */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-purple shadow-lg shadow-primary/20">
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
            <span className="text-lg font-bold tracking-tight text-white">Anti-Gravity</span>
          </div>
          <button
            onClick={onCreateConversation}
            className="rounded-xl p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white hover:shadow-sm active:scale-95"
            title="New Chat"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/5" />

        {/* Conversation List */}
        <div className="dark-scrollbar flex-1 overflow-y-auto px-3 py-3">
          {!conversations || conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <svg
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No conversations yet</p>
              <p className="mt-1 text-xs text-gray-600">Start a new chat to begin</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  {editingId === conversation.id ? (
                    <div className="rounded-xl bg-white/10 p-1.5 backdrop-blur-sm">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, conversation.id)}
                        onBlur={() => handleSaveEdit(conversation.id)}
                        className="w-full rounded-lg bg-black/20 px-3 py-2 text-sm text-white outline-none ring-1 ring-primary-500/50 placeholder:text-gray-500"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectConversation(conversation.id)}
                      className={`
                        group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm
                        transition-all duration-200
                        ${
                          currentConversationId === conversation.id
                            ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-white shadow-sm ring-1 ring-white/10'
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }
                      `}
                    >
                      <svg
                        className={`h-4 w-4 shrink-0 transition-opacity ${
                          currentConversationId === conversation.id
                            ? 'text-primary-400 opacity-100'
                            : 'opacity-40'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      <span className="flex-1 truncate font-medium">
                        {conversation.title || 'New Conversation'}
                      </span>

                      {/* Actions on Hover */}
                      <div className="hidden shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(conversation.id, conversation.title);
                          }}
                          className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
                          title="Rename"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(conversation.id);
                          }}
                          className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
                          title="Delete"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </button>
                  )}

                  {/* Delete Confirmation */}
                  {deletingId === conversation.id && (
                    <div className="mt-1 flex flex-col gap-2 rounded-xl bg-red-500/10 p-3 backdrop-blur-md">
                      <p className="text-xs font-medium text-red-200">Delete this conversation?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(conversation.id)}
                          className="flex-1 rounded-lg bg-red-500/80 px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/20"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer: User Profile */}
        <div className="border-t border-white/5 p-3">
          <div className="group flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-white/5">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-200 group-hover:text-white">
                {user?.name}
              </p>
              <p className="truncate text-xs text-gray-500 group-hover:text-gray-400">
                {user?.email}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/10 hover:text-gray-300"
              title="Logout"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
