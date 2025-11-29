import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserType } from '../users/entities/user.entity';
import { CreateAccountLinkDto } from './dto/create-account-link.dto';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.CLIENT)
  createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(dto);
  }

  @Post('payout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  requestPayout(@Req() req: Request, @Body() dto: RequestPayoutDto) {
    const userId = (req.user as any)?.sub;
    return this.paymentsService.requestPayout(userId, dto);
  }

  @Post('connect/account-link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  createAccountLink(@Body() dto: CreateAccountLinkDto) {
    return this.paymentsService.createAccountLink(dto.providerId, dto.returnUrl, dto.refreshUrl);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  listUserTransactions(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.paymentsService.listUserTransactions(userId);
  }

  @Get('payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  listProviderPayouts(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.paymentsService.listProviderPayouts(userId);
  }
}