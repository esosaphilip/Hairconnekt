import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ClientProfile } from './client-profile.entity';
import { BlockedUser } from './blocked-user.entity';
import { Address } from './address.entity';

export enum UserType {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  BOTH = 'BOTH',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'profile_picture_url', type: 'varchar', length: 1024, nullable: true })
  profilePictureUrl?: string | null;

  @Column({ name: 'user_type', type: 'enum', enum: UserType })
  userType: UserType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin?: Date | null;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'phone_verified', type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'preferred_language', type: 'varchar', length: 5, default: 'de' })
  preferredLanguage: string;

  @Column({ name: 'fcm_token', type: 'varchar', length: 1024, nullable: true })
  fcmToken?: string | null;

  @OneToOne(() => ClientProfile, (client) => client.user, { cascade: true })
  clientProfile?: ClientProfile;

  // Temporarily disable relation to ProviderProfile to reduce startup dependencies
  // @OneToOne(() => ProviderProfile, (provider) => provider.user, { cascade: true })
  // providerProfile?: ProviderProfile;

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses?: Address[];

  @OneToMany(() => BlockedUser, (blocked) => blocked.blocker)
  blockedUsers: BlockedUser[];
}