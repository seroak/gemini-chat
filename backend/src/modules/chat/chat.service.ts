import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageRole } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import {
  PaginatedConversationsDto,
  PaginationMetaDto,
} from './dto/paginated-conversations.dto';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { GeminiService } from '../gemini/gemini.service';
import { ChatMessage } from '../gemini/dto/generate-content.dto';

const DEFAULT_CONVERSATION_TITLE = 'New Conversation';
const TITLE_GENERATION_MAX_LENGTH = 50;

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly geminiService: GeminiService,
  ) {}

  async createConversation(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = this.conversationRepository.create({
      userId,
      title: dto.title ?? DEFAULT_CONVERSATION_TITLE,
    });
    const saved = await this.conversationRepository.save(conversation);
    return new ConversationResponseDto(saved);
  }

  async getConversations(
    userId: string,
    query: GetConversationsQueryDto,
  ): Promise<PaginatedConversationsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.conversationRepository.findAndCount({
      where: { userId },
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

    const meta = new PaginationMetaDto(page, limit, totalItems);
    const dtos = items.map((c) => new ConversationResponseDto(c));
    return new PaginatedConversationsDto(dtos, meta);
  }

  async getConversationById(
    userId: string,
    conversationId: string,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, userId },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException('대화를 찾을 수 없습니다');
    }

    return new ConversationResponseDto(conversation);
  }

  async updateConversation(
    userId: string,
    conversationId: string,
    dto: UpdateConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('대화를 찾을 수 없습니다');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('해당 대화를 수정할 권한이 없습니다');
    }

    conversation.title = dto.title;
    const saved = await this.conversationRepository.save(conversation);
    return new ConversationResponseDto(saved);
  }

  async deleteConversation(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('대화를 찾을 수 없습니다');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('해당 대화를 삭제할 권한이 없습니다');
    }

    await this.conversationRepository.softRemove(conversation);
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<ChatResponseDto> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, userId },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException('대화를 찾을 수 없습니다');
    }

    const userMessage = await this.saveMessage(
      conversationId,
      MessageRole.USER,
      dto.message,
    );

    const history: ChatMessage[] = conversation.messages.map((m) => ({
      role: m.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const assistantContent = await this.geminiService.generateChatResponse(
      dto.message,
      history,
    );
    const assistantMessage = await this.saveMessage(
      conversationId,
      MessageRole.ASSISTANT,
      assistantContent,
    );

    const isFirstMessage = conversation.messages.length === 0;
    if (isFirstMessage) {
      await this.updateConversationTitleFromFirstMessage(
        conversationId,
        userId,
        dto.message,
      );
    }

    await this.conversationRepository.update(conversationId, {
      updatedAt: new Date(),
    });

    const updatedConversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    return new ChatResponseDto(
      new ConversationResponseDto(updatedConversation!),
      new MessageResponseDto(userMessage),
      new MessageResponseDto(assistantMessage),
    );
  }

  async saveMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      conversationId,
      role,
      content,
    });
    return this.messageRepository.save(message);
  }

  async getConversationWithMessagesForStreaming(
    userId: string,
    conversationId: string,
  ): Promise<{ conversation: Conversation; history: ChatMessage[] }> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, userId },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException('대화를 찾을 수 없습니다');
    }

    const history: ChatMessage[] = conversation.messages.map((m) => ({
      role: m.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    return { conversation, history };
  }

  /**
   * 첫 메시지 기반 대화 제목 자동 생성 (REST 및 WebSocket 스트리밍 공통)
   */
  async updateTitleFromFirstMessage(
    conversationId: string,
    userId: string,
    firstMessageContent: string,
  ): Promise<void> {
    try {
      const prompt = `다음 사용자 메시지를 한 줄 제목으로 요약해줘. 제목만 출력하고 따옴표나 설명 없이 ${TITLE_GENERATION_MAX_LENGTH}자 이내로 답해줘.\n\n메시지: ${firstMessageContent}`;
      const title = await this.geminiService.generateContent(prompt);
      const trimmed =
        title.trim().slice(0, TITLE_GENERATION_MAX_LENGTH) ||
        DEFAULT_CONVERSATION_TITLE;
      await this.conversationRepository.update(conversationId, {
        title: trimmed,
      });
    } catch {
      await this.conversationRepository.update(conversationId, {
        title:
          firstMessageContent.slice(0, TITLE_GENERATION_MAX_LENGTH) ||
          DEFAULT_CONVERSATION_TITLE,
      });
    }
  }

  private async updateConversationTitleFromFirstMessage(
    conversationId: string,
    userId: string,
    firstMessageContent: string,
  ): Promise<void> {
    return this.updateTitleFromFirstMessage(
      conversationId,
      userId,
      firstMessageContent,
    );
  }
}
