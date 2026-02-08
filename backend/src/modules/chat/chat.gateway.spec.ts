import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { GeminiService } from '../gemini/gemini.service';
import { UsersService } from '../users/users.service';
import { MessageRole } from './entities/message.entity';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let geminiService: GeminiService;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockConversation = {
    id: 'conv-uuid',
    userId: mockUser.id,
    title: 'Test',
    messages: [],
  };

  const mockChatService = {
    getConversationWithMessagesForStreaming: jest.fn(),
    saveMessage: jest.fn(),
    updateTitleFromFirstMessage: jest.fn(),
  };

  const mockGeminiService = {
    startChat: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => (key === 'JWT_SECRET' ? 'test-secret' : undefined)),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockSocket = {
    id: 'socket-1',
    data: {} as { user?: typeof mockUser },
    handshake: {
      auth: { token: 'valid.jwt.token' },
      headers: {},
    },
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: mockChatService },
        { provide: GeminiService, useValue: mockGeminiService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    geminiService = module.get<GeminiService>(GeminiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('클라이언트 연결 시 로그를 출력한다', () => {
      expect(() =>
        gateway.handleConnection(mockSocket as any),
      ).not.toThrow();
    });
  });

  describe('handleDisconnect', () => {
    it('클라이언트 해제 시 로그를 출력한다', () => {
      expect(() =>
        gateway.handleDisconnect(mockSocket as any),
      ).not.toThrow();
    });
  });

  describe('handleSendMessage', () => {
    it('인증된 사용자 없으면 streamError를 emit한다', async () => {
      const client = { ...mockSocket, data: {} };
      await gateway.handleSendMessage(client as any, {
        conversationId: 'conv-1',
        message: 'hello',
      });
      expect(client.emit).toHaveBeenCalledWith(
        'streamError',
        expect.objectContaining({ message: '인증되지 않은 사용자입니다' }),
      );
    });

    it('conversationId나 message가 없으면 streamError를 emit한다', async () => {
      const client = { ...mockSocket, data: { user: mockUser } };
      await gateway.handleSendMessage(client as any, {
        conversationId: '',
        message: 'hi',
      });
      expect(client.emit).toHaveBeenCalledWith(
        'streamError',
        expect.objectContaining({
          message: 'conversationId와 message가 필요합니다',
        }),
      );
    });

    it('대화를 찾을 수 없으면 streamError를 emit한다', async () => {
      mockChatService.getConversationWithMessagesForStreaming.mockRejectedValue(
        new Error('대화를 찾을 수 없습니다'),
      );
      const client = { ...mockSocket, data: { user: mockUser } };
      await gateway.handleSendMessage(client as any, {
        conversationId: 'conv-1',
        message: 'hello',
      });
      expect(client.emit).toHaveBeenCalledWith(
        'streamError',
        expect.objectContaining({ message: '대화를 찾을 수 없습니다' }),
      );
    });

    it('정상 시 메시지 저장 후 스트리밍 청크와 streamEnd를 emit한다', async () => {
      mockChatService.getConversationWithMessagesForStreaming.mockResolvedValue({
        conversation: mockConversation,
        history: [],
      });
      const userMsg = {
        id: 'msg-1',
        content: 'hello',
        createdAt: new Date(),
      };
      const assistantMsg = {
        id: 'msg-2',
        content: 'Hi there!',
        createdAt: new Date(),
      };
      mockChatService.saveMessage
        .mockResolvedValueOnce(userMsg)
        .mockResolvedValueOnce(assistantMsg);

      async function* streamChunks() {
        yield 'Hi ';
        yield 'there!';
      }
      mockGeminiService.startChat.mockReturnValue(streamChunks());

      const client = { ...mockSocket, data: { user: mockUser } };
      await gateway.handleSendMessage(client as any, {
        conversationId: 'conv-1',
        message: 'hello',
      });

      expect(mockChatService.saveMessage).toHaveBeenCalledWith(
        'conv-1',
        MessageRole.USER,
        'hello',
      );
      expect(client.emit).toHaveBeenCalledWith('streamChunk', {
        chunk: 'Hi ',
      });
      expect(client.emit).toHaveBeenCalledWith('streamChunk', {
        chunk: 'there!',
      });
      expect(client.emit).toHaveBeenCalledWith(
        'streamEnd',
        expect.objectContaining({
          message: expect.objectContaining({ content: 'Hi there!' }),
        }),
      );
    });
  });
});
