import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1707300000000 implements MigrationInterface {
  name = 'InitialSchema1707300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // uuid-ossp 확장 활성화
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // users 테이블
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "name" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // conversations 테이블
    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" character varying NOT NULL DEFAULT 'New Conversation',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_conversations" PRIMARY KEY ("id")
      )
    `);

    // messages 테이블
    await queryRunner.query(`
      CREATE TYPE "public"."messages_role_enum" AS ENUM('user', 'assistant', 'system')
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "role" "public"."messages_role_enum" NOT NULL,
        "content" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id")
      )
    `);

    // 인덱스
    await queryRunner.query(`
      CREATE INDEX "IDX_messages_conversation_created" ON "messages" ("conversation_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_conversations_user_id" ON "conversations" ("user_id")
    `);

    // FK: conversations → users
    await queryRunner.query(`
      ALTER TABLE "conversations"
      ADD CONSTRAINT "FK_conversations_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // FK: messages → conversations
    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_conversation_id"
      FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_conversation_id"`);
    await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_conversations_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_conversations_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_messages_conversation_created"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TYPE "public"."messages_role_enum"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
