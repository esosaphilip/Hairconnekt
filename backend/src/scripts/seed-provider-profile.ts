import 'dotenv/config';
import { AppDataSource } from '../database/data-source';
import { Repository } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { ProviderProfile, BusinessType } from '../modules/providers/entities/provider-profile.entity';

async function main() {
  const email = process.argv[2] || process.env.SEED_PROVIDER_EMAIL || 'provider2@example.com';
  await AppDataSource.initialize();
  const usersRepo: Repository<User> = AppDataSource.getRepository(User);
  const providersRepo: Repository<ProviderProfile> = AppDataSource.getRepository(ProviderProfile);

  const user = await usersRepo.findOne({ where: { email } });
  if (!user) {
    console.error(`User not found for email ${email}. Please register a PROVIDER user first.`);
    process.exit(1);
  }

  // Check if profile exists
  let profile = await providersRepo.findOne({ where: { user: { id: user.id } } as any });
  if (profile) {
    console.log(`Provider profile already exists: ${profile.id} for user ${user.id}`);
    process.exit(0);
  }

  // Minimal required fields
  profile = providersRepo.create({
    user: { id: user.id } as any,
    businessName: 'Test Salon',
    businessType: BusinessType.SALON,
    bio: 'Experienced stylist offering a range of hair services.',
    yearsOfExperience: 5,
    coverPhotoUrl: null,
    isVerified: false,
    isMobileService: false,
    serviceRadiusKm: null,
    acceptsSameDayBooking: false,
    advanceBookingDays: 30,
    bufferTimeMinutes: 15,
    cancellationPolicy: 'Free cancellation up to 24 hours before appointment.',
    verificationSubmittedAt: null,
    verifiedAt: null,
  });
  const saved = await providersRepo.save(profile);
  console.log(`Seeded provider profile ${saved.id} for user ${user.id} (${email})`);
  await AppDataSource.destroy();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await AppDataSource.destroy();
  } catch {}
  process.exit(1);
});
