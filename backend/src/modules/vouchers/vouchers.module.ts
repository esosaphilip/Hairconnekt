import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { Voucher } from './entities/voucher.entity';
import { VoucherUsage } from './entities/voucher-usage.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Voucher, VoucherUsage])],
    controllers: [VouchersController],
    providers: [VouchersService],
    exports: [VouchersService],
})
export class VouchersModule { }
