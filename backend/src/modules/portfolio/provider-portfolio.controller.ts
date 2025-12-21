import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { PortfolioService } from './portfolio.service';
import { ProviderPortfolioListQuery } from './dto/provider-portfolio-list.query';
import { UploadImageMultipartDto } from './dto/upload-image-multipart.dto';
import { UpdatePortfolioImageDto } from './dto/update-portfolio-image.dto';
import { ProviderContextDto } from './dto/provider-context.dto';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('providers')
export class ProviderPortfolioController {
  private readonly logger = new Logger(ProviderPortfolioController.name);

  constructor(
    private readonly portfolioService: PortfolioService,
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
  ) { }

  private async resolveProviderId(req: any): Promise<string> {
    const user = req.user;
    // If the token already has a providerId (e.g. enhanced JWT), use it.
    if (user?.providerId) return user.providerId;

    const userId = user?.sub || user?.id;
    if (!userId) throw new BadRequestException('User ID not found in request');

    try {
      const provider = await this.providersRepo.findOne({ where: { user: { id: userId } } });
      if (!provider) {
        throw new BadRequestException('User is not a registered provider');
      }
      return provider.id;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to resolve provider for user ${userId}`, error);
      throw new InternalServerErrorException('Failed to resolve provider context');
    }
  }

  // GET /api/v1/providers/me/portfolio
  @Get('me/portfolio')
  @UseGuards(JwtAuthGuard)
  async listMyPortfolio(@Req() req: any, @Query() q: ProviderPortfolioListQuery) {
    const providerId = await this.resolveProviderId(req);
    return this.portfolioService.listProviderPortfolio(providerId, {
      page: q.page,
      limit: q.limit,
      styleFilter: q.style_filter,
      sort: q.sort,
    });
  }

  // GET /api/v1/providers/:id/portfolio
  @Get(':id/portfolio')
  list(@Param('id') providerId: string, @Query() q: ProviderPortfolioListQuery) {
    return this.portfolioService.listProviderPortfolio(providerId, {
      page: q.page,
      limit: q.limit,
      styleFilter: q.style_filter,
      sort: q.sort,
    });
  }

  // POST /api/v1/providers/portfolio (multipart)
  @Post('portfolio')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async upload(
    @UploadedFile() file: any,
    @Body() body: UploadImageMultipartDto,
    @Req() req: any,
  ) {
    const providerId = await this.resolveProviderId(req);
    return this.portfolioService.uploadMultipart(providerId, file, {
      caption: body.caption,
      tags: body.tags,
      metadata: body.metadata,
    });
  }

  // PUT /api/v1/providers/portfolio/:id
  @Put('portfolio/:id')
  async update(
    @Param('id') imageId: string,
    @Body() body: UpdatePortfolioImageDto,
  ) {
    return this.portfolioService.updateImage(imageId, body.providerId, {
      caption: body.caption,
      tags: body.tags,
      metadata: body.metadata,
    });
  }

  // DELETE /api/v1/providers/portfolio/:id
  @Delete('portfolio/:id')
  async remove(
    @Param('id') imageId: string,
    @Body() body: ProviderContextDto,
  ) {
    return this.portfolioService.deleteImage(imageId, body.providerId);
  }
}