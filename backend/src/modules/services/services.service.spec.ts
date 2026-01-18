import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Service, PriceType } from './entities/service.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock Repository Factory
const mockRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'service-123' })),
    remove: jest.fn(),
});

describe('ServicesService', () => {
    let service: ServicesService;
    let serviceRepo: any;
    let providerRepo: any;
    let categoryRepo: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ServicesService,
                { provide: getRepositoryToken(Service), useFactory: mockRepo },
                { provide: getRepositoryToken(ProviderProfile), useFactory: mockRepo },
                { provide: getRepositoryToken(ServiceCategory), useFactory: mockRepo },
            ],
        }).compile();

        service = module.get<ServicesService>(ServicesService);
        serviceRepo = module.get(getRepositoryToken(Service));
        providerRepo = module.get(getRepositoryToken(ProviderProfile));
        categoryRepo = module.get(getRepositoryToken(ServiceCategory));
    });

    describe('create', () => {
        it('should successfully create a service', async () => {
            const providerId = 'provider-1';
            const createDto = {
                name: 'Test Service',
                description: 'A test service',
                priceCents: 5000,
                durationMinutes: 60,
                categoryId: 'cat-1',
            };

            // Mock Provider Found
            providerRepo.findOne.mockResolvedValue({ id: providerId });

            // Build expected entity properties (partial)
            const expectedServiceProps = {
                name: createDto.name,
                priceCents: createDto.priceCents,
                durationMinutes: createDto.durationMinutes,
                providerId: providerId,
                isActive: true, // Default
            };

            const result = await service.create(providerId, createDto);

            expect(providerRepo.findOne).toHaveBeenCalledWith({ where: { id: providerId } });
            expect(serviceRepo.save).toHaveBeenCalledWith(expect.objectContaining(expectedServiceProps));
            expect(result).toEqual(expect.objectContaining({
                id: 'service-123',
                ...expectedServiceProps,
            }));
        });

        it('should throw NotFoundException if provider does not exist', async () => {
            providerRepo.findOne.mockResolvedValue(null);

            await expect(
                service.create('non-existent-provider', {
                    name: 'Fail Service',
                    priceCents: 100,
                    durationMinutes: 30,
                }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException for negative price', async () => {
            const providerId = 'provider-1';
            providerRepo.findOne.mockResolvedValue({ id: providerId });

            const invalidDto = {
                name: 'Negative Price',
                priceCents: -100,
                durationMinutes: 60,
            };

            await expect(service.create(providerId, invalidDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException for zero duration', async () => {
            const providerId = 'provider-1';
            providerRepo.findOne.mockResolvedValue({ id: providerId });

            const invalidDto = {
                name: 'Zero Duration',
                priceCents: 1000,
                durationMinutes: 0,
            };

            await expect(service.create(providerId, invalidDto)).rejects.toThrow(BadRequestException);
        });
    });
});
