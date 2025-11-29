import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthRefreshTokens1761582870000 implements MigrationInterface {
  name = 'AuthRefreshTokens1761582870000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension for default UUID generation, safe if already exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "token" text NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NULL,
        "revoked_at" TIMESTAMP WITH TIME ZONE NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    // Unique index on token
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "uq_refresh_token_token" ON "refresh_tokens" ("token")`,
    );

    // Index on user_id
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_refresh_token_user" ON "refresh_tokens" ("user_id")`,
    );

    // Add FK if not exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints tc
          WHERE tc.constraint_name = 'fk_refresh_tokens_user'
            AND tc.table_name = 'refresh_tokens'
        ) THEN
          ALTER TABLE "refresh_tokens"
            ADD CONSTRAINT "fk_refresh_tokens_user"
            FOREIGN KEY ("user_id") REFERENCES "users" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
  }
}