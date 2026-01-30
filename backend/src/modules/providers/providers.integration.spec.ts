import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ProvidersService } from './providers.service';
import { BusinessType, ProviderProfile } from './entities/provider-profile.entity';
import { RegisterProviderDto } from './dto/register-provider.dto';
import { LanguageEnum } from './dto/update-languages.dto';
import { User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';

describe('Provider Registration Integration', () => {
    let app: TestingModule;
    let providersService: ProvidersService;
    let dataSource: DataSource;
    const testEmail = `test_provider_${Date.now()}@example.com`;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        providersService = app.get<ProvidersService>(ProvidersService);
        dataSource = app.get<DataSource>(DataSource);
    });

    afterAll(async () => {
        // Clean up created user
        if (dataSource) {
            const userRepo = dataSource.getRepository(User);
            await userRepo.delete({ email: testEmail });
        }
        await app.close();
    });

    it('should register a new provider and return user, tokens, and providerId', async () => {
        const registerDto: RegisterProviderDto = {
            password: 'TestPassword123!',
            contact: {
                firstName: 'Test',
                lastName: 'Provider',
                email: testEmail,
                phone: `+49${Date.now()}`.slice(0, 15),
            },
            profile: {
                businessName: 'Test Business',
                businessType: BusinessType.INDIVIDUAL,
                yearsOfExperience: 5,
                isMobileService: true,
                serviceRadiusKm: 20,
            },
            address: {
                street: 'Test Street',
                houseNumber: '1',
                postalCode: '10115',
                city: 'Berlin',
                state: 'Berlin',
                showOnMap: true,
            },
            services: ['Haircut'],
            languages: [LanguageEnum.ENGLISCH, LanguageEnum.DEUTSCH],
            specializations: ['Coloring'],
        };

        const result = await providersService.registerProvider(registerDto);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.providerId).toBeDefined();
        expect(result.userId).toBeDefined();
        expect(result.user).toBeDefined();
        expect(result.user.email).toBe(testEmail);
        expect(result.tokens).toBeDefined();
        expect(result.tokens.accessToken).toBeDefined();
        expect(result.tokens.refreshToken).toBeDefined();

        // Initial verification
        const profileRepo = dataSource.getRepository(ProviderProfile);
        const savedProfile = await profileRepo.findOne({
            where: { user: { id: result.userId } },
            relations: ['user']
        });

        expect(savedProfile).toBeDefined();
        expect(savedProfile?.businessName).toBe('Test Business');
        expect(savedProfile?.user.email).toBe(testEmail);
    }, 60000);
});
