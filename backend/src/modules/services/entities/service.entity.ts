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
import { BadRequestException } from '@nestjs/common';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';
import { ServiceCategory } from './service-category.entity';

export enum PriceType {
  FIXED = 'fixed',
  FROM = 'from',
  RANGE = 'range',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId?: string;

  @ManyToOne(() => ProviderProfile, (provider) => provider.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId?: string | null;

  @ManyToOne(() => ServiceCategory)
  @JoinColumn({ name: 'category_id' })
  category?: ServiceCategory;

  @Column('text', { array: true, nullable: true })
  tags?: string[];


  @Index()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number;

  @Column({ name: 'price_type', type: 'varchar', default: 'fixed' })
  priceType: string;

  @Column({ name: 'price_max_cents', type: 'int', nullable: true })
  priceMaxCents?: number | null;

  @Column({ name: 'image_url', type: 'varchar', length: 1024, nullable: true })
  imageUrl?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'allow_online_booking', type: 'boolean', default: true })
  allowOnlineBooking: boolean;

  @Column({ name: 'requires_consultation', type: 'boolean', default: false })
  requiresConsultation: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // --- Domain Methods ---

  /**
   * Factory method to create a new Service.
   * Enforces business rules like non-negative price and positive duration.
   */
  static create(
    provider: ProviderProfile,
    name: string,
    description: string,
    durationMinutes: number,
    priceCents: number,
    priceType: PriceType,
    categoryId?: string,
    priceMaxCents?: number,
    imageUrl?: string,
  ): Service {
    if (priceCents < 0) {
      throw new BadRequestException('Price cannot be negative');
    }
    if (durationMinutes <= 0) {
      throw new BadRequestException('Duration must be positive');
    }
    if (priceType === PriceType.RANGE && (!priceMaxCents || priceMaxCents <= priceCents)) {
      throw new BadRequestException('Max price must be greater than price for RANGE type');
    }

    const service = new Service();
    service.provider = provider;
    service.name = name;
    service.description = description;
    service.durationMinutes = durationMinutes;
    service.priceCents = priceCents;
    service.priceType = priceType;
    service.categoryId = categoryId || null;
    service.priceMaxCents = priceMaxCents || null;
    service.imageUrl = imageUrl || null;
    service.isActive = true;
    service.displayOrder = 0; // Default

    return service;
  }
}