import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';
import { AvailabilitySlot } from './availability-slot.entity';

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  provider: ProviderProfile;

  @Column({ type: 'int', default: 15 })
  bufferTime: number;

  @Column({ type: 'int', default: 30 })
  advanceBookingDays: number;

  @Column({ type: 'boolean', default: true })
  sameDayBooking: boolean;

  @Column({ type: 'int', default: 2 })
  minAdvanceHours: number;

  @OneToMany(() => AvailabilitySlot, (slot) => slot.availability, { cascade: true })
  slots: AvailabilitySlot[];
}
