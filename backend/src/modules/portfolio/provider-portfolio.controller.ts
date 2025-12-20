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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PortfolioService } from './portfolio.service';
import { ProviderPortfolioListQuery } from './dto/provider-portfolio-list.query';
import { UploadImageMultipartDto } from './dto/upload-image-multipart.dto';
import { UpdatePortfolioImageDto } from './dto/update-portfolio-image.dto';
import { ProviderContextDto } from './dto/provider-context.dto';

@Controller('providers')
export class ProviderPortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

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
  @UseInterceptors(FileInterceptor('image'))
  async upload(
    @UploadedFile() file: any,
    @Body() body: UploadImageMultipartDto,
  ) {
    return this.portfolioService.uploadMultipart(body.providerId, file, {
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