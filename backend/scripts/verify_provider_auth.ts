
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';
import { VerificationChannel } from '../src/modules/auth/entities/verification-code.entity';
import { DataSource } from 'typeorm';
import { User, UserType } from '../src/modules/users/entities/user.entity';

async function bootstrap() {
    process.env.DEV_VERIFICATION_BYPASS = 'true'; // Force enable for this script test

    // Create detailed logger to capture AuthService logs
    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log', 'debug'] });
    const authService = app.get(AuthService);
    const dataSource = app.get(DataSource);

    console.log('--- ENV CHECK ---');
    console.log(`NODE_ENV: '${process.env.NODE_ENV}'`);
    console.log(`DEV_VERIFICATION_BYPASS: '${process.env.DEV_VERIFICATION_BYPASS}'`);

    console.log('--- STARTING PROVIDER VERIFICATION BYPASS CHECK ---');

    try {
        const userRepo = dataSource.getRepository(User);

        // 1. Create or Get a Provider User
        const testEmail = `provider.authtest.${Date.now()}@example.com`;
        const rawPhone = `+49151${Math.floor(Math.random() * 1000000000)}`;
        const testPhone = rawPhone.replace(/\D/g, ''); // Sanitize manually for DB match

        console.log(`Creating test provider: ${testEmail} / ${testPhone} (from ${rawPhone})`);

        const user = userRepo.create({
            email: testEmail,
            phone: testPhone,
            firstName: 'AuthTest',
            lastName: 'Provider',
            userType: UserType.PROVIDER,
            passwordHash: '$argon2id$v=19$m=4096,t=3,p=1$SALT$HASH', // dummy hash
            emailVerified: false,
            phoneVerified: false,
            isActive: true,
            notificationPreferences: { push: true, email: true, sms: false },
            preferredLanguage: 'de'
        });

        const savedUser = await userRepo.save(user);
        console.log(`✅ Created Provider: ID=${savedUser.id}`);

        // 2. Test Phone Verification with 000000
        console.log(`Attempting verifyPhone with code '000000'...`);

        try {
            const result = await authService.verifyPhone({
                phone: testPhone,
                code: '000000'
            });
            console.log('✅ verifyPhone Result:', result);
        } catch (e: any) {
            console.error('❌ verifyPhone FAILED:', e.message);
            if (e.response) console.error('   Details:', e.response);
        }

        // 3. Test Email Verification with 000000
        console.log(`Attempting verifyEmail with code '000000'...`);
        try {
            const result = await authService.verifyEmail({
                email: testEmail,
                code: '000000'
            });
            console.log('✅ verifyEmail Result:', result);
        } catch (e: any) {
            console.error('❌ verifyEmail FAILED:', e.message);
        }

        // 4. Verify DB State
        const finalUser = await userRepo.findOne({ where: { id: savedUser.id } });
        console.log('--- DB STATE ---');
        console.log(`Email Verified: ${finalUser?.emailVerified}`);
        console.log(`Phone Verified: ${finalUser?.phoneVerified}`);

        if (finalUser?.emailVerified && finalUser?.phoneVerified) {
            console.log('✅ SUCCESS: Provider verified successfully via bypass.');
        } else {
            console.log('❌ FAILURE: Provider NOT fully verified.');
        }

    } catch (error) {
        console.error('❌ An error occurred:', error);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
