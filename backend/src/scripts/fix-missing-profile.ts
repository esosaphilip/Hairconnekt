import 'dotenv/config';
import { AppDataSource } from '../database/data-source';
import { User, UserType } from '../modules/users/entities/user.entity';
import { ProviderProfile, BusinessType } from '../modules/providers/entities/provider-profile.entity';

async function run() {
  try {
    console.log('Connecting to database...');
    console.log(`DB Host: ${process.env.DATABASE_HOST}`);
    console.log(`DB User: ${process.env.DATABASE_USER}`);
    
    await AppDataSource.initialize();
    console.log('Database connected successfully.');

    const userRepo = AppDataSource.getRepository(User);
    const providerRepo = AppDataSource.getRepository(ProviderProfile);

    // 1. Find the user
    const email = 'provider.dev@example.com';
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      console.error(`❌ CRITICAL: User ${email} NOT FOUND in this database!`);
      process.exit(1);
    }

    console.log(`✅ User found: ${user.id} (${user.email})`);
    console.log(`   User Type: ${user.userType}`);

    // 2. Check for existing profile
    const existingProfile = await providerRepo.findOne({ where: { user: { id: user.id } } as any });

    if (existingProfile) {
      console.log(`⚠️ Profile already exists with ID: ${existingProfile.id}`);
      // If the user insists it's null in their view, maybe we should update it to be sure?
      // For now, let's just log it.
    } else {
      console.log('⚠️ Profile NOT found. Creating new profile...');
      
      const newProfile = providerRepo.create({
        user: user,
        businessName: 'Dev Studio',
        businessType: BusinessType.SALON,
        bio: 'Some description',
        // Default required fields
        yearsOfExperience: 5,
        isVerified: true,
        isMobileService: false,
        acceptsSameDayBooking: true,
        advanceBookingDays: 30,
        bufferTimeMinutes: 15,
        cancellationPolicy: 'Flexible',
        stripePayoutsEnabled: false
      });

      const saved = await providerRepo.save(newProfile);
      console.log(`✅ NEW Profile created with ID: ${saved.id}`);
    }

    // 3. Double check the link
    const check = await providerRepo.findOne({ 
      where: { user: { id: user.id } } as any,
      relations: ['user']
    });
    
    if (check) {
      console.log(`\nVERIFICATION: Profile ${check.id} is linked to User ${check.user.id}`);
    } else {
      console.error('\n❌ VERIFICATION FAILED: Profile still not found after save attempt.');
    }

  } catch (error) {
    console.error('Error executing script:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

run();
