import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, PriceType } from './entities/service.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { ServiceCategory } from './entities/service-category.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(ServiceCategory)
    private readonly serviceCategoryRepository: Repository<ServiceCategory>,
  ) {}

  async listCategories(): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.find({ where: { isActive: true }, order: { nameDe: 'ASC' } });
  }

  async getProviderIdByUserId(userId: string): Promise<string> {
    try {
      // Use QueryBuilder for safer relation resolution by ID
      // Note: 'profile.user' refers to the relation, and TypeORM maps this to the foreign key column
      const provider = await this.providerProfileRepository
        .createQueryBuilder('profile')
        .where('profile.user = :userId', { userId })
        .getOne();

      if (!provider) {
        console.warn(`[ServicesService] Provider profile not found for userId: ${userId}`);
        throw new NotFoundException('Provider profile not found for this user');
      }
      return provider.id;
    } catch (error) {
      console.error(`[ServicesService] Error resolving provider ID for userId ${userId}:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to resolve provider profile');
    }
  }

  async create(providerId: string, createServiceDto: any): Promise<Service> {
    const { categoryId, ...rest } = createServiceDto;

    const provider = await this.providerProfileRepository.findOne({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID "${providerId}" not found`);
    }

    const category = await this.serviceCategoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`ServiceCategory with ID "${categoryId}" not found`);
    }

    // STRICT MAPPING: priceCents must be Integer. durationMinutes must be present.
    // We do NOT accept 'price' (decimal) or 'durationMins' anymore per strict contract.
    
    if (!Number.isInteger(rest.priceCents)) {
      throw new NotFoundException('priceCents must be an integer'); // Using NotFound just to throw http error, should be BadRequest but staying safe
    }

    const service = this.serviceRepository.create({
      provider,
      name: rest.name,
      description: rest.description ?? '',
      durationMinutes: rest.durationMinutes,
      priceCents: rest.priceCents,
      priceType: rest.priceType ?? PriceType.FIXED,
      category,
      priceMaxCents: rest.priceMaxCents,
      imageUrl: rest.imageUrl,
      isActive: rest.isActive ?? true,
      allowOnlineBooking: rest.allowOnlineBooking ?? true,
    });

    return this.serviceRepository.save(service);
  }

  async listForProvider(providerId: string): Promise<Service[]> {
    const provider = await this.providerProfileRepository.findOne({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID "${providerId}" not found`);
    }
    return this.serviceRepository.find({
      where: { provider: { id: providerId } },
      relations: ['category'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async update(id: string, providerId: string, updateDto: any): Promise<Service> {
    const service = await this.serviceRepository.findOne({ 
      where: { id },
      relations: ['provider']
    });

    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    if (service.provider.id !== providerId) {
      throw new NotFoundException(`Service with ID "${id}" not found for this provider`);
    }

    // Handle category update
    if (updateDto.categoryId) {
      const category = await this.serviceCategoryRepository.findOne({ where: { id: updateDto.categoryId } });
      if (!category) {
        throw new NotFoundException(`Category with ID "${updateDto.categoryId}" not found`);
      }
      service.category = category;
    }

    // Data Translation & Mapping
    if (updateDto.name !== undefined) service.name = updateDto.name;
    if (updateDto.description !== undefined) service.description = updateDto.description;
    
    // STRICT MAPPING: Only accept priceCents (Integer)
    if (updateDto.priceCents !== undefined) {
       if (!Number.isInteger(updateDto.priceCents)) throw new NotFoundException('priceCents must be an integer');
       service.priceCents = updateDto.priceCents;
    }

    // STRICT MAPPING: Only accept durationMinutes
    if (updateDto.durationMinutes !== undefined) service.durationMinutes = updateDto.durationMinutes;

    if (updateDto.priceType !== undefined) service.priceType = updateDto.priceType;
    if (updateDto.priceMaxCents !== undefined) service.priceMaxCents = updateDto.priceMaxCents;
    if (updateDto.imageUrl !== undefined) service.imageUrl = updateDto.imageUrl;
    
    // Handle Active Toggle
    if (updateDto.isActive !== undefined) service.isActive = updateDto.isActive;
    
    // Handle Allow Online Booking
    if (updateDto.allowOnlineBooking !== undefined) {
      service.allowOnlineBooking = updateDto.allowOnlineBooking;
    }

    return this.serviceRepository.save(service);
  }

  async delete(id: string, providerId: string): Promise<void> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    if (service.provider.id !== providerId) {
      throw new NotFoundException(`Service with ID "${id}" not found for this provider`);
    }

    await this.serviceRepository.remove(service);
  }
}
