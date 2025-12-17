import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAddressRepository } from '../../domain/repositories/IAddressRepository';
import { Address } from '../../modules/users/entities/address.entity';

@Injectable()
export class TypeORMAddressRepository implements IAddressRepository {
  constructor(
    @InjectRepository(Address)
    private readonly repo: Repository<Address>,
  ) {}

  async countByUserId(userId: string): Promise<number> {
    return this.repo.count({ where: { user: { id: userId } } });
  }
}
