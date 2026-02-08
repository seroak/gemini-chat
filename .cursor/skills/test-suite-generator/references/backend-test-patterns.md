# Backend Test Patterns (Jest)

## Service 테스트 기본 구조

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { FeatureService } from './feature.service';
import { Feature } from './entities/feature.entity';

describe('FeatureService', () => {
  let service: FeatureService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        { provide: getRepositoryToken(Feature), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
  });

  afterEach(() => jest.clearAllMocks());

  // 테스트 케이스...
});
```

## 다른 Service 의존성 모킹

```typescript
const mockOtherService = {
  findById: jest.fn(),
  create: jest.fn(),
};

// providers 배열에 추가
{ provide: OtherService, useValue: mockOtherService },
```

## ConfigService 모킹

생성자에서 API 키 등을 참조하는 서비스용:

```typescript
const createMockConfigService = (overrides = {}) => ({
  get: jest.fn((key: string) => {
    const defaults: Record<string, string> = {
      GEMINI_API_KEY: 'test-api-key',
      GEMINI_MODEL: 'gemini-2.0-flash-exp',
      JWT_SECRET: 'test-jwt-secret',
      ...overrides,
    };
    return defaults[key];
  }),
});

// TestingModule 대신 직접 인스턴스 생성 (생성자에서 설정 참조 시)
const configService = createMockConfigService();
const service = new GeminiService(configService as any);
```

## CRUD 테스트 케이스 템플릿

### Create

```typescript
describe('create', () => {
  it('유효한 데이터로 엔티티를 생성한다', async () => {
    const inputDto = { name: '테스트' };
    const mockEntity = { id: 'uuid', ...inputDto };
    mockRepository.create.mockReturnValue(mockEntity);
    mockRepository.save.mockResolvedValue(mockEntity);

    const result = await service.create(inputDto);

    expect(result.id).toBe('uuid');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('중복 데이터면 ConflictException을 던진다', async () => {
    mockRepository.findOne.mockResolvedValue({ id: 'existing' });

    await expect(service.create(inputDto)).rejects.toThrow(ConflictException);
  });
});
```

### FindOne

```typescript
describe('findOne', () => {
  it('ID로 엔티티를 조회한다', async () => {
    const mockEntity = { id: 'uuid', name: '테스트' };
    mockRepository.findOne.mockResolvedValue(mockEntity);

    const result = await service.findOne('uuid');

    expect(result.id).toBe('uuid');
  });

  it('존재하지 않으면 NotFoundException을 던진다', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });
});
```

### Remove

```typescript
describe('remove', () => {
  it('엔티티를 소프트 삭제한다', async () => {
    mockRepository.softDelete.mockResolvedValue({ affected: 1 });

    await service.remove('uuid');

    expect(mockRepository.softDelete).toHaveBeenCalledWith('uuid');
  });

  it('존재하지 않으면 NotFoundException을 던진다', async () => {
    mockRepository.softDelete.mockResolvedValue({ affected: 0 });

    await expect(service.remove('invalid')).rejects.toThrow(NotFoundException);
  });
});
```

## JwtService 모킹

```typescript
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@test.com' }),
};
```
