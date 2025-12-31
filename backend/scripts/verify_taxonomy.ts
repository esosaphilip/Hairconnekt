
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ServicesService } from '../src/modules/services/services.service';
import { DataSource } from 'typeorm';
import { ProviderProfile } from '../src/modules/providers/entities/provider-profile.entity';
import { PriceType } from '../src/modules/services/entities/service.entity';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
    const servicesService = app.get(ServicesService);
    const dataSource = app.get(DataSource);

    console.log('--- STARTING TAXONOMY PERSISTENCE VERIFICATION ---');

    try {
        // 1. Find a valid Provider
        const providerRepo = dataSource.getRepository(ProviderProfile);
        const provider = await providerRepo.findOne({
            where: {},
            relations: ['user']
        });

        if (!provider) {
            console.error('❌ No provider profiles found in DB.');
            process.exit(1);
        }
        console.log(`✅ Found Provider: ID=${provider.id}`);

        // 2. Create a Service with String Category ID and Tags
        const testServiceName = `Taxonomy Test Service ${Date.now()}`;
        const testCategoryId = 'cat_braids';
        const testTags = ['Knotless', 'Box'];

        console.log(`Attempting to create service: "${testServiceName}"`);
        console.log(`   Category ID: ${testCategoryId}`);
        console.log(`   Tags: ${testTags.join(', ')}`);

        // Using 'any' because strict DTO might not be updated in this script context if we imported it
        // But servicesService.create takes Partial<Service> usually or strict DTO
        // We'll pass the object matching the interface we expect
        const createdService = await servicesService.create(provider.id, {
            name: testServiceName,
            categoryId: testCategoryId, // This is now a string!
            tags: testTags, // This is our new column
            description: 'Taxonomy test',
            durationMinutes: 60,
            priceCents: 8000,
            priceType: PriceType.FIXED,
            isActive: true,
            allowOnlineBooking: true
        } as any);

        console.log('✅ Service creation call returned success.');
        console.log(`   Created ID: ${createdService.id}`);

        // 3. Verify Persistence in DB
        const serviceRepo = dataSource.getRepository('Service');
        const fetchedService: any = await serviceRepo.findOne({
            where: { id: createdService.id }
        });

        if (!fetchedService) {
            console.error('❌ CRITICAL FAILURE: Service not found in DB!');
            process.exit(1);
        }

        console.log('--- DB VERIFICATION RESULTS ---');
        console.log(`DB ID: ${fetchedService.id}`);
        console.log(`DB Name: ${fetchedService.name}`);
        console.log(`DB Category ID: ${fetchedService.categoryId}`);
        console.log(`DB Tags: ${fetchedService.tags}`);

        const catMatch = fetchedService.categoryId === testCategoryId;
        const tagMatch = Array.isArray(fetchedService.tags) &&
            fetchedService.tags.length === 2 &&
            fetchedService.tags.includes('Knotless');

        if (catMatch && tagMatch) {
            console.log('✅ SUCCESS: String Category ID and Tags persisted correctly.');
        } else {
            console.error(`❌ FAILURE: Data mismatch.`);
            console.error(`   Category Match: ${catMatch}`);
            console.error(`   Tags Match: ${tagMatch}`);
        }

    } catch (error) {
        console.error('❌ An error occurred:', error);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
