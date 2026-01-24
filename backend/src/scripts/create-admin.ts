import 'dotenv/config';
import { AppDataSource } from '../database/data-source';
import { User, UserType } from '../modules/users/entities/user.entity';
import crypto from 'crypto';

function makeLegacyPbkdf2Hash(plain: string, iterations = 100000) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(plain, salt, iterations, 32, 'sha256').toString('hex');
    return `pbkdf2$${iterations}$${salt}$${hash}`;
}

async function run() {
    try {
        console.log('Connecting to database...');
        await AppDataSource.initialize();
        console.log('Database connected.');

        const userRepo = AppDataSource.getRepository(User);
        const email = 'admin@hairconnekt.com';
        const password = 'password123'; // Default password

        let user = await userRepo.findOne({ where: { email } });

        if (!user) {
            console.log(`Admin user ${email} not found. Creating...`);
            user = userRepo.create({
                email,
                phone: '+00000000000', // Dummy phone for admin
                firstName: 'System',
                lastName: 'Admin',
                userType: UserType.ADMIN,
                passwordHash: makeLegacyPbkdf2Hash(password),
                emailVerified: true,
                phoneVerified: true,
                isActive: true,
            });
        } else {
            console.log(`Admin user ${email} found. Resetting password...`);
            user.passwordHash = makeLegacyPbkdf2Hash(password);
            user.userType = UserType.ADMIN; // Ensure admin rights
            user.isActive = true;
        }

        const savedUser = await userRepo.save(user);

        console.log('------------------------------------------------');
        console.log('✅ Admin User Ready');
        console.log(`Email: ${savedUser.email}`);
        console.log(`Password: ${password}`);
        console.log(`User ID: ${savedUser.id}`);
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('Error executing script:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(0);
    }
}

run();
