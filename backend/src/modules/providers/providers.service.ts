import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderProfile } from './entities/provider-profile.entity';
import { ProviderAvailability } from './entities/provider-availability.entity';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { AvailabilityDto } from './dto/availability.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Review } from '../reviews/entities/review.entity';
import { Service } from '../services/entities/service.entity';
import { AppCacheService } from '../cache/cache.service';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
    @InjectRepository(ProviderAvailability)
    private readonly availabilityRepo: Repository<ProviderAvailability>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepo: Repository<Appointment>,
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,
    @InjectRepository(Service)
    private readonly servicesRepo: Repository<Service>,
    private readonly cache: AppCacheService,
  ) { }

  private readonly logger = new Logger(ProvidersService.name);

  /**
   * Update basic provider profile information for the current user
   */
  async updateProfile(userId: string, dto: UpdateProviderDto) {
    const provider = await this.providersRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!provider) throw new NotFoundException('Provider profile not found');

    if (typeof dto.businessName !== 'undefined') {
      provider.businessName = dto.businessName || null;
    }
    if (typeof dto.bio !== 'undefined') {
      provider.bio = dto.bio || '';
    }
    if (typeof dto.acceptsSameDayBooking !== 'undefined') {
      provider.acceptsSameDayBooking = !!dto.acceptsSameDayBooking;
    }
    if (typeof dto.advanceBookingDays !== 'undefined') {
      provider.advanceBookingDays = Math.max(0, dto.advanceBookingDays || 0);
    }
    if (typeof dto.bufferTimeMinutes !== 'undefined') {
      provider.bufferTimeMinutes = Math.max(0, dto.bufferTimeMinutes || 0);
    }
    if (typeof dto.minAdvanceHours !== 'undefined') {
      provider.minAdvanceHours = Math.max(0, dto.minAdvanceHours || 0);
    }

    let saved: ProviderProfile;
    try {
      saved = await this.providersRepo.save(provider);
    } catch (err: any) {
      const msg = err?.message || String(err);
      this.logger.warn(`Failed to save provider profile for user ${userId}: ${msg}`);
      throw new BadRequestException('Profil konnte nicht gespeichert werden');
    }
    // Invalidate public profile and nearby caches, as well as per-user dashboard/me caches
    await this.cache.del(`providers:public:${saved.id}`);
    await this.cache.deleteByPrefix('providers:nearby');
    const uid = userId;
    await this.cache.del(`providers:dashboard:user:${uid}`);
    await this.cache.del(`providers:me:user:${uid}`);
    return this.sanitizeProvider(saved);
  }

  /**
   * Replace availability slots for the current provider
   */
  async setAvailability(userId: string, dto: AvailabilityDto) {
    const provider = await this.providersRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!provider) throw new NotFoundException('Provider profile not found');

    // Validate slots
    const slots = (dto.slots || []).map((s, idx) => {
      const dayOfWeek = this.weekdayToNumber(s.weekday);
      if (dayOfWeek === null) {
        throw new BadRequestException(`Invalid weekday at index ${idx}: ${s.weekday}`);
      }
      const start = this.normalizeTime(s.start);
      const end = this.normalizeTime(s.end);
      if (!start || !end) {
        throw new BadRequestException(`Invalid time format at index ${idx}: start=${s.start}, end=${s.end}`);
      }
      if (start >= end) {
        throw new BadRequestException(`Start time must be before end time at index ${idx}`);
      }
      return { dayOfWeek, startTime: start, endTime: end };
    });

    // Remove existing availability for this provider
    try {
      const existing = await this.availabilityRepo.find({ where: { provider: { id: provider.id } } });
      if (existing.length) {
        await this.availabilityRepo.remove(existing);
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      this.logger.warn(`Failed to clear availability for provider ${provider.id}: ${msg}`);
    }

    // Create new rows
    const rows = slots.map((slot) =>
      this.availabilityRepo.create({
        provider: { id: provider.id } as any,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: true,
      }),
    );
    let saved;
    try {
      saved = await this.availabilityRepo.save(rows);
    } catch (err: any) {
      const msg = err?.message || String(err);
      this.logger.warn(`Failed to save availability for provider ${provider.id}: ${msg}`);
      throw new BadRequestException('Verfügbarkeit konnte nicht gespeichert werden');
    }
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
    const provider = await this.providersRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'availability'],
    });
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
    let provider;
    try {
      provider = await this.providersRepo.findOne({ where: { user: { id: userId } } });
    } catch (err: any) {
      this.logger.error(`Failed to find provider for dashboard user ${userId}: ${err.message}`, err.stack);
      throw new BadRequestException('Fehler beim Laden des Profils');
    }
    if (!provider) throw new NotFoundException('Provider profile not found');

    try {
      const todayStr = this.formatDate(new Date()); // YYYY-MM-DD

      // Today's appointments
      let todayAppts: Appointment[] = [];
      try {
        todayAppts = await this.appointmentsRepo.find({
          where: { provider: { id: provider.id }, appointmentDate: todayStr },
          relations: ['client', 'appointmentServices'],
          order: { startTime: 'ASC' },
        });
      } catch (err: any) {
        const msg = err?.message || String(err);
        this.logger.warn(`Failed to load today's appointments for dashboard user ${userId}: ${msg}`);
        todayAppts = [];
      }
      const now = new Date();
      const todayAppointments = todayAppts.map((a: Appointment) => {
        const priceCents = (a.appointmentServices || []).reduce((sum, s) => sum + (s.priceCents || 0), 0);
        const serviceSummary = (a.appointmentServices || []).map((s) => s.serviceName).join(' + ');
        const startStr = (a.startTime || '').slice(0, 5);
        const endStr = (a.endTime || '').slice(0, 5);
        const startDt = this.combineDateTimeLocal(a.appointmentDate, a.startTime);
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
      let avgRating = 0;
      let reviewCount = 0;
      try {
        const { avgRating: avg, reviewCount: count } = await this.reviewsRepo
          .createQueryBuilder('r')
          .select('AVG(r.rating)', 'avgRating')
          .addSelect('COUNT(r.id)', 'reviewCount')
          .where('r.provider = :providerId', { providerId: provider.id })
          .getRawOne<{ avgRating: string; reviewCount: string }>()
          .then((row) => ({
            avgRating: row?.avgRating ? parseFloat(row.avgRating) : 0,
            reviewCount: row?.reviewCount ? parseInt(row.reviewCount, 10) : 0,
          }));
        avgRating = avg;
        reviewCount = count;
      } catch (err: any) {
        this.logger.warn(`Failed to load reviews stats for dashboard user ${userId}: ${err.message}`);
      }

      // Week earnings (Mon-Sun) for completed appointments
      const { weekStart, weekEnd } = this.getWeekRange(new Date());
      let earningsRows: { totalCents: string } | undefined;
      try {
        earningsRows = await this.appointmentsRepo
          .createQueryBuilder('a')
          .leftJoin('a.appointmentServices', 'as')
          .select('COALESCE(SUM(as.price_cents), 0)', 'totalCents')
          .where('a.provider = :providerId', { providerId: provider.id })
          .andWhere('a.status = :status', { status: 'COMPLETED' })
          .andWhere('a.appointment_date BETWEEN :start AND :end', {
            start: this.formatDate(weekStart),
            end: this.formatDate(weekEnd),
          })
          .getRawOne<{ totalCents: string }>();
      } catch (err: any) {
        const msg = err?.message || String(err);
        this.logger.warn(`Failed to compute week earnings for dashboard user ${userId}: ${msg}`);
        earningsRows = undefined;
      }
      const weekEarningsCents = earningsRows?.totalCents ? parseInt(earningsRows.totalCents, 10) : 0;

      // Recent reviews (last 5)
      let recentReviews: any[] = [];
      try {
        const recent = await this.reviewsRepo.find({
          where: { provider: { id: provider.id } },
          relations: ['client'],
          order: { createdAt: 'DESC' },
          take: 5,
        });
        recentReviews = recent.map((r) => ({
          id: r.id,
          client: r.isAnonymous
            ? 'Anonym'
            : [r.client?.firstName, r.client?.lastName].filter(Boolean).join(' ').trim() || 'Kunde',
          rating: r.rating,
          text: r.comment || '',
          date: r.createdAt,
          hasResponse: !!r.providerResponse,
        }));
      } catch (err: any) {
        this.logger.warn(`Failed to load recent reviews for dashboard user ${userId}: ${err.message}`);
      }

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
    } catch (err: any) {
      this.logger.error(`Dashboard error for user ${userId}: ${err.message}`, err.stack);
      // Return empty dashboard instead of 500
      return {
        stats: {
          todayCount: 0,
          nextAppointment: null,
          weekEarningsCents: 0,
          ratingAverage: 0,
          reviewCount: 0,
        },
        todayAppointments: [],
        recentReviews: [],
      };
    }
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
    const provider = await this.providersRepo.findOne({ where: { user: { id: userId } } });
    if (!provider) throw new NotFoundException('Provider profile not found');

    // Load appointments including client and services to aggregate spending
    let appts: Appointment[] = [];
    try {
      appts = await this.appointmentsRepo.find({
        where: { provider: { id: provider.id } },
        relations: ['client', 'appointmentServices'],
        order: { appointmentDate: 'DESC', startTime: 'DESC' },
      });
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (/no such table/i.test(msg) || /relation .* does not exist/i.test(msg)) {
        this.logger.warn(`Appointments schema not available; returning empty clients list for user ${userId}: ${msg}`);
      } else {
        this.logger.warn(`Failed to load appointments for clients list (user ${userId}): ${msg}`);
      }
      appts = [];
    }

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
      const visitIso = (() => {
        // Combine date + end time when available, else start time
        const time = a.endTime || a.startTime || '00:00:00';
        const hhmmss = this.normalizeTime(time) || '00:00:00';
        return `${a.appointmentDate}T${hhmmss}`;
      })();

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
      // Instead of throwing 400, just return empty items if location is missing (e.g. initial dashboard load)
      return { items: [] };
    }

    // Haversine formula (in kilometers) using Postgres math functions
    const distanceExpr =
      `6371 * 2 * ASIN(SQRT(POWER(SIN((CAST(addr.latitude AS double precision) - :lat) * pi() / 180 / 2), 2) ` +
      `+ COS(:lat * pi() / 180) * COS(CAST(addr.latitude AS double precision) * pi() / 180) ` +
      `* POWER(SIN((CAST(addr.longitude AS double precision) - :lon) * pi() / 180 / 2), 2)))`;

    const qb = this.providersRepo
      .createQueryBuilder('p')
      .leftJoin('p.user', 'u')
      .leftJoin('p.locations', 'pl')
      .leftJoin('pl.address', 'addr')
      .where('addr.latitude IS NOT NULL AND addr.longitude IS NOT NULL')
      .andWhere('p.user_id IS NOT NULL')
      .select('p.id', 'id')
      .addSelect('u.first_name', 'first_name')
      .addSelect('u.last_name', 'last_name')
      .addSelect('p.business_name', 'business_name')
      .addSelect('p.cover_photo_url', 'cover_photo_url')
      .addSelect('p.is_verified', 'is_verified')
      .addSelect('p.accepts_same_day_booking', 'accepts_same_day_booking')
      .addSelect(`MIN(${distanceExpr})`, 'distance_km')
      .groupBy('p.id')
      .addGroupBy('u.first_name')
      .addGroupBy('u.last_name')
      .addGroupBy('p.business_name')
      .addGroupBy('p.cover_photo_url')
      .addGroupBy('p.is_verified')
      .addGroupBy('p.accepts_same_day_booking')
      .having(`MIN(${distanceExpr}) <= :radiusKm`)
      .orderBy('distance_km', 'ASC')
      .limit(limit)
      .setParameters({ lat, lon, radiusKm });

    let rows: Array<{
      id: string;
      first_name: string | null;
      last_name: string | null;
      business_name: string | null;
      cover_photo_url: string | null;
      is_verified: boolean;
      accepts_same_day_booking: boolean;
      distance_km: string | number;
    }> = [];
    try {
      rows = await qb.getRawMany();
    } catch (err) {
      console.error('[ProvidersService] getNearbyProviders query error:', err);
      throw new BadRequestException('Konnte nahegelegene Anbieter nicht laden');
    }

    const ids = rows.map((r) => r.id);
    // Aggregate ratings per provider
    const ratingRows: Array<{ provider_id: string; avg_rating: string; reviews: string }> = ids.length
      ? await this.reviewsRepo
        .createQueryBuilder('r')
        .select('r.provider_id', 'provider_id')
        .addSelect('AVG(r.rating)', 'avg_rating')
        .addSelect('COUNT(*)', 'reviews')
        .where('r.provider_id IN (:...ids)', { ids })
        .groupBy('r.provider_id')
        .getRawMany()
      : [];
    const ratingMap = new Map<string, { rating: number; reviews: number }>();
    for (const row of ratingRows) {
      ratingMap.set(row.provider_id, {
        rating: Number(row.avg_rating) || 0,
        reviews: Number(row.reviews) || 0,
      });
    }

    // Aggregate specialties and min price from services
    const svcRows: Array<{ provider_id: string; name: string; price_cents: number }> = ids.length
      ? await this.servicesRepo
        .createQueryBuilder('svc')
        .select('svc.provider_id', 'provider_id')
        .addSelect('svc.name', 'name')
        .addSelect('svc.price_cents', 'price_cents')
        .where('svc.provider_id IN (:...ids)', { ids })
        .andWhere('svc.is_active = :active', { active: true })
        .orderBy('svc.display_order', 'ASC')
        .limit(200)
        .getRawMany()
      : [];
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
    const provider = await this.providersRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!provider) throw new NotFoundException('Provider profile not found');

    // Aggregate rating and review count
    const ratingRow = await this.reviewsRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg_rating')
      .addSelect('COUNT(r.id)', 'reviews')
      .where('r.provider_id = :id', { id })
      .getRawOne<{ avg_rating: string; reviews: string }>();
    const avgRating = ratingRow?.avg_rating ? parseFloat(ratingRow.avg_rating) : 0;
    const reviewCount = ratingRow?.reviews ? parseInt(ratingRow.reviews, 10) : 0;

    // Aggregate specialties (service names) and min price
    const svcRows: Array<{ name: string; price_cents: number }> = await this.servicesRepo
      .createQueryBuilder('svc')
      .select('svc.name', 'name')
      .addSelect('svc.price_cents', 'price_cents')
      .where('svc.provider_id = :id', { id })
      .andWhere('svc.is_active = :active', { active: true })
      .orderBy('svc.display_order', 'ASC')
      .limit(200)
      .getRawMany();
    const specialties = svcRows.map((r) => r.name).slice(0, 5);
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

  // -------- Helpers --------
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
