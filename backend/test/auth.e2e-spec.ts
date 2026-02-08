import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const testUser = {
    email: `e2e-auth-${Date.now()}@example.com`,
    password: 'password123',
    name: 'E2E 테스트 사용자',
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('회원가입에 성공한다', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user.name).toBe(testUser.name);
          expect(res.body.user.password).toBeUndefined();
          expect(res.body.accessToken).toBeDefined();
        });
    });

    it('중복 이메일로 회원가입하면 409 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('잘못된 이메일 형식이면 400 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'invalid', password: 'password123', name: '테스트' })
        .expect(400);
    });

    it('비밀번호가 8자 미만이면 400 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'short@example.com', password: '1234', name: '테스트' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('올바른 자격증명으로 로그인에 성공한다', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .expect((res) => {
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.accessToken).toBeDefined();
          accessToken = res.body.accessToken;
        });
    });

    it('잘못된 비밀번호로 로그인하면 401 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'wrong-password' })
        .expect(401);
    });

    it('존재하지 않는 이메일로 로그인하면 401 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('인증된 사용자 정보를 조회한다', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.name).toBe(testUser.name);
          expect(res.body.password).toBeUndefined();
        });
    });

    it('토큰 없이 접근하면 401 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('잘못된 토큰으로 접근하면 401 에러를 반환한다', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
