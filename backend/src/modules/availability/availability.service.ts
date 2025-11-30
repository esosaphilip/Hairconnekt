import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { AvailabilitySlot } from './entities/availability-slot.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(AvailabilitySlot)
    private readonly availabilitySlotRepository: Repository<AvailabilitySlot>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
  ) {}

  async create(createAvailabilityDto: CreateAvailabilityDto): Promise<Availability> {
    const { providerId, slots, ...rest } = createAvailabilityDto;

    const provider = await this.providerProfileRepository.findOne({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID "${providerId}" not found`);
    }

    const availability = this.availabilityRepository.create({
      ...rest,
      provider,
    });

    const savedAvailability = await this.availabilityRepository.save(availability);

    const slotEntities = slots.map(slotDto => {
      const slot = new AvailabilitySlot();
      slot.availability = savedAvailability;
      slot.day = slotDto.day;
      slot.startTime = slotDto.startTime;
      slot.endTime = slotDto.endTime;
      return slot;
    });

    await this.availabilitySlotRepository.save(slotEntities);

    return this.availabilityRepository.findOneOrFail({ where: { id: savedAvailability.id }, relations: ['slots'] });
  }

  async update(id: string, updateAvailabilityDto: UpdateAvailabilityDto): Promise<Availability> {
    const { slots, ...rest } = updateAvailabilityDto;

    const availability = await this.availabilityRepository.findOne({ where: { id }, relations: ['slots'] });
    if (!availability) {
      throw new NotFoundException(`Availability with ID "${id}" not found`);
    }

    Object.assign(availability, rest);

    if (slots) {
      await this.availabilitySlotRepository.remove(availability.slots);
      const slotEntities = slots.map(slotDto => {
        const slot = new AvailabilitySlot();
        slot.availability = availability;
        slot.day = slotDto.day;
        slot.startTime = slotDto.startTime;
        slot.endTime = slotDto.endTime;
        return slot;
      });
      availability.slots = await this.availabilitySlotRepository.save(slotEntities);
    }

    return this.availabilityRepository.save(availability);
  }
}
