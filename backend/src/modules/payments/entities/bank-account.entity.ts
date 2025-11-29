import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProviderProfile, (provider: ProviderProfile) => provider.id, { onDelete: 'CASCADE' })
  provider: ProviderProfile;

  // Sensitive fields (consider encryption at service layer)
  @Column({ name: 'account_holder_name', type: 'varchar', length: 255 })
  accountHolderName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 34 })
  iban: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  bic?: string | null;

  @Column({ name: 'bank_name', type: 'varchar', length: 255 })
  bankName: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  // Stripe external account id for Connect
  @Index()
  @Column({ name: 'stripe_external_account_id', type: 'varchar', length: 255, nullable: true })
  stripeExternalAccountId?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}