import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { User } from './entities/user.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async list(userId: string) {
    return this.addressRepo.find({ where: { user: { id: userId } }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async create(userId: string, dto: CreateAddressDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const address = this.addressRepo.create({ ...dto, user });
    const saved = await this.addressRepo.save(address);

    if (dto.isDefault) {
      await this.setDefault(userId, saved.id);
      saved.isDefault = true;
    }

    return saved;
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.addressRepo.findOne({ where: { id }, relations: ['user'] });
    if (!address) throw new NotFoundException('Address not found');
    if (address.user.id !== userId) throw new ForbiddenException('Cannot modify this address');

    Object.assign(address, dto);
    const saved = await this.addressRepo.save(address);

    if (dto.isDefault === true) {
      await this.setDefault(userId, id);
      saved.isDefault = true;
    }

    return saved;
  }

  async remove(userId: string, id: string) {
    const address = await this.addressRepo.findOne({ where: { id }, relations: ['user'] });
    if (!address) throw new NotFoundException('Address not found');
    if (address.user.id !== userId) throw new ForbiddenException('Cannot delete this address');
    await this.addressRepo.remove(address);
    return { success: true };
  }

  async setDefault(userId: string, id: string) {
    const address = await this.addressRepo.findOne({ where: { id }, relations: ['user'] });
    if (!address) throw new NotFoundException('Address not found');
    if (address.user.id !== userId) throw new ForbiddenException('Cannot set default for this address');

    // Unset default for all user's addresses and set for this one
    await this.addressRepo.createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('userId = :userId', { userId })
      .execute();

    await this.addressRepo.update(id, { isDefault: true });
    return { success: true };
  }
}