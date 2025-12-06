import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProviderLocation } from './provider-location.entity';
import { ProviderLanguage } from './provider-language.entity';
import { ProviderAvailability } from './provider-availability.entity';
// Use absolute path import to improve editor module resolution reliability
import { ProviderTimeOff } from './provider-time-off.entity';
import { Service } from '../../services/entities/service.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

export enum BusinessType {
  INDIVIDUAL = 'INDIVIDUAL',
  SALON = 'SALON',
  BARBER = 'BARBER',
  MOBILE = 'MOBILE',
}

@Entity('provider_profiles')
export class ProviderProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Do not reference inverse property to avoid requiring it on User during startup
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'business_name', type: 'varchar', length: 255, nullable: true })
  businessName?: string | null;

  @Column({ name: 'business_type', type: 'enum', enum: BusinessType })
  businessType: BusinessType;

  @Column({ type: 'text' })
  bio: string;

  @Column({ name: 'years_of_experience', type: 'int', default: 0 })
  yearsOfExperience: number;

  @Column({ name: 'business_registration_number', type: 'varchar', length: 100, nullable: true })
  businessRegistrationNumber?: string | null;

  @Column({ name: 'tax_id', type: 'varchar', length: 100, nullable: true })
  taxId?: string | null;

  @Column({ name: 'cover_photo_url', type: 'varchar', length: 1024, nullable: true })
  coverPhotoUrl?: string | null;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_mobile_service', type: 'boolean', default: false })
  isMobileService: boolean;

  @Column({ name: 'service_radius_km', type: 'int', nullable: true })
  serviceRadiusKm?: number | null;

  @Column({ name: 'accepts_same_day_booking', type: 'boolean', default: false })
  acceptsSameDayBooking: boolean;

  @Column({ name: 'advance_booking_days', type: 'int', default: 30 })
  advanceBookingDays: number;

  @Column({ name: 'buffer_time_minutes', type: 'int', default: 15 })
  bufferTimeMinutes: number;

  @Column({ name: 'min_advance_hours', type: 'int', default: 2 })
  minAdvanceHours: number;

  @Column({ name: 'cancellation_policy', type: 'text' })
  cancellationPolicy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'verification_submitted_at', type: 'timestamptz', nullable: true })
  verificationSubmittedAt?: Date | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt?: Date | null;

  @OneToMany(() => ProviderLocation, (loc: ProviderLocation) => loc.provider, { cascade: true })
  locations?: ProviderLocation[];

  @OneToMany(() => ProviderLanguage, (lang: ProviderLanguage) => lang.provider, { cascade: true })
  languages?: ProviderLanguage[];

  @OneToMany(() => ProviderAvailability, (av: ProviderAvailability) => av.provider, { cascade: true })
  availability?: ProviderAvailability[];

  @OneToMany(() => ProviderTimeOff, (to: ProviderTimeOff) => to.provider, { cascade: true })
  timeOff?: ProviderTimeOff[];

  @OneToMany(() => Service, (svc: Service) => svc.provider)
  services?: Service[];

  @OneToMany(() => Appointment, (appt: Appointment) => appt.provider)
  appointments?: Appointment[];

  // Stripe Connect integration fields
  @Column({ name: 'stripe_account_id', type: 'varchar', length: 255, nullable: true })
  stripeAccountId?: string | null;

  @Column({ name: 'stripe_payouts_enabled', type: 'boolean', default: false })
  stripePayoutsEnabled: boolean;
}
