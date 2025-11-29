import { AppDataSource } from '../data-source';
import { Repository } from 'typeorm';
import { User, UserType } from '../../modules/users/entities/user.entity';
import {
  ProviderProfile,
  BusinessType,
} from '../../modules/providers/entities/provider-profile.entity';
import crypto from 'crypto';

function makeLegacyPbkdf2Hash(plain: string, iterations = 100000) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, iterations, 32, 'sha256').toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

async function ensureUser(repo: Repository<User>, fields: Partial<User>) {
  const existing = await repo.findOne({ where: { email: fields.email! } });
  if (existing) {
    // If a passwordHash is provided, update existing user to make login possible in dev
    if (fields.passwordHash && fields.passwordHash !== existing.passwordHash) {
      existing.passwordHash = fields.passwordHash;
      return repo.save(existing);
    }
    return existing;
  }
  const user = repo.create({
    email: fields.email!,
    phone: fields.phone!,
    passwordHash: fields.passwordHash || makeLegacyPbkdf2Hash('password'),
    firstName: fields.firstName || 'Seed',
    lastName: fields.lastName || 'User',
    userType: fields.userType || UserType.CLIENT,
  });
  return repo.save(user);
}

async function ensureProviderProfile(
  repo: Repository<ProviderProfile>,
  user: User,
) {
  const existing = await repo.findOne({ where: { user: { id: user.id } } as any });
  if (existing) return existing;
  const provider = repo.create({
    user,
    businessType: BusinessType.INDIVIDUAL,
    bio: 'Experienced stylist offering quality hair services.',
    yearsOfExperience: 5,
    isVerified: false,
    isMobileService: false,
    advanceBookingDays: 30,
    bufferTimeMinutes: 15,
    cancellationPolicy: 'Free cancellation up to 24 hours before appointment.',
  });
  return repo.save(provider);
}

async function run() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const providerRepo = AppDataSource.getRepository(ProviderProfile);

  // Ensure a provider user and profile
  const providerUser = await ensureUser(userRepo, {
    email: 'provider1@example.com',
    phone: '+491111111111',
    firstName: 'Pat',
    lastName: 'Provider',
    userType: UserType.PROVIDER,
    passwordHash: makeLegacyPbkdf2Hash('password'),
  });
  const providerProfile = await ensureProviderProfile(providerRepo, providerUser);

  // Ensure a client user
  const clientUser = await ensureUser(userRepo, {
    email: 'client1@example.com',
    phone: '+492222222222',
    firstName: 'Casey',
    lastName: 'Client',
    userType: UserType.CLIENT,
    passwordHash: makeLegacyPbkdf2Hash('password'),
  });

  console.log('Seeded data:');
  console.log('  providerUserId:', providerUser.id);
  console.log('  providerProfileId:', providerProfile.id);
  console.log('  clientUserId:', clientUser.id);
  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});