import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockedTime } from './entities/blocked-time.entity';
import { CreateBlockedTimeDto } from './dto/create-blocked-time.dto';
import { UpdateBlockedTimeDto } from './dto/update-blocked-time.dto';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';

@Injectable()
export class BlockedTimeService {
  constructor(
    @InjectRepository(BlockedTime)
    private readonly blockedTimeRepository: Repository<BlockedTime>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
  ) {}

  async create(createBlockedTimeDto: CreateBlockedTimeDto): Promise<BlockedTime> {
    const { providerId, ...rest } = createBlockedTimeDto;

    const provider = await this.providerProfileRepository.findOne({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID "${providerId}" not found`);
    }

    const blockedTime = this.blockedTimeRepository.create({
      ...rest,
      provider,
    });

    return this.blockedTimeRepository.save(blockedTime);
  }

  async update(id: string, updateBlockedTimeDto: UpdateBlockedTimeDto): Promise<BlockedTime> {
    const blockedTime = await this.blockedTimeRepository.preload({
      id,
      ...updateBlockedTimeDto,
    });
    if (!blockedTime) {
      throw new NotFoundException(`BlockedTime with ID "${id}" not found`);
    }
    return this.blockedTimeRepository.save(blockedTime);
  }
}
