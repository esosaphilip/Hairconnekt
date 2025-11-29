import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Voucher } from './voucher.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('voucher_usage')
export class VoucherUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Voucher, { onDelete: 'CASCADE' })
  voucher: Voucher;

  @ManyToOne(() => Appointment, { onDelete: 'RESTRICT' })
  appointment: Appointment;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  user: User;

  @Column({ name: 'discount_amount_cents', type: 'int' })
  discountAmountCents: number;

  @Column({ name: 'used_at', type: 'timestamptz' })
  usedAt: Date;
}