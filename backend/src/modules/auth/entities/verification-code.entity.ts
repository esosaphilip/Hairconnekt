import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum VerificationChannel {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity('verification_codes')
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index('idx_verification_codes_user')
  user: User;

  @Column({ type: 'varchar', length: 10 })
  @Index('idx_verification_codes_channel')
  channel: VerificationChannel;

  // Store the destination used (email address or phone number) for auditability
  @Column({ type: 'varchar', length: 255 })
  destination: string;

  // Hash of the one-time code (sha256 hex)
  @Column({ name: 'code_hash', type: 'varchar', length: 64 })
  codeHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}