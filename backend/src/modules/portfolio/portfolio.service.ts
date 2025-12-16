import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { PortfolioImage, HairLength } from './entities/portfolio-image.entity';
import { PortfolioImageLike } from './entities/portfolio-image-like.entity';
import { SavedPortfolioImage } from './entities/saved-portfolio-image.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { User } from '../users/entities/user.entity';
import { UploadImageDto } from './dto/upload-image.dto';
import { LikeImageDto } from './dto/like-image.dto';
import { StorageService } from '../storage/storage.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppCacheService } from '../cache/cache.service';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly storage: StorageService,
    @InjectRepository(PortfolioImage)
    private readonly imagesRepo: Repository<PortfolioImage>,
    @InjectRepository(PortfolioImageLike)
    private readonly likesRepo: Repository<PortfolioImageLike>,
    @InjectRepository(SavedPortfolioImage)
    private readonly savedRepo: Repository<SavedPortfolioImage>,
    @InjectRepository(ProviderProfile)
    private readonly providerRepo: Repository<ProviderProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Appointment)
    private readonly apptRepo: Repository<Appointment>,
    private readonly cache: AppCacheService,
  ) {}

  // Creates a new portfolio image entry for a provider. Image storage integration
  // can be added later; for now we accept a direct imageUrl in the DTO.
  async upload(dto: UploadImageDto) {
    const provider = await this.providerRepo.findOne({ where: { id: dto.providerId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Compute next display order for this provider (1-based)
    const raw = await this.imagesRepo
      .createQueryBuilder('img')
      .where('img.provider_id = :pid', { pid: provider.id })
      .select('MAX(img.display_order)', 'max')
      .getRawOne<{ max: string | null }>();
    const nextDisplayOrder = raw?.max ? Number(raw.max) + 1 : 1;

    const image = this.imagesRepo.create({
      provider,
      imageUrl: dto.imageUrl,
      thumbnailUrl: dto.imageUrl,
      caption: dto.caption ?? null,
      isPublic: true,
      isFeatured: false,
      viewCount: 0,
      likeCount: 0,
      bookingCount: 0,
      displayOrder: nextDisplayOrder,
    });

    const saved = await this.imagesRepo.save(image);
    // Invalidate discover caches since a new public image may appear in lists
    await this.cache.deleteByPrefix('portfolio:discover');
    return saved;
  }

  // Likes an image for a user. Idempotent: if already liked, does nothing.
  async like(dto: LikeImageDto) {
    const image = await this.imagesRepo.findOne({ where: { id: dto.imageId } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let created = false;
    let likeCount: number = image.likeCount ?? 0;

    await this.dataSource.transaction(async (manager) => {
      // Check if like exists within the transaction
      const existing = await manager.findOne(PortfolioImageLike, {
        where: { image: { id: image.id }, user: { id: user.id } },
      });
      if (existing) {
        created = false;
        // Fetch the latest like count to return an accurate number
        const fresh = await manager.findOne(PortfolioImage, { where: { id: image.id } });
        likeCount = fresh?.likeCount ?? likeCount;
        return;
      }

      await manager.save(
        manager.create(PortfolioImageLike, {
          image: { id: image.id } as any,
          user: { id: user.id } as any,
        }),
      );

      // Atomic increment using SQL expression
      await manager
        .createQueryBuilder()
        .update(PortfolioImage)
        .set({ likeCount: () => '"like_count" + 1' })
        .where('id = :id', { id: image.id })
        .execute();

      const fresh = await manager.findOne(PortfolioImage, { where: { id: image.id } });
      likeCount = fresh?.likeCount ?? likeCount + 1;
      created = true;
    });

    const res = {
      imageId: image.id,
      liked: true,
      newlyCreated: created,
      likeCount,
    };
    // Invalidate analytics for this image and discover lists reflecting popularity
    await this.cache.del(`portfolio:analytics:${image.id}`);
    await this.cache.deleteByPrefix('portfolio:discover');
    return res;
  }

  // Unlike an image for a user. Idempotent: if no like exists, does nothing.
  async unlike(imageId: string, userId: string) {
    const image = await this.imagesRepo.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let removed = false;
    let likeCount: number = image.likeCount ?? 0;
    await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(PortfolioImageLike, {
        where: { image: { id: image.id }, user: { id: user.id } },
      });
      if (!existing) {
        const fresh = await manager.findOne(PortfolioImage, { where: { id: image.id } });
        likeCount = fresh?.likeCount ?? likeCount;
        removed = false;
        return;
      }

      await manager.remove(existing);
      await manager
        .createQueryBuilder()
        .update(PortfolioImage)
        .set({ likeCount: () => 'GREATEST("like_count" - 1, 0)' })
        .where('id = :id', { id: image.id })
        .execute();

      const fresh = await manager.findOne(PortfolioImage, { where: { id: image.id } });
      likeCount = fresh?.likeCount ?? Math.max(likeCount - 1, 0);
      removed = true;
    });

    const res = { imageId: image.id, liked: false, removed, likeCount };
    await this.cache.del(`portfolio:analytics:${image.id}`);
    await this.cache.deleteByPrefix('portfolio:discover');
    return res;
  }

  // Save a portfolio image to user's favorites. Idempotent.
  async saveImage(imageId: string, userId: string) {
    const image = await this.imagesRepo.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let created = false;
    await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(SavedPortfolioImage, {
        where: { image: { id: image.id }, user: { id: user.id } },
      });
      if (existing) return;
      const entity = manager.create(SavedPortfolioImage, {
        image: { id: image.id } as any,
        user: { id: user.id } as any,
      });
      await manager.save(entity);
      created = true;
    });

    const res = { imageId: image.id, saved: true, newlyCreated: created };
    await this.cache.del(`portfolio:analytics:${image.id}`);
    await this.cache.deleteByPrefix('portfolio:discover');
    return res;
  }

  // Unsave a portfolio image for a user. Idempotent.
  async unsaveImage(imageId: string, userId: string) {
    const image = await this.imagesRepo.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let removed = false;
    await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(SavedPortfolioImage, {
        where: { image: { id: image.id }, user: { id: user.id } },
      });
      if (!existing) return;
      await manager.remove(existing);
      removed = true;
    });

    const res = { imageId: image.id, saved: false, removed };
    await this.cache.del(`portfolio:analytics:${image.id}`);
    await this.cache.deleteByPrefix('portfolio:discover');
    return res;
  }

  // List a provider's portfolio with pagination, filters, and sorting
  async listProviderPortfolio(
    providerId: string,
    options: { page?: number; limit?: number; styleFilter?: string; sort?: string },
  ) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const qb = this.imagesRepo
      .createQueryBuilder('img')
      .leftJoinAndSelect('img.category', 'category')
      .where('img.provider_id = :pid', { pid: providerId });

    if (options.styleFilter) {
      const filter = `%${options.styleFilter}%`;
      qb.andWhere(
        '(img.caption ILIKE :filter OR CAST(img.custom_tags AS TEXT) ILIKE :filter OR category.nameDe ILIKE :filter OR COALESCE(category.nameEn, \'\') ILIKE :filter)',
        { filter },
      );
    }

    switch ((options.sort || 'latest').toLowerCase()) {
      case 'popular':
        qb.orderBy('img.likeCount', 'DESC').addOrderBy('img.uploadedAt', 'DESC');
        break;
      case 'featured':
        qb.orderBy('img.isFeatured', 'DESC').addOrderBy('img.uploadedAt', 'DESC');
        break;
      default:
        qb.orderBy('img.uploadedAt', 'DESC');
    }

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return {
      page,
      limit,
      total,
      items,
    };
  }

  // Upload via multipart file; returns created PortfolioImage
  async uploadMultipart(
    providerId: string,
    file: { buffer: Buffer; originalname: string },
    fields: { caption?: string; tags?: string | string[]; metadata?: any },
  ) {
    const provider = await this.providerRepo.findOne({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');
    if (!file?.buffer || !file?.originalname) throw new BadRequestException('Image file is required');

    const { url } = await this.storage.uploadImage(providerId, file.buffer, file.originalname);

    // Compute next display order
    const raw = await this.imagesRepo
      .createQueryBuilder('img')
      .where('img.provider_id = :pid', { pid: provider.id })
      .select('MAX(img.display_order)', 'max')
      .getRawOne<{ max: string | null }>();
    const nextDisplayOrder = raw?.max ? Number(raw.max) + 1 : 1;

    // Parse tags and metadata
    let customTags: string[] | undefined;
    if (Array.isArray(fields.tags)) customTags = fields.tags as string[];
    else if (typeof fields.tags === 'string') {
      try {
        // allow JSON string or comma-separated
        if (fields.tags.trim().startsWith('[')) customTags = JSON.parse(fields.tags);
        else customTags = fields.tags.split(',').map((s) => s.trim()).filter(Boolean);
      } catch {
        customTags = fields.tags.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    let meta: any = undefined;
    if (typeof fields.metadata === 'string') {
      try {
        meta = JSON.parse(fields.metadata);
      } catch {
        meta = undefined;
      }
    } else if (fields.metadata && typeof fields.metadata === 'object') {
      meta = fields.metadata;
    }

    const image = this.imagesRepo.create({
      provider,
      imageUrl: url,
      thumbnailUrl: url,
      caption: fields.caption ?? null,
      customTags: customTags?.length ? customTags : null,
      hairLength: (meta?.hairLength && Object.values(HairLength).includes(meta.hairLength))
        ? meta.hairLength
        : null,
      hairTypeTags: Array.isArray(meta?.hairTypeTags) ? meta.hairTypeTags : null,
      durationMinutes: typeof meta?.durationMinutes === 'number' ? meta.durationMinutes : null,
      priceMinCents: typeof meta?.priceMinCents === 'number' ? meta.priceMinCents : null,
      priceMaxCents: typeof meta?.priceMaxCents === 'number' ? meta.priceMaxCents : null,
      isPublic: meta?.isPublic === false ? false : true,
      isFeatured: meta?.isFeatured === true ? true : false,
      displayOrder: nextDisplayOrder,
    });
    const saved = await this.imagesRepo.save(image);
    await this.cache.deleteByPrefix('portfolio:discover');
    return saved;
  }

  // Update portfolio image. For now, enforce ownership via providerId argument
  async updateImage(
    id: string,
    providerId: string,
    updates: { caption?: string; tags?: string | string[]; metadata?: any },
  ) {
    const image = await this.imagesRepo.findOne({ where: { id }, relations: ['provider'] });
    if (!image) throw new NotFoundException('Image not found');
    if (providerId && image.provider?.id !== providerId)
      throw new BadRequestException('Provider does not own this image');

    let customTags: string[] | undefined;
    if (Array.isArray(updates.tags)) customTags = updates.tags as string[];
    else if (typeof updates.tags === 'string') {
      try {
        if (updates.tags.trim().startsWith('[')) customTags = JSON.parse(updates.tags);
        else customTags = updates.tags.split(',').map((s) => s.trim()).filter(Boolean);
      } catch {
        customTags = updates.tags.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    let meta: any = undefined;
    if (typeof updates.metadata === 'string') {
      try { meta = JSON.parse(updates.metadata); } catch { meta = undefined; }
    } else if (updates.metadata && typeof updates.metadata === 'object') {
      meta = updates.metadata;
    }

    if (typeof updates.caption !== 'undefined') image.caption = updates.caption ?? null;
    if (typeof customTags !== 'undefined') image.customTags = customTags?.length ? customTags : null;
    if (meta) {
      if (meta.hairLength && Object.values(HairLength).includes(meta.hairLength)) image.hairLength = meta.hairLength;
      if (Array.isArray(meta.hairTypeTags)) image.hairTypeTags = meta.hairTypeTags;
      if (typeof meta.durationMinutes === 'number') image.durationMinutes = meta.durationMinutes;
      if (typeof meta.priceMinCents === 'number') image.priceMinCents = meta.priceMinCents;
      if (typeof meta.priceMaxCents === 'number') image.priceMaxCents = meta.priceMaxCents;
      if (typeof meta.isPublic === 'boolean') image.isPublic = meta.isPublic;
      if (typeof meta.isFeatured === 'boolean') image.isFeatured = meta.isFeatured;
    }

    const saved = await this.imagesRepo.save(image);
    await this.cache.del(`portfolio:analytics:${image.id}`);
    await this.cache.deleteByPrefix('portfolio:discover');
    return saved;
  }

  // Delete image by id with simple ownership check
  async deleteImage(id: string, providerId: string) {
    const image = await this.imagesRepo.findOne({ where: { id }, relations: ['provider'] });
    if (!image) throw new NotFoundException('Image not found');
    if (providerId && image.provider?.id !== providerId)
      throw new BadRequestException('Provider does not own this image');
    await this.imagesRepo.remove(image);
    await this.cache.del(`portfolio:analytics:${image.id}`);
    await this.cache.deleteByPrefix('portfolio:discover');
    return { success: true };
  }

  // Discover curated feed with basic ranking and optional simple filters
  async discover(options: {
    page?: number;
    limit?: number;
    filters?: string; // free-text
    location?: string; // "lat,lon" currently unused
  }) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const qb = this.imagesRepo
      .createQueryBuilder('img')
      .leftJoinAndSelect('img.category', 'category')
      .leftJoinAndSelect('img.provider', 'provider')
      .where('img.is_public = true');

    if (options.filters) {
      const filter = `%${options.filters}%`;
      qb.andWhere(
        '(img.caption ILIKE :filter OR CAST(img.custom_tags AS TEXT) ILIKE :filter OR category.nameDe ILIKE :filter OR COALESCE(category.nameEn, \'\') ILIKE :filter)',
        { filter },
      );
    }

    qb.orderBy('img.isFeatured', 'DESC')
      .addOrderBy('img.likeCount', 'DESC')
      .addOrderBy('img.uploadedAt', 'DESC');

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { page, limit, total, items };
  }

  // Analytics for a single image
  async analytics(imageId: string) {
    const image = await this.imagesRepo.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');

    const [likes, saves, bookings] = await Promise.all([
      this.likesRepo.count({ where: { image: { id: imageId } } as any }),
      this.savedRepo.count({ where: { image: { id: imageId } } as any }),
      this.apptRepo.count({ where: { portfolioImage: { id: imageId } } as any }),
    ]);

    return {
      imageId,
      viewCount: image.viewCount,
      likeCount: image.likeCount,
      bookingCount: image.bookingCount,
      likes,
      saves,
      bookingsLinked: bookings,
      uploadedAt: image.uploadedAt,
      lastUpdatedAt: image.updatedAt,
      isFeatured: image.isFeatured,
      isPublic: image.isPublic,
    };
  }
}