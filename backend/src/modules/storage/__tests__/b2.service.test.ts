import { B2Service } from '../b2.service';
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

describe('B2Service - Cloud-Only Implementation', () => {
    let service: B2Service;
    const validCredentials = {
        B2_KEY_ID: '7eec95da8e22',
        B2_APPLICATION_KEY: '0037b8bbea72da852df2236b01b6f8c3c0a18147cb',
    };

    beforeEach(() => {
        // Clear all environment variables
        delete process.env.B2_KEY_ID;
        delete process.env.B2_APPLICATION_KEY;
        delete process.env.B2_REGION;
        delete process.env.B2_PUBLIC_URL;
        delete process.env.B2_BUCKET;
    });

    describe('Constructor', () => {
        it('should throw error if B2_KEY_ID is missing', () => {
            process.env.B2_APPLICATION_KEY = validCredentials.B2_APPLICATION_KEY;

            expect(() => new B2Service()).toThrow('Backblaze B2 Credentials missing. Deployment aborted.');
        });

        it('should throw error if B2_APPLICATION_KEY is missing', () => {
            process.env.B2_KEY_ID = validCredentials.B2_KEY_ID;

            expect(() => new B2Service()).toThrow('Backblaze B2 Credentials missing. Deployment aborted.');
        });

        it('should initialize successfully with valid credentials', () => {
            process.env.B2_KEY_ID = validCredentials.B2_KEY_ID;
            process.env.B2_APPLICATION_KEY = validCredentials.B2_APPLICATION_KEY;

            expect(() => new B2Service()).not.toThrow();
        });
    });

    describe('getPublicUrl', () => {
        beforeEach(() => {
            // Set valid credentials for these tests
            process.env.B2_KEY_ID = validCredentials.B2_KEY_ID;
            process.env.B2_APPLICATION_KEY = validCredentials.B2_APPLICATION_KEY;
            service = new B2Service();
        });

        it('should return absolute URL with default B2 domain', () => {
            const key = 'providers/123/1234567890-profile.jpg';
            const url = service.getPublicUrl(key);

            expect(url).toBe('https://f003.backblazeb2.com/file/hairconnekt-images/providers/123/1234567890-profile.jpg');
            expect(url).toMatch(/^https:\/\//);
        });

        it('should use B2_PUBLIC_URL env variable when set', () => {
            process.env.B2_PUBLIC_URL = 'https://custom-cdn.example.com';
            const newService = new B2Service();

            const url = newService.getPublicUrl('test-key.jpg');

            expect(url).toBe('https://custom-cdn.example.com/test-key.jpg');
            expect(url).toMatch(/^https:\/\//);
        });

        it('should strip trailing slash from public URL', () => {
            process.env.B2_PUBLIC_URL = 'https://cdn.example.com/';
            const newService = new B2Service();

            const url = newService.getPublicUrl('file.jpg');

            expect(url).toBe('https://cdn.example.com/file.jpg');
            expect(url).not.toContain('//file.jpg');
        });

        it('should work with complex key paths', () => {
            const complexKey = 'providers/abc-123-def/portfolio/2024/gallery/image-001.webp';
            const url = service.getPublicUrl(complexKey);

            expect(url).toBe(`https://f003.backblazeb2.com/file/hairconnekt-images/${complexKey}`);
            expect(url).toMatch(/^https:\/\//);
        });
    });

    describe('uploadObject', () => {
        beforeEach(() => {
            process.env.B2_KEY_ID = validCredentials.B2_KEY_ID;
            process.env.B2_APPLICATION_KEY = validCredentials.B2_APPLICATION_KEY;
            service = new B2Service();
        });

        it('should upload and return absolute URL', async () => {
            const bucket = 'hairconnekt-images';
            const key = 'providers/123/test.jpg';
            const body = Buffer.from('test image data');

            const result = await service.uploadObject(bucket, key, body);

            expect(result).toHaveProperty('url');
            expect(result.url).toBe('https://f003.backblazeb2.com/file/hairconnekt-images/providers/123/test.jpg');
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
