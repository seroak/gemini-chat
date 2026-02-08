import { ApiProperty } from '@nestjs/swagger';

export class GenerateResponseDto {
  @ApiProperty({
    description: '생성된 텍스트',
  })
  text: string;

  constructor(text: string) {
    this.text = text;
  }
}
