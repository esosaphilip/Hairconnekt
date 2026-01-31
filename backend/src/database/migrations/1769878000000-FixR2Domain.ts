
import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixR2Domain1769878000000 implements MigrationInterface {
    name = 'FixR2Domain1769878000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Update users.profile_picture_url
        await queryRunner.query(
            `UPDATE "users" SET "profile_picture_url" = REPLACE("profile_picture_url", 'pub-08fbbd44374741679ded7c08d0adad27.r2.dev', 'pub-54d0ff210bf448eebf0f240d376a9358.r2.dev') WHERE "profile_picture_url" LIKE '%pub-08fbbd44374741679ded7c08d0adad27.r2.dev%';`
        );

        // 2. Update provider_profiles.cover_photo_url
        await queryRunner.query(
            `UPDATE "provider_profiles" SET "cover_photo_url" = REPLACE("cover_photo_url", 'pub-08fbbd44374741679ded7c08d0adad27.r2.dev', 'pub-54d0ff210bf448eebf0f240d376a9358.r2.dev') WHERE "cover_photo_url" LIKE '%pub-08fbbd44374741679ded7c08d0adad27.r2.dev%';`
        );

        // 3. Update portfolio_images.image_url
        await queryRunner.query(
            `UPDATE "portfolio_images" SET "image_url" = REPLACE("image_url", 'pub-08fbbd44374741679ded7c08d0adad27.r2.dev', 'pub-54d0ff210bf448eebf0f240d376a9358.r2.dev') WHERE "image_url" LIKE '%pub-08fbbd44374741679ded7c08d0adad27.r2.dev%';`
        );

        // 4. Update portfolio_images.thumbnail_url
        await queryRunner.query(
            `UPDATE "portfolio_images" SET "thumbnail_url" = REPLACE("thumbnail_url", 'pub-08fbbd44374741679ded7c08d0adad27.r2.dev', 'pub-54d0ff210bf448eebf0f240d376a9358.r2.dev') WHERE "thumbnail_url" LIKE '%pub-08fbbd44374741679ded7c08d0adad27.r2.dev%';`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert changes (optional, but good practice)
        await queryRunner.query(
            `UPDATE "users" SET "profile_picture_url" = REPLACE("profile_picture_url", 'pub-54d0ff210bf448eebf0f240d376a9358.r2.dev', 'pub-08fbbd44374741679ded7c08d0adad27.r2.dev') WHERE "profile_picture_url" LIKE '%pub-54d0ff210bf448eebf0f240d376a9358.r2.dev%';`
        );
        await queryRunner.query(
            `UPDATE "provider_profiles" SET "cover_photo_url" = REPLACE("cover_photo_url", 'pub-54d0ff210bf448eebf0f240d376a9358.r2.dev', 'pub-08fbbd44374741679ded7c08d0adad27.r2.dev') WHERE "cover_photo_url" LIKE '%pub-54d0ff210bf448eebf0f240d376a9358.r2.dev%';`
        );
        await queryRunner.query(
            `UPDATE "portfolio_images" SET "image_url" = REPLACE("image_url", 'pub-54d0ff210bf448eebf0f240d376a9358.r2.dev', 'pub-08fbbd44374741679ded7c08d0adad27.r2.dev') WHERE "image_url" LIKE '%pub-54d0ff210bf448eebf0f240d376a9358.r2.dev%';`
        );
        await queryRunner.query(
            `UPDATE "portfolio_images" SET "thumbnail_url" = REPLACE("thumbnail_url", 'pub-54d0ff210bf448eebf0f240d376a9358.r2.dev', 'pub-08fbbd44374741679ded7c08d0adad27.r2.dev') WHERE "thumbnail_url" LIKE '%pub-54d0ff210bf448eebf0f240d376a9358.r2.dev%';`
        );
    }
}
