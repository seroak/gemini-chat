import { ApiProperty } from '@nestjs/swagger';
import { ConversationResponseDto } from './conversation-response.dto';
import { MessageResponseDto } from './message-response.dto';

export class ChatResponseDto {
  @ApiProperty()
  conversation: ConversationResponseDto;

  @ApiProperty()
  userMessage: MessageResponseDto;

  @ApiProperty()
  assistantMessage: MessageResponseDto;

  constructor(
    conversation: ConversationResponseDto,
    userMessage: MessageResponseDto,
    assistantMessage: MessageResponseDto,
  ) {
    this.conversation = conversation;
    this.userMessage = userMessage;
    this.assistantMessage = assistantMessage;
  }
}
