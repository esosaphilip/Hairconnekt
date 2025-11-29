import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';
import { Address } from '../../users/entities/address.entity';
import { AppointmentService } from './appointment-service.entity';
import { PortfolioImage } from '../../portfolio/entities/portfolio-image.entity';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED_BY_CLIENT = 'CANCELLED_BY_CLIENT',
  CANCELLED_BY_PROVIDER = 'CANCELLED_BY_PROVIDER',
  NO_SHOW = 'NO_SHOW',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'appointment_number', type: 'varchar', length: 50 })
  appointmentNumber: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => ProviderProfile, (provider) => provider.appointments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @Column({ name: 'appointment_date', type: 'date' })
  appointmentDate: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'total_duration_minutes', type: 'int' })
  totalDurationMinutes: number;

  @Column({ type: 'enum', enum: AppointmentStatus })
  status: AppointmentStatus;

  @Column({ name: 'is_mobile_service', type: 'boolean', default: false })
  isMobileService: boolean;

  @ManyToOne(() => Address, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'service_address_id' })
  serviceAddress?: Address | null;

  @Column({ name: 'client_notes', type: 'text', nullable: true })
  clientNotes?: string | null;

  @Column({ name: 'provider_notes', type: 'text', nullable: true })
  providerNotes?: string | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt?: Date | null;

  // Note: cancelledBy relation temporarily removed to match current DB schema
  // If/when the appointments table adds a cancelled_by column, this can be re-enabled.

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt?: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date | null;

  @OneToMany(() => AppointmentService, (as) => as.appointment, { cascade: true })
  appointmentServices?: AppointmentService[];

  @ManyToOne(() => PortfolioImage, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'portfolio_image_id' })
  portfolioImage?: PortfolioImage | null;
}