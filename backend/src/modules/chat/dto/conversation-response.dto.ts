import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Conversation } from '../entities/conversation.entity';
import { MessageResponseDto } from './message-response.dto';

export class ConversationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [MessageResponseDto], description: '메시지 목록 (상세 조회 시 포함)' })
  messages?: MessageResponseDto[];

  constructor(conversation: Conversation) {
    this.id = conversation.id;
    this.userId = conversation.userId;
    this.title = conversation.title;
    this.createdAt = conversation.createdAt;
    this.updatedAt = conversation.updatedAt;
    if (conversation.messages) {
      const sorted = [...conversation.messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      this.messages = sorted.map((m) => new MessageResponseDto(m));
    }
  }
}
