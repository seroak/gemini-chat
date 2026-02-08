import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConversationDto {
  @ApiProperty({
    example: 'TypeScript 학습',
    description: '대화 제목',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}
