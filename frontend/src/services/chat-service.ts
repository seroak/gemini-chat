import apiClient from './api-client';
import {
  API_ENDPOINTS,
  Conversation,
  ConversationWithMessages,
  CreateConversationDto,
  UpdateConversationDto,
} from '@shared/index';

export interface PaginatedConversations {
  items: Conversation[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    hasNextPage: boolean;
  };
}

export interface ChatResponse {
  conversation: Conversation;
  userMessage: {
    id: string;
    content: string;
    role: string;
    createdAt: string;
  };
  assistantMessage: {
    id: string;
    content: string;
    role: string;
    createdAt: string;
  };
}

/**
 * 대화 목록 조회 (페이지네이션)
 */
export const getConversations = async (
  page = 1,
  limit = 20,
): Promise<PaginatedConversations> => {
  const response = await apiClient.get<{ data: PaginatedConversations }>(
    API_ENDPOINTS.CONVERSATIONS.LIST,
    { params: { page, limit } },
  );
  return response.data.data;
};

/**
 * 새 대화 생성
 */
export const createConversation = async (
  dto: CreateConversationDto,
): Promise<Conversation> => {
  const response = await apiClient.post<{ data: Conversation }>(
    API_ENDPOINTS.CONVERSATIONS.CREATE,
    dto,
  );
  return response.data.data;
};

/**
 * 대화 상세 조회 (메시지 포함)
 */
export const getConversation = async (
  id: string,
): Promise<ConversationWithMessages> => {
  const response = await apiClient.get<{ data: ConversationWithMessages }>(
    API_ENDPOINTS.CONVERSATIONS.GET(id),
  );
  return response.data.data;
};

/**
 * 대화 제목 수정
 */
export const updateConversation = async (
  id: string,
  dto: UpdateConversationDto,
): Promise<Conversation> => {
  const response = await apiClient.patch<{ data: Conversation }>(
    API_ENDPOINTS.CONVERSATIONS.UPDATE(id),
    dto,
  );
  return response.data.data;
};

/**
 * 대화 삭제 (Soft Delete)
 */
export const deleteConversation = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.CONVERSATIONS.DELETE(id));
};

/**
 * 메시지 전송 (비스트리밍 — REST)
 */
export const sendMessage = async (
  conversationId: string,
  message: string,
): Promise<ChatResponse> => {
  const response = await apiClient.post<{ data: ChatResponse }>(
    API_ENDPOINTS.MESSAGES.CREATE(conversationId),
    { message },
  );
  return response.data.data;
};
