import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SearchQueryDto } from './dto/search-query.dto';
import { ProviderProfile, BusinessType } from '../providers/entities/provider-profile.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Review } from '../reviews/entities/review.entity';
import { ServiceCategory } from '../services/entities/service-category.entity';

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
    @InjectRepository(ServiceCategory)
    private readonly categoryRepo: Repository<ServiceCategory>,
  ) { }

  async search(params: SearchQueryDto) {
    const q = (params.query || '').trim();
    const cat = (params.category || '').trim().toLowerCase();

    // If query is empty but category is provided, use specialized category search
    if (!q && cat) {
      return this.findProvidersByCategory(cat);
    }

    if (!q) return { results: [] };

    // Use LOWER(..) LIKE :filterLower for cross-driver compatibility (SQLite/Postgres)
    const filterLower = `%${q.toLowerCase()}%`;
    const qb = this.providersRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoin('p.services', 's_search') // Join services for name search
      .where(
        [
          'LOWER(p.business_name) LIKE :filterLower',
          'LOWER(p.bio) LIKE :filterLower',
          'LOWER(u.first_name) LIKE :filterLower',
          'LOWER(u.last_name) LIKE :filterLower',
          'LOWER(s_search.name) LIKE :filterLower', // Add service name search
        ].join(' OR '),
        { filterLower },
      )
      .andWhere('p.user_id IS NOT NULL')
      .distinct(true)
      .orderBy('p.is_verified', 'DESC')
      .addOrderBy('p.created_at', 'DESC')
      .limit(50);

    // Optional category filter mapping
    // cat is already defined above
    if (cat) {
      const map: Record<string, BusinessType> = {
        salon: BusinessType.SALON,
        individual: BusinessType.INDIVIDUAL,
        mobile: BusinessType.MOBILE,
      };
      const bt = map[cat];
      if (bt) {
        qb.andWhere('p.business_type = :bt', { bt });
      } else {
        // Not a business type? Try filtering by ServiceCategory slug (e.g. 'braids')
        // We need to look up the category ID first or join. Joining is cleaner for the query.
        // But we need to be careful not to affect the main query count if not matched.
        // Actually, inner joining services filters providers who HAVE that service.
        const category = await this.categoryRepo.findOne({ where: { slug: cat } });

        if (category) {
          // Filter providers that have at least one active service in this category
          qb.innerJoin('p.services', 's_filter')
            .andWhere('s_filter.category_id = :filterCatId', { filterCatId: category.id })
            .andWhere('s_filter.is_active = :filterIsActive', { filterIsActive: true });
        }
      }
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

    const results = providers.map((p) => {
      const name = [p.user?.firstName, p.user?.lastName].filter(Boolean).join(' ').trim();
      return {
        id: p.id,
        name: name || p.businessName || 'Provider',
        business: p.businessName || null,
        rating: ratingMap.get(p.id)?.rating ?? 0,
        reviews: ratingMap.get(p.id)?.reviews ?? 0,
        distance: undefined,
        specialties: svcMap.get(p.id) || [],
        price: undefined,
        available: p.acceptsSameDayBooking || false,
        verified: p.isVerified || false,
        image: p.coverPhotoUrl || undefined,
        isFavorited: false,
      };
    });

    return { results };
  }

  async findProvidersByCategory(slug: string) {
    // 1. Determine legacy ID mapping first
    let legacyId: string | null = null;
    if (slug === 'braids') legacyId = 'cat_braids';
    else if (slug === 'twists') legacyId = 'cat_twists';
    else if (slug === 'locs') legacyId = 'cat_locs';
    else if (slug === 'natural' || slug === 'natural-styling') legacyId = 'cat_natural';
    else if (slug === 'weave' || slug === 'weaves') legacyId = 'cat_weave';

    // 2. Find category entity
    const category = await this.categoryRepo.findOne({ where: { slug, isActive: true } });

    // 3. If neither exists, return empty
    if (!category && !legacyId) {
      return { results: [] };
    }

    const catIds: string[] = [];
    if (category) catIds.push(category.id);
    if (legacyId) catIds.push(legacyId);

    const providers = await this.providersRepo
      .createQueryBuilder('p')
      .innerJoin('p.services', 's')
      .innerJoinAndSelect('p.user', 'u')
      .where('s.category_id IN (:...catIds)', { catIds })
      .andWhere('s.is_active = :isActive', { isActive: true })
      .andWhere('p.user_id IS NOT NULL') // Ensure linked to a user
      .distinct(true)
      .getMany();

    // 3. Aggregate ratings (reuse logic or extract to helper)
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
      } catch (err) {
        console.warn('[SearchService] Failed to aggregate ratings:', err);
      }
    }
    const ratingMap = new Map<string, { rating: number; reviews: number }>();
    for (const row of ratingRows) {
      ratingMap.set(row.provider_id, {
        rating: Number(row.avg_rating) || 0,
        reviews: Number(row.reviews) || 0,
      });
    }

    // 4. Map to result format
    // Also fetch the specific services for each provider matching the category
    // Reuse catIds from above (must facilitate scope if needed, but for now we reconstruct or assume same scope)
    const matchingServices = await this.servicesRepo.find({
      where: {
        categoryId: In(catIds),
        isActive: true,
        provider: { id: In(ids) },
      },
      relations: ['provider'],
    });

    const servicesByProvider = new Map<string, Service[]>();
    for (const svc of matchingServices) {
      const pid = svc.provider.id;
      if (!servicesByProvider.has(pid)) servicesByProvider.set(pid, []);
      servicesByProvider.get(pid)?.push(svc);
    }

    const results = providers.map((p) => {
      const name = [p.user?.firstName, p.user?.lastName].filter(Boolean).join(' ').trim();
      const pServices = servicesByProvider.get(p.id) || [];

      return {
        id: p.id,
        name: name || p.businessName || 'Provider',
        business: p.businessName || null,
        rating: ratingMap.get(p.id)?.rating ?? 0,
        reviews: ratingMap.get(p.id)?.reviews ?? 0,
        distance: undefined,
        specialties: pServices.map(s => s.name), // Show the service names as "specialties" for this view
        services: pServices.map(s => ({
          id: s.id,
          name: s.name,
          price: s.priceCents,
          duration: s.durationMinutes,
          imageUrl: s.imageUrl
        })),
        price: pServices.length > 0 ? Math.min(...pServices.map(s => s.priceCents)) : undefined, // Min price
        available: p.acceptsSameDayBooking || false,
        verified: p.isVerified || false,
        image: p.coverPhotoUrl || undefined,
        isFavorited: false,
      };
    });

    return { results, categoryName: category.nameDe };
  }

  async searchServices(params: { query?: string; category?: string; limit?: number }) {
    const q = (params.query || '').trim();
    const cat = (params.category || '').trim().toLowerCase();
    const limit = params.limit || 50;

    const qb = this.servicesRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.provider', 'p') // Join provider to get name/avatar
      .leftJoinAndSelect('p.user', 'u') // Provider user details
      .leftJoinAndSelect('s.category', 'c') // Join category for filtering/slug
      .leftJoinAndSelect('p.locations', 'pl') // Join locations
      .leftJoinAndSelect('pl.address', 'pa') // Join address (aliased as pa)
      .where('s.isActive = :isActive', { isActive: true })
      .andWhere('p.isVerified = :isVerified', { isVerified: true }); // Only verified providers

    // Filter by text (Service Name OR Description)
    if (q) {
      const filterLower = `%${q.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(s.name) LIKE :filterLower OR LOWER(s.description) LIKE :filterLower)',
        { filterLower }
      );
    }

    // Filter by Category Slug
    if (cat) {
      // Direct category slug match or legacy
      let legacyId: string | null = null;
      if (cat === 'braids') legacyId = 'cat_braids';
      else if (cat === 'twists') legacyId = 'cat_twists';
      else if (cat === 'locs') legacyId = 'cat_locs';
      else if (cat === 'natural' || cat === 'natural-styling') legacyId = 'cat_natural';
      else if (cat === 'weave' || cat === 'weaves') legacyId = 'cat_weave';

      if (legacyId) {
        qb.andWhere('(c.slug = :cat OR s.categoryId = :legacyId)', { cat, legacyId });
      } else {
        // Also handle 'Alle' or generic cases if needed, but 'Alle' usually sends empty cat
        if (cat !== 'alle' && cat !== 'all') {
          qb.andWhere('c.slug = :cat', { cat });
        }
      }
    }

    qb.orderBy('s.createdAt', 'DESC') // Newest styles first
      .take(limit);

    const services = await qb.getMany();

    // Map to frontend friendly format
    const results = services.map(s => {
      // Resolve City from locations
      const primaryLoc = s.provider.locations?.find(l => l.isPrimary) || s.provider.locations?.[0];
      const city = primaryLoc?.address?.city || 'Berlin';

      return {
        id: s.id,
        name: s.name,
        price: s.priceCents,
        duration: s.durationMinutes,
        imageUrl: s.imageUrl,
        categorySlug: s.category?.slug,
        provider: {
          id: s.provider.id,
          name: [s.provider.user?.firstName, s.provider.user?.lastName].filter(Boolean).join(' ') || s.provider.businessName || 'Provider',
          city,
          isVerified: s.provider.isVerified
        }
      };
    });

    return { results };
  }
}
