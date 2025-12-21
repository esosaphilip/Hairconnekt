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
import { BadRequestException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';
import { Address } from '../../users/entities/address.entity';
import { AppointmentService } from './appointment-service.entity';
import { PortfolioImage } from '../../portfolio/entities/portfolio-image.entity';
import { Service } from '../../services/entities/service.entity';

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

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

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

  // --- Domain Methods ---

  /**
   * Factory method to create a new Appointment.
   * Calculates duration from services and sets initial status.
   */
  static create(
    provider: ProviderProfile,
    client: User,
    services: Service[],
    startTimeIso: string,
    endTimeIso: string,
    notes?: string,
  ): Appointment {
    if (!services || services.length === 0) {
      throw new BadRequestException('At least one service is required');
    }

    const totalDurationMinutes = services.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    // Parse ISO strings to Dates
    const startDate = new Date(startTimeIso);
    const endDate = new Date(endTimeIso);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid start or end time format');
    }

    // Correctly derive appointment date from the start time (YYYY-MM-DD)
    const appointmentDate = startDate.toISOString().split('T')[0];

    const appointment = new Appointment();
    appointment.provider = provider;
    appointment.client = client;
    appointment.startTime = startDate;
    appointment.endTime = endDate;
    appointment.clientNotes = notes;
    appointment.status = AppointmentStatus.PENDING;
    appointment.appointmentDate = appointmentDate;
    appointment.totalDurationMinutes = totalDurationMinutes;
    // Generate a simple unique number for now (should be replaced by a proper sequence generator in prod)
    appointment.appointmentNumber = `APT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create AppointmentService relations
    appointment.appointmentServices = services.map((service) => {
      const as = new AppointmentService();
      as.service = service;
      as.serviceName = service.name;
      as.durationMinutes = service.durationMinutes;
      as.priceCents = service.priceCents;
      as.appointment = appointment;
      return as;
    });

    return appointment;
  }

  /**
   * Domain getter: Calculate hours until appointment starts
   */
  get hoursUntil(): number {
    try {
      if (!this.startTime) return 0;
      // If startTime is already a Date object (due to timestamptz)
      const start = this.startTime instanceof Date ? this.startTime : new Date(this.startTime);
      const now = new Date();
      const diffMs = start.getTime() - now.getTime();
      return Math.round(diffMs / (1000 * 60 * 60));
    } catch (e) {
      return 0;
    }
  }
}