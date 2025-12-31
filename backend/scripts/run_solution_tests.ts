
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProvidersService } from '../src/modules/providers/providers.service';
import { SearchService } from '../src/modules/search/search.service';
import { DataSource } from 'typeorm';
import { User, UserType } from '../src/modules/users/entities/user.entity';
import { Service } from '../src/modules/services/entities/service.entity';
import { ProviderProfile } from '../src/modules/providers/entities/provider-profile.entity';
import { Address } from '../src/modules/users/entities/address.entity';

async function runTests() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const providersService = app.get(ProvidersService);
    const searchService = app.get(SearchService);
    const dataSource = app.get(DataSource);
    const userRepo = dataSource.getRepository(User);
    const providerRepo = dataSource.getRepository(ProviderProfile);
    const serviceRepo = dataSource.getRepository(Service);
    const addressRepo = dataSource.getRepository(Address);

    console.log('--- STARTING SOLUTION VERIFICATION TESTS ---\n');

    // Helper to get or create a provider
    const ensureProvider = async (email: string, name: string, lat: number, lon: number) => {
        let existingUser = await userRepo.findOne({ where: { email } });
        let finalUser: User;
        if (!existingUser) {
            const newUser = new User();
            newUser.email = email;
            newUser.passwordHash = 'hashed_password_placeholder';
            newUser.phone = `+49123456789${Math.floor(Math.random() * 10000)}`;
            newUser.firstName = name;
            newUser.lastName = 'Test';
            newUser.userType = UserType.PROVIDER;
            newUser.emailVerified = true;
            finalUser = await userRepo.save(newUser);
        } else {
            finalUser = existingUser;
        }

        let existingProvider = await providerRepo.findOne({ where: { user: { id: finalUser.id } } });
        if (!existingProvider) {
            console.log(`Creating provider for user ${finalUser.id} (RAW SQL)`);
            const res = await dataSource.query(`
            INSERT INTO provider_profiles (
                user_id, business_name, is_verified, accepts_same_day_booking, 
                business_type, bio, cancellation_policy, 
                updated_at, created_at, years_of_experience, 
                advance_booking_days, buffer_time_minutes, 
                stripe_payouts_enabled, is_mobile_service
            )
            VALUES ($1, $2, $3, $4, 'INDIVIDUAL', '', '', NOW(), NOW(), 0, 30, 15, false, false)
            RETURNING id
        `, [finalUser.id, `${name}'s Studio`, true, true]);

            const pid = res[0].id;
            existingProvider = await providerRepo.findOne({ where: { id: pid } });
        }

        await providersService.updateAddress(finalUser.id, {
            street: 'Test Str',
            houseNumber: '1',
            postalCode: '10115',
            city: 'Berlin',
            state: 'Berlin',
            showOnMap: true
        });

        // Manually force coords
        const addresses = await addressRepo.find({ where: { user: { id: finalUser.id } } });
        if (addresses.length > 0) {
            const addr = addresses[0];
            addr.latitude = String(lat);
            addr.longitude = String(lon);
            await addressRepo.save(addr);
        }

        return { user: finalUser, provider: existingProvider! };
    };

    // 1. BRAIDERS DISCOVERY TEST
    console.log('[1] Braiders Discovery Test');
    try {
        await ensureProvider('p1@test.com', 'ProviderOne', 52.5200, 13.4050);
        await ensureProvider('p2@test.com', 'ProviderTwo', 52.5210, 13.4060);
        await ensureProvider('p3@test.com', 'ProviderThree', 52.5100, 13.4000);

        console.log(' -> Searching nearby (Berlin center)...');
        const nearby = await providersService.getNearbyProviders({ lat: 52.5200, lon: 13.4050, radiusKm: 10 });
        console.log(` -> Found ${nearby.items.length} providers (Expect >= 3)`);

        const foundIds = nearby.items.map(i => i.name);
        if (nearby.items.length < 3) console.warn('WARNING: Found fewer than 3 providers. Found:', foundIds);
        else console.log(' -> SUCCESS: Found providers:', foundIds);

    } catch (e) {
        console.error('FAILED Discovery Test', e);
    }

    // 2. BELIEBTE STYLES (Strict Taxonomy)
    console.log('\n[2] Gallery / Strict Taxonomy Test');
    try {
        const { user, provider } = await ensureProvider('braider@test.com', 'BraiderJane', 52.52, 13.40);

        const catId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

        const catRepo = dataSource.getRepository('ServiceCategory');
        let cat = await catRepo.findOne({ where: { slug: 'braids' } });
        if (!cat) {
            console.log(' -> Creating missing category "braids" for test...');
            await catRepo.save({
                id: catId,
                slug: 'braids',
                name: 'Braids',
                nameDe: 'Braids',
                isActive: true,
                displayOrder: 1
            });
            cat = await catRepo.findOne({ where: { slug: 'braids' } });
        }

        const effectiveCatId = cat!.id;

        let s = await serviceRepo.findOne({ where: { provider: { id: provider.id }, name: 'Test Braids' } });
        if (!s) {
            s = Service.create(provider, 'Test Braids', 'Nice braids', 120, 5000, 'fixed' as any, effectiveCatId, undefined, 'http://img.com/braids.jpg');
            await serviceRepo.save(s);
        } else {
            s.categoryId = effectiveCatId;
            s.isActive = true;
            await serviceRepo.save(s);
        }

        console.log(' -> Searching for category: "braids" (slug)...');
        const catResults = await searchService.search({ category: 'braids' } as any);
        console.log(` -> Found ${catResults.results.length} results for 'braids'.`);

        const hasBraider = catResults.results.some(r => r.id === provider.id);
        if (hasBraider) console.log(' -> SUCCESS: Braider found via strict category slug.');
        else console.warn(' -> FAIL: Braider NOT found via category filter.');

    } catch (e) {
        console.error('FAILED Gallery Test', e);
    }

    // 4. PERSISTENCE
    console.log('\n[4] Persistence Test');
    try {
        const { provider } = await ensureProvider('persist@test.com', 'PersistProvider', 52, 13);

        const testImgUrl = 'https://firebase.storage/test-image.jpg';
        const s = Service.create(provider, 'Persist Service', 'desc', 60, 1000, 'fixed' as any, 'cat_natural', undefined, testImgUrl);
        const saved = await serviceRepo.save(s);

        console.log(' -> Saved service with Image URL.');

        const loaded = await serviceRepo.findOne({ where: { id: saved.id } });
        if (loaded?.imageUrl === testImgUrl) {
            console.log(' -> SUCCESS: Image URL persisted correctly in DB.');
        } else {
            console.error(' -> FAIL: Image URL not persisted. Got:', loaded?.imageUrl);
        }

    } catch (e) {
        console.error('FAILED Persistence Test', e);
    }

    await app.close();
    process.exit(0);
}

runTests();
