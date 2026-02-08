---
name: nestjs-feature-scaffold
description: >
  NestJS에서 새 기능 모듈을 생성하는 워크플로. Module → Controller →
  Service → Entity → DTO → Spec 순서로 scaffolding. "새 모듈 추가",
  "API 추가", "기능 개발", "CRUD 만들어줘" 요청 시 트리거.
---

# NestJS Feature Scaffold

새 NestJS 기능 모듈을 체계적으로 생성하는 워크플로.

## 생성 순서

다음 체크리스트를 복사하여 진행 상황을 추적:

```
Task Progress:
- [ ] Step 1: Entity 생성
- [ ] Step 2: DTO 생성 (요청 + 응답)
- [ ] Step 3: Service 생성
- [ ] Step 4: Service Spec 생성
- [ ] Step 5: Controller 생성
- [ ] Step 6: Module 생성 및 AppModule에 등록
- [ ] Step 7: 마이그레이션 생성/실행
```

## Step 1: Entity 생성

파일: `backend/src/modules/{feature}/entities/{feature}.entity.ts`

필수 요소:
- `@Entity('{feature_plural}')` — 테이블명은 복수형 snake_case
- `@PrimaryGeneratedColumn('uuid')`
- `@CreateDateColumn({ name: 'created_at' })`, `@UpdateDateColumn`, `@DeleteDateColumn`
- 관계가 있으면 `@ManyToOne` / `@OneToMany` + `@JoinColumn({ name: 'fk_column' })`
- 자주 조회하는 컬럼에 `@Index`

## Step 2: DTO 생성

파일: `backend/src/modules/{feature}/dto/`

### 요청 DTO (`create-{feature}.dto.ts`)
- `class-validator` 데코레이터 (`@IsString`, `@IsEmail`, `@MinLength` 등)
- 모든 필드에 `@ApiProperty({ example, description })`
- example은 현실적인 데이터

### 응답 DTO (`{feature}-response.dto.ts`)
- `constructor(partial: Partial<T>)` 패턴
- 민감 필드 `@Exclude()`
- 모든 필드에 `@ApiProperty()`

## Step 3: Service 생성

파일: `backend/src/modules/{feature}/{feature}.service.ts`

- `@Injectable()` 데코레이터
- 생성자에서 `@InjectRepository(Entity)` 주입
- CRUD 메서드: `create`, `findAll`, `findOne`, `update`, `remove`
- NestJS 내장 예외 사용, 메시지 한국어
- 외부 API 호출은 try-catch 필수

## Step 4: Service Spec 생성

파일: `backend/src/modules/{feature}/{feature}.service.spec.ts`

- TDD: 테스트 먼저 작성 → 구현
- Repository 모킹: `{ provide: getRepositoryToken(Entity), useValue: mockRepository }`
- `afterEach(() => jest.clearAllMocks())`
- 정상/예외 케이스 모두 커버

## Step 5: Controller 생성

파일: `backend/src/modules/{feature}/{feature}.controller.ts`

- `@ApiTags('{Feature}')`, `@Controller('{feature_plural}')`
- 인증 필요 시 `@UseGuards(JwtAuthGuard)` + `@ApiBearerAuth()`
- 모든 엔드포인트에 `@ApiOperation` + `@ApiResponse` (type 지정)
- 반환 타입 `Promise<T>` 명시

## Step 6: Module 생성 및 등록

파일: `backend/src/modules/{feature}/{feature}.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService], // 다른 모듈에서 사용할 경우
})
export class FeatureModule {}
```

`AppModule`의 `imports` 배열에 추가.

## Step 7: 마이그레이션

```bash
pnpm --filter backend migration:generate
pnpm --filter backend migration:run
```

## 파일 네이밍 규칙

| 파일 종류 | 네이밍 | 예시 |
|-----------|--------|------|
| Entity | `{feature}.entity.ts` | `post.entity.ts` |
| DTO (생성) | `create-{feature}.dto.ts` | `create-post.dto.ts` |
| DTO (수정) | `update-{feature}.dto.ts` | `update-post.dto.ts` |
| DTO (응답) | `{feature}-response.dto.ts` | `post-response.dto.ts` |
| Service | `{feature}.service.ts` | `post.service.ts` |
| Controller | `{feature}.controller.ts` | `post.controller.ts` |
| Module | `{feature}.module.ts` | `post.module.ts` |
| Spec | `{feature}.service.spec.ts` | `post.service.spec.ts` |

## 상세 코드 템플릿

상세 코드 예시는 [references/module-template.md](references/module-template.md) 참조.
