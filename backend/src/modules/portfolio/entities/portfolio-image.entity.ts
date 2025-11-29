import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';
import { ServiceCategory } from '../../services/entities/service-category.entity';

export enum HairLength {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG',
  EXTRA_LONG = 'EXTRA_LONG',
}

@Entity('portfolio_images')
export class PortfolioImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_portfolio_images_provider_id')
  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @Column({ name: 'image_url', type: 'varchar', length: 1024 })
  imageUrl: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 1024, nullable: true })
  thumbnailUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  caption?: string | null;

  @Index('idx_portfolio_images_style_category_id')
  @ManyToOne(() => ServiceCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'style_category_id' })
  category?: ServiceCategory | null;

  @Column({ name: 'custom_tags', type: 'jsonb', nullable: true })
  customTags?: string[] | null;

  @Column({
    name: 'hair_length',
    type: 'enum',
    enum: HairLength,
    enumName: 'hair_length_enum',
    nullable: true,
  })
  hairLength?: HairLength | null;

  @Column({ name: 'hair_type_tags', type: 'jsonb', nullable: true })
  hairTypeTags?: string[] | null;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes?: number | null;

  @Column({ name: 'price_min_cents', type: 'int', nullable: true })
  priceMinCents?: number | null;

  @Column({ name: 'price_max_cents', type: 'int', nullable: true })
  priceMaxCents?: number | null;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'booking_count', type: 'int', default: 0 })
  bookingCount: number;

  @Column({ name: 'display_order', type: 'int' })
  displayOrder: number;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamptz' })
  uploadedAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}