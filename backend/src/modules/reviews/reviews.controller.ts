import { Body, Controller, Get, Post, Req, UseGuards, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

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
   * Reviews received by the authenticated user's provider profile
   */
  @Get('provider')
  @UseGuards(JwtAuthGuard)
  async providerReviews(@Req() req: Request, @Query() query: any) {
    const userId = (req.user as any)?.sub;
    return this.reviewsService.listProviderReviews(userId, query);
  }
}