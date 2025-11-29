import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Unique } from 'typeorm';
import { User } from './user.entity';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';

@Unique('uq_favorites_client_provider', ['client', 'provider'])
@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  client: User;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  provider: ProviderProfile;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}