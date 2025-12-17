import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';
import { BadRequestException } from '@nestjs/common';

@Entity('provider_availability')
export class ProviderAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProviderProfile, (provider) => provider.availability, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  // 0 = Monday, 6 = Sunday
  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Factory method to create a valid availability object.
   * Validates time format and that start < end.
   */
  static create(dayOfWeek: number, startTime: string, endTime: string): Partial<ProviderAvailability> {
    const start = ProviderAvailability.normalizeTime(startTime);
    const end = ProviderAvailability.normalizeTime(endTime);

    if (!start || !end) {
      throw new BadRequestException(`Ungültiges Zeitformat: start=${startTime}, end=${endTime}`);
    }
    if (start >= end) {
      throw new BadRequestException('Startzeit muss vor der Endzeit liegen');
    }

    return {
      dayOfWeek,
      startTime: start,
      endTime: end,
      isActive: true,
    };
  }

  /** Helper: normalize HH:mm to HH:mm:ss */
  private static normalizeTime(t?: string): string | null {
    if (!t) return null;
    const m = t.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
    if (!m) return null;
    const hh = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const ss = (m[3] ?? '00').padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
}