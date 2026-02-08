import { create } from 'zustand';
import { Conversation, Message } from '@shared/index';

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  isSidebarOpen: boolean;
}

interface ChatActions {
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  removeConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setStreaming: (isStreaming: boolean) => void;
  appendStreamingContent: (chunk: string) => void;
  resetStreamingContent: () => void;
  finalizeStreamingMessage: (message: Message) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  reset: () => void;
}

export type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  isSidebarOpen: true,
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,

  // 대화 목록 관리
  setConversations: (conversations: Conversation[]) => {
    set({ conversations });
  },

  addConversation: (conversation: Conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    }));
  },

  removeConversation: (id: string) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversation:
        state.currentConversation?.id === id
          ? null
          : state.currentConversation,
      messages:
        state.currentConversation?.id === id ? [] : state.messages,
    }));
  },

  updateConversationTitle: (id: string, title: string) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title } : c,
      ),
      currentConversation:
        state.currentConversation?.id === id
          ? { ...state.currentConversation, title }
          : state.currentConversation,
    }));
  },

  // 현재 대화 관리
  setCurrentConversation: (conversation: Conversation | null) => {
    set({
      currentConversation: conversation,
      messages: [],
      streamingContent: '',
      isStreaming: false,
    });
  },

  // 메시지 관리
  setMessages: (messages: Message[]) => {
    set({ messages });
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // 스트리밍 관리
  setStreaming: (isStreaming: boolean) => {
    set({ isStreaming });
  },

  appendStreamingContent: (chunk: string) => {
    set((state) => ({
      streamingContent: state.streamingContent + chunk,
    }));
  },

  resetStreamingContent: () => {
    set({ streamingContent: '' });
  },

  finalizeStreamingMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
      streamingContent: '',
      isStreaming: false,
    }));
  },

  // 사이드바
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open });
  },

  // 초기화
  reset: () => {
    set(initialState);
  },
}));
