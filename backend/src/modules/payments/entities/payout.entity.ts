import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';
import { BankAccount } from './bank-account.entity';

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProviderProfile, (provider: ProviderProfile) => provider.id, { onDelete: 'CASCADE' })
  provider: ProviderProfile;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents: number;

  @Column({ name: 'currency', type: 'varchar', length: 10, default: 'eur' })
  currency: string;

  @Column({ type: 'enum', enum: PayoutStatus })
  status: PayoutStatus;

  @ManyToOne(() => BankAccount, { onDelete: 'RESTRICT' })
  bankAccount: BankAccount;

  @Column({ name: 'requested_at', type: 'timestamptz' })
  requestedAt: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt?: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date | null;

  @Column({ name: 'payout_reference', type: 'varchar', length: 255, nullable: true })
  payoutReference?: string | null;

  @Column({ name: 'stripe_payout_id', type: 'varchar', length: 255, nullable: true })
  stripePayoutId?: string | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string | null;
}