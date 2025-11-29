import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationPreferencesSchema1761757200000 implements MigrationInterface {
  name = 'NotificationPreferencesSchema1761757200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension exists for default UUID generation
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create notification_preferences table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notification_preferences" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL UNIQUE,
        "push_enabled" boolean NOT NULL DEFAULT true,
        "email_enabled" boolean NOT NULL DEFAULT true,
        "sms_enabled" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    // Add foreign key to users
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          WHERE tc.constraint_name = 'fk_notification_preferences_user'
            AND tc.table_name = 'notification_preferences'
        ) THEN
          ALTER TABLE "notification_preferences"
            ADD CONSTRAINT "fk_notification_preferences_user"
            FOREIGN KEY ("user_id") REFERENCES "users" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
  }
}