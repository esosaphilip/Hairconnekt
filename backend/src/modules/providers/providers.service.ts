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

import { ProviderCertification } from './entities/provider-certification.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @Inject('IProviderRepository')
    private readonly providerRepo: IProviderRepository,
    private readonly cache: AppCacheService,
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

    // Create a new certification instance (we can't use Repo.create here, so we instantiate or use a factory)
    // Ideally ProviderCertification.create(...) exists.
    // For now we pass a partial object and let the repo handle it or assume TypeORM repo.create behavior is needed.
    // Wait, IProviderRepository.saveCertification expects a ProviderCertification entity.
    // I should probably add a factory to ProviderCertification or use "new ProviderCertification()".
    // Let's assume for now we construct it manually as we did with Entity.create pattern.

    // Using a plain object cast for now as we don't have a factory on ProviderCertification yet.
    // Actually, `TypeORMProviderRepository` uses `certificationsRepo.save`.
    // We should construct it.

    const cert = new ProviderCertification(); // Assuming we import it? No, imports removed. 
    // Wait, I need to import ProviderCertification entity class to instantiate it.
    // I added it to imports at the top.

    Object.assign(cert, {
      provider: { id: provider.id },
      ...dto
    });

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
      const startDt = new Date(a.startTime);
      const endDt = new Date(a.endTime);

      const startStr = this.formatTime(startDt);
      const endStr = this.formatTime(endDt);

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
      rows = await this.providerRepo.findNearby({ lat, lon, radiusKm, limit });
    } catch (err) {
      console.error('[ProvidersService] getNearbyProviders query error:', err);
      throw new BadRequestException('Konnte nahegelegene Anbieter nicht laden');
    }

    const ids = rows.map((r) => r.id);
    // Aggregate ratings per provider
    const ratingRows = await this.providerRepo.getRatingsForProviders(ids);
    const ratingMap = new Map<string, { rating: number; reviews: number }>();
    for (const row of ratingRows) {
      ratingMap.set(row.provider_id, {
        rating: Number(row.avg_rating) || 0,
        reviews: Number(row.reviews) || 0,
      });
    }

    // Aggregate specialties and min price from services
    const svcRows = await this.providerRepo.getServicesForProviders(ids);
    const specialties = new Map<string, string[]>();
    const minPrice = new Map<string, number>();
    for (const r of svcRows) {
      const list = specialties.get(r.provider_id) || [];
      if (list.length < 5) list.push(r.name);
      specialties.set(r.provider_id, list);
      const existing = minPrice.get(r.provider_id);
      if (existing == null || r.price_cents < existing) {
        minPrice.set(r.provider_id, r.price_cents);
      }
    }

    const items = rows.map((r) => {
      const rating = ratingMap.get(r.id) || { rating: 0, reviews: 0 };
      const priceFromCents = minPrice.get(r.id) ?? null;
      const dist = typeof r.distance_km === 'string' ? parseFloat(r.distance_km) : (r.distance_km as number);
      const name = [r.first_name, r.last_name].filter(Boolean).join(' ').trim();
      return {
        id: r.id,
        name: name || r.business_name || 'Provider',
        business: r.business_name || null,
        rating: rating.rating,
        reviews: rating.reviews,
        distanceKm: Math.round(dist * 10) / 10,
        specialties: (specialties.get(r.id) || []).slice(0, 3),
        priceFromCents,
        available: r.accepts_same_day_booking || false,
        verified: r.is_verified || false,
        imageUrl: r.cover_photo_url || null,
      };
    });

    return { items };
  }

  /**
   * Public: Get provider's public profile/details by id
   */
  async getPublicProfileById(id: string) {
    const provider = await this.providerRepo.findById(id);
    if (!provider) throw new NotFoundException('Provider profile not found');

    // Aggregate rating and review count
    const { avgRating, reviewCount } = await this.providerRepo.getReviewStats(id);

    // Aggregate specialties and min price from services
    const svcRows = await this.providerRepo.getServicesForProviders([id]);
    const specialties = svcRows.slice(0, 5).map((r) => r.name);
    const priceFromCents = svcRows.reduce((min, r) => (min == null || r.price_cents < min ? r.price_cents : min), null as number | null);

    const name = [provider.user?.firstName, provider.user?.lastName].filter(Boolean).join(' ').trim();

    return {
      id: provider.id,
      name: name || provider.businessName || 'Provider',
      business: provider.businessName || null,
      verified: provider.isVerified || false,
      imageUrl: provider.coverPhotoUrl || null,
      rating: Math.round(avgRating * 10) / 10,
      reviews: reviewCount,
      specialties,
      priceFromCents,
      profile: this.sanitizeProvider(provider),
    };
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
        startTime: startDt.toISOString().substring(11, 16), // HH:mm
        endTime: endDt.toISOString().substring(11, 16), // HH:mm
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

  // -------- Helpers --------
  private formatTime(d: any): string {
    return d instanceof Date && !isNaN(d.getTime())
      ? d.toISOString().substring(11, 16)
      : "00:00";
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
    const names = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return names[n] ?? 'mon';
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
    };
  }
}