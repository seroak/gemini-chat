import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { ChatService } from './chat.service';
import { GeminiService } from '../gemini/gemini.service';
import { MessageRole } from './entities/message.entity';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: { id: string; email: string; name: string };
  };
}

const EVENT_SEND_MESSAGE = 'sendMessage';
const EVENT_STREAM_CHUNK = 'streamChunk';
const EVENT_STREAM_END = 'streamEnd';
const EVENT_STREAM_ERROR = 'streamError';

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173' },
  namespace: '/',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
    private readonly geminiService: GeminiService,
  ) {}

  afterInit(server: Server): void {
    server.use(async (socket: Socket, next) => {
      const authSocket = socket as AuthenticatedSocket;
      try {
        const token =
          authSocket.handshake.auth?.token ??
          (authSocket.handshake.headers?.authorization as string)?.replace?.(
            'Bearer ',
            '',
          );
        if (!token) {
          return next(new Error('인증 토큰이 없습니다'));
        }
        const payload = this.jwtService.verify<{ sub: string; email: string }>(
          token,
          { secret: this.configService.get<string>('JWT_SECRET') },
        );
        const user = await this.usersService.findById(payload.sub);
        authSocket.data.user = {
          id: user.id,
          email: user.email,
          name: user.name,
        };
        next();
      } catch (err) {
        next(new Error('인증에 실패했습니다'));
      }
    });
  }

  handleConnection(client: AuthenticatedSocket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(EVENT_SEND_MESSAGE)
  async handleSendMessage(
    client: AuthenticatedSocket,
    payload: { conversationId: string; message: string },
  ): Promise<void> {
    const user = client.data.user;
    if (!user) {
      client.emit(EVENT_STREAM_ERROR, { message: '인증되지 않은 사용자입니다' });
      return;
    }
    if (!payload?.conversationId || !payload?.message?.trim()) {
      client.emit(EVENT_STREAM_ERROR, {
        message: 'conversationId와 message가 필요합니다',
      });
      return;
    }

    const { conversationId, message } = payload;
    let conversation;
    let history;

    try {
      const result = await this.chatService.getConversationWithMessagesForStreaming(
        user.id,
        conversationId,
      );
      conversation = result.conversation;
      history = result.history;
    } catch (err) {
      client.emit(EVENT_STREAM_ERROR, {
        message: err instanceof Error ? err.message : '대화를 찾을 수 없습니다',
      });
      return;
    }

    try {
      const userMessage = await this.chatService.saveMessage(
        conversationId,
        MessageRole.USER,
        message,
      );

      client.emit('messageSaved', {
        role: 'user',
        message: { id: userMessage.id, content: userMessage.content, createdAt: userMessage.createdAt },
      });

      let fullContent = '';
      const stream = this.geminiService.startChat(message, history);
      for await (const chunk of stream) {
        fullContent += chunk;
        client.emit(EVENT_STREAM_CHUNK, { chunk });
      }

      const assistantMessage = await this.chatService.saveMessage(
        conversationId,
        MessageRole.ASSISTANT,
        fullContent,
      );

      const isFirstMessage = conversation.messages.length === 0;
      if (isFirstMessage) {
        await this.chatService.updateTitleFromFirstMessage(
          conversationId,
          user.id,
          message,
        );
      }

      client.emit(EVENT_STREAM_END, {
        message: {
          id: assistantMessage.id,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt,
        },
      });
    } catch (err) {
      this.logger.error('Stream error', err);
      client.emit(EVENT_STREAM_ERROR, {
        message:
          err instanceof Error ? err.message : 'AI 응답 생성 중 오류가 발생했습니다',
      });
    }
  }
}
