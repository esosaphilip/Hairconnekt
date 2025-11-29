import { MigrationInterface, QueryRunner } from 'typeorm';

export class PortfolioSchema1761579130000 implements MigrationInterface {
  name = 'PortfolioSchema1761579130000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension for default UUID generation, safe if already exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Rename created_at -> uploaded_at if present
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'portfolio_images' AND column_name = 'created_at'
        ) THEN
          ALTER TABLE "portfolio_images" RENAME COLUMN "created_at" TO "uploaded_at";
        END IF;
      END
      $$;
    `);

    // Set default for uploaded_at if present
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'portfolio_images' AND column_name = 'uploaded_at'
        ) THEN
          ALTER TABLE "portfolio_images" ALTER COLUMN "uploaded_at" SET DEFAULT now();
        END IF;
      END
      $$;
    `);

    // Add updated_at column if missing
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );

    // Add/rename tags column: style_tags -> custom_tags
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'portfolio_images' AND column_name = 'style_tags'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'portfolio_images' AND column_name = 'custom_tags'
        ) THEN
          ALTER TABLE "portfolio_images" RENAME COLUMN "style_tags" TO "custom_tags";
        END IF;
      END
      $$;
    `);
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "custom_tags" jsonb`,
    );

    // Caption to text
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'portfolio_images' AND column_name = 'caption'
        ) THEN
          ALTER TABLE "portfolio_images" ALTER COLUMN "caption" TYPE text USING caption::text;
        END IF;
      END
      $$;
    `);

    // Add remaining columns
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "thumbnail_url" character varying(1024)`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "style_category_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "hair_type_tags" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "duration_minutes" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "price_min_cents" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "price_max_cents" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "is_featured" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "is_public" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "view_count" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "like_count" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "booking_count" integer NOT NULL DEFAULT 0`,
    );

    // hair_length enum and column
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hair_length_enum') THEN
          CREATE TYPE hair_length_enum AS ENUM ('SHORT', 'MEDIUM', 'LONG', 'EXTRA_LONG');
        END IF;
      END
      $$;
    `);
    await queryRunner.query(
      `ALTER TABLE "portfolio_images" ADD COLUMN IF NOT EXISTS "hair_length" hair_length_enum`,
    );

    // FK to service_categories(style_category_id)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.constraint_column_usage
          WHERE table_name = 'portfolio_images'
            AND constraint_name = 'FK_portfolio_images_style_category'
        ) THEN
          ALTER TABLE "portfolio_images"
            ADD CONSTRAINT "FK_portfolio_images_style_category"
            FOREIGN KEY ("style_category_id") REFERENCES "service_categories"("id")
            ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);

    // Helpful indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_portfolio_images_provider_id" ON "portfolio_images" ("provider_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_portfolio_images_style_category_id" ON "portfolio_images" ("style_category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_portfolio_images_public_featured" ON "portfolio_images" ("is_public", "is_featured")`,
    );

    // Create portfolio_image_likes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "portfolio_image_likes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "image_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_portfolio_image_likes_image_id" ON "portfolio_image_likes" ("image_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_portfolio_image_likes_user_id" ON "portfolio_image_likes" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "uq_portfolio_image_likes_image_user" ON "portfolio_image_likes" ("image_id", "user_id")`,
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE table_name = 'portfolio_image_likes' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'FK_portfolio_image_likes_image'
        ) THEN
          ALTER TABLE "portfolio_image_likes"
          ADD CONSTRAINT "FK_portfolio_image_likes_image" FOREIGN KEY ("image_id") REFERENCES "portfolio_images"("id") ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE table_name = 'portfolio_image_likes' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'FK_portfolio_image_likes_user'
        ) THEN
          ALTER TABLE "portfolio_image_likes"
          ADD CONSTRAINT "FK_portfolio_image_likes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);

    // Create saved_portfolio_images
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "saved_portfolio_images" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "image_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_saved_portfolio_images_user_id" ON "saved_portfolio_images" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_saved_portfolio_images_image_id" ON "saved_portfolio_images" ("image_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "uq_saved_portfolio_images_user_image" ON "saved_portfolio_images" ("user_id", "image_id")`,
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE table_name = 'saved_portfolio_images' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'FK_saved_portfolio_images_user'
        ) THEN
          ALTER TABLE "saved_portfolio_images"
          ADD CONSTRAINT "FK_saved_portfolio_images_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE table_name = 'saved_portfolio_images' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'FK_saved_portfolio_images_image'
        ) THEN
          ALTER TABLE "saved_portfolio_images"
          ADD CONSTRAINT "FK_saved_portfolio_images_image" FOREIGN KEY ("image_id") REFERENCES "portfolio_images"("id") ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new tables
    await queryRunner.query(`DROP TABLE IF EXISTS "saved_portfolio_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "portfolio_image_likes"`);

    // Remove columns we added to portfolio_images (safe to run even if missing)
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "hair_length"`);
    await queryRunner.query(`DROP TYPE IF EXISTS hair_length_enum`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "style_category_id"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "thumbnail_url"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "custom_tags"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "hair_type_tags"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "duration_minutes"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "price_min_cents"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "price_max_cents"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "is_featured"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "is_public"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "view_count"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "like_count"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "booking_count"`);
    await queryRunner.query(`ALTER TABLE "portfolio_images" DROP COLUMN IF EXISTS "updated_at"`);

    // Rename uploaded_at back to created_at if needed
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'portfolio_images' AND column_name = 'uploaded_at'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'portfolio_images' AND column_name = 'created_at'
        ) THEN
          ALTER TABLE "portfolio_images" RENAME COLUMN "uploaded_at" TO "created_at";
        END IF;
      END
      $$;
    `);
  }
}