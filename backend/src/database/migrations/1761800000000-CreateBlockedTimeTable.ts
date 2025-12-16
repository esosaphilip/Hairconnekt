import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlockedTimeTable1761800000000 implements MigrationInterface {
    name = 'CreateBlockedTimeTable1761800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "blocked_times" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "reason" character varying(255) NOT NULL,
                "customReason" character varying(255),
                "startDate" date NOT NULL,
                "endDate" date,
                "startTime" time,
                "endTime" time,
                "allDay" boolean NOT NULL DEFAULT true,
                "repeat" boolean NOT NULL DEFAULT false,
                "repeatFrequency" character varying(255),
                "repeatDays" text,
                "repeatEndType" character varying(255),
                "repeatEndDate" date,
                "repeatCount" integer,
                "notes" text,
                "providerId" uuid,
                CONSTRAINT "PK_blocked_times_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "blocked_times" 
            ADD CONSTRAINT "FK_blocked_times_provider" 
            FOREIGN KEY ("providerId") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blocked_times" DROP CONSTRAINT "FK_blocked_times_provider"`);
        await queryRunner.query(`DROP TABLE "blocked_times"`);
    }
}
