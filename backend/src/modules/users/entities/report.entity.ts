import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';

export enum ReportReason {
    SPAM = 'SPAM',
    HARASSMENT = 'HARASSMENT',
    INAPPROPRIATE = 'INAPPROPRIATE',
    OTHER = 'OTHER',
}

export enum ReportStatus {
    PENDING = 'PENDING',
    REVIEWED = 'REVIEWED',
    ACTION_TAKEN = 'ACTION_TAKEN',
    DISMISSED = 'DISMISSED',
}

@Entity('user_reports')
export class UserReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'reporter_id' })
    reporter: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reported_id' })
    reported: User;

    @Column({
        type: 'enum',
        enum: ReportReason,
    })
    reason: ReportReason;

    @Column('text', { nullable: true })
    details: string;

    @Column({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.PENDING,
    })
    status: ReportStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
