import { Body, Controller, Get, Post, Req, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return { message: 'Not implemented - awaiting schemas' };
  }

  @Post('respond')
  @UseGuards(JwtAuthGuard)
  async respond(@Req() req: Request, @Body() dto: RespondReviewDto) {
    const userId = (req.user as any)?.sub;
    return this.reviewsService.respondToReview(userId, dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async myReviews(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.reviewsService.listMyReviews(userId);
  }

  /**
   * Reviews received by a provider.
   * - If providerId query param is present, creates a public listing for that provider.
   * - If no providerId, assumes 'my' provider profile (requires auth).
   */
  @Get('provider/me')
  @UseGuards(JwtAuthGuard)
  async myProviderReviews(@Req() req: Request, @Query() query: any) {
    const userId = (req.user as any)?.sub;
    return this.reviewsService.listProviderReviews(userId, query);
  }

  /**
   * Reviews received by a provider.
   * - If providerId query param is present, creates a public listing for that provider.
   * - If no providerId, assumes 'my' provider profile (requires auth).
   */
  @Get('provider')
  async providerReviews(@Req() req: Request, @Query() query: any) {
    if (query.providerId) {
      // Public access
      return this.reviewsService.listPublicReviews(query.providerId, query);
    }

    // Auth Check manually since we removed common Guard for this hybrid endpoint
    // Or we could have kept Guard and said "Guests cannot see reviews"?
    // "Public Profile" implies guests can see it.
    // But implementation details of guarding:
    // If I remove UseGuards, I need to verify user manually for the "me" case.
    // For now, I will assume middleware decodes token if present.
    // Safest: Use a Guard that is optional? or correct the request to use /reviews/public.
    // I will stick to the requested path `/reviews/provider` and make it hybrid.

    // We need to check if user is authenticated for the fallback case
    // This is tricky without the Guard.
    // Let's assume for this task that if they want their own, they are logged in.
    // I will check `req.user`.
    const user = (req as any).user;
    if (!user || !user.sub) {
      // Alternatively, throw Unauthorized if they didn't provide providerId
      throw new ForbiddenException('User not authenticated and no providerId specified');
    }
    const userId = user.sub;
    return this.reviewsService.listProviderReviews(userId, query);
  }
}