import { MigrationInterface, QueryRunner } from 'typeorm';

export class StripeConnectPayouts1761663100000 implements MigrationInterface {
  name = 'StripeConnectPayouts1761663100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // provider_profiles: stripe_account_id, stripe_payouts_enabled
    await queryRunner.query(
      `ALTER TABLE "provider_profiles" ADD COLUMN IF NOT EXISTS "stripe_account_id" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_profiles" ADD COLUMN IF NOT EXISTS "stripe_payouts_enabled" boolean NOT NULL DEFAULT false`,
    );

    // bank_accounts: stripe_external_account_id + index
    await queryRunner.query(
      `ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "stripe_external_account_id" character varying(255)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_bank_accounts_stripe_external_account_id" ON "bank_accounts" ("stripe_external_account_id")`,
    );

    // payouts: currency, stripe_payout_id
    await queryRunner.query(
      `ALTER TABLE "payouts" ADD COLUMN IF NOT EXISTS "currency" character varying(10) NOT NULL DEFAULT 'eur'`,
    );
    await queryRunner.query(
      `ALTER TABLE "payouts" ADD COLUMN IF NOT EXISTS "stripe_payout_id" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payouts" DROP COLUMN IF EXISTS "stripe_payout_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payouts" DROP COLUMN IF EXISTS "currency"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_bank_accounts_stripe_external_account_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_accounts" DROP COLUMN IF EXISTS "stripe_external_account_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_profiles" DROP COLUMN IF EXISTS "stripe_payouts_enabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_profiles" DROP COLUMN IF EXISTS "stripe_account_id"`,
    );
  }
}