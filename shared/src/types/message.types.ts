export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface CreateMessageDto {
  conversationId: string;
  role: MessageRole;
  content: string;
}

export interface StreamChunk {
  conversationId: string;
  chunk: string;
  isComplete: boolean;
}
