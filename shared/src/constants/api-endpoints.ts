export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  CONVERSATIONS: {
    LIST: '/conversations',
    GET: (id: string) => `/conversations/${id}`,
    CREATE: '/conversations',
    UPDATE: (id: string) => `/conversations/${id}`,
    DELETE: (id: string) => `/conversations/${id}`,
  },
  MESSAGES: {
    LIST: (conversationId: string) => `/conversations/${conversationId}/messages`,
    CREATE: (conversationId: string) => `/conversations/${conversationId}/messages`,
  },
  CHAT: {
    SEND: '/chat/send',
    STREAM: '/chat/stream',
  },
} as const;
