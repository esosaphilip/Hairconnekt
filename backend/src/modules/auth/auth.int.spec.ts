
import { AuthService } from './auth.service';
import { DataSource, Repository } from 'typeorm';
import { newDb } from 'pg-mem';
import { User, UserType } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { ProviderProfile, BusinessType } from '../providers/entities/provider-profile.entity';
import { ProviderSettings } from '../providers/entities/provider-settings.entity';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { RegisterDto } from './dto/register.dto';

// Import all potential entities to avoid relation errors
import { ClientProfile } from '../users/entities/client-profile.entity';
import { Address } from '../users/entities/address.entity';
import { ProviderLocation } from '../providers/entities/provider-location.entity';
import { ProviderLanguage } from '../providers/entities/provider-language.entity';
import { ProviderAvailability } from '../providers/entities/provider-availability.entity';
import { ProviderTimeOff } from '../providers/entities/provider-time-off.entity';
import { Service } from '../services/entities/service.entity';
import { ServiceCategory } from '../services/entities/service-category.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentService } from '../appointments/entities/appointment-service.entity';
import { PortfolioImage } from '../portfolio/entities/portfolio-image.entity';
import { BlockedUser } from '../users/entities/blocked-user.entity';
import { ProviderClient } from '../providers/entities/provider-client.entity';
import { ProviderSpecialization } from '../providers/entities/provider-specialization.entity';
import { ProviderCertification } from '../providers/entities/provider-certification.entity';

describe('AuthService Integration', () => {
    let authService: AuthService;
    let dataSource: DataSource;
    let usersRepo: Repository<User>;
    let providersRepo: Repository<ProviderProfile>;

    const mockEmailService = {
        sendVerificationCodeEmail: jest.fn(),
        sendWelcomeEmail: jest.fn(),
    };
    const mockSmsService = {
        sendSms: jest.fn(),
    };

    beforeAll(async () => {
        const db = newDb({ autoCreateForeignKeyIndices: true });

        // Mock Postgres functions
        db.public.registerFunction({ name: 'version', returns: 'text' as any, implementation: () => 'PostgreSQL 14.0' });
        db.public.registerFunction({ name: 'current_database', returns: 'text' as any, implementation: () => 'test' });
        db.public.registerFunction({ name: 'uuid_generate_v4', returns: 'uuid' as any, implementation: () => '123e4567-e89b-12d3-a456-426614174000' }); // Naive mock

        dataSource = await db.adapters.createTypeormDataSource({
            type: 'postgres',
            entities: [
                User, RefreshToken, VerificationCode, ProviderProfile,
                ProviderSettings, ClientProfile, Address, ProviderLocation,
                ProviderLanguage, ProviderAvailability, ProviderTimeOff,
                Service, ServiceCategory, Appointment, AppointmentService,
                PortfolioImage, BlockedUser, ProviderClient,
                ProviderSpecialization, ProviderCertification
            ],
            synchronize: true,
        });
        await dataSource.initialize();

        usersRepo = dataSource.getRepository(User);
        providersRepo = dataSource.getRepository(ProviderProfile);
        const refreshRepo = dataSource.getRepository(RefreshToken);
        const verificationRepo = dataSource.getRepository(VerificationCode);

        authService = new AuthService(
            usersRepo,
            refreshRepo,
            verificationRepo,
            mockEmailService as any,
            mockSmsService as any,
            dataSource,
        );
    });

    afterAll(async () => {
        if (dataSource) await dataSource.destroy();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        // Clean tables
        await usersRepo.query('DELETE FROM "user"'); // pg-mem doesn't always support TRUNCATE CASCADE well
    });

    it('should register a new Provider (including profile creation)', async () => {
        const dto: RegisterDto = {
            email: 'newprovider@example.com',
            phone: '+49123456789',
            password: 'SecurePassword123!',
            firstName: 'New',
            lastName: 'Provider',
            userType: UserType.PROVIDER,
        };

        const result = await authService.register(dto);

        // 1. Check User
        expect(result.user).toBeDefined();
        expect(result.user.email).toBe(dto.email.toLowerCase());
        expect(result.user.userType).toBe(UserType.PROVIDER);
        expect(result.tokens).toBeDefined();

        // 2. Verify persistence
        const savedUser = await usersRepo.findOne({
            where: { email: dto.email.toLowerCase() },
            relations: ['providerProfile']
        });
        expect(savedUser).toBeDefined();
        expect(savedUser?.providerProfile).toBeDefined();

        // 3. Check Provider Profile Defaults
        const profile = savedUser!.providerProfile!;
        expect(profile.businessType).toBe(BusinessType.INDIVIDUAL);
        expect(profile.cancellationPolicy).toBe('Flexible');

        // 4. Check Provider Settings (should be created automatically)
        const savedProfile = await providersRepo.findOne({
            where: { id: profile.id },
            relations: ['settings']
        });
        expect(savedProfile?.settings).toBeDefined();
        expect(savedProfile?.settings?.autoAcceptBookings).toBe(false);
    });

    it('should prevent duplications by Email', async () => {
        const dto: RegisterDto = {
            email: 'duplicate@example.com',
            phone: '+49987654321',
            password: 'Password',
            firstName: 'A',
            lastName: 'B',
            userType: UserType.CLIENT,
        };

        await authService.register(dto);

        // Try registering again
        const dto2 = { ...dto, phone: '+49111111111' }; // Different phone
        await expect(authService.register(dto2)).rejects.toThrow('Email already registered');
    });

    it('should prevent duplications by Phone', async () => {
        const dto: RegisterDto = {
            email: 'unique1@example.com',
            phone: '+49555555555',
            password: 'Password',
            firstName: 'A',
            lastName: 'B',
            userType: UserType.CLIENT,
        };

        await authService.register(dto);

        // Try registering again with same phone
        const dto2 = { ...dto, email: 'unique2@example.com' }; // Different email
        await expect(authService.register(dto2)).rejects.toThrow('Phone already registered');
    });
});
