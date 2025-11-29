import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepo: Repository<Favorite>,
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
  ) {}

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
    return rows.map((f) => ({
      id: f.id,
      providerId: (f.provider as any)?.id,
      name: [f.provider?.user?.firstName, f.provider?.user?.lastName].filter(Boolean).join(' ').trim() || f.provider?.businessName || 'Provider',
      business: f.provider?.businessName || null,
      image: f.provider?.coverPhotoUrl || undefined,
      createdAt: f.createdAt,
    }));
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