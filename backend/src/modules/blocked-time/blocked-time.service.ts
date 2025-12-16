import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockedTime } from './entities/blocked-time.entity';
import { CreateBlockedTimeDto } from './dto/create-blocked-time.dto';
import { UpdateBlockedTimeDto } from './dto/update-blocked-time.dto';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';

@Injectable()
export class BlockedTimeService {
  private readonly logger = new Logger(BlockedTimeService.name);

  constructor(
    @InjectRepository(BlockedTime)
    private readonly blockedTimeRepository: Repository<BlockedTime>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
  ) {}

  async create(createBlockedTimeDto: CreateBlockedTimeDto): Promise<BlockedTime> {
    const { providerId, ...rest } = createBlockedTimeDto;
    this.logger.debug(`Creating blocked time for providerId: ${providerId}`);

    try {
      const provider = await this.providerProfileRepository.findOne({ where: { id: providerId } });
      if (!provider) {
        this.logger.warn(`Provider not found for ID: ${providerId}`);
        throw new NotFoundException(`Provider with ID "${providerId}" not found`);
      }

      const blockedTime = this.blockedTimeRepository.create({
        ...rest,
        provider,
      });

      return await this.blockedTimeRepository.save(blockedTime);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Database error creating blocked time for provider ${providerId}`, error);
      throw new InternalServerErrorException('Failed to save blocked time to database');
    }
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
