import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthRefreshTokensFixNames1761582900000 implements MigrationInterface {
  name = 'AuthRefreshTokensFixNames1761582900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure table exists
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "refresh_tokens" ("id" uuid PRIMARY KEY DEFAULT uuid_generate_v4())`);

    // Rename camelCase columns to snake_case if present
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'userId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE "refresh_tokens" RENAME COLUMN "userId" TO "user_id";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'expiresAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'expires_at'
        ) THEN
          ALTER TABLE "refresh_tokens" RENAME COLUMN "expiresAt" TO "expires_at";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'revokedAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'revoked_at'
        ) THEN
          ALTER TABLE "refresh_tokens" RENAME COLUMN "revokedAt" TO "revoked_at";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'createdAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'created_at'
        ) THEN
          ALTER TABLE "refresh_tokens" RENAME COLUMN "createdAt" TO "created_at";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'updatedAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE "refresh_tokens" RENAME COLUMN "updatedAt" TO "updated_at";
        END IF;
      END
      $$;
    `);

    // Ensure required columns exist
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "user_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "token" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP WITH TIME ZONE NULL`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "revoked_at" TIMESTAMP WITH TIME ZONE NULL`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    // Ensure indexes
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_refresh_token_token" ON "refresh_tokens" ("token")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_refresh_token_user" ON "refresh_tokens" ("user_id")`);

    // Ensure FK
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          WHERE tc.constraint_name = 'fk_refresh_tokens_user'
            AND tc.table_name = 'refresh_tokens'
        ) THEN
          ALTER TABLE "refresh_tokens"
            ADD CONSTRAINT "fk_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op safe down; we will not attempt to revert column renames automatically
  }
}