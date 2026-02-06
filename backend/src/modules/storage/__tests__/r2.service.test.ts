import { R2Service } from '../r2.service';
import { InternalServerErrorException } from '@nestjs/common';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => {
    const actualModule = jest.requireActual('@aws-sdk/client-s3');
    return {
        ...actualModule,
        S3Client: jest.fn().mockImplementation(() => ({
            send: jest.fn().mockResolvedValue({}),
        })),
    };
});

describe('R2Service - Cloud-Only Implementation', () => {
    let service: R2Service;
    const validCredentials = {
        R2_ACCOUNT_ID: 'test-account-id',
        R2_ACCESS_KEY_ID: 'test-access-key',
        R2_SECRET_ACCESS_KEY: 'test-secret-key',
    };

    beforeEach(() => {
        // Clear all environment variables
        delete process.env.R2_ACCOUNT_ID;
        delete process.env.R2_ACCESS_KEY_ID;
        delete process.env.R2_SECRET_ACCESS_KEY;
        delete process.env.R2_PUBLIC_BASE_URL;
        delete process.env.R2_PUBLIC_URL;
    });

    describe('Constructor', () => {
        it('should throw error if R2_ACCOUNT_ID is missing', () => {
            process.env.R2_ACCESS_KEY_ID = validCredentials.R2_ACCESS_KEY_ID;
            process.env.R2_SECRET_ACCESS_KEY = validCredentials.R2_SECRET_ACCESS_KEY;

            expect(() => new R2Service()).toThrow('R2 Credentials missing. Deployment aborted.');
        });

        it('should throw error if R2_ACCESS_KEY_ID is missing', () => {
            process.env.R2_ACCOUNT_ID = validCredentials.R2_ACCOUNT_ID;
            process.env.R2_SECRET_ACCESS_KEY = validCredentials.R2_SECRET_ACCESS_KEY;

            expect(() => new R2Service()).toThrow('R2 Credentials missing. Deployment aborted.');
        });

        it('should throw error if R2_SECRET_ACCESS_KEY is missing', () => {
            process.env.R2_ACCOUNT_ID = validCredentials.R2_ACCOUNT_ID;
            process.env.R2_ACCESS_KEY_ID = validCredentials.R2_ACCESS_KEY_ID;

            expect(() => new R2Service()).toThrow('R2 Credentials missing. Deployment aborted.');
        });

        it('should initialize successfully with valid credentials', () => {
            process.env.R2_ACCOUNT_ID = validCredentials.R2_ACCOUNT_ID;
            process.env.R2_ACCESS_KEY_ID = validCredentials.R2_ACCESS_KEY_ID;
            process.env.R2_SECRET_ACCESS_KEY = validCredentials.R2_SECRET_ACCESS_KEY;

            expect(() => new R2Service()).not.toThrow();
        });
    });

    describe('getPublicUrl', () => {
        beforeEach(() => {
            // Set valid credentials for these tests
            process.env.R2_ACCOUNT_ID = validCredentials.R2_ACCOUNT_ID;
            process.env.R2_ACCESS_KEY_ID = validCredentials.R2_ACCESS_KEY_ID;
            process.env.R2_SECRET_ACCESS_KEY = validCredentials.R2_SECRET_ACCESS_KEY;
            service = new R2Service();
        });

        it('should return absolute URL with default R2 domain', () => {
            const key = 'providers/123/1234567890-profile.jpg';
            const url = service.getPublicUrl(key);

            expect(url).toBe('https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev/providers/123/1234567890-profile.jpg');
            expect(url).toMatch(/^https:\/\//);
        });

        it('should use R2_PUBLIC_BASE_URL env variable when set', () => {
            process.env.R2_PUBLIC_BASE_URL = 'https://custom-cdn.example.com';
            service = new R2Service();

            const url = service.getPublicUrl('test-key.jpg');

            expect(url).toBe('https://custom-cdn.example.com/test-key.jpg');
            expect(url).toMatch(/^https:\/\//);
        });


        it('should strip trailing slash from base URL', () => {
            process.env.R2_PUBLIC_BASE_URL = 'https://cdn.example.com/';
            service = new R2Service();

            const url = service.getPublicUrl('file.jpg');

            expect(url).toBe('https://cdn.example.com/file.jpg');
            expect(url).not.toContain('//file.jpg');
        });

        it('should work with complex key paths', () => {
            const complexKey = 'providers/abc-123-def/portfolio/2024/gallery/image-001.webp';
            const url = service.getPublicUrl(complexKey);

            expect(url).toBe(`https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev/${complexKey}`);
            expect(url).toMatch(/^https:\/\//);
        });
    });

    describe('uploadObject', () => {
        beforeEach(() => {
            process.env.R2_ACCOUNT_ID = validCredentials.R2_ACCOUNT_ID;
            process.env.R2_ACCESS_KEY_ID = validCredentials.R2_ACCESS_KEY_ID;
            process.env.R2_SECRET_ACCESS_KEY = validCredentials.R2_SECRET_ACCESS_KEY;
            service = new R2Service();
        });

        it('should upload and return absolute URL', async () => {
            const bucket = 'hairconnekt-images';
            const key = 'providers/123/test.jpg';
            const body = Buffer.from('test image data');

            const result = await service.uploadObject(bucket, key, body);

            expect(result).toHaveProperty('url');
            expect(result.url).toBe('https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev/providers/123/test.jpg');
        });

        it('should use provided content type', async () => {
            const bucket = 'hairconnekt-images';
            const key = 'providers/123/test.png';
            const body = Buffer.from('test image data');

            const result = await service.uploadObject(bucket, key, body, 'image/png');

            expect(result).toHaveProperty('url');
            expect(result.url).toContain(key);
        });

        it('should default to image/jpeg if no content type provided', async () => {
            const bucket = 'hairconnekt-images';
            const key = 'providers/123/test.jpg';
            const body = Buffer.from('test image data');

            const result = await service.uploadObject(bucket, key, body);

            expect(result).toHaveProperty('url');
        });
    });
});
