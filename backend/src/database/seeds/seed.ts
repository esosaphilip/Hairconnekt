import { AppDataSource } from '../data-source';
import { Repository } from 'typeorm';
import { User, UserType } from '../../modules/users/entities/user.entity';
import {
  ProviderProfile,
  BusinessType,
} from '../../modules/providers/entities/provider-profile.entity';
import { Address } from '../../modules/users/entities/address.entity';
import { ProviderLocation } from '../../modules/providers/entities/provider-location.entity';
import { Service, PriceType } from '../../modules/services/entities/service.entity';
import { ServiceCategory } from '../../modules/services/entities/service-category.entity';
import crypto from 'crypto';
import { seedCategories } from './seed-categories';

function makeLegacyPbkdf2Hash(plain: string, iterations = 100000) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, iterations, 32, 'sha256').toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

async function ensureUser(repo: Repository<User>, fields: Partial<User>) {
  const existing = await repo.findOne({ where: { email: fields.email! } });
  if (existing) {
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
  details: Partial<ProviderProfile>
) {
  // Check if profile exists
  const existing = await repo.findOne({ where: { user: { id: user.id } } as any });
  if (existing) {
    Object.assign(existing, details);
    return repo.save(existing);
  }

  console.log('Inserting profile raw for user ID:', user.id);

  // Construct raw insert
  // Note: we must handle the UUID generation if not default, but usually DB handles DEFAULT gen_random_uuid()
  // We'll trust the database default for ID logic or fetch it back

  const businessType = details.businessType || BusinessType.SALON;
  const yearsOfExperience = details.yearsOfExperience || 5;
  const cancellationPolicy = details.cancellationPolicy || 'Free cancellation up to 24 hours before appointment.';

  const result = await repo.query(`
    INSERT INTO provider_profiles (
      user_id, business_name, business_type, bio, years_of_experience, 
      is_verified, is_mobile_service, advance_booking_days, buffer_time_minutes, cancellation_policy,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    RETURNING id
  `, [
    user.id,
    details.businessName,
    businessType,
    details.bio,
    yearsOfExperience,
    true, // isVerified
    false, // isMobileService
    30, // advanceBookingDays
    15, // bufferTimeMinutes
    cancellationPolicy
  ]);

  const newId = result[0].id;
  return repo.findOneByOrFail({ id: newId });
}

async function ensureAddress(
  repo: Repository<Address>,
  user: User,
  details: Partial<Address>
) {
  // Check if user already has this address
  const existing = await repo.findOne({ where: { user: { id: user.id }, streetAddress: details.streetAddress } as any });
  if (existing) {
    // Update existing with new details (e.g., lat/lon)
    Object.assign(existing, details);
    return repo.save(existing);
  }

  const address = repo.create({
    user,
    label: 'Business',
    country: 'DE',
    isDefault: true,
    ...details,
  });
  return repo.save(address);
}

async function ensureProviderLocation(
  repo: Repository<ProviderLocation>,
  provider: ProviderProfile,
  address: Address
) {
  const existing = await repo.findOne({ where: { provider: { id: provider.id }, address: { id: address.id } } as any });
  if (existing) return existing;

  const loc = repo.create({
    provider,
    address,
    isPrimary: true,
  });
  return repo.save(loc);
}

async function ensureService(
  repo: Repository<Service>,
  provider: ProviderProfile,
  name: string,
  priceCents: number,
  durationMinutes: number,
  categoryName?: string,
  catRepo?: Repository<ServiceCategory>
) {
  const existing = await repo.findOne({ where: { provider: { id: provider.id }, name } as any });
  if (existing) return existing;

  let finalCategoryId = 'cat_haircuts'; // Default
  const inferenceSource = (categoryName || name).toLowerCase();

  if (inferenceSource.includes('braid') || inferenceSource.includes('cornrow') || inferenceSource.includes('rasta') || inferenceSource.includes('dread') || inferenceSource.includes('twist')) {
    finalCategoryId = 'cat_braids';
  } else if (inferenceSource.includes('color') || inferenceSource.includes('farbe') || inferenceSource.includes('strähne') || inferenceSource.includes('coloration') || inferenceSource.includes('balayage')) {
    finalCategoryId = 'cat_color';
  } else if (inferenceSource.includes('cut') || inferenceSource.includes('schnitt') || inferenceSource.includes('shave')) {
    finalCategoryId = 'cat_haircuts';
  } else if (inferenceSource.includes('styling') || inferenceSource.includes('wash') || inferenceSource.includes('fön') || inferenceSource.includes('dry')) {
    finalCategoryId = 'cat_styling';
  } else if (inferenceSource.includes('extension') || inferenceSource.includes('verdichtung')) {
    finalCategoryId = 'cat_extensions';
  } else if (inferenceSource.includes('shave') || inferenceSource.includes('rasur') || inferenceSource.includes('bart')) {
    finalCategoryId = 'cat_beard';
  } else if (inferenceSource.includes('brow') || inferenceSource.includes('lashes') || inferenceSource.includes('kosmetik') || inferenceSource.includes('threading')) {
    finalCategoryId = 'cat_eyebrows_lashes';
  }

  const service = repo.create({
    provider,
    name,
    description: name,
    priceCents,
    durationMinutes,
    priceType: PriceType.FIXED,
    categoryId: finalCategoryId,
    isActive: true,
  });
  return repo.save(service);
}


async function run() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const providerRepo = AppDataSource.getRepository(ProviderProfile);
  const addressRepo = AppDataSource.getRepository(Address);
  const locationRepo = AppDataSource.getRepository(ProviderLocation);
  const serviceRepo = AppDataSource.getRepository(Service);
  const categoryRepo = AppDataSource.getRepository(ServiceCategory);

  // Seed categories
  await seedCategories(AppDataSource);

  // 1. Grace Afro-Hairdressing Salon
  const graceUser = await ensureUser(userRepo, {
    email: 'grace@example.com',
    phone: '+491510000001',
    firstName: 'Grace',
    lastName: 'Salon',
    userType: UserType.PROVIDER,
    passwordHash: makeLegacyPbkdf2Hash('password'),
  });
  const graceProfile = await ensureProviderProfile(providerRepo, graceUser, {
    businessName: 'Grace Afro-Hairdressing Salon',
    bio: 'Spezialisiert auf Afro-Haare und Styling.',
  });
  const graceAddress = await ensureAddress(addressRepo, graceUser, {
    streetAddress: 'Cronenberger Straße 54',
    city: 'Wuppertal',
    postalCode: '42119',
    state: 'NRW',
    latitude: '51.2464',
    longitude: '7.1511',
  });
  await ensureProviderLocation(locationRepo, graceProfile, graceAddress);

  // Services for Grace
  await ensureService(serviceRepo, graceProfile, 'Damen - Afro - Cornrow', 6000, 60);
  await ensureService(serviceRepo, graceProfile, 'Damen - Afro - Farbe & Haarschnitt', 12000, 120);
  await ensureService(serviceRepo, graceProfile, 'Damen - Afro - Haarverdichtung', 15000, 80);
  await ensureService(serviceRepo, graceProfile, 'Mädchen - Haarschnitt', 2500, 20);
  await ensureService(serviceRepo, graceProfile, 'Damen - Afro - Farbe', 8000, 70);


  // 2. Power of Hair
  const powerUser = await ensureUser(userRepo, {
    email: 'powerofhair@example.com',
    phone: '+491510000002',
    firstName: 'Power',
    lastName: 'Hair',
    userType: UserType.PROVIDER,
    passwordHash: makeLegacyPbkdf2Hash('password'),
  });
  const powerProfile = await ensureProviderProfile(providerRepo, powerUser, {
    businessName: 'Power of Hair',
    bio: 'Ihr Experte für Farben und Schnitte in Barmen.',
  });
  const powerAddress = await ensureAddress(addressRepo, powerUser, {
    streetAddress: 'Heubruch 23',
    city: 'Wuppertal',
    postalCode: '42275',
    state: 'Barmen',
    latitude: '51.2721',
    longitude: '7.1953',
  });
  await ensureProviderLocation(locationRepo, powerProfile, powerAddress);

  // Services for Power of Hair
  await ensureService(serviceRepo, powerProfile, 'Farbsträhnen', 7500, 90);
  await ensureService(serviceRepo, powerProfile, 'Damen - Haarschnitt & Styling', 5500, 60);
  await ensureService(serviceRepo, powerProfile, 'Herren - Haarschnitt', 3500, 30);
  await ensureService(serviceRepo, powerProfile, 'Balayage', 14000, 180);
  await ensureService(serviceRepo, powerProfile, 'Kosmetik', 4500, 45);


  // 3. Afro-Europashop New World
  const afroUser = await ensureUser(userRepo, {
    email: 'afroworld@example.com',
    phone: '020239320257',
    firstName: 'Afro',
    lastName: 'World',
    userType: UserType.PROVIDER,
    passwordHash: makeLegacyPbkdf2Hash('password'),
  });
  const afroProfile = await ensureProviderProfile(providerRepo, afroUser, {
    businessName: 'Afro-Europashop New World',
    bio: 'African goods store & Hair styling.',
  });
  const afroAddress = await ensureAddress(addressRepo, afroUser, {
    streetAddress: 'Hochstraße 88',
    city: 'Wuppertal',
    postalCode: '42105',
    state: 'NRW',
    latitude: '51.2589',
    longitude: '7.1322',
  });
  await ensureProviderLocation(locationRepo, afroProfile, afroAddress);

  // Services for Afro-Europashop
  await ensureService(serviceRepo, afroProfile, 'Rastazöpfe', 10000, 120);
  await ensureService(serviceRepo, afroProfile, 'Cornrows', 6000, 60);
  await ensureService(serviceRepo, afroProfile, 'Dreadlocks', 15000, 180);
  await ensureService(serviceRepo, afroProfile, 'Openbraids', 12000, 150);
  await ensureService(serviceRepo, afroProfile, 'Twist', 11000, 140);


  // 4. Black Beauty Friseursalon
  const beautyUser = await ensureUser(userRepo, {
    email: 'blackbeauty@example.com',
    phone: '+491510000004',
    firstName: 'Black',
    lastName: 'Beauty',
    userType: UserType.PROVIDER,
    passwordHash: makeLegacyPbkdf2Hash('password'),
  });
  const beautyProfile = await ensureProviderProfile(providerRepo, beautyUser, {
    businessName: 'Black Beauty Friseursalon',
    bio: 'Damen und Herren Salon. Specializing in beauty treatments.',
  });
  const beautyAddress = await ensureAddress(addressRepo, beautyUser, {
    streetAddress: 'Klotzbahn 9',
    city: 'Wuppertal',
    postalCode: '42105',
    state: 'NRW',
    latitude: '51.2562',
    longitude: '7.1475',
  });
  await ensureProviderLocation(locationRepo, beautyProfile, beautyAddress);

  // Services for Black Beauty
  await ensureService(serviceRepo, beautyProfile, 'Eyebrow threading', 1500, 15);
  await ensureService(serviceRepo, beautyProfile, 'Hair colouring', 8000, 90);
  await ensureService(serviceRepo, beautyProfile, 'Hairstyling', 5000, 45);
  await ensureService(serviceRepo, beautyProfile, 'Hair extensions', 20000, 180);
  await ensureService(serviceRepo, beautyProfile, 'Microblading', 25000, 120);


  // Clients
  const client1 = await ensureUser(userRepo, {
    email: 'testclient1@example.com',
    phone: '+491700000001',
    firstName: 'Test',
    lastName: 'Client One',
    userType: UserType.CLIENT,
    passwordHash: makeLegacyPbkdf2Hash('password'),
  });

  const client2 = await ensureUser(userRepo, {
    email: 'testclient2@example.com',
    phone: '+491700000002',
    firstName: 'Test',
    lastName: 'Client Two',
    userType: UserType.CLIENT,
    passwordHash: makeLegacyPbkdf2Hash('password'),
  });

  console.log('Seeded successfully!');
  console.log('Providers:');
  console.log('  grace@example.com / password');
  console.log('  powerofhair@example.com / password');
  console.log('  afroworld@example.com / password');
  console.log('  blackbeauty@example.com / password');
  console.log('Clients:');
  console.log('  testclient1@example.com / password');
  console.log('  testclient2@example.com / password');

  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});