import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    required: false,
    example: '첫 번째 대화',
    description: '대화 제목',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
