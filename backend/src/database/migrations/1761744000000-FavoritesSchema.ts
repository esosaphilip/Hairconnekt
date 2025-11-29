import { MigrationInterface, QueryRunner } from 'typeorm';

export class FavoritesSchema1761744000000 implements MigrationInterface {
  name = 'FavoritesSchema1761744000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension exists for default UUID generation
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create client_favorites table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "client_favorites" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "clientId" uuid NOT NULL,
        "providerId" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    // Unique constraint to prevent duplicates per (client, provider)
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "uq_client_provider_favorite" ON "client_favorites" ("clientId", "providerId")`,
    );

    // Helpful indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_client_favorites_client" ON "client_favorites" ("clientId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_client_favorites_provider" ON "client_favorites" ("providerId")`,
    );

    // Foreign keys
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          WHERE tc.constraint_name = 'fk_client_favorites_client'
            AND tc.table_name = 'client_favorites'
        ) THEN
          ALTER TABLE "client_favorites"
            ADD CONSTRAINT "fk_client_favorites_client"
            FOREIGN KEY ("clientId") REFERENCES "users" ("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
      END;
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          WHERE tc.constraint_name = 'fk_client_favorites_provider'
            AND tc.table_name = 'client_favorites'
        ) THEN
          ALTER TABLE "client_favorites"
            ADD CONSTRAINT "fk_client_favorites_provider"
            FOREIGN KEY ("providerId") REFERENCES "provider_profiles" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "client_favorites"`);
  }
}