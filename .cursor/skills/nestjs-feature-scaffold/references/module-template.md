# NestJS Module Template

## Entity 예시

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
```

## 요청 DTO 예시

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'TypeScript 기초', description: '게시글 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'TypeScript는 JavaScript의 슈퍼셋입니다...', description: '게시글 내용' })
  @IsString()
  @MinLength(10)
  content: string;
}
```

## 응답 DTO 예시

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class PostResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'TypeScript 기초' })
  title: string;

  @ApiProperty({ example: 'TypeScript는 JavaScript의 슈퍼셋입니다...' })
  content: string;

  @ApiProperty({ example: '2024-02-06T10:30:00Z' })
  createdAt: Date;

  @Exclude()
  deletedAt: Date;

  constructor(partial: Partial<PostResponseDto>) {
    Object.assign(this, partial);
  }
}
```

## Service 예시

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(userId: string, dto: CreatePostDto): Promise<PostResponseDto> {
    const post = this.postRepository.create({ ...dto, userId });
    const saved = await this.postRepository.save(post);
    return new PostResponseDto(saved);
  }

  async findAll(userId: string): Promise<PostResponseDto[]> {
    const posts = await this.postRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return posts.map((p) => new PostResponseDto(p));
  }

  async findOne(id: string): Promise<PostResponseDto> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다');
    return new PostResponseDto(post);
  }

  async remove(id: string): Promise<void> {
    const result = await this.postRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('게시글을 찾을 수 없습니다');
    }
  }
}
```

## Controller 예시

```typescript
import {
  Controller, Get, Post, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../../common/types';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';

@ApiTags('Posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({ summary: '게시글 생성' })
  @ApiResponse({ status: 201, type: PostResponseDto })
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    return this.postService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiResponse({ status: 200, type: [PostResponseDto] })
  async findAll(@Req() req: RequestWithUser): Promise<PostResponseDto[]> {
    return this.postService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 상세 조회' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  async findOne(@Param('id') id: string): Promise<PostResponseDto> {
    return this.postService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.postService.remove(id);
  }
}
```

## Module 예시

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
```

## Service Spec 예시

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';

describe('PostService', () => {
  let service: PostService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: getRepositoryToken(Post), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('게시글을 생성하고 응답 DTO를 반환한다', async () => {
      // Arrange
      const userId = 'user-uuid';
      const dto = { title: '테스트', content: '내용입니다' };
      const mockPost = { id: 'post-uuid', ...dto, userId, createdAt: new Date() };
      mockRepository.create.mockReturnValue(mockPost);
      mockRepository.save.mockResolvedValue(mockPost);

      // Act
      const result = await service.create(userId, dto);

      // Assert
      expect(result.id).toBe('post-uuid');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('존재하지 않는 게시글 조회 시 NotFoundException을 던진다', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
```
