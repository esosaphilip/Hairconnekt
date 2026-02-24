import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../storage.service';
import { ConfigService } from '@nestjs/config';

jest.mock('@aws-sdk/client-s3', () => {
    return {
        S3Client: jest.fn(() => ({
            send: jest.fn().mockResolvedValue({}),
        })),
        PutObjectCommand: jest.fn(),
    };
});

describe('StorageService', () => {
    let service: StorageService;
    let configService: jest.Mocked<ConfigService>;
    const originalEnv = process.env;

    beforeEach(async () => {
        process.env = {
            ...originalEnv,
            R2_PUBLIC_BASE_URL: 'https://images.hairconnekt.com',
            B2_BUCKET: 'hairconnekt-images',
        };

        configService = {
            get: jest.fn(),
        } as unknown as jest.Mocked<ConfigService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                {
                    provide: ConfigService,
                    useValue: configService,
                },
            ],
        }).compile();

        service = module.get<StorageService>(StorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env = originalEnv;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadImage', () => {
        it('should upload an image successfully and return a public URL', async () => {
            const buffer = Buffer.from('fake image content');
            const filename = 'test-image.jpg';
            const folderPath = 'profiles/user-123';

            const result = await service.uploadImage(folderPath, buffer, filename);

            expect(result).toHaveProperty('url');
            expect(result.url).toMatch(/^https:\/\/images\.hairconnekt\.com\/profiles\/user-123\/.*\.jpg$/);
        });

        it('should throw BadRequestException if file is too large', async () => {
            const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
            const filename = 'large.jpg';

            await expect(service.uploadImage('folder', largeBuffer, filename)).rejects.toThrow('File too large (11.00MB). Maximum size is 10MB');
        });

        it('should throw BadRequestException for invalid extensions', async () => {
            const buffer = Buffer.from('fake image content');

            await expect(service.uploadImage('folder', buffer, 'invalid.exe')).rejects.toThrow('Invalid image type. Allowed: jpg, jpeg, png, gif, webp');
            await expect(service.uploadImage('folder', buffer, 'script.js')).rejects.toThrow('Invalid image type. Allowed: jpg, jpeg, png, gif, webp');
        });

        it('should handle filenames with special characters', async () => {
            const buffer = Buffer.from('fake image content');
            const filename = 'Test Image (1) - Copy!.jpg';

            const result = await service.uploadImage('folder', buffer, filename);
            expect(result).toHaveProperty('url');
            expect(result.url).toContain('.jpg');
        });
    });
});
