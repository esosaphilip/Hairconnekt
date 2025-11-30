import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';
import { ServiceCategory } from './service-category.entity';

export enum PriceType {
  FIXED = 'FIXED',
  FROM = 'FROM',
  RANGE = 'RANGE',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProviderProfile, (provider) => provider.services, { onDelete: 'CASCADE' })
  @Index()
  // Align with existing DB schema (snake_case)
  // provider_id references provider_profiles.id
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  // Make category optional to match CreateServiceDto where categoryId is optional
  // Note: DB constraint may still be NOT NULL; creation without category should be avoided
  @ManyToOne(() => ServiceCategory, { onDelete: 'RESTRICT', nullable: true })
  @Index()
  @JoinColumn({ name: 'category_id' })
  category?: ServiceCategory | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number;

  @Column({ name: 'price_type', type: 'enum', enum: PriceType })
  priceType: PriceType;

  @Column({ name: 'price_max_cents', type: 'int', nullable: true })
  priceMaxCents?: number | null;

  @Column({ name: 'image_url', type: 'varchar', length: 1024, nullable: true })
  imageUrl?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
