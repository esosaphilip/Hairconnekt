import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('users/addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async list(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.addressesService.list(userId);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateAddressDto) {
    const userId = (req.user as any)?.sub;
    return this.addressesService.create(userId, dto);
  }

  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    const userId = (req.user as any)?.sub;
    return this.addressesService.update(userId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any)?.sub;
    return this.addressesService.remove(userId, id);
  }

  @Post(':id/default')
  async setDefault(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any)?.sub;
    return this.addressesService.setDefault(userId, id);
  }
}