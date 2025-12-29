import { Controller, Get, Post, Body, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('vouchers')
@UseGuards(JwtAuthGuard)
export class VouchersController {
    constructor(private readonly vouchersService: VouchersService) { }

    @Get()
    async list(@Req() req: Request & { user: any }, @Query('status') status: 'active' | 'used') {
        const userId = req.user.sub || req.user.id;
        return { items: await this.vouchersService.list(userId, status) };
    }

    @Post('redeem')
    async redeem(@Req() req: Request & { user: any }, @Body() body: { code: string }) {
        const userId = req.user.sub || req.user.id;
        if (!body.code) throw new BadRequestException('Code is required');
        await this.vouchersService.redeem(userId, body.code);
        return { success: true };
    }
}
