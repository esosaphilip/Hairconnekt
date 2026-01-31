
import { DataSource, QueryRunner } from 'typeorm';
import { FixR2Domain1769878000000 } from './1769878000000-FixR2Domain';
import { newDb } from 'pg-mem';

describe('FixR2Domain1769878000000', () => {
    let dataSource: DataSource;
    let queryRunner: QueryRunner;
    let migration: FixR2Domain1769878000000;

    beforeAll(async () => {
        // 1. Setup in-memory DB
        const db = newDb();

        // 2. Initialize DataSource attached to this mocked DB
        dataSource = await db.adapters.createTypeormDataSource({
            type: 'postgres',
            entities: [], // We'll create tables manually for speed/simplicity
        });

        // Mock version() for TypeORM
        db.public.registerFunction({
            name: 'version',
            args: [],
            returns: db.public.getType('text' as any),
            implementation: () => 'PostgreSQL 14.0',
        });

        // Mock current_database() for TypeORM
        db.public.registerFunction({
            name: 'current_database',
            args: [],
            returns: db.public.getType('text' as any),
            implementation: () => 'test_db',
        });

        // Mock REPLACE() for migration logic
        db.public.registerFunction({
            name: 'replace',
            args: [db.public.getType('text' as any), db.public.getType('text' as any), db.public.getType('text' as any)],
            returns: db.public.getType('text' as any),
            implementation: (str: string, search: string, replace: string) => {
                if (!str) return str;
                return str.split(search).join(replace); // Simple global replace
            },
        });

        await dataSource.initialize();
        queryRunner = dataSource.createQueryRunner();

        // 3. Create Tables manually to mimic prod schema (lazy way, just needed columns)
        await queryRunner.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, profile_picture_url VARCHAR)`);
        await queryRunner.query(`CREATE TABLE provider_profiles (id SERIAL PRIMARY KEY, cover_photo_url VARCHAR)`);
        await queryRunner.query(`CREATE TABLE portfolio_images (id SERIAL PRIMARY KEY, image_url VARCHAR, thumbnail_url VARCHAR)`);

        migration = new FixR2Domain1769878000000();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        // Clear tables
        await queryRunner.query(`DELETE FROM users`);
        await queryRunner.query(`DELETE FROM provider_profiles`);
        await queryRunner.query(`DELETE FROM portfolio_images`);
    });

    it('should replace incorrect R2 domain with correct one in all tables', async () => {
        // Arrange: Insert bad data and some good data
        const badDomain = 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev';
        const goodDomain = 'https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev';

        await queryRunner.query(`INSERT INTO users (profile_picture_url) VALUES ('${badDomain}/user.jpg')`);
        await queryRunner.query(`INSERT INTO users (profile_picture_url) VALUES ('${goodDomain}/already-good.jpg')`);

        await queryRunner.query(`INSERT INTO provider_profiles (cover_photo_url) VALUES ('${badDomain}/cover.jpg')`);

        await queryRunner.query(`INSERT INTO portfolio_images (image_url, thumbnail_url) VALUES ('${badDomain}/img.jpg', '${badDomain}/thumb.jpg')`);

        // Act: Run Migration
        await migration.up(queryRunner);

        // Assert: Check Users
        const users = await queryRunner.query(`SELECT profile_picture_url FROM users`);
        expect(users).toHaveLength(2);
        expect(users.find((u: any) => u.profile_picture_url.includes('user.jpg')).profile_picture_url)
            .toBe(`${goodDomain}/user.jpg`);
        expect(users.find((u: any) => u.profile_picture_url.includes('already-good.jpg')).profile_picture_url)
            .toBe(`${goodDomain}/already-good.jpg`); // Should be unchanged

        // Assert: Check Provider Profiles
        const profiles = await queryRunner.query(`SELECT cover_photo_url FROM provider_profiles`);
        expect(profiles[0].cover_photo_url).toBe(`${goodDomain}/cover.jpg`);

        // Assert: Check Portfolio Images
        const images = await queryRunner.query(`SELECT image_url, thumbnail_url FROM portfolio_images`);
        expect(images[0].image_url).toBe(`${goodDomain}/img.jpg`);
        expect(images[0].thumbnail_url).toBe(`${goodDomain}/thumb.jpg`);
    });
});
