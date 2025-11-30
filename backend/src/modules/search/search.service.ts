import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SearchQueryDto } from './dto/search-query.dto';
import { ProviderProfile, BusinessType } from '../providers/entities/provider-profile.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Review } from '../reviews/entities/review.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Service)
    private readonly servicesRepo: Repository<Service>,
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,
  ) {}

  async search(params: SearchQueryDto) {
    const q = (params.query || '').trim();
    if (!q) return { results: [] };

    // Use LOWER(..) LIKE :filterLower for cross-driver compatibility (SQLite/Postgres)
    const filterLower = `%${q.toLowerCase()}%`;
    const qb = this.providersRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .where(
        [
          'LOWER(p.business_name) LIKE :filterLower',
          'LOWER(p.bio) LIKE :filterLower',
          'LOWER(u.first_name) LIKE :filterLower',
          'LOWER(u.last_name) LIKE :filterLower',
        ].join(' OR '),
        { filterLower },
      )
      .andWhere('p.user_id IS NOT NULL')
      .distinct(true)
      .orderBy('p.is_verified', 'DESC')
      .addOrderBy('p.created_at', 'DESC')
      .limit(50);

    // Optional category filter mapping
    const cat = (params.category || '').toLowerCase();
    if (cat) {
      const map: Record<string, BusinessType> = {
        salon: BusinessType.SALON,
        individual: BusinessType.INDIVIDUAL,
        mobile: BusinessType.MOBILE,
      };
      const bt = map[cat];
      if (bt) qb.andWhere('p.business_type = :bt', { bt });
    }

    // Prefer verified providers first
    // (repeat orderBy to ensure ordering regardless of optional category filter)
    qb.orderBy('p.is_verified', 'DESC').addOrderBy('p.created_at', 'DESC');

    let providers: ProviderProfile[] = [];
    try {
      // Debug: log generated SQL and parameters to diagnose empty results
      const sql = qb.getSql();
      const paramsDbg = (qb as any)?.getParameters ? (qb as any).getParameters() : undefined;
      // eslint-disable-next-line no-console
      console.log('[SearchService] SQL:', sql);
      // eslint-disable-next-line no-console
      console.log('[SearchService] Params:', paramsDbg || { filterLower });
      providers = await qb.getMany();
    } catch (err) {
      console.error('[SearchService] provider query error:', err);
      return { results: [] };
    }
    // Temporarily skip service aggregation to isolate 500 error source
    const svcMap = new Map<string, string[]>();

    // Aggregate ratings and review counts per provider
    const ids = providers.map((p) => p.id);
    let ratingRows: Array<{ provider_id: string; avg_rating: string; reviews: string }> = [];
    if (ids.length) {
      try {
        ratingRows = await this.reviewsRepo
          .createQueryBuilder('r')
          .select('r.provider_id', 'provider_id')
          .addSelect('AVG(r.rating)', 'avg_rating')
          .addSelect('COUNT(*)', 'reviews')
          .where('r.provider_id IN (:...ids)', { ids })
          .groupBy('r.provider_id')
          .getRawMany();
      } catch (err: any) {
        const msg = err?.message || String(err);
        if (/no such table/i.test(msg) || /relation .* does not exist/i.test(msg)) {
          console.warn('[SearchService] Reviews schema missing; skipping rating aggregation:', msg);
        } else {
          console.warn('[SearchService] Failed to aggregate ratings; continuing without ratings:', msg);
        }
        ratingRows = [];
      }
    }
    const ratingMap = new Map<string, { rating: number; reviews: number }>();
    for (const row of ratingRows) {
      ratingMap.set(row.provider_id, {
        rating: Number(row.avg_rating) || 0,
        reviews: Number(row.reviews) || 0,
      });
    }

    // Build minimal price per provider (active services only)
    const svcRows: Array<{ provider_id: string; min_price: string }> = ids.length
      ? await this.servicesRepo
          .createQueryBuilder('s')
          .select('s.provider_id', 'provider_id')
          .addSelect('MIN(s.price_cents)', 'min_price')
          .where('s.provider_id IN (:...ids)', { ids })
          .andWhere('s.is_active = :active', { active: true })
          .groupBy('s.provider_id')
          .getRawMany()
      : [];
    const priceMap = new Map<string, number>();
    for (const row of svcRows) priceMap.set(row.provider_id, Number(row.min_price) || 0);

    type Result = {
      id: string;
      name: string;
      business: string | null;
      rating: number;
      reviews: number;
      distance?: number;
      specialties: string[];
      price?: number;
      available: boolean;
      verified: boolean;
      image?: string;
      isFavorited: boolean;
    };

    const results: Result[] = providers.map((p) => {
      const name = [p.user?.firstName, p.user?.lastName].filter(Boolean).join(' ').trim();
      return {
        id: p.id,
        name: name || p.businessName || 'Provider',
        business: p.businessName || null,
        rating: ratingMap.get(p.id)?.rating ?? 0,
        reviews: ratingMap.get(p.id)?.reviews ?? 0,
        distance: undefined,
        specialties: svcMap.get(p.id) || [],
        price: priceMap.get(p.id),
        available: p.acceptsSameDayBooking || false,
        verified: p.isVerified || false,
        image: p.coverPhotoUrl || undefined,
        isFavorited: false,
      };
    });

    // Optional filters: rating, price, distance
    let filtered = results;
    if (typeof params.minRating === 'number') {
      filtered = filtered.filter((r) => (r.rating ?? 0) >= params.minRating!);
    }
    if (typeof params.priceMinCents === 'number') {
      filtered = filtered.filter((r) => (r.price ?? 0) >= params.priceMinCents!);
    }
    if (typeof params.priceMaxCents === 'number') {
      filtered = filtered.filter((r) => (r.price ?? Number.MAX_SAFE_INTEGER) <= params.priceMaxCents!);
    }

    // Distance calculation (application-side) if client location provided
    if (typeof params.lat === 'number' && typeof params.lng === 'number') {
      // Load primary address lat/lng per provider
      const locs = ids.length
        ? await this.providersRepo
            .createQueryBuilder('p')
            .leftJoin('p.locations', 'pl')
            .leftJoin('pl.address', 'a')
            .select(['p.id AS provider_id', 'a.latitude AS lat', 'a.longitude AS lng', 'pl.is_primary AS is_primary'])
            .where('p.id IN (:...ids)', { ids })
            .andWhere('pl.is_primary = true')
            .getRawMany()
        : [];
      const coordMap = new Map<string, { lat: number; lng: number }>();
      for (const row of locs) {
        const lat = row.lat !== null && row.lat !== undefined ? Number(row.lat) : NaN;
        const lng = row.lng !== null && row.lng !== undefined ? Number(row.lng) : NaN;
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) coordMap.set(row.provider_id, { lat, lng });
      }
      const toRad = (n: number) => (n * Math.PI) / 180;
      const R = 6371; // km
      filtered = filtered
        .map((r) => {
          const c = coordMap.get(r.id);
          if (!c) return { ...r, distance: undefined } as Result;
          const dLat = toRad(c.lat - params.lat!);
          const dLng = toRad(c.lng - params.lng!);
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(params.lat!)) * Math.cos(toRad(c.lat)) * Math.sin(dLng / 2) ** 2;
          const d = 2 * R * Math.asin(Math.sqrt(a));
          return { ...r, distance: d } as Result;
        })
        .sort((a, b) => (a.distance ?? Number.MAX_VALUE) - (b.distance ?? Number.MAX_VALUE));
      if (typeof params.withinKm === 'number') {
        filtered = filtered.filter((r) => (r.distance ?? Number.MAX_VALUE) <= params.withinKm!);
      }
    }

    // Sort by verified, rating desc, price asc
    filtered = filtered
      .sort((a, b) => Number(b.verified) - Number(a.verified))
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .sort((a, b) => (a.price ?? Number.MAX_VALUE) - (b.price ?? Number.MAX_VALUE));

    return { results: filtered };
  }
}
