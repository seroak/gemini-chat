import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { SendMessageBodyDto } from './dto/send-message-body.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { PaginatedConversationsDto } from './dto/paginated-conversations.dto';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Chat')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: '새 대화 생성' })
  @ApiResponse({
    status: 201,
    description: '대화 생성 성공',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  async createConversation(
    @Request() req: { user: User },
    @Body() dto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    return this.chatService.createConversation(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '대화 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '대화 목록 (페이지네이션)',
    type: PaginatedConversationsDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  async getConversations(
    @Request() req: { user: User },
    @Query() query: GetConversationsQueryDto,
  ): Promise<PaginatedConversationsDto> {
    return this.chatService.getConversations(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '대화 상세 조회 (메시지 포함)' })
  @ApiParam({ name: 'id', description: '대화 ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: '대화 상세',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 404, description: '대화를 찾을 수 없음' })
  async getConversationById(
    @Request() req: { user: User },
    @Param('id') id: string,
  ): Promise<ConversationResponseDto> {
    return this.chatService.getConversationById(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '대화 제목 수정' })
  @ApiParam({ name: 'id', description: '대화 ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: '수정된 대화',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '대화를 찾을 수 없음' })
  async updateConversation(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
  ): Promise<ConversationResponseDto> {
    return this.chatService.updateConversation(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '대화 삭제 (Soft Delete)' })
  @ApiParam({ name: 'id', description: '대화 ID (UUID)' })
  @ApiResponse({ status: 200, description: '삭제 완료' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '대화를 찾을 수 없음' })
  async deleteConversation(
    @Request() req: { user: User },
    @Param('id') id: string,
  ): Promise<void> {
    return this.chatService.deleteConversation(req.user.id, id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: '메시지 전송 (비스트리밍)' })
  @ApiParam({ name: 'id', description: '대화 ID (UUID)' })
  @ApiResponse({
    status: 201,
    description: '사용자 메시지 + AI 응답',
    type: ChatResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 404, description: '대화를 찾을 수 없음' })
  async sendMessage(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() dto: SendMessageBodyDto,
  ): Promise<ChatResponseDto> {
    return this.chatService.sendMessage(req.user.id, id, { message: dto.message });
  }
}
