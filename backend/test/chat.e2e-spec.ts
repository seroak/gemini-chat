import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Chat (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let conversationId: string;

  const testUser = {
    email: `e2e-chat-${Date.now()}@example.com`,
    password: 'password123',
    name: 'Chat E2E 사용자',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // 테스트용 사용자 생성 + 로그인
    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser);
    accessToken = registerRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/conversations', () => {
    it('새 대화를 생성한다', () => {
      return request(app.getHttpServer())
        .post('/api/v1/conversations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'E2E 테스트 대화' })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.title).toBe('E2E 테스트 대화');
          conversationId = res.body.id;
        });
    });

    it('인증 없이 접근하면 401 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .post('/api/v1/conversations')
        .send({ title: '테스트' })
        .expect(401);
    });
  });

  describe('GET /api/v1/conversations', () => {
    it('대화 목록을 조회한다', () => {
      return request(app.getHttpServer())
        .get('/api/v1/conversations')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.meta).toBeDefined();
          expect(res.body.meta.totalItems).toBeGreaterThanOrEqual(1);
        });
    });

    it('페이지네이션 파라미터를 지원한다', () => {
      return request(app.getHttpServer())
        .get('/api/v1/conversations?page=1&limit=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.currentPage).toBe(1);
          expect(res.body.meta.itemsPerPage).toBe(5);
        });
    });
  });

  describe('GET /api/v1/conversations/:id', () => {
    it('대화 상세를 조회한다', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(conversationId);
          expect(res.body.title).toBe('E2E 테스트 대화');
          expect(res.body.messages).toBeDefined();
        });
    });

    it('존재하지 않는 대화를 조회하면 404 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .get('/api/v1/conversations/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/conversations/:id', () => {
    it('대화 제목을 수정한다', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: '수정된 제목' })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('수정된 제목');
        });
    });
  });

  describe('DELETE /api/v1/conversations/:id', () => {
    it('대화를 삭제한다 (Soft Delete)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('삭제된 대화를 조회하면 404 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('다른 사용자의 대화 접근', () => {
    let otherToken: string;
    let privateConvId: string;

    beforeAll(async () => {
      // 다른 사용자 생성
      const otherRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `e2e-other-${Date.now()}@example.com`,
          password: 'password123',
          name: '다른 사용자',
        });
      otherToken = otherRes.body.accessToken;

      // 원래 사용자로 대화 생성
      const convRes = await request(app.getHttpServer())
        .post('/api/v1/conversations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: '비공개 대화' });
      privateConvId = convRes.body.id;
    });

    it('다른 사용자의 대화를 수정하면 403 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/conversations/${privateConvId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: '해킹 시도' })
        .expect(403);
    });

    it('다른 사용자의 대화를 삭제하면 403 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/conversations/${privateConvId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });
});
