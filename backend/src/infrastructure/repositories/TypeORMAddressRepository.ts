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
  ) { }

  async countByUserId(userId: string): Promise<number> {
    return this.repo.count({ where: { user: { id: userId } } });
  }

  async findAllByUserId(userId: string): Promise<Address[]> {
    return this.repo.find({ where: { user: { id: userId } }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Address | null> {
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }

  async save(address: Address): Promise<Address> {
    return this.repo.save(address);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async resetDefaults(userId: string): Promise<void> {
    await this.repo.update({ user: { id: userId } }, { isDefault: false });
  }
}
