import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { IProviderRepository } from '../../domain/repositories/IProviderRepository';
import { ProviderProfile } from './entities/provider-profile.entity';
import { ProviderAvailability } from './entities/provider-availability.entity';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { AvailabilityDto } from './dto/availability.dto';
import { UpdateBioDto } from './dto/update-bio.dto';
import { UpdateSpecializationsDto } from './dto/update-specializations.dto';
import { UpdateLanguagesDto } from './dto/update-languages.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { AppCacheService } from '../cache/cache.service';
import { StorageService } from '../storage/storage.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Address } from '../users/entities/address.entity';
import { ProviderLocation } from './entities/provider-location.entity';

import { ProviderCertification } from './entities/provider-certification.entity';

import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { ProviderTimeOff } from './entities/provider-time-off.entity';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Service } from '../services/entities/service.entity';
import { Review } from '../reviews/entities/review.entity';
import { PortfolioImage } from '../portfolio/entities/portfolio-image.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @Inject('IProviderRepository')
    private readonly providerRepo: IProviderRepository,
    private readonly cache: AppCacheService,
    private readonly storage: StorageService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ProviderProfile)
    private readonly providerEntityRepo: Repository<ProviderProfile>,
    @InjectRepository(ProviderTimeOff)
    private readonly timeOffRepo: Repository<ProviderTimeOff>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(ProviderLocation)
    private readonly locationRepo: Repository<ProviderLocation>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(PortfolioImage)
    private readonly portfolioRepo: Repository<PortfolioImage>,
  ) { }

  /**
   * Update provider bio with sanitization
   */
  async updateBio(userId: string, dto: UpdateBioDto) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    provider.updateBio(dto);
    await this.providerRepo.save(provider);

    await this.invalidateProviderCache(provider.id, userId);
    return { bio: provider.bio };
  }

  /**
   * Update specializations (Transactional: Clear & Sync)
   */
  async updateSpecializations(userId: string, dto: UpdateSpecializationsDto) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    await this.providerRepo.updateSpecializations(provider.id, dto.specializations);

    await this.invalidateProviderCache(provider.id, userId);
    return { specializations: dto.specializations };
  }

  /**
   * Update provider address (Business Location)
   */
  async updateAddress(userId: string, dto: UpdateAddressDto) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    // Find existing primary location
    const existingLocation = await this.locationRepo.findOne({
      where: { provider: { id: provider.id }, isPrimary: true },
      relations: ['address'],
    });

    let address: Address;

    if (existingLocation && existingLocation.address) {
      address = existingLocation.address;
    } else {
      address = new Address();
      address.user = provider.user;
      address.label = 'Business';
      address.country = 'DE'; // Default
      address.isDefault = true;
    }

    // Update fields
    address.streetAddress = `${dto.street} ${dto.houseNumber}`.trim();
    address.city = dto.city;
    address.postalCode = dto.postalCode;
    address.state = dto.state;
    // Map usage logic: Geocode the address
    const fullAddress = `${dto.street} ${dto.houseNumber}, ${dto.postalCode} ${dto.city}, ${address.country}`;
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const encodedAddr = encodeURIComponent(fullAddress);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddr}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.results?.length > 0) {
          const loc = data.results[0].geometry.location;
          address.latitude = loc.lat;
          address.longitude = loc.lng;
          console.log(`[ProvidersService] Geocoded address '${fullAddress}' to (${loc.lat}, ${loc.lng})`);
        } else {
          console.warn(`[ProvidersService] Geocoding failed for '${fullAddress}': ${data.status}`);
        }
      } catch (error) {
        console.error('[ProvidersService] Geocoding error:', error);
      }
    } else {
      console.warn('[ProvidersService] GOOGLE_MAPS_API_KEY not set. Skipping geocoding.');
    }

    const savedAddress = await this.addressRepo.save(address);

    if (!existingLocation) {
      const location = new ProviderLocation();
      location.provider = provider;
      location.address = savedAddress;
      location.isPrimary = true;
      await this.locationRepo.save(location);
    }

    await this.invalidateProviderCache(provider.id, userId);

    return {
      street: dto.street,
      houseNumber: dto.houseNumber,
      postalCode: dto.postalCode,
      city: dto.city,
      state: dto.state,
      showOnMap: dto.showOnMap
    };
  }

  /**
   * Update languages (Transactional: Clear & Sync)
   */
  async updateLanguages(userId: string, dto: UpdateLanguagesDto) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    await this.providerRepo.updateLanguages(provider.id, dto.languages);

    await this.invalidateProviderCache(provider.id, userId);
    return { languages: dto.languages };
  }

  /**
   * Update social media links
   */
  async updateSocialMedia(userId: string, dto: UpdateSocialMediaDto) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    provider.updateSocialMedia(dto);

    await this.providerRepo.save(provider);
    await this.invalidateProviderCache(provider.id, userId);

    return {
      website: provider.website,
      instagram: provider.instagram,
      facebook: provider.facebook,
      twitter: provider.twitter,
      youtube: provider.youtube,
      linkedin: provider.linkedin,
    };
  }

  /**
   * Get all certifications
   */
  async getCertifications(userId: string) {
    // We can rely on findByUserId loading relations if IProviderRepository specifies it, 
    // or we can add getCertifications to the repo. 
    // TypeORMProviderRepository.findByUserId loads 'certifications'.
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');
    return provider.certifications || [];
  }

  /**
   * Add a new certification
   */
  async addCertification(userId: string, dto: CreateCertificationDto) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    provider.canAddCertification();

    const cert = new ProviderCertification();
    cert.provider = provider;
    cert.title = dto.title;
    cert.institution = dto.institution;
    cert.year = dto.year;

    const saved = await this.providerRepo.saveCertification(cert);

    await this.invalidateProviderCache(provider.id, userId);
    return saved;
  }

  /**
   * Remove a certification
   */
  async removeCertification(userId: string, certId: string) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    const cert = await this.providerRepo.findCertificationById(certId);

    if (!cert) throw new NotFoundException('Zertifikat nicht gefunden');
    if (cert.provider.id !== provider.id) {
      throw new ForbiddenException('Keine Berechtigung für diese Aktion');
    }

    await this.providerRepo.removeCertification(cert);
    await this.invalidateProviderCache(provider.id, userId);
    return { success: true };
  }

  /**
   * Helper to invalidate caches after profile updates
   */
  private async invalidateProviderCache(providerId: string, userId: string) {
    await this.cache.del(`providers:public:${providerId}`);
    await this.cache.deleteByPrefix('providers:nearby');
    await this.cache.del(`providers:dashboard:user:${userId}`);
    await this.cache.del(`providers:me:user:${userId}`);
  }

  /**
   * Update basic provider profile information for the current user
   */
  async updateProfile(userId: string, dto: UpdateProviderDto) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    provider.updateDetails(dto);

    const saved = await this.providerRepo.save(provider);
    // Invalidate public profile and nearby caches, as well as per-user dashboard/me caches
    await this.cache.del(`providers:public:${saved.id}`);
    await this.cache.deleteByPrefix('providers:nearby');
    const uid = userId;
    await this.cache.del(`providers:dashboard:user:${uid}`);
    await this.cache.del(`providers:me:user:${uid}`);
    return this.sanitizeProvider(saved);
  }

  /**
   * Upload and update profile picture
   */
  async uploadProfilePicture(userId: string, file: any) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    if (!file?.buffer || !file?.originalname) {
      throw new BadRequestException('Image file is required');
    }

    // Upload to storage
    const { url } = await this.storage.uploadImage(provider.id, file.buffer, file.originalname);

    // Update User entity (primary profile picture)
    if (provider.user) {
      await this.userRepo.update(provider.user.id, { profilePictureUrl: url });
    }

    // Update Provider entity (cover/business photo - optional, but good for sync)
    // Decide if we want to overwrite cover photo or not. 
    // Usually "Profile Picture" = User Avatar, "Cover Photo" = Banner.
    // ProviderProfileScreen seems to try both.
    // Let's stick to updating User profile picture primarily.

    // Invalidate caches
    await this.invalidateProviderCache(provider.id, userId);

    return {
      success: true,
      profilePictureUrl: url
    };
  }

  /**
   * Get availability settings including schedule and booking rules
   */
  async getAvailabilitySettings(userId: string) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    const availability = provider.availability || [];
    const weeklySchedule: Record<string, any> = {};

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    days.forEach((day, index) => {
      const daySlots = availability.filter((a) => a.dayOfWeek === index);
      // Sort by start time
      daySlots.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

      if (daySlots.length === 0) {
        weeklySchedule[day] = { isAvailable: false };
      } else {
        const first = daySlots[0];
        const breaks = daySlots.slice(1).map((s) => ({
          start: (s.startTime || '').slice(0, 5),
          end: (s.endTime || '').slice(0, 5),
        }));

        weeklySchedule[day] = {
          isAvailable: true,
          startTime: (first.startTime || '').slice(0, 5),
          endTime: (first.endTime || '').slice(0, 5),
          breaks: breaks.length > 0 ? breaks : undefined,
        };
      }
    });

    return {
      weeklySchedule,
      bufferTimeBetweenAppointments: provider.bufferTimeMinutes || 0,
      advanceBooking: {
        minimumNotice: 2, // Default or fetch if stored
        maximumWindow: provider.advanceBookingDays || 30,
      },
      autoBlockHolidays: false,
    };
  }

  /**
   * Replace availability slots for the current provider
   */
  async setAvailability(userId: string, dto: AvailabilityDto) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    const newRows: ProviderAvailability[] = [];
    (dto.slots || []).forEach((s, idx) => {
      const dayOfWeek = this.weekdayToNumber(s.weekday);
      if (dayOfWeek === null) {
        throw new BadRequestException(`Invalid weekday at index ${idx}: ${s.weekday}`);
      }
      try {
        const availabilityData = ProviderAvailability.create(dayOfWeek, s.start, s.end);
        // Manually construct entity or use partial
        const entity = new ProviderAvailability();
        Object.assign(entity, {
          provider: { id: provider.id },
          ...availabilityData
        });
        newRows.push(entity);
      } catch (error: any) {
        throw new BadRequestException(`Index ${idx}: ${error.message}`);
      }
    });

    const saved = await this.providerRepo.replaceAvailability(provider.id, newRows);

    // Availability changes can affect nearby search and dashboard data
    await this.cache.deleteByPrefix('providers:nearby');
    const uid = userId;
    await this.cache.del(`providers:dashboard:user:${uid}`);

    return {
      providerId: provider.id,
      slots: saved.map((r) => ({
        weekday: this.numberToWeekday(r.dayOfWeek),
        start: (r.startTime || '').slice(0, 5),
        end: (r.endTime || '').slice(0, 5),
      })),
    };
  }

  /**
   * Get the current provider profile for the logged-in user
   */
  async getMyProfile(userId: string) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    const sanitized = this.sanitizeProvider(provider);
    sanitized.availability = (provider.availability || []).map((r) => ({
      weekday: this.numberToWeekday(r.dayOfWeek),
      start: (r.startTime || '').slice(0, 5),
      end: (r.endTime || '').slice(0, 5),
    }));
    return sanitized;
  }

  /**
   * Provider dashboard data aggregation
   */
  async getDashboard(userId: string) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    const todayStr = this.formatDate(new Date()); // YYYY-MM-DD

    // Today's appointments
    const todays = await this.providerRepo.findAppointmentsForDashboard(provider.id, todayStr);

    const now = new Date();
    const todayAppointments = todays.map((a) => {
      const priceCents = (a.appointmentServices || []).reduce((sum, s) => sum + (s.priceCents || 0), 0);
      const serviceSummary = (a.appointmentServices || []).map((s) => s.serviceName).join(' + ');
      const startStr = this.formatTime(a.startTime);
      const endStr = this.formatTime(a.endTime);

      const startDt = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
      const diffMs = startDt.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return {
        id: a.id,
        time: `${startStr} - ${endStr}`,
        startTime: startStr,
        endTime: endStr,
        client: {
          id: a.client?.id,
          name: [a.client?.firstName, a.client?.lastName].filter(Boolean).join(' ').trim() || 'Kunde',
          image: a.client?.profilePictureUrl || undefined,
        },
        service: serviceSummary,
        priceCents,
        status: a.status,
        hoursUntil: Math.round(diffHours * 100) / 100,
      };
    });

    // Next appointment (today) if any
    const nextAppt = todayAppointments.find((a) => a.hoursUntil > 0) || null;

    // Reviews aggregation
    const { avgRating, reviewCount } = await this.providerRepo.getReviewStats(provider.id);

    // Week earnings (Mon-Sun) for completed appointments
    const { weekStart, weekEnd } = this.getWeekRange(new Date());
    const weekEarningsCents = await this.providerRepo.getWeekEarnings(provider.id, weekStart, weekEnd);

    // Recent reviews (last 5)
    const recent = await this.providerRepo.findRecentReviews(provider.id, 5);
    const recentReviews = recent.map((r) => ({
      id: r.id,
      client: r.isAnonymous
        ? 'Anonym'
        : [r.client?.firstName, r.client?.lastName].filter(Boolean).join(' ').trim() || 'Kunde',
      rating: r.rating,
      text: r.comment || '',
      date: r.createdAt,
      hasResponse: !!r.providerResponse,
    }));

    return {
      stats: {
        todayCount: todayAppointments.length,
        nextAppointment: nextAppt
          ? { time: nextAppt.startTime, client: nextAppt.client?.name, hoursUntil: nextAppt.hoursUntil }
          : null,
        weekEarningsCents,
        ratingAverage: Math.round(avgRating * 10) / 10,
        reviewCount,
      },
      todayAppointments,
      recentReviews,
    };
  }

  /**
   * List clients for the current provider with lightweight stats
   * Returns:
   * {
   *   totalClients: number,
   *   regularCustomers: number,
   *   newThisWeek: number,
   *   items: Array<{
   *     id: string,
   *     name: string,
   *     image?: string,
   *     phone?: string,
   *     appointments: number,
   *     lastVisitIso?: string,
   *     totalSpentCents: number,
   *     isVIP: boolean,
   *   }>
   * }
   */
  async getClients(userId: string) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    // Load appointments including client and services to aggregate spending
    const appts = await this.providerRepo.findAllAppointments(provider.id);

    type ClientAgg = {
      id: string;
      name: string;
      image?: string;
      phone?: string;
      appointments: number;
      lastVisitIso?: string;
      totalSpentCents: number;
      isVIP: boolean;
    };

    const byClient = new Map<string, ClientAgg>();
    for (const a of appts) {
      const c = a.client;
      if (!c) continue;
      const id = c.id;
      const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || c.email || 'Kunde';
      const priceCents = (a.appointmentServices || []).reduce((sum, s) => sum + (s.priceCents || 0), 0);
      const visitIso = new Date(a.endTime || a.startTime).toISOString();

      const existing = byClient.get(id);
      if (!existing) {
        byClient.set(id, {
          id,
          name: fullName,
          image: c.profilePictureUrl || undefined,
          phone: c.phone || undefined,
          appointments: 1,
          lastVisitIso: visitIso,
          totalSpentCents: priceCents,
          isVIP: false,
        });
      } else {
        existing.appointments += 1;
        existing.totalSpentCents += priceCents;
        // Update last visit to the max
        if (!existing.lastVisitIso || visitIso > existing.lastVisitIso) {
          existing.lastVisitIso = visitIso;
        }
      }
    }

    // Mark VIPs (simple rule: 5+ appointments or >= 50000 cents lifetime spend)
    const items = Array.from(byClient.values()).map((c) => ({
      ...c,
      isVIP: c.appointments >= 5 || c.totalSpentCents >= 50000,
    }));

    // Stats
    const totalClients = items.length;
    const regularCustomers = items.filter((c) => c.appointments >= 5).length;
    const now = new Date();
    const { weekStart, weekEnd } = this.getWeekRange(now);
    const startIso = this.formatDate(weekStart);
    const endIso = this.formatDate(weekEnd);
    const newThisWeek = items.filter((c) => {
      if (!c.lastVisitIso) return false;
      const d = c.lastVisitIso.slice(0, 10);
      return d >= startIso && d <= endIso;
    }).length;

    // Sort clients by most recent visit
    items.sort((a, b) => (b.lastVisitIso || '').localeCompare(a.lastVisitIso || ''));

    return {
      totalClients,
      regularCustomers,
      newThisWeek,
      items,
    };
  }

  /**
   * Public: Find nearby providers by latitude/longitude within a radius (km)
   */
  async getNearbyProviders(params: { lat?: number; lon?: number; radiusKm?: number; limit?: number }) {
    const lat = typeof params.lat === 'number' ? params.lat : NaN;
    const lon = typeof params.lon === 'number' ? params.lon : NaN;
    const radiusKm = typeof params.radiusKm === 'number' ? params.radiusKm : 10;
    const limit = typeof params.limit === 'number' ? params.limit : 20;

    if (!isFinite(lat) || !isFinite(lon)) {
      throw new BadRequestException('Missing or invalid lat/lon');
    }

    let rows: any[] = [];
    try {
      console.log(`[ProvidersService] getNearbyProviders params: lat=${lat}, lon=${lon}, radius=${radiusKm}`);
      // 1. Initial Search (Local)
      rows = await this.providerRepo.findNearby({ lat, lon, radiusKm, limit });
      console.log(`[ProvidersService] Local search found ${rows.length} rows`);

      // 2. Fallback: Expand to entire region (2000km) if no local results
      if (!rows || rows.length === 0) {
        console.log(`[ProvidersService] No providers found within ${radiusKm}km. Expanding search to 2000km.`);
        rows = await this.providerRepo.findNearby({ lat, lon, radiusKm: 2000, limit });
        console.log(`[ProvidersService] Extended search found ${rows.length} rows`);
      }

    } catch (err) {
      console.error('[ProvidersService] getNearbyProviders query error:', err);
      throw new BadRequestException('Konnte nahegelegene Anbieter nicht laden');
    }

    const ids = rows.map((r) => r.id);
    // Aggregate ratings per provider
    const ratingRows = await this.providerRepo.getRatingsForProviders(ids);
    const ratingMap = new Map<string, { rating: number; reviews: number }>();
    for (const row of ratingRows) {
      ratingMap.set(row.providerId, {
        rating: Number(row.avgRating) || 0,
        reviews: Number(row.reviews) || 0,
      });
    }

    // Aggregate specialties and min price from services
    const svcRows = await this.providerRepo.getServicesForProviders(ids);
    const specialties = new Map<string, string[]>();
    const minPrice = new Map<string, number>();
    for (const r of svcRows) {
      const list = specialties.get(r.providerId) || [];
      if (list.length < 5) list.push(r.name);
      specialties.set(r.providerId, list);
      const existing = minPrice.get(r.providerId);
      if (existing == null || r.priceCents < existing) {
        minPrice.set(r.providerId, r.priceCents);
      }
    }

    const items = rows.map((r) => {
      const rating = ratingMap.get(r.id) || { rating: 0, reviews: 0 };
      const priceFromCents = minPrice.get(r.id) ?? null;
      const dist = typeof r.distanceKm === 'string' ? parseFloat(r.distanceKm) : (r.distanceKm as number);
      const name = [r.firstName, r.lastName].filter(Boolean).join(' ').trim();
      return {
        id: r.id,
        name: name || r.businessName || 'Provider',
        business: r.businessName || null,
        rating: rating.rating,
        reviews: rating.reviews,
        distanceKm: Math.round(dist * 10) / 10,
        specialties: (specialties.get(r.id) || []).slice(0, 3),
        priceFromCents,
        available: r.acceptsSameDayBooking || false,
        verified: r.isVerified || false,
        imageUrl: r.coverPhotoUrl || null,
      };
    });

    return { items };
  }

  /**
   * Public: Get provider's public profile/details by id
   */
  async getPublicProfileById(id: string) {
    // Use QueryBuilder to fetch profile with specific relations and filtering
    const provider = await this.providerEntityRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.certifications', 'c')
      .leftJoinAndSelect('p.services', 's', 's.isActive = :isActive', { isActive: true }) // Only active services
      .leftJoinAndSelect('s.category', 'cat')
      .leftJoinAndSelect('p.availability', 'av')
      .leftJoinAndSelect('p.languages', 'lang')
      .leftJoinAndSelect('p.specializations', 'spec')
      .where('p.id = :id', { id })
      .getOne();

    if (!provider) throw new NotFoundException('Provider profile not found');

    // Aggregate rating and review count
    const { avgRating, reviewCount } = await this.providerRepo.getReviewStats(id);

    // Aggregate specialties from DB or fall back to ACTIVE services
    const dbSpecialties = (provider.specializations || []).map(s => s.specialization);
    const serviceSpecialties = (provider.services || []).map((s) => s.name).slice(0, 5);
    const specialties = dbSpecialties.length > 0 ? dbSpecialties : serviceSpecialties;
    const priceFromCents = (provider.services || []).reduce((min, r) => (min == null || r.priceCents < min ? r.priceCents : min), null as number | null);

    const name = [provider.user?.firstName, provider.user?.lastName].filter(Boolean).join(' ').trim();

    // Fetch Reviews (recent 5)
    // Note: Reviews are not directly related to ProviderProfile in typical ManyToOne if defined in Review entity pointing to ProviderProfile
    // Let's verify relation name. In Review entity: @ManyToOne(() => ProviderProfile ... provider)
    const recentReviews = await this.reviewRepo.find({
      where: { provider: { id } },
      relations: ['client'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Fetch Portfolio
    // In PortfolioImage: @ManyToOne(() => ProviderProfile ... provider)
    const portfolioImages = await this.portfolioRepo.find({
      where: { provider: { id }, isPublic: true },
      order: { displayOrder: 'ASC' },
      take: 12, // Limit for profile view
    });

    // Calculate dynamic stats
    const yearsExperience = provider.yearsOfExperience || 0;
    const stats = [
      { label: 'Termine', value: (await this.appointmentRepo.count({ where: { provider: { id } } })).toString() },
      { label: 'Jahre', value: yearsExperience.toString() },
      { label: 'Empfehlung', value: reviewCount > 0 ? `${Math.round((avgRating / 5) * 100)}%` : '-' },
    ];


    return {
      id: provider.id,
      name: name || provider.businessName || 'Provider',
      business: provider.businessName || null,
      verified: provider.isVerified || false,
      imageUrl: provider.coverPhotoUrl || provider.user?.profilePictureUrl || null,
      rating: Math.round(avgRating * 10) / 10,
      reviews: reviewCount,
      specialties,
      priceFromCents,
      // Pass raw arrays to be mapped by adapter/frontend if needed in specific structure, 
      // or map here. Let's pass them in a 'details' object or extended root.
      badges: [
        provider.businessType === 'SALON' ? 'Salon' : 'Home Studio',
        provider.isMobileService ? 'Mobil verfügbar' : null,
        provider.isVerified ? 'Verifiziert' : null
      ].filter(Boolean),
      stats,
      portfolio: portfolioImages.map(img => img.imageUrl),
      recentReviews: recentReviews.map(r => ({
        id: r.id,
        name: [r.client?.firstName, r.client?.lastName].filter(Boolean).join(' ') || 'Anonymous',
        rating: r.rating,
        date: r.createdAt,
        text: r.comment,
        style: 'General' // we don't have style relation easily accessible on review yet without join
      })),
      profile: {
        ...this.sanitizeProvider(provider),
        bio: provider.bio, // Explicitly ensure bio is present
        languages: (provider.languages || []).map(l => l.languageCode),
        certifications: provider.certifications,
        availability: (provider.availability || []).map((r) => ({
          weekday: this.numberToWeekday(r.dayOfWeek), // Reuse existing helper
          start: (r.startTime || '').slice(0, 5),
          end: (r.endTime || '').slice(0, 5),
        })),
        services: (provider.services || []).map(s => ({
          id: s.id,
          name: s.name,
          priceCents: s.priceCents,
          durationMinutes: s.durationMinutes,
          description: s.description
        }))
      },
    };
  }

  /**
   * Public: Get provider's active services
   */
  async getPublicServices(providerId: string) {
    const provider = await this.providerEntityRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.services', 's')
      .where('p.id = :id', { id: providerId })
      .andWhere('s.isActive = :isActive', { isActive: true })
      .orderBy('s.name', 'ASC')
      .getOne();

    if (!provider) return [];
    return provider.services || [];
  }

  /**
   * Calendar Data
   */
  async getCalendar(userId: string, params: { startDate: string; endDate: string; view?: string }) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    const { startDate, endDate } = params;
    const appointments = await this.providerRepo.findAppointmentsInDateRange(provider.id, startDate, endDate);

    // Format for frontend
    const items = appointments.map((a) => {
      const startDt = new Date(a.startTime);
      const endDt = new Date(a.endTime);

      const totalPriceCents = (a.appointmentServices || []).reduce((sum, s) => sum + (s.priceCents || 0), 0);

      return {
        id: a.id,
        date: a.appointmentDate,
        startTime: this.formatTime(a.startTime), // HH:mm
        endTime: this.formatTime(a.endTime), // HH:mm
        services: (a.appointmentServices || []).map(s => ({ name: s.serviceName, durationMinutes: s.durationMinutes })),
        totalPriceCents: totalPriceCents,
        client: a.client ? {
          name: [a.client.firstName, a.client.lastName].filter(Boolean).join(' '),
          image: a.client.profilePictureUrl
        } : null,
        status: a.status
      };
    });

    return {
      appointments: items,
      blockedSlots: [], // TODO: implementations for blocks
      availableSlots: [] // TODO: implementations if needed
    };
  }

  /**
   * Create a time-off block
   */
  async createTimeOff(userId: string, dto: CreateTimeOffDto) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    const block = new ProviderTimeOff();
    Object.assign(block, {
      provider: { id: provider.id },
      startDate: dto.startDate,
      endDate: dto.endDate,
      startTime: dto.allDay ? null : dto.startTime,
      endTime: dto.allDay ? null : dto.endTime,
      reason: dto.reason,
    });

    const saved = await this.timeOffRepo.save(block);
    await this.invalidateProviderCache(provider.id, userId);
    return { blockId: saved.id, message: 'Blockzeit erstellt' };
  }

  /**
   * Update a time-off block
   */
  async updateTimeOff(userId: string, blockId: string, dto: CreateTimeOffDto) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    const block = await this.timeOffRepo.findOne({
      where: { id: blockId },
      relations: ['provider']
    });

    if (!block) throw new NotFoundException('Blockzeit nicht gefunden');
    if (block.provider.id !== provider.id) throw new ForbiddenException('Zugriff verweigert');

    block.startDate = dto.startDate;
    block.endDate = dto.endDate;
    block.startTime = dto.allDay ? null : dto.startTime;
    block.endTime = dto.allDay ? null : dto.endTime;
    block.reason = dto.reason;

    await this.timeOffRepo.save(block);
    await this.invalidateProviderCache(provider.id, userId);
    return { blockId: block.id, message: 'Blockzeit aktualisiert' };
  }

  /**
   * Remove a time-off block
   */
  async removeTimeOff(userId: string, blockId: string) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundException('Provider profile not found');

    const block = await this.timeOffRepo.findOne({ where: { id: blockId }, relations: ['provider'] });
    if (!block) throw new NotFoundException('Blockzeit nicht gefunden');
    if (block.provider.id !== provider.id) throw new ForbiddenException('Zugriff verweigert');

    await this.timeOffRepo.remove(block);
    await this.invalidateProviderCache(provider.id, userId);
    return { success: true };
  }

  // -------- Helpers --------
  private formatTime(d: any): string {
    if (d instanceof Date && !isNaN(d.getTime())) {
      return d.toISOString().substring(11, 16);
    }
    // If it's a string, try to parse or just slice if it looks like ISO
    if (typeof d === 'string') {
      if (d.includes('T')) {
        try {
          return new Date(d).toISOString().substring(11, 16);
        } catch { return "00:00"; }
      }
      // If it's already HH:mm:ss
      return d.substring(0, 5);
    }
    return "00:00";
  }

  private formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private getWeekRange(d: Date): { weekStart: Date; weekEnd: Date } {
    const day = d.getDay(); // 0=Sun, 1=Mon
    const diffToMonday = (day + 6) % 7; // days since Monday
    const start = new Date(d);
    start.setDate(d.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { weekStart: start, weekEnd: end };
  }

  private combineDateTimeLocal(dateStr: string, timeStr: string): Date {
    const hhmmss = this.normalizeTime(timeStr) || '00:00:00';
    // Interpret as local time
    return new Date(`${dateStr}T${hhmmss}`);
  }

  /** Helper: convert weekday string to number (0=Mon .. 6=Sun) */
  private weekdayToNumber(input?: string): number | null {
    if (!input) return null;
    const s = input.toLowerCase().trim();
    const map: Record<string, number> = {
      '0': 0,
      mon: 0,
      mo: 0,
      monday: 0,
      '1': 1,
      tue: 1,
      tu: 1,
      tuesday: 1,
      '2': 2,
      wed: 2,
      we: 2,
      wednesday: 2,
      '3': 3,
      thu: 3,
      th: 3,
      thursday: 3,
      '4': 4,
      fri: 4,
      fr: 4,
      friday: 4,
      '5': 5,
      sat: 5,
      sa: 5,
      saturday: 5,
      '6': 6,
      sun: 6,
      su: 6,
      sunday: 6,
    };
    return typeof map[s] === 'number' ? map[s] : null;
  }

  /** Helper: convert number weekday to canonical short name */
  private numberToWeekday(n: number): string {
    const names = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    return names[n] ?? 'Montag';
  }

  /** Helper: normalize HH:mm to HH:mm:ss for Postgres time columns */
  private normalizeTime(t?: string): string | null {
    if (!t) return null;
    const m = t.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
    if (!m) return null;
    const hh = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const ss = (m[3] ?? '00').padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  /** Helper: sanitize provider profile for API output */
  private sanitizeProvider(p: ProviderProfile): any {
    return {
      id: p.id,
      businessName: p.businessName || null,
      businessType: p.businessType,
      bio: p.bio,
      yearsOfExperience: p.yearsOfExperience,
      businessRegistrationNumber: p.businessRegistrationNumber || null,
      taxId: p.taxId || null,
      coverPhotoUrl: p.coverPhotoUrl || null,
      isVerified: p.isVerified,
      isMobileService: p.isMobileService,
      serviceRadiusKm: p.serviceRadiusKm ?? null,
      acceptsSameDayBooking: p.acceptsSameDayBooking,
      advanceBookingDays: p.advanceBookingDays,
      bufferTimeMinutes: p.bufferTimeMinutes,
      cancellationPolicy: p.cancellationPolicy,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      user: p.user
        ? {
          id: p.user.id,
          email: p.user.email,
          phone: p.user.phone,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          profilePictureUrl: p.user.profilePictureUrl || null,
        }
        : undefined,
      // Map relations to simple arrays/objects for frontend
      specializations: p.specializations?.map(s => s.specialization) || [],
      languages: p.languages?.map(l => l.languageCode) || [],
      certifications: p.certifications || [],
      socialMedia: {
        website: p.website || null,
        instagram: p.instagram || null,
        facebook: p.facebook || null,
        twitter: p.twitter || null,
        youtube: p.youtube || null,
        linkedin: p.linkedin || null,
      },
      // Extract main address from locations
      // Extract main address from locations
      address: p.locations?.find(l => l.isPrimary)?.address?.streetAddress
        ? `${p.locations.find(l => l.isPrimary)?.address?.streetAddress}, ${p.locations.find(l => l.isPrimary)?.address?.postalCode || ''} ${p.locations.find(l => l.isPrimary)?.address?.city}`
        : (p.locations?.[0]?.address?.streetAddress ? `${p.locations[0].address.streetAddress}, ${p.locations[0].address.postalCode || ''} ${p.locations[0].address.city}` : null),
      addressDetails: p.locations?.find(l => l.isPrimary)?.address || p.locations?.[0]?.address || null
    };
  }
}