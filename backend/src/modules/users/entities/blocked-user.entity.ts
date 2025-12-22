import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('blocked_users')
@Index(['blocker', 'blocked'], { unique: true }) // Composite index to prevent duplicate blocks
export class BlockedUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.blockedUsers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'blocker_id' })
    blocker: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' }) // Unidirectional relationship is sufficient for 'blocked' side usually, unless we need to traverse from blocked user
    @JoinColumn({ name: 'blocked_id' })
    blocked: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
