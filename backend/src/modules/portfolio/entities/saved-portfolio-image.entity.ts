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

@Entity('saved_portfolio_images')
@Unique('uq_saved_portfolio_images_user_image', ['user', 'image'])
export class SavedPortfolioImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_saved_portfolio_images_user_id')
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index('idx_saved_portfolio_images_image_id')
  @ManyToOne(() => PortfolioImage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: PortfolioImage;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}