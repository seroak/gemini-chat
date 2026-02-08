import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const TEST_USERS = [
  {
    email: 'test@example.com',
    password: 'password123',
    name: '테스트 사용자',
  },
  {
    email: 'admin@example.com',
    password: 'admin1234',
    name: '관리자',
  },
];

async function runSeeds(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ai_chatbot',
    synchronize: false,
    logging: true,
  });

  await dataSource.initialize();
  console.log('데이터베이스 연결 성공');

  const queryRunner = dataSource.createQueryRunner();

  try {
    for (const user of TEST_USERS) {
      const existing = await queryRunner.query(
        `SELECT id FROM "users" WHERE email = $1`,
        [user.email],
      );

      if (existing.length > 0) {
        console.log(`이미 존재: ${user.email} — 건너뜀`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

      await queryRunner.query(
        `INSERT INTO "users" (email, password, name) VALUES ($1, $2, $3)`,
        [user.email, hashedPassword, user.name],
      );
      console.log(`생성 완료: ${user.email}`);
    }

    console.log('시드 데이터 실행 완료');
  } catch (error) {
    console.error('시드 데이터 실행 실패:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
