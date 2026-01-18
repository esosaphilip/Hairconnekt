import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';
import { User } from '../../users/entities/user.entity';

@Entity('provider_clients')
export class ProviderClient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => ProviderProfile, (provider) => provider.clients, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'provider_id' })
    provider: ProviderProfile;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    // Manual details for clients not in the system (or overrides)
    @Column({ name: 'first_name', nullable: true })
    firstName?: string;

    @Column({ name: 'last_name', nullable: true })
    lastName?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'is_vip', default: false })
    isVIP: boolean;

    @Column({ name: 'is_blocked', default: false })
    isBlocked: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
