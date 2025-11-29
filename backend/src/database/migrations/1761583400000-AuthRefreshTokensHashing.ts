import { MigrationInterface, QueryRunner } from 'typeorm';
import crypto from 'crypto';

export class AuthRefreshTokensHashing1761583400000 implements MigrationInterface {
  name = 'AuthRefreshTokensHashing1761583400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Add token_hash column if not exists (nullable for backfill)
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "token_hash" text`);

    // 2) Backfill token_hash for existing rows using Node crypto (sha256 hex)
    type Row = { id: string; token: string | null; token_hash: string | null };
    const rows: Row[] = await queryRunner.query(`SELECT id, token, token_hash FROM "refresh_tokens"`);
    for (const row of rows) {
      if (!row.token_hash) {
        if (row.token) {
          const hash = crypto.createHash('sha256').update(row.token, 'utf8').digest('hex');
          await queryRunner.query(`UPDATE "refresh_tokens" SET token_hash = $1 WHERE id = $2`, [hash, row.id]);
        } else {
          // No token available; generate a placeholder to satisfy NOT NULL later (won't match any real token)
          const placeholder = crypto.randomBytes(32).toString('hex');
          await queryRunner.query(`UPDATE "refresh_tokens" SET token_hash = $1 WHERE id = $2`, [placeholder, row.id]);
        }
      }
    }

    // 3) Create unique index on token_hash
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_refresh_token_hash" ON "refresh_tokens" ("token_hash")`);

    // 4) Make legacy token column nullable (so we can stop storing raw tokens)
    // Some Postgres versions need explicit drop not null guarded by exception block; use a safe attempt.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'refresh_tokens' AND column_name = 'token'
        ) THEN
          BEGIN
            ALTER TABLE "refresh_tokens" ALTER COLUMN "token" DROP NOT NULL;
          EXCEPTION WHEN others THEN
            -- ignore if already nullable
            NULL;
          END;
        END IF;
      END
      $$;
    `);

    // 5) Enforce NOT NULL on token_hash after backfill
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "token_hash" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Keep schema safer; do not drop token_hash or unique index in down
  }
}