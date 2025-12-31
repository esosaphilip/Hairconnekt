
import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../src/app.module'; // Remove static import
import { UsersService } from '../src/modules/users/users.service';
import { DataSource } from 'typeorm';
import { Address } from '../src/modules/users/entities/address.entity';
import { User } from '../src/modules/users/entities/user.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars and FORCE set them for validation bypass
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('DOTENV Error:', result.error);
}

// Manually set required vars if missing
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dummy_access';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dummy_refresh';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USERNAME = process.env.DB_USERNAME || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
process.env.DB_DATABASE = process.env.DB_DATABASE || 'hairconnekt';

console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET); // Debug log
console.log('DB_DATABASE:', process.env.DB_DATABASE); // Debug log

async function run() {
    // Dynamic import to ensure env vars are set first
    const { AppModule } = await import('../src/app.module');
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const dataSource = app.get(DataSource);
    const addressRepo = dataSource.getRepository(Address);
    const userRepo = dataSource.getRepository(User);

    try {
        console.log('--- Starting Address API Verification ---');

        // 1. Get a test user
        const user = await userRepo.findOne({ where: {} });
        if (!user) {
            console.error('No users found to test with.');
            return;
        }
        console.log(`Testing with User: ${user.id} (${user.email})`);

        // 2. Create a test address manually
        const newAddress = new Address();
        newAddress.user = user;
        newAddress.label = 'Test Address ' + Date.now();
        newAddress.streetAddress = 'Test Road 123';
        newAddress.city = 'Test City';
        newAddress.postalCode = '12345';
        newAddress.state = 'Test State';
        newAddress.country = 'DE';
        newAddress.isDefault = false; // Start as non-default

        const savedAddress = await addressRepo.save(newAddress);
        console.log(`Created test address: ${savedAddress.id} (${savedAddress.label})`);

        // 3. Test getAddresses
        console.log('Testing getAddresses...');
        const list = await usersService.getAddresses(user.id);
        const found = list.find(a => a.id === savedAddress.id);
        if (found) {
            console.log('SUCCESS: Address found in list.');
        } else {
            console.error('FAIL: Address NOT found in list.');
        }

        // 4. Test setDefaultAddress
        console.log('Testing setDefaultAddress...');
        await usersService.setDefaultAddress(user.id, savedAddress.id);

        // Verify in DB
        const reloaded = await addressRepo.findOne({ where: { id: savedAddress.id } });
        if (reloaded?.isDefault) {
            console.log('SUCCESS: Address is now default.');
        } else {
            console.error('FAIL: Address was NOT set to default.');
        }

        // 5. Test deleteAddress
        console.log('Testing deleteAddress...');
        await usersService.deleteAddress(user.id, savedAddress.id);

        const deleted = await addressRepo.findOne({ where: { id: savedAddress.id } });
        if (!deleted) {
            console.log('SUCCESS: Address deleted.');
        } else {
            console.error('FAIL: Address still exists in DB.');
        }

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await app.close();
    }
}

run();
