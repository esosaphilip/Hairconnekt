import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_settings')
export class ProviderSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'provider_id', type: 'uuid' })
    providerId: string;

    @OneToOne(() => ProviderProfile, (provider) => provider.settings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'provider_id' })
    provider: ProviderProfile;

    // --- Notifications ---
    @Column({ name: 'push_notifications', type: 'boolean', default: true })
    pushNotifications: boolean;

    @Column({ name: 'email_notifications', type: 'boolean', default: true })
    emailNotifications: boolean;

    @Column({ name: 'booking_alerts', type: 'boolean', default: true })
    bookingAlerts: boolean;

    @Column({ name: 'message_alerts', type: 'boolean', default: true })
    messageAlerts: boolean;

    @Column({ name: 'review_alerts', type: 'boolean', default: true })
    reviewAlerts: boolean;

    @Column({ name: 'marketing_emails', type: 'boolean', default: false })
    marketingEmails: boolean;

    // --- Privacy ---
    @Column({ name: 'show_phone_number', type: 'boolean', default: true })
    showPhoneNumber: boolean;

    @Column({ name: 'show_email', type: 'boolean', default: false })
    showEmail: boolean;

    @Column({ name: 'profile_visible', type: 'boolean', default: true })
    profileVisible: boolean;

    // --- Business ---
    @Column({ name: 'auto_accept_bookings', type: 'boolean', default: false })
    autoAcceptBookings: boolean;

    @Column({ name: 'allow_walk_ins', type: 'boolean', default: true })
    allowWalkIns: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
