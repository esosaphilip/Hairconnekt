import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Not, In } from 'typeorm';
import { Voucher, DiscountType } from './entities/voucher.entity';
import { VoucherUsage } from './entities/voucher-usage.entity';

@Injectable()
export class VouchersService {
    constructor(
        @InjectRepository(Voucher)
        private readonly voucherRepository: Repository<Voucher>,
        @InjectRepository(VoucherUsage)
        private readonly usageRepository: Repository<VoucherUsage>,
    ) { }

    async list(userId: string, status: 'active' | 'used') {
        if (status === 'used') {
            const usages = await this.usageRepository.find({
                where: { user: { id: userId } as any },
                relations: ['voucher'],
                order: { usedAt: 'DESC' },
            });

            return usages.map(u => ({
                id: u.voucher.id,
                code: u.voucher.code,
                title: 'Eingelöster Gutschein', // Customize if needed
                description: `Gutschein ${u.voucher.code} wurde erfolgreich eingelöst.`,
                discount: u.voucher.discountType === DiscountType.PERCENTAGE ? `-${u.voucher.discountValue}%` : `-€${u.voucher.discountValue / 100}`,
                usedAt: u.usedAt.toISOString(),
                savedAmount: `€${(u.discountAmountCents / 100).toFixed(2)}`,
                minAmount: (u.voucher.minOrderValueCents || 0) / 100,
                expiresAt: u.voucher.validUntil.toISOString(),
            }));
        } else {
            // Logic for ACTIVE vouchers
            // 1. Find all active vouchers valid now
            // 2. Filter out ones used by this user (optional: if 1-time-use per user rule exists)

            const now = new Date();

            // Get IDs used by user
            const used = await this.usageRepository.find({
                where: { user: { id: userId } as any },
                relations: ['voucher']
            });
            const usedIds = used.map(u => u.voucher.id);

            const query = this.voucherRepository.createQueryBuilder('voucher')
                .where('voucher.isActive = :isActive', { isActive: true })
                .andWhere('voucher.validFrom <= :now', { now })
                .andWhere('voucher.validUntil >= :now', { now });

            if (usedIds.length > 0) {
                query.andWhere('voucher.id NOT IN (:...usedIds)', { usedIds });
            }

            const activeVouchers = await query.getMany();

            return activeVouchers.map(v => ({
                id: v.id,
                code: v.code,
                title: 'Verfügbarer Gutschein',
                description: 'Nutze diesen Code bei deiner nächsten Buchung!',
                discount: v.discountType === DiscountType.PERCENTAGE ? `-${v.discountValue}%` : `-€${v.discountValue / 100}`,
                minAmount: (v.minOrderValueCents || 0) / 100,
                expiresAt: v.validUntil.toISOString(),
                applicableTo: 'Alle Services', // Stub logic
            }));
        }
    }

    async redeem(userId: string, code: string): Promise<void> {
        const voucher = await this.voucherRepository.findOne({ where: { code } });

        if (!voucher) {
            throw new NotFoundException('Gutschein nicht gefunden');
        }

        if (!voucher.isActive) throw new BadRequestException('Gutschein ist nicht mehr aktiv');

        const now = new Date();
        if (now < voucher.validFrom || now > voucher.validUntil) {
            throw new BadRequestException('Gutschein ist abgelaufen oder noch nicht gültig');
        }

        const usage = await this.usageRepository.findOne({
            where: { voucher: { id: voucher.id }, user: { id: userId } as any }
        });

        if (usage) {
            throw new BadRequestException('Du hast diesen Gutschein bereits eingelöst.');
        }

        // Limit check logic (if global usage limit exists)
        if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
            throw new BadRequestException('Gutschein wurde bereits vollständig eingelöst.');
        }

        // For "Redeem" action in the VouchersScreen, we might just be verifying it exists
        // OR we are actually creating a usage record (if it's a "Store Credit" style redemption).
        // BUT usually redemption happens at BOOKING/PAYMENT time.
        // The "Redeem" button in VouchersScreen usually means "Add to Wallet".
        // Since we don't have a wallet, we just return Success if valid.
        // Wait, the frontend calls `redeem(code)`. 
        // If I create a Usage record NOW, they can't use it for booking later (double usage check).
        // So for now, I will just Validate it and return success (Maybe "Add to saved list" if I had UserVoucher table).
        // Given current schema (only Usage), I cannot "Save" it without "Using" it.
        // So I will throw an error: "Gutschein ist gültig! Nutze ihn direkt bei der Buchung."
        // OR, I just return success and do nothing, implying it's verified.

        return;
    }
}
