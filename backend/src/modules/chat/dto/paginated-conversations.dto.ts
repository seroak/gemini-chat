import { ApiProperty } from '@nestjs/swagger';
import { ConversationResponseDto } from './conversation-response.dto';

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: '현재 페이지' })
  currentPage: number;

  @ApiProperty({ example: 10, description: '페이지당 항목 수' })
  itemsPerPage: number;

  @ApiProperty({ example: 50, description: '전체 항목 수' })
  totalItems: number;

  @ApiProperty({ example: true, description: '다음 페이지 존재 여부' })
  hasNextPage: boolean;

  constructor(currentPage: number, itemsPerPage: number, totalItems: number) {
    this.currentPage = currentPage;
    this.itemsPerPage = itemsPerPage;
    this.totalItems = totalItems;
    this.hasNextPage = currentPage * itemsPerPage < totalItems;
  }
}

export class PaginatedConversationsDto {
  @ApiProperty({ type: [ConversationResponseDto], description: '대화 목록' })
  items: ConversationResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: '페이지네이션 메타 정보' })
  meta: PaginationMetaDto;

  constructor(items: ConversationResponseDto[], meta: PaginationMetaDto) {
    this.items = items;
    this.meta = meta;
  }
}
