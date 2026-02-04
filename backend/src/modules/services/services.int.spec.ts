import { ServicesService } from './services.service';
import { Repository, DataSource } from 'typeorm';
import { newDb } from 'pg-mem';
import { User, UserType } from '../users/entities/user.entity';
import { ClientProfile } from '../users/entities/client-profile.entity';
import { Address } from '../users/entities/address.entity';
import { ProviderProfile, BusinessType } from '../providers/entities/provider-profile.entity';
import { ProviderLocation } from '../providers/entities/provider-location.entity';
import { ProviderLanguage } from '../providers/entities/provider-language.entity';
import { ProviderAvailability } from '../providers/entities/provider-availability.entity';
import { ProviderTimeOff } from '../providers/entities/provider-time-off.entity';
import { Service, PriceType } from './entities/service.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentService } from '../appointments/entities/appointment-service.entity';
import { PortfolioImage } from '../portfolio/entities/portfolio-image.entity';
import { StorageService } from '../storage/storage.service';
import { BlockedUser } from '../users/entities/blocked-user.entity';
import { ProviderClient } from '../providers/entities/provider-client.entity';
import { ProviderSettings } from '../providers/entities/provider-settings.entity';
import { ProviderSpecialization } from '../providers/entities/provider-specialization.entity';
import { ProviderCertification } from '../providers/entities/provider-certification.entity';

// NOTE: Set RUN_INT_TESTS=true to attempt running with pg-mem
const describeInt = process.env.RUN_INT_TESTS === 'true' ? describe : describe;

describeInt('ServicesService (Integration with pg-mem)', () => {
    jest.setTimeout(30000);
    let dataSource: DataSource;
    let service: ServicesService;
    let usersRepo: Repository<User>;
    let providersRepo: Repository<ProviderProfile>;
    let categoriesRepo: Repository<ServiceCategory>;
    let servicesRepo: Repository<Service>;

    const storageServiceMock = {
        uploadImage: jest.fn().mockResolvedValue({ url: 'https://r2.dev/test.jpg' }),
    } as unknown as StorageService;

    beforeAll(async () => {
        const db = newDb({ autoCreateForeignKeyIndices: true });
        // Register minimal pg functions used by TypeORM initialization
        db.public.registerFunction({ name: 'version', returns: 'text' as any, implementation: () => 'PostgreSQL 13.0 on pg-mem' });
        db.public.registerFunction({ name: 'current_database', returns: 'text' as any, implementation: () => 'test' });
        db.public.registerFunction({ name: 'uuid_generate_v4', returns: 'uuid' as any, implementation: () => require('crypto').randomUUID() });

        dataSource = await db.adapters.createTypeormDataSource({
            type: 'postgres',
            entities: [
                User,
                ClientProfile,
                Address,
                ProviderProfile,
                ProviderLocation,
                ProviderLanguage,
                ProviderAvailability,
                ProviderTimeOff,
                Service,
                ServiceCategory,
                Appointment,
                AppointmentService,
                PortfolioImage,
                BlockedUser,
                ProviderClient,
                ProviderSettings,
                ProviderSpecialization,
                ProviderCertification,
            ],
            synchronize: true,
        });
        await dataSource.initialize();

        usersRepo = dataSource.getRepository(User);
        providersRepo = dataSource.getRepository(ProviderProfile);
        categoriesRepo = dataSource.getRepository(ServiceCategory);
        servicesRepo = dataSource.getRepository(Service);

        service = new ServicesService(
            servicesRepo,
            providersRepo,
            categoriesRepo,
            storageServiceMock,
        );
    });

    afterAll(async () => {
        if (dataSource) {
            await dataSource.destroy();
        }
    });

    it('creates a service correctly and resolves legacy category ID', async () => {
        // 1. Seed User & Provider
        const user = usersRepo.create({
            email: 'service-test@example.com',
            phone: '+49123123123',
            passwordHash: 'hash',
            firstName: 'Service',
            lastName: 'Tester',
            userType: UserType.PROVIDER,
        });
        await usersRepo.save(user);

        const provider = providersRepo.create({
            user,
            businessName: 'Braids by Tester',
            businessType: BusinessType.INDIVIDUAL,
            bio: 'Test bio',
            cancellationPolicy: '24h',
        });
        await providersRepo.save(provider);

        // 2. Seed Category
        const category = categoriesRepo.create({
            nameDe: 'Braids',
            slug: 'braids',
            isActive: true,
            displayOrder: 1,
        });
        await categoriesRepo.save(category);

        // 3. Create Service via Service (simulating Mobile App request)
        // Mobile might send "cat_braids" based on hardcoded lists
        const createDto = {
            name: 'Box Braids - Long',
            description: 'Hip length box braids',
            priceCents: 12000,
            durationMinutes: 240,
            categoryId: 'cat_braids', // Legacy ID to test resolution logic
            priceType: PriceType.FIXED,
            isActive: true,
            allowOnlineBooking: true
        };

        const created = await service.create(provider.id, createDto);

        // 4. Verification
        expect(created).toBeDefined();
        expect(created.id).toBeDefined();
        expect(created.name).toBe('Box Braids - Long');
        expect(created.priceCents).toBe(12000);
        // CRITICAL: Check if "cat_braids" was resolved to the UUID of the category we seeded
        expect(created.categoryId).toBe(category.id);
        expect(created.providerId).toBe(provider.id);

        // 5. Verify Persistence
        const inDb = await servicesRepo.findOne({ where: { id: created.id }, relations: ['category'] });
        expect(inDb).toBeDefined();
        expect(inDb?.name).toBe('Box Braids - Long');
        expect(inDb?.category?.slug).toBe('braids');
    });
});
