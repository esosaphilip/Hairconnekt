import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { User } from '../../users/entities/user.entity';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';
import { ReviewImage } from './review-image.entity';

@Unique('uq_reviews_appointment', ['appointment'])
@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => ProviderProfile, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @Column({ name: 'is_anonymous', type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ name: 'provider_response', type: 'text', nullable: true })
  providerResponse?: string | null;

  @Column({ name: 'provider_responded_at', type: 'timestamptz', nullable: true })
  providerRespondedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ReviewImage, (img: ReviewImage) => img.review, { cascade: true })
  images?: ReviewImage[];

  // --- Domain Methods ---

  /**
   * Update the provider's response to the review.
   */
  respond(response: string) {
    const text = (response ?? '').trim();
    this.providerResponse = text.length > 0 ? text : null;
    this.providerRespondedAt = text.length > 0 ? new Date() : null;
  }
}