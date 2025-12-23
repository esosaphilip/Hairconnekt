import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
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
  ) { }

  async listCategories(): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.find({ where: { isActive: true }, order: { nameDe: 'ASC' } });
  }

  async getProviderIdByUserId(userId: string): Promise<string> {
    try {
      // Simplified lookup using standard findOne which is more robust
      const provider = await this.providerProfileRepository.findOne({
        where: { user: { id: userId } },
        select: ['id'], // We only need the ID
      });

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


  async create(providerId: string, createDto: any): Promise<Service> {
    // Validate provider exists
    const provider = await this.providerProfileRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider profile not found');
    }

    // Validate and fetch category if provided
    let category: ServiceCategory | null = null;
    if (createDto.categoryId) {
      category = await this.serviceCategoryRepository.findOne({
        where: { id: createDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`Category with ID "${createDto.categoryId}" not found`);
      }
    }

    // Validate price and duration are integers
    if (createDto.priceCents !== undefined && !Number.isInteger(createDto.priceCents)) {
      throw new BadRequestException('priceCents must be an integer');
    }

    if (createDto.durationMinutes !== undefined && !Number.isInteger(createDto.durationMinutes)) {
      throw new BadRequestException('durationMinutes must be an integer');
    }

    // Create the service entity
    const service = this.serviceRepository.create({
      name: createDto.name,
      description: createDto.description ?? null,
      priceCents: createDto.priceCents || 0,
      durationMinutes: createDto.durationMinutes || 60,
      priceType: createDto.priceType || PriceType.FIXED,
      priceMaxCents: createDto.priceMaxCents ?? null,
      imageUrl: createDto.imageUrl ?? null,
      isActive: createDto.isActive !== undefined ? createDto.isActive : true,
      allowOnlineBooking: createDto.allowOnlineBooking !== undefined ? createDto.allowOnlineBooking : true,
      displayOrder: createDto.displayOrder ?? 0,
      provider: provider,
      category: category,
    });

    try {
      const saved = await this.serviceRepository.save(service);
      console.log('[ServicesService] Service created successfully:', saved.id);
      return saved;
    } catch (error) {
      console.error('[ServicesService] Create service error:', error);
      throw new InternalServerErrorException('Failed to create service');
    }
  }

  async listForProvider(providerId: string): Promise<Service[]> {
    try {
      // Use standard repository find which handles relations cleaner than QueryBuilder in many cases
      return await this.serviceRepository.find({
        where: { provider: { id: providerId } },
        relations: ['category', 'provider'],
        order: {
          displayOrder: 'ASC',
          name: 'ASC',
        },
      });
    } catch (error) {
      console.error('[ServicesService] listForProvider Error:', error);
      throw new InternalServerErrorException('Failed to fetch services for provider');
    }
  }

  async update(id: string, providerId: string, updateDto: any): Promise<Service> {
    console.log('[Backend] UPDATE Request:', { id, providerId, updateDto: JSON.stringify(updateDto) });

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
      if (!Number.isInteger(updateDto.priceCents)) throw new BadRequestException('priceCents must be an integer');
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

    try {
      return await this.serviceRepository.save(service);
    } catch (error) {
      console.error('SQL Error Details:', error);
      throw new InternalServerErrorException('Failed to update service');
    }
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
