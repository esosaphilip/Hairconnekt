import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthVerificationCodes1761593200000 implements MigrationInterface {
  name = 'AuthVerificationCodes1761593200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "verification_codes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "channel" varchar(10) NOT NULL,
        "destination" varchar(255) NOT NULL,
        "code_hash" varchar(64) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "consumed_at" TIMESTAMP WITH TIME ZONE NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_verification_codes_user" ON "verification_codes" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_verification_codes_channel" ON "verification_codes" ("channel")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_verification_codes_user_channel" ON "verification_codes" ("userId", "channel")`,
    );

    // Foreign key to users
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          WHERE tc.constraint_name = 'fk_verification_codes_user'
            AND tc.table_name = 'verification_codes'
        ) THEN
          ALTER TABLE "verification_codes"
            ADD CONSTRAINT "fk_verification_codes_user"
            FOREIGN KEY ("userId") REFERENCES "users" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "verification_codes"`);
  }
}