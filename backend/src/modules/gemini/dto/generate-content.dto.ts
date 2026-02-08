import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export class GenerateContentDto {
  @ApiProperty({
    example: 'TypeScript에 대해 설명해주세요',
    description: '사용자 프롬프트',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({
    required: false,
    description: '대화 히스토리 (멀티턴 대화용)',
  })
  @IsOptional()
  @IsArray()
  history?: ChatMessage[];
}
