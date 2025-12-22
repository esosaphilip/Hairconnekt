import { ForbiddenException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { RespondReviewDto } from './dto/respond-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,
  ) { }

  private readonly logger = new Logger(ReviewsService.name);

  async listMyReviews(userId: string) {
    try {
      const reviews = await this.reviewsRepo.find({
        where: { client: { id: userId } },
        relations: {
          appointment: true,
          provider: { user: true },
          images: true,
        },
        order: { createdAt: 'DESC' },
      });

      return reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isAnonymous: r.isAnonymous,
        providerResponse: r.providerResponse,
        createdAt: r.createdAt,
        appointmentId: r.appointment?.id,
        provider: r.provider
          ? {
            id: r.provider.id,
            name: `${r.provider.user?.firstName ?? ''} ${r.provider.user?.lastName ?? ''}`.trim(),
            avatarUrl: r.provider.user?.profilePictureUrl ?? null,
          }
          : null,
        images: (r.images ?? []).map((img) => ({ id: img.id, url: img.imageUrl, order: img.displayOrder })),
      }));
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (/no such table/i.test(msg) || /relation .* does not exist/i.test(msg)) {
        this.logger.warn(`Reviews schema not available; returning empty list for user ${userId}: ${msg}`);
        return [];
      }
      this.logger.warn(`Failed to list my reviews for user ${userId}: ${msg}`);
      return [];
    }
  }

  /**
   * List reviews received by the provider account of the authenticated user
   */
  async listProviderReviews(userId: string, query?: any) {
    try {
      const qb = this.reviewsRepo
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.appointment', 'a')
        .leftJoinAndSelect('a.appointmentServices', 'as')
        .leftJoinAndSelect('r.provider', 'p')
        .leftJoinAndSelect('p.user', 'pu')
        .leftJoinAndSelect('r.client', 'c')
        .leftJoinAndSelect('r.images', 'ri')
        .where('pu.id = :userId', { userId })
        .orderBy('r.createdAt', 'DESC');

      // Optional filters
      const filter = (query?.filter || '').toString();
      if (filter === 'unresponded') {
        qb.andWhere('r.providerResponse IS NULL');
      } else if (filter === '5stars') {
        qb.andWhere('r.rating = :five', { five: 5 });
      } else if (filter === 'with-photos') {
        qb.andWhere('ri.id IS NOT NULL');
      }

      // Pagination
      const limitNum = Math.max(1, Math.min(100, parseInt(query?.limit ?? '20', 10) || 20));
      const pageNum = Math.max(1, parseInt(query?.page ?? '1', 10) || 1);
      qb.take(limitNum).skip((pageNum - 1) * limitNum);

      const reviews = await qb.getMany();

      return reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isAnonymous: r.isAnonymous,
        providerResponse: r.providerResponse,
        createdAt: r.createdAt,
        appointmentId: r.appointment?.id,
        appointment: r.appointment
          ? {
            id: r.appointment.id,
            date: r.appointment.appointmentDate,
            startTime: r.appointment.startTime,
            endTime: r.appointment.endTime,
            services: (r.appointment.appointmentServices || []).map((s) => ({ name: s.serviceName, priceCents: s.priceCents })),
          }
          : null,
        client: r.isAnonymous
          ? null
          : {
            id: r.client?.id,
            name: `${r.client?.firstName ?? ''} ${r.client?.lastName ?? ''}`.trim(),
            avatarUrl: r.client?.profilePictureUrl ?? null,
          },
        images: (r.images ?? []).map((img) => ({ id: img.id, url: img.imageUrl, order: img.displayOrder })),
      }));
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (/no such table/i.test(msg) || /relation .* does not exist/i.test(msg)) {
        this.logger.warn(`Reviews schema not available; returning empty provider reviews for user ${userId}: ${msg}`);
        return [];
      }
      this.logger.warn(`Failed to list provider reviews for user ${userId}: ${msg}`);
      return [];
    }
  }

  /**
   * Allow providers to respond to a review that belongs to their profile
   */
  async respondToReview(userId: string, dto: RespondReviewDto) {
    const qb = this.reviewsRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.provider', 'p')
      .leftJoinAndSelect('p.user', 'pu')
      .where('r.id = :rid', { rid: dto.reviewId });

    const review = await qb.getOne();
    if (!review) throw new NotFoundException('Review not found');
    if (!review.provider || (review.provider.user as any)?.id !== userId) {
      throw new ForbiddenException('Not allowed to respond to this review');
    }

    review.respond(dto.response ?? '');
    await this.reviewsRepo.save(review);


    return {
      id: review.id,
      providerResponse: review.providerResponse,
      providerRespondedAt: review.providerRespondedAt,
    };
  }

  async listPublicReviews(providerId: string, query?: any) {
    try {
      const qb = this.reviewsRepo
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.appointment', 'a')
        .leftJoinAndSelect('a.appointmentServices', 'as')
        .leftJoinAndSelect('r.provider', 'p')
        .leftJoinAndSelect('r.client', 'c')
        .leftJoinAndSelect('r.images', 'ri')
        .where('p.id = :providerId', { providerId })
        .orderBy('r.createdAt', 'DESC');

      // Optional filters
      const filter = (query?.filter || '').toString();
      if (filter === '5stars') {
        qb.andWhere('r.rating = :five', { five: 5 });
      } else if (filter === 'with-photos') {
        qb.andWhere('ri.id IS NOT NULL');
      }

      // Pagination
      const limitNum = Math.max(1, Math.min(100, parseInt(query?.limit ?? '20', 10) || 20));
      const pageNum = Math.max(1, parseInt(query?.page ?? '1', 10) || 1);
      qb.take(limitNum).skip((pageNum - 1) * limitNum);

      const reviews = await qb.getMany();

      return reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isAnonymous: r.isAnonymous,
        providerResponse: r.providerResponse,
        createdAt: r.createdAt,
        client: r.isAnonymous
          ? null
          : {
            id: r.client?.id,
            name: `${r.client?.firstName ?? ''} ${r.client?.lastName ?? ''}`.trim(),
            avatarUrl: r.client?.profilePictureUrl ?? null,
          },
        images: (r.images ?? []).map((img) => ({ id: img.id, url: img.imageUrl, order: img.displayOrder })),
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to list public reviews for provider ${providerId}: ${err.message}`);
      return [];
    }
  }
}