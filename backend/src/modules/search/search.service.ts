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
    // 1. Find category
    const category = await this.categoryRepo.findOne({ where: { slug, isActive: true } });
    if (!category) {
      return { results: [] };
    }

    // 2. Find providers with at least one active service in this category
    const providers = await this.providersRepo
      .createQueryBuilder('p')
      .innerJoin('p.services', 's')
      .innerJoinAndSelect('p.user', 'u')
      .where('s.category_id = :catId', { catId: category.id })
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
    const matchingServices = await this.servicesRepo.find({
      where: {
        category: { id: category.id },
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
}
