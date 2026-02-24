import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserType } from '../users/entities/user.entity';
import { Request } from 'express';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('providers/me/services')
export class ServicesController {
  private readonly logger = new Logger(ServicesController.name);

  constructor(private readonly servicesService: ServicesService) { }

  private async resolveProviderId(req: Request & { user: any }): Promise<string> {
    const user = req.user;
    // In strict provider mode, the authenticated user IS the provider (or linked to it)
    if (user.userType === UserType.PROVIDER || user.userType === UserType.BOTH) {
      // Fetch the actual ProviderProfile ID linked to this User ID
      const providerId = await this.servicesService.getProviderIdByUserId(user.sub);
      if (!providerId) {
        throw new BadRequestException('Provider profile not found for this user');
      }
      return providerId;
    }
    throw new BadRequestException('User is not a provider');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  @Get('categories')
  async listCategories() {
    return this.servicesService.listCategories();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  @Post()
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: Request & { user: any },
  ) {
    console.log('[FIRE-DEBUG] POST /providers/me/services HIT');
    console.log('[FIRE-DEBUG] Payload:', JSON.stringify(createServiceDto));
    const providerId = await this.resolveProviderId(req);
    return this.servicesService.create(providerId, createServiceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Req() req: Request & { user: any },
  ) {
    const providerId = await this.resolveProviderId(req);
    return this.servicesService.update(id, providerId, updateServiceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: any },
  ) {
    const providerId = await this.resolveProviderId(req);
    return this.servicesService.delete(id, providerId);
  }
}
