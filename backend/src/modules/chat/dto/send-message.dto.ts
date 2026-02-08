import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    example: 'TypeScript에 대해 알려주세요',
    description: '사용자 메시지',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    required: false,
    description: '기존 대화 ID (없으면 새 대화 생성)',
  })
  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
