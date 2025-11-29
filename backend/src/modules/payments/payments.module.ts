import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { Payment } from './entities/payment.entity';
import { Payout } from './entities/payout.entity';
import { BankAccount } from './entities/bank-account.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Payout, BankAccount, ProviderProfile])],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService],
  exports: [PaymentsService],
})
export class PaymentsModule {}