import { ApiProperty } from '@nestjs/swagger';
import { Message, MessageRole } from '../entities/message.entity';

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  conversationId: string;

  @ApiProperty({ enum: MessageRole })
  role: MessageRole;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;

  constructor(message: Message) {
    this.id = message.id;
    this.conversationId = message.conversationId;
    this.role = message.role;
    this.content = message.content;
    this.createdAt = message.createdAt;
  }
}
