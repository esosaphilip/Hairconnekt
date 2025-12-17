import { User } from '../../modules/users/entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  countAddresses(userId: string): Promise<number>;
}
