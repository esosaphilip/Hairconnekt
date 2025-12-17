import 'dotenv/config';
import { AppDataSource } from '../database/data-source';
import { User, UserType } from '../modules/users/entities/user.entity';
import { ProviderProfile, BusinessType } from '../modules/providers/entities/provider-profile.entity';
import crypto from 'crypto';

function makeLegacyPbkdf2Hash(plain: string, iterations = 100000) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, iterations, 32, 'sha256').toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const userRepo = AppDataSource.getRepository(User);
    const providerRepo = AppDataSource.getRepository(ProviderProfile);

    const email = 'provider.dev@example.com';
    let user = await userRepo.findOne({ where: { email } });

    if (!user) {
      console.log(`User ${email} not found. Creating new user...`);
      user = userRepo.create({
        email,
        phone: '+491234567890', // Dummy phone
        firstName: 'Dev',
        lastName: 'Provider',
        userType: UserType.PROVIDER,
        passwordHash: makeLegacyPbkdf2Hash('password'),
        emailVerified: true,
        isActive: true,
      });
    } else {
      console.log(`User ${email} found. Resetting password...`);
      user.passwordHash = makeLegacyPbkdf2Hash('password');
      // Ensure user is a provider
      if (user.userType !== UserType.PROVIDER && user.userType !== UserType.BOTH) {
        console.log(`Updating user type from ${user.userType} to PROVIDER`);
        user.userType = UserType.PROVIDER;
      }
    }

    const savedUser = await userRepo.save(user);
    console.log(`User saved with ID: ${savedUser.id}`);

    // Ensure Provider Profile
    let profile = await providerRepo.findOne({ where: { user: { id: savedUser.id } } as any });
    
    if (!profile) {
      console.log('Provider profile not found. Creating default profile...');
      profile = providerRepo.create({
        user: savedUser,
        businessType: BusinessType.INDIVIDUAL,
        bio: 'Dev provider for testing.',
        yearsOfExperience: 2,
        isVerified: true,
        businessName: 'Dev Provider Services',
        cancellationPolicy: 'Flexible',
      });
      await providerRepo.save(profile);
      console.log('Provider profile created.');
    } else {
      console.log(`Provider profile exists with ID: ${profile.id}`);
    }

    console.log('------------------------------------------------');
    console.log('Credentials updated successfully.');
    console.log(`Email: ${email}`);
    console.log('Password: password');
    console.log('------------------------------------------------');

  } catch (error) {
    console.error('Error executing script:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

run();
