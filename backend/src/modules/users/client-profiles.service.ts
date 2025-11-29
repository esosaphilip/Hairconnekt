import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProfile } from './entities/client-profile.entity';
import { User } from './entities/user.entity';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Injectable()
export class ClientProfilesService {
  constructor(
    @InjectRepository(ClientProfile) private readonly clientRepo: Repository<ClientProfile>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async getMine(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId }, relations: ['clientProfile'] });
    if (!user) throw new NotFoundException('User not found');
    return user.clientProfile || null;
  }

  async upsertMine(userId: string, dto: UpdateClientProfileDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId }, relations: ['clientProfile'] });
    if (!user) throw new NotFoundException('User not found');
    let profile = user.clientProfile;
    if (!profile) {
      profile = this.clientRepo.create({ user, ...dto });
    } else {
      Object.assign(profile, dto);
    }
    const saved = await this.clientRepo.save(profile);
    return saved;
  }
}