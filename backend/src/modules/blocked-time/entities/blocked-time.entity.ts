import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
// Fix incorrect relative path: this file is nested under `blocked-time/entities`,
// so we need to go up two levels to reach `modules/providers/entities/...`
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';

@Entity('blocked_times')
export class BlockedTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Remove inverse property reference to avoid requiring a non-existent property on ProviderProfile
  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  provider: ProviderProfile;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customReason?: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate?: string;

  @Column({ type: 'time', nullable: true })
  startTime?: string;

  @Column({ type: 'time', nullable: true })
  endTime?: string;

  @Column({ type: 'boolean', default: true })
  allDay: boolean;

  @Column({ type: 'boolean', default: false })
  repeat: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  repeatFrequency?: string;

  @Column({ type: 'simple-array', nullable: true })
  repeatDays?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  repeatEndType?: string;

  @Column({ type: 'date', nullable: true })
  repeatEndDate?: string;

  @Column({ type: 'int', nullable: true })
  repeatCount?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
