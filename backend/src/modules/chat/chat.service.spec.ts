import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageRole } from './entities/message.entity';
import { GeminiService } from '../gemini/gemini.service';

describe('ChatService', () => {
  let service: ChatService;
  let conversationRepository: jest.Mocked<Repository<Conversation>>;
  let messageRepository: jest.Mocked<Repository<Message>>;
  let geminiService: GeminiService;

  const mockConversationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockMessageRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockGeminiService = {
    generateChatResponse: jest.fn(),
    generateContent: jest.fn(),
  };

  const mockUserId = 'user-uuid';
  const mockConversationId = 'conv-uuid';
  const mockConversation = {
    id: mockConversationId,
    userId: mockUserId,
    title: 'New Conversation',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    user: undefined,
  } as unknown as Conversation;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Conversation),
          useValue: mockConversationRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: GeminiService,
          useValue: mockGeminiService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    conversationRepository = module.get(getRepositoryToken(Conversation));
    messageRepository = module.get(getRepositoryToken(Message));
    geminiService = module.get<GeminiService>(GeminiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createConversation', () => {
    it('새 대화를 생성하고 DTO를 반환한다', async () => {
      const dto = { title: '첫 번째 대화' };
      const created = { ...mockConversation, title: dto.title };
      mockConversationRepository.create.mockReturnValue(created);
      mockConversationRepository.save.mockResolvedValue(created);

      const result = await service.createConversation(mockUserId, dto);

      expect(mockConversationRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        title: dto.title,
      });
      expect(mockConversationRepository.save).toHaveBeenCalledWith(created);
      expect(result.title).toBe(dto.title);
      expect(result.id).toBe(mockConversationId);
    });

    it('title이 없으면 기본 제목으로 생성한다', async () => {
      const created = { ...mockConversation, title: 'New Conversation' };
      mockConversationRepository.create.mockReturnValue(created);
      mockConversationRepository.save.mockResolvedValue(created);

      await service.createConversation(mockUserId, {});

      expect(mockConversationRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        title: 'New Conversation',
      });
    });
  });

  describe('getConversations', () => {
    it('사용자 대화 목록을 페이지네이션으로 조회한다', async () => {
      const items = [mockConversation];
      mockConversationRepository.findAndCount.mockResolvedValue([items, 1]);

      const result = await service.getConversations(mockUserId, {
        page: 1,
        limit: 10,
      });

      expect(mockConversationRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { updatedAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result.items).toHaveLength(1);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('page와 limit 기본값을 적용한다', async () => {
      mockConversationRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getConversations(mockUserId, {});

      expect(mockConversationRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });
  });

  describe('getConversationById', () => {
    it('대화가 없으면 NotFoundException을 던진다', async () => {
      mockConversationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getConversationById(mockUserId, mockConversationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('대화가 있으면 메시지와 함께 반환한다', async () => {
      const withMessages = {
        ...mockConversation,
        messages: [
          {
            id: 'msg-1',
            conversationId: mockConversationId,
            role: MessageRole.USER,
            content: 'hello',
            createdAt: new Date(),
          },
        ],
      };
      mockConversationRepository.findOne.mockResolvedValue(withMessages);

      const result = await service.getConversationById(
        mockUserId,
        mockConversationId,
      );

      expect(result.id).toBe(mockConversationId);
      expect(result.messages).toHaveLength(1);
      expect(result.messages![0].content).toBe('hello');
    });
  });

  describe('updateConversation', () => {
    it('권한 없는 사용자는 ForbiddenException을 던진다', async () => {
      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      const otherUserId = 'other-user';

      await expect(
        service.updateConversation(otherUserId, mockConversationId, {
          title: '새 제목',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('대화가 없으면 NotFoundException을 던진다', async () => {
      mockConversationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateConversation(mockUserId, mockConversationId, {
          title: '새 제목',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('소유자가 제목을 수정하면 저장하고 DTO를 반환한다', async () => {
      const updated = { ...mockConversation, title: '새 제목' };
      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockConversationRepository.save.mockResolvedValue(updated);

      const result = await service.updateConversation(
        mockUserId,
        mockConversationId,
        { title: '새 제목' },
      );

      expect(mockConversationRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('새 제목');
    });
  });

  describe('deleteConversation', () => {
    it('대화가 없으면 NotFoundException을 던진다', async () => {
      mockConversationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteConversation(mockUserId, mockConversationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('권한 없는 사용자는 ForbiddenException을 던진다', async () => {
      mockConversationRepository.findOne.mockResolvedValue(mockConversation);

      await expect(
        service.deleteConversation('other-user', mockConversationId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('소유자가 삭제하면 softRemove를 호출한다', async () => {
      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockConversationRepository.softRemove.mockResolvedValue(mockConversation);

      await service.deleteConversation(mockUserId, mockConversationId);

      expect(mockConversationRepository.softRemove).toHaveBeenCalledWith(
        mockConversation,
      );
    });
  });

  describe('sendMessage', () => {
    const userMessage = {
      id: 'msg-user',
      conversationId: mockConversationId,
      role: MessageRole.USER,
      content: '안녕',
      createdAt: new Date(),
    };
    const assistantMessage = {
      id: 'msg-assistant',
      conversationId: mockConversationId,
      role: MessageRole.ASSISTANT,
      content: '안녕하세요',
      createdAt: new Date(),
    };

    it('대화가 없으면 NotFoundException을 던진다', async () => {
      mockConversationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.sendMessage(mockUserId, mockConversationId, { message: 'hi' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('사용자 메시지를 저장하고 AI 응답을 생성해 반환한다', async () => {
      mockConversationRepository.findOne
        .mockResolvedValueOnce(mockConversation)
        .mockResolvedValueOnce({ ...mockConversation });
      mockMessageRepository.create.mockImplementation((entity) => entity as Message);
      mockMessageRepository.save
        .mockResolvedValueOnce(userMessage as Message)
        .mockResolvedValueOnce(assistantMessage as Message);
      mockGeminiService.generateChatResponse.mockResolvedValue('안녕하세요');
      mockConversationRepository.update.mockResolvedValue(undefined);

      const result = await service.sendMessage(mockUserId, mockConversationId, {
        message: '안녕',
      });

      expect(mockMessageRepository.save).toHaveBeenCalledTimes(2);
      expect(mockGeminiService.generateChatResponse).toHaveBeenCalledWith(
        '안녕',
        [],
      );
      expect(result.userMessage.content).toBe('안녕');
      expect(result.assistantMessage.content).toBe('안녕하세요');
    });
  });

  describe('saveMessage', () => {
    it('메시지를 저장하고 엔티티를 반환한다', async () => {
      const created = {
        conversationId: mockConversationId,
        role: MessageRole.USER,
        content: 'test',
      };
      mockMessageRepository.create.mockReturnValue(created as Message);
      mockMessageRepository.save.mockResolvedValue({
        ...created,
        id: 'msg-id',
        createdAt: new Date(),
      } as Message);

      const result = await service.saveMessage(
        mockConversationId,
        MessageRole.USER,
        'test',
      );

      expect(mockMessageRepository.create).toHaveBeenCalledWith({
        conversationId: mockConversationId,
        role: MessageRole.USER,
        content: 'test',
      });
      expect(result.content).toBe('test');
    });
  });
});
