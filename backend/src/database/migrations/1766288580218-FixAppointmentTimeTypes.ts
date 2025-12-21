import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAppointmentTimeTypes1766288580218 implements MigrationInterface {
    name = 'FixAppointmentTimeTypes1766288580218'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_categories" DROP CONSTRAINT "service_categories_slug_key"`);
        await queryRunner.query(`ALTER TABLE "service_categories" DROP COLUMN "icon_url"`);
        await queryRunner.query(`ALTER TABLE "service_categories" ADD "icon_url" character varying(1024)`);
        await queryRunner.query(`ALTER TABLE "service_categories" ALTER COLUMN "display_order" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_categories" ALTER COLUMN "is_active" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "price_type" DROP DEFAULT`);
        // Helper to convert existing TIME columns to TIMESTAMPTZ by combining with appointment_date
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "start_time" TYPE TIMESTAMP WITH TIME ZONE USING (appointment_date + start_time)::timestamptz`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "end_time" TYPE TIMESTAMP WITH TIME ZONE USING (appointment_date + end_time)::timestamptz`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "end_time"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "end_time" TIME NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "start_time"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "start_time" TIME NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "price_type" SET DEFAULT 'FIXED'`);
        await queryRunner.query(`ALTER TABLE "service_categories" ALTER COLUMN "is_active" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_categories" ALTER COLUMN "display_order" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_categories" DROP COLUMN "icon_url"`);
        await queryRunner.query(`ALTER TABLE "service_categories" ADD "icon_url" text`);
        await queryRunner.query(`ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_slug_key" UNIQUE ("slug")`);
    }

}
