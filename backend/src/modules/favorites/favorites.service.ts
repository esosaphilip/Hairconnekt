import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { Review } from '../reviews/entities/review.entity';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepo: Repository<Favorite>,
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,
    @InjectRepository(Service)
    private readonly servicesRepo: Repository<Service>,
  ) { }

  async add(userId: string, providerId: string) {
    const provider = await this.providersRepo.findOne({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');
    const existing = await this.favoritesRepo.findOne({
      where: { client: { id: userId }, provider: { id: providerId } },
      relations: ['client', 'provider'],
    });
    if (existing) return { id: existing.id, providerId };
    const fav = this.favoritesRepo.create({ client: { id: userId } as any, provider: { id: providerId } as any });
    const saved = await this.favoritesRepo.save(fav);
    return { id: saved.id, providerId };
  }

  async remove(userId: string, providerId: string) {
    const fav = await this.favoritesRepo.findOne({
      where: { client: { id: userId }, provider: { id: providerId } },
      relations: ['client', 'provider'],
    });
    if (!fav) return { removed: false };
    await this.favoritesRepo.remove(fav);
    return { removed: true };
  }

  async list(userId: string) {
    const rows = await this.favoritesRepo.find({
      where: { client: { id: userId } },
      relations: ['provider', 'provider.user'],
      order: { createdAt: 'DESC' },
    });
    // Fetch enriched data for each favorite
    const results = await Promise.all(rows.map(async (f) => {
      const providerId = (f.provider as any)?.id;
      if (!providerId) return null;

      // Calculate rating stats
      const { avgRating, count } = await this.reviewsRepo
        .createQueryBuilder('r')
        .select('AVG(r.rating)', 'avgRating')
        .addSelect('COUNT(r.id)', 'count')
        .where('r.provider.id = :pid', { pid: providerId })
        .getRawOne();

      // Calculate price from
      const { minPrice } = await this.servicesRepo
        .createQueryBuilder('s')
        .select('MIN(s.priceCents)', 'minPrice')
        .where('s.provider.id = :pid', { pid: providerId })
        .getRawOne();

      // Fetch specialties (limited query)
      const providerEntity = await this.providersRepo.findOne({
        where: { id: providerId },
        relations: ['specializations']
      });

      return {
        id: f.id,
        providerId: providerId,
        name: [f.provider?.user?.firstName, f.provider?.user?.lastName].filter(Boolean).join(' ').trim() || f.provider?.businessName || 'Provider',
        business: f.provider?.businessName || null,
        image: f.provider?.user?.profilePictureUrl || undefined, // Prefer user profile picture as per ProvidersService
        rating: avgRating ? parseFloat(avgRating) : null,
        reviewCount: count ? parseInt(count, 10) : 0,
        priceFromCents: minPrice ? parseInt(minPrice, 10) : null, // Assuming Service entity has priceCents or similar. Let's verify Service entity.
        specialties: providerEntity?.specializations?.map(s => s.name) || [],
        verified: f.provider?.isVerified || false,
        createdAt: f.createdAt,
      };
    }));

    return results.filter(Boolean);
  }

  async status(userId: string, providerIds: string[]) {
    if (!providerIds?.length) return { favorites: [] as string[] };
    // Filter to valid UUIDs to prevent Postgres errors on invalid uuid syntax
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    const validIds = providerIds.filter((id) => uuidRegex.test(id));
    if (!validIds.length) return { favorites: [] as string[] };
    const rows = await this.favoritesRepo.find({
      where: { client: { id: userId }, provider: { id: In(validIds) } },
      relations: ['provider'],
    });
    return { favorites: rows.map((r) => (r.provider as any).id) };
  }
}