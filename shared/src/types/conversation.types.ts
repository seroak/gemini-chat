import { Message } from './message.types';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface CreateConversationDto {
  title?: string;
}

export interface UpdateConversationDto {
  title: string;
}
