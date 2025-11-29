import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index('idx_refresh_token_user')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Store ONLY the hash of the refresh token; unique for fast lookup
  @Index('uq_refresh_token_hash', { unique: true })
  @Column({ name: 'token_hash', type: 'text' })
  tokenHash: string;

  // Optional legacy column to ease migration; will be nullable going forward
  @Column({ name: 'token', type: 'text', nullable: true })
  token?: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}