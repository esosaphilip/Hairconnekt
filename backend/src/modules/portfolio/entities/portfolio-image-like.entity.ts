import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { PortfolioImage } from './portfolio-image.entity';
import { User } from '../../users/entities/user.entity';

@Entity('portfolio_image_likes')
@Unique('uq_portfolio_image_likes_image_user', ['image', 'user'])
export class PortfolioImageLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_portfolio_image_likes_image_id')
  @ManyToOne(() => PortfolioImage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: PortfolioImage;

  @Index('idx_portfolio_image_likes_user_id')
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}