import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppointmentsPortfolioImageLink1761579600000 implements MigrationInterface {
  name = 'AppointmentsPortfolioImageLink1761579600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column if not exists
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "portfolio_image_id" uuid`,
    );

    // Create index if not exists
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_appointments_portfolio_image_id" ON "appointments" ("portfolio_image_id")`,
    );

    // Add FK if not exists (Postgres lacks IF NOT EXISTS for FK; guard with DO $$)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints tc
          WHERE tc.constraint_name = 'fk_appointments_portfolio_image'
            AND tc.table_name = 'appointments'
        ) THEN
          ALTER TABLE "appointments"
            ADD CONSTRAINT "fk_appointments_portfolio_image"
            FOREIGN KEY ("portfolio_image_id") REFERENCES "portfolio_images" ("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          WHERE tc.constraint_name = 'fk_appointments_portfolio_image'
            AND tc.table_name = 'appointments'
        ) THEN
          ALTER TABLE "appointments" DROP CONSTRAINT "fk_appointments_portfolio_image";
        END IF;
      END;
      $$;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_appointments_portfolio_image_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN IF EXISTS "portfolio_image_id"`,
    );
  }
}