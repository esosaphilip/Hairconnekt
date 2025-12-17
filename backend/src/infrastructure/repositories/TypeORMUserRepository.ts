import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../modules/users/entities/user.entity';
import { Address } from '../../modules/users/entities/address.entity';

@Injectable()
export class TypeORMUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Address)
    private readonly addressesRepo: Repository<Address>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { id },
      relations: ['clientProfile'],
    });
  }

  async save(user: User): Promise<User> {
    return this.usersRepo.save(user);
  }

  async countAddresses(userId: string): Promise<number> {
    return this.addressesRepo.count({ where: { user: { id: userId } } });
  }
}
