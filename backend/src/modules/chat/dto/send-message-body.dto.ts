import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * POST /conversations/:id/messages 요청 바디 (대화 ID는 URL 경로에서 전달)
 */
export class SendMessageBodyDto {
  @ApiProperty({
    example: 'TypeScript에 대해 알려주세요',
    description: '사용자 메시지',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
