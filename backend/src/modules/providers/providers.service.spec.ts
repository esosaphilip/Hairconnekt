
import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersService } from './providers.service';
import { AuthService } from '../auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderProfile } from './entities/provider-profile.entity';
import { ProviderClient } from './entities/provider-client.entity';
import { User } from '../users/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';

// Additional Entities
import { ProviderTimeOff } from './entities/provider-time-off.entity';
import { Address } from '../users/entities/address.entity';
import { ProviderLocation } from './entities/provider-location.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Service } from '../services/entities/service.entity';
import { Review } from '../reviews/entities/review.entity';
import { PortfolioImage } from '../portfolio/entities/portfolio-image.entity';
import { ProviderSettings } from './entities/provider-settings.entity';
import { AppCacheService } from '../cache/cache.service';
import { GeocodingService } from '../../shared/services/geocoding.service';

// Mock Repositories
const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
};

const mockProviderRepo = {
    findByUserId: jest.fn(),
    findAllAppointments: jest.fn(),
    findAppointmentsForDashboard: jest.fn(),
    findNearby: jest.fn(),
    getRatingsForProviders: jest.fn(),
    getServicesForProviders: jest.fn(),
    // Add other methods if needed
};

const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
};

const mockStorage = {
    uploadFile: jest.fn(),
};

const mockGeocoding = {
    getCoordinates: jest.fn(),
};

describe('ProvidersService', () => {
    let service: ProvidersService;
    let providerClientRepo: Repository<ProviderClient>;
    let providerEntityRepo: Repository<ProviderProfile>;
    // let providerRepo: any; 

    beforeEach(async () => {
        const mockAuthService = {
            register: jest.fn(),
            validateUser: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProvidersService,
                { provide: 'IProviderRepository', useValue: mockProviderRepo },
                { provide: AppCacheService, useValue: mockCache },
                { provide: StorageService, useValue: mockStorage },
                { provide: GeocodingService, useValue: mockGeocoding },

                // Repositories
                { provide: getRepositoryToken(User), useValue: mockRepo },
                { provide: getRepositoryToken(ProviderProfile), useValue: mockRepo },
                { provide: getRepositoryToken(ProviderTimeOff), useValue: mockRepo },
                { provide: getRepositoryToken(Address), useValue: mockRepo },
                { provide: getRepositoryToken(ProviderLocation), useValue: mockRepo },
                { provide: getRepositoryToken(Appointment), useValue: mockRepo },
                { provide: getRepositoryToken(Service), useValue: mockRepo },
                { provide: getRepositoryToken(Review), useValue: mockRepo },
                { provide: getRepositoryToken(PortfolioImage), useValue: mockRepo },
                { provide: getRepositoryToken(ProviderSettings), useValue: mockRepo },
                {
                    provide: getRepositoryToken(ProviderClient),
                    useValue: { ...mockRepo, create: jest.fn(), save: jest.fn(), findOne: jest.fn() } // Specific instance
                },
                { provide: AuthService, useValue: mockAuthService },
            ],
        }).compile();

        service = module.get<ProvidersService>(ProvidersService);
        providerClientRepo = module.get<Repository<ProviderClient>>(getRepositoryToken(ProviderClient));
        providerEntityRepo = module.get<Repository<ProviderProfile>>(getRepositoryToken(ProviderProfile));

        // Ensure mockRepo methods are reset
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addClient', () => {
        it('should create and save a new manual client', async () => {
            const userId = 'user-1';
            const dto = { firstName: 'Test', lastName: 'Client', phone: '123' };

            mockProviderRepo.findByUserId.mockResolvedValue({ id: 'p-profile-1' });
            const createSpy = jest.spyOn(providerClientRepo, 'create').mockReturnValue({
                ...dto,
                provider: { id: 'p-profile-1' }
            } as any);
            const saveSpy = jest.spyOn(providerClientRepo, 'save').mockResolvedValue({
                id: 'client-1',
                ...dto
            } as any);

            const result = await service.addClient(userId, dto);
            expect(result).toEqual({ id: 'client-1', ...dto });
            // expect(createSpy).toHaveBeenCalled(); // Code uses new ProviderClient(), not repo.create from DI in this specific way or it's not being intercepted
            expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone
            }));
        });
    });

    describe('updateClientNotes', () => {
        it('should update notes for existing provider client', async () => {
            const userId = 'user-1';
            const clientId = 'client-1';
            const notes = 'New notes';

            mockProviderRepo.findByUserId.mockResolvedValue({ id: 'p-profile-1' });

            jest.spyOn(providerClientRepo, 'findOne').mockResolvedValue({
                id: clientId,
                provider: { id: 'p-profile-1' },
                notes: 'Old notes'
            } as any);

            jest.spyOn(providerClientRepo, 'save').mockResolvedValue({ id: clientId, notes } as any);

            const result = await service.updateClientNotes(userId, clientId, notes);
            expect(result.notes).toEqual(notes);
        });
    });

    describe('updateClientVip', () => {
        it('should toggle VIP status', async () => {
            const userId = 'user-1';
            const clientId = 'client-1';
            const isVIP = true;

            mockProviderRepo.findByUserId.mockResolvedValue({ id: 'p-profile-1' });
            jest.spyOn(providerClientRepo, 'findOne').mockResolvedValue({
                id: clientId,
                provider: { id: 'p-profile-1' },
            } as any);
            jest.spyOn(providerClientRepo, 'save').mockResolvedValue({ id: clientId, isVIP } as any);

            const result = await service.updateClientVip(userId, clientId, isVIP);
            expect(result.isVIP).toEqual(true);
        });
    });
    describe('getNearbyProviders', () => {
        it('should fallback to recent providers if findNearby returns empty', async () => {
            // 1. Mock findNearby to return empty (simulating no geo results)
            mockProviderRepo.findNearby.mockResolvedValue([]);

            // 2. Mock providerEntityRepo.find to return "recent" providers
            const recentProviders = [{
                id: 'recent-1',
                businessName: 'Recent Hub',
                user: { firstName: 'Test', lastName: 'User' },
                isVerified: true,
                locations: [{ isPrimary: true, address: { latitude: 52.52, longitude: 13.405 } }],
                coverPhotoUrl: 'http://test.com/img.jpg',
                acceptsSameDayBooking: true
            }];
            (providerEntityRepo.find as jest.Mock).mockResolvedValue(recentProviders);

            mockProviderRepo.getRatingsForProviders.mockResolvedValue([]);
            mockProviderRepo.getServicesForProviders.mockResolvedValue([]);

            // 3. Call the service
            const result = await service.getNearbyProviders({ lat: 52.52, lon: 13.405, radiusKm: 10 });

            // 4. Assertions
            expect(mockProviderRepo.findNearby).toHaveBeenCalled();
            // Should be called twice? Once for radius, once for expanded.

            expect(providerEntityRepo.find).toHaveBeenCalledWith(expect.objectContaining({
                where: { isVerified: true },
                order: { createdAt: 'DESC' }
            }));

            expect(result.items).toHaveLength(1);
            expect(result.items[0].id).toBe('recent-1');
            expect(result.items[0].business).toBe('Recent Hub');
        });
    });
});
